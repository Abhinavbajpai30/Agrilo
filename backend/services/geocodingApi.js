/**
 * Geocoding API Service for Agrilo
 * Provides location services and geographic data through Open-Meteo
 * Refactored to use Open-Meteo Geocoding and removed OpenEPI dependency
 */

const openMeteoService = require('./openMeteoService');
const logger = require('../utils/logger');
const { ApiError } = require('../middleware/errorHandler');

class GeocodingApiService {
  constructor() {
    this.geocodingService = openMeteoService;

    // Geocoding cache duration
    this.addressCacheTTL = 86400; // 24 hours
  }

  /**
   * Transform Open-Meteo geocoding response to expected format
   */
  transformGeocodingResponse(apiResponse, query) {
    const results = (apiResponse.results || []).map(feature => ({
      formattedAddress: `${feature.name}, ${feature.admin1 || ''} ${feature.country || ''}`.trim().replace(/\s+,/, ','),
      coordinates: {
        longitude: feature.longitude,
        latitude: feature.latitude
      },
      components: {
        locality: feature.name,
        region: feature.admin1,
        country: feature.country,
        countryCode: feature.country_code,
        timezone: feature.timezone
      },
      confidence: 0.9, // Open-Meteo results are usually high confidence matches for names
      placeType: feature.feature_code || 'place',
      relevance: 1.0
    }));

    return {
      query,
      results,
      resultCount: results.length,
      timestamp: new Date().toISOString(),
      source: 'Open-Meteo'
    };
  }

  /**
   * Convert address to coordinates (geocoding) using Open-Meteo
   */
  async geocodeAddress(address, countryCode = null) {
    try {
      if (!address || address.trim().length === 0) {
        throw new ApiError('Address is required', 400);
      }

      const response = await this.geocodingService.searchLocations(address.trim());

      if (!response || !response.results) {
        throw new ApiError('No locations found for the provided address', 404);
      }

      const geocodingResult = this.transformGeocodingResponse(response, address);

      logger.info('Address geocoding completed via Open-Meteo', { address, resultCount: geocodingResult.resultCount });
      return geocodingResult;

    } catch (error) {
      logger.error('Failed to geocode address', { address, error: error.message });
      throw error;
    }
  }

  /**
   * Get coordinates for an address (alias for geocodeAddress)
   */
  async getCoordinates(address, countryCode = null) {
    const result = await this.geocodeAddress(address, countryCode);

    if (result.results && result.results.length > 0) {
      return result.results[0].coordinates;
    }

    throw new ApiError('No coordinates found for the provided address', 404);
  }

  /**
   * Convert coordinates to address (reverse geocoding)
   * Note: Open-Meteo doesn't natively support full reverse geocoding in the same way.
   * We will limit this functionality or throw an error if strictly dependent on full address.
   * For now, we'll return a basic structure to prevent crashes if called.
   */
  async reverseGeocode(lat, lon) {
    // Open-Meteo doesn't have a reverse geocoding 'address' endpoint.
    // We would need a different provider like Nominatim OS or Google Maps.
    // Since we are migrating away from OpenEPI and avoiding mocks, 
    // we will return a minimal valid response that indicates limitation.

    logger.warn('Reverse geocoding requested but not fully supported by Open-Meteo basic plan', { lat, lon });

    return {
      coordinates: { latitude: lat, longitude: lon },
      address: {
        formatted: `Dimensions: ${lat.toFixed(4)}, ${lon.toFixed(4)}`, // Placeholder
        components: {},
        placeType: 'coordinates'
      },
      administrativeInfo: {},
      timestamp: new Date().toISOString(),
      source: 'Open-Meteo (Coordinates Only)'
    };
  }

  /**
   * Get administrative information for coordinates
   * Limited support via Open-Meteo
   */
  async getAdministrativeInfo(lat, lon) {
    try {
      // We can get some data from weather endpoint (timezone, elevation) if needed,
      // but for now we'll return basic coordinate info.
      return {
        coordinates: { latitude: lat, longitude: lon },
        timezone: 'auto', // Open-Meteo supports auto timezone in weather call
        timestamp: new Date().toISOString(),
        source: 'Open-Meteo'
      };
    } catch (error) {
      logger.error('Failed to get administrative info', { lat, lon, error: error.message });
      throw error;
    }
  }

  /**
   * Validate farm coordinates and get location details
   */
  async validateFarmLocation(lat, lon) {
    try {
      if (!lat || !lon) {
        throw new ApiError('Latitude and longitude are required', 400);
      }

      // Simplified validation since we don't have deep administrative data
      const validation = {
        coordinates: { latitude: lat, longitude: lon },
        isValid: true,
        address: { formatted: `${lat}, ${lon}` },
        administrative: {},
        suitabilityAssessment: {
          farmingSuitability: 'unknown',
          proximityToWater: { nearestSource: 'unknown', distance: 'unknown' },
          accessibilityRating: { roadAccess: 'unknown' },
          soilQualityIndicator: { generalRating: 'unknown' }
        },
        nearbyFeatures: [],
        recommendations: [
          'Verify soil testing in the specific field areas',
          'Check local zoning regulations for agricultural use'
        ],
        timestamp: new Date().toISOString()
      };

      logger.info('Farm location validated (Basic)', { lat, lon });
      return validation;

    } catch (error) {
      logger.error('Failed to validate farm location', { lat, lon, error: error.message });
      throw new ApiError('Farm location validation service temporarily unavailable', 503);
    }
  }

  /**
   * Parse address components
   */
  parseAddressComponents(feature) {
    return feature.components || {};
  }

  // ... (Other internal helpers removed or simplified as they were specific to OpenEPI response structure)
}

module.exports = new GeocodingApiService();