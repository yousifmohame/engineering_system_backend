// controllers/transactionController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// --- 1. إضافة دالة مساعدة لإنشاء كود المعاملة ---
const generateNextTransactionCode = async () => {
  const year = new Date().getFullYear();
  const prefix = `TR-${year}-`; // النسق المطلوب

  const lastTransaction = await prisma.transaction.findFirst({
    where: {
      transactionCode: {
        startsWith: prefix,
      },
    },
    orderBy: {
      transactionCode: 'desc',
    },
  });

  let nextNumber = 1;

  if (lastTransaction) {
    try {
      const lastNumberStr = lastTransaction.transactionCode.split('-')[2];
      const lastNumber = parseInt(lastNumberStr, 10);
      nextNumber = lastNumber + 1;
    } catch (e) {
      console.error("Failed to parse last transaction code, defaulting to 1", e);
      nextNumber = 1;
    }
  }

  // (نريده 6 أرقام مثل المثال TR-2025-001234)
  const paddedNumber = String(nextNumber).padStart(6, '0');
  return `${prefix}${paddedNumber}`; // TR-2025-000001
};


// ===============================================
// 1. إنشاء معاملة جديدة (شاشة 286) - (مُعدل)
// POST /api/transactions
// ===============================================
const createTransaction = async (req, res) => {
  try {
    // --- 2. تم حذف 'transactionCode' من هنا ---
    const { 
      clientId,     // (مطلوب)
      type,         // (هذا الآن هو transactionTypeId)
      title,        // (مطلوب)
      priority,
      description,
      // (باقي الحقول من الموديل)
      category,
      projectClassification,
      status,
      statusColor,
      location,
      deedNumber,
      progress,
      projectId,
      contractId,
      totalFees,
      paidAmount,
      remainingAmount
    } = req.body;

    // --- 3. تعديل الفحص (لم نعد نطلب transactionCode) ---
    if (!clientId || !title ) {
      return res.status(400).json({ message: 'العميل (clientId)، العنوان (title)' });
    }

    // --- 4. إنشاء الكود تلقائياً ---
    const generatedTransactionCode = await generateNextTransactionCode();

    const newTransaction = await prisma.transaction.create({
      data: {
        transactionCode: generatedTransactionCode, // <-- استخدام الكود المُنشأ
        title, // <-- الحقل الجديد من schema.prisma
        clientId,
        transactionTypeId: type || null, // <-- ربط العلاقة
        priority: priority || 'متوسط',
        description,
        
        // (باقي الحقول)
        category,
        projectClassification,
        status: status || 'Draft',
        statusColor: statusColor || '#6b7280',
        location,
        deedNumber,
        progress: progress ? parseFloat(progress) : 0,
        projectId,
        contractId,
        totalFees: totalFees ? parseFloat(totalFees) : 0,
        paidAmount: paidAmount ? parseFloat(paidAmount) : 0,
        remainingAmount: remainingAmount ? parseFloat(remainingAmount) : 0,
      },
      include: {
        client: { select: { name: true, clientCode: true } }
      }
    });
    
    res.status(201).json(newTransaction);

  } catch (error) {
    if (error.code === 'P2002') { 
      return res.status(400).json({ message: `خطأ: بيانات مكررة` });
    }
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

const generateNextTransactionTypeCode = async () => {
  const prefix = 'TT-'; // Transaction Type
  const lastType = await prisma.transactionType.findFirst({
    where: { code: { startsWith: prefix } },
    orderBy: { code: 'desc' },
  });
  
  let nextNumber = 1;
  if (lastType) {
    try {
      // استخراج الرقم من 'TT-001'
      nextNumber = parseInt(lastType.code.split('-')[1]) + 1;
    } catch (e) { 
      nextNumber = 1; // (fallback)
    }
  }
  // إنشاء كود من 3 أرقام مثل TT-001
  return `${prefix}${String(nextNumber).padStart(3, '0')}`;
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
      include: {
        client: {
          select: { name: true, clientCode: true } // (Json) اسم العميل
        },
        transactionType: { // (تضمين النوع)
          select: { name: true }
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
        transactionType: true, // (تضمين النوع)
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
    const data = req.body;

    // (تنقية البيانات قبل التحديث)
    delete data.id; 
    delete data.client; 
    delete data.clientId;
    delete data.transactionCode; // (مهم: لا نغير الكود)
    
    // (تحديث العلاقة)
    if (data.type) {
      data.transactionTypeId = data.type;
      delete data.type;
    }

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

// ===============================================
// 6. (جديد) جلب أنواع المعاملات (لشاشة 286)
// GET /api/transactions/types
// ===============================================
const getTransactionTypes = async (req, res) => {
  try {
    const types = await prisma.transactionType.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    // تحويلها للشكل الذي يتوقعه السيرفر لوغ
    const simpleList = types.map(t => ({
      id: t.id,
      name: `${t.name} (${t.code})` // (تعديل بسيط ليطابق اللوغ)
    }));
    
    res.json(simpleList);

  } catch (error) {
     res.status(500).json({ message: 'فشل في جلب أنواع المعاملات', error: error.message });
  }
};

const getSimpleTransactionTypes = async (req, res) => {

  try {

    const types = await prisma.transactionType.findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' }
    });
    const simpleList = types.map(t => {
      const formattedName = `${t.name} (${t.code})`;

      return {
        id: t.id,
        name: formattedName
      };
    });

    res.json(simpleList);

  } catch (error) {
    res.status(500).json({
      message: 'فشل في جلب أنواع المعاملات',
      error: error.message
    });
  }
};


// ===============================================
// (جديد) جلب أنواع المعاملات (لشاشة 701 - الجدول الكامل)
// ===============================================
const getFullTransactionTypes = async (req, res) => {
  try {
    const types = await prisma.transactionType.findMany({
      orderBy: { code: 'asc' } // الفرز بالكود
    });
    
    res.json(types); // <-- إرجاع الكائن الكامل

  } catch (error) {
     res.status(500).json({ message: 'فشل في جلب أنواع المعاملات الكاملة', error: error.message });
  }
};

// ===============================================
// 7. (جديد) إنشاء نوع معاملة جديد (لشاشة 701)
// POST /api/transactions/types
// ===============================================
const createTransactionType = async (req, res) => {
  try {
    const { 
      name, description, isActive,
      category, categoryAr, duration, estimatedCost, complexity,
      tasks, documents, authorities, fees, stages, warnings, notes 
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'الاسم مطلوب' });
    }

    const generatedCode = await generateNextTransactionTypeCode();
    console.log(`📦 Creating TransactionType with data: { code: '${generatedCode}', name: '${name}', ... }`);

    const newType = await prisma.transactionType.create({
      data: {
        code: generatedCode,
        name,
        description,
        isActive: isActive ?? true,
        // --- [الإضافات الجديدة] ---
        category,
        categoryAr,
        duration: duration ? parseInt(duration) : 0,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : 0,
        complexity,
        tasks: tasks || [], // (Json)
        documents: documents || [], // (String[])
        authorities: authorities || [], // (String[])
        fees: fees || [], // (Json)
        stages: stages || [], // (Json)
        warnings: warnings || [], // (String[])
        notes: notes || [], // (String[])
      },
    });
    
    console.log(`🎉 TransactionType created successfully:`, newType.id);
    res.status(201).json(newType);

  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: `خطأ: الاسم (${name}) مستخدم بالفعل` });
    }
    console.error("Error creating transaction type:", error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};


