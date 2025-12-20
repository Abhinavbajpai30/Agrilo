const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const Farm = require('../models/Farm');
const whatsAppService = require('../services/whatsAppService');
const { authenticateUser } = require('../middleware/auth');

// @desc    Report a new issue
// @route   POST /api/issues
// @access  Private
router.post('/', authenticateUser, async (req, res) => {
    try {
        const { type, description, severity, latitude, longitude, farmId, radius } = req.body;

        const issue = await Issue.create({
            type,
            description,
            severity,
            location: {
                type: 'Point',
                coordinates: [longitude, latitude]
            },
            reportedBy: req.user.id,
            farmId,
            radius: radius || 1000
        });

        console.log(`[CREATE] New issue created: ${issue._id} by ${req.user.id}`);

        // --- WhatsApp Alert Implementation ---
        // Fire and forget - don't block the response
        (async () => {
            try {
                // 1. Find nearby active farms within the specified radius (default 1km if not provided)
                // Note: Issue radius is in meters, findNearby expects km? 
                // Let's use the issue's radius or default to 5km for alerts to be safe/broad enough
                const alertRadiusKm = (radius ? radius / 1000 : 5);

                // Using Farm.findNearby static method we saw earlier
                const nearbyFarms = await Farm.findNearby(latitude, longitude, alertRadiusKm);

                if (!nearbyFarms || nearbyFarms.length === 0) {
                    console.log(`[ALERT] No nearby farms found for issue ${issue._id}`);
                    return;
                }

                // 2. Extract unique owners
                // We need to populate owners if findNearby didn't (it doesn't seem to populate in the static method definition I saw)
                // So let's re-fetch or populate manually. 
                // Actually, let's just map owner IDs and fetch Users.
                const ownerIds = [...new Set(nearbyFarms.map(f => f.owner.toString()))];

                // Exclude the reporter if they are an owner
                const reporterId = req.user.id.toString();
                const targetOwnerIds = ownerIds.filter(id => id !== reporterId);

                if (targetOwnerIds.length === 0) return;

                const users = await require('../models/User').find({
                    _id: { $in: targetOwnerIds },
                    'status.isActive': true
                }).select('personalInfo.phoneNumber personalInfo.firstName');

                console.log(`[ALERT] Found ${users.length} owners to alert for issue ${issue._id}`);

                // 3. Send alerts
                for (const user of users) {
                    if (user.personalInfo && user.personalInfo.phoneNumber) {
                        try {
                            // 1. Try sending via Template (Preferred for 24h window policy)
                            // Template Name: farm_alert_nearby
                            // Variables: {{1}}=Type, {{2}}=Severity, {{3}}=Description
                            const components = [
                                {
                                    type: 'body',
                                    parameters: [
                                        { type: 'text', text: type.toUpperCase() },
                                        { type: 'text', text: severity },
                                        { type: 'text', text: description.substring(0, 60) } // Truncate if too long for template param limits
                                    ]
                                }
                            ];

                            const templateSent = await whatsAppService.sendTemplate(
                                user.personalInfo.phoneNumber,
                                'farm_alert_nearby',
                                components
                            );

                            // 2. Fallback to Text if Template fails (or not configured yet, effectively)
                            // Note: If template param fails, we log it.
                            if (!templateSent) {
                                const message = `⚠️ *Farm Alert Nearby* ⚠️\n\nA new issue of type *${type.toUpperCase()}* has been reported nearby.\n\n📝 *Description:* ${description}\nseverity: ${severity}\n\nPlease check your farm and take necessary precautions.`;
                                await whatsAppService.sendAlert(user.personalInfo.phoneNumber, message);
                            }

                        } catch (sendError) {
                            console.error(`[ALERT] Failed to send to ${user.personalInfo.phoneNumber}`, sendError);
                        }
                    }
                }
            } catch (alertErr) {
                console.error('[ALERT] Error processing WhatsApp alerts:', alertErr);
            }
        })();
        // -------------------------------------

        res.status(201).json({
            success: true,
            data: issue
        });
    } catch (error) {
        console.error('Error reporting issue:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

// @desc    Get issues nearby
// @route   GET /api/issues/nearby
// @access  Private
router.get('/nearby', authenticateUser, async (req, res) => {
    try {
        const { latitude, longitude, radius = 5 } = req.query; // radius in km

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'Please provide latitude and longitude'
            });
        }

        const issues = await Issue.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: parseFloat(radius) * 1000 // convert to meters
                }
            },
            status: { $ne: 'resolved' } // Only active issues
        }).populate('reportedBy', 'personalInfo.firstName personalInfo.lastName');

        res.status(200).json({
            success: true,
            count: issues.length,
            data: issues
        });
    } catch (error) {
        console.error('Error fetching nearby issues:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

// @desc    Get issues by farm
// @route   GET /api/issues/farm/:farmId
// @access  Private
router.get('/farm/:farmId', authenticateUser, async (req, res) => {
    try {
        const issues = await Issue.find({
            farmId: req.params.farmId
        }).sort('-createdAt');

        res.status(200).json({
            success: true,
            count: issues.length,
            data: issues
        });
    } catch (error) {
        console.error('Error fetching farm issues:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

// @desc    Delete an issue
// @route   DELETE /api/issues/:id
// @access  Private
router.delete('/:id', authenticateUser, async (req, res) => {
    try {
        const issueId = req.params.id.trim();
        console.log(`[DELETE] Attempting to delete issue with ID: '${issueId}'`);
        console.log(`[DELETE] User ID: ${req.user.id}`);

        const issue = await Issue.findById(issueId);

        if (!issue) {
            console.log(`[DELETE] Issue not found in DB: ${req.params.id}`);
            return res.status(404).json({
                success: false,
                message: 'Issue not found'
            });
        }

        console.log(`[DELETE] Issue found: ${issue._id}, ReportedBy: ${issue.reportedBy}`);

        // Make sure user owns the issue
        if (issue.reportedBy.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to delete this issue'
            });
        }

        await issue.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Error deleting issue:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

module.exports = router;
