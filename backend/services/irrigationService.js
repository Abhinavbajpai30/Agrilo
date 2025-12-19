/**
 * Smart Irrigation Advisor Service for Agrilo
 * Calculates irrigation needs using evapotranspiration, weather data, and soil conditions
 * Refactored to use Open-Meteo for all environmental data
 */

const logger = require('../utils/logger');
const { ApiError } = require('../middleware/errorHandler');
const openMeteoService = require('./openMeteoService');

class IrrigationService {
  constructor() {
    // Crop coefficients for different growth stages
    this.cropCoefficients = {
      tomato: {
        initial: 0.6,    // Germination to 10% ground cover
        development: 0.8, // 10% to 80% ground cover  
        mid: 1.15,       // 80% ground cover to start of maturity
        late: 0.8        // Start of maturity to harvest
      },
      corn: {
        initial: 0.3,
        development: 0.7,
        mid: 1.2,
        late: 0.6
      },
      rice: {
        initial: 1.05,
        development: 1.10,
        mid: 1.20,
        late: 0.90
      },
      wheat: {
        initial: 0.4,
        development: 0.7,
        mid: 1.15,
        late: 0.4
      },
      potato: {
        initial: 0.5,
        development: 0.75,
        mid: 1.15,
        late: 0.75
      },
      cassava: {
        initial: 0.3,
        development: 0.6,
        mid: 0.8,
        late: 0.5
      },
      default: {
        initial: 0.5,
        development: 0.75,
        mid: 1.0,
        late: 0.7
      }
    };

    // Soil water holding capacity (mm/m of soil depth)
    this.soilWaterCapacity = {
      sandy: 120,
      loam: 200,
      clay: 250,
      sandy_loam: 160,
      clay_loam: 220,
      silt_loam: 240,
      unknown: 180
    };
  }

  /**
   * Get weather forecast data from Open-Meteo and adapt format
   */
  async getWeatherForecast(latitude, longitude) {
    try {
      const weatherData = await openMeteoService.getWeatherData(latitude, longitude);

      if (!weatherData || !weatherData.current) {
        throw new ApiError('Weather data unavailable from Open-Meteo', 503);
      }

      return this.processWeatherData(weatherData);

    } catch (error) {
      logger.error('Failed to get weather forecast', { error: error.message });
      throw new ApiError('Weather service temporarily unavailable', 503);
    }
  }

  /**
   * Get soil data from Open-Meteo and adapt format
   */
  async getSoilData(latitude, longitude) {
    try {
      const soilData = await openMeteoService.getSoilData(latitude, longitude);

      if (!soilData || !soilData.hourly) {
        throw new ApiError('Soil data unavailable from Open-Meteo', 404);
      }

      return this.processSoilData(soilData);

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error('Failed to get soil data', { error: error.message });
      throw new ApiError(`Soil data unavailable: ${error.message}`, 503);
    }
  }

  /**
   * Get Air Quality data (New Feature)
   */
  async getAirQuality(latitude, longitude) {
    try {
      const aqData = await openMeteoService.getAirQuality(latitude, longitude);
      if (!aqData || !aqData.current) return null;

      return {
        aqi: aqData.current.european_aqi,
        pm10: aqData.current.pm10,
        pm2_5: aqData.current.pm2_5,
        uvIndex: aqData.current.uv_index,
        pollen: {
          birch: aqData.hourly?.birch_pollen ? aqData.hourly.birch_pollen[0] : 0,
          grass: aqData.hourly?.grass_pollen ? aqData.hourly.grass_pollen[0] : 0,
          olive: aqData.hourly?.olive_pollen ? aqData.hourly.olive_pollen[0] : 0,
          ragweed: aqData.hourly?.ragweed_pollen ? aqData.hourly.ragweed_pollen[0] : 0
        },
        source: 'Open-Meteo'
      };
    } catch (error) {
      logger.warn('Failed to get air quality data', { error: error.message });
      return null;
    }
  }

