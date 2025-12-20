/**
 * Geocoding API Service for Agrilo
 * Provides location services and geographic data through Open-Meteo
 * Refactored to use Open-Meteo Geocoding and removed OpenEPI dependency
 */

const axios = require('axios');
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
   * Uses Nominatim (OpenStreetMap) for detailed address data
   */
  async reverseGeocode(lat, lon) {
    try {
      // Using Nominatim for reverse geocoding
      const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          lat: lat,
          lon: lon,
          format: 'json',
          addressdetails: 1,
          zoom: 18 // Building level
        },
        headers: {
          'User-Agent': 'Agrilo/1.0 (contact@agrilo.com)' // Required by Nominatim
        },
        timeout: 5000
      });

      if (response.data && response.data.address) {
        const addr = response.data.address;
        const formattedAddress = response.data.display_name;

        return {
          coordinates: { latitude: lat, longitude: lon },
          address: {
            formatted: formattedAddress,
            components: {
              locality: addr.city || addr.town || addr.village || addr.suburb || addr.hamlet,
              region: addr.state || addr.province || addr.region,
              country: addr.country,
              countryCode: addr.country_code,
              postcode: addr.postcode,
              district: addr.state_district || addr.county
            },
            placeType: response.data.type || 'place'
          },
          administrativeInfo: {
            country: addr.country,
            region: addr.state || addr.province,
            district: addr.county || addr.state_district,
            locality: addr.city || addr.town || addr.village
          },
          timestamp: new Date().toISOString(),
          source: 'Nominatim (OSM)'
        };
      }

      throw new Error('No address found');
    } catch (error) {
      logger.error('Nominatim Reverse Geocoding Error', { error: error.message, lat, lon });

      // Fallback or return minimal data
      return {
        coordinates: { latitude: lat, longitude: lon },
        address: {
          formatted: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
          components: {},
          placeType: 'coordinates'
        },
        administrativeInfo: {},
        timestamp: new Date().toISOString(),
        source: 'Fallback'
      };
    }
  }

  /**
   * Get administrative information for coordinates
   * Uses reverseGeocode to get detailed info
   */
  async getAdministrativeInfo(lat, lon) {
    try {
      const result = await this.reverseGeocode(lat, lon);

      return {
        coordinates: { latitude: lat, longitude: lon },
        country: result.administrativeInfo?.country,
        region: result.administrativeInfo?.region,
        district: result.administrativeInfo?.district,
        locality: result.administrativeInfo?.locality,
        timezone: 'auto', // Can be fetched from Open-Meteo if strictly needed separately
        timestamp: new Date().toISOString(),
        source: result.source
      };
    } catch (error) {
      logger.error('Failed to get administrative info', { lat, lon, error: error.message });
      // Return minimal valid object to prevent crashes
      return {
        coordinates: { latitude: lat, longitude: lon },
        source: 'Error'
      };
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