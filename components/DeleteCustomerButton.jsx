"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteCustomerButton({ customerId, customerName }) {
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (deleting) return;

        const confirmed = window.confirm(
            `Are you sure you want to delete ${customerName}?`
        );

        if (!confirmed) return;

        try {
            setDeleting(true);

            const response = await fetch(`/api/customers/${customerId}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to delete customer."
                );
            }

            alert("Customer deleted successfully.");

            router.push("/customers");
            router.refresh();
        } catch (error) {
            console.error("Delete customer error:", error);
            alert(error.message || "Failed to delete customer.");
            setDeleting(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
            {deleting ? "Deleting..." : "Delete Customer"}
        </button>
    );
}