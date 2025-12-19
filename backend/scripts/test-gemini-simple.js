require('dotenv').config();
const geminiService = require('../services/geminiService');
const path = require('path');

async function testGemini() {
    try {
        const testFile = path.join(__dirname, '../test_image.jpeg');
        console.log('Testing Gemini Service with file:', testFile);

        // Ensure test image exists or use a placeholder if you have one
        // For this run, we assume test_image.jpg exists as seen in file list

        const result = await geminiService.analyzePlantHealth(testFile, 'image/jpeg');
        console.log('Gemini Analysis Result:');
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Test Failed:', error);
    }
}

testGemini();
