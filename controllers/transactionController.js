// controllers/transactionController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ===============================================
// 1. إنشاء معاملة جديدة (شاشة 286)
// POST /api/transactions
// ===============================================
const createTransaction = async (req, res) => {
  try {
    // استقبال جميع البيانات من الواجهة v19
    const { 
      transactionCode, 
      clientId,     // (مطلوب)
      type,
      category,
      projectClassification,
      status,
      statusColor,
      priority,
      location,
      deedNumber,
      progress,
      description,
      projectId,    // (اختياري)
      contractId,   // (اختياري)
      totalFees,
      paidAmount,
      remainingAmount
    } = req.body;

    if (!transactionCode || !clientId) {
      return res.status(400).json({ message: 'رقم المعاملة ومعرّف العميل (clientId) مطلوبان' });
    }

    const newTransaction = await prisma.transaction.create({
      data: {
        transactionCode,
        clientId,
        type,
        category,
        projectClassification,
        status: status || 'Draft',
        statusColor: statusColor || '#6b7280',
        priority: priority || 'متوسط',
        location,
        deedNumber,
        progress: progress ? parseFloat(progress) : 0,
        description,
        projectId,
        contractId,
        totalFees: totalFees ? parseFloat(totalFees) : 0,
        paidAmount: paidAmount ? parseFloat(paidAmount) : 0,
        remainingAmount: remainingAmount ? parseFloat(remainingAmount) : 0,
      },
    });
    res.status(201).json(newTransaction);

  } catch (error) {
    if (error.code === 'P2002') { // خطأ بيانات مكررة
      return res.status(400).json({ message: `خطأ: رقم المعاملة (transactionCode) مستخدم بالفعل` });
    }
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

// ===============================================
// 2. جلب جميع المعاملات (شاشة 284)
// GET /api/transactions
// ===============================================
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      // جلب البيانات المرتبطة لعرضها في القائمة
      include: {
        client: {
          select: { name: true, clientCode: true } // (Json) اسم العميل
        },
        _count: {
          select: { tasks: true } // عدد المهام
        }
      },
    });
    res.status(200).json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

// ===============================================
// 3. جلب بيانات معاملة واحدة (لعرض التابات 284)
// GET /api/transactions/:id
// ===============================================
const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await prisma.transaction.findUnique({
      where: { id: id },
      include: {
        client: true,     // تفاصيل العميل
        project: true,    // تفاصيل المشروع
        contract: true,   // تفاصيل العقد
        tasks: {          // قائمة المهام المرتبطة (لشاشة 825)
          include: {
            assignedTo: { select: { name: true, employeeCode: true }}
          }
        },
        attachments: {    // المرفقات (لشاشة 901)
          include: {
            uploadedBy: { select: { name: true }}
          }
        }
      },
    });

    if (!transaction) {
      return res.status(404).json({ message: 'المعاملة غير موجودة' });
    }
    res.status(200).json(transaction);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

// ===============================================
// 4. تحديث بيانات معاملة (مثل تغيير الحالة)
// PUT /api/transactions/:id
// ===============================================
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    // استلام كافة البيانات القابلة للتحديث
    const data = req.body;

    // (تنقية البيانات قبل التحديث)
    delete data.id; // لا نسمح بتغيير الـ ID
    delete data.client; // لا نسمح بتغيير العميل (حالياً)
    delete data.clientId;
    
    // تحويل الأرقام
    if (data.progress) data.progress = parseFloat(data.progress);
    if (data.totalFees) data.totalFees = parseFloat(data.totalFees);
    if (data.paidAmount) data.paidAmount = parseFloat(data.paidAmount);
    if (data.remainingAmount) data.remainingAmount = parseFloat(data.remainingAmount);


    const updatedTransaction = await prisma.transaction.update({
      where: { id: id },
      data: data,
    });
    res.status(200).json(updatedTransaction);

  } catch (error) {
    if (error.code === 'P2025') { // كود عدم العثور
        return res.status(404).json({ message: 'المعاملة غير موجودة' });
    }
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

// ===============================================
// 5. حذف معاملة
// DELETE /api/transactions/:id
// ===============================================
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    
    // (ملاحظة: يجب حذف المهام والمرفقات أولاً قبل حذف المعاملة)
    // (سنقوم بذلك في خطوة متقدمة، الآن سنعتمد على الحذف المتتالي إن أمكن)

    await prisma.transaction.delete({
      where: { id: id },
    });
    res.status(200).json({ message: 'تم حذف المعاملة بنجاح' });

  } catch (error) {
    if (error.code === 'P2025') {
        return res.status(404).json({ message: 'المعاملة غير موجودة' });
    }
    if (error.code === 'P2003') { // خطأ المفتاح الأجنبي
        return res.status(400).json({ message: 'لا يمكن حذف المعاملة لأنها مرتبطة بمهام أو مرفقات. يجب حذفها أولاً.' });
    }
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

module.exports = {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};