const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash,
      role: 'admin',
    },
  });

  const existingRate = await prisma.rateSetting.findFirst();
  if (!existingRate) {
    await prisma.rateSetting.create({
      data: {
        freeMinutes: 30,
        hourlyRate: 40,
        dailyMaxFee: 300,
        exitGraceMinutes: 15,
      },
    });
  }

  const existingLot = await prisma.parkingLotSetting.findFirst();
  if (!existingLot) {
    await prisma.parkingLotSetting.create({
      data: {
        lotName: '1號停車場',
        totalSpaces: 100,
        usedSpaces: 0,
      },
    });
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
