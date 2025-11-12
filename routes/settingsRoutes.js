const express = require('express');
const router = express.Router();
const { getSystemSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/settings/system
// هذا المسار محمي ويتطلب تسجيل الدخول
router.get('/system', protect, getSystemSettings);

module.exports = router;