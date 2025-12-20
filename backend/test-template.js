require('dotenv').config();
const whatsAppService = require('./services/whatsAppService');

console.log('--- Testing WhatsApp Template: farm_alert_nearby ---');

async function testTemplate() {
    const to = '919821159469'; // Using the format user requested
    const templateName = 'farm_alert_nearby';

    // Construct components for the 3 variables: Type, Severity, Description
    const components = [
        {
            type: 'body',
            parameters: [
                { type: 'text', text: 'TEST_PEST' },       // {{1}} Type
                { type: 'text', text: 'High' },            // {{2}} Severity
                { type: 'text', text: 'Testing template delivery again.' } // {{3}} Description
            ]
        }
    ];

    console.log(`Sending template '${templateName}' to ${to}...`);
    try {
        const result = await whatsAppService.sendTemplate(to, templateName, components);
        console.log('Result:', result ? 'Success' : 'Failed');
    } catch (e) {
        console.error('Test Error:', e);
    }
}

testTemplate();
