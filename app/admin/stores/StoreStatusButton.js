"use client";

import { useState } from "react";

export default function StoreStatusButton({
  storeId,
  isActive,
}) {
  const [active, setActive] = useState(Boolean(isActive));
  const [loading, setLoading] = useState(false);

  async function handleStatusChange() {
    const newStatus = !active;

    const confirmed = window.confirm(
      newStatus
        ? "Are you sure you want to activate this store?"
        : "Are you sure you want to deactivate this store?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `/api/admin/stores/${storeId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isActive: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to update store status"
        );
      }

      // Update button state using the actual new status
      setActive(data.store.isActive);
    } catch (error) {
      console.error("Store status update error:", error);

      alert(
        error.message || "Failed to update store status"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleStatusChange}
      disabled={loading}
      className={`rounded-lg px-4 py-2 text-xs font-semibold text-white transition ${
        active
          ? "bg-red-600 hover:bg-red-700"
          : "bg-green-600 hover:bg-green-700"
      } ${
        loading
          ? "cursor-not-allowed opacity-50"
          : ""
      }`}
    >
      {loading
        ? "Updating..."
        : active
          ? "Deactivate"
          : "Activate"}
    </button>
  );
}