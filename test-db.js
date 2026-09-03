const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log("Attempting to connect to Supabase...");
  try {
    await prisma.$connect();
    console.log("✅ Successfully connected to Supabase Database!");
  } catch (error) {
    console.error("❌ Failed to connect to the database. Error details:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