  /**
   * Calculate evapotranspiration using Penman-Monteith equation (simplified)
   */
  calculateEvapotranspiration(weatherData, cropType, growthStage) {
    const { temperature, humidity, windSpeed, solarRadiation } = weatherData;

    // Simplified ET0 calculation (reference evapotranspiration)
    const tempFactor = Math.max(0, (temperature - 5) / 30);
    const humidityFactor = Math.max(0.3, (100 - humidity) / 100);
    const windFactor = Math.min(2, 1 + windSpeed / 10);
    const radiationFactor = solarRadiation ? solarRadiation / 25 : 1;

    const et0 = tempFactor * humidityFactor * windFactor * radiationFactor * 5; // mm/day

    // Apply crop coefficient
    const cropCoef = this.getCropCoefficient(cropType, growthStage);
    const etCrop = et0 * cropCoef;

    return {
      et0: Math.round(et0 * 100) / 100,
      etCrop: Math.round(etCrop * 100) / 100,
      cropCoefficient: cropCoef
    };
  }

  /**
   * Calculate irrigation recommendation
   */
  async calculateIrrigationRecommendation(params) {
    const {
      latitude,
      longitude,
      cropType = 'unknown',
      growthStage = 'mid',
      soilType = 'unknown',
      lastIrrigation = null,
      fieldSize = 1 // hectares
    } = params;

    const result = {
      recommendation: null,
      waterBalance: null,
      evapotranspiration: null,
      weather: null,
      soil: null,
      airQuality: null,
      metadata: {
        calculatedAt: new Date(),
        location: { latitude, longitude },
        crop: { type: cropType, growthStage },
        fieldSize,
        dataAvailability: {
          weather: false,
          soil: false,
          airQuality: false,
          hasRealData: false
        }
      }
    };

    let weatherData = null;
    let soilData = null;
    let aqData = null;
    let weatherError = null;
    let soilError = null;

    // Try to get weather data
    try {
      weatherData = await this.getWeatherForecast(latitude, longitude);
      result.metadata.dataAvailability.weather = true;
      logger.info('Weather data retrieved successfully', { source: 'real' });
    } catch (weatherError) {
      logger.error('Weather API failed', { error: weatherError.message });
      result.metadata.weatherError = weatherError.message;
    }

    // Try to get soil data
    try {
      soilData = await this.getSoilData(latitude, longitude);
      result.metadata.dataAvailability.soil = true;
      logger.info('Soil data retrieved successfully', { source: 'real' });
    } catch (soilError) {
      logger.error('Soil API failed', { error: soilError.message });
      result.metadata.soilError = soilError.message;
    }

    // Try to get Air Quality data
    try {
      aqData = await this.getAirQuality(latitude, longitude);
      if (aqData) {
        result.metadata.dataAvailability.airQuality = true;
      }
    } catch (error) {
      // Optional data
    }

    // Update data availability
    result.metadata.dataAvailability.hasRealData = (result.metadata.dataAvailability.weather && result.metadata.dataAvailability.soil);

    // If both weather and soil data are unavailable, we cannot provide reliable recommendations
    if (!weatherData && !soilData) {
      throw new ApiError('Insufficient real data available. Both weather and soil data are required for irrigation recommendations.', 503);
    }

    // If weather data is missing, we cannot calculate ET properly
    if (!weatherData) {
      throw new ApiError('Weather data unavailable. Real-time weather data is required for accurate irrigation calculations.', 503);
    }

    // If soil data is missing, we can still provide basic recommendations but with limitations
    if (!soilData) {
      logger.warn('Soil data unavailable - providing limited recommendations', {
        weatherAvailable: !!weatherData,
        soilError: soilError?.message
      });

      // Use default soil properties for basic calculations
      soilData = {
        type: soilType || 'unknown',
        waterHoldingCapacity: this.soilWaterCapacity[soilType] || this.soilWaterCapacity.unknown,
        drainage: 'moderate',
        currentMoisture: 50, // Assumption
        source: 'default'
      };

      result.metadata.warnings = ['Soil data unavailable - using default soil properties. Recommendations may be less accurate.'];
    }

    // Calculate evapotranspiration
    const etData = this.calculateEvapotranspiration(
      weatherData.current,
      cropType,
      growthStage
    );

    // Calculate water balance
    const waterBalance = this.calculateWaterBalance(
      etData,
      weatherData,
      soilData,
      soilType,
      lastIrrigation
    );

    // Generate recommendation
    const recommendation = this.generateIrrigationRecommendation(
      waterBalance,
      weatherData,
      etData,
      fieldSize
    );

    // Add data source information to the result
    result.recommendation = {
      ...recommendation,
      dataSource: {
        weather: weatherData ? 'real' : 'unavailable',
        soil: soilData && soilData.source !== 'default' ? 'real' : 'limited',
        reliability: result.metadata.dataAvailability.hasRealData ? 'high' : 'limited'
      }
    };

    result.waterBalance = waterBalance;
    result.evapotranspiration = etData;
    result.weather = weatherData;
    result.soil = soilData;
    result.airQuality = aqData;

    return result;
  }

