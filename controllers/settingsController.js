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

module.exports = {
  getSystemSettings,
};