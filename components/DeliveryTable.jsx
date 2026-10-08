"use client";

import { Truck } from "lucide-react";
import { useState } from "react";

export default function DeliveryTable({
    deliveries = [],
    deliveryDate,
    onSave,
    onSaveAll,
}) {
    const [deliveryData, setDeliveryData] = useState(
        deliveries.map((delivery) => ({
            ...delivery,
            actualBottles:
                delivery.actualBottles ??
                delivery.defaultBottles ??
                delivery.dailyBottles ??
                0,
            status: delivery.status || "Pending",
        }))
    );
    const [savingId, setSavingId] = useState(null);
    const [savingAll, setSavingAll] = useState(false);

    const handleBottleChange = (id, value) => {
        setDeliveryData((previous) =>
            previous.map((delivery) =>
                (delivery._id || delivery.id) === id
                    ? {
                        ...delivery,
                        actualBottles: value,
                    }
                    : delivery
            )
        );
    };

    const handleStatusChange = (id, value) => {
        setDeliveryData((previous) =>
            previous.map((delivery) =>
                (delivery._id || delivery.id) === id
                    ? {
                        ...delivery,
                        status: value,
                    }
                    : delivery
            )
        );
    };

    const handleSave = async (delivery) => {
        const deliveryId = delivery._id || delivery.id;

        if (savingId === deliveryId || savingAll) return;

        // Already saved delivery ko dobara save nahi karna
        if (delivery.isExistingDelivery) {
            return;
        }

        setSavingId(deliveryId);

        const status = delivery.status;
        const bottles = Number(delivery.actualBottles || 0);

        // Pending / Skipped do not need a delivery record
        if (status === "Pending" || status === "Skipped") {
            setDeliveryData((previous) =>
                previous.filter(
                    (item) =>
                        (item._id || item.id) !==
                        (delivery._id || delivery.id)
                )
            );

            setSavingId(null);
            return;
        }

        // Delivered requires bottles
        if (status === "Delivered" && bottles <= 0) {
            alert("Please enter the actual bottle quantity.");
            setSavingId(null);
            return;
        }

        if (!delivery.customerId) {
            alert("Customer ID is missing.");
            setSavingId(null);
            return;
        }

        try {
            const response = await fetch("/api/deliveries", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    customerId: delivery.customerId,
                    bottles,
                    deliveryDate: delivery.deliveryDate || deliveryDate,
                }),
            });

            const data = await response.json();

            // Duplicate delivery already exists
            if (response.status === 409) {
                setDeliveryData((previous) =>
                    previous.filter(
                        (item) =>
                            (item._id || item.id) !==
                            (delivery._id || delivery.id)
                    )
                );

                alert("This customer's delivery is already saved for this date.");
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to save delivery."
                );
            }

            // Remove saved row from UI
            setDeliveryData((previous) =>
                previous.filter(
                    (item) =>
                        (item._id || item.id) !==
                        (delivery._id || delivery.id)
                )
            );

            if (onSave) {
                onSave(data.delivery);
            }

            alert("Delivery saved successfully.");
        } catch (error) {
            console.error("Save delivery error:", error);
            alert(error.message || "Failed to save delivery.");
        } finally {
            setSavingId(null);
        }
    };

    const handleSaveAll = async () => {
        if (savingAll) return;

        setSavingAll(true);

        try {
            const processedIds = [];
            let savedCount = 0;
            let skippedCount = 0;

            for (const delivery of deliveryData) {
                const deliveryId = delivery._id || delivery.id;
                const status = delivery.status;
                const bottles = Number(delivery.actualBottles || 0);

                // Already saved delivery ko skip karo
                if (delivery.isExistingDelivery) {
                    processedIds.push(deliveryId);
                    skippedCount++;
                    continue;
                }

                // Pending / Skipped
                if (status === "Pending" || status === "Skipped") {
                    processedIds.push(deliveryId);
                    continue;
                }

                // Delivered must have bottles
                if (status === "Delivered" && bottles <= 0) {
                    throw new Error(
                        `Please enter bottle quantity for ${delivery.customerName || "customer"
                        }.`
                    );
                }

                if (!delivery.customerId) {
                    throw new Error(
                        `Customer ID is missing for ${delivery.customerName || "customer"
                        }.`
                    );
                }

                const response = await fetch("/api/deliveries", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        customerId: delivery.customerId,
                        bottles,
                        deliveryDate:
                            delivery.deliveryDate || deliveryDate,
                    }),
                });

                const data = await response.json();

                // Duplicate delivery:
                // skip it and continue with the next customer
                if (response.status === 409) {
                    processedIds.push(deliveryId);
                    skippedCount++;
                    continue;
                }

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        `Failed to save ${delivery.customerName || "delivery"
                        }.`
                    );
                }

                processedIds.push(deliveryId);
                savedCount++;
            }

            // Remove processed rows from UI
            setDeliveryData((previous) =>
                previous.filter(
                    (delivery) =>
                        !processedIds.includes(
                            delivery._id || delivery.id
                        )
                )
            );

            if (onSaveAll) {
                onSaveAll(processedIds);
            }

            if (skippedCount > 0) {
                alert(
                    `Deliveries processed successfully.\n\nSaved: ${savedCount}\nAlready saved/skipped: ${skippedCount}`
                );
            } else {
                alert(
                    `Deliveries processed successfully.\n\nSaved: ${savedCount}`
                );
            }
        } catch (error) {
            console.error("Save all deliveries error:", error);
            alert(
                error.message || "Failed to save deliveries."
            );
        } finally {
            setSavingAll(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "Delivered":
                return "bg-green-100 text-green-700";

            case "Skipped":
                return "bg-gray-100 text-gray-700";

            case "Pending":
            default:
                return "bg-yellow-100 text-yellow-700";
        }
    };

    if (deliveries.length === 0) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-2xl">
                    <Truck />
                </div>

                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    No Deliveries Found
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                    There are no deliveries available for this date.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Desktop Table */}
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
                                    Default
                                </th>

                                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Actual Bottles
                                </th>

                                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Price
                                </th>

                                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Total
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
                            {deliveryData.map((delivery) => {
                                const id = delivery._id || delivery.id;
                                const actualBottles = Number(
                                    delivery.actualBottles || 0
                                );
                                const price = Number(
                                    delivery.bottlePrice || 0
                                );
                                const total = actualBottles * price;

                                return (
                                    <tr
                                        key={id}
                                        className="transition hover:bg-gray-50"
                                    >
                                        {/* Customer */}
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-gray-900">
                                                {delivery.customerName ||
                                                    delivery.name}
                                            </p>

                                            {delivery.address && (
                                                <p className="mt-1 max-w-45 truncate text-xs text-gray-400">
                                                    {delivery.address}
                                                </p>
                                            )}
                                        </td>

                                        {/* Customer Type */}
                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${delivery.customerType ===
                                                    "Monthly"
                                                    ? "bg-purple-100 text-purple-700"
                                                    : "bg-green-100 text-green-700"
                                                    }`}
                                            >
                                                {delivery.customerType || "Cash"}
                                            </span>
                                        </td>

                                        {/* Default Bottles */}
                                        <td className="px-5 py-4 text-sm text-gray-600">
                                            {delivery.defaultBottles ??
                                                delivery.dailyBottles ??
                                                0}
                                        </td>

                                        {/* Actual Bottles */}
                                        <td className="px-5 py-4">
                                            <input
                                                type="number"
                                                min="0"
                                                value={delivery.actualBottles}
                                                onChange={(e) =>
                                                    handleBottleChange(
                                                        id,
                                                        e.target.value
                                                    )
                                                }
                                                className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </td>

                                        {/* Price */}
                                        <td className="px-5 py-4 text-sm font-medium text-gray-700">
                                            Rs.{" "}
                                            {price.toLocaleString()}
                                        </td>

                                        {/* Total */}
                                        <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                                            Rs. {total.toLocaleString()}
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-4">
                                            <select
                                                value={delivery.status}
                                                onChange={(e) =>
                                                    handleStatusChange(
                                                        id,
                                                        e.target.value
                                                    )
                                                }
                                                className={`rounded-full border-0 px-3 py-2 text-xs font-medium outline-none ${getStatusStyle(
                                                    delivery.status
                                                )}`}
                                            >
                                                <option value="Pending">
                                                    Pending
                                                </option>

                                                <option value="Delivered">
                                                    Delivered
                                                </option>

                                                <option value="Skipped">
                                                    Skipped
                                                </option>
                                            </select>
                                        </td>

                                        {/* Action */}
                                        <td className="px-5 py-4 text-right">
                                            {delivery.isExistingDelivery ? (
                                                <span className="inline-flex rounded-lg bg-green-100 px-4 py-2 text-xs font-medium text-green-700">
                                                    Already Saved
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => handleSave(delivery)}
                                                    disabled={savingId === id || savingAll}
                                                    className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-700"
                                                >
                                                    {savingId === id ? "Saving..." : "Save"}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Save All */}
                <div className="flex justify-end border-t border-gray-200 bg-gray-50 px-5 py-4">
                    <button
                        type="button"
                        onClick={handleSaveAll}
                        disabled={savingAll || savingId !== null}
                        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                        {savingAll ? "Saving..." : "Save All Changes"}
                    </button>
                </div>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-3 md:hidden">
                {deliveryData.map((delivery) => {
                    const id = delivery._id || delivery.id;

                    const actualBottles = Number(
                        delivery.actualBottles || 0
                    );

                    const price = Number(
                        delivery.bottlePrice || 0
                    );

                    const total = actualBottles * price;

                    return (
                        <div
                            key={id}
                            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        {delivery.customerName ||
                                            delivery.name}
                                    </h3>

                                    <p className="mt-1 text-xs text-gray-500">
                                        {delivery.customerType || "Cash"} Customer
                                    </p>
                                </div>

                                <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                                        delivery.status
                                    )}`}
                                >
                                    {delivery.status}
                                </span>
                            </div>

                            {/* Location */}
                            {delivery.address && (
                                <p className="mt-3 text-sm text-gray-500">
                                    📍 {delivery.address}
                                </p>
                            )}

                            {/* Delivery Information */}
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <div className="rounded-lg bg-gray-50 p-3">
                                    <p className="text-xs text-gray-400">
                                        Default
                                    </p>

                                    <p className="mt-1 font-semibold text-gray-800">
                                        {delivery.defaultBottles ??
                                            delivery.dailyBottles ??
                                            0}{" "}
                                        bottles
                                    </p>
                                </div>

                                <div className="rounded-lg bg-gray-50 p-3">
                                    <p className="text-xs text-gray-400">
                                        Bottle Price
                                    </p>

                                    <p className="mt-1 font-semibold text-gray-800">
                                        Rs. {price.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Actual Bottles */}
                            <div className="mt-4">
                                <label
                                    htmlFor={`bottles-${id}`}
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Actual Delivered Bottles
                                </label>

                                <input
                                    id={`bottles-${id}`}
                                    type="number"
                                    min="0"
                                    value={delivery.actualBottles}
                                    onChange={(e) =>
                                        handleBottleChange(
                                            id,
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            {/* Status */}
                            <div className="mt-4">
                                <label
                                    htmlFor={`status-${id}`}
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Delivery Status
                                </label>

                                <select
                                    id={`status-${id}`}
                                    value={delivery.status}
                                    onChange={(e) =>
                                        handleStatusChange(
                                            id,
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="Pending">
                                        Pending
                                    </option>

                                    <option value="Delivered">
                                        Delivered
                                    </option>

                                    <option value="Skipped">
                                        Skipped
                                    </option>
                                </select>
                            </div>

                            {/* Total */}
                            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                                <span className="text-sm text-gray-500">
                                    Delivery Total
                                </span>

                                <span className="text-lg font-bold text-gray-900">
                                    Rs. {total.toLocaleString()}
                                </span>
                            </div>

                            {/* Save */}
                            {delivery.isExistingDelivery ? (
                                <div className="mt-4 w-full rounded-lg bg-green-100 px-4 py-3 text-center text-sm font-medium text-green-700">
                                    Already Saved for This Date
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => handleSave(delivery)}
                                    disabled={savingId === id || savingAll}
                                    className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
                                >
                                    {savingId === id ? "Saving..." : "Save Delivery"}
                                </button>
                            )}
                        </div>
                    );
                })}

                {/* Mobile Save All */}
                <button
                    type="button"
                    onClick={handleSaveAll}
                    className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                    Save All Changes
                </button>
            </div>
        </div>
    );
}