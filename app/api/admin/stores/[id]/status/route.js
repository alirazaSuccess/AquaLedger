import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

export async function PATCH(request, { params }) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const storeId = Number(id);

    if (!Number.isInteger(storeId)) {
      return NextResponse.json(
        { error: "Invalid store ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive must be a boolean" },
        { status: 400 }
      );
    }

    const store = await prisma.store.findUnique({
      where: {
        id: storeId,
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }

    const updatedStore = await prisma.store.update({
      where: {
        id: storeId,
      },
      data: {
        isActive,
      },
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: isActive
        ? "Store activated successfully"
        : "Store deactivated successfully",
      store: updatedStore,
    });
  } catch (error) {
    console.error("Admin store status update error:", error);

    return NextResponse.json(
      {
        error: "Failed to update store status",
      },
      {
        status: 500,
      }
    );
  }
}