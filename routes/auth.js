// routes/auth.js
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// <--- إضافة: استيراد middleware المصادقة (تأكد من صحة المسار)
const {protect} = require("../middleware/authMiddleware");

const prisma = new PrismaClient();

// ===============================================
// 1. نقطة التسجيل (إنشاء موظف جديد)
// POST /api/auth/register
// (يبقى هذا الجزء كما هو - لا تعديلات)
// ===============================================
router.post("/register", async (req, res) => {
  try {
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
      nationality,
    } = req.body;

    if (
      !email ||
      !password ||
      !name ||
      !nationalId ||
      !phone ||
      !position ||
      !department
    ) {
      return res
        .status(400)
        .json({ message: "الرجاء إدخال جميع الحقول المطلوبة" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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
        hireDate: hireDate ? new Date(hireDate) : new Date(),
        baseSalary,
        type,
        nationality,
      },
    });

    delete newEmployee.password;

    res.status(201).json({
      message: "تم إنشاء الموظف بنجاح",
      employee: newEmployee,
    });
  } catch (error) {
    if (error.code === "P2002") {
      const field = error.meta.target.join(", ");
      return res.status(400).json({ message: `خطأ: ${field} مستخدم بالفعل` });
    }
    console.error(error);
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

// ===============================================
// 2. نقطة تسجيل الدخول ( <--- مُعدلة بالكامل)
// POST /api/auth/login
// ===============================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body; // --- البحث عن الموظف ---

    const employee = await prisma.employee.findUnique({
      where: { email },
    });

    if (!employee) {
      return res
        .status(401)
        .json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
    } // --- التحقق من كلمة المرور ---

    const isMatch = await bcrypt.compare(password, employee.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
    } // --- <--- تعديل: إنشاء التوكن (JWT) ---

    const payload = {
      id: employee.id, // هذا هو أهم شيء
      code: employee.employeeCode, // إضافة كود الموظف // يمكن إضافة الأدوار هنا لاحقاً
    };

    // <--- إضافة: إنشاء Access Token (قصير المدى)
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "15m", // 15 دقيقة
    });

    // <--- إضافة: إنشاء Refresh Token (طويل المدى)
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "30d", // 7 أيام
    });

    // <--- إضافة: تخزين الـ Refresh Token في قاعدة البيانات
    // (يجب إضافة حقل 'refreshToken' في schema.prisma)
    await prisma.employee.update({
      where: { id: employee.id },
      // (الأمان الأفضل: قم بعمل hash للـ token قبل تخزينه)
      data: { refreshToken: refreshToken },
    }); // إزالة كلمة المرور و الـ token من بيانات الموظف قبل إرسالها

    delete employee.password;
    delete employee.refreshToken; // --- <--- تعديل: إرسال الرد ---

    res.status(200).json({
      message: 'تم تسجيل الدخول بنجاح',
      // <--- تعديل: أرسل الـ tokens بدون كلمة "Bearer"
      accessToken: accessToken, 
      refreshToken: refreshToken,
      employee: employee, 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

// ===============================================
// 3. <--- إضافة: نقطة تحديث التوكن (Refresh Token)
// POST /api/auth/refresh
// ===============================================
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token مطلوب" });
  }

  try {
    // 1. التحقق من صلاحية الـ refresh token
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // 2. البحث عن الموظف والتحقق من أن الـ token مطابق للمخزن
    const employee = await prisma.employee.findUnique({
      where: { id: payload.id },
    });

    // (الأمان الأفضل: مقارنة الـ hash)
    if (!employee || employee.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Refresh token غير صالح" });
    }

    // 3. إذا كان كل شيء سليماً، قم بإنشاء Access Token جديد
    const newPayload = {
      id: employee.id,
      code: employee.employeeCode,
    };

    const newAccessToken = jwt.sign(newPayload, process.env.JWT_SECRET, {
      expiresIn: "15m", // 15 دقيقة
    });

    res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    // إذا كان التوكن منتهي الصلاحية أو غير صالح
    return res
      .status(403)
      .json({ message: "Refresh token منتهي الصلاحية أو غير صالح" });
  }
});

// ===============================================
// 4. <--- إضافة: نقطة تسجيل الخروج
// POST /api/auth/logout
// ===============================================
// (نستخدم authMiddleware لجلب 'req.user.id' بأمان)
// (هذا المسار يجب أن يكون محمياً)
router.post("/logout", protect, async (req, res) => {
  try {
    // حذف الـ refresh token من قاعدة البيانات
    await prisma.employee.update({
      where: { id: req.user.id },
      data: { refreshToken: null },
    });

    res.status(200).json({ message: "تم تسجيل الخروج بنجاح" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "خطأ في الخادم أثناء تسجيل الخروج" });
  }
});

module.exports = router; // تصدير الـ router ليستخدمه server.js
