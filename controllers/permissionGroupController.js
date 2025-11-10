// ./controllers/permissionGroupController.js (مُحدث بالكامل)

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// --- جلب جميع الصلاحيات المنفردة (لشاشة 903) ---
exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [
        { category: 'asc' }, // تجميع حسب الفئة
        { name: 'asc' }
      ]
    });
    
    // (تجميع) لتسهيل العرض في الواجهة
    const groupedPermissions = permissions.reduce((acc, perm) => {
      const category = perm.category || 'أخرى';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(perm);
      return acc;
    }, {});

    res.status(200).json(groupedPermissions);
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الصلاحيات', details: error.message });
  }
};

// --- جلب جميع مجموعات الصلاحيات (لشاشة 903) ---
exports.getAllPermissionGroups = async (req, res) => {
    try {
        const groups = await prisma.permissionGroup.findMany({
            include: {
                _count: {
                    select: { permissions: true }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });
        
        // إعادة هيكلة لتطابق واجهة 903
        const formattedGroups = groups.map(g => ({
            id: g.id,
            name: g.name,
            description: g.description,
            permissionsCount: g._count.permissions
        }));

        res.status(200).json(formattedGroups);
    } catch (error) {
        res.status(500).json({ error: 'حدث خطأ أثناء جلب مجموعات الصلاحيات', details: error.message });
    }
};

// (يمكن إضافة باقي عمليات CRUD للمجموعات والصلاحيات هنا: Create, Update, Delete)