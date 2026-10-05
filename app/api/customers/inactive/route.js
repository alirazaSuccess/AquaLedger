import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/customers/inactive
// Get all inactive customers for the logged-in store

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const storeId = user.store.id;

    const customers = await prisma.customer.findMany({
      where: {
        storeId,
        isActive: false,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const formattedCustomers = customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      deliveryLocation: customer.deliveryLocation,
      customerType: customer.customerType,
      dailyBottles: customer.dailyBottles,
      bottlePrice: Number(customer.bottlePrice),
      startDate: customer.startDate.toISOString(),
      isActive: customer.isActive,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
    }));

    return NextResponse.json(
      {
        customers: formattedCustomers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET inactive customers error:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch inactive customers.",
      },
      { status: 500 }
    );
  }
}