// controllers/taskController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ===============================================
// 1. إنشاء مهمة جديدة (وربطها بمعاملة)
// POST /api/tasks
// ===============================================
const createTask = async (req, res) => {
  try {
    // transactionId هو المعرّف للمعاملة التي تنتمي لها هذه المهمة
    const { title, description, dueDate, transactionId, assignedToId } = req.body;

    if (!title || !transactionId) {
      return res.status(400).json({ message: 'العنوان ومعرّف المعاملة (transactionId) مطلوبان' });
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        transactionId,
        assignedToId, // يمكن إسنادها مباشرة أو لاحقاً
      },
    });
    res.status(201).json(newTask);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

// ===============================================
// 2. جلب جميع المهام الخاصة بمعاملة معينة
// GET /api/tasks/transaction/:transactionId
// ===============================================
const getTasksForTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const tasks = await prisma.task.findMany({
      where: {
        transactionId: transactionId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      // جلب اسم الموظف المسندة إليه المهمة
      include: {
        assignedTo: {
          select: { name: true, employeeCode: true },
        },
      },
    });
    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

// ===============================================
// 3. إسناد مهمة لموظف (وظيفة شاشة 825)
// PUT /api/tasks/:taskId/assign
// ===============================================
const assignTaskToEmployee = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { employeeId } = req.body; // معرّف الموظف الجديد

    if (!employeeId) {
      return res.status(400).json({ message: 'معرّف الموظف (employeeId) مطلوب' });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        assignedToId: employeeId,
        status: 'Assigned', // تغيير الحالة تلقائياً إلى "مسندة"
      },
      include: {
        assignedTo: {
          select: { name: true, employeeCode: true }
        }
      }
    });
    res.status(200).json(updatedTask);

  } catch (error) {
    if (error.code === 'P2025') {
        return res.status(404).json({ message: 'المهمة غير موجودة' });
    }
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

// ===============================================
// 4. تحديث حالة المهمة
// PUT /api/tasks/:taskId/status
// ===============================================
const updateTaskStatus = async (req, res) => {
    try {
      const { taskId } = req.params;
      const { status } = req.body; // الحالة الجديدة (Pending, Completed, etc.)
  
      if (!status) {
        return res.status(400).json({ message: 'الحالة (status) مطلوبة' });
      }
  
      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          status: status,
        },
      });
      res.status(200).json(updatedTask);
  
    } catch (error) {
      if (error.code === 'P2025') {
          return res.status(404).json({ message: 'المهمة غير موجودة' });
      }
      console.error(error);
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  };

// ===============================================
// 5. حذف مهمة
// DELETE /api/tasks/:taskId
// ===============================================
const deleteTask = async (req, res) => {
    try {
      const { taskId } = req.params;
      await prisma.task.delete({
        where: { id: taskId },
      });
      res.status(200).json({ message: 'تم حذف المهمة بنجاح' });
  
    } catch (error) {
      if (error.code === 'P2025') {
          return res.status(404).json({ message: 'المهمة غير موجودة' });
      }
      console.error(error);
      res.status(500).json({ message: 'خطأ في الخادم' });
    }
  };

// تصدير جميع الوظائف
module.exports = {
  createTask,
  getTasksForTransaction,
  assignTaskToEmployee,
  updateTaskStatus,
  deleteTask,
};