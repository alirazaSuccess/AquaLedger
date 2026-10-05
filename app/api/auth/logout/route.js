import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({
      message: "Logged out successfully.",
    });

    response.cookies.set("auth_token", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);

    return NextResponse.json(
      {
        message: "Failed to logout.",
      },
      { status: 500 }
    );
  }
}