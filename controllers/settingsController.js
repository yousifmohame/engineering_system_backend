const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
/**
 * دالة مساعدة للتأكد من وجود إعدادات افتراضية
 * هذا يمنع حدوث خطأ عند أول تشغيل للنظام
 */
const getOrCreateDefaultSettings = async () => {
  let settings = await prisma.systemSettings.findFirst({
    where: { id: "singleton" },
  });

  if (!settings) {
    console.log("No system settings found, creating default settings...");
    try {
      settings = await prisma.systemSettings.create({
        data: {
          id: "singleton",
          gradingCriteria: {
            totalFeesWeight: 30,
            projectTypesWeight: 20,
            transactionTypesWeight: 15,
            completionRateWeight: 20,
            secretRatingWeight: 15,
          },
          gradeThresholds: {
            gradeA: { min: 80, max: 100 },
            gradeB: { min: 60, max: 79 },
            gradeC: { min: 0, max: 59 },
          },
        },
      });
    } catch (error) {
      console.error("Failed to create default settings:", error);
      // قد يحدث هذا إذا حاول مستخدمان إنشاءها في نفس اللحظة
      settings = await prisma.systemSettings.findFirst({
        where: { id: "singleton" },
      });
    }
  }
  return settings;
};

/**
 * جلب إعدادات النظام
 * GET /api/settings/system
 */
const getSystemSettings = async (req, res) => {
  try {
    const settings = await getOrCreateDefaultSettings();
    res.json(settings);
  } catch (error) {
    console.error("Error fetching system settings:", error);
    res.status(500).json({ error: "Error fetching system settings" });
  }
};

/**
 * جلب جميع أغراض الطلبات (مع إمكانية الفلترة بالنوع)
 * GET /api/settings/request-purposes
 * Query Params: ?type=brief أو ?type=detailed
 */
const getRequestPurposes = async (req, res) => {
  const { type } = req.query;

  try {
    const whereClause = {};
    if (type) {
      whereClause.type = type;
    }

    const purposes = await prisma.requestPurpose.findMany({
      where: whereClause,
      orderBy: { name: 'asc' }
    });
    
    res.json(purposes);
  } catch (error) {
    console.error("Error fetching request purposes:", error);
    res.status(500).json({ error: "Failed to fetch request purposes" });
  }
};

/**
 * إنشاء غرض طلب جديد
 * POST /api/settings/request-purposes
 * Body: { type, name, nameEn, description, icon, color }
 */
const createRequestPurpose = async (req, res) => {
  try {
    const newPurpose = await prisma.requestPurpose.create({
      data: req.body,
    });
    res.status(201).json(newPurpose);
  } catch (error) {
    console.error("Error creating request purpose:", error);
    // معالجة خطأ التكرار (لأننا أضفنا @@unique([type, name]))
    if (error.code === 'P2002') {
      return res.status(409).json({ error: "A purpose with this name and type already exists." });
    }
    res.status(500).json({ error: "Failed to create request purpose" });
  }
};

/**
 * تعديل غرض طلب موجود
 * PUT /api/settings/request-purposes/:id
 * Body: { name, nameEn, description, icon, color, isActive }
 */
const updateRequestPurpose = async (req, res) => {
  const { id } = req.params;
  
  try {
    const updatedPurpose = await prisma.requestPurpose.update({
      where: { id: id },
      data: req.body,
    });
    res.json(updatedPurpose);
  } catch (error) {
    console.error("Error updating request purpose:", error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: "A purpose with this name and type already exists." });
    }
    res.status(500).json({ error: "Failed to update request purpose" });
  }
};

/**
 * حذف غرض طلب
 * DELETE /api/settings/request-purposes/:id
 */
const deleteRequestPurpose = async (req, res) => {
  const { id } = req.params;
  
  try {
    await prisma.requestPurpose.delete({
      where: { id: id },
    });
    res.status(204).send(); // 204 No Content (نجاح)
  } catch (error) {
    console.error("Error deleting request purpose:", error);
    res.status(500).json({ error: "Failed to delete request purpose" });
  }
};


module.exports = {
  getSystemSettings,
  getRequestPurposes,
  createRequestPurpose,
  updateRequestPurpose,
  deleteRequestPurpose,
};