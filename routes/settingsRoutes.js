const express = require("express");
const router = express.Router();
const {
  getSystemSettings,
  getRequestPurposes,
  createRequestPurpose,
  updateRequestPurpose,
  deleteRequestPurpose,
} = require("../controllers/settingsController");
const { protect } = require("../middleware/authMiddleware");

// GET /api/settings/system
// هذا المسار محمي ويتطلب تسجيل الدخول
router.get("/system", protect, getSystemSettings);

// GET /api/settings/request-purposes?type=brief
router.get("/request-purposes", getRequestPurposes);

// إنشاء غرض جديد
// POST /api/settings/request-purposes
router.post("/request-purposes", createRequestPurpose);

// تعديل غرض موجود
// PUT /api/settings/request-purposes/:id
router.put("/request-purposes/:id", updateRequestPurpose);

// حذف غرض
// DELETE /api/settings/request-purposes/:id
router.delete("/request-purposes/:id", deleteRequestPurpose);

module.exports = router;
