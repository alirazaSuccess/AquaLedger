"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import CustomerTable from "@/components/CustomerTable";
import Link from "next/link";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadCustomers = async () => {
      try {
        const response = await fetch("/api/customers");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch customers."
          );
        }

        if (!cancelled) {
          setCustomers(data);
        }
      } catch (error) {
        console.error("Fetch customers error:", error);

        if (!cancelled) {
          setError(
            error.message || "Failed to load customers."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCustomers();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 p-6">
        {loading && (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
            <p className="text-sm text-gray-500">
              Loading customers...
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mb-4 flex items-center justify-right gap-4 w-full">
              <Link
              href="/customers/inactive"
              className="my-5 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Inactive Customers
            </Link>
            <Link
              href="/customers/new"
              className="my-5 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              + Add Customer
            </Link>
            </div>
            <CustomerTable customers={customers} />
          </>
        )}
      </main>
    </>
  );
}