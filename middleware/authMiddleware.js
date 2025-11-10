// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const employee = await prisma.employee.findUnique({
        where: { id: decoded.id },
      });

      if (!employee) {
        return res.status(401).json({ message: 'غير مصرح لك، لم يتم العثور على الموظف' });
      }

      delete employee.password;

      // ✅ لاحظ التغيير هنا
      req.user = employee;

      next();

    } catch (error) {
      console.error(error);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'غير مصرح لك، التوكن غير صالح' });
      }
      return res.status(500).json({ message: 'خطأ في الخادم' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'غير مصرح لك، لا يوجد توكن' });
  }
};

module.exports = { protect };
