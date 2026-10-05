"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Clock, DollarSign, Droplets, LayoutDashboard, LogOut, Truck, UserRoundGroup } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [loggingOut, setLoggingOut] = useState(false);

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard />,
    },
    {
      name: "Customers",
      href: "/customers",
      icon: <UserRoundGroup />,
    },
    {
      name: "Deliveries",
      href: "/deliveries",
      icon: <Truck />,
    },
    {
      name: "Payments",
      href: "/payments",
      icon: <DollarSign />,
    },
  ];

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout failed.");
      }

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
      alert("Failed to logout. Please try again.");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo / Brand */}
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl text-white">
            <Droplets />
          </div>

          <div>
            <h1 className="text-lg font-bold text-gray-900">
              AquaLedger
            </h1>

            <p className="text-xs text-gray-500">
              Management System
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-2 md:flex">
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="ml-2 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span><LogOut /></span>
            <span>{loggingOut ? "Logging out..." : "Logout"}</span>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-1 md:hidden">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.name}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg ${isActive
                  ? "bg-blue-50"
                  : "hover:bg-gray-50"
                  }`}
              >
                {item.icon}
              </Link>
            );
          })}

          {/* Mobile Logout */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            title="Logout"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-lg text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {loggingOut ? <Clock /> : <LogOut />}
          </button>
        </div>
      </div>
    </header>
  );
}