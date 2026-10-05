import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        price: "asc",
      },
      select: {
        id: true,
        name: true,
        price: true,
        durationDays: true,
      },
    });

    const formattedPlans = plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      price: Number(plan.price),
      durationDays: plan.durationDays,
    }));

    return NextResponse.json(formattedPlans);
  } catch (error) {
    console.error("Failed to fetch subscription plans:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch subscription plans",
      },
      {
        status: 500,
      }
    );
  }
}