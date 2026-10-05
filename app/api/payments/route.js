import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/payments
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const storeId = user.store.id;

    const payments = await prisma.payment.findMany({
      where: {
        storeId,
      },
      include: {
        customer: true,
      },
      orderBy: {
        paymentDate: "desc",
      },
    });

    const formattedPayments = payments.map((payment) => ({
      id: payment.id,
      customerId: payment.customerId,
      customerName: payment.customer.name,
      customerType:
        payment.customer.customerType === "MONTHLY"
          ? "Monthly"
          : "Cash",
      amount: Number(payment.amount),
      paymentDate: payment.paymentDate,
      notes: payment.notes,
      createdAt: payment.createdAt,
    }));

    return NextResponse.json(formattedPayments);
  } catch (error) {
    console.error("GET payments error:", error);

    return NextResponse.json(
      { error: "Failed to fetch payments." },
      { status: 500 }
    );
  }
}

// POST /api/payments
export async function POST(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const storeId = user.store.id;

    const body = await request.json();

    const customerId = Number(body.customerId);
    const amount = Number(body.amount);

    const paymentDate = body.paymentDate
      ? new Date(body.paymentDate)
      : new Date();

    const notes = body.notes?.trim() || null;

    // Validate customer ID
    if (!Number.isInteger(customerId) || customerId <= 0) {
      return NextResponse.json(
        { error: "Valid customer is required." },
        { status: 400 }
      );
    }

    // Validate amount
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Payment amount must be greater than 0." },
        { status: 400 }
      );
    }

    // Validate payment date
    if (Number.isNaN(paymentDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid payment date." },
        { status: 400 }
      );
    }

    // Check customer
    // IMPORTANT:
    // Customer must belong to the logged-in store.
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        storeId,
      },
      include: {
        deliveries: true,
        payments: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found." },
        { status: 404 }
      );
    }

    if (!customer.isActive) {
      return NextResponse.json(
        { error: "This customer is inactive." },
        { status: 400 }
      );
    }

    // Calculate customer's current bill
    const totalBill = customer.deliveries.reduce(
      (total, delivery) => total + Number(delivery.totalAmount),
      0
    );

    const totalPaid = customer.payments.reduce(
      (total, payment) => total + Number(payment.amount),
      0
    );

    const remaining = Math.max(totalBill - totalPaid, 0);

    // Do not allow payment greater than remaining balance
    if (amount > remaining) {
      return NextResponse.json(
        {
          error: `Payment cannot be greater than the remaining balance of Rs. ${remaining.toLocaleString()}.`,
        },
        { status: 400 }
      );
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        storeId,
        customerId,
        amount,
        paymentDate,
        notes,
      },
      include: {
        customer: true,
      },
    });

    return NextResponse.json(
      {
        message: "Payment recorded successfully.",
        payment: {
          id: payment.id,
          customerId: payment.customerId,
          customerName: payment.customer.name,
          customerType:
            payment.customer.customerType === "MONTHLY"
              ? "Monthly"
              : "Cash",
          amount: Number(payment.amount),
          paymentDate: payment.paymentDate,
          notes: payment.notes,
          createdAt: payment.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST payment error:", error);

    return NextResponse.json(
      { error: "Failed to record payment." },
      { status: 500 }
    );
  }
}