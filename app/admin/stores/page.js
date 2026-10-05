import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import StoreStatusButton from "./StoreStatusButton";

export default async function AdminStoresPage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/login");
  }

  const stores = await prisma.store.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isActive: true,
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
              price: true,
              durationDays: true,
            },
          },
        },
      },
      _count: {
        select: {
          customers: true,
          deliveries: true,
          payments: true,
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <p className="text-sm font-medium text-gray-500">
            Admin Panel
          </p>

          <h1 className="text-3xl font-bold text-gray-900">
            Store Management
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            Manage all supplier stores and their accounts.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm">

          <div className="border-b border-gray-200 px-6 py-5">
            <h2 className="text-xl font-semibold text-gray-900">
              All Stores
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Total stores: {stores.length}
            </p>
          </div>

          <div className="overflow-x-auto">

            {stores.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
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
                      Customers
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Actions
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Created
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">

                  {stores.map((store) => {
                    const subscription = store.subscriptions[0];

                    return (
                      <tr key={store.id} className="hover:bg-gray-50">

                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">
                            {store.name}
                          </p>

                          <p className="text-sm text-gray-500">
                            Store #{store.id}
                          </p>

                          {store.phone && (
                            <p className="text-sm text-gray-500">
                              {store.phone}
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">
                            {store.owner.name}
                          </p>

                          <p className="text-sm text-gray-500">
                            {store.owner.email}
                          </p>

                          {store.owner.phone && (
                            <p className="text-sm text-gray-500">
                              {store.owner.phone}
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {subscription ? (
                            <div>
                              <p className="font-medium text-gray-900">
                                {subscription.plan.name}
                              </p>

                              <p className="text-sm text-gray-500">
                                {subscription.status}
                              </p>

                              <p className="text-xs text-gray-400">
                                Ends:{" "}
                                {new Date(
                                  subscription.endDate
                                ).toLocaleDateString("en-PK")}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">
                              No subscription
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700">
                            <p>
                              Customers:{" "}
                              <strong>
                                {store._count.customers}
                              </strong>
                            </p>

                            <p>
                              Deliveries:{" "}
                              <strong>
                                {store._count.deliveries}
                              </strong>
                            </p>

                            <p>
                              Payments:{" "}
                              <strong>
                                {store._count.payments}
                              </strong>
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="space-y-2">

                            {store.isActive ? (
                              <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                Store Active
                              </span>
                            ) : (
                              <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                                Store Inactive
                              </span>
                            )}

                            {store.owner.isActive ? (
                              <span className="block text-xs text-green-600">
                                Account Active
                              </span>
                            ) : (
                              <span className="block text-xs text-red-600">
                                Account Inactive
                              </span>
                            )}

                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <StoreStatusButton
                            storeId={store.id}
                            isActive={store.isActive}
                          />
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {new Date(
                            store.createdAt
                          ).toLocaleDateString("en-PK")}
                        </td>

                      </tr>
                    );
                  })}

                </tbody>
              </table>
            )}

          </div>
        </div>

      </div>
    </main>
  );
}