// ===============================================
// 8. (جديد) تعديل نوع معاملة (لشاشة 701)
// PUT /api/transactions/types/:id
// ===============================================
const updateTransactionType = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, description, isActive,
      category, categoryAr, duration, estimatedCost, complexity,
      tasks, documents, authorities, fees, stages, warnings, notes 
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'الاسم مطلوب' });
    }

    const updatedType = await prisma.transactionType.update({
      where: { id: id },
      data: {
        name,
        description,
        isActive,
        // --- [الإضافات الجديدة] ---
        category,
        categoryAr,
        duration: duration ? parseInt(duration) : 0,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : 0,
        complexity,
        tasks,
        documents,
        authorities,
        fees,
        stages,
        warnings,
        notes,
      },
    });
    res.status(200).json(updatedType);

  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: `خطأ: الاسم (${name}) مستخدم بالفعل` });
    }
    if (error.code === 'P2025') { 
      return res.status(404).json({ message: 'نوع المعاملة هذا غير موجود' });
    }
    console.error("Error updating transaction type:", error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

// ===============================================
// 9. (جديد) حذف نوع معاملة (لشاشة 701)
// DELETE /api/transactions/types/:id
// ===============================================
const deleteTransactionType = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.transactionType.delete({
      where: { id: id },
    });
    res.status(200).json({ message: 'تم حذف نوع المعاملة بنجاح' });

  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'نوع المعاملة هذا غير موجود' });
    }
    if (error.code === 'P2003') { // خطأ المفتاح الأجنبي
      return res.status(400).json({ message: 'لا يمكن حذف هذا النوع لأنه مستخدم حالياً في معاملات. قم بتغيير نوع المعاملات أولاً.' });
    }
    console.error("Error deleting transaction type:", error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};


module.exports = {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTransactionTypes,
  getSimpleTransactionTypes,
  getFullTransactionTypes,
  createTransactionType,
  updateTransactionType,
  deleteTransactionType,
};