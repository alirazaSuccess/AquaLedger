import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const getCustomerId = async (params) => {
  const { id } = await params;
  const customerId = Number(id);

  if (!Number.isInteger(customerId) || customerId <= 0) {
    return null;
  }

  return customerId;
};

// GET /api/customers/:id
export async function GET(request, { params }) {
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

    const customerId = await getCustomerId(params);

    if (!customerId) {
      return NextResponse.json(
        {
          message: "Invalid customer ID.",
        },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        storeId,
      },
    });

    if (!customer) {
      return NextResponse.json(
        {
          message: "Customer not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      customer: {
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
      },
    });
  } catch (error) {
    console.error("GET customer error:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch customer.",
      },
      { status: 500 }
    );
  }
}

// PUT /api/customers/:id
export async function PUT(request, { params }) {
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

    const customerId = await getCustomerId(params);

    if (!customerId) {
      return NextResponse.json(
        {
          message: "Invalid customer ID.",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      name,
      phone,
      deliveryLocation,
      customerType,
      dailyBottles,
      bottlePrice,
      startDate,
      isActive,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        {
          message: "Customer name is required.",
        },
        { status: 400 }
      );
    }

    if (!phone?.trim()) {
      return NextResponse.json(
        {
          message: "Phone number is required.",
        },
        { status: 400 }
      );
    }

    if (!deliveryLocation?.trim()) {
      return NextResponse.json(
        {
          message: "Delivery location is required.",
        },
        { status: 400 }
      );
    }

    if (!["CASH", "MONTHLY"].includes(customerType)) {
      return NextResponse.json(
        {
          message: "Customer type must be CASH or MONTHLY.",
        },
        { status: 400 }
      );
    }

    const bottles = Number(dailyBottles);
    const price = Number(bottlePrice);

    if (!Number.isInteger(bottles) || bottles <= 0) {
      return NextResponse.json(
        {
          message: "Daily bottles must be a positive whole number.",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        {
          message: "Bottle price must be greater than 0.",
        },
        { status: 400 }
      );
    }

    if (!startDate) {
      return NextResponse.json(
        {
          message: "A valid start date is required.",
        },
        { status: 400 }
      );
    }

    const parsedStartDate = new Date(startDate);

    if (Number.isNaN(parsedStartDate.getTime())) {
      return NextResponse.json(
        {
          message: "A valid start date is required.",
        },
        { status: 400 }
      );
    }

    // IMPORTANT:
    // Customer must belong to the logged-in user's store.
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        storeId,
      },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        {
          message: "Customer not found.",
        },
        { status: 404 }
      );
    }

    const updatedCustomer = await prisma.customer.update({
      where: {
        id: customerId,
      },
      data: {
        name: name.trim(),
        phone: phone.trim(),
        deliveryLocation: deliveryLocation.trim(),
        customerType,
        dailyBottles: bottles,
        bottlePrice: price,
        startDate: parsedStartDate,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({
      message: "Customer updated successfully.",
      customer: {
        id: updatedCustomer.id,
        name: updatedCustomer.name,
        phone: updatedCustomer.phone,
        deliveryLocation: updatedCustomer.deliveryLocation,
        customerType: updatedCustomer.customerType,
        dailyBottles: updatedCustomer.dailyBottles,
        bottlePrice: Number(updatedCustomer.bottlePrice),
        startDate: updatedCustomer.startDate.toISOString(),
        isActive: updatedCustomer.isActive,
        createdAt: updatedCustomer.createdAt.toISOString(),
        updatedAt: updatedCustomer.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("PUT customer error:", error);

    return NextResponse.json(
      {
        message: "Failed to update customer.",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/customers/:id
export async function DELETE(request, { params }) {
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

    const customerId = await getCustomerId(params);

    if (!customerId) {
      return NextResponse.json(
        {
          message: "Invalid customer ID.",
        },
        { status: 400 }
      );
    }

    // IMPORTANT:
    // Only allow deactivation if this customer belongs
    // to the currently logged-in store.
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        storeId,
      },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        {
          message: "Customer not found.",
        },
        { status: 404 }
      );
    }

    const updatedCustomer = await prisma.customer.update({
      where: {
        id: customerId,
      },
      data: {
        isActive: false,
      },
    });

    return NextResponse.json({
      message: "Customer deactivated successfully.",
      customer: {
        id: updatedCustomer.id,
        name: updatedCustomer.name,
        isActive: updatedCustomer.isActive,
      },
    });
  } catch (error) {
    console.error("DELETE customer error:", error);

    return NextResponse.json(
      {
        message: "Failed to deactivate customer.",
      },
      { status: 500 }
    );
  }
}