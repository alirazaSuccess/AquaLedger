import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import Link from "next/link";

export default async function AdminPlansPage() {
    const admin = await getCurrentAdmin();

    if (!admin) {
        redirect("/login");
    }

    const plans = await prisma.subscriptionPlan.findMany({
        orderBy: {
            price: "asc",
        },
        include: {
            _count: {
                select: {
                    subscriptions: true,
                },
            },
        },
    });

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-8">
                    <p className="text-sm font-medium text-gray-500">
                        Admin Panel
                    </p>

                    <h1 className="text-3xl font-bold text-gray-900">
                        Subscription Plans
                    </h1>

                    <p className="mt-1 text-sm text-gray-600">
                        Manage the subscription plans available to suppliers.
                    </p>
                </div>

                {/* Plans Card */}
                <div className="overflow-hidden rounded-xl bg-white shadow-sm">

                    <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                All Plans
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Total plans: {plans.length}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                href="/admin/plans/new"
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                            >
                                + Create Plan
                            </Link>

                            <span className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600">
                                Admin Only
                            </span>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">

                        {plans.length === 0 ? (
                            <div className="px-6 py-12 text-center text-gray-500">
                                No subscription plans found.
                            </div>
                        ) : (
                            <table className="min-w-full">

                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Plan
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Price
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Duration
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Subscriptions
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200">

                                    {plans.map((plan) => (
                                        <tr
                                            key={plan.id}
                                            className="hover:bg-gray-50"
                                        >

                                            {/* Plan */}
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-gray-900">
                                                    {plan.name}
                                                </p>

                                                <p className="text-xs text-gray-400">
                                                    Plan #{plan.id}
                                                </p>
                                            </td>

                                            {/* Price */}
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-gray-900">
                                                    Rs.{" "}
                                                    {Number(plan.price).toLocaleString("en-PK")}
                                                </p>
                                            </td>

                                            {/* Duration */}
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-700">
                                                    {plan.durationDays} days
                                                </p>

                                                <p className="text-xs text-gray-400">
                                                    {Math.round(plan.durationDays / 30)} months
                                                </p>
                                            </td>

                                            {/* Subscription Count */}
                                            <td className="px-6 py-4">
                                                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                                    {plan._count.subscriptions}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                {plan.isActive ? (
                                                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            {/* Actions */}
                                            <td className="px-6 py-4">
                                                <Link
                                                    href={`/admin/plans/${plan.id}/edit`}
                                                    className="rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-700"
                                                >
                                                    Edit
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}

                                </tbody>
                            </table>
                        )}

                    </div>
                </div>

            </div>
        </main>
    );
}