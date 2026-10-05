"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import CustomerForm from "@/components/CustomerForm";

export default function EditCustomerPage() {
const params = useParams();
const router = useRouter();

const customerId = params.id;

const [customer, setCustomer] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
let cancelled = false;

const fetchCustomer = async () => {
  try {
    const response = await fetch(`/api/customers/${customerId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to fetch customer."
      );
    }

    if (!cancelled) {
      setCustomer({
        ...data.customer,
        address: data.customer.deliveryLocation,
        customerType:
          data.customer.customerType === "MONTHLY"
            ? "Monthly"
            : "Cash",
        dailyBottles: Number(data.customer.dailyBottles),
        bottlePrice: Number(data.customer.bottlePrice),
        startDate: data.customer.startDate?.slice(0, 10),
      });
    }
  } catch (error) {
    console.error("Fetch customer error:", error);

    if (!cancelled) {
      setError(
        error.message || "Failed to load customer."
      );
    }
  } finally {
    if (!cancelled) {
      setLoading(false);
    }
  }
};

if (customerId) {
  fetchCustomer();
}

return () => {
  cancelled = true;
};

}, [customerId]);

const handleUpdateCustomer = async (customerData) => {
try {
setError("");

  const response = await fetch(
    `/api/customers/${customerId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: customerData.name,
        phone: customerData.phone,
        deliveryLocation: customerData.address,
        customerType:
          customerData.customerType === "Monthly"
            ? "MONTHLY"
            : "CASH",
        dailyBottles: Number(customerData.dailyBottles),
        bottlePrice: Number(customerData.bottlePrice),
        startDate: customerData.startDate,
        isActive: customerData.isActive,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to update customer."
    );
  }

  router.push(`/customers/${customerId}`);
  router.refresh();
} catch (error) {
  console.error("Update customer error:", error);

  setError(
    error.message || "Something went wrong while updating the customer."
  );
}

};

if (loading) {
return (
<main className="min-h-screen bg-gray-50 p-4 md:p-8">
<div className="mx-auto max-w-4xl">
<p className="text-sm text-gray-500">
Loading customer...
</p>
</div>
</main>
);
}

if (error) {
return (
<main className="min-h-screen bg-gray-50 p-4 md:p-8">
<div className="mx-auto max-w-4xl">
<Link href="/customers" className="mb-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-800" >
← Back to Customers
</Link>

      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    </div>
  </main>
);

}

if (!customer) {
return null;
}

return (
<main className="min-h-screen bg-gray-50 p-4 md:p-8">
<div className="mx-auto max-w-4xl">

    {/* Header */}
    <div className="mb-6">
      <Link
        href={`/customers/${customerId}`}
        className="mb-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
      >
        ← Back to Customer
      </Link>

      <h1 className="text-2xl font-bold text-gray-900">
        Edit Customer
      </h1>

      <p className="mt-1 text-sm text-gray-500">
        Update customer information and delivery settings.
      </p>
    </div>

    {/* Form */}
    <CustomerForm
      mode="edit"
      initialData={customer}
      onSubmit={handleUpdateCustomer}
    />
  </div>
</main>

);
}