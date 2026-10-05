import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

export default async function AdminsPage() {
    const admin = await getCurrentAdmin();

    if (!admin) {
        redirect("/login");
    }

    const admins = await prisma.admin.findMany({
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isActive: true,
            createdAt: true,
        },
    });

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-7xl">

                <div className="mb-8">
                    <p className="text-sm font-medium text-gray-500">
                        Admin Panel
                    </p>

                    <h1 className="text-3xl font-bold text-gray-900">
                        Admin Management
                    </h1>

                    <p className="mt-1 text-sm text-gray-600">
                        Manage administrator accounts.
                    </p>
                </div>

                <div className="overflow-hidden rounded-xl bg-white shadow-sm">

                    <div className="border-b border-gray-200 px-6 py-5">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Admin Accounts
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Total admins: {admins.length}
                        </p>
                    </div>

                    <div className="overflow-x-auto">

                        {admins.length === 0 ? (
                            <div className="px-6 py-12 text-center text-gray-500">
                                No admin accounts found.
                            </div>
                        ) : (
                            <table className="min-w-full">

                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Admin
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Email
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Phone
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Status
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Created
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200">

                                    {admins.map((admin) => (
                                        <tr
                                            key={admin.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-gray-900">
                                                    {admin.name}
                                                </p>

                                                <p className="text-xs text-gray-400">
                                                    Admin #{admin.id}
                                                </p>
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {admin.email}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {admin.phone || "—"}
                                            </td>

                                            <td className="px-6 py-4">
                                                {admin.isActive ? (
                                                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                {new Date(
                                                    admin.createdAt
                                                ).toLocaleDateString("en-PK")}
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