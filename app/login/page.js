"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    if (loading) return;

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed.");
        return;
      }

      // Login successful
      if (data.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }

      router.refresh();
    } catch (error) {
      console.error("Login error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome Back
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Login to your AquaLedger account
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              disabled={loading}
              autoComplete="email"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-black"
            />
          </div>

          {/* Password */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>

              <button
                type="button"
                onClick={() => router.push("/forgot-password")}
                className="text-sm font-medium text-black hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                disabled={loading}
                autoComplete="current-password"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-16 outline-none focus:border-black"
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

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Signup */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/signup")}
            className="font-medium text-black hover:underline"
          >
            Create Account
          </button>
        </p>
      </div>
    </main>
  );
}