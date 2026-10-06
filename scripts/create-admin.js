import "dotenv/config";
import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";

async function main() {
  const adminName = process.env.ADMIN_NAME;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminName || !adminEmail || !adminPassword) {
    throw new Error(
      "Missing ADMIN_NAME, ADMIN_EMAIL, or ADMIN_PASSWORD in .env"
    );
  }

  console.log("Creating Admin account...");

  const existingAdmin = await prisma.admin.findUnique({
    where: {
      email: adminEmail,
    },
  });

  if (existingAdmin) {
    console.log("⚠️ Admin already exists.");
    console.log("Email:", existingAdmin.email);
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.admin.create({
    data: {
      name: adminName,
      email: adminEmail,
      passwordHash,
      isActive: true,
    },
  });

  console.log("✅ Admin created successfully.");
  console.log("--------------------------------");
  console.log("Admin ID:", admin.id);
  console.log("Admin Email:", admin.email);
  console.log("Admin Active:", admin.isActive);
  console.log("--------------------------------");
}

main()
  .catch((error) => {
    console.error("❌ Failed to create Admin:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });