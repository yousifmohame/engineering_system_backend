// routes/auth.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// ===============================================
// 1. نقطة التسجيل (إنشاء موظف جديد)
// POST /api/auth/register
// ===============================================
router.post('/register', async (req, res) => {
  try {
    // استقبال البيانات من الواجهة (شاشة 817)
    const { 
      email, 
      password, 
      name, 
      nationalId, 
      phone, 
      position, 
      department,
      nameEn,
      hireDate,
      baseSalary,
      type,
      nationality
    } = req.body;

    // --- التحقق الأساسي (يمكن إضافة المزيد) ---
    if (!email || !password || !name || !nationalId || !phone || !position || !department) {
      return res.status(400).json({ message: 'الرجاء إدخال جميع الحقول المطلوبة' });
    }

    // --- تشفير كلمة المرور ---
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // --- إنشاء الموظف في قاعدة البيانات ---
    const newEmployee = await prisma.employee.create({
      data: {
        email,
        password: hashedPassword,
        name,
        nationalId,
        phone,
        position,
        department,
        nameEn,
        hireDate: hireDate ? new Date(hireDate) : new Date(), // تحويل التاريخ
        baseSalary,
        type,
        nationality
      },
    });

    // إزالة كلمة المرور من الرد
    delete newEmployee.password;

    res.status(201).json({ 
      message: 'تم إنشاء الموظف بنجاح', 
      employee: newEmployee 
    });

  } catch (error) {
    // P2002 هو كود Prisma للبيانات المكررة (Unique constraint)
    if (error.code === 'P2002') {
      const field = error.meta.target.join(', '); // (email, nationalId, phone)
      return res.status(400).json({ message: `خطأ: ${field} مستخدم بالفعل` });
    }
    
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});


// ===============================================
// 2. نقطة تسجيل الدخول
// POST /api/auth/login
// ===============================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // --- البحث عن الموظف ---
    const employee = await prisma.employee.findUnique({
      where: { email },
    });

    if (!employee) {
      return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    // --- التحقق من كلمة المرور ---
    const isMatch = await bcrypt.compare(password, employee.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    // --- إنشاء التوكن (JWT) ---
    const payload = {
      id: employee.id, // هذا هو أهم شيء
      // يمكن إضافة الأدوار هنا لاحقاً
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1d', // مدة صلاحية التوكن (يوم واحد)
    });

    // إزالة كلمة المرور من بيانات الموظف قبل إرسالها
    delete employee.password;

    // --- إرسال الرد ---
    res.status(200).json({
      message: 'تم تسجيل الدخول بنجاح',
      token: `Bearer ${token}`, // إرسال التوكن للواجهة
      employee: employee, // إرسال بيانات الموظف
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});


module.exports = router; // تصدير الـ router ليستخدمه server.js