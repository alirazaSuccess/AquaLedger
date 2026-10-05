import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

export default async function NewAdminPlanPage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/login");
  }

  async function createPlan(formData) {
    "use server";

    const currentAdmin = await getCurrentAdmin();

    if (!currentAdmin) {
      redirect("/login");
    }

    const name = formData.get("name")?.toString().trim();
    const priceValue = formData.get("price")?.toString().trim();
    const durationValue = formData
      .get("durationDays")
      ?.toString()
      .trim();

    const isActive = formData.get("isActive") === "on";

    if (!name || !priceValue || !durationValue) {
      throw new Error("All required fields must be filled.");
    }

    const price = Number(priceValue);
    const durationDays = Number(durationValue);

    if (!Number.isFinite(price) || price < 0) {
      throw new Error("Please enter a valid price.");
    }

    if (
      !Number.isInteger(durationDays) ||
      durationDays <= 0
    ) {
      throw new Error("Please enter a valid duration.");
    }

    await prisma.subscriptionPlan.create({
      data: {
        name,
        price,
        durationDays,
        isActive,
      },
    });

    redirect("/admin/plans");
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/plans"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back to Plans
          </Link>

          <p className="mt-6 text-sm font-medium text-gray-500">
            Admin Panel
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Create Subscription Plan
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Add a new subscription plan for water business suppliers.
          </p>
        </div>

        {/* Form */}
        <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">

          <form action={createPlan} className="space-y-6">

            {/* Plan Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-700"
              >
                Plan Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="e.g. Standard"
                required
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-1 text-xs text-gray-500">
                Example: Free Trial, Standard, Premium
              </p>
            </div>

            {/* Price */}
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-semibold text-gray-700"
              >
                Price
              </label>

              <div className="relative mt-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
                  Rs.
                </span>

                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="2000"
                  required
                  className="w-full rounded-lg border border-gray-300 py-3 pl-12 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <p className="mt-1 text-xs text-gray-500">
                Use 0 for a free trial plan.
              </p>
            </div>

            {/* Duration */}
            <div>
              <label
                htmlFor="durationDays"
                className="block text-sm font-semibold text-gray-700"
              >
                Duration
              </label>

              <div className="mt-2 flex gap-3">
                <input
                  id="durationDays"
                  name="durationDays"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="60"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <div className="flex items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600">
                  Days
                </div>
              </div>

              <p className="mt-1 text-xs text-gray-500">
                Example: 60 days = approximately 2 months.
              </p>
            </div>

            {/* Active Status */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />

                <span>
                  <span className="block text-sm font-semibold text-gray-800">
                    Active Plan
                  </span>

                  <span className="mt-1 block text-xs text-gray-500">
                    Active plans are visible on the public pricing
                    section.
                  </span>
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
              <Link
                href="/admin/plans"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Create Plan
              </button>
            </div>

          </form>
        </div>

      </div>
    </main>
  );
}