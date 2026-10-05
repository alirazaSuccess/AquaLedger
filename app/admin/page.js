import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/login");
  }

  const [
    totalStores,
    activeStores,
    inactiveStores,
    totalSuppliers,
    trialSubscriptions,
    activeSubscriptions,
    expiredSubscriptions,
    pendingPayments,
  ] = await Promise.all([
    prisma.store.count(),

    prisma.store.count({
      where: {
        isActive: true,
      },
    }),

    prisma.store.count({
      where: {
        isActive: false,
      },
    }),

    prisma.user.count({
      where: {
        role: "SUPPLIER",
      },
    }),

    prisma.subscription.count({
      where: {
        status: "TRIAL",
      },
    }),

    prisma.subscription.count({
      where: {
        status: "ACTIVE",
      },
    }),

    prisma.subscription.count({
      where: {
        status: "EXPIRED",
      },
    }),

    prisma.subscriptionPayment.count({
      where: {
        status: "PENDING",
      },
    }),
  ]);

  const recentStores = await prisma.store.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
    include: {
      owner: {
        select: {
          name: true,
          email: true,
        },
      },
      subscriptions: {
        orderBy: {
          endDate: "desc",
        },
        take: 1,
        include: {
          plan: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Admin Panel
            </p>

            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>

            <p className="mt-1 text-sm text-gray-600">
              Welcome, {admin.name}
            </p>
          </div>

          <div className="rounded-lg bg-white px-4 py-3 shadow-sm">
            <p className="text-xs text-gray-500">
              Admin Account
            </p>

            <p className="font-medium text-gray-900">
              {admin.email}
            </p>
          </div>
        </div>

        {/* Store Statistics */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Store Overview
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <DashboardCard
              title="Total Stores"
              value={totalStores}
            />

            <DashboardCard
              title="Active Stores"
              value={activeStores}
            />

            <DashboardCard
              title="Inactive Stores"
              value={inactiveStores}
            />

            <DashboardCard
              title="Total Suppliers"
              value={totalSuppliers}
            />

          </div>
        </section>

        {/* Subscription Statistics */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Subscription Overview
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <DashboardCard
              title="Trial Subscriptions"
              value={trialSubscriptions}
            />

            <DashboardCard
              title="Active Subscriptions"
              value={activeSubscriptions}
            />

            <DashboardCard
              title="Expired Subscriptions"
              value={expiredSubscriptions}
            />

            <DashboardCard
              title="Pending Payments"
              value={pendingPayments}
            />

          </div>
        </section>

        {/* Recent Stores */}
        <section className="rounded-xl bg-white shadow-sm">

          <div className="border-b border-gray-200 px-6 py-5">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Stores
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Recently registered supplier stores
            </p>
          </div>

          <div className="overflow-x-auto">

            {recentStores.length === 0 ? (
              <div className="px-6 py-10 text-center text-gray-500">
                No stores found.
              </div>
            ) : (
              <table className="min-w-full">

                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Store
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Owner
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Subscription
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Status
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Created
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">

                  {recentStores.map((store) => {
                    const subscription = store.subscriptions[0];

                    return (
                      <tr key={store.id}>

                        <td className="whitespace-nowrap px-6 py-4">
                          <p className="font-medium text-gray-900">
                            {store.name}
                          </p>

                          <p className="text-sm text-gray-500">
                            Store #{store.id}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <p className="text-sm font-medium text-gray-900">
                            {store.owner.name}
                          </p>

                          <p className="text-sm text-gray-500">
                            {store.owner.email}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          {subscription ? (
                            <>
                              <p className="text-sm font-medium text-gray-900">
                                {subscription.plan.name}
                              </p>

                              <p className="text-xs text-gray-500">
                                {subscription.status}
                              </p>
                            </>
                          ) : (
                            <span className="text-sm text-gray-400">
                              No subscription
                            </span>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          {store.isActive ? (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                              Active
                            </span>
                          ) : (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                              Inactive
                            </span>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {new Date(store.createdAt).toLocaleDateString(
                            "en-PK"
                          )}
                        </td>

                      </tr>
                    );
                  })}

                </tbody>
              </table>
            )}

          </div>
        </section>

      </div>
    </main>
  );
}

function DashboardCard({ title, value }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}