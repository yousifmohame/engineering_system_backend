// routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// --- 1. استيراد جميع الدوال ---
const {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTransactionTypes,
  createTransactionType,
  updateTransactionType,
  deleteTransactionType,
  getSimpleTransactionTypes,
  getFullTransactionTypes,
  getTemplateFees,
  updateTransactionTasks
} = require('../controllers/transactionController');

// حماية جميع مسارات المعاملات
router.use(protect);

// === المسارات الرئيسية للمعاملات ===

// GET /api/transactions  -> جلب كل المعاملات
// POST /api/transactions -> إنشاء معاملة جديدة
router.route('/')
  .get(getAllTransactions)
  .post(createTransaction);

// --- 2. (جديد) مسارات لإدارة "أنواع" المعاملات ---
// GET /api/transactions/types  -> (موجودة من قبل) جلب قائمة الأنواع
// POST /api/transactions/types -> (جديد) إنشاء نوع جديد

// (للقائمة المنسدلة في شاشة 286)
router.route('/types/simple')
  .get(getSimpleTransactionTypes);

// (للجدول الكامل في شاشة 701)
router.route('/types/full')
  .get(getFullTransactionTypes);

router.route('/types')
  .get(getTransactionTypes)
  .post(createTransactionType);

router.get('/template-fees/:typeId', protect, getTemplateFees);

// --- 3. (جديد) مسارات لتعديل/حذف نوع معين ---
// PUT /api/transactions/types/:id    -> (جديد) تعديل نوع
// DELETE /api/transactions/types/:id -> (جديد) حذف نوع
router.route('/types/:id')
  .put(updateTransactionType)
  .delete(deleteTransactionType);

// === المسارات الخاصة بمعاملة واحدة ===

// GET /api/transactions/:id    -> جلب معاملة واحدة
// PUT /api/transactions/:id    -> تحديث معاملة
// DELETE /api/transactions/:id -> حذف معاملة
// (مهم: هذا المسار يجب أن يبقى في الأسفل)
router.route('/:id')
  .get(getTransactionById)
  .put(updateTransaction)
  .delete(deleteTransaction);

router.put('/:id/tasks', protect, updateTransactionTasks);

module.exports = router;