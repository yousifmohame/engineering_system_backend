// routes/clientRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// استيراد الوظائف الجديدة
const {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  archiveClient, // تحديث هنا
} = require('../controllers/clientController');

router.use(protect); // حماية جميع المسارات

router.route('/')
  .get(getAllClients)
  .post(createClient);

router.route('/:id')
  .get(getClientById)
  .put(updateClient)
  .delete(archiveClient); // تحديث هنا

module.exports = router;