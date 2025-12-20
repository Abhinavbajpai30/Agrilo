const express = require('express');
const multer = require('multer');
const router = express.Router();
const voiceController = require('../controllers/voiceController');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
});

const { authenticateUser } = require('../middleware/auth');

// Route: POST /api/voice/query
router.post('/query', authenticateUser, upload.single('audio'), voiceController.processVoiceQuery);

module.exports = router;
