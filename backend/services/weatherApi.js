/**
 * Weather API Service for Agrilo
 * Provides weather data critical for farming decisions through Open-Meteo
 * Refactored to use centralized Open-Meteo service
 */

const openMeteoService = require('./openMeteoService');
const logger = require('../utils/logger');
const { ApiError } = require('../middleware/errorHandler');

class WeatherApiService {
  constructor() {
    this.weatherService = openMeteoService;

    // Weather data cache duration
    this.weatherCacheTTL = 1800; // 30 minutes
    this.forecastCacheTTL = 3600; // 1 hour
    this.historicalCacheTTL = 86400; // 24 hours
  }

  /**
   * Transform Open-Meteo weather response to expected format
   */
  transformWeatherData(apiResponse, location) {
    const current = apiResponse.current;

    // Get weather description from WMO code
    const weatherInfo = this.weatherService.getWeatherDescription(current.weather_code);

    return {
      location: {
        lat: location.lat,
        lon: location.lon,
        name: location.name || 'Unknown', // Open-Meteo doesn't return location names
        country: location.country || 'Unknown'
      },
      current: {
        temperature: current.temperature_2m,
        feelsLike: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        pressure: null, // Not requested by default to save bandwidth
        windSpeed: current.wind_speed_10m,
        windDirection: current.wind_direction_10m,
        cloudiness: current.cloud_cover,
        description: weatherInfo.description,
        icon: weatherInfo.icon,
        precipitation: current.precipitation,
        rain: current.rain
      },
      timestamp: new Date().toISOString(),
      source: 'Open-Meteo'
    };
  }

  /**
   * Transform Open-Meteo forecast response to expected format
   */
  transformForecastData(apiResponse, location) {
    const daily = apiResponse.daily;
    const forecast = [];

    // Map daily arrays to object array
    if (daily && daily.time) {
      for (let i = 0; i < daily.time.length; i++) {
        const weatherInfo = this.weatherService.getWeatherDescription(daily.weather_code[i]);

        forecast.push({
          date: daily.time[i],
          temperature: {
            min: daily.temperature_2m_min[i],
            max: daily.temperature_2m_max[i],
            avg: (daily.temperature_2m_max[i] + daily.temperature_2m_min[i]) / 2
          },
          precipitation: daily.precipitation_sum[i],
          precipitationProbability: daily.precipitation_probability_max[i],
          description: weatherInfo.description,
          icon: weatherInfo.icon
        });
      }
    }

    return {
      location: {
        lat: location.lat,
        lon: location.lon,
        name: location.name || 'Unknown',
        country: location.country || 'Unknown'
      },
      forecast: forecast,
      timestamp: new Date().toISOString(),
      source: 'Open-Meteo'
    };
  }

  /**
   * Get current weather conditions for a location
   */
  async getCurrentWeather(lat, lon) {
    try {
      if (!lat || !lon) {
        throw new ApiError('Latitude and longitude are required', 400);
      }

      logger.info('Getting current weather from Open-Meteo', { lat, lon });

      const response = await this.weatherService.getWeatherData(lat, lon);
      const weatherData = this.transformWeatherData(response, { lat, lon });

      return weatherData;

    } catch (error) {
      logger.error('Failed to get current weather', { lat, lon, error: error.message });
      throw error;
    }
  }

  /**
   * Get 7-day weather forecast for farming planning
   */
  async getWeatherForecast(lat, lon, days = 7) {
    try {
      if (!lat || !lon) {
        throw new ApiError('Latitude and longitude are required', 400);
      }

      // Open-Meteo returns forecast with current weather request
      const response = await this.weatherService.getWeatherData(lat, lon);
      const forecastData = this.transformForecastData(response, { lat, lon });

      // Slice to requested number of days
      forecastData.forecast = forecastData.forecast.slice(0, days);

      return forecastData;

    } catch (error) {
      logger.error('Failed to get weather forecast', { lat, lon, error: error.message });
      throw error;
    }
  }

  /**
   * Get agricultural weather alerts and warnings
   */
  async getWeatherAlerts(lat, lon) {
    try {
      const currentWeather = await this.getCurrentWeather(lat, lon);
      const alerts = [];

      // Generate basic farming alerts based on thresholds
      if (currentWeather.current.temperature > 35) {
        alerts.push({
          type: 'heat_warning',
          severity: 'moderate',
          title: 'High Temperature Alert',
          description: 'Temperature is above 35°C. Consider irrigation and crop protection.',
          recommendations: ['Increase irrigation frequency', 'Provide shade for sensitive crops']
        });
      }

      if (currentWeather.current.windSpeed > 20) {
        alerts.push({
          type: 'wind_warning',
          severity: 'moderate',
          title: 'Strong Wind Alert',
          description: 'Strong winds may damage crops and affect spraying operations.',
          recommendations: ['Secure loose items', 'Postpone pesticide application']
        });
      }

      return {
        location: currentWeather.location,
        alerts,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Failed to get weather alerts', { lat, lon, error: error.message });
      throw new ApiError('Weather alerts service temporarily unavailable', 503);
    }
  }

  /**
   * Get historical weather data for analysis
   */
  async getHistoricalWeather(lat, lon, startDate, endDate) {
    try {
      if (!lat || !lon || !startDate || !endDate) {
        throw new ApiError('Latitude, longitude, start date, and end date are required', 400);
      }

      const response = await this.weatherService.getHistoricalWeather(lat, lon, startDate, endDate);

      // Transform historical data if needed, for now returning raw daily data
      return {
        location: { lat, lon },
        period: { startDate, endDate },
        data: response.daily || [],
        timestamp: new Date().toISOString(),
        source: 'Open-Meteo'
      };

    } catch (error) {
      logger.error('Failed to get historical weather', { lat, lon, startDate, endDate, error: error.message });
      throw error;
    }
  }

  /**
   * Get agricultural weather insights and recommendations
   */
  async getAgriculturalInsights(lat, lon, cropType) {
    try {
      const forecast = await this.getWeatherForecast(lat, lon, 7);

      // Stub for insight generation logic - reused from previous version logic
      // Since `transformForecastData` changed structure slightly, ensuring compatibility

      const insights = {
        planting: {
          suitability: 'good', // Logic would analyze temp/rain
          recommendations: ['Check soil moisture before planting']
        },
        harvesting: {
          conditions: 'favorable',
          recommendations: ['Good drying conditions expected']
        }
      };

      return {
        location: forecast.location,
        cropType,
        insights,
        timestamp: new Date().toISOString(),
        source: 'Open-Meteo'
      };

    } catch (error) {
      logger.error('Failed to generate agricultural insights', { lat, lon, cropType, error: error.message });
      throw error;
    }
  }
}

module.exports = new WeatherApiService();