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
// في ملف controllers/transactionController.js
const convertFlatFeesToCategories = (flatFees) => {

  if (!Array.isArray(flatFees)) {
    return [];
  }
  
  const groups = {};
  flatFees.forEach((fee, idx) => {

    const categoryName = fee.authority || 'رسوم عامة';
    
    if (!groups[categoryName]) {
      groups[categoryName] = [];
    }
    
    groups[categoryName].push({
      id: `fee-tmpl-${idx}`,
      name: fee.name,
      amount: fee.amount || 0,
      paid: 0,
      remaining: fee.amount || 0,
      status: 'pending'
    });
  });

  const result = Object.keys(groups).map((key, idx) => ({
    id: `cat-${idx}`,
    category: key,
    items: groups[key]
  }));
  return result;
};


const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        client: true,
        transactionType: true,
        project: true,
        contract: true,
        tasks: {
          include: { assignedTo: { select: { name: true, employeeCode: true } } }
        },
        attachments: {
          include: { uploadedBy: { select: { name: true } } }
        },
        documents: true,
        payments: true,
        appointments: true,
        transactionEmployees: {
          include: {
            employee: { // (اختياري) لجلب بيانات الموظف مباشرة من العلاقة
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                position: true
              }
            }
          }
        },
      },
    });

    if (!transaction) {
      return res.status(404).json({ message: 'المعاملة غير موجودة' });
    }

    // --- المنطق الذكي لجلب التكاليف ---
    let finalCosts = [];

    if (transaction.fees && Array.isArray(transaction.fees) && transaction.fees.length > 0) {

      if (transaction.fees[0].items) {
        finalCosts = transaction.fees;
      } else {
        finalCosts = convertFlatFeesToCategories(transaction.fees);
      }
    } 
    else if (transaction.transactionType && transaction.transactionType.fees) {
      finalCosts = convertFlatFeesToCategories(transaction.transactionType.fees);
    } else {
      console.log("⚠️ No fees found in transaction or template.");
    }

    const responseData = {
      ...transaction,
      costDetails: finalCosts 
    };

    res.json(responseData);

  } catch (error) {
    res.status(500).json({ message: 'خطأ في الخادم', error: error.message });
  }
};


// ===============================================
// 4. تحديث بيانات معاملة (مثل تغيير الحالة)
// PUT /api/transactions/:id
// ===============================================
// controllers/transactionController.js

// controllers/transactionController.js

const updateTransaction = async (req, res) => {
  const { id } = req.params;
  
  // 1. نفصل الحقول الخاصة (costDetails, type) عن باقي البيانات
  const { costDetails, type, ...otherData } = req.body;

  try {
    // 2. نجهز كائن البيانات للتحديث
    let updateData = { ...otherData };

    // ✅ معالجة مشكلة 'type' -> تحويلها إلى 'transactionTypeId'
    if (type) {
        updateData.transactionTypeId = type;
    }
    // (ملاحظة: المتغير 'type' تم فصله في الخطوة 1، لذا لن يدخل في updateData، وهذا يحل الخطأ)

    // 3. معالجة التكاليف (costDetails -> fees)
    if (costDetails) {
       updateData.fees = costDetails; // حفظ الهيكل في حقل fees

       // تحديث الحقول المالية المسطحة
       const totalFees = costDetails.reduce((sum, cat) => sum + cat.items.reduce((s, i) => s + (i.amount||0), 0), 0);
       const paidAmount = costDetails.reduce((sum, cat) => sum + cat.items.reduce((s, i) => s + (i.paid||0), 0), 0);
       const remainingAmount = totalFees - paidAmount;

       updateData.totalFees = totalFees;
       updateData.paidAmount = paidAmount;
       updateData.remainingAmount = remainingAmount;
    }

    // 4. تنظيف البيانات (حذف الحقول التي لا يجب تحديثها أو التي تسبب مشاكل)
    delete updateData.id; 
    delete updateData.client; 
    delete updateData.clientId; // عادة لا نغير العميل، لكن يمكن تركه إذا كان مطلوباً
    delete updateData.transactionCode; 
    delete updateData.transactionType; // علاقة لا يمكن تحديثها مباشرة
    
    // تحويل الأرقام (لضمان السلامة)
    if (updateData.progress) updateData.progress = parseFloat(updateData.progress);
    if (updateData.totalFees) updateData.totalFees = parseFloat(updateData.totalFees);

    // 5. تنفيذ التحديث
    const updatedTransaction = await prisma.transaction.update({
      where: { id: id },
      data: updateData,
    });

    res.status(200).json(updatedTransaction);

  } catch (error) {
    if (error.code === 'P2025') {
        return res.status(404).json({ message: 'المعاملة غير موجودة' });
    }
    console.error("Error updating transaction:", error);
    res.status(500).json({ message: 'خطأ في الخادم', error: error.message });
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


// ✅ دالة جديدة لجلب رسوم القالب
// في controllers/transactionController.js

const getTemplateFees = async (req, res) => {
  const { typeId } = req.params;
  
  // 1. تتبع الدخول للدالة والـ ID المستلم
  console.log("➡️ START: getTemplateFees called");
  console.log("👉 Received typeId:", typeId);

  try {
    // 2. محاولة الجلب من قاعدة البيانات
    const transactionType = await prisma.transactionType.findUnique({
      where: { id: typeId },
      select: {
        id: true,
        name: true,
        fees: true,         // الرسوم البسيطة القديمة
        defaultCosts: true, // الرسوم المعقدة الجديدة (JSON)
      }
    });

    // 3. عرض النتيجة الخام من قاعدة البيانات
    console.log("🔍 DB Result (transactionType):", transactionType ? "Found" : "Null");
    if (transactionType) {
        console.log("   - Has defaultCosts?", !!transactionType.defaultCosts);
        console.log("   - defaultCosts Length:", Array.isArray(transactionType.defaultCosts) ? transactionType.defaultCosts.length : "N/A");
        console.log("   - Has fees?", !!transactionType.fees);
        console.log("   - fees Length:", Array.isArray(transactionType.fees) ? transactionType.fees.length : "N/A");
    }

    if (!transactionType) {
      console.log("❌ Error: Transaction Type not found in DB");
      return res.status(404).json({ message: 'نوع المعاملة غير موجود' });
    }

    // 4. فحص منطق الإرجاع

    // الحالة أ: استخدام الهيكل المعقد (defaultCosts)
    if (transactionType.defaultCosts && Array.isArray(transactionType.defaultCosts) && transactionType.defaultCosts.length > 0) {
      console.log("✅ SUCCESS: Returning 'defaultCosts' from DB");
      console.log("📦 Payload:", JSON.stringify(transactionType.defaultCosts, null, 2)); // طباعة البيانات المرسلة
      return res.json(transactionType.defaultCosts);
    }

    // الحالة ب: استخدام الهيكل البسيط (fees) وتحويله
    if (transactionType.fees && Array.isArray(transactionType.fees) && transactionType.fees.length > 0) {
      console.log("⚠️ INFO: 'defaultCosts' is empty. Falling back to simple 'fees'.");
      
      const mappedFees = [
        {
          id: 'cat-default',
          category: 'الرسوم الأساسية',
          items: transactionType.fees.map((fee, index) => ({
            id: `fee-${index}`,
            name: fee.name,
            amount: fee.amount || 0,
            paid: 0,
            remaining: fee.amount || 0,
            status: 'pending'
          }))
        }
      ];
      console.log("✅ SUCCESS: Returning mapped 'fees'");
      return res.json(mappedFees);
    }

    // الحالة ج: لا يوجد بيانات
    console.log("⚠️ WARNING: No fees found in either 'defaultCosts' or 'fees'. Returning empty array.");
    return res.json([]);

  } catch (error) {
    console.error("❌ FATAL ERROR in getTemplateFees:", error);
    res.status(500).json({ message: 'فشل في جلب رسوم القالب', error: error.message });
  }
};

// ✅ دالة جديدة لتحديث مهام المعاملة
const updateTransactionTasks = async (req, res) => {
  const { id } = req.params;
  const { tasks } = req.body; // مصفوفة المهام من الفرونت إند

  try {
    // 1. جلب المهام الموجودة حالياً في قاعدة البيانات لهذه المعاملة
    const existingTasks = await prisma.task.findMany({
      where: { transactionId: id },
      select: { id: true }
    });
    const existingIds = existingTasks.map(t => t.id);

    // 2. تحديد المهام التي يجب حذفها (موجودة في DB وغير موجودة في القائمة الجديدة)
    // ملاحظة: نفترض أن الفرونت إند يرسل الـ ID الصحيح للمهام الموجودة
    const incomingIds = tasks.filter(t => t.id && existingIds.includes(t.id)).map(t => t.id);
    const idsToDelete = existingIds.filter(eid => !incomingIds.includes(eid));

    // 3. تنفيذ العمليات داخل Transaction لضمان السلامة
    await prisma.$transaction(async (tx) => {
      // أ) حذف المهام المحذوفة
      if (idsToDelete.length > 0) {
        await tx.task.deleteMany({
          where: { id: { in: idsToDelete } }
        });
      }

      // ب) إنشاء أو تحديث المهام
      for (const task of tasks) {
        const taskData = {
          title: task.name, // تعيين الاسم للعنوان
          priority: task.priority,
          status: task.status === 'in-progress' ? 'In Progress' : (task.status === 'completed' ? 'Completed' : 'Pending'),
          // إذا كان الموظف مسنداً
          assignedToId: task.assignedToId || null,
          transactionId: id,
          // ملاحظة: إذا لم يكن لديك حقل duration في قاعدة البيانات، يمكنك تخزينه في الوصف مؤقتاً
          // description: `Duration: ${task.duration} days`, 
        };

        if (task.id && existingIds.includes(task.id)) {
          // تحديث
          await tx.task.update({
            where: { id: task.id },
            data: taskData
          });
        } else {
          // إنشاء جديد
          await tx.task.create({
            data: taskData
          });
        }
      }
    });

    res.json({ message: 'تم تحديث المهام بنجاح' });

  } catch (error) {
    console.error("Error updating tasks:", error);
    res.status(500).json({ message: 'فشل في تحديث المهام', error: error.message });
  }
};

// controllers/transactionController.js

const updateTransactionStaff = async (req, res) => {
  const { id } = req.params;
  const { staff } = req.body;

  try {
    // نمرر 'tx' (transaction client) للدالة الداخلية
    const result = await prisma.$transaction(async (tx) => {
      
      // 1. حذف القديم باستخدام tx
      await tx.transactionEmployee.deleteMany({
        where: { transactionId: id }
      });

      // 2. إضافة الجديد
      if (staff && staff.length > 0) {
        await tx.transactionEmployee.createMany({
          data: staff.map(s => ({
            transactionId: id,
            employeeId: s.employeeId,
            role: s.role
          }))
        });
      }

      // 3. إرجاع البيانات المحدثة
      return tx.transaction.findUnique({
        where: { id },
        include: {
          transactionEmployees: {
            include: { employee: true }
          }
        }
      });
    });

    res.json(result);
  } catch (error) {
    console.error('Error updating transaction staff:', error);
    res.status(500).json({ error: 'Failed to update staff', details: error.message });
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
  getTemplateFees,
  updateTransactionTasks,
  updateTransactionStaff,
};