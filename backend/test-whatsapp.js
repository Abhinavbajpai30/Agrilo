require('dotenv').config();
const whatsAppService = require('./services/whatsAppService');

console.log('--- Testing WhatsApp Free Form Text ---');

async function testText() {
    // User requested number without '+'
    const to = '916265807090';
    console.log(`Sending text message to ${to}...`);

    const message = `⚠️ *Farm Alert Nearby* ⚠️\n\nA new issue of type *PEST* has been reported nearby.\n\n📝 *Description:* This is a test alert for free-form text integration.\nseverity: High\n\nPlease check your farm and take necessary precautions.`;

    try {
        const result = await whatsAppService.sendAlert(to, message);
        console.log('Result:', result ? 'Success' : 'Failed');
    } catch (e) {
        console.error('Test Error:', e);
    }
}

testText();
