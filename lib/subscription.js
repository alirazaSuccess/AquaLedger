import prisma from "@/lib/prisma";

/**
 * Check whether a store currently has a valid subscription.
 *
 * TRIAL  -> allowed until endDate
 * ACTIVE -> allowed until endDate
 * PENDING -> blocked
 * EXPIRED -> blocked
 * CANCELLED -> blocked
 */
export async function checkStoreSubscription(storeId) {
  if (!storeId) {
    return {
      active: false,
      subscription: null,
    };
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      storeId,
    },
    orderBy: {
      endDate: "desc",
    },
    include: {
      plan: true,
    },
  });

  // No subscription exists
  if (!subscription) {
    return {
      active: false,
      subscription: null,
    };
  }

  const now = new Date();

  // =====================================================
  // EXPIRED BY DATE
  // =====================================================

  if (subscription.endDate <= now) {
    if (subscription.status !== "EXPIRED") {
      await prisma.subscription.update({
        where: {
          id: subscription.id,
        },
        data: {
          status: "EXPIRED",
        },
      });
    }

    await prisma.store.update({
      where: {
        id: storeId,
      },
      data: {
        isActive: false,
      },
    });

    return {
      active: false,
      subscription: {
        ...subscription,
        status: "EXPIRED",
      },
    };
  }

  // =====================================================
  // CANCELLED
  // =====================================================

  if (subscription.status === "CANCELLED") {
    return {
      active: false,
      subscription,
    };
  }

  // =====================================================
  // PENDING
  // =====================================================

  if (subscription.status === "PENDING") {
    return {
      active: false,
      subscription,
    };
  }

  // =====================================================
  // TRIAL
  // =====================================================

  if (subscription.status === "TRIAL") {
    return {
      active: true,
      subscription,
    };
  }

  // =====================================================
  // ACTIVE PAID SUBSCRIPTION
  // =====================================================

  if (subscription.status === "ACTIVE") {
    return {
      active: true,
      subscription,
    };
  }

  // Unknown status
  return {
    active: false,
    subscription,
  };
}