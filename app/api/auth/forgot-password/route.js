import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request) {
  try {
    const body = await request.json();

    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required." },
        { status: 400 }
      );
    }

    // Find supplier account
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        store: true,
      },
    });

    // Email not found in database
    if (!user) {
      return NextResponse.json(
        {
          message:
            "Email not found in database. Please use your registered email address.",
        },
        { status: 404 }
      );
    }

    // Only supplier accounts can reset password
    if (user.role !== "SUPPLIER") {
      return NextResponse.json(
        {
          message:
            "This email is not registered as a supplier account.",
        },
        { status: 403 }
      );
    }

    // Generate secure random token
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Store only the hash in database
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // Token expires after 30 minutes
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    // Remove previous unused tokens
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
    });

    // Save new reset token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    // Create reset URL
    const resetUrl = `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/reset-password?token=${rawToken}`;

    console.log("Sending password reset email to:", user.email);

    // Send reset email
    const emailResult = await sendPasswordResetEmail({
      to: user.email,
      resetUrl,
      userName: user.name,
    });

    if (!emailResult.success) {
      console.error(
        "Failed to send password reset email:",
        emailResult.error
      );

      // Remove the token because the email wasn't sent
      await prisma.passwordResetToken.deleteMany({
        where: {
          userId: user.id,
          tokenHash,
        },
      });

      return NextResponse.json(
        {
          message:
            "Unable to send the password reset email. Please try again later.",
        },
        { status: 500 }
      );
    }

    console.log(
      "Password reset email sent successfully:",
      emailResult.data?.id
    );

    return NextResponse.json({
      success: true,
      message:
        "Password reset link has been sent to your registered email address.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return NextResponse.json(
      {
        message: "Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }
}