/* eslint-disable react-hooks/error-boundaries */
import Link from "next/link";
import PaymentTable from "@/components/PaymentTable";
import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

function getPakistanMonthRange() {
  const now = new Date();

  const pakistanNow = new Date(
    now.toLocaleString("en-US", {
      timeZone: "Asia/Karachi",
    })
  );

  const start = new Date(
    pakistanNow.getFullYear(),
    pakistanNow.getMonth(),
    1,
    0,
    0,
    0,
    0
  );

  const end = new Date(
    pakistanNow.getFullYear(),
    pakistanNow.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

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

function formatDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Karachi",
  }).format(new Date(date));
}

export default async function PaymentsPage({ searchParams }) {
  try {

    const params = await searchParams;

    const searchCustomer = (params?.search || "").trim().toLowerCase();
    const customerType = params?.customerType || "All Customers";
    const paymentStatus = params?.status || "All Status";
    const paymentDate = params?.date || "";
    // --------------------------------
    // Get logged-in supplier
    // --------------------------------
    const user = await getCurrentUser();

    if (!user || !user.store) {
      return (
        <>
          <Navbar />

          <main className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="mx-auto max-w-7xl">
              <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                Unauthorized. Please login again.
              </div>
            </div>
          </main>
        </>
      );
    }

    const storeId = user.store.id;

    // --------------------------------
    // Get active customers
    // --------------------------------
    const customers = await prisma.customer.findMany({
      where: {
        storeId,
        isActive: true,
      },
      include: {
        deliveries: {
          orderBy: {
            deliveryDate: "desc",
          },
        },
        payments: {
          orderBy: {
            paymentDate: "desc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // --------------------------------
    // Build customer payment data
    // --------------------------------
    const payments = customers.map((customer) => {
      const totalBill = customer.deliveries.reduce(
        (total, delivery) =>
          total + Number(delivery.totalAmount),
        0
      );

      const paidAmount = customer.payments.reduce(
        (total, payment) =>
          total + Number(payment.amount),
        0
      );

      const remaining = Math.max(
        totalBill - paidAmount,
        0
      );

      let status = "Pending";

      if (remaining === 0 && totalBill > 0) {
        status = "Paid";
      } else if (paidAmount > 0 && remaining > 0) {
        status = "Partial";
      }

      const latestPayment =
        customer.payments.length > 0
          ? customer.payments[0]
          : null;

      return {
        id: customer.id,
        customerId: customer.id,
        customerName: customer.name,
        customerType:
          customer.customerType === "MONTHLY"
            ? "Monthly"
            : "Cash",
        totalBill,
        paidAmount,
        remaining,
        status,
        latestPaymentDate: latestPayment
          ? latestPayment.paymentDate
          : null,
        paymentDates: customer.payments.map(
          (payment) => payment.paymentDate
        ),
      };
    });

    const filteredPayments = payments.filter((payment) => {
      const matchesSearch =
        !searchCustomer ||
        payment.customerName
          ?.toLowerCase()
          .includes(searchCustomer);

      const matchesCustomerType =
        customerType === "All Customers" ||
        payment.customerType === customerType;

      const matchesStatus =
        paymentStatus === "All Status" ||
        payment.status === paymentStatus;

      const matchesDate =
        !paymentDate ||
        payment.paymentDates.some((date) => {
          const pakistanDate = new Intl.DateTimeFormat(
            "en-CA",
            {
              timeZone: "Asia/Karachi",
            }
          ).format(new Date(date));

          return pakistanDate === paymentDate;
        });

      return (
        matchesSearch &&
        matchesCustomerType &&
        matchesStatus &&
        matchesDate
      );
    });

    // --------------------------------
    // Payment summary
    // --------------------------------
    const { start, end } = getPakistanMonthRange();

    const monthlyPayments =
      await prisma.payment.aggregate({
        where: {
          storeId,
          paymentDate: {
            gte: start,
            lte: end,
          },
        },
        _sum: {
          amount: true,
        },
      });

    const totalReceivedThisMonth =
      Number(monthlyPayments._sum.amount || 0);

    const pendingPayments = payments.reduce(
      (total, customer) =>
        total + customer.remaining,
      0
    );

    const paidCustomers = payments.filter(
      (customer) =>
        customer.totalBill > 0 &&
        customer.remaining === 0
    ).length;

    const pendingCustomers = payments.filter(
      (customer) =>
        customer.remaining > 0
    ).length;

    // --------------------------------
    // Recent payments
    // --------------------------------
    const recentPayments = await prisma.payment.findMany({
      where: {
        storeId,
      },
      include: {
        customer: true,
      },
      orderBy: {
        paymentDate: "desc",
      },
      take: 10,
    });

    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-gray-50 p-4 md:p-8">
          <div className="mx-auto max-w-7xl">

            {/* Header */}
            <div className="mb-6">
              <Link
                href="/"
                className="mb-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                ← Back to Dashboard
              </Link>

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Payments
                  </h1>

                  <p className="mt-1 text-sm text-gray-500">
                    Record customer payments and manage pending balances.
                  </p>
                </div>

                <Link
                  href="/payments/new"
                  className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700"
                >
                  + Record Payment
                </Link>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

              {/* Total Received */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Total Received
                </p>

                <h2 className="mt-2 text-2xl font-bold text-green-600">
                  Rs.{" "}
                  {totalReceivedThisMonth.toLocaleString()}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  This month
                </p>
              </div>

              {/* Pending */}
              <div className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm">
                <p className="text-sm text-red-600">
                  Pending Payments
                </p>

                <h2 className="mt-2 text-2xl font-bold text-red-600">
                  Rs.{" "}
                  {pendingPayments.toLocaleString()}
                </h2>

                <p className="mt-1 text-xs text-red-500">
                  Outstanding balance
                </p>
              </div>

              {/* Paid Customers */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Paid Customers
                </p>

                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  {paidCustomers}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Fully paid
                </p>
              </div>

              {/* Pending Customers */}
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 shadow-sm">
                <p className="text-sm text-yellow-700">
                  Pending Customers
                </p>

                <h2 className="mt-2 text-2xl font-bold text-yellow-700">
                  {pendingCustomers}
                </h2>

                <p className="mt-1 text-xs text-yellow-600">
                  Customers with balance
                </p>
              </div>
            </div>

            {/* Filters */}
            <form
              method="GET"
              className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

                {/* Search */}
                <div>
                  <label
                    htmlFor="search-customer"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Search Customer
                  </label>

                  <input
                    id="search-customer"
                    name="search"
                    type="text"
                    defaultValue={params?.search || ""}
                    placeholder="Search customer..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Customer Type */}
                <div>
                  <label
                    htmlFor="customer-type"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Customer Type
                  </label>

                  <select
                    id="customer-type"
                    name="customerType"
                    defaultValue={customerType}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="All Customers">
                      All Customers
                    </option>

                    <option value="Cash">
                      Cash
                    </option>

                    <option value="Monthly">
                      Monthly
                    </option>
                  </select>
                </div>

                {/* Payment Status */}
                <div>
                  <label
                    htmlFor="payment-status"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Payment Status
                  </label>

                  <select
                    id="payment-status"
                    name="status"
                    defaultValue={paymentStatus}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="All Status">
                      All Status
                    </option>

                    <option value="Paid">
                      Paid
                    </option>

                    <option value="Partial">
                      Partial
                    </option>

                    <option value="Pending">
                      Pending
                    </option>
                  </select>
                </div>

                {/* Payment Date */}
                <div>
                  <label
                    htmlFor="payment-date"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Payment Date
                  </label>

                  <input
                    id="payment-date"
                    name="date"
                    type="date"
                    defaultValue={paymentDate}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-700"
                >
                  Apply Filters
                </button>
              </div>
            </form>

            {/* Payments Table */}
            <PaymentTable payments={filteredPayments} />

            {/* Recent Payment History */}
            <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

              <div className="border-b border-gray-200 p-5">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Payments
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Latest payments received from customers.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">

                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-6 py-4">
                        Date
                      </th>

                      <th className="px-6 py-4">
                        Customer
                      </th>

                      <th className="px-6 py-4">
                        Amount
                      </th>

                      <th className="px-6 py-4">
                        Note
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">

                    {recentPayments.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          No payments recorded yet.
                        </td>
                      </tr>
                    ) : (
                      recentPayments.map(
                        (payment) => (
                          <tr
                            key={
                              payment.id
                            }
                          >
                            <td className="px-6 py-4">
                              {formatDate(
                                payment.paymentDate
                              )}
                            </td>

                            <td className="px-6 py-4 font-medium">
                              {
                                payment
                                  .customer
                                  .name
                              }
                            </td>

                            <td className="px-6 py-4 font-semibold text-green-600">
                              Rs.{" "}
                              {Number(
                                payment.amount
                              ).toLocaleString()}
                            </td>

                            <td className="px-6 py-4 text-gray-500">
                              {payment.notes ||
                                "—"}
                            </td>
                          </tr>
                        )
                      )
                    )}

                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>
      </>
    );
  } catch (error) {
    console.error("Payments page error:", error);

    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-gray-50 p-4 md:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              Failed to load payment data.
            </div>
          </div>
        </main>
      </>
    );
  }
}