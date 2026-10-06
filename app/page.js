"use client";
import { AreaChart, BarChart3, Calendar, Check, Clock, DollarSign, Droplets, Lightbulb, Lock, LogIn, Smartphone, Target, Truck, UserRoundGroup } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const response = await fetch("/api/plans");

        if (!response.ok) {
          throw new Error("Failed to fetch plans");
        }

        const data = await response.json();

        setPlans(data);
      } catch (error) {
        console.error("Failed to load subscription plans:", error);
      } finally {
        setPlansLoading(false);
      }
    }

    fetchPlans();
  }, []);

  const features = [
    {
      icon: <UserRoundGroup />,
      title: "Customer Management",
      description:
        "Keep all your customer information organized in one place. Manage names, contact details, delivery locations, customer types and bottle prices easily.",
    },
    {
      icon: <Truck />,
      title: "Daily Delivery Tracking",
      description:
        "Record daily bottle deliveries, track delivered quantities and calculate the total amount automatically.",
    },
    {
      icon: <DollarSign />,
      title: "Payment Management",
      description:
        "Track customer payments, outstanding balances, paid amounts and pending collections without maintaining manual records.",
    },
    {
      icon: <AreaChart />,
      title: "Smart Dashboard",
      description:
        "Get a quick overview of customers, deliveries, sales and payments from a simple and easy-to-understand dashboard.",
    },
    {
      icon: <Calendar />,
      title: "Monthly Customers",
      description:
        "Manage monthly customers separately from cash customers and keep track of their billing and outstanding amounts.",
    },
    {
      icon: <Droplets />,
      title: "Water Business Focused",
      description:
        "Built specifically around the daily workflow of mineral water and bottle delivery businesses.",
    },
  ];

  const benefits = [
    {
      icon: <Clock/>,
      title: "Save Time",
      description:
        "Reduce the time spent maintaining notebooks, spreadsheets and manual calculations.",
    },
    {
      icon: <Target />,
      title: "Reduce Mistakes",
      description:
        "Automatic calculations help reduce common mistakes in delivery and payment records.",
    },
    {
      icon: <Smartphone />,
      title: "Access Anywhere",
      description:
        "Manage your business from your computer, laptop or mobile browser whenever you need it.",
    },
    {
      icon: <Lock />,
      title: "Separate Business Data",
      description:
        "Each supplier has their own store and business data remains separated from other stores.",
    },
    {
      icon: <BarChart3 />,
      title: "Understand Your Business",
      description:
        "See important business numbers quickly instead of manually calculating everything.",
    },
    {
      icon: <Lightbulb />,
      title: "Simple Workflow",
      description:
        "Designed to keep everyday business operations simple, fast and easy to manage.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Create Your Account",
      description:
        "Sign up for your account and create your water business store in just a few steps.",
    },
    {
      number: "02",
      title: "Add Your Customers",
      description:
        "Add your customers, delivery locations, bottle quantities and pricing information.",
    },
    {
      number: "03",
      title: "Manage Deliveries",
      description:
        "Record daily deliveries and let the system calculate the delivery amount for you.",
    },
    {
      number: "04",
      title: "Track Payments",
      description:
        "Record customer payments and easily see paid and outstanding amounts.",
    },
  ];

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* ================= NAVBAR ================= */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-2xl shadow-sm">
              <Droplets />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-gray-900">
                AquaLedger
              </h1>

              <p className="text-xs text-gray-500">
                Business Management System
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
            >
              Features
            </a>

            <a
              href="#benefits"
              className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
            >
              Benefits
            </a>

            <a
              href="#how-it-works"
              className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
            >
              How It Works
            </a>

            <a
              href="#about"
              className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
            >
              About
            </a>

            <a
              href="#pricing"
              className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
            >
              Pricing
            </a>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              Login
            </Link>

            <Link
              href="/signup"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile CTA */}
          <Link
            href="/signup"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white md:hidden"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-linear-to-b from-blue-50 via-white to-white">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-100 opacity-60 blur-3xl" />
        <div className="absolute -left-32 top-64 h-80 w-80 rounded-full bg-cyan-100 opacity-50 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pb-28 lg:pt-24">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            {/* Hero Content */}
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-sm">
                <span><Droplets /></span>
                <span>Built for Water Delivery Businesses</span>
              </div>

              <h2 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Manage your water business
                <span className="block text-blue-600">
                  smarter and easier.
                </span>
              </h2>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
                A simple all-in-one management system for mineral water
                suppliers. Manage customers, daily deliveries, payments,
                billing and business information from one place.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                >
                  Get Started
                  <span><LogIn /></span>
                </Link>

                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-7 py-3.5 text-sm font-bold text-gray-700 transition hover:border-blue-200 hover:bg-blue-50"
                >
                  Already have an account?
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  1 Month Free Trial
                </span>

                <span className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  No complicated setup
                </span>

                <span className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Easy to use
                </span>
              </div>
            </div>

            {/* Hero Dashboard Preview */}
            <div className="relative">
              <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-2xl shadow-blue-900/10">
                <div className="rounded-xl bg-gray-50 p-5">
                  {/* Browser Header */}
                  <div className="mb-5 flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />

                    <div className="ml-3 h-7 flex-1 rounded-md bg-white" />
                  </div>

                  {/* Dashboard */}
                  <div className="rounded-xl bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400">
                          Welcome back
                        </p>
                        <h3 className="mt-1 text-lg font-bold text-gray-900">
                          Your Business Dashboard
                        </h3>
                      </div>

                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-lg text-white">
                        <Droplets />
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="rounded-lg bg-blue-50 p-3">
                        <p className="text-xs text-gray-500">
                          Customers
                        </p>
                        <p className="mt-1 text-xl font-bold text-blue-600">
                          128
                        </p>
                      </div>

                      <div className="rounded-lg bg-green-50 p-3">
                        <p className="text-xs text-gray-500">
                          Deliveries
                        </p>
                        <p className="mt-1 text-xl font-bold text-green-600">
                          96
                        </p>
                      </div>

                      <div className="rounded-lg bg-purple-50 p-3">
                        <p className="text-xs text-gray-500">
                          Sales
                        </p>
                        <p className="mt-1 text-xl font-bold text-purple-600">
                          45K
                        </p>
                      </div>

                      <div className="rounded-lg bg-orange-50 p-3">
                        <p className="text-xs text-gray-500">
                          Pending
                        </p>
                        <p className="mt-1 text-xl font-bold text-orange-600">
                          12K
                        </p>
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-800">
                          Daily Deliveries
                        </p>

                        <span className="text-xs text-blue-600">
                          Today
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm">
                              <UserRoundGroup />
                            </div>

                            <div>
                              <p className="text-xs font-semibold">
                                Customer
                              </p>
                              <p className="text-[10px] text-gray-400">
                                5 Bottles
                              </p>
                            </div>
                          </div>

                          <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-semibold text-green-600">
                            Delivered
                          </span>
                        </div>

                        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm">
                              <UserRoundGroup/>
                            </div>

                            <div>
                              <p className="text-xs font-semibold">
                                Customer
                              </p>
                              <p className="text-[10px] text-gray-400">
                                3 Bottles
                              </p>
                            </div>
                          </div>

                          <span className="rounded-full bg-yellow-100 px-2 py-1 text-[10px] font-semibold text-yellow-600">
                            Pending
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Card */}
              <div className="absolute -bottom-6 -left-5 hidden rounded-xl border border-gray-100 bg-white p-4 shadow-xl sm:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                    ✓
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Today&apos;s Collection
                    </p>

                    <p className="font-bold text-gray-900">
                      Rs. 18,500
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TRUST BAR ================= */}
      <section className="border-y border-gray-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
          <div className="text-center">
            <p className="text-2xl font-extrabold text-gray-900">
              All-in-One
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Business Management
            </p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-extrabold text-gray-900">
              24/7
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Business Access
            </p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-extrabold text-gray-900">
              1 Month
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Free Trial
            </p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-extrabold text-gray-900">
              Simple
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Easy-to-use Interface
            </p>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section
        id="features"
        className="scroll-mt-24 bg-gray-50 py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-blue-600">
              Powerful Features
            </span>

            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to manage your water business
            </h2>

            <p className="mt-4 text-lg leading-8 text-gray-600">
              Replace scattered records and manual calculations with one
              simple business management system.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                  {feature.icon}
                </div>

                <h3 className="mt-5 text-lg font-bold text-gray-900">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= BENEFITS ================= */}
      <section
        id="benefits"
        className="scroll-mt-24 bg-white py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            {/* Left */}
            <div>
              <span className="text-sm font-bold uppercase tracking-wider text-blue-600">
                Business Benefits
              </span>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Spend less time managing records and more time growing your
                business.
              </h2>

              <p className="mt-5 text-lg leading-8 text-gray-600">
                Your daily water delivery business involves customers,
                bottles, deliveries, prices and payments. Our system brings
                these activities together so you can manage them from one
                place.
              </p>

              <Link
                href="/signup"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Start Your Free Trial
                <span>→</span>
              </Link>
            </div>

            {/* Benefits */}
            <div className="grid gap-4 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="rounded-xl border border-gray-100 bg-gray-50 p-5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-xl shadow-sm">
                    {benefit.icon}
                  </div>

                  <h3 className="mt-4 font-bold text-gray-900">
                    {benefit.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section
        id="how-it-works"
        className="scroll-mt-24 bg-blue-50 py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-blue-600">
              Simple Process
            </span>

            <h2 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Start managing your business in four simple steps
            </h2>

            <p className="mt-4 text-lg text-gray-600">
              No complicated setup. Just create your account and start
              managing your daily operations.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className="relative rounded-2xl border border-blue-100 bg-white p-7 shadow-sm"
              >
                <span className="text-4xl font-black text-blue-100">
                  {step.number}
                </span>

                <h3 className="mt-4 text-lg font-bold text-gray-900">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= MANAGEMENT SECTION ================= */}
      <section className="bg-gray-900 py-20 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="text-sm font-bold uppercase tracking-wider text-blue-400">
                One Organized System
              </span>

              <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
                Your customers, deliveries and payments — organized in one
                place.
              </h2>

              <p className="mt-5 max-w-xl text-lg leading-8 text-gray-300">
                Stop switching between notebooks, spreadsheets and different
                records. Keep your important business information connected
                through one simple management system.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Customer information stays organized.",
                  "Daily bottle deliveries are easy to record.",
                  "Delivery amounts are calculated automatically.",
                  "Customer payments and balances are easy to track.",
                  "Your business data stays separated within your store.",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs">
                      <Check />
                    </span>

                    <span className="text-gray-200">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual */}
            <div className="rounded-2xl border border-gray-700 bg-gray-800 p-6 shadow-2xl">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-gray-900 p-5">
                  <span className="text-2xl"><UserRoundGroup /></span>

                  <p className="mt-4 text-sm text-gray-400">
                    Customers
                  </p>

                  <p className="mt-1 text-3xl font-bold">
                    Manage
                  </p>

                  <div className="mt-4 h-2 rounded-full bg-gray-700">
                    <div className="h-2 w-4/5 rounded-full bg-blue-500" />
                  </div>
                </div>

                <div className="rounded-xl bg-gray-900 p-5">
                  <span className="text-2xl"><Truck /></span>

                  <p className="mt-4 text-sm text-gray-400">
                    Deliveries
                  </p>

                  <p className="mt-1 text-3xl font-bold">
                    Track
                  </p>

                  <div className="mt-4 h-2 rounded-full bg-gray-700">
                    <div className="h-2 w-3/5 rounded-full bg-green-500" />
                  </div>
                </div>

                <div className="rounded-xl bg-gray-900 p-5">
                  <span className="text-2xl"><DollarSign /></span>

                  <p className="mt-4 text-sm text-gray-400">
                    Payments
                  </p>

                  <p className="mt-1 text-3xl font-bold">
                    Monitor
                  </p>

                  <div className="mt-4 h-2 rounded-full bg-gray-700">
                    <div className="h-2 w-2/3 rounded-full bg-purple-500" />
                  </div>
                </div>

                <div className="rounded-xl bg-gray-900 p-5">
                  <span className="text-2xl"><BarChart3 /></span>

                  <p className="mt-4 text-sm text-gray-400">
                    Dashboard
                  </p>

                  <p className="mt-1 text-3xl font-bold">
                    Analyze
                  </p>

                  <div className="mt-4 h-2 rounded-full bg-gray-700">
                    <div className="h-2 w-5/6 rounded-full bg-orange-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ABOUT ================= */}
      <section
        id="about"
        className="scroll-mt-24 bg-white py-20 sm:py-24"
      >
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <span className="text-sm font-bold uppercase tracking-wider text-blue-600">
            About The System
          </span>

          <h2 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Built to simplify everyday water business management
          </h2>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            AquaLedger is a business management SaaS designed for mineral
            water suppliers and bottle delivery businesses. The system
            focuses on the everyday tasks that business owners perform:
            managing customers, recording deliveries, calculating bills and
            tracking payments.
          </p>

          <p className="mt-5 text-lg leading-8 text-gray-600">
            Instead of depending on notebooks or complicated spreadsheets,
            business owners can use one centralized system to keep their
            business information organized and accessible.
          </p>
        </div>
      </section>

      {/* ================= PRICING ================= */}
      <section
        id="pricing"
        className="scroll-mt-24 bg-gray-50 py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-blue-600">
              Simple Pricing
            </span>

            <h2 className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Start free. Upgrade when you&apos;re ready.
            </h2>

            <p className="mt-4 text-lg text-gray-600">
              Try the complete system during your free trial before deciding
              to continue with a paid plan.
            </p>
          </div>

          {/* Dynamic Plans */}
          <div className="mx-auto mt-12 grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3">
            {plansLoading ? (
              <div className="col-span-full flex justify-center py-12">
                <div className="text-sm font-medium text-gray-500">
                  Loading plans...
                </div>
              </div>
            ) : plans.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-gray-200 bg-white p-10 text-center">
                <p className="font-semibold text-gray-700">
                  No plans are currently available.
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  Please check back later.
                </p>
              </div>
            ) : (
              plans.map((plan, index) => {
                const isFree = Number(plan.price) === 0;

                const durationMonths = Math.round(
                  plan.durationDays / 30
                );

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-3xl border bg-white p-8 shadow-xl shadow-blue-900/5 ${
                      isFree
                        ? "border-blue-200"
                        : "border-gray-200"
                    }`}
                  >
                    {/* Recommended Badge */}
                    {index === 0 && isFree && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg">
                          FREE TRIAL
                        </span>
                      </div>
                    )}

                    <div className="text-center">
                      <span
                        className={`inline-flex rounded-full px-4 py-1.5 text-sm font-bold ${
                          isFree
                            ? "bg-blue-50 text-blue-600"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {plan.name}
                      </span>

                      <h3 className="mt-5 text-2xl font-bold text-gray-900">
                        {isFree
                          ? `${durationMonths} Months Free`
                          : plan.name}
                      </h3>

                      <p className="mt-2 min-h-12 text-gray-500">
                        {isFree
                          ? "Explore the complete business management system."
                          : `Full access to the water business management system for ${durationMonths} months.`}
                      </p>

                      <div className="mt-6">
                        <span className="text-5xl font-extrabold text-gray-900">
                          Rs.{" "}
                          {Number(plan.price).toLocaleString("en-PK")}
                        </span>

                        <span className="text-gray-500">
                          {" "}
                          / {durationMonths}{" "}
                          {durationMonths === 1 ? "month" : "months"}
                        </span>
                      </div>
                    </div>

                    <div className="my-8 h-px bg-gray-100" />

                    <ul className="space-y-4">
                      {[
                        "Customer management",
                        "Daily delivery tracking",
                        "Payment management",
                        "Business dashboard",
                        "Monthly customer management",
                        "Store-based business data",
                      ].map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-3 text-sm text-gray-700"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-50 text-xs text-green-600">
                            <Check />
                          </span>

                          {item}
                        </li>
                      ))}
                    </ul>

                    <Link
                      href="/signup"
                      className={`mt-8 flex w-full items-center justify-center rounded-xl px-6 py-3.5 text-sm font-bold text-white transition ${
                        isFree
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-gray-900 hover:bg-gray-800"
                      }`}
                    >
                      {isFree
                        ? "Start Free Trial"
                        : "Get Started"}
                    </Link>

                    <p className="mt-4 text-center text-xs text-gray-400">
                      {isFree
                        ? "No payment required to start your free trial."
                        : "Subscription payment is verified by the administrator."}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="bg-blue-600 py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-lg">
            <Droplets />
          </div>

          <h2 className="mt-7 text-3xl font-extrabold text-white sm:text-4xl">
            Ready to simplify your water business?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-blue-100">
            Create your account today and start managing your customers,
            deliveries and payments from one simple system.
          </p>

          <Link
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-bold text-blue-600 shadow-xl transition hover:bg-blue-50"
          >
            Get Started for Free
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-gray-950 text-gray-400">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-2">
              <Link
                href="/"
                className="inline-flex items-center gap-3"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl">
                  <Droplets />
                </div>

                <div>
                  <h3 className="font-bold text-white">
                    AquaLedger
                  </h3>

                  <p className="text-xs text-gray-500">
                    Business Management System
                  </p>
                </div>
              </Link>

              <p className="mt-5 max-w-md text-sm leading-6">
                A simple SaaS management system designed to help mineral
                water suppliers organize customers, deliveries, billing and
                payments.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-white">
                Product
              </h4>

              <div className="mt-4 space-y-3 text-sm">
                <a
                  href="#features"
                  className="block transition hover:text-white"
                >
                  Features
                </a>

                <a
                  href="#benefits"
                  className="block transition hover:text-white"
                >
                  Benefits
                </a>

                <a
                  href="#pricing"
                  className="block transition hover:text-white"
                >
                  Pricing
                </a>

                <Link
                  href="/signup"
                  className="block transition hover:text-white"
                >
                  Get Started
                </Link>
              </div>
            </div>

            {/* Account */}
            <div>
              <h4 className="font-semibold text-white">
                Account
              </h4>

              <div className="mt-4 space-y-3 text-sm">
                <Link
                  href="/login"
                  className="block transition hover:text-white"
                >
                  Login
                </Link>

                <Link
                  href="/signup"
                  className="block transition hover:text-white"
                >
                  Sign Up
                </Link>

                <a
                  href="#about"
                  className="block transition hover:text-white"
                >
                  About
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-gray-800 pt-7">
            <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <p>
                © {new Date().getFullYear()} AquaLedger. All rights
                reserved.
              </p>

              <p className="text-gray-600">
                Built for smarter water business management.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}