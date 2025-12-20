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

        if (req.user) {
            userContext = `Farmer Name: ${req.user.personalInfo?.firstName}`;
            const userId = req.user._id;

            try {
                // Fetch the active farm (or the first one if multiple/none specified)
                const farm = await Farm.findOne({ owner: userId, 'status.isActive': true });

                if (farm) {
                    const crops = farm.currentCrops && farm.currentCrops.length > 0
                        ? farm.currentCrops.map(c => `${c.cropName} (${c.growthStage || 'unknown stage'})`).join(', ')
                        : 'None';

                    const soil = farm.soilData
                        ? `Soil: ${farm.soilData.composition?.soilType || 'Mixed'}, pH ${farm.soilData.chemistry?.pH?.value || 'N/A'}`
                        : 'Soil data unknown';

                    const locationStr = farm.location
                        ? `${farm.location.address || ''}, ${farm.location.region || ''}`
                        : 'Unknown location';

                    const water = farm.infrastructure?.waterSources
                        ? farm.infrastructure.waterSources.map(w => w.type).join(', ')
                        : 'None';

                    farmContext = `
                Farm Name: ${farm.farmInfo?.name || 'Unnamed Farm'}
                Location: ${locationStr}
                Current Crops: ${crops}
                Soil Info: ${soil}
                Water Sources: ${water}
                `;
                }
            } catch (dbError) {
                logger.error(`Error fetching farm context: ${dbError.message}`);
                // Continue without farm context rather than failing the whole request
            }
        }

        logger.info(`Context prepared for Gemini.`);

        // --- Step A: Gemini Analysis ---
        let textResponse;
        const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash-exp', 'gemini-1.5-flash'];
        // Adjusted strategy: Try 3.0 -> 2.5 (as asked) -> 1.5 (safety net).
        // Note: 'gemini-2.5-flash' might not exist, but valid to try if user insists. 

        let lastError;

        for (const modelName of modelsToTry) {
            try {
                logger.info(`Attempting AI analysis with model: ${modelName}`);
                const generativeModel = vertexAI.getGenerativeModel({
                    model: modelName,
                    systemInstruction: {
                        parts: [{
                            text: `You are AgriBot, an expert agricultural assistant for ${req.user?.personalInfo?.firstName || 'the farmer'}. 
                    
                    CONTEXT:
                    ${userContext}
                    ${farmContext}

                    INSTRUCTIONS:
                    1. Listen to the farmer's query in the audio.
                    2. Detect the language automatically.
                    3. Answer their question briefly and helpfully in the same language they spoke.
                    4. USE THE CONTEXT provided above to give specific advice (e.g., if they ask about irrigation, refer to their water sources or crops).
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
