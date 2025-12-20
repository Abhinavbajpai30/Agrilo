const { VertexAI } = require('@google-cloud/vertexai');
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');
const logger = require('../utils/logger');
const User = require('../models/User');
const Farm = require('../models/Farm');

// Initialize Vertex AI
const project = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || 'agrilo-481720';
const location = 'us-central1';
const vertexAI = new VertexAI({ project: project, location: location });

// Initialize TTS Client
const ttsClient = new TextToSpeechClient();

/**
 * Detect language from text using basic heuristics
 */
const detectLanguage = (text) => {
    if (!text) return 'en-US';
    const devanagariPattern = /[\u0900-\u097F]/;
    if (devanagariPattern.test(text)) return 'hi-IN';
    const spanishPattern = /[¿ñáéíóúü]|(\b(el|la|los|las|en|y|qué|por)\b)/i;
    if (spanishPattern.test(text)) return 'es-ES';
    return 'en-US';
};

/**
 * Process voice query
 */
exports.processVoiceQuery = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: 'error', message: 'No audio file provided' });
        }

        logger.info(`Processing voice query. Size: ${req.file.size} bytes`);
        logger.info(`Project: ${project}, Location: ${location}`);

        // VERIFY REQ.USER
        if (!req.user) {
            logger.warn('No user found in request (auth middleware might be missing or failed). Proceeding without context.');
        }

        if (req.file) {
            logger.info(`Received audio mimetype: ${req.file.mimetype}`);
            if (req.file.buffer && req.file.buffer.length > 4) {
                logger.info(`Header check (hex): ${req.file.buffer.subarray(0, 10).toString('hex')}`);
            }
        }

        // 1. Fetch Context (User & Farm Data)
        let userContext = "User: Unknown";
        let farmContext = "Farm: No data available";

        // Default values for sensitive context variables to avoid ReferenceError
        let experience = 'Unknown experience';
        let water = 'None';
        let risks = 'None known';

        if (req.user) {
            // --- User Context ---
            const user = req.user;
            experience = user.farmingProfile?.experienceLevel || 'Unknown experience';
            const farmingType = user.farmingProfile?.farmingType || 'Unknown type';
            const preferredLang = user.preferences?.language || 'en';

            userContext = `
            Farmer Name: ${user.personalInfo?.firstName || 'Farmer'}
            Experience Level: ${experience}
            Farming Type: ${farmingType}
            Location: ${user.location?.village || ''}, ${user.location?.district || ''}, ${user.location?.region || ''}
            Preferred Language Code: ${preferredLang}
            `;

            const userId = req.user._id;

            try {
                // Fetch the active farm with fully populated fields
                // We don't need to populate everything, but getting the raw data is enough for the text summary
                const farm = await Farm.findOne({ owner: userId, 'status.isActive': true });

                if (farm) {
                    // --- Farm Context ---

                    // Crops
                    const crops = farm.currentCrops && farm.currentCrops.length > 0
                        ? farm.currentCrops.map(c =>
                            `${c.cropName} (${c.growthStage || 'unknown stage'}, Health: ${c.healthStatus?.overall || 'unknown'})`
                        ).join(', ')
                        : 'No active crops';

                    // Soil
                    const soil = farm.soilData
                        ? `Type: ${farm.soilData.composition?.soilType || 'Mixed'}. ` +
                        `pH: ${farm.soilData.chemistry?.pH?.value || 'N/A'}. ` +
                        `Nutrients: N=${farm.soilData.nutrients?.nitrogen?.status || '?'}, P=${farm.soilData.nutrients?.phosphorus?.status || '?'}, K=${farm.soilData.nutrients?.potassium?.status || '?'}`
                        : 'Soil data unknown';

                    // Infrastructure/Water
                    water = farm.infrastructure?.waterSources
                        ? farm.infrastructure.waterSources.map(w => w.type).join(', ')
                        : 'None';

                    const equipment = farm.infrastructure?.equipment
                        ? farm.infrastructure.equipment.map(e => e.type).join(', ')
                        : 'None';

                    // Risks
                    risks = farm.environmental?.riskFactors
                        ? farm.environmental.riskFactors.map(r => `${r.type} (${r.probability})`).join(', ')
                        : 'None known';

                    farmContext = `
                    Farm Name: ${farm.farmInfo?.name || 'Unnamed Farm'}
                    Farm Type: ${farm.farmInfo?.farmType || 'General'}
                    Size: ${farm.farmInfo?.totalArea?.value || '?'}${farm.farmInfo?.totalArea?.unit || ''}
                    Current Crops: ${crops}
                    Soil Conditions: ${soil}
                    Water Sources: ${water}
                    Equipment Available: ${equipment}
                    Environmental Risks: ${risks}
                    `;
                }
            } catch (dbError) {
                logger.error(`Error fetching farm context: ${dbError.message}`);
                // Continue without farm context rather than failing the whole request
            }
        }

        // --- Platform Capabilities Context ---
        const platformContext = `
        AVAILABLE PLATFORM FEATURES:
                    1. "Crop Doctor" (Diagnosis): Detects plant diseases from photos. Use this if the user asks about sick plants, pests, or weird spots on leaves.
                    2. "Farm Map": Shows the farm's boundaries and fields. Use if user asks about land area or field locations. It also shows nearby alerts like pest outbreaks or weather warnings.
                    3. "Smart Irrigation": Provides watering schedules. Use if user asks when/how much to water.
                    4. "Crop Planning": Helps plan what to plant next based on season/soil.
                    5. "Weather": Real-time forecasts and alerts.
                    `;

        // Combined Context for Gemini
        const fullContext = `
                    USER CONTEXT:
                    ${userContext}
                    
                    FARM CONTEXT:
                    ${farmContext}

                    ${platformContext}
                    `;

        logger.info(`Context prepared for Gemini.`);

        // --- Step A: Gemini Analysis ---
        let textResponse;
        const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash-exp', 'gemini-1.5-flash'];
        // Adjusted strategy: Try 3.0 -> 2.5 (as asked) -> 1.5 (safety net). 

        let lastError;

        for (const modelName of modelsToTry) {
            try {
                logger.info(`Attempting AI analysis with model: ${modelName}`);
                const generativeModel = vertexAI.getGenerativeModel({
                    model: modelName,
                    systemInstruction: {
                        parts: [{
                            text: `You are AgriloBot, an expert agricultural assistant for ${req.user?.personalInfo?.firstName || 'the farmer'}. 
                    
                    ${fullContext}

                    INSTRUCTIONS:
                    1. Listen to the farmer's query in the audio.
                    2. Detect the language automatically.
                    3. Answer their question briefly and helpfully in the same language they spoke.
                    4. CRITICAL: USE THE CONTEXT provided above to give specific, personalized advice.
                       - If they ask about irrigation, refer to their specific water sources ("${water}") AND recommend the "Smart Irrigation" feature.
                       - If they ask about crop health/diseases, mention their crops AND recommend taking a photo with the "Crop Doctor" feature.
                       - If the query matches a platform feature (Diagnosis, Planning, Map, etc.), EXPLICITLY recommend using that feature.
                       - Tailor the complexity of your answer to their Experience Level (${experience}).
                    5. Keep the answer concise (under 3 sentences) for voice output.
                    6. Output ONLY plain text.` }]
                    }
                });

                const audioPart = {
                    inlineData: {
                        data: req.file.buffer.toString('base64'),
                        mimeType: req.file.mimetype || 'audio/webm',
                    },
                };

                const request = {
                    contents: [{ role: 'user', parts: [audioPart] }],
                };

                const result = await generativeModel.generateContent(request);
                const response = await result.response;
                if (!response.candidates || !response.candidates[0]) {
                    throw new Error('No candidates in response');
                }
                textResponse = response.candidates[0].content.parts[0].text;
                logger.info(`Gemini success (${modelName}). Response: ${textResponse.substring(0, 50)}...`);
                break; // Success, exit loop
            } catch (e) {
                logger.warn(`Failed with ${modelName}: ${e.message}`);
                lastError = e;
            }
        }

        if (!textResponse) {
            logger.error('All Gemini models failed.');
            throw lastError || new Error('All models failed');
        }

        // --- Step B: Voice Synthesis ---
        let audioBase64;
        let languageCode;
        try {
            languageCode = detectLanguage(textResponse);
            logger.info(`Detected language for TTS: ${languageCode}`);

            let voiceName = undefined;
            if (languageCode === 'en-US') voiceName = 'en-US-Journey-F';

            const ttsRequest = {
                input: { text: textResponse },
                voice: { languageCode: languageCode, name: voiceName, ssmlGender: 'FEMALE' },
                audioConfig: { audioEncoding: 'MP3' },
            };

            const [ttsResponse] = await ttsClient.synthesizeSpeech(ttsRequest);
            audioBase64 = ttsResponse.audioContent.toString('base64');
        } catch (ttsError) {
            logger.error('TTS Synthesis Failed:', ttsError);
            // Fallback: return text without audio
            return res.status(200).json({
                status: 'partial_success',
                data: {
                    textResponse,
                    audioBase64: null,
                    languageDetected: languageCode,
                    message: "Voice synthesis failed, but here is the text."
                }
            });
        }

        return res.status(200).json({
            status: 'success',
            data: {
                textResponse,
                audioBase64,
                languageDetected: languageCode
            }
        });

    } catch (error) {
        logger.error('Unexpected error in voice controller:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to process voice query',
            error: error.message
        });
    }
};
