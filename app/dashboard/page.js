/* eslint-disable react-hooks/error-boundaries */
import Link from "next/link";
import DashboardCard from "@/components/DashboardCard";
import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Clock, DollarSign, Droplets, UserRoundGroup } from "lucide-react";

function getPakistanTodayRange() {
  const now = new Date();

  // Pakistan Standard Time = UTC + 5
  const pakistanNow = new Date(
    now.toLocaleString("en-US", {
      timeZone: "Asia/Karachi",
    })
  );

  const start = new Date(pakistanNow);
  start.setHours(0, 0, 0, 0);

  const end = new Date(pakistanNow);
  end.setHours(23, 59, 59, 999);

  // Convert Pakistan local time back to UTC
  const utcStart = new Date(
    start.getTime() - 5 * 60 * 60 * 1000
  );

  const utcEnd = new Date(
    end.getTime() - 5 * 60 * 60 * 1000
  );

  return {
    start: utcStart,
    end: utcEnd,
  };
}

export default async function Dashboard() {
  try {
    // --------------------------------
    // Get logged-in supplier
    // --------------------------------
    const user = await getCurrentUser();

    if (!user || !user.store) {
      return (
        <>
          <Navbar />

          <main className="min-h-screen bg-gray-50 p-6">
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
              Unauthorized. Please login again.
            </div>
          </main>
        </>
      );
    }

    // --------------------------------
    // Current Store
    // --------------------------------
    const storeId = user.store.id;
    const storeName = user.store.name;

    const { start, end } = getPakistanTodayRange();

    // --------------------------------
    // Total Active Customers
    // --------------------------------
    const totalCustomers = await prisma.customer.count({
      where: {
        storeId,
        isActive: true,
      },
    });

    // --------------------------------
    // Today's Deliveries
    // --------------------------------
    const todaysDeliveries = await prisma.delivery.findMany({
      where: {
        storeId,
        deliveryDate: {
          gte: start,
          lte: end,
        },
        customer: {
          isActive: true,
        },
      },
      include: {
        customer: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // --------------------------------
    // Today's Bottles
    // --------------------------------
    const todaysBottles = todaysDeliveries.reduce(
      (total, delivery) => total + delivery.bottles,
      0
    );

    // --------------------------------
    // Today's Sales
    // --------------------------------
    const todaysSales = todaysDeliveries.reduce(
      (total, delivery) =>
        total + Number(delivery.totalAmount),
      0
    );

    // --------------------------------
    // Total Delivery Bills
    // --------------------------------
    const totalDeliveryAmount =
      await prisma.delivery.aggregate({
        where: {
          storeId,
        },
        _sum: {
          totalAmount: true,
        },
      });

    // --------------------------------
    // Total Payments Received
    // --------------------------------
    const totalPayments = await prisma.payment.aggregate({
      where: {
        storeId,
      },
      _sum: {
        amount: true,
      },
    });

    const totalBilled = Number(
      totalDeliveryAmount._sum.totalAmount || 0
    );

    const totalPaid = Number(
      totalPayments._sum.amount || 0
    );

    const pendingPayments = Math.max(
      totalBilled - totalPaid,
      0
    );

    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-gray-50 p-6">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {storeName} Dashboard
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage customers, daily deliveries and payments.
              </p>
            </div>

            <Link
              href="/customers/new"
              className="inline-flex w-fit items-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              + Add Customer
            </Link>
          </div>

          {/* Statistics */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DashboardCard
              title="Total Customers"
              value={totalCustomers.toString()}
              subtitle="Active customers"
              icon={<UserRoundGroup />}
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
            />

            <DashboardCard
              title="Today's Bottles"
              value={todaysBottles.toString()}
              subtitle="Bottles delivered today"
              icon={<Droplets />}
              iconBg="bg-cyan-100"
              iconColor="text-cyan-600"
            />

            <DashboardCard
              title="Today's Sales"
              value={`Rs. ${todaysSales.toLocaleString()}`}
              subtitle="Today's total sales"
              icon={<DollarSign />}
              iconBg="bg-green-100"
              iconColor="text-green-600"
            />

            <DashboardCard
              title="Pending Payments"
              value={`Rs. ${pendingPayments.toLocaleString()}`}
              subtitle="Amount to be collected"
              icon={<Clock />}
              iconBg="bg-orange-100"
              iconColor="text-orange-600"
            />
          </section>

          {/* Today's Deliveries */}
          <section className="mt-8 rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* Section Header */}
            <div className="flex flex-col gap-3 border-b border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Today&apos;s Deliveries
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Customer delivery records for today.
                </p>
              </div>

              <Link
                href="/deliveries"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                View All Deliveries →
              </Link>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-187.5 text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Location
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Default Bottles
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Delivered
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {todaysDeliveries.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-10 text-center text-sm text-gray-500"
                      >
                        No deliveries recorded for today.
                      </td>
                    </tr>
                  ) : (
                    todaysDeliveries.map((delivery) => (
                      <tr
                        key={delivery.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-900">
                            {delivery.customer.name}
                          </p>

                          <p className="text-xs text-gray-500">
                            {delivery.customer.customerType ===
                              "MONTHLY"
                              ? "Monthly Customer"
                              : "Cash Customer"}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {delivery.customer.deliveryLocation}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {delivery.customer.dailyBottles}
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-gray-900">
                          {delivery.bottles}
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                          Rs.{" "}
                          {Number(
                            delivery.totalAmount
                          ).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="mt-8">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Link
                href="/customers"
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
              >
                <h3 className="font-semibold text-gray-900">
                  <UserRoundGroup/> Customers
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  View and manage all customers.
                </p>
              </Link>

              <Link
                href="/deliveries"
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
              >
                <h3 className="font-semibold text-gray-900">
                  <Droplets /> Daily Deliveries
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Manage today&apos;s bottle deliveries.
                </p>
              </Link>

              <Link
                href="/payments"
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
              >
                <h3 className="font-semibold text-gray-900">
                  <DollarSign /> Payments
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Track bills and pending payments.
                </p>
              </Link>
            </div>
          </section>
        </main>
      </>
    );
  } catch (error) {
    console.error("Dashboard error:", error);

    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-gray-50 p-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            Failed to load dashboard data.
          </div>
        </main>
      </>
    );
  }
}