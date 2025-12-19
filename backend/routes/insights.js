/**
 * Insights API Routes for Agrilo
 * Provides advanced AI insights using Google Earth Engine (GEE)
 * Includes Drought Risk, Vegetation Health, and Flood Risk
 */

const express = require('express');
const { query } = require('express-validator');
const googleEarthEngineService = require('../services/googleEarthEngineService');
const { asyncHandler, handleValidationErrors } = require('../middleware/errorHandler');
const { success, error } = require('../utils/apiResponse');
const logger = require('../utils/logger');
const User = require('../models/User');

const router = express.Router();

// Authentication Middleware (Simplified reuse)
const authenticateUser = asyncHandler(async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ status: 'error', message: 'Access denied. No token provided.' });

    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user || (!user.status?.isActive && user.status?.isActive !== undefined)) return res.status(401).json({ status: 'error', message: 'User inactive' });
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ status: 'error', message: 'Invalid token' });
    }
});

/**
 * @route   GET /api/insights/drought
 * @desc    Get Drought Risk Analysis (CHIRPS Data)
 * @access  Private
 */
router.get('/drought', authenticateUser, [
    query('lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
    query('lon').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required')
], handleValidationErrors, asyncHandler(async (req, res) => {
    const { lat, lon } = req.query;

    try {
        const analysis = await googleEarthEngineService.calculateDroughtRisk(parseFloat(lat), parseFloat(lon));
        return success(res, analysis, 'Drought risk analysis retrieved');
    } catch (err) {
        logger.error('Drought API Error', err);
        return error(res, 'Failed to retrieve drought analysis', 503);
    }
}));

/**
 * @route   GET /api/insights/vegetation
 * @desc    Get Vegetation Health Analysis (MODIS NDVI)
 * @access  Private
 */
router.get('/vegetation', authenticateUser, [
    query('lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
    query('lon').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required')
], handleValidationErrors, asyncHandler(async (req, res) => {
    const { lat, lon } = req.query;

    try {
        const analysis = await googleEarthEngineService.calculateVegetationHealth(parseFloat(lat), parseFloat(lon));
        if (!analysis) return error(res, 'Vegetation data unavailable for this location', 404);
        return success(res, analysis, 'Vegetation health analysis retrieved');
    } catch (err) {
        logger.error('Vegetation API Error', err);
        return error(res, 'Failed to retrieve vegetation analysis', 503);
    }
}));

/**
 * @route   GET /api/insights/flood
 * @desc    Get Flood Risk Analysis (GPM Data)
 * @access  Private
 */
router.get('/flood', authenticateUser, [
    query('lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
    query('lon').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required')
], handleValidationErrors, asyncHandler(async (req, res) => {
    const { lat, lon } = req.query;

    try {
        const analysis = await googleEarthEngineService.calculateFloodRisk(parseFloat(lat), parseFloat(lon));
        if (!analysis) return error(res, 'Flood data unavailable for this location', 404);
        return success(res, analysis, 'Flood risk analysis retrieved');
    } catch (err) {
        logger.error('Flood API Error', err);
        return error(res, 'Failed to retrieve flood analysis', 503);
    }
}));

/**
 * @route   GET /api/insights/combined
 * @desc    Get All Insights Combined (Optimized for Dashboard)
 * @access  Private
 */
router.get('/combined', authenticateUser, [
    query('lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
    query('lon').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required')
], handleValidationErrors, asyncHandler(async (req, res) => {
    const { lat, lon } = req.query;
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    try {
        // Parallel execution
        const [drought, vegetation, flood] = await Promise.all([
            googleEarthEngineService.calculateDroughtRisk(latitude, longitude).catch(e => ({ error: 'Unavailable' })),
            googleEarthEngineService.calculateVegetationHealth(latitude, longitude).catch(e => ({ error: 'Unavailable' })),
            googleEarthEngineService.calculateFloodRisk(latitude, longitude).catch(e => ({ error: 'Unavailable' }))
        ]);

        return success(res, {
            drought,
            vegetation,
            flood,
            timestamp: new Date().toISOString()
        }, 'Combined insights retrieved');
    } catch (err) {
        logger.error('Combined Insights API Error', err);
        return error(res, 'Failed to retrieve combined insights', 500);
    }
}));

module.exports = router;
