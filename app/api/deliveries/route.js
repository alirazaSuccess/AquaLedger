import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/deliveries
export async function GET(request) {
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

        const { searchParams } = new URL(request.url);

        const customerIdParam = searchParams.get("customerId");
        const dateParam = searchParams.get("date");

        const where = {
            storeId,
        };

        // Optional customer filter
        if (customerIdParam) {
            const customerId = Number(customerIdParam);

            if (!Number.isInteger(customerId) || customerId <= 0) {
                return NextResponse.json(
                    {
                        message: "Invalid customer ID.",
                    },
                    { status: 400 }
                );
            }

            where.customerId = customerId;
        }

        // Optional date filter
        if (dateParam) {
            const startDate = new Date(`${dateParam}T00:00:00+05:00`);
            const endDate = new Date(`${dateParam}T23:59:59.999+05:00`);

            if (
                Number.isNaN(startDate.getTime()) ||
                Number.isNaN(endDate.getTime())
            ) {
                return NextResponse.json(
                    {
                        message: "Invalid delivery date.",
                    },
                    { status: 400 }
                );
            }

            where.deliveryDate = {
                gte: startDate,
                lte: endDate,
            };
        }

        const deliveries = await prisma.delivery.findMany({
            where,
            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        deliveryLocation: true,
                        customerType: true,
                        dailyBottles: true,
                        bottlePrice: true,
                        isActive: true,
                    },
                },
            },
            orderBy: {
                deliveryDate: "desc",
            },
        });

        return NextResponse.json({
            deliveries: deliveries.map((delivery) => ({
                id: delivery.id,
                customerId: delivery.customerId,
                customerName: delivery.customer.name,
                phone: delivery.customer.phone,
                address: delivery.customer.deliveryLocation,
                customerType: delivery.customer.customerType,
                dailyBottles: delivery.customer.dailyBottles,

                // Historical price stored on delivery
                bottlePrice: Number(delivery.bottlePrice),

                bottles: delivery.bottles,
                actualBottles: delivery.bottles,
                totalAmount: Number(delivery.totalAmount),

                deliveryDate: delivery.deliveryDate.toISOString(),

                status: "Delivered",

                customer: {
                    id: delivery.customer.id,
                    name: delivery.customer.name,
                    phone: delivery.customer.phone,
                    deliveryLocation: delivery.customer.deliveryLocation,
                    customerType: delivery.customer.customerType,
                    dailyBottles: delivery.customer.dailyBottles,
                    bottlePrice: Number(delivery.customer.bottlePrice),
                    isActive: delivery.customer.isActive,
                },

                createdAt: delivery.createdAt.toISOString(),
                updatedAt: delivery.updatedAt.toISOString(),
            })),
        });
    } catch (error) {
        console.error("GET deliveries error:", error);

        return NextResponse.json(
            {
                message: "Failed to fetch deliveries.",
            },
            { status: 500 }
        );
    }
}

// POST /api/deliveries
export async function POST(request) {
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

        const body = await request.json();

        const {
            customerId,
            bottles,
            deliveryDate,
        } = body;

        // -----------------------------
        // Validate customer ID
        // -----------------------------

        const parsedCustomerId = Number(customerId);

        if (
            !Number.isInteger(parsedCustomerId) ||
            parsedCustomerId <= 0
        ) {
            return NextResponse.json(
                {
                    message: "Valid customer ID is required.",
                },
                { status: 400 }
            );
        }

        // -----------------------------
        // Validate bottles
        // -----------------------------

        const parsedBottles = Number(bottles);

        if (
            !Number.isInteger(parsedBottles) ||
            parsedBottles <= 0
        ) {
            return NextResponse.json(
                {
                    message: "Bottles must be a positive whole number.",
                },
                { status: 400 }
            );
        }

        // -----------------------------
        // Validate delivery date
        // -----------------------------

        if (!deliveryDate) {
            return NextResponse.json(
                {
                    message: "Delivery date is required.",
                },
                { status: 400 }
            );
        }

        const parsedDeliveryDate = new Date(deliveryDate);

        if (Number.isNaN(parsedDeliveryDate.getTime())) {
            return NextResponse.json(
                {
                    message: "Invalid delivery date.",
                },
                { status: 400 }
            );
        }

        // -----------------------------
        // Find customer
        // IMPORTANT:
        // Customer MUST belong to
        // the logged-in user's store.
        // -----------------------------

        const customer = await prisma.customer.findFirst({
            where: {
                id: parsedCustomerId,
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

        // Don't allow deliveries for inactive customers
        if (!customer.isActive) {
            return NextResponse.json(
                {
                    message: "Cannot create delivery for an inactive customer.",
                },
                { status: 400 }
            );
        }

        // -----------------------------
        // Check duplicate delivery
        // -----------------------------

        const startOfDay = new Date(
            `${deliveryDate.slice(0, 10)}T00:00:00+05:00`
        );

        const endOfDay = new Date(
            `${deliveryDate.slice(0, 10)}T23:59:59.999+05:00`
        );

        const existingDelivery = await prisma.delivery.findFirst({
            where: {
                storeId,
                customerId: parsedCustomerId,
                deliveryDate: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
        });

        if (existingDelivery) {
            return NextResponse.json(
                {
                    message:
                        "A delivery for this customer already exists for this date.",
                },
                { status: 409 }
            );
        }

        // -----------------------------
        // Use customer's CURRENT price
        // -----------------------------

        const bottlePrice = Number(customer.bottlePrice);

        if (!Number.isFinite(bottlePrice) || bottlePrice <= 0) {
            return NextResponse.json(
                {
                    message: "Customer has an invalid bottle price.",
                },
                { status: 400 }
            );
        }

        // -----------------------------
        // Calculate total
        // -----------------------------

        const totalAmount = parsedBottles * bottlePrice;

        // -----------------------------
        // Create delivery
        // -----------------------------

        const delivery = await prisma.delivery.create({
            data: {
                storeId,
                customerId: parsedCustomerId,
                deliveryDate: parsedDeliveryDate,
                bottles: parsedBottles,

                // Save price at the time of delivery
                bottlePrice: bottlePrice,

                // Save calculated bill
                totalAmount: totalAmount,
            },

            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        deliveryLocation: true,
                        customerType: true,
                        dailyBottles: true,
                        bottlePrice: true,
                        isActive: true,
                    },
                },
            },
        });

        return NextResponse.json(
            {
                message: "Delivery saved successfully.",

                delivery: {
                    id: delivery.id,
                    customerId: delivery.customerId,
                    customerName: delivery.customer.name,
                    phone: delivery.customer.phone,
                    address: delivery.customer.deliveryLocation,
                    customerType: delivery.customer.customerType,

                    dailyBottles: delivery.customer.dailyBottles,

                    bottles: delivery.bottles,
                    actualBottles: delivery.bottles,

                    bottlePrice: Number(delivery.bottlePrice),
                    totalAmount: Number(delivery.totalAmount),

                    deliveryDate: delivery.deliveryDate.toISOString(),

                    status: "Delivered",

                    createdAt: delivery.createdAt.toISOString(),
                    updatedAt: delivery.updatedAt.toISOString(),
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("POST delivery error:", error);

        return NextResponse.json(
            {
                message: "Failed to save delivery.",
            },
            { status: 500 }
        );
    }
}