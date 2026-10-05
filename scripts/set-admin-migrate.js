/* eslint-disable @typescript-eslint/no-require-imports */
const prismaModule = require("../lib/prisma");

const prisma = prismaModule.prisma || prismaModule.default;

async function main() {
  const adminEmail = "admin@example.com";

  console.log("Starting Admin migration...");

  // Find existing Admin user
  const oldAdmin = await prisma.user.findUnique({
    where: {
      email: adminEmail,
    },
  });

  if (!oldAdmin) {
    console.log("❌ Admin user not found in User table.");
    return;
  }

  console.log("Existing Admin User found:");
  console.log("ID:", oldAdmin.id);
  console.log("Email:", oldAdmin.email);
  console.log("Name:", oldAdmin.name);

  // Check if Admin already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: {
      email: adminEmail,
    },
  });

  if (existingAdmin) {
    console.log("⚠️ Admin already exists in Admin table.");

    // Remove old User record if it is still there
    await prisma.user.delete({
      where: {
        id: oldAdmin.id,
      },
    });

    console.log("✅ Old Admin User record removed.");
    return;
  }

  // Create Admin using existing login credentials
  const admin = await prisma.admin.create({
    data: {
      name: oldAdmin.name,
      email: oldAdmin.email,
      phone: oldAdmin.phone,
      passwordHash: oldAdmin.passwordHash,
      isActive: oldAdmin.isActive,
    },
  });

  console.log("✅ Admin created successfully.");
  console.log("Admin ID:", admin.id);
  console.log("Admin Email:", admin.email);

  // Remove old Admin from User table
  await prisma.user.delete({
    where: {
      id: oldAdmin.id,
    },
  });

  console.log("✅ Old Admin User record removed.");
  console.log("");
  console.log("🎉 Admin migration completed successfully.");
}

main()
  .catch((error) => {
    console.error("❌ Admin migration failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });