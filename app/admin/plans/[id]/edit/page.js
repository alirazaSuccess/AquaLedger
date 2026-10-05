import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

export default async function EditAdminPlanPage({ params }) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/login");
  }

  const { id } = await params;

  const plan = await prisma.subscriptionPlan.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!plan) {
    notFound();
  }

  async function updatePlan(formData) {
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

    if (!Number.isInteger(durationDays) || durationDays <= 0) {
      throw new Error("Please enter a valid duration.");
    }

    await prisma.subscriptionPlan.update({
      where: {
        id: Number(id),
      },
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
            Edit Subscription Plan
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Update the details of this subscription plan.
          </p>
        </div>

        {/* Form */}
        <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
          <form action={updatePlan} className="space-y-6">

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
                defaultValue={plan.name}
                required
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
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
                  defaultValue={Number(plan.price)}
                  required
                  className="w-full rounded-lg border border-gray-300 py-3 pl-12 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <p className="mt-1 text-xs text-gray-500">
                Set 0 if this is a free plan.
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
                  defaultValue={plan.durationDays}
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
                  defaultChecked={plan.isActive}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />

                <span>
                  <span className="block text-sm font-semibold text-gray-800">
                    Active Plan
                  </span>

                  <span className="mt-1 block text-xs text-gray-500">
                    Inactive plans will not appear on the public pricing
                    section for new customers.
                  </span>
                </span>
              </label>
            </div>

            {/* Plan Information */}
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-900">
                Plan Information
              </p>

              <p className="mt-1 text-xs text-blue-700">
                Plan ID: {plan.id}
              </p>
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
                Save Changes
              </button>

            </div>
          </form>
        </div>

      </div>
    </main>
  );
}