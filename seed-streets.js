// seed-streets.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // إضافة القطاعات
  const sectors = ['القطاع الشمالي', 'القطاع الجنوبي', 'القطاع الشرقي', 'القطاع الغربي', 'القطاع الأوسط'];
  for (const name of sectors) {
    await prisma.riyadhSector.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }

  // إضافة بعض الأحياء
  const districts = ['حي النرجس', 'حي الملقا', 'حي العليا', 'حي الروضة', 'حي الياسمين'];
  for (const name of districts) {
    await prisma.riyadhDistrict.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }
  console.log('تمت إضافة البيانات الأساسية');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());