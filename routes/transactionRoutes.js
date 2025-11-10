// routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// استيراد الوظائف من الـ Controller
const {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');

// حماية جميع مسارات المعاملات
router.use(protect);

// GET /api/transactions  -> جلب كل المعاملات
// POST /api/transactions -> إنشاء معاملة جديدة
router.route('/')
  .get(getAllTransactions)
  .post(createTransaction);

// GET /api/transactions/:id    -> جلب معاملة واحدة
// PUT /api/transactions/:id    -> تحديث معاملة
// DELETE /api/transactions/:id -> حذف معاملة
router.route('/:id')
  .get(getTransactionById)
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;