  /**
   * Calculate water balance in soil
   */
  calculateWaterBalance(etData, weatherData, soilData, soilType, lastIrrigation) {
    const soilCapacity = this.soilWaterCapacity[soilType] || this.soilWaterCapacity.unknown;
    const rootDepth = 0.6; // meters (typical for most crops)
    const totalWaterCapacity = soilCapacity * rootDepth;

    // Use real soil moisture if available, otherwise calculate
    let currentMoisture;
    let moisturePercentage;

    if (soilData.source === 'Open-Meteo' && soilData.moistureMean !== undefined) {
      // Open-Meteo gives moisture in % (0-100 after our processing)
      moisturePercentage = soilData.moistureMean;
      currentMoisture = (moisturePercentage / 100) * totalWaterCapacity;
    } else {
      // Fallback calculation logic
      const daysSinceIrrigation = lastIrrigation
        ? Math.floor((Date.now() - new Date(lastIrrigation).getTime()) / (1000 * 60 * 60 * 24))
        : 7;

      const waterLoss = etData.etCrop * daysSinceIrrigation;
      const waterGain = weatherData.forecast
        .slice(0, daysSinceIrrigation > 7 ? 7 : daysSinceIrrigation)
        .reduce((sum, day) => sum + (day.precipitation || 0), 0);

      currentMoisture = Math.max(0, totalWaterCapacity * (soilData.currentMoisture ? soilData.currentMoisture / 100 : 0.8) - waterLoss + waterGain);
      moisturePercentage = (currentMoisture / totalWaterCapacity) * 100;
    }

    // Critical thresholds
    const criticalThreshold = totalWaterCapacity * 0.3; // 30% of capacity
    const optimalThreshold = totalWaterCapacity * 0.7; // 70% of capacity

    // Ensure we handle potentially NaN due to missing data gracefully
    currentMoisture = isNaN(currentMoisture) ? 0 : currentMoisture;
    moisturePercentage = isNaN(moisturePercentage) ? 0 : moisturePercentage;

    return {
      currentMoisture: Math.round(currentMoisture),
      totalCapacity: Math.round(totalWaterCapacity),
      moisturePercentage: Math.round(moisturePercentage),
      isCritical: currentMoisture < criticalThreshold,
      isOptimal: currentMoisture >= optimalThreshold
    };
  }

