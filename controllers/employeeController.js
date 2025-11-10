// controllers/employeeController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ===============================================
// 1. جلب الموظف الحالي (من الـ Token)
// GET /api/employees/me
// ===============================================
const getMe = (req, res) => {
  // هذه الوظيفة نأخذها من (protect middleware)
  // req.employee تم إرفاقه في الوسيط
  if (req.employee) {
    res.status(200).json(req.employee);
  } else {
    res.status(404).json({ message: 'لم يتم العثور على الموظف' });
  }
};

// ===============================================
// 2. جلب جميع الموظفين (لشاشة 817 - القائمة)
// GET /api/employees
// ===============================================
const getAllEmployees = async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      // لا نرسل كلمة المرور
      select: {
        id: true,
        employeeCode: true,
        name: true,
        nameEn: true,
        nationalId: true,
        email: true,
        phone: true,
        position: true,
        department: true,
        hireDate: true,
        baseSalary: true,
        jobLevel: true,
        type: true,
        status: true,
        nationality: true,
        gosiNumber: true,
        iqamaNumber: true,
        performanceRating: true,
        frozenUntil: true,
        frozenReason: true,
        createdAt: true,
        updatedAt: true,
        roles: true, // جلب الأدوار المرتبطة
        // جلب عدد الصلاحيات الخاصة
        _count: {
            select: { specialPermissions: true }
        }
      },
    });
    res.status(200).json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

// ===============================================
// 3. تحديث بيانات موظف (لشاشة 817 - تعديل)
// PUT /api/employees/:id
// ===============================================
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // (ملاحظة: لا نسمح بتحديث كلمة المرور من هنا)
    delete data.password; 
    // (ولا نسمح بتحديث البريد أو الرقم القومي بسهولة)
    delete data.email;
    delete data.nationalId;

    const updatedEmployee = await prisma.employee.update({
      where: { id: id },
      data: data,
    });
    res.status(200).json(updatedEmployee);

  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'الموظف غير موجود' });
    }
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

// ===============================================
// 4. حذف موظف (أو أرشفته)
// DELETE /api/employees/:id
// ===============================================
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    // الأفضل هو "تعطيل" الحساب بدلاً من الحذف الكامل
    // لأن الموظف مرتبط ببيانات تاريخية (معاملات، مهام، ...إلخ)
    
    const archivedEmployee = await prisma.employee.update({
        where: { id: id },
        data: {
            status: 'inactive', // تغيير الحالة إلى "غير نشط"
        }
    });

    res.status(200).json({ message: 'تم أرشفة الموظف بنجاح', employee: archivedEmployee });

  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'الموظف غير موجود' });
    }
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};


// تصدير جميع الوظائف
module.exports = {
  getMe,
  getAllEmployees,
  updateEmployee,
  deleteEmployee,
};