/* eslint-disable react-hooks/error-boundaries */
import Link from "next/link";
import DeliveryTable from "@/components/DeliveryTable";
import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

function getPakistanDateRange(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);

  const start = new Date(
    Date.UTC(year, month - 1, day, 0, 0, 0, 0)
  );

  const end = new Date(
    Date.UTC(year, month - 1, day, 23, 59, 59, 999)
  );

  // Pakistan is UTC+5
  const utcStart = new Date(
    start.getTime() - 5 * 60 * 60 * 1000
  );

  const utcEnd = new Date(
    end.getTime() - 5 * 60 * 60 * 1000
  );

  return {
    start: utcStart,
    end: utcEnd,
  };
}

export default async function DeliveriesPage({ searchParams }) {
  try {
    const params = await searchParams;

    const selectedDate = params?.date || new Date().toLocaleDateString(
      "en-CA",
      {
        timeZone: "Asia/Karachi",
      }
    );

    const customerType = params?.customerType || "All Customers";
    const deliveryStatus = params?.status || "All Status";
    const searchCustomer = (params?.search || "").trim().toLowerCase();
    // --------------------------------
    // Get logged-in supplier
    // --------------------------------
    const user = await getCurrentUser();

    if (!user || !user.store) {
      return (
        <>
          <Navbar />

          <main className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="mx-auto max-w-7xl">
              <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                Unauthorized. Please login again.
              </div>
            </div>
          </main>
        </>
      );
    }

    const storeId = user.store.id;

    const { start, end } = getPakistanDateRange(selectedDate);

    // --------------------------------
    // Get active customers
    // --------------------------------
    const customers = await prisma.customer.findMany({
      where: {
        storeId,
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // --------------------------------
    // Get deliveries for selected date
    // --------------------------------
    const todaysDeliveries = await prisma.delivery.findMany({
      where: {
        storeId,
        deliveryDate: {
          gte: start,
          lte: end,
        },
      },
      include: {
        customer: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // --------------------------------
    // Create delivery lookup
    // --------------------------------
    const deliveryMap = new Map();

    todaysDeliveries.forEach((delivery) => {
      deliveryMap.set(delivery.customerId, delivery);
    });

    // --------------------------------
    // Build delivery list for selected date
    // --------------------------------
    const deliveries = customers.map((customer) => {
      const delivery = deliveryMap.get(customer.id);

      if (delivery) {
        return {
          id: delivery.id,
          customerId: customer.id,
          customerName: customer.name,
          customerType:
            customer.customerType === "MONTHLY"
              ? "Monthly"
              : "Cash",
          address: customer.deliveryLocation,
          dailyBottles: customer.dailyBottles,
          bottlePrice: Number(delivery.bottlePrice),
          actualBottles: delivery.bottles,
          status: "Delivered",
          totalAmount: Number(delivery.totalAmount),
          deliveryDate: delivery.deliveryDate,
          isExistingDelivery: true,
        };
      }

      return {
        id: `customer-${customer.id}`,
        customerId: customer.id,
        customerName: customer.name,
        customerType:
          customer.customerType === "MONTHLY"
            ? "Monthly"
            : "Cash",
        address: customer.deliveryLocation,
        dailyBottles: customer.dailyBottles,
        bottlePrice: Number(customer.bottlePrice),
        actualBottles: 0,
        status: "Pending",
        totalAmount: 0,

        // IMPORTANT:
        // Use the date selected by the supplier.
        deliveryDate: selectedDate,
      };
    });

    const filteredDeliveries = deliveries.filter((delivery) => {
      const matchesSearch =
        !searchCustomer ||
        delivery.customerName
          ?.toLowerCase()
          .includes(searchCustomer);

      const matchesCustomerType =
        customerType === "All Customers" ||
        delivery.customerType === customerType;

      const matchesStatus =
        deliveryStatus === "All Status" ||
        delivery.status === deliveryStatus;

      return (
        matchesSearch &&
        matchesCustomerType &&
        matchesStatus
      );
    });

    // --------------------------------
    // Summary
    // --------------------------------
    const totalCustomers = customers.length;

    const deliveredCustomers = todaysDeliveries.length;

    const totalBottles = todaysDeliveries.reduce(
      (total, delivery) => total + delivery.bottles,
      0
    );

    const todaysSales = todaysDeliveries.reduce(
      (total, delivery) =>
        total + Number(delivery.totalAmount),
      0
    );

    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-gray-50 p-4 md:p-8">
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="mb-6">
              <Link
                href="/"
                className="mb-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                ← Back to Dashboard
              </Link>

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Daily Deliveries
                  </h1>

                  <p className="mt-1 text-sm text-gray-500">
                    Manage daily water bottle deliveries and
                    record actual quantities.
                  </p>
                </div>

                <button
                  type="button"
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  + Add Delivery
                </button>
              </div>
            </div>

            {/* Date & Filters */}
            <form
              method="GET"
              className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

                {/* Date */}
                <div>
                  <label
                    htmlFor="delivery-date"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Delivery Date
                  </label>

                  <input
                    id="delivery-date"
                    name="date"
                    type="date"
                    defaultValue={selectedDate}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Customer Type */}
                <div>
                  <label
                    htmlFor="customer-type"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Customer Type
                  </label>

                  <select
                    id="customer-type"
                    name="customerType"
                    defaultValue={customerType}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="All Customers">
                      All Customers
                    </option>

                    <option value="Cash">
                      Cash
                    </option>

                    <option value="Monthly">
                      Monthly
                    </option>
                  </select>
                </div>

                {/* Delivery Status */}
                <div>
                  <label
                    htmlFor="delivery-status"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Delivery Status
                  </label>

                  <select
                    id="delivery-status"
                    name="status"
                    defaultValue={deliveryStatus}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="All Status">
                      All Status
                    </option>

                    <option value="Delivered">
                      Delivered
                    </option>

                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Skipped">
                      Skipped
                    </option>
                  </select>
                </div>

                {/* Search */}
                <div>
                  <label
                    htmlFor="search-customer"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Search Customer
                  </label>

                  <input
                    id="search-customer"
                    name="search"
                    type="text"
                    defaultValue={params?.search || ""}
                    placeholder="Search customer..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
            </form>

            {/* Summary Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Total Customers
                </p>

                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  {totalCustomers}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Active customers
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Delivered
                </p>

                <h2 className="mt-2 text-2xl font-bold text-green-600">
                  {deliveredCustomers}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Customers delivered
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Total Bottles
                </p>

                <h2 className="mt-2 text-2xl font-bold text-blue-600">
                  {totalBottles}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Delivered today
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Today&apos;s Sales
                </p>

                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  Rs. {todaysSales.toLocaleString()}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Delivery value
                </p>
              </div>
            </div>

            <DeliveryTable
              deliveries={filteredDeliveries}
              deliveryDate={selectedDate}
            />
          </div>
        </main>
      </>
    );
  } catch (error) {
    console.error("Deliveries page error:", error);

    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-gray-50 p-4 md:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              Failed to load delivery data.
            </div>
          </div>
        </main>
      </>
    );
  }
}