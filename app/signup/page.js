"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    storeName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.name ||
      !formData.storeName ||
      !formData.email ||
      !formData.password
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          storeName: formData.storeName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create account.");
        return;
      }

      setSuccess("Account created successfully!");

      setFormData({
        name: "",
        storeName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      console.error("Signup error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Create Your Account
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Start managing your water business with AquaLedger
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Your Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              autoComplete="name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-black"
              disabled={loading}
            />
          </div>

          {/* Store Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Store / Business Name
            </label>

            <input
              type="text"
              name="storeName"
              value={formData.storeName}
              onChange={handleChange}
              placeholder="Enter your store name"
              autoComplete="organization"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-black"
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-black"
              disabled={loading}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Phone
            </label>

            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="03001234567"
              autoComplete="tel"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-black"
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                autoComplete="new-password"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-16 outline-none focus:border-black"
                disabled={loading}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-600 hover:text-black disabled:cursor-not-allowed"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                autoComplete="new-password"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-16 outline-none focus:border-black"
                disabled={loading}
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword((prev) => !prev)
                }
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-600 hover:text-black disabled:cursor-not-allowed"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Create Account */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="font-medium text-black hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </main>
  );
}