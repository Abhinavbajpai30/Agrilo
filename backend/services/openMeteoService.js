/**
 * Open-Meteo API Service for Agrilo
 * Replacement for OpenEPI, providing global weather data for agriculture
 * Free for non-commercial use, no API key required
 */

const axios = require('axios');
const logger = require('../utils/logger');
const { ApiError } = require('../middleware/errorHandler');

class OpenMeteoService {
    constructor() {
        this.baseURL = 'https://api.open-meteo.com/v1';
        this.requestTimeout = 10000; // 10 seconds

        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: this.requestTimeout,
            headers: {
                'User-Agent': 'Agrilo/1.0 (contact@agrilo.com)'
            }
        });

        // In-memory simple cache
        this.cache = new Map();
        this.cacheTTL = 1800 * 1000; // 30 minutes in milliseconds
    }

    /**
     * Get current weather and forecast
     */
    async getWeatherData(lat, lon) {
        const cacheKey = `forecast:${lat}:${lon}`;
        if (this.cache.has(cacheKey)) {
            const { data, timestamp } = this.cache.get(cacheKey);
            if (Date.now() - timestamp < this.cacheTTL) {
                logger.info('Using cached Open-Meteo data', { lat, lon });
                return data;
            }
        }

        try {
            logger.info('Fetching weather data from Open-Meteo', { lat, lon });
            const response = await this.client.get('/forecast', {
                params: {
                    latitude: lat,
                    longitude: lon,
                    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m',
                    hourly: 'temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m',
                    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max',
                    timezone: 'auto',
                    forecast_days: 7
                }
            });

            this.cache.set(cacheKey, {
                data: response.data,
                timestamp: Date.now()
            });

            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get historical weather data
     */
    async getHistoricalWeather(lat, lon, startDate, endDate) {
        try {
            logger.info('Fetching historical weather data from Open-Meteo', { lat, lon, startDate, endDate });
            const response = await axios.get('https://archive-api.open-meteo.com/v1/archive', {
                params: {
                    latitude: lat,
                    longitude: lon,
                    start_date: startDate,
                    end_date: endDate,
                    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum',
                    timezone: 'auto'
                }
            });

            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Interpret WMO Weather Codes
     * Source: https://open-meteo.com/en/docs
     */
    getWeatherDescription(code) {
        const codes = {
            0: { description: 'Clear sky', icon: 'sunny' },
            1: { description: 'Mainly clear', icon: 'partly-cloudy-day' },
            2: { description: 'Partly cloudy', icon: 'partly-cloudy-day' },
            3: { description: 'Overcast', icon: 'cloudy' },
            45: { description: 'Fog', icon: 'fog' },
            48: { description: 'Depositing rime fog', icon: 'fog' },
            51: { description: 'Light drizzle', icon: 'rain' },
            53: { description: 'Moderate drizzle', icon: 'rain' },
            55: { description: 'Dense drizzle', icon: 'rain' },
            61: { description: 'Slight rain', icon: 'rain' },
            63: { description: 'Moderate rain', icon: 'rain' },
            65: { description: 'Heavy rain', icon: 'rain' },
            71: { description: 'Slight snow fall', icon: 'snow' },
            73: { description: 'Moderate snow fall', icon: 'snow' },
            75: { description: 'Heavy snow fall', icon: 'snow' },
            77: { description: 'Snow grains', icon: 'snow' },
            80: { description: 'Slight rain showers', icon: 'rain' },
            81: { description: 'Moderate rain showers', icon: 'rain' },
            82: { description: 'Violent rain showers', icon: 'rain' },
            85: { description: 'Slight snow showers', icon: 'snow' },
            86: { description: 'Heavy snow showers', icon: 'snow' },
            95: { description: 'Thunderstorm', icon: 'thunderstorm' },
            96: { description: 'Thunderstorm with slight hail', icon: 'thunderstorm' },
            99: { description: 'Thunderstorm with heavy hail', icon: 'thunderstorm' }
        };

        return codes[code] || { description: 'Unknown', icon: 'unknown' };
    }

    handleError(error) {
        if (error.response) {
            logger.error('Open-Meteo API Error', {
                status: error.response.status,
                data: error.response.data
            });
            throw new ApiError(`Open-Meteo API Unavailable: ${error.response.data.reason || error.message}`, error.response.status);
        } else if (error.request) {
            logger.error('Open-Meteo Network Error', { message: error.message });
            throw new ApiError('Weather service unreachable', 503);
        } else {
            logger.error('Open-Meteo Service Error', { message: error.message });
            throw new ApiError('Internal weather service error', 500);
        }
    }

    /**
     * Search for locations (Geocoding)
     * Uses Open-Meteo Geocoding API
     */
    async searchLocations(query, count = 5) {
        try {
            logger.info('Searching locations via Open-Meteo', { query });
            // Open-Meteo Geocoding API has a different base URL
            const response = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
                params: {
                    name: query,
                    count: count,
                    language: 'en',
                    format: 'json'
                },
                timeout: this.requestTimeout,
                headers: {
                    'User-Agent': 'Agrilo/1.0 (contact@agrilo.com)'
                }
            });

            return response.data;
        } catch (error) {
            if (error.response) {
                logger.error('Open-Meteo Geocoding API Error', {
                    status: error.response.status,
                    data: error.response.data
                });
            }
            this.handleError(error);
        }
    }
}

module.exports = new OpenMeteoService();
