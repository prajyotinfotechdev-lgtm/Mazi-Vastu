// ─── Database Seed ──────────────────────────────────────────────────────────
// Seeds: Admin, Property Types (with hierarchy), Custom Fields, Allied Services
// Run: npx prisma db seed
// ──────────────────────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // ─── 1. Admin ──────────────────────────────────────────────────────────────

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@majivastu.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'MajiVastu@2026';

  const hashedPassword = await hash(adminPassword, 12);

  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'MajiVastu Admin',
      password: hashedPassword,
      isActive: true,
    },
  });

  console.log(`✅ Admin created: ${admin.email}`);

  // ─── 2. Property Types (Hierarchical) ─────────────────────────────────────

  const propertyTypes = [
    { name: 'Home', slug: 'home', sortOrder: 1 },
    { name: 'Open Plot', slug: 'open-plot', sortOrder: 2 },
    { name: 'Row House', slug: 'row-house', sortOrder: 3 },
    { name: 'Flat', slug: 'flat', sortOrder: 4 },
    { name: 'Shop', slug: 'shop', sortOrder: 5 },
    { name: 'Land', slug: 'land', sortOrder: 6 },
  ];

  const createdTypes: Record<string, string> = {};

  for (const type of propertyTypes) {
    const created = await prisma.propertyType.upsert({
      where: { slug: type.slug },
      update: {},
      create: {
        name: type.name,
        slug: type.slug,
        isActive: true,
        sortOrder: type.sortOrder,
      },
    });
    createdTypes[type.slug] = created.id;
  }

  // Create "Rent" as a parent category
  const rentType = await prisma.propertyType.upsert({
    where: { slug: 'rent' },
    update: {},
    create: {
      name: 'Rent',
      slug: 'rent',
      isActive: true,
      sortOrder: 7,
    },
  });

  // Rent subtypes (children of Rent)
  const rentSubtypes = [
    { name: 'Home', slug: 'rent-home', sortOrder: 1 },
    { name: 'Flat', slug: 'rent-flat', sortOrder: 2 },
    { name: 'Shop', slug: 'rent-shop', sortOrder: 3 },
    { name: 'Land', slug: 'rent-land', sortOrder: 4 },
    { name: 'Row House', slug: 'rent-row-house', sortOrder: 5 },
  ];

  for (const subtype of rentSubtypes) {
    await prisma.propertyType.upsert({
      where: { slug: subtype.slug },
      update: {},
      create: {
        name: subtype.name,
        slug: subtype.slug,
        parentId: rentType.id,
        isActive: true,
        sortOrder: subtype.sortOrder,
      },
    });
  }

  console.log(`✅ Property types created: ${propertyTypes.length + 1 + rentSubtypes.length} types (with Rent hierarchy)`);

  // ─── 3. Custom Field Definitions ──────────────────────────────────────────

  const fieldDefinitions = [
    {
      key: 'facing',
      label: 'Facing',
      dataType: 'SELECT' as const,
      options: ['East', 'West', 'North', 'South', 'North-East', 'North-West', 'South-East', 'South-West'],
      isPublic: true,
      isGated: false,
      isFilterable: true,
      sortOrder: 1,
    },
    {
      key: 'furnishing',
      label: 'Furnishing',
      dataType: 'SELECT' as const,
      options: ['Unfurnished', 'Semi Furnished', 'Fully Furnished'],
      isPublic: true,
      isGated: false,
      isFilterable: true,
      sortOrder: 2,
    },
    {
      key: 'ageOfProperty',
      label: 'Age of Property',
      dataType: 'NUMBER' as const,
      validationRules: { min: 0, max: 100 },
      isPublic: true,
      isGated: false,
      isFilterable: true,
      sortOrder: 3,
    },
    {
      key: 'parking',
      label: 'Parking',
      dataType: 'BOOLEAN' as const,
      isPublic: true,
      isGated: false,
      isFilterable: true,
      sortOrder: 4,
    },
    {
      key: 'bedrooms',
      label: 'Bedrooms',
      dataType: 'NUMBER' as const,
      validationRules: { min: 0, max: 20 },
      isPublic: true,
      isGated: false,
      isFilterable: true,
      sortOrder: 5,
    },
    {
      key: 'bathrooms',
      label: 'Bathrooms',
      dataType: 'NUMBER' as const,
      validationRules: { min: 0, max: 20 },
      isPublic: true,
      isGated: false,
      isFilterable: false,
      sortOrder: 6,
    },
    {
      key: 'floor',
      label: 'Floor',
      dataType: 'NUMBER' as const,
      validationRules: { min: -2, max: 100 },
      isPublic: true,
      isGated: false,
      isFilterable: false,
      sortOrder: 7,
    },
    {
      key: 'totalFloors',
      label: 'Total Floors',
      dataType: 'NUMBER' as const,
      validationRules: { min: 1, max: 100 },
      isPublic: true,
      isGated: false,
      isFilterable: false,
      sortOrder: 8,
    },
    {
      key: 'waterSupply',
      label: 'Water Supply',
      dataType: 'SELECT' as const,
      options: ['Municipal', 'Borewell', 'Both', 'None'],
      isPublic: true,
      isGated: true, // Gated — requires registration
      isFilterable: false,
      sortOrder: 9,
    },
    {
      key: 'ownerContact',
      label: 'Owner Contact',
      dataType: 'TEXT' as const,
      isPublic: false, // Not public — admin only
      isGated: true,
      isFilterable: false,
      sortOrder: 10,
    },
  ];

  for (const field of fieldDefinitions) {
    await prisma.propertyFieldDefinition.upsert({
      where: { key: field.key },
      update: {},
      create: {
        key: field.key,
        label: field.label,
        dataType: field.dataType,
        options: field.options || [],
        validationRules: field.validationRules || {},
        isRequired: false,
        isPublic: field.isPublic,
        isGated: field.isGated,
        isFilterable: field.isFilterable,
        isSearchable: false,
        isActive: true,
        sortOrder: field.sortOrder,
      },
    });
  }

  console.log(`✅ Custom field definitions created: ${fieldDefinitions.length} fields`);

  // ─── 4. Allied Services ───────────────────────────────────────────────────

  const whatsappNumber = process.env.WHATSAPP_ADMIN_NUMBER || '919876543210';

  const alliedServices = [
    { name: 'Loan', slug: 'loan', sortOrder: 1 },
    { name: 'Compound Constructor', slug: 'compound-constructor', sortOrder: 2 },
    { name: 'Engineers', slug: 'engineers', sortOrder: 3 },
    { name: 'Painters', slug: 'painters', sortOrder: 4 },
    { name: 'Cleaners', slug: 'cleaners', sortOrder: 5 },
    { name: 'Interior Designers', slug: 'interior-designers', sortOrder: 6 },
    { name: 'Furniture', slug: 'furniture', sortOrder: 7 },
    { name: 'Plumbers', slug: 'plumbers', sortOrder: 8 },
    { name: 'Electricians', slug: 'electricians', sortOrder: 9 },
    { name: 'Solar Panel', slug: 'solar-panel', sortOrder: 10 },
    { name: 'Shifting / Packers & Movers', slug: 'shifting-packers-movers', sortOrder: 11 },
  ];

  for (const service of alliedServices) {
    await prisma.alliedService.upsert({
      where: { slug: service.slug },
      update: {},
      create: {
        name: service.name,
        slug: service.slug,
        description: `Professional ${service.name.toLowerCase()} services.`,
        whatsappNumber,
        whatsappMessageTemplate: `Hello, I am interested in the ${service.name} service from MaziVastu. Please share more details.`,
        isActive: true,
        sortOrder: service.sortOrder,
      },
    });
  }

  console.log(`✅ Allied services created: ${alliedServices.length} services`);

  console.log('\n🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
