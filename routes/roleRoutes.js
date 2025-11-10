// routes/roleRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const {
  createRole,
  getAllRoles,
  assignEmployeeToRole,
  removeEmployeeFromRole
} = require('../controllers/roleController');

// حماية جميع المسارات التالية
router.use(protect);

// المسارات الأساسية
router.route('/')
  .post(createRole)
  .get(getAllRoles);

// مسارات إسناد الموظفين
router.route('/assign-employee')
  .post(assignEmployeeToRole);

router.route('/remove-employee')
  .post(removeEmployeeFromRole);
  
module.exports = router;