// routes/employeeRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// استيراد الوظائف من الـ Controller
const {
  getMe,
  getAllEmployees,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');

// حماية جميع المسارات التالية
router.use(protect);

// GET /api/employees/me -> جلب بياناتي (من التوكن)
router.route('/me').get(getMe);

// GET /api/employees -> جلب كل الموظفين (لشاشة 817)
router.route('/').get(getAllEmployees);

// PUT /api/employees/:id -> تحديث موظف
// DELETE /api/employees/:id -> حذف/أرشفة موظف
router.route('/:id')
  .put(updateEmployee)
  .delete(deleteEmployee);

module.exports = router;