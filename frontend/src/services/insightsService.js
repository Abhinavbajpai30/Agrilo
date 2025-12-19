import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Fetch combined risk analysis (Drought, Vegetation, Flood)
 * @param {number} lat 
 * @param {number} lon 
 * @returns {Promise<Object>} Combined insights object
 */
export const getCombinedInsights = async (lat, lon) => {
    try {
        const token = localStorage.getItem('agrilo_token');

        // Add timestamp to prevent caching
        const response = await axios.get(`${API_URL}/insights/combined`, {
            params: { lat, lon, t: Date.now() },
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log('DEBUG: Received insights data:', JSON.stringify(response.data));

        if (response.data && response.data.status === 'success') {
            // Handle case where backend swaps data and message fields
            const insightsData = (typeof response.data.data === 'string' && typeof response.data.message === 'object')
                ? response.data.message
                : response.data.data;
            return insightsData;
        }
        throw new Error(response.data.message || 'Failed to fetch insights');
    } catch (error) {
        console.error('Insights Service Error:', error);
        // Return nulls instead of throwing to prevent dashboard crash, let UI handle empty states
        return {
            drought: null,
            vegetation: null,
            flood: null,
            error: error.message
        };
    }
};

export const insightsService = {
    getCombinedInsights
};
