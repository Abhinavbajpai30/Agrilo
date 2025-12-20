const axios = require('axios');
const logger = require('../utils/logger');

class WhatsAppService {
    constructor() {
        this.accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
        this.phoneNumberId = process.env.FACEBOOK_PHONE_NUMBER_ID;
        this.apiVersion = process.env.WHATSAPP_API_VERSION || 'v19.0';
        this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
    }

    /**
     * Send a text message to a WhatsApp user
     * @param {string} to - Recipient phone number (with country code, no + or spaces)
     * @param {string} body - Message content
     */
    async sendAlert(to, body) {
        if (!this.accessToken || !this.phoneNumberId) {
            logger.warn('WhatsApp credentials not found. Skipping alert.');
            return false;
        }

        // Clean phone number: remove +, spaces, dashes
        const formattedTo = to.replace(/\D/g, '');

        try {
            const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
            const data = {
                messaging_product: 'whatsapp',
                to: formattedTo,
                type: 'text',
                text: { body: body }
            };

            const response = await axios.post(url, data, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            logger.info(`[WHATSAPP] Alert sent successfully to ${formattedTo}. Message ID: ${response.data.messages[0].id}`);
            return true;

        } catch (error) {
            const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
            logger.error(`[WHATSAPP] Failed to send alert to ${formattedTo}: ${errorMsg}`);
            return false;
        }
    }

    /**
     * Send a template message to a WhatsApp user
     * @param {string} to - Recipient phone number
     * @param {string} templateName - Name of the template
     * @param {Array} components - Array of template components (variables)
     * @param {string} languageCode - Language code (default 'en_US')
     */
    async sendTemplate(to, templateName, components = [], languageCode = 'en_US') {
        if (!this.accessToken || !this.phoneNumberId) {
            logger.warn('WhatsApp credentials not found. Skipping alert.');
            return false;
        }

        const formattedTo = to.replace(/\D/g, '');

        try {
            const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
            const data = {
                messaging_product: 'whatsapp',
                to: formattedTo,
                type: 'template',
                template: {
                    name: templateName,
                    language: {
                        code: languageCode
                    },
                    components: components
                }
            };

            const response = await axios.post(url, data, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            logger.info(`[WHATSAPP] Template sent successfully to ${formattedTo}. Message ID: ${response.data.messages[0].id}`);
            return true;

        } catch (error) {
            const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
            logger.error(`[WHATSAPP] Failed to send template to ${formattedTo}: ${errorMsg}`);
            return false;
        }
    }
}

module.exports = new WhatsAppService();
