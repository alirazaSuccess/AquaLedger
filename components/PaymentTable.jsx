"use client";
import { DollarSign } from "lucide-react";
import Link from "next/link";

export default function PaymentTable({
  payments = [],
  onRecordPayment,
  onView,
}) {
  const getPaymentStatus = (payment) => {
    const bill = Number(payment.totalBill || 0);
    const paid = Number(payment.paidAmount || 0);
    const remaining = Math.max(bill - paid, 0);

    if (remaining <= 0 && bill > 0) {
      return "Paid";
    }

    if (paid > 0 && remaining > 0) {
      return "Partial";
    }

    return "Pending";
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700";

      case "Partial":
        return "bg-yellow-100 text-yellow-700";

      case "Pending":
      default:
        return "bg-red-100 text-red-700";
    }
  };

  // const handleRecordPayment = (payment) => {
  //   if (onRecordPayment) {
  //     onRecordPayment(payment);
  //     return;
  //   }

  //   console.log("Record payment:", payment);
  // };

  // const handleView = (payment) => {
  //   if (onView) {
  //     onView(payment);
  //     return;
  //   }

  //   console.log("View payment:", payment);
  // };

  // Empty State
  if (payments.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-2xl">
          <DollarSign />
        </div>

        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          No Payments Found
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          There are no payment records available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* =========================
          Desktop Table
      ========================== */}
      <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Customer
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Type
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Total Bill
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Paid
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Remaining
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {payments.map((payment) => {
                const id = payment._id || payment.id;

                const totalBill = Number(payment.totalBill || 0);
                const paidAmount = Number(payment.paidAmount || 0);

                const remainingAmount = Math.max(
                  totalBill - paidAmount,
                  0
                );

                const status = getPaymentStatus(payment);

                return (
                  <tr
                    key={id}
                    className="transition hover:bg-gray-50"
                  >
                    {/* Customer */}
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {payment.customerName || payment.name}
                        </p>

                        {payment.customerId && (
                          <p className="mt-1 text-xs text-gray-400">
                            {payment.customerId}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${payment.customerType === "Monthly"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-green-100 text-green-700"
                          }`}
                      >
                        {payment.customerType || "Cash"}
                      </span>
                    </td>

                    {/* Total Bill */}
                    <td className="px-5 py-4 text-sm font-medium text-gray-700">
                      Rs. {totalBill.toLocaleString()}
                    </td>

                    {/* Paid */}
                    <td className="px-5 py-4 text-sm font-medium text-green-600">
                      Rs. {paidAmount.toLocaleString()}
                    </td>

                    {/* Remaining */}
                    <td className="px-5 py-4 text-sm font-semibold text-red-600">
                      Rs. {remainingAmount.toLocaleString()}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                          status
                        )}`}
                      >
                        {status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/customers/${payment.customerId}`}
                          className="rounded-lg px-3 py-2 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
                        >
                          View
                        </Link>

                        {remainingAmount > 0 && (
                          <Link
                            href={`/payments/new?customerId=${payment.customerId}`}
                            className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-green-700"
                          >
                            Record Payment
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================
          Mobile Cards
      ========================== */}
      <div className="space-y-3 md:hidden">
        {payments.map((payment) => {
          const id = payment._id || payment.id;

          const totalBill = Number(payment.totalBill || 0);
          const paidAmount = Number(payment.paidAmount || 0);

          const remainingAmount = Math.max(
            totalBill - paidAmount,
            0
          );

          const status = getPaymentStatus(payment);

          return (
            <div
              key={id}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {payment.customerName || payment.name}
                  </h3>

                  {payment.customerId && (
                    <p className="mt-1 text-xs text-gray-400">
                      {payment.customerId}
                    </p>
                  )}

                  <p className="mt-1 text-xs text-gray-500">
                    {payment.customerType || "Cash"} Customer
                  </p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                    status
                  )}`}
                >
                  {status}
                </span>
              </div>

              {/* Payment Information */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-400">
                    Total Bill
                  </p>

                  <p className="mt-1 font-semibold text-gray-800">
                    Rs. {totalBill.toLocaleString()}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-400">
                    Paid Amount
                  </p>

                  <p className="mt-1 font-semibold text-green-600">
                    Rs. {paidAmount.toLocaleString()}
                  </p>
                </div>

                <div className="rounded-lg bg-red-50 p-3">
                  <p className="text-xs text-red-400">
                    Remaining
                  </p>

                  <p className="mt-1 font-semibold text-red-600">
                    Rs. {remainingAmount.toLocaleString()}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-400">
                    Payment Status
                  </p>

                  <p className="mt-1 font-semibold text-gray-800">
                    {status}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
                        <Link
                          href={`/customers/${payment.customerId}`}
                          className="rounded-lg px-3 py-2 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
                        >
                          View
                        </Link>

                {remainingAmount > 0 && (
                  <Link
                    href={`/payments/new?customerId=${payment.customerId}`}
                    className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-green-700"
                  >
                    Record Payment
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}