import React, { useState } from "react";
import InputField from "../components/inputField";
import Button from "../components/button";
import { UserIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { URL } from "../utils/api";

function Auth() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    if (error) setError(null);
  };

  const handleLogin = async () => {
    if (!formData.username || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${URL}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminData", JSON.stringify(data.admin));
        console.log("Login successful");

        window.location.href = "/dashboard"; //takes the admin tothe dashboard page if the login is successful
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Login Card */}
        <div className="bg-gray-800 rounded-2xl border border-gray-600 p-12">
          {/* Header */}
          <h1 className="text-3xl font-semibold text-white text-center mb-10">
            Dashboard Login
          </h1>

          {error && (
            <div className="mb-6 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            {/* Username Field */}
            <InputField
              type="text"
              placeholder="Username"
              icon={<UserIcon className="w-5 h-5" />}
              value={formData.username}
              onChange={handleInputChange("username")}
              disabled={loading}
            />

            {/* Password Field */}
            <InputField
              type="password"
              placeholder="Password"
              icon={<LockClosedIcon className="w-5 h-5" />}
              value={formData.password}
              onChange={handleInputChange("password")}
              disabled={loading}
            />

            {/* Login Button */}
            <div className="mt-8">
              <Button
                onClick={handleLogin}
                className={`bg-blue-600 hover:bg-blue-700 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Auth;
