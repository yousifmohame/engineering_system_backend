const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. جلب جميع المهام (مع البيانات التفصيلية)
const getAllTasks = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        // لجلب بيانات الموظف المسند إليه
        assignedTo: {
          select: {
            id: true,
            name: true,
            employeeCode: true
          }
        },
        // لجلب بيانات المعاملة
        transaction: {
          select: {
            id: true,
            transactionCode: true,
            description: true // (أو أي حقل يمثل "العنوان")
          }
        }
      }
    });

    // 💡 إعادة هيكلة البيانات لتطابق الواجهة الأمامية
    const detailedTasks = tasks.map(task => ({
      ...task,
      taskNumber: task.id, // يمكنك تغييره إذا كان لديك حقل مخصص
      transactionTitle: task.transaction?.description || 'معاملة غير معنونة',
      transactionCode: task.transaction?.transactionCode || 'N/A',
      // ... باقي الحقول موجودة بالفعل
    }));

    res.status(200).json(detailedTasks); // إرسال البيانات المفصلة

  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
};

// 2. إنشاء مهمة جديدة
const createTask = async (req, res) => {
  try {
    const {
      transactionCode,
      transactionTitle, // (هذا الحقل غير موجود في نموذج المهمة، هو مرتبط بالمعاملة)
      taskType,
      description,
      assignedToId,
      startDate,
      dueDate,
      priority,
      estimatedHours,
      notes,
      status
    } = req.body;

    // --- (مهم) ربط المعاملة الصحيحة ---
    // (نفترض أن الواجهة سترسل 'transactionCode' بدلاً من 'transactionTitle')
    const transaction = await prisma.transaction.findUnique({
      where: { transactionCode: transactionCode }
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    // ------------------------------------

    const newTask = await prisma.task.create({
      data: {
        title: description, // (نموذج Prisma يستخدم "title" وليس "description")
        description: notes, // (أو العكس، بناءً على schema.prisma)
        status: status || 'Pending',
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority,
        estimatedHours: estimatedHours,
        
        transaction: {
          connect: { id: transaction.id }
        },
        assignedTo: {
          connect: { id: assignedToId }
        }
        // ... (تحتاج لإضافة 'assignedById' من req.user)
      }
    });
    res.status(201).json(newTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
};

// 3. جلب مهمة واحدة
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await prisma.task.findUnique({
      where: { id },
      include: { assignedTo: true, transaction: true } // (جلب البيانات المرتبطة)
    });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task', error: error.message });
  }
};

// 4. تحديث مهمة (عام)
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await prisma.task.update({
      where: { id },
      data: req.body
    });
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
};

// 5. حذف مهمة
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.task.delete({
      where: { id }
    });
    res.status(200).json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
};

// --- (دوال إضافية للـ Dialogs) ---

// 6. تحديث حالة المهمة (للإلغاء، الإكمال، التجميد)
const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, ...otherData } = req.body; // (مثل: frozenReason, progress)

    const task = await prisma.task.update({
      where: { id },
      data: {
        status: status,
        notes: notes,
        ...otherData // (لتمرير أي بيانات إضافية مثل التجميد أو نسبة الإنجاز)
      }
    });
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task status', error: error.message });
  }
};

// 7. تحويل مهمة (تغيير الموظف)
const transferTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { newEmployeeId, transferReason } = req.body;
    // const transferBy = req.user.id; // (المشرف الذي قام بالتحويل)

    const task = await prisma.task.update({
      where: { id },
      data: {
        assignedToId: newEmployeeId,
        // (يمكن إضافة سجل للتحويل في الملاحظات)
        notes: `تم التحويل إلى موظف جديد. السبب: ${transferReason}`
      }
    });
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error transferring task', error: error.message });
  }
};


// (تصدير جميع الدوال)
module.exports = {
  getAllTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
  transferTask
};