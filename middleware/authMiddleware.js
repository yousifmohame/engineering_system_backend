// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const protect = async (req, res, next) => {
  let token;

  // 1. التحقق من وجود التوكن في الـ Header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. استخراج التوكن (بعد كلمة "Bearer ")
      token = req.headers.authorization.split(' ')[1];

      // 3. التحقق من صحة التوكن
      // سيقوم بفك تشفير التوكن باستخدام المفتاح السري
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. جلب بيانات الموظف من قاعدة البيانات
      // (نحن نخزن ID الموظف داخل التوكن)
      const employee = await prisma.employee.findUnique({
        where: { id: decoded.id },
      });
      
      if (!employee) {
        return res.status(401).json({ message: 'غير مصرح لك، لم يتم العثور على الموظف' });
      }
      
      // 5. إرفاق بيانات الموظف (بدون كلمة المرور) في الطلب (req)
      // هذا يعني أن أي API محمي سيتمكن من معرفة من هو المستخدم
      delete employee.password;
      req.employee = employee;

      // 6. السماح للطلب بالمرور إلى الـ API التالي
      next();

    } catch (error) {
      console.error(error);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'غير مصرح لك، التوكن غير صالح' });
      }
      return res.status(500).json({ message: 'خطأ في الخادم' });
    }
  }

  // إذا لم يتم إرسال أي توكن
  if (!token) {
    res.status(401).json({ message: 'غير مصرح لك، لا يوجد توكن' });
  }
};

module.exports = { protect };