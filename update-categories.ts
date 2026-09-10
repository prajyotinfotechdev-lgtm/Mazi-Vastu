import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Deactivate "Rent"
  const rentCategory = await prisma.propertyType.findFirst({
    where: { name: 'Rent' }
  });
  if (rentCategory) {
    await prisma.propertyType.update({
      where: { id: rentCategory.id },
      data: { isActive: false, deletedAt: new Date() }
    });
  }

  // Add "Bungalow"
  await prisma.propertyType.upsert({
    where: { slug: 'bungalow' },
    update: { isActive: true, deletedAt: null },
    create: {
      name: 'Bungalow',
      slug: 'bungalow',
      sortOrder: 7,
      isActive: true,
    }
  });

  // Add "Godown"
  await prisma.propertyType.upsert({
    where: { slug: 'godown' },
    update: { isActive: true, deletedAt: null },
    create: {
      name: 'Godown',
      slug: 'godown',
      sortOrder: 8,
      isActive: true,
    }
  });

  console.log("Database categories updated successfully");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
