import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const types = await prisma.propertyType.findMany({
    select: {
      id: true,
      name: true,
      parentId: true,
    }
  });
  console.log(JSON.stringify(types, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
