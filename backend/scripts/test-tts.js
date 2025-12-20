const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');
require('dotenv').config();

const client = new TextToSpeechClient();

async function testTTS() {
    console.log('Testing TTS with "en-US-Journey-F"...');
    try {
        const request = {
            input: { text: "Hello, this is a test." },
            // Testing the voice causing issues
            voice: { languageCode: 'en-US', name: 'en-US-Journey-F', ssmlGender: 'FEMALE' },
            audioConfig: { audioEncoding: 'MP3' },
        };

        const [response] = await client.synthesizeSpeech(request);
        console.log('Success! Audio content received.');
    } catch (error) {
        console.error('Failed with Journey voice:', error.message);

        console.log('\nRetrying with standard "en-US-Neural2-F"...');
        try {
            const request2 = {
                input: { text: "Hello, this is a fallback test." },
                voice: { languageCode: 'en-US', name: 'en-US-Neural2-F', ssmlGender: 'FEMALE' },
                audioConfig: { audioEncoding: 'MP3' },
            };
            const [response2] = await client.synthesizeSpeech(request2);
            console.log('Success with Neural2 voice! Audio content received.');
        } catch (error2) {
            console.error('Failed with Neural2 voice:', error2.message);
        }
    }
}

testTTS();
