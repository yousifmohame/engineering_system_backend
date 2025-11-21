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
  updateTransactionTasks,
  updateTransactionStaff
} = require('../controllers/transactionController');

// حماية جميع مسارات المعاملات
router.use(protect);

router.route('/')
  .get(getAllTransactions)
  .post(createTransaction);

router.route('/types/simple')
  .get(getSimpleTransactionTypes);

router.route('/types/full')
  .get(getFullTransactionTypes);

router.route('/types')
  .get(getTransactionTypes)
  .post(createTransactionType);

router.get('/template-fees/:typeId', protect, getTemplateFees);

router.route('/types/:id')
  .put(updateTransactionType)
  .delete(deleteTransactionType);

router.route('/:id')
  .get(getTransactionById)
  .put(updateTransaction)
  .delete(deleteTransaction);

router.put('/:id/tasks', protect, updateTransactionTasks);

router.put('/:id/staff', protect, updateTransactionStaff);

module.exports = router;