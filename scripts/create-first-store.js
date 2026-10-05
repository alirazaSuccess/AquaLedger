import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";

async function main() {
  const email = "admin@example.com";
  const password = "ChangeMe123!";

  // Check if user already exists
  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const passwordHash = await bcrypt.hash(password, 10);

    user = await prisma.user.create({
      data: {
        name: "Ali Raza",
        email,
        phone: "",
        passwordHash,
        role: "SUPPLIER",
        isActive: true,
      },
    });

    console.log("User created:", user.email);
  } else {
    console.log("User already exists:", user.email);
  }

  // Check if store already exists
  let store = await prisma.store.findUnique({
    where: {
      ownerId: user.id,
    },
  });

  if (!store) {
    store = await prisma.store.create({
      data: {
        ownerId: user.id,
        name: "Ali Water Supply",
        phone: "",
        email: user.email,
        address: "",
        currency: "PKR",
        timezone: "Asia/Karachi",
        isActive: true,
      },
    });

    console.log("Store created:", store.name);
  } else {
    console.log("Store already exists:", store.name);
  }

  console.log("\n--------------------------------");
  console.log("First Store Setup Complete");
  console.log("--------------------------------");
  console.log("User ID:", user.id);
  console.log("Email:", user.email);
  console.log("Store ID:", store.id);
  console.log("Store Name:", store.name);
  console.log("--------------------------------");
}

main()
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });