// controllers/clientController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ===============================================
// 1. إنشاء عميل جديد (يطابق شاشة 300 - v19)
// POST /api/clients
// ===============================================
const createClient = async (req, res) => {
  try {
    // 1. استقبال البيانات المعقدة من الواجهة
    const { 
      clientCode, 
      mobile, 
      email, 
      idNumber,
      name,         // (Json Object)
      contact,      // (Json Object)
      address,      // (Json Object)
      identification, // (Json Object)
      type,
      category,
      nationality,
      occupation,
      company,
      taxNumber,
      rating,
      secretRating
    } = req.body;

    // 2. التحقق من الحقول الفريدة (Top-level)
    if (!clientCode || !mobile || !idNumber || !name) {
      return res.status(400).json({ message: 'كود العميل، الجوال، رقم الهوية، والاسم مطلوبات' });
    }

    // 3. إنشاء العميل
    const newClient = await prisma.client.create({
      data: {
        clientCode,
        mobile,
        email,
        idNumber,
        
        // 4. حفظ الكائنات (Objects) كما هي في حقول Json
        name,
        contact,
        address,
        identification,

        // 5. باقي البيانات
        type,
        category,
        nationality,
        occupation,
        company,
        taxNumber,
        rating,
        secretRating,
        createdBy: req.employee.name, // الموظف الذي أنشأ العميل
      },
    });
    res.status(201).json(newClient);

  } catch (error) {
    if (error.code === 'P2002') { // خطأ بيانات مكررة
      const field = error.meta.target.join(', ');
      return res.status(400).json({ message: `خطأ: ${field} مستخدم بالفعل` });
    }
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

// ===============================================
// 2. جلب جميع العملاء (يطابق شاشة 300 - v19)
// GET /api/clients
// ===============================================
const getAllClients = async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      // جلب عدد المعاملات (كما تطلب الواجهة v19)
      include: {
        _count: {
          select: { transactions: true, contracts: true, quotations: true },
        },
      },
    });
    
    // ملاحظة: Prisma ستعيد حقول Json (name, contact...)
    // ككائنات JavaScript، تماماً كما تحتاجها الواجهة
    res.status(200).json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

// ===============================================
// 3. جلب بيانات عميل واحد (لشاشة 300 - البروفايل)
// GET /api/clients/:id
// ===============================================
const getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await prisma.client.findUnique({
      where: { id: id },
      include: {
        transactions: true, // جلب المعاملات (كما تطلب الواجهة v19)
        contracts: true,
        quotations: true,
      },
    });

    if (!client) {
      return res.status(404).json({ message: 'العميل غير موجود' });
    }
    res.status(200).json(client);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

// ===============================================
// 4. تحديث بيانات عميل (يطابق شاشة 300 - التابات)
// PUT /api/clients/:id
// ===============================================
const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    
    // استقبال جميع البيانات المحدثة (بما في ذلك كائنات Json)
    const { 
        clientCode, 
        mobile, 
        email, 
        idNumber,
        name, contact, address, identification, // Json Objects
        type, category, nationality, occupation, 
        company, taxNumber, rating, secretRating, grade,
        gradeScore, completionPercentage, isActive, notes 
    } = req.body;

    const updatedClient = await prisma.client.update({
      where: { id: id },
      data: {
        clientCode, 
        mobile, 
        email, 
        idNumber,
        name, // تحديث كائن Json بالكامل
        contact,
        address,
        identification,
        type, category, nationality, occupation, 
        company, taxNumber, rating, secretRating, grade,
        gradeScore, completionPercentage, isActive, notes
      },
    });
    res.status(200).json(updatedClient);

  } catch (error) {
    if (error.code === 'P2025') { 
        return res.status(404).json({ message: 'العميل غير موجود' });
    }
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

// ===============================================
// 5. أرشفة عميل (بدلاً من الحذف)
// DELETE /api/clients/:id
// ===============================================
const archiveClient = async (req, res) => {
  try {
    const { id } = req.params;
    
    // تغيير الحالة إلى "غير نشط" بدلاً من الحذف
    // هذا يطابق حقل "isActive" في الواجهة v19
    const archivedClient = await prisma.client.update({
      where: { id: id },
      data: {
        isActive: false,
      },
    });
    res.status(200).json({ message: 'تم أرشفة العميل بنجاح', client: archivedClient });

  } catch (error) {
    if (error.code === 'P2025') {
        return res.status(404).json({ message: 'العميل غير موجود' });
    }
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

// تصدير جميع الوظائف
module.exports = {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  archiveClient, // تم التغيير من deleteClient
};