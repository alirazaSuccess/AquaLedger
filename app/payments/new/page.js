"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function NewPaymentPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const customerIdFromUrl = searchParams.get("customerId");

    const [customers, setCustomers] = useState([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState("");
    const [loadingCustomers, setLoadingCustomers] = useState(true);

    const [amount, setAmount] = useState("");
    const [paymentDate, setPaymentDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [notes, setNotes] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =========================
    // Fetch Customers
    // =========================
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                setLoadingCustomers(true);
                setError("");

                const response = await fetch("/api/customers");

                if (!response.ok) {
                    throw new Error("Failed to fetch customers.");
                }

                const data = await response.json();

                setCustomers(data);

                // Automatically select customer from URL
                if (customerIdFromUrl) {
                    const customerExists = data.find(
                        (customer) =>
                            String(customer.id) === String(customerIdFromUrl)
                    );

                    if (customerExists) {
                        setSelectedCustomerId(String(customerExists.id));
                    }
                }
            } catch (error) {
                console.error("Fetch customers error:", error);
                setError("Failed to load customers.");
            } finally {
                setLoadingCustomers(false);
            }
        };

        fetchCustomers();

    }, [customerIdFromUrl]);

    // =========================
    // Selected Customer
    // =========================
    const selectedCustomer = customers.find(
        (customer) =>
            String(customer.id) === String(selectedCustomerId)
    );

    const totalBill = Number(selectedCustomer?.totalBill || 0);
    const paidAmount = Number(selectedCustomer?.paidAmount || 0);
    const remainingAmount = Math.max(
        totalBill - paidAmount,
        0
    );

    // =========================
    // Submit Payment
    // =========================
    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!selectedCustomerId) {
            setError("Please select a customer.");
            return;
        }

        const paymentAmount = Number(amount);

        if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
            setError("Please enter a valid payment amount.");
            return;
        }

        if (paymentAmount > remainingAmount) {
            setError(
                `Payment cannot be greater than the remaining balance of Rs. ${remainingAmount.toLocaleString()}.`
            );
            return;
        }

        try {
            setSubmitting(true);

            const response = await fetch("/api/payments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    customerId: Number(selectedCustomerId),
                    amount: paymentAmount,
                    paymentDate,
                    notes,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                    data?.message ||
                    "Failed to record payment."
                );
            }

            setSuccess("Payment recorded successfully.");

            setAmount("");
            setNotes("");

            // Return to payments page after successful payment
            setTimeout(() => {
                router.push("/payments");
                router.refresh();
            }, 700);
        } catch (error) {
            console.error("Record payment error:", error);
            setError(error.message || "Failed to record payment.");
        } finally {
            setSubmitting(false);
        }   

    };

    return (<div className="min-h-screen bg-gray-50"> <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */} <div className="mb-6"> <Link
            href="/payments"
            className="mb-3 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
        >
            ← Back to Payments </Link>

            <h1 className="text-2xl font-bold text-gray-900">
                Record Payment
            </h1>

            <p className="mt-1 text-sm text-gray-500">
                Record a payment received from a customer.
            </p>
        </div>

        {/* Error */}
        {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
            </div>
        )}

        {/* Success */}
        {success && (
            <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {success}
            </div>
        )}

        <form
            onSubmit={handleSubmit}
            className="space-y-6"
        >
            {/* Customer Selection */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Customer
                </label>

                <select
                    value={selectedCustomerId}
                    onChange={(event) =>
                        setSelectedCustomerId(event.target.value)
                    }
                    disabled={loadingCustomers}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
                >
                    <option value="">
                        {loadingCustomers
                            ? "Loading customers..."
                            : "Select customer"}
                    </option>

                    {customers.map((customer) => (
                        <option
                            key={customer.id}
                            value={customer.id}
                        >
                            {customer.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Billing Summary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Total Bill
                    </p>

                    <p className="mt-2 text-2xl font-bold text-gray-900">
                        Rs. {totalBill.toLocaleString()}
                    </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Paid Amount
                    </p>

                    <p className="mt-2 text-2xl font-bold text-green-600">
                        Rs. {paidAmount.toLocaleString()}
                    </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Remaining
                    </p>

                    <p className="mt-2 text-2xl font-bold text-red-600">
                        Rs. {remainingAmount.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Payment Details */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {/* Amount */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Payment Amount
                        </label>

                        <input
                            type="number"
                            min="1"
                            max={remainingAmount || undefined}
                            step="0.01"
                            value={amount}
                            onChange={(event) =>
                                setAmount(event.target.value)
                            }
                            placeholder="Enter amount"
                            disabled={!selectedCustomerId || remainingAmount <= 0}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
                        />

                        {selectedCustomerId &&
                            remainingAmount > 0 && (
                                <p className="mt-2 text-xs text-gray-500">
                                    Maximum payment: Rs.{" "}
                                    {remainingAmount.toLocaleString()}
                                </p>
                            )}
                    </div>

                    {/* Payment Date */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Payment Date
                        </label>

                        <input
                            type="date"
                            value={paymentDate}
                            onChange={(event) =>
                                setPaymentDate(event.target.value)
                            }
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                        />
                    </div>

                    {/* Notes */}
                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Notes
                        </label>

                        <textarea
                            value={notes}
                            onChange={(event) =>
                                setNotes(event.target.value)
                            }
                            rows={4}
                            placeholder="Optional payment notes..."
                            className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                        />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Link
                    href="/payments"
                    className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                    Cancel
                </Link>

                <button
                    type="submit"
                    disabled={
                        submitting ||
                        !selectedCustomerId ||
                        remainingAmount <= 0
                    }
                    className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                    {submitting
                        ? "Recording..."
                        : "Record Payment"}
                </button>
            </div>
        </form>
    </div>
    </div>

    );
}
