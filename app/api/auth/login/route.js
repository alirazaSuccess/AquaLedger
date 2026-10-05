import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import prisma from "@/lib/prisma";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "change-this-secret-in-env"
);

export async function POST(request) {
  try {
    const body = await request.json();

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          message: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    /*
     * =====================================================
     * ADMIN LOGIN
     * =====================================================
     */

    const admin = await prisma.admin.findUnique({
      where: {
        email: cleanEmail,
      },
    });

    if (admin) {
      // Check admin account status
      if (!admin.isActive) {
        return NextResponse.json(
          {
            message: "Admin account is currently inactive.",
          },
          { status: 403 }
        );
      }

      // Verify admin password
      const passwordValid = await bcrypt.compare(
        password,
        admin.passwordHash
      );

      // Get login information
      const ipAddress =
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        null;

      const userAgent = request.headers.get("user-agent") || null;

      // Record failed admin login
      if (!passwordValid) {
        await prisma.adminLogin.create({
          data: {
            adminId: admin.id,
            ipAddress,
            userAgent,
            success: false,
          },
        });

        return NextResponse.json(
          {
            message: "Invalid email or password.",
          },
          { status: 401 }
        );
      }

      // Record successful admin login
      await prisma.adminLogin.create({
        data: {
          adminId: admin.id,
          ipAddress,
          userAgent,
          success: true,
        },
      });

      // Create admin JWT
      const token = await new SignJWT({
        userId: admin.id,
        role: "ADMIN",
      })
        .setProtectedHeader({
          alg: "HS256",
        })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secret);

      const response = NextResponse.json(
        {
          message: "Login successful.",
          user: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: "ADMIN",
          },
          store: null,
        },
        { status: 200 }
      );

      response.cookies.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    /*
     * =====================================================
     * SUPPLIER LOGIN
     * =====================================================
     */

    const user = await prisma.user.findUnique({
      where: {
        email: cleanEmail,
      },
      include: {
        store: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    // Supplier account status
    if (!user.isActive) {
      return NextResponse.json(
        {
          message: "Your account is currently inactive.",
        },
        { status: 403 }
      );
    }

    // Verify supplier password
    const passwordValid = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordValid) {
      return NextResponse.json(
        {
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    // Supplier must have a store
    if (!user.store) {
      return NextResponse.json(
        {
          message: "No store is connected to this account.",
        },
        { status: 403 }
      );
    }

    // Store must be active
    if (!user.store.isActive) {
      return NextResponse.json(
        {
          message:
            "Your store is currently inactive. Please contact the administrator.",
        },
        { status: 403 }
      );
    }

    // Create supplier JWT
    const token = await new SignJWT({
      userId: user.id,
      storeId: user.store.id,
      role: "SUPPLIER",
    })
      .setProtectedHeader({
        alg: "HS256",
      })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    const response = NextResponse.json(
      {
        message: "Login successful.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: "SUPPLIER",
        },
        store: {
          id: user.store.id,
          name: user.store.name,
        },
      },
      { status: 200 }
    );

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        message: "Something went wrong while logging in.",
      },
      { status: 500 }
    );
  }
}