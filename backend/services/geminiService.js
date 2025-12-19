/**
 * Gemini Service for Agrilo
 * Handles interaction with Google's Vertex AI (Gemini 3.0 Flash)
 */

const { VertexAI } = require('@google-cloud/vertexai');
const logger = require('../utils/logger');
const fs = require('fs').promises;

class GeminiService {
    constructor() {
        this.project = process.env.GCP_PROJECT_ID || process.env.GOOGLE_PROJECT_ID;
        this.location = 'us-central1';
        this.modelName = 'gemini-2.5-flash'; // User verified working model
        // Note: Assuming 'gemini-1.5-flash-001' effectively for now as 3.0 might be preview/restricted, 
        // but the prompt logic is the same. User asked for 3.0 Flash, if available we'd use 'gemini-3.0-flash-001'
        // Let's use a config variable or default to a known working flash model.

        // logic to initialize vertex ai
        if (this.project) {
            this.vertexAI = new VertexAI({ project: this.project, location: this.location });
            this.generativeModel = this.vertexAI.getGenerativeModel({ model: this.modelName });
        } else {
            logger.warn('GCP_PROJECT_ID not set. GeminiService disabled.');
        }
    }

    /**
     * Analyze plant health from image or video
     * @param {string} filePath - Path to the image or video file
     * @param {string} mimeType - Mime type of the file (image/jpeg, video/mp4, etc.)
     * @returns {Object} Structured diagnosis
     */
    async analyzePlantHealth(filePath, mimeType) {
        if (!this.vertexAI) {
            throw new Error('GeminiService not initialized (missing GCP_PROJECT_ID)');
        }

        try {
            const fileBuffer = await fs.readFile(filePath);
            const filePart = {
                inlineData: {
                    data: fileBuffer.toString('base64'),
                    mimeType: mimeType,
                },
            };

            const prompt = `
        You are an expert plant pathologist and agronomist named "Super Crop Doctor".
        Analyze the provided plant video/image. 
        Identify if there are any diseases, pests, deficiencies, or environmental stresses.
        
        Return a strict JSON object with the following structure:
        {
          "primaryDiagnosis": {
            "condition": "Name of the disease/pest/issue or 'Healthy'",
            "confidence": 0-100,
            "severity": "low" | "medium" | "high" | "critical",
            "description": "Brief explanation of the diagnosis"
          },
          "plantInfo": {
            "cropType": "Identified crop type",
            "plantHealth": "excellent" | "good" | "fair" | "poor"
          },
          "symptoms": ["List", "of", "visible", "symptoms"],
          "recommendations": {
            "immediate": [
              { "title": "...", "description": "...", "urgency": "high"|"medium"|"low" }
            ],
            "preventive": [ ... ],
            "longTerm": [ ... ]
          },
          "economicImpact": {
              "description": "Potential impact on yield if untreated",
              "estimatedLossPercentage": 0-100
          }
        }
        Do not include markdown formatting like \`\`\`json. Return only the raw JSON.
      `;

            const request = {
                contents: [{ role: 'user', parts: [filePart, { text: prompt }] }],
            };

            const result = await this.generativeModel.generateContent(request);
            const responseResponse = await result.response;
            const text = responseResponse.candidates[0].content.parts[0].text;

            // Clean up potential markdown code blocks
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

            return JSON.parse(cleanText);

        } catch (error) {
            logger.error('Gemini Analysis Failed', { error: error.message });
            throw error;
        }
    }
}

module.exports = new GeminiService();
