"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import CustomerForm from "@/components/CustomerForm";

export default function NewCustomerPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateCustomer = async (customerData) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: customerData.name,
          phone: customerData.phone,
          deliveryLocation: customerData.address,

          // CustomerForm uses "Cash" / "Monthly"
          // Prisma uses "CASH" / "MONTHLY"
          customerType:
            customerData.customerType === "Monthly"
              ? "MONTHLY"
              : "CASH",

          dailyBottles: Number(customerData.dailyBottles),
          bottlePrice: Number(customerData.bottlePrice),
          startDate: customerData.startDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create customer."
        );
      }

      // Customer successfully saved in MySQL
      router.push("/customers");
      router.refresh();
    } catch (error) {
      console.error("Create customer error:", error);

      setError(
        error.message || "Something went wrong while creating the customer."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/customers"
            className="mb-2 inline-block text-sm text-blue-600 hover:text-blue-700"
          >
            ← Back to Customers
          </Link>

          <h1 className="text-2xl font-bold text-gray-900">
            Add New Customer
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Add a new customer and set their delivery details.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className={loading ? "pointer-events-none opacity-70" : ""}>
          <CustomerForm
            mode="create"
            onSubmit={handleCreateCustomer}
          />
        </div>

        {loading && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Creating customer...
          </div>
        )}
      </main>
    </div>
  );
}