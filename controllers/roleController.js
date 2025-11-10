// controllers/roleController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendEmail } = require('../services/emailService');

// ===============================================
// 1. إنشاء دور جديد (لشاشة 903)
// POST /api/roles
// ===============================================
const createRole = async (req, res) => {
  try {
    // البيانات من واجهة 903
    const { code, nameAr, nameEn, description, level, department, responsibilities } = req.body;

    if (!code || !nameAr) {
      return res.status(400).json({ message: 'الرمز واسم الدور (عربي) مطلوبان' });
    }

    const newRole = await prisma.jobRole.create({
      data: {
        code,
        nameAr,
        nameEn,
        description,
        level,
        department,
        responsibilities,
        modifiedBy: req.employee.name, // الموظف الذي أنشأ الدور
      },
    });
    res.status(201).json(newRole);

  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'رمز (Code) الدور مستخدم بالفعل' });
    }
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

// ===============================================
// 2. جلب جميع الأدوار (لشاشة 903)
// GET /api/roles
// ===============================================
const getAllRoles = async (req, res) => {
  try {
    const roles = await prisma.jobRole.findMany({
      include: {
        // لجلب عدد الموظفين والصلاحيات (مهم للواجهة)
        _count: {
          select: { employees: true, permissions: true },
        },
      },
      orderBy: {
        createdDate: 'asc',
      },
    });
    res.status(200).json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

// ===============================================
// 3. إسناد موظف إلى دور (شاشة 903 - تاب 04)
// POST /api/roles/assign-employee
// ===============================================
const assignEmployeeToRole = async (req, res) => {
  try {
    const { employeeId, roleId } = req.body;

    if (!employeeId || !roleId) {
      return res.status(400).json({ message: 'employeeId و roleId مطلوبان' });
    }

    // 1. ربط الموظف بالدور
    await prisma.jobRole.update({
      where: { id: roleId },
      data: {
        employees: {
          connect: { id: employeeId }, // "connect" تضيف الربط
        },
      },
    });

    // --- 2. إرسال إيميل إشعار (الخطوة الجديدة) ---
    try {
      // جلب بيانات الموظف والدور
      const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: { email: true, name: true }
      });
      
      const role = await prisma.jobRole.findUnique({
          where: { id: roleId },
          select: { nameAr: true }
      });

      if (employee && role && employee.email) {
        const subject = `تهانينا! تم إسناد دور جديد لك`;
        const htmlBody = `
          <div>
            <h1>مرحباً ${employee.name},</h1>
            <p>لقد تم إسناد دور وظيفي جديد لك في النظام:</p>
            <h2 style="color: #007bff;">${role.nameAr}</h2>
            <p>يمكنك الآن تسجيل الدخول للاطلاع على صلاحياتك الجديدة.</p>
            <p>مع تحيات،<br>إدارة النظام</p>
          </div>
        `;
        
        // إرسال الإيميل في الخلفية (لا ننتظر الرد)
        sendEmail(employee.email, subject, htmlBody);
      }
    } catch (emailError) {
      // نسجل الخطأ فقط ولا نوقف العملية الأساسية
      console.error("Failed to send assignment email:", emailError);
    }
    // ----------------------------------------

    res.status(200).json({ message: 'تم إسناد الموظف للدور بنجاح' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

// ===============================================
// 4. إزالة موظف من دور (شاشة 903)
// POST /api/roles/remove-employee
// ===============================================
const removeEmployeeFromRole = async (req, res) => {
    try {
      const { employeeId, roleId } = req.body;
  
      if (!employeeId || !roleId) {
        return res.status(400).json({ message: 'employeeId و roleId مطلوبان' });
      }
  
      // هذه هي طريقة Prisma لفك ربط علاقة Many-to-Many
      const updatedRole = await prisma.jobRole.update({
        where: { id: roleId },
        data: {
          employees: {
            disconnect: { id: employeeId }, // "disconnect" تزيل الربط
          },
        },
      });
      res.status(200).json(updatedRole);
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  };

// (يمكن إضافة GetById, Update, Delete بنفس طريقة المشاريع)

module.exports = {
  createRole,
  getAllRoles,
  assignEmployeeToRole,
  removeEmployeeFromRole
};