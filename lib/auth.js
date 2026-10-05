import { jwtVerify } from "jose";
import prisma from "@/lib/prisma";
import { checkStoreSubscription } from "@/lib/subscription";

const authSecret = process.env.AUTH_SECRET;

if (!authSecret) {
  throw new Error("AUTH_SECRET is not defined");
}

const secret = new TextEncoder().encode(authSecret);

// =====================================================
// GET CURRENT AUTHENTICATED USER
// Supports both ADMIN and SUPPLIER sessions
// =====================================================

export async function getCurrentUser() {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();

    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, secret);

    if (!payload.userId || !payload.role) {
      return null;
    }

    const userId = Number(payload.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
      return null;
    }

    // =================================================
    // ADMIN
    // =================================================

    if (payload.role === "ADMIN") {
      const admin = await prisma.admin.findUnique({
        where: {
          id: userId,
        },
      });

      if (!admin) {
        return null;
      }

      if (!admin.isActive) {
        return null;
      }

      return {
        ...admin,
        role: "ADMIN",
        store: null,
      };
    }

    // =================================================
    // SUPPLIER
    // =================================================

    if (payload.role === "SUPPLIER") {
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          store: true,
        },
      });

      if (!user) {
        return null;
      }

      if (user.role !== "SUPPLIER") {
        return null;
      }

      if (!user.isActive) {
        return null;
      }

      if (!user.store) {
        return null;
      }

      if (!user.store.isActive) {
        return null;
      }

      // Check subscription
      const subscriptionCheck = await checkStoreSubscription(
        user.store.id
      );

      if (!subscriptionCheck.active) {
        return null;
      }

      return {
        ...user,
        store: {
          ...user.store,
          subscription: subscriptionCheck.subscription,
        },
      };
    }

    return null;
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

// =====================================================
// GET CURRENT ADMIN
// =====================================================

export async function getCurrentAdmin() {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();

    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, secret);

    if (payload.role !== "ADMIN" || !payload.userId) {
      return null;
    }

    const adminId = Number(payload.userId);

    if (!Number.isInteger(adminId) || adminId <= 0) {
      return null;
    }

    const admin = await prisma.admin.findUnique({
      where: {
        id: adminId,
      },
    });

    if (!admin) {
      return null;
    }

    if (!admin.isActive) {
      return null;
    }

    return {
      ...admin,
      role: "ADMIN",
    };
  } catch (error) {
    console.error("Admin authentication error:", error);
    return null;
  }
}

// =====================================================
// GET CURRENT SUPPLIER
// =====================================================

export async function getCurrentSupplier() {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();

    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, secret);

    if (payload.role !== "SUPPLIER" || !payload.userId) {
      return null;
    }

    const userId = Number(payload.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        store: true,
      },
    });

    if (!user) {
      return null;
    }

    if (user.role !== "SUPPLIER") {
      return null;
    }

    if (!user.isActive) {
      return null;
    }

    if (!user.store) {
      return null;
    }

    if (!user.store.isActive) {
      return null;
    }

    // Check subscription status and expiry
    const subscriptionCheck = await checkStoreSubscription(
      user.store.id
    );

    if (!subscriptionCheck.active) {
      return null;
    }

    return {
      ...user,
      store: {
        ...user.store,
        subscription: subscriptionCheck.subscription,
      },
    };
  } catch (error) {
    console.error("Supplier authentication error:", error);
    return null;
  }
}

// =====================================================
// GET CURRENT STORE
// =====================================================

export async function getCurrentStore() {
  const user = await getCurrentSupplier();

  if (!user || !user.store) {
    return null;
  }

  return user.store;
}

// =====================================================
// GET CURRENT STORE ID
// =====================================================

export async function getCurrentStoreId() {
  const store = await getCurrentStore();

  if (!store) {
    return null;
  }

  return store.id;
}