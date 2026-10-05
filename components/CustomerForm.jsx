"use client";

import { useState } from "react";

export default function CustomerForm({
  initialData = {},
  mode = "create",
  onSubmit,
}) {
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    phone: initialData.phone || "",
    address:
      initialData.address ||
      initialData.deliveryLocation ||
      "",
    customerType:
      initialData.customerType ||
      initialData.type ||
      "Cash",
    dailyBottles: initialData.dailyBottles || "",
    bottlePrice: initialData.bottlePrice || "",
    startDate:
      initialData.startDate ||
      initialData.deliveryStartDate ||
      new Date().toISOString().split("T")[0],
    isActive:
      initialData.isActive !== undefined
        ? initialData.isActive
        : true,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Customer name is required.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Delivery location is required.";
    }

    if (!formData.dailyBottles) {
      newErrors.dailyBottles =
        "Daily bottle quantity is required.";
    } else if (Number(formData.dailyBottles) <= 0) {
      newErrors.dailyBottles =
        "Bottle quantity must be greater than 0.";
    }

    if (!formData.bottlePrice) {
      newErrors.bottlePrice =
        "Bottle price is required.";
    } else if (Number(formData.bottlePrice) <= 0) {
      newErrors.bottlePrice =
        "Bottle price must be greater than 0.";
    }

    if (!formData.startDate) {
      newErrors.startDate =
        "Delivery start date is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    const customerData = {
      ...formData,
      dailyBottles: Number(formData.dailyBottles),
      bottlePrice: Number(formData.bottlePrice),
    };

    if (onSubmit) {
      onSubmit(customerData);
      return;
    }

    console.log(
      mode === "edit"
        ? "Update Customer:"
        : "Create Customer:",
      customerData
    );
  };

  const dailyBill =
    Number(formData.dailyBottles || 0) *
    Number(formData.bottlePrice || 0);

  const monthlyEstimate = dailyBill * 30;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Customer Information
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Enter the customer&apos;s basic contact and delivery
            information.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Customer Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Customer Name
              <span className="text-red-500"> *</span>
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Ahmed Store"
              className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition focus:ring-2 ${
                errors.name
                  ? "border-red-400 focus:ring-red-100"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />

            {errors.name && (
              <p className="mt-1 text-xs text-red-500">
                {errors.name}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Phone Number
              <span className="text-red-500"> *</span>
            </label>

            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="0300-1234567"
              className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition focus:ring-2 ${
                errors.phone
                  ? "border-red-400 focus:ring-red-100"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />

            {errors.phone && (
              <p className="mt-1 text-xs text-red-500">
                {errors.phone}
              </p>
            )}
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label
              htmlFor="address"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Delivery Location / Address
              <span className="text-red-500"> *</span>
            </label>

            <textarea
              id="address"
              name="address"
              rows={3}
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. House 123, Street x, Abc, City"
              className={`w-full resize-none rounded-lg border px-4 py-3 text-sm outline-none transition focus:ring-2 ${
                errors.address
                  ? "border-red-400 focus:ring-red-100"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />

            {errors.address && (
              <p className="mt-1 text-xs text-red-500">
                {errors.address}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Delivery & Billing */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Delivery & Billing
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Set the customer&apos;s delivery quantity and current
            bottle price.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Customer Type */}
          <div>
            <label
              htmlFor="customerType"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Customer Type
            </label>

            <select
              id="customerType"
              name="customerType"
              value={formData.customerType}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="Cash">Cash</option>
              <option value="Monthly">Monthly</option>
            </select>

            <p className="mt-1 text-xs text-gray-400">
              Cash customers pay immediately. Monthly
              customers can pay later.
            </p>
          </div>

          {/* Daily Bottles */}
          <div>
            <label
              htmlFor="dailyBottles"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Default Daily Bottles
              <span className="text-red-500"> *</span>
            </label>

            <input
              id="dailyBottles"
              name="dailyBottles"
              type="number"
              min="1"
              value={formData.dailyBottles}
              onChange={handleChange}
              placeholder="e.g. 10"
              className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition focus:ring-2 ${
                errors.dailyBottles
                  ? "border-red-400 focus:ring-red-100"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />

            {errors.dailyBottles && (
              <p className="mt-1 text-xs text-red-500">
                {errors.dailyBottles}
              </p>
            )}
          </div>

          {/* Bottle Price */}
          <div>
            <label
              htmlFor="bottlePrice"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Current Bottle Price
              <span className="text-red-500"> *</span>
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                Rs.
              </span>

              <input
                id="bottlePrice"
                name="bottlePrice"
                type="number"
                min="1"
                value={formData.bottlePrice}
                onChange={handleChange}
                placeholder="100"
                className={`w-full rounded-lg border py-3 pl-12 pr-4 text-sm outline-none transition focus:ring-2 ${
                  errors.bottlePrice
                    ? "border-red-400 focus:ring-red-100"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
                }`}
              />
            </div>

            {errors.bottlePrice && (
              <p className="mt-1 text-xs text-red-500">
                {errors.bottlePrice}
              </p>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label
              htmlFor="startDate"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Delivery Start Date
              <span className="text-red-500"> *</span>
            </label>

            <input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition focus:ring-2 ${
                errors.startDate
                  ? "border-red-400 focus:ring-red-100"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />

            {errors.startDate && (
              <p className="mt-1 text-xs text-red-500">
                {errors.startDate}
              </p>
            )}
          </div>
        </div>

        {/* Price History Notice */}
        {mode === "edit" && (
          <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex gap-3">
              <span className="text-lg">⚠️</span>

              <div>
                <p className="text-sm font-semibold text-yellow-800">
                  Price History
                </p>

                <p className="mt-1 text-xs leading-5 text-yellow-700">
                  Changing the bottle price will only affect
                  future deliveries. Previous delivery records
                  will keep their original prices.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Billing Preview */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Billing Preview
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Estimated billing based on the current delivery
          settings.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-4">
            <p className="text-xs text-gray-500">
              Daily Bottles
            </p>

            <p className="mt-1 text-xl font-bold text-gray-900">
              {formData.dailyBottles || 0}
            </p>
          </div>

          <div className="rounded-xl bg-white p-4">
            <p className="text-xs text-gray-500">
              Bottle Price
            </p>

            <p className="mt-1 text-xl font-bold text-gray-900">
              Rs.{" "}
              {Number(
                formData.bottlePrice || 0
              ).toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl bg-white p-4">
            <p className="text-xs text-gray-500">
              Estimated Daily Bill
            </p>

            <p className="mt-1 text-xl font-bold text-blue-600">
              Rs. {dailyBill.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Estimated 30-Day Bill
            </span>

            <span className="text-base font-bold text-gray-900">
              Rs. {monthlyEstimate.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Active Status - Edit Mode */}
      {mode === "edit" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Customer Status
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Inactive customers will remain in the system
                but can be excluded from active deliveries.
              </p>
            </div>

            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="peer sr-only"
              />

              <div className="h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
            </label>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          {mode === "edit"
            ? "Save Changes"
            : "Create Customer"}
        </button>
      </div>
    </form>
  );
}