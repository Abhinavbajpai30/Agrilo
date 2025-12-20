require('dotenv').config();
const whatsAppService = require('./services/whatsAppService');

console.log('--- Testing WhatsApp Sample Template: hello_world ---');

async function testSample() {
    const to = '916265807090';
    console.log(`Sending hello_world to ${to}...`);

    try {
        // hello_world is a standard testing template with no components/variables
        const result = await whatsAppService.sendTemplate(to, 'hello_world', [], 'en_US');
        console.log('Result:', result ? 'Success' : 'Failed');
    } catch (e) {
        console.error('Test Error:', e);
    }
}

testSample();
