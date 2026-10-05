import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

export default async function AdminSubscriptionPaymentsPage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/login");
  }

  const payments = await prisma.subscriptionPayment.findMany({
    orderBy: {
      createdAt: "desc",
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

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-gray-500">
            Admin Panel
          </p>

          <h1 className="text-3xl font-bold text-gray-900">
            Subscription Payments
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            Review and manage supplier subscription payments.
          </p>
        </div>

        {/* Payments Card */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">

          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                All Payments
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Total payments: {payments.length}
              </p>
            </div>

            <span className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600">
              Admin Only
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">

            {payments.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-sm font-medium text-gray-500">
                  No subscription payments found.
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Payments submitted by suppliers will appear here.
                </p>
              </div>
            ) : (
              <table className="min-w-full">

                <thead className="bg-gray-50">
                  <tr>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Store
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Plan
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Amount
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Date
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Status
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">

                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="hover:bg-gray-50"
                    >

                      {/* Store */}
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">
                          {payment.subscription.store.name}
                        </p>

                        <p className="text-xs text-gray-400">
                          Store #{payment.subscription.store.id}
                        </p>
                      </td>

                      {/* Plan */}
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">
                          {payment.subscription.plan.name}
                        </p>

                        <p className="text-xs text-gray-400">
                          {payment.subscription.plan.durationDays} days
                        </p>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">
                          Rs.{" "}
                          {Number(payment.amount).toLocaleString("en-PK")}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700">
                          {new Date(
                            payment.createdAt
                          ).toLocaleDateString("en-PK")}
                        </p>

                        <p className="text-xs text-gray-400">
                          {new Date(
                            payment.createdAt
                          ).toLocaleTimeString("en-PK")}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">

                        {payment.status === "PENDING" && (
                          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                            Pending
                          </span>
                        )}

                        {payment.status === "VERIFIED" && (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            Verified
                          </span>
                        )}

                        {payment.status === "REJECTED" && (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                            Rejected
                          </span>
                        )}

                        {![
                          "PENDING",
                          "VERIFIED",
                          "REJECTED",
                        ].includes(payment.status) && (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                            {payment.status}
                          </span>
                        )}

                      </td>

                      {/* Action */}
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/subscription-payments/${payment.id}`}
                          className="rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-700"
                        >
                          Review
                        </Link>
                      </td>

                    </tr>
                  ))}

                </tbody>
              </table>
            )}

          </div>
        </div>

      </div>
    </main>
  );
}