import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      name,
      storeName,
      email,
      phone,
      password,
    } = body;

    // --------------------------------
    // Basic validation
    // --------------------------------
    if (!name || !storeName || !email || !password) {
      return NextResponse.json(
        {
          message:
            "Name, store name, email and password are required.",
        },
        { status: 400 }
      );
    }

    // --------------------------------
    // Clean input
    // --------------------------------
    const cleanName = name.trim();
    const cleanStoreName = storeName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone?.trim() || null;

    // --------------------------------
    // Password validation
    // --------------------------------
    if (password.length < 8) {
      return NextResponse.json(
        {
          message: "Password must be at least 8 characters long.",
        },
        { status: 400 }
      );
    }

    // --------------------------------
    // Check existing email
    // --------------------------------
    const existingUser = await prisma.user.findUnique({
      where: {
        email: cleanEmail,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    // --------------------------------
    // Find Free Trial plan
    // --------------------------------
    const trialPlan = await prisma.subscriptionPlan.findFirst({
      where: {
        name: "Free Trial",
        isActive: true,
      },
    });

    if (!trialPlan) {
      return NextResponse.json(
        {
          message:
            "Free Trial subscription plan is not configured. Please contact the administrator.",
        },
        { status: 500 }
      );
    }

    // --------------------------------
    // Hash password
    // --------------------------------
    const passwordHash = await bcrypt.hash(password, 10);

    // --------------------------------
    // Create User + Store + Subscription
    // --------------------------------
    const result = await prisma.$transaction(async (tx) => {
      // Create User
      const user = await tx.user.create({
        data: {
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          passwordHash,
          role: "SUPPLIER",
          isActive: true,
        },
      });

      // Create Store
      const store = await tx.store.create({
        data: {
          ownerId: user.id,
          name: cleanStoreName,
          phone: cleanPhone,
          email: cleanEmail,
          currency: "PKR",
          timezone: "Asia/Karachi",
          isActive: true,
        },
      });

      // --------------------------------
      // Create 2-Month Free Trial
      // --------------------------------
      const startDate = new Date();

      const endDate = new Date(startDate);

      // Use the plan duration from the database
      endDate.setDate(
        endDate.getDate() + trialPlan.durationDays
      );

      const subscription = await tx.subscription.create({
        data: {
          storeId: store.id,
          planId: trialPlan.id,
          startDate,
          endDate,
          amount: 0,
          status: "TRIAL",
        },
      });

      return {
        user,
        store,
        subscription,
      };
    });

    // --------------------------------
    // Success response
    // --------------------------------
    return NextResponse.json(
      {
        message:
          `Account created successfully. Your ${trialPlan.durationDays}-day free trial has started.`,

        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          phone: result.user.phone,
          role: result.user.role,
        },

        store: {
          id: result.store.id,
          name: result.store.name,
          phone: result.store.phone,
          email: result.store.email,
          currency: result.store.currency,
          timezone: result.store.timezone,
        },

        subscription: {
          id: result.subscription.id,
          planId: result.subscription.planId,
          status: result.subscription.status,
          startDate: result.subscription.startDate,
          endDate: result.subscription.endDate,
          amount: Number(result.subscription.amount),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);

    return NextResponse.json(
      {
        message:
          "Something went wrong while creating your account.",
      },
      { status: 500 }
    );
  }
}