  /**
   * Generate irrigation recommendation
   */
  generateIrrigationRecommendation(waterBalance, weatherData, etData, fieldSize) {
    const { currentMoisture, totalCapacity, isCritical, isOptimal, moisturePercentage } = waterBalance;

    // Check upcoming rainfall
    const upcomingRain = weatherData.forecast
      .slice(0, 3) // Next 3 days
      .reduce((sum, day) => sum + (day.precipitation || 0), 0);

    let status, priority, action, amount, timing, reason;

    if (isCritical && upcomingRain < 10) {
      status = 'urgent';
      priority = 'high';
      action = 'irrigate_now';
      amount = Math.round((totalCapacity * 0.8 - currentMoisture) * fieldSize * 10); // liters
      timing = 'within_2_hours';
      reason = 'Critical soil moisture level detected. Immediate irrigation required to prevent crop stress.';
    } else if (moisturePercentage < 50 && upcomingRain < 5) {
      status = 'needed';
      priority = 'medium';
      action = 'irrigate_soon';
      amount = Math.round((totalCapacity * 0.7 - currentMoisture) * fieldSize * 10);
      timing = 'within_24_hours';
      reason = 'Soil moisture below optimal level. Irrigation recommended before crop stress occurs.';
    } else if (upcomingRain >= 10) {
      status = 'skip';
      priority = 'low';
      action = 'wait_for_rain';
      amount = 0;
      timing = 'after_rainfall';
      reason = `Significant rainfall expected (${Math.round(upcomingRain)}mm). Skip irrigation and reassess after rain.`;
    } else if (isOptimal) {
      status = 'optimal';
      priority = 'low';
      action = 'monitor';
      amount = 0;
      timing = 'next_assessment';
      reason = 'Soil moisture at optimal level. Continue monitoring and reassess in 2-3 days.';
    } else {
      status = 'monitor';
      priority = 'low';
      action = 'assess_tomorrow';
      amount = 0;
      timing = 'tomorrow';
      reason = 'Soil moisture adequate for now. Reassess tomorrow based on weather conditions.';
    }

    const optimalTimes = this.calculateOptimalIrrigationTimes(weatherData.current);
    const conservationTips = this.getWaterConservationTips(status, weatherData);

    return {
      status,
      priority,
      action,
      amount,
      timing,
      reason,
      optimalTimes,
      conservationTips,
      nextAssessment: this.calculateNextAssessment(status),
      costEstimate: this.calculateIrrigationCost(amount),
      environmentalImpact: this.calculateEnvironmentalImpact(amount, status)
    };
  }

  /**
   * Get crop coefficient based on crop type and growth stage
   */
  getCropCoefficient(cropType, growthStage) {
    const normalizedCropType = this.normalizeCropType(cropType);
    const cropData = this.cropCoefficients[normalizedCropType] || this.cropCoefficients.default;
    return cropData[growthStage] || cropData.mid;
  }

  /**
   * Normalize crop type to handle plural forms and variations
   */
  normalizeCropType(cropType) {
    if (!cropType) return 'default';
    const cropTypeMap = {
      'tomatoes': 'tomato', 'tomato': 'tomato',
      'corn': 'corn', 'maize': 'corn',
      'rice': 'rice', 'wheat': 'wheat',
      'potatoes': 'potato', 'potato': 'potato',
      'cassava': 'cassava',
      'mixed_crops': 'default', 'mixed crops': 'default',
      'unknown': 'default'
    };
    return cropTypeMap[cropType.toLowerCase()] || 'default';
  }

  /**
   * Calculate optimal irrigation times based on weather
   */
  calculateOptimalIrrigationTimes(currentWeather) {
    const { temperature } = currentWeather;
    const earlyMorning = {
      time: '05:30 - 07:00',
      reason: 'Low evaporation, good water absorption',
      efficiency: 95
    };
    const eveningTime = temperature > 30 ? '18:30 - 20:00' : '17:00 - 19:00';
    const evening = {
      time: eveningTime,
      reason: 'Cooler temperatures, reduced water loss',
      efficiency: 85
    };
    const avoid = {
      time: '10:00 - 16:00',
      reason: 'High evaporation, water stress on plants',
      efficiency: 45
    };

    return {
      recommended: [earlyMorning, evening],
      avoid: [avoid],
      best: temperature > 25 ? earlyMorning : evening
    };
  }

  /**
   * Get water conservation tips
   */
  getWaterConservationTips(status, weatherData) {
    const tips = [
      { tip: 'Use drip irrigation for 30-50% water savings', impact: 'high', savings: '30-50%' },
      { tip: 'Apply mulch around plants to reduce evaporation', impact: 'medium', savings: '15-25%' }
    ];

    if (weatherData.current.windSpeed > 15) {
      tips.push({ tip: 'Avoid irrigation during windy conditions to reduce drift', impact: 'medium', savings: '10-20%' });
    }
    if (status === 'urgent') {
      tips.push({ tip: 'Consider split irrigation to improve absorption', impact: 'high', savings: '20-30%' });
    }
    return tips;
  }

