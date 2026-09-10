import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const types = await prisma.propertyType.findMany({
    orderBy: { sortOrder: 'asc' },
  });
  console.log(JSON.stringify(types.map(t => ({ id: t.id, name: t.name, parentId: t.parentId, sortOrder: t.sortOrder })), null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
