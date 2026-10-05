import prisma from "../lib/prisma.js";

async function main() {
  console.log("Starting existing data assignment...\n");

  // 1. Find the first Store
  const store = await prisma.store.findFirst({
    orderBy: {
      id: "asc",
    },
  });

  if (!store) {
    throw new Error(
      "No Store found. Please create your User and Store first."
    );
  }

  console.log(`Store found: ${store.name}`);
  console.log(`Store ID: ${store.id}\n`);

  // 2. Assign all existing customers to this Store
  const customersResult = await prisma.customer.updateMany({
    where: {
      storeId: null,
    },
    data: {
      storeId: store.id,
    },
  });

  console.log(
    `Customers assigned: ${customersResult.count}`
  );

  // 3. Assign all existing deliveries to this Store
  const deliveriesResult = await prisma.delivery.updateMany({
    where: {
      storeId: null,
    },
    data: {
      storeId: store.id,
    },
  });

  console.log(
    `Deliveries assigned: ${deliveriesResult.count}`
  );

  // 4. Assign all existing payments to this Store
  const paymentsResult = await prisma.payment.updateMany({
    where: {
      storeId: null,
    },
    data: {
      storeId: store.id,
    },
  });

  console.log(
    `Payments assigned: ${paymentsResult.count}`
  );

  // 5. Verify that no records are left without a Store
  const customersWithoutStore = await prisma.customer.count({
    where: {
      storeId: null,
    },
  });

  const deliveriesWithoutStore = await prisma.delivery.count({
    where: {
      storeId: null,
    },
  });

  const paymentsWithoutStore = await prisma.payment.count({
    where: {
      storeId: null,
    },
  });

  console.log("\n--------------------------------");
  console.log("Verification");
  console.log("--------------------------------");

  console.log(
    `Customers without Store: ${customersWithoutStore}`
  );

  console.log(
    `Deliveries without Store: ${deliveriesWithoutStore}`
  );

  console.log(
    `Payments without Store: ${paymentsWithoutStore}`
  );

  if (
    customersWithoutStore === 0 &&
    deliveriesWithoutStore === 0 &&
    paymentsWithoutStore === 0
  ) {
    console.log("\n✅ All existing data is assigned to the Store.");
  } else {
    console.log(
      "\n⚠️ Some records are still without a Store. Do not continue yet."
    );
  }
}

main()
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
