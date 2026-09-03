const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning up SIDEBAR placements...");
  // Using Prisma's deleteMany to remove any SIDEBAR placements before we alter the enum
  const result = await prisma.advertisementPlacement.deleteMany({
    where: {
      placementZone: 'SIDEBAR'
    }
  });
  console.log(`Deleted ${result.count} placements.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
