import Link from "next/link";
import Navbar from "@/components/Navbar";
import prisma from "@/lib/prisma";

export default async function CustomerDetailsPage({ params }) {
  const { id } = await params;
  const customerId = Number(id);

  if (!Number.isInteger(customerId) || customerId <= 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 p-4 md:p-8">
          <div className="mx-auto max-w-7xl">
            <Link
              href="/customers"
              className="mb-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              ← Back to Customers
            </Link>

            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
              Invalid customer ID.
            </div>
          </div>
        </main>
      </>
    );
  }

  const customer = await prisma.customer.findUnique({
    where: {
      id: customerId,
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
  });

  if (!customer) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 p-4 md:p-8">
          <div className="mx-auto max-w-7xl">
            <Link
              href="/customers"
              className="mb-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              ← Back to Customers
            </Link>

            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
              Customer not found.
            </div>
          </div>
        </main>
      </>
    );
  }

  const totalBottles = customer.deliveries.reduce(
    (sum, delivery) => sum + delivery.bottles,
    0
  );

  const totalBill = customer.deliveries.reduce(
    (sum, delivery) => sum + Number(delivery.totalAmount),
    0
  );

  const totalPaid = customer.payments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  );

  const remainingAmount = Math.max(totalBill - totalPaid, 0);

  const customerType =
    customer.customerType === "MONTHLY" ? "Monthly" : "Cash";

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Karachi",
    }).format(new Date(date));
  };

  const formatLongDate = (date) => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Karachi",
    }).format(new Date(date));
  };

  const formatMonthYear = (date) => {
    return new Intl.DateTimeFormat("en-GB", {
      month: "long",
      year: "numeric",
      timeZone: "Asia/Karachi",
    }).format(new Date(date));
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="mx-auto max-w-7xl">

          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <Link
                href="/customers"
                className="mb-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                ← Back to Customers
              </Link>

              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {customer.name}
                </h1>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    customerType === "Monthly"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {customerType}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    customer.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {customer.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Customer ID: #CUS-{String(customer.id).padStart(3, "0")}
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                href={`/customers/${customer.id}/edit`}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Edit Customer
              </Link>

              <button
                type="button"
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete Customer
              </button>
            </div>
          </div>

          {/* Customer Information */}
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-gray-900">
              Customer Information
            </h2>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

              <div>
                <p className="text-sm text-gray-500">Customer Name</p>
                <p className="mt-1 font-medium text-gray-900">
                  {customer.name}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="mt-1 font-medium text-gray-900">
                  {customer.phone || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Customer Type</p>
                <p className="mt-1 font-medium text-gray-900">
                  {customerType}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Delivery Location</p>
                <p className="mt-1 font-medium text-gray-900">
                  {customer.deliveryLocation}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Default Daily Bottles</p>
                <p className="mt-1 font-medium text-gray-900">
                  {customer.dailyBottles} Bottles
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Current Bottle Price</p>
                <p className="mt-1 font-medium text-gray-900">
                  Rs. {Number(customer.bottlePrice).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Delivery Start Date</p>
                <p className="mt-1 font-medium text-gray-900">
                  {formatLongDate(customer.startDate)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Billing Type</p>
                <p className="mt-1 font-medium text-gray-900">
                  {customerType === "Monthly"
                    ? "Monthly Billing"
                    : "Cash Billing"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Customer Status</p>
                <p
                  className={`mt-1 font-medium ${
                    customer.isActive
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  {customer.isActive ? "Active" : "Inactive"}
                </p>
              </div>

            </div>
          </div>

          {/* Billing Summary */}
          <div className="mb-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Billing Summary
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

              {/* Total Bottles */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Total Bottles
                </p>

                <h3 className="mt-2 text-2xl font-bold text-gray-900">
                  {totalBottles.toLocaleString()}
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  All deliveries
                </p>
              </div>

              {/* Total Bill */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Total Bill
                </p>

                <h3 className="mt-2 text-2xl font-bold text-gray-900">
                  Rs. {totalBill.toLocaleString()}
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Total delivered amount
                </p>
              </div>

              {/* Paid */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Paid Amount
                </p>

                <h3 className="mt-2 text-2xl font-bold text-green-600">
                  Rs. {totalPaid.toLocaleString()}
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Payments received
                </p>
              </div>

              {/* Remaining */}
              <div className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm">
                <p className="text-sm text-red-600">
                  Remaining Amount
                </p>

                <h3 className="mt-2 text-2xl font-bold text-red-600">
                  Rs. {remainingAmount.toLocaleString()}
                </h3>

                <p className="mt-1 text-xs text-red-500">
                  Pending payment
                </p>
              </div>

            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-6 flex flex-wrap gap-3">
            <Link
              href="/deliveries"
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              + Add Delivery
            </Link>

            <Link
              href="/payments"
              className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700"
            >
              + Record Payment
            </Link>
          </div>

          {/* Delivery History */}
          <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-gray-200 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Delivery History
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Daily water bottle delivery records
                </p>
              </div>

              <div className="text-sm text-gray-500">
                {customer.deliveries.length > 0
                  ? formatMonthYear(customer.deliveries[0].deliveryDate)
                  : "No deliveries"}
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Bottles</th>
                    <th className="px-6 py-4">Bottle Price</th>
                    <th className="px-6 py-4">Total Amount</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {customer.deliveries.length > 0 ? (
                    customer.deliveries.map((delivery) => (
                      <tr key={delivery.id}>
                        <td className="px-6 py-4 text-gray-700">
                          {formatDate(delivery.deliveryDate)}
                        </td>

                        <td className="px-6 py-4 font-medium text-gray-900">
                          {delivery.bottles}
                        </td>

                        <td className="px-6 py-4">
                          Rs.{" "}
                          {Number(
                            delivery.bottlePrice
                          ).toLocaleString()}
                        </td>

                        <td className="px-6 py-4 font-medium">
                          Rs.{" "}
                          {Number(
                            delivery.totalAmount
                          ).toLocaleString()}
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                            Delivered
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        No delivery records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Delivery Cards */}
            <div className="divide-y divide-gray-100 md:hidden">
              {customer.deliveries.length > 0 ? (
                customer.deliveries.map((delivery) => (
                  <div key={delivery.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">
                        {formatDate(delivery.deliveryDate)}
                      </p>

                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                        Delivered
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Bottles</p>
                        <p className="font-medium">
                          {delivery.bottles}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500">Price</p>
                        <p className="font-medium">
                          Rs.{" "}
                          {Number(
                            delivery.bottlePrice
                          ).toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500">Total</p>
                        <p className="font-medium">
                          Rs.{" "}
                          {Number(
                            delivery.totalAmount
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-sm text-gray-500">
                  No delivery records found.
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 p-4 text-center">
              <Link
                href="/deliveries"
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                View All Deliveries →
              </Link>
            </div>
          </div>

          {/* Payment History */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Payment History
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Payments received from this customer
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Note</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {customer.payments.length > 0 ? (
                    customer.payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-6 py-4">
                          {formatDate(payment.paymentDate)}
                        </td>

                        <td className="px-6 py-4 font-semibold text-green-600">
                          Rs.{" "}
                          {Number(payment.amount).toLocaleString()}
                        </td>

                        <td className="px-6 py-4 text-gray-500">
                          {payment.notes || "—"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        No payment records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
              <span className="font-medium text-gray-700">
                Total Paid
              </span>

              <span className="font-bold text-green-600">
                Rs. {totalPaid.toLocaleString()}
              </span>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}