/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function InactiveCustomersPage() {
const [customers, setCustomers] = useState([]);
const [loading, setLoading] = useState(true);
const [activatingId, setActivatingId] = useState(null);
const [error, setError] = useState("");

// =========================
// Fetch Inactive Customers
// =========================
const fetchInactiveCustomers = async () => {
try {
setLoading(true);
setError("");

  const response = await fetch("/api/customers/inactive");

  if (!response.ok) {
    throw new Error("Failed to fetch inactive customers.");
  }

  const data = await response.json();

  setCustomers(data.customers || []);
} catch (error) {
  console.error("Fetch inactive customers error:", error);
  setError("Failed to load inactive customers.");
} finally {
  setLoading(false);
}

};

useEffect(() => {
fetchInactiveCustomers();
}, []);

// =========================
// Activate Customer
// =========================
const handleActivate = async (customer) => {
const confirmed = window.confirm(
`Are you sure you want to activate ${customer.name}?`
);

if (!confirmed) {
  return;
}

try {
  setActivatingId(customer.id);
  setError("");

  const response = await fetch(
    `/api/customers/${customer.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: customer.name,
        phone: customer.phone || "",
        deliveryLocation: customer.deliveryLocation,
        customerType: customer.customerType,
        dailyBottles: customer.dailyBottles,
        bottlePrice: customer.bottlePrice,
        startDate: customer.startDate,
        isActive: true,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "Failed to activate customer."
    );
  }

  // Remove activated customer from inactive list
  setCustomers((previousCustomers) =>
    previousCustomers.filter(
      (item) => item.id !== customer.id
    )
  );
} catch (error) {
  console.error("Activate customer error:", error);
  setError(
    error.message || "Failed to activate customer."
  );
} finally {
  setActivatingId(null);
}

};

return ( <div className="min-h-screen bg-gray-50"> <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
{/* =========================
Header
========================== */} <div className="mb-6"> <div className="mb-3 flex flex-wrap items-center gap-2"> <Link
           href="/customers"
           className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
         >
← Back to Customers </Link> </div>


      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Inactive Customers
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage customers who are currently inactive.
          </p>
        </div>

        <div className="rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-gray-200">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Inactive Customers
          </p>

          <p className="mt-1 text-xl font-bold text-gray-900">
            {customers.length}
          </p>
        </div>
      </div>
    </div>

    {/* =========================
        Error
    ========================== */}
    {error && (
      <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    )}

    {/* =========================
        Loading
    ========================== */}
    {loading ? (
      <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />

        <p className="mt-4 text-sm text-gray-500">
          Loading inactive customers...
        </p>
      </div>
    ) : customers.length === 0 ? (
      /* =========================
          Empty State
      ========================== */
      <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-2xl">
          ✓
        </div>

        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          No Inactive Customers
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          All customers are currently active.
        </p>

        <Link
          href="/customers"
          className="mt-5 inline-flex rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
        >
          Back to Customers
        </Link>
      </div>
    ) : (
      <>
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
                    Phone
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Location
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Type
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Daily Bottles
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Bottle Price
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="transition hover:bg-gray-50"
                  >
                    {/* Customer */}
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {customer.name}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          ID: {customer.id}
                        </p>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {customer.phone || "—"}
                    </td>

                    {/* Location */}
                    <td className="max-w-xs px-5 py-4 text-sm text-gray-600">
                      <span className="line-clamp-2">
                        {customer.deliveryLocation}
                      </span>
                    </td>

                    {/* Type */}
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          customer.customerType === "MONTHLY"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {customer.customerType === "MONTHLY"
                          ? "Monthly"
                          : "Cash"}
                      </span>
                    </td>

                    {/* Daily Bottles */}
                    <td className="px-5 py-4 text-sm font-medium text-gray-700">
                      {customer.dailyBottles}
                    </td>

                    {/* Bottle Price */}
                    <td className="px-5 py-4 text-sm font-medium text-gray-700">
                      Rs.{" "}
                      {Number(
                        customer.bottlePrice || 0
                      ).toLocaleString()}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/customers/${customer.id}/edit`}
                          className="rounded-lg px-3 py-2 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
                        >
                          Edit
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            handleActivate(customer)
                          }
                          disabled={
                            activatingId === customer.id
                          }
                          className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                          {activatingId === customer.id
                            ? "Activating..."
                            : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* =========================
            Mobile Cards
        ========================== */}
        <div className="space-y-3 md:hidden">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {customer.name}
                  </h3>

                  <p className="mt-1 text-xs text-gray-400">
                    ID: {customer.id}
                  </p>
                </div>

                <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                  Inactive
                </span>
              </div>

              {/* Customer Information */}
              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-400">
                    Phone
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {customer.phone || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Delivery Location
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {customer.deliveryLocation}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-400">
                      Type
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-800">
                      {customer.customerType === "MONTHLY"
                        ? "Monthly"
                        : "Cash"}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-400">
                      Daily Bottles
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-800">
                      {customer.dailyBottles}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-400">
                      Bottle Price
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-800">
                      Rs.{" "}
                      {Number(
                        customer.bottlePrice || 0
                      ).toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-400">
                      Status
                    </p>

                    <p className="mt-1 text-sm font-semibold text-red-600">
                      Inactive
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
                <Link
                  href={`/customers/${customer.id}/edit`}
                  className="flex-1 rounded-lg bg-blue-50 px-3 py-2.5 text-center text-sm font-medium text-blue-600 transition hover:bg-blue-100"
                >
                  Edit
                </Link>

                <button
                  type="button"
                  onClick={() =>
                    handleActivate(customer)
                  }
                  disabled={
                    activatingId === customer.id
                  }
                  className="flex-1 rounded-lg bg-green-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {activatingId === customer.id
                    ? "Activating..."
                    : "Activate"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </>
    )}
  </div>
</div>
);
}
