import prisma from "../lib/prisma.js";
import "dotenv/config";

async function main() {
  console.log("Creating subscription plans...");

  // --------------------------------
  // Free Trial Plan
  // --------------------------------
  const trialPlan = await prisma.subscriptionPlan.upsert({
    where: {
      id: 1,
    },
    update: {
      name: "Free Trial",
      durationDays: 60,
      price: 0,
      isActive: true,
    },
    create: {
      name: "Free Trial",
      durationDays: 60,
      price: 0,
      isActive: true,
    },
  });

  // --------------------------------
  // Standard Paid Plan
  // --------------------------------
  const standardPlan = await prisma.subscriptionPlan.upsert({
    where: {
      id: 2,
    },
    update: {
      name: "Standard",
      durationDays: 60,
      price: 2000,
      isActive: true,
    },
    create: {
      name: "Standard",
      durationDays: 60,
      price: 2000,
      isActive: true,
    },
  });

  console.log("--------------------------------");
  console.log("Subscription plans created.");
  console.log("--------------------------------");

  console.log({
    trialPlan,
    standardPlan,
  });
}

main()
  .catch((error) => {
    console.error("Failed to create subscription plans:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });