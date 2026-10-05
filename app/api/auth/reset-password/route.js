import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();

    const token = body.token?.trim();
    const password = body.password;

    if (!token) {
      return NextResponse.json(
        { message: "Reset token is required." },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { message: "New password is required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          message: "Password must be at least 8 characters long.",
        },
        { status: 400 }
      );
    }

    // Hash the token so we can compare it with the stored hash
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find the reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: {
        tokenHash,
      },
      include: {
        user: {
          include: {
            store: true,
          },
        },
      },
    });

    if (!resetToken) {
      return NextResponse.json(
        {
          message: "Invalid or expired password reset link.",
        },
        { status: 400 }
      );
    }

    // Token can only be used once
    if (resetToken.usedAt) {
      return NextResponse.json(
        {
          message: "This password reset link has already been used.",
        },
        { status: 400 }
      );
    }

    // Check token expiration
    if (resetToken.expiresAt <= new Date()) {
      return NextResponse.json(
        {
          message:
            "This password reset link has expired. Please request a new one.",
        },
        { status: 400 }
      );
    }

    // Make sure this is a supplier account
    if (!resetToken.user || resetToken.user.role !== "SUPPLIER") {
      return NextResponse.json(
        {
          message: "Invalid password reset request.",
        },
        { status: 400 }
      );
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update password and consume the token together
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: resetToken.userId,
        },
        data: {
          passwordHash,
        },
      });

      await tx.passwordResetToken.update({
        where: {
          id: resetToken.id,
        },
        data: {
          usedAt: new Date(),
        },
      });

      // Remove any other unused reset tokens for this user
      await tx.passwordResetToken.deleteMany({
        where: {
          userId: resetToken.userId,
          usedAt: null,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message:
        "Your password has been reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return NextResponse.json(
      {
        message: "Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }
}