  /**
   * Calculate next assessment time
   */
  calculateNextAssessment(status) {
    const now = new Date();
    let hoursToAdd = 48;
    if (status === 'urgent') hoursToAdd = 6;
    else if (status === 'needed') hoursToAdd = 24;
    else if (status === 'skip') hoursToAdd = 72;

    return new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);
  }

  /**
   * Calculate irrigation cost estimate
   */
  calculateIrrigationCost(amount) {
    const waterCostPerLiter = 0.2; // INR per liter
    const energyCost = amount * 0.02; // INR for energy
    const totalCost = (amount * waterCostPerLiter) + energyCost;

    return {
      water: Math.round(amount * waterCostPerLiter * 100) / 100,
      energy: Math.round(energyCost * 100) / 100,
      total: Math.round(totalCost * 100) / 100,
      currency: 'INR'
    };
  }

  /**
   * Calculate environmental impact
   */
  calculateEnvironmentalImpact(amount, status) {
    const co2PerLiter = 0.0003;
    const co2Impact = amount * co2PerLiter;

    let sustainability = 'concerning';
    if (status === 'optimal' || status === 'skip') sustainability = 'excellent';
    else if (status === 'monitor') sustainability = 'good';
    else if (status === 'needed') sustainability = 'moderate';

    return {
      co2Footprint: Math.round(co2Impact * 1000) / 1000,
      sustainability,
      waterEfficiency: status === 'urgent' ? 'low' : 'high',
      recommendation: 'Consider precision irrigation techniques for better efficiency'
    };
  }

  /**
   * Process Open-Meteo weather data
   */
  processWeatherData(data) {
    const current = data.current;

    // Map WMO codes to simple summaries
    const getWeatherSummary = (code) => {
      if (code === 0) return 'clear';
      if (code < 3) return 'partly-cloudy';
      if (code < 50) return 'cloudy';
      if (code < 80) return 'rain';
      if (code < 90) return 'heavy-rain';
      return 'storm';
    };

    const forecast = data.daily.time.map((time, index) => ({
      time: time,
      temperature: {
        max: data.daily.temperature_2m_max[index],
        min: data.daily.temperature_2m_min[index]
      },
      precipitation: data.daily.precipitation_sum[index],
      precipitationProbability: data.daily.precipitation_probability_max[index] || 0,
      summary: getWeatherSummary(data.daily.weather_code[index])
    }));

    return {
      current: {
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        solarRadiation: 20, // Proxy/Estimated
        summary: getWeatherSummary(current.weather_code)
      },
      forecast: forecast,
      source: 'Open-Meteo'
    };
  }

  /**
   * Process Open-Meteo soil data
   */
  processSoilData(data) {
    // Open-Meteo returns soil moisture in m³/m³. Convert to percentage.
    // Use the first hour (current time approximation)
    const index = 0;

    // Calculate mean moisture from different depths
    const moisture0 = data.hourly.soil_moisture_0_to_1cm ? data.hourly.soil_moisture_0_to_1cm[index] : 0.2;
    const moisture3 = data.hourly.soil_moisture_3_to_9cm ? data.hourly.soil_moisture_3_to_9cm[index] : 0.25;
    const moisture9 = data.hourly.soil_moisture_9_to_27cm ? data.hourly.soil_moisture_9_to_27cm[index] : 0.3;

    // Weighted mean
    const meanMoisture = (moisture0 * 1 + moisture3 * 2 + moisture9 * 3) / 6;

    // Open-Meteo doesn't provide chemical properties, so we estimate based on typical Loam soil
    // In a real app, this would come from a specific soil database
    return {
      type: 'loam', // Default assumption
      moistureMean: Math.round(meanMoisture * 100),
      tempSurface: data.hourly.soil_temperature_0cm ? data.hourly.soil_temperature_0cm[index] : null,
      tempRoot: data.hourly.soil_temperature_18cm ? data.hourly.soil_temperature_18cm[index] : null,
      ph: 6.5, // Typical for loam
      organicMatter: 3.5, // Typical range 2-5%
      drainage: 'well',
      waterHoldingCapacity: 160, // mm/m
      source: 'Open-Meteo'
    };
  }
}

module.exports = new IrrigationService();