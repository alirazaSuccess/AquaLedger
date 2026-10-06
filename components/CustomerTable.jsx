"use client";
import { useState } from "react";
import { UserRoundGroup } from "lucide-react";
import Link from "next/link";

export default function CustomerTable({
    customers = [],
    onDelete,
}) {
    const [deletingId, setDeletingId] = useState(null);
    const handleDelete = async (customer) => {
        const customerId = customer.id || customer._id;

        const confirmed = window.confirm(
            `Are you sure you want to delete ${customer.name}?`
        );

        if (!confirmed) return;

        try {
            setDeletingId(customerId);

            if (onDelete) {
                await onDelete(customer);
                return;
            }

            const response = await fetch(`/api/customers/${customerId}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to delete customer."
                );
            }

            window.location.reload();
        } catch (error) {
            console.error("Delete customer error:", error);
            window.alert(error.message || "Failed to delete customer.");
        } finally {
            setDeletingId(null);
        }
    };

    if (customers.length === 0) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
                    <UserRoundGroup />
                </div>

                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    No Customers Found
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                    There are no customers to display.
                </p>

                <Link
                    href="/customers/new"
                    className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                    + Add Customer
                </Link>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
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
                                Price
                            </th>

                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Status
                            </th>

                            <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {customers.map((customer) => (
                            <tr
                                key={customer._id || customer.id}
                                className="transition hover:bg-gray-50"
                            >
                                {/* Customer */}
                                <td className="px-5 py-4">
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {customer.name}
                                        </p>

                                        {customer.customerId && (
                                            <p className="mt-1 text-xs text-gray-400">
                                                {customer.customerId}
                                            </p>
                                        )}
                                    </div>
                                </td>

                                {/* Phone */}
                                <td className="px-5 py-4 text-sm text-gray-600">
                                    {customer.phone || "-"}
                                </td>

                                {/* Location */}
                                <td className="max-w-45 px-5 py-4 text-sm text-gray-600">
                                    <span className="line-clamp-2">
                                        {customer.address ||
                                            customer.deliveryLocation ||
                                            "-"}
                                    </span>
                                </td>

                                {/* Customer Type */}
                                <td className="px-5 py-4">
                                    <span
                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${customer.type === "Monthly"
                                            ? "bg-purple-100 text-purple-700"
                                            : "bg-green-100 text-green-700"
                                            }`}
                                    >
                                        {customer.type || customer.customerType || "Cash"}
                                    </span>
                                </td>

                                {/* Daily Bottles */}
                                <td className="px-5 py-4 text-sm font-medium text-gray-700">
                                    {customer.dailyBottles || 0}
                                </td>

                                {/* Price */}
                                <td className="px-5 py-4 text-sm font-medium text-gray-700">
                                    Rs. {Number(customer.bottlePrice || 0).toLocaleString()}
                                </td>

                                {/* Status */}
                                <td className="px-5 py-4">
                                    <span
                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${customer.isActive === false ||
                                            customer.status === "Inactive"
                                            ? "bg-red-100 text-red-700"
                                            : "bg-green-100 text-green-700"
                                            }`}
                                    >
                                        {customer.isActive === false ||
                                            customer.status === "Inactive"
                                            ? "Inactive"
                                            : "Active"}
                                    </span>
                                </td>

                                {/* Actions */}
                                <td className="px-5 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link
                                            href={`/customers/${customer._id || customer.id
                                                }`}
                                            className="rounded-lg px-3 py-2 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
                                        >
                                            View
                                        </Link>

                                        <Link
                                            href={`/customers/${customer._id || customer.id
                                                }/edit`}
                                            className="rounded-lg px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-100"
                                        >
                                            Edit
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() => handleDelete(customer)}
                                            disabled={deletingId === (customer.id || customer._id)}
                                            className="rounded-lg px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
                                        >
                                            {deletingId === (customer.id || customer._id)
                                                ? "Deleting..."
                                                : "Delete"}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="divide-y divide-gray-100 md:hidden">
                {customers.map((customer) => {
                    const isInactive =
                        customer.isActive === false ||
                        customer.status === "Inactive";

                    const customerType =
                        customer.type ||
                        customer.customerType ||
                        "Cash";

                    return (
                        <div
                            key={customer._id || customer.id}
                            className="p-4"
                        >
                            {/* Customer Header */}
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        {customer.name}
                                    </h3>

                                    <p className="mt-1 text-sm text-gray-500">
                                        {customer.phone || "No phone number"}
                                    </p>
                                </div>

                                <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${isInactive
                                        ? "bg-red-100 text-red-700"
                                        : "bg-green-100 text-green-700"
                                        }`}
                                >
                                    {isInactive ? "Inactive" : "Active"}
                                </span>
                            </div>

                            {/* Customer Information */}
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-gray-400">
                                        Type
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-gray-700">
                                        {customerType}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400">
                                        Daily Bottles
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-gray-700">
                                        {customer.dailyBottles || 0}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400">
                                        Bottle Price
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-gray-700">
                                        Rs.{" "}
                                        {Number(
                                            customer.bottlePrice || 0
                                        ).toLocaleString()}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400">
                                        Location
                                    </p>

                                    <p className="mt-1 line-clamp-2 text-sm font-medium text-gray-700">
                                        {customer.address ||
                                            customer.deliveryLocation ||
                                            "-"}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
                                <Link
                                    href={`/customers/${customer._id || customer.id
                                        }`}
                                    className="flex-1 rounded-lg bg-blue-50 px-3 py-2 text-center text-sm font-medium text-blue-600"
                                >
                                    View
                                </Link>

                                <Link
                                    href={`/customers/${customer._id || customer.id
                                        }/edit`}
                                    className="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-center text-sm font-medium text-gray-700"
                                >
                                    Edit
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(customer)}
                                    disabled={deletingId === (customer.id || customer._id)}
                                    className="flex-1 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600"
                                >
                                    {deletingId === (customer.id || customer._id)
                                        ? "Deleting..."
                                        : "Delete"}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}