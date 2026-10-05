import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/customers
// Get all active customers belonging to the logged-in user's Store
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json(
        {
          message: "Unauthorized. Please login first.",
        },
        {
          status: 401,
        }
      );
    }

    const storeId = user.store.id;

    const customers = await prisma.customer.findMany({
      where: {
        storeId,
        isActive: true,
      },
      include: {
        deliveries: {
          select: {
            totalAmount: true,
          },
        },
        payments: {
          select: {
            amount: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedCustomers = customers.map((customer) => {
      const totalBill = customer.deliveries.reduce(
        (total, delivery) => total + Number(delivery.totalAmount),
        0
      );

      const paidAmount = customer.payments.reduce(
        (total, payment) => total + Number(payment.amount),
        0
      );

      const remaining = Math.max(totalBill - paidAmount, 0);

      return {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        deliveryLocation: customer.deliveryLocation,
        customerType: customer.customerType,
        dailyBottles: customer.dailyBottles,
        bottlePrice: Number(customer.bottlePrice),
        startDate: customer.startDate,
        isActive: customer.isActive,

        // Billing summary
        totalBill,
        paidAmount,
        remaining,
      };
    });

    return Response.json(formattedCustomers, {
      status: 200,
    });
  } catch (error) {
    console.error("GET /api/customers error:", error);

    return Response.json(
      {
        message: "Failed to fetch customers.",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

// POST /api/customers
// Create a new customer for the logged-in user's Store
export async function POST(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json(
        {
          message: "Unauthorized. Please login first.",
        },
        {
          status: 401,
        }
      );
    }

    const storeId = user.store.id;

    const body = await request.json();

    const {
      name,
      phone,
      deliveryLocation,
      customerType,
      dailyBottles,
      bottlePrice,
      startDate,
    } = body;

    // Required field validation
    if (
      !name ||
      !deliveryLocation ||
      !customerType ||
      dailyBottles === undefined ||
      bottlePrice === undefined ||
      !startDate
    ) {
      return Response.json(
        {
          message: "Please provide all required customer details.",
        },
        {
          status: 400,
        }
      );
    }

    // Validate customer type
    if (!["CASH", "MONTHLY"].includes(customerType)) {
      return Response.json(
        {
          message: "Customer type must be CASH or MONTHLY.",
        },
        {
          status: 400,
        }
      );
    }

    // Validate numbers
    const bottles = Number(dailyBottles);
    const price = Number(bottlePrice);

    if (!Number.isInteger(bottles) || bottles <= 0) {
      return Response.json(
        {
          message: "Daily bottles must be a positive whole number.",
        },
        {
          status: 400,
        }
      );
    }

    if (!Number.isFinite(price) || price <= 0) {
      return Response.json(
        {
          message: "Bottle price must be greater than 0.",
        },
        {
          status: 400,
        }
      );
    }

    // Validate date
    const parsedStartDate = new Date(startDate);

    if (Number.isNaN(parsedStartDate.getTime())) {
      return Response.json(
        {
          message: "Invalid start date.",
        },
        {
          status: 400,
        }
      );
    }

    // Create customer and automatically attach
    // the customer to the logged-in user's Store.
    const customer = await prisma.customer.create({
      data: {
        storeId,

        name: name.trim(),
        phone: phone?.trim() || null,
        deliveryLocation: deliveryLocation.trim(),
        customerType,
        dailyBottles: bottles,
        bottlePrice: price,
        startDate: parsedStartDate,
        isActive: true,
      },
    });

    return Response.json(
      {
        message: "Customer created successfully.",
        customer,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("POST /api/customers error:", error);

    return Response.json(
      {
        message: "Failed to create customer.",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}