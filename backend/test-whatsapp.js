require('dotenv').config();
const whatsAppService = require('./services/whatsAppService');

console.log('--- Testing WhatsApp Service ---');

// Mock credentials if not present for testing logic flow
if (!process.env.FACEBOOK_ACCESS_TOKEN) {
    console.log('[TEST] Mocking credentials for test...');
    process.env.FACEBOOK_ACCESS_TOKEN = 'mock_token';
    process.env.FACEBOOK_PHONE_NUMBER_ID = 'mock_id';
    // Re-initialize service to pick up mocks (simulate by creating new instance if it was a class export, but it's a singleton instance... 
    // actually imports are cached so this might not work directly if the service reads env in constructor.
    // Let's check service code: "constructor() { this.accessToken... }" 
    // So we need to re-instantiate or manually set props if reachable.
    whatsAppService.accessToken = 'mock_token';
    whatsAppService.phoneNumberId = 'mock_id';
}

async function testSend() {
    console.log('Attempting to send test alert...');
    try {
        // This will likely fail with 401/400 against real FB API with mock creds, 
        // but we want to see it try and handle the error correctly.
        // User reported issues with text messages (likely due to 24h window policy).
        // Switching to template message for the test.
        console.log('Sending Template: jaspers_market_plain_text_v1');
        const result = await whatsAppService.sendTemplate('+919821159469', 'jaspers_market_plain_text_v1');
        console.log('Result:', result ? 'Success' : 'Failed (Expected with invalid creds)');
    } catch (e) {
        console.error('Unexpected error in test script:', e);
    }
}

testSend();
