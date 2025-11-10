// middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// تحديد مجلد الحفظ
const uploadDir = './uploads';

// التأكد من وجود مجلد 'uploads'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// إعدادات التخزين
const storage = multer.diskStorage({
  // أين سيتم حفظ الملف
  destination: (req, file, cb) => {
    cb(null, uploadDir); // احفظ في مجلد 'uploads'
  },
  // كيف سيتم تسمية الملف
  filename: (req, file, cb) => {
    // إنشاء اسم فريد (الوقت الحالي + اسم الملف الأصلي)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// (اختياري) فلترة الملفات للسماح بأنواع معينة فقط
const fileFilter = (req, file, cb) => {
  // يمكنك هنا تحديد أنواع الملفات المسموحة
  // (PDF, JPG, PNG, ...إلخ)
  cb(null, true); // السماح بجميع الملفات حالياً
};

const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter 
});

module.exports = upload;