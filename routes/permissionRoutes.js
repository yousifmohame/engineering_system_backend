// routes/permissionRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const {
  createPermission,
  getAllPermissions,
  assignPermissionToRole,
  assignPermissionToEmployee
} = require('../controllers/permissionController');

// حماية جميع المسارات التالية
router.use(protect);

// المسارات الأساسية
router.route('/')
  .post(createPermission)
  .get(getAllPermissions);

// مسارات الإسناد
router.route('/assign-to-role')
  .post(assignPermissionToRole);

router.route('/assign-to-employee')
  .post(assignPermissionToEmployee);
  
module.exports = router;