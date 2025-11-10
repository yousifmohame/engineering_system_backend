// routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// استيراد الوظائف من الـ Controller
const {
  createTask,
  getTasksForTransaction,
  assignTaskToEmployee,
  updateTaskStatus,
  deleteTask,
} = require('../controllers/taskController');

// حماية جميع مسارات المهام
router.use(protect);

// POST /api/tasks -> إنشاء مهمة جديدة
router.route('/')
  .post(createTask);

// GET /api/tasks/transaction/:transactionId -> جلب مهام معاملة معينة
router.route('/transaction/:transactionId')
  .get(getTasksForTransaction);

// PUT /api/tasks/:taskId/assign -> إسناد مهمة لموظف
router.route('/:taskId/assign')
  .put(assignTaskToEmployee);

// PUT /api/tasks/:taskId/status -> تحديث حالة المهمة
router.route('/:taskId/status')
  .put(updateTaskStatus);

// DELETE /api/tasks/:taskId -> حذف مهمة
router.route('/:taskId')
  .delete(deleteTask);

module.exports = router;