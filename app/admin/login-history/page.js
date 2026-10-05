import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

export default async function AdminLoginHistoryPage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/login");
  }

  const loginHistory = await prisma.adminLogin.findMany({
    orderBy: {
      loginAt: "desc",
    },
    take: 100,
    include: {
      admin: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
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
            Login History
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            View administrator login activity.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm">

          <div className="border-b border-gray-200 px-6 py-5">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Admin Logins
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Showing the latest 100 login attempts.
            </p>
          </div>

          <div className="overflow-x-auto">

            {loginHistory.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                No login history found.
              </div>
            ) : (
              <table className="min-w-full">

                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Admin
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Login Time
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      IP Address
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      User Agent
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Result
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">

                  {loginHistory.map((login) => (
                    <tr
                      key={login.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">
                          {login.admin.name}
                        </p>

                        <p className="text-sm text-gray-500">
                          {login.admin.email}
                        </p>

                        <p className="text-xs text-gray-400">
                          Admin #{login.admin.id}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                        {new Date(login.loginAt).toLocaleString(
                          "en-PK",
                          {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {login.ipAddress || "—"}
                      </td>

                      <td className="max-w-md px-6 py-4">
                        <p
                          className="truncate text-xs text-gray-500"
                          title={login.userAgent || ""}
                        >
                          {login.userAgent || "—"}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        {login.success ? (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            Successful
                          </span>
                        ) : (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                            Failed
                          </span>
                        )}
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