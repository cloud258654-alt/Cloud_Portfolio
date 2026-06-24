import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);

  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: { passwordHash },
    create: { username: 'admin', passwordHash }
  });

  await prisma.parkingLot.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'MVP 停車場',
      capacity: 50,
      usedSpaces: 0,
      availableSpaces: 50
    }
  });

  const rateCount = await prisma.rateSetting.count();
  if (rateCount === 0) {
    await prisma.rateSetting.create({
      data: {
        freeMinutes: 30,
        hourlyRate: 40,
        dailyMaxFee: 300,
        exitGraceMinutes: 10
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
