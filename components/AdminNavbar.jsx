"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin",
    },
    {
      name: "Stores",
      href: "/admin/stores",
    },
    {
      name: "Subscriptions",
      href: "/admin/subscriptions",
    },
    {
      name: "Plans",
      href: "/admin/plans",
    },
    {
      name: "Payments",
      href: "/admin/subscription-payments",
    },
    {
      name: "Login History",
      href: "/admin/login-history",
    },
  ];

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      await fetch("/api/auth/logout", {
        method: "POST",
      });

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Admin logout error:", error);
      setLoggingOut(false);
    }
  };

  return (
    <nav className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo / Brand */}
        <Link
          href="/admin"
          className="text-xl font-bold text-gray-900"
        >
          PaniPeelo
          <span className="ml-2 text-sm font-medium text-gray-500">
            Admin
          </span>
        </Link>

        {/* Navigation */}
        <div className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loggingOut ? "Logging out..." : "Logout"}
        </button>

      </div>

      {/* Mobile Navigation */}
      <div className="overflow-x-auto border-t border-gray-100 md:hidden">
        <div className="flex min-w-max gap-2 px-6 py-3">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${isActive
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600"
                  }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}