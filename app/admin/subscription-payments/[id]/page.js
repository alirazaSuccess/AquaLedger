import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

export default async function AdminSubscriptionPaymentDetailPage({
  params,
}) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/login");
  }

  const { id } = await params;
  const paymentId = Number(id);

  if (!Number.isInteger(paymentId)) {
    notFound();
  }

  const payment = await prisma.subscriptionPayment.findUnique({
    where: {
      id: paymentId,
    },
    include: {
      subscription: {
        include: {
          store: true,
          plan: true,
        },
      },
    },
  });

  if (!payment) {
    notFound();
  }

  async function updatePaymentStatus(formData) {
    "use server";

    const currentAdmin = await getCurrentAdmin();

    if (!currentAdmin) {
      redirect("/login");
    }

    const status = formData.get("status")?.toString();

    if (!["VERIFIED", "REJECTED"].includes(status)) {
      throw new Error("Invalid payment status.");
    }

    const currentPayment = await prisma.subscriptionPayment.findUnique({
      where: {
        id: paymentId,
      },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!currentPayment) {
      throw new Error("Payment not found.");
    }

    if (currentPayment.status !== "PENDING") {
      throw new Error("This payment has already been processed.");
    }

    await prisma.$transaction(async (tx) => {
      await tx.subscriptionPayment.update({
        where: {
          id: paymentId,
        },
        data: {
          status,
        },
      });

      if (status === "VERIFIED") {
        const startDate = new Date();
        const endDate = new Date(startDate);

        endDate.setDate(
          endDate.getDate() + currentPayment.subscription.plan.durationDays
        );

        await tx.subscription.update({
          where: {
            id: currentPayment.subscriptionId,
          },
          data: {
            status: "ACTIVE",
            startDate,
            endDate,
          },
        });

        await tx.store.update({
          where: {
            id: currentPayment.subscription.storeId,
          },
          data: {
            isActive: true,
          },
        });
      }

      if (status === "REJECTED") {
        await tx.subscription.update({
          where: {
            id: currentPayment.subscriptionId,
          },
          data: {
            status: "CANCELLED",
          },
        });
      }
    });

    redirect("/admin/subscription-payments");
  }

  const paymentStatus = payment.status;

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/subscription-payments"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back to Subscription Payments
          </Link>

          <p className="mt-6 text-sm font-medium text-gray-500">
            Admin Panel
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Subscription Payment
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Review and verify the supplier subscription payment.
          </p>
        </div>

        {/* Payment Information */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">

          <div className="border-b border-gray-200 px-6 py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Payment #{payment.id}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Submitted on{" "}
                  {new Date(payment.createdAt).toLocaleString("en-PK")}
                </p>
              </div>

              {paymentStatus === "PENDING" && (
                <span className="w-fit rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                  Pending
                </span>
              )}

              {paymentStatus === "VERIFIED" && (
                <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  Verified
                </span>
              )}

              {paymentStatus === "REJECTED" && (
                <span className="w-fit rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                  Rejected
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-2">

            {/* Store */}
            <div className="rounded-lg border border-gray-200 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Store
              </p>

              <p className="mt-2 text-lg font-semibold text-gray-900">
                {payment.subscription.store.name}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Store ID: {payment.subscription.store.id}
              </p>
            </div>

            {/* Plan */}
            <div className="rounded-lg border border-gray-200 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Subscription Plan
              </p>

              <p className="mt-2 text-lg font-semibold text-gray-900">
                {payment.subscription.plan.name}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Duration: {payment.subscription.plan.durationDays} days
              </p>
            </div>

            {/* Amount */}
            <div className="rounded-lg border border-gray-200 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Payment Amount
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                Rs.{" "}
                {Number(payment.amount).toLocaleString("en-PK")}
              </p>
            </div>

            {/* Payment Date */}
            <div className="rounded-lg border border-gray-200 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Payment Date
              </p>

              <p className="mt-2 text-lg font-semibold text-gray-900">
                {new Date(payment.createdAt).toLocaleDateString("en-PK")}
              </p>
            </div>

            {/* Reference */}
            {payment.reference && (
              <div className="rounded-lg border border-gray-200 p-5 md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Payment Reference
                </p>

                <p className="mt-2 break-all text-sm font-medium text-gray-900">
                  {payment.reference}
                </p>
              </div>
            )}

            {/* Notes */}
            {payment.notes && (
              <div className="rounded-lg border border-gray-200 p-5 md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Notes
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                  {payment.notes}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          {paymentStatus === "PENDING" && (
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">

                <form action={updatePaymentStatus}>
                  <input
                    type="hidden"
                    name="status"
                    value="REJECTED"
                  />

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 sm:w-auto"
                  >
                    Reject Payment
                  </button>
                </form>

                <form action={updatePaymentStatus}>
                  <input
                    type="hidden"
                    name="status"
                    value="VERIFIED"
                  />

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 sm:w-auto"
                  >
                    Verify Payment
                  </button>
                </form>

              </div>
            </div>
          )}

          {/* Already Processed */}
          {paymentStatus !== "PENDING" && (
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-5">
              <p className="text-center text-sm font-medium text-gray-600">
                This payment has already been{" "}
                {paymentStatus.toLowerCase()}.
              </p>
            </div>
          )}
        </div>

        {/* Subscription Information */}
        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Subscription Information
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Subscription ID
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900">
                {payment.subscription.id}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Subscription Status
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900">
                {payment.subscription.status}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Store Status
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900">
                {payment.subscription.store.isActive
                  ? "Active"
                  : "Inactive"}
              </p>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}