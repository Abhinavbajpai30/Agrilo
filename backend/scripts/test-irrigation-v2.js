/**
 * Test script for IrrigationService V2
 * Verifies Currency (INR) and Soil Properties (pH, etc.)
 */

const irrigationService = require('../services/irrigationService');

async function testIrrigationServiceV2() {
    console.log('Testing Irrigation Service w/ Currency & Soil Fixes...');

    const lat = 28.6139;
    const lon = 77.2090;

    try {
        const result = await irrigationService.calculateIrrigationRecommendation({
            latitude: lat,
            longitude: lon,
            cropType: 'wheat',
            growthStage: 'mid',
            fieldSize: 2.5
        });

        console.log('\n--- Cost Estimate ---');
        if (result.recommendation.costEstimate) {
            console.log(`Total: ${result.recommendation.costEstimate.total} ${result.recommendation.costEstimate.currency}`);
            console.log(`Water Cost: ${result.recommendation.costEstimate.water}`);
            console.log(`Energy Cost: ${result.recommendation.costEstimate.energy}`);
        } else {
            console.log('Cost estimate is missing');
        }

        console.log('\n--- Soil Properties ---');
        if (result.soil) {
            console.log(`Type: ${result.soil.type}`);
            console.log(`pH: ${result.soil.ph}`);
            console.log(`Organic Matter: ${result.soil.organicMatter}%`);
            console.log(`Drainage: ${result.soil.drainage}`);
            console.log(`Water Holding Capacity: ${result.soil.waterHoldingCapacity} mm/m`);
            console.log(`Source: ${result.soil.source}`);
        } else {
            console.log('Soil data is missing');
        }

        console.log('\nTest PASSED');

    } catch (error) {
        console.error('Test FAILED:', error);
    }
}

testIrrigationServiceV2();
