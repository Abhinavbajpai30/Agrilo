const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['pest', 'disease', 'fire', 'flood', 'drought', 'other'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['reported', 'investigating', 'resolved', 'false_alarm'],
        default: 'reported'
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    farmId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farm'
    },
    radius: {
        type: Number, // Impact radius in meters
        default: 1000
    },
    images: [String],
    resolvedAt: Date
}, {
    timestamps: true
});

// Index for geospatial queries
issueSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Issue', issueSchema);
