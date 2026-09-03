import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Inserting dummy leads...');
  
  await prisma.lead.createMany({
    data: [
      {
        name: 'Rahul Sharma',
        phone: '+919876543210',
        email: 'rahul.s@example.com',
        source: 'PROPERTY_INTEREST',
        status: 'NEW',
        notes: 'Interested in a 3BHK in Wagholi',
      },
      {
        name: 'Priya Patel',
        phone: '+919876543211',
        email: 'priya.p@example.com',
        source: 'CONSULTATION',
        status: 'CONTACTED',
        notes: 'Looking for commercial shop',
      },
      {
        name: 'Amit Kumar',
        phone: '+919876543212',
        source: 'SERVICE_CONTACT',
        status: 'IN_PROGRESS',
        notes: 'Needs Vastu consultation',
      }
    ]
  });

  console.log('Successfully inserted 3 dummy leads!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
