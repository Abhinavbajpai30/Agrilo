/**
 * Test script for refactored IrrigationService
 * Verifies integration with Open-Meteo for Weather, Soil, and Air Quality
 */

const irrigationService = require('../services/irrigationService');

async function testIrrigationService() {
    console.log('Testing Irrigation Service with Open-Meteo...');

    // Test coordinates (e.g., a farm location in India)
    const lat = 28.6139;
    const lon = 77.2090;

    try {
        const recommendation = await irrigationService.calculateIrrigationRecommendation({
            latitude: lat,
            longitude: lon,
            cropType: 'wheat',
            growthStage: 'mid',
            fieldSize: 2.5,
            lastIrrigation: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
        });

        console.log('\n--- Calculation Result ---');
        console.log('Status:', recommendation.recommendation.status);
        console.log('Action:', recommendation.recommendation.action);
        console.log('Amount:', recommendation.recommendation.amount, 'L');
        console.log('Data Sources:', recommendation.recommendation.dataSource);

        console.log('\n--- Weather Data ---');
        console.log('Current Temp:', recommendation.weather.current.temperature, '°C');
        console.log('Summary:', recommendation.weather.current.summary);

        console.log('\n--- Soil Data ---');
        console.log('Moisture Mean:', recommendation.soil.moistureMean, '%');
        console.log('Source:', recommendation.soil.source);

        console.log('\n--- Air Quality Data ---');
        if (recommendation.airQuality) {
            console.log('AQI:', recommendation.airQuality.aqi);
            console.log('PM2.5:', recommendation.airQuality.pm2_5);
            console.log('UV Index:', recommendation.airQuality.uvIndex);
            console.log('Pollen (Birch):', recommendation.airQuality.pollen.birch);
        } else {
            console.log('Air Quality Data Unavailable');
        }

        console.log('\nTest PASSED');

    } catch (error) {
        console.error('Test FAILED:', error);
    }
}

testIrrigationService();
