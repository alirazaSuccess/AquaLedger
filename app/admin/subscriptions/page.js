import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

export default async function AdminSubscriptionsPage() {
    const admin = await getCurrentAdmin();

    if (!admin) {
        redirect("/login");
    }

    const subscriptions = await prisma.subscription.findMany({
        orderBy: {
            createdAt: "desc",
        },
        include: {
            store: {
                select: {
                    id: true,
                    name: true,
                    isActive: true,
                    owner: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
            },
            plan: {
                select: {
                    id: true,
                    name: true,
                    durationDays: true,
                    price: true,
                },
            },
            payments: {
                orderBy: {
                    createdAt: "desc",
                },
                take: 1,
                select: {
                    id: true,
                    amount: true,
                    paymentDate: true,
                    status: true,
                    reference: true,
                },
            },
        },
    });

    return (
        <main className="min-h-screen p-6">
            <div className="mx-auto max-w-7xl">

                <div className="mb-8">
                    <p className="text-sm font-medium text-gray-500">
                        Admin Panel
                    </p>

                    <h1 className="text-3xl font-bold text-gray-900">
                        Subscriptions
                    </h1>

                    <p className="mt-1 text-sm text-gray-600">
                        Manage supplier store subscriptions.
                    </p>
                </div>

                <div className="overflow-hidden rounded-xl bg-white shadow-sm">

                    <div className="border-b border-gray-200 px-6 py-5">
                        <h2 className="text-xl font-semibold text-gray-900">
                            All Subscriptions
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Total: {subscriptions.length}
                        </p>
                    </div>

                    <div className="overflow-x-auto">

                        {subscriptions.length === 0 ? (
                            <div className="px-6 py-12 text-center text-gray-500">
                                No subscriptions found.
                            </div>
                        ) : (
                            <table className="min-w-full">

                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Store
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Plan
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Period
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Amount
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Status
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Payment
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200">

                                    {subscriptions.map((subscription) => {
                                        const payment = subscription.payments[0];

                                        return (
                                            <tr
                                                key={subscription.id}
                                                className="hover:bg-gray-50"
                                            >

                                                <td className="px-6 py-4">
                                                    <p className="font-semibold text-gray-900">
                                                        {subscription.store.name}
                                                    </p>

                                                    <p className="text-sm text-gray-500">
                                                        Store #{subscription.store.id}
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-400">
                                                        {subscription.store.owner.name}
                                                    </p>

                                                    <p className="text-xs text-gray-400">
                                                        {subscription.store.owner.email}
                                                    </p>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <p className="font-medium text-gray-900">
                                                        {subscription.plan.name}
                                                    </p>

                                                    <p className="text-sm text-gray-500">
                                                        {subscription.plan.durationDays} days
                                                    </p>
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <p className="text-sm text-gray-700">
                                                        Start:{" "}
                                                        {new Date(
                                                            subscription.startDate
                                                        ).toLocaleDateString("en-PK")}
                                                    </p>

                                                    <p className="text-sm text-gray-700">
                                                        End:{" "}
                                                        {new Date(
                                                            subscription.endDate
                                                        ).toLocaleDateString("en-PK")}
                                                    </p>
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <p className="font-semibold text-gray-900">
                                                        Rs.{" "}
                                                        {Number(subscription.amount).toLocaleString(
                                                            "en-PK"
                                                        )}
                                                    </p>

                                                    <p className="text-xs text-gray-500">
                                                        Plan: Rs.{" "}
                                                        {Number(
                                                            subscription.plan.price
                                                        ).toLocaleString("en-PK")}
                                                    </p>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <SubscriptionStatus
                                                        status={subscription.status}
                                                    />

                                                    {!subscription.store.isActive && (
                                                        <p className="mt-2 text-xs font-medium text-red-600">
                                                            Store inactive
                                                        </p>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4">
                                                    {payment ? (
                                                        <>
                                                            <PaymentStatus status={payment.status} />

                                                            <p className="mt-1 text-xs text-gray-500">
                                                                Rs.{" "}
                                                                {Number(
                                                                    payment.amount
                                                                ).toLocaleString("en-PK")}
                                                            </p>

                                                            {payment.reference && (
                                                                <p className="text-xs text-gray-400">
                                                                    Ref: {payment.reference}
                                                                </p>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">
                                                            No payment
                                                        </span>
                                                    )}
                                                </td>

                                            </tr>
                                        );
                                    })}

                                </tbody>
                            </table>
                        )}

                    </div>
                </div>

            </div>
        </main>
    );
}

function SubscriptionStatus({ status }) {
    const styles = {
        TRIAL: "bg-blue-100 text-blue-700",
        ACTIVE: "bg-green-100 text-green-700",
        EXPIRED: "bg-red-100 text-red-700",
        PENDING: "bg-yellow-100 text-yellow-700",
        CANCELLED: "bg-gray-100 text-gray-700",
    };

    return (
        <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-700"
                }`}
        >
            {status}
        </span>
    );
}

function PaymentStatus({ status }) {
    const styles = {
        PENDING: "bg-yellow-100 text-yellow-700",
        VERIFIED: "bg-green-100 text-green-700",
        REJECTED: "bg-red-100 text-red-700",
    };

    return (
        <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-700"
                }`}
        >
            {status}
        </span>
    );
}