"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";

interface EditAccountFormProps {
  userId?: string | null;
  token?: string | null;
}

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface ErrorsState {
  [key: string]: string;
}

export default function EditAccountForm({ userId = null, token = null }: EditAccountFormProps) {
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<ErrorsState>({});
  const [submitError, setSubmitError] = useState<string>("");
  const [submitSuccess, setSubmitSuccess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(Boolean(userId));

  // Prefill user data if userId provided
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchUser() {
      try {
        const res = await axios.get(`/api/users/${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = res.data;
        setForm((f) => ({
          ...f,
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          password: "",
          confirmPassword: "",
        }));
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [userId, token]);

  // Validation helpers
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

  // Validate single field
  function validateField(name: keyof FormState, value: string): boolean {
    let message = "";

    if (name === "firstName") {
      if (!value.trim()) message = "First name is required.";
      else if (value.length > 50) message = "First name must be ≤ 50 chars.";
    }
    if (name === "lastName") {
      if (!value.trim()) message = "Last name is required.";
      else if (value.length > 50) message = "Last name must be ≤ 50 chars.";
    }
    if (name === "email") {
      if (!value.trim()) message = "Email is required.";
      else if (!emailRegex.test(value)) message = "Please enter a valid email.";
    }
    if (name === "password") {
      if (value && !strongPasswordRegex.test(value)) {
        message =
          "Password must be ≥8 chars, include uppercase, lowercase, number, and special char.";
      }
    }
    if (name === "confirmPassword") {
      if (value !== form.password) message = "Passwords do not match.";
    }

    setErrors((prev) => ({ ...prev, [name]: message }));
    return message === "";
  }

  // Handle input changes
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    setSubmitError("");
    setSubmitSuccess("");

    if (name !== "confirmPassword") {
      validateField(name as keyof FormState, value);
    } else {
      if (value) validateField("confirmPassword", value);
      else setErrors((p) => ({ ...p, confirmPassword: "" }));
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    const vFirst = validateField("firstName", form.firstName);
    const vLast = validateField("lastName", form.lastName);
    const vEmail = validateField("email", form.email);
    const vPassword = validateField("password", form.password);
    const vConfirm = validateField("confirmPassword", form.confirmPassword);

    const passwordProvided = Boolean(form.password);
    const passwordOK = !passwordProvided || (vPassword && vConfirm);

    if (!(vFirst && vLast && vEmail && passwordOK)) {
      setSubmitError("Please fix the highlighted fields.");
      return;
    }

    const payload: Partial<FormState> = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
    };
    if (passwordProvided) payload.password = form.password;

    try {
      const url = userId ? `/api/users/${userId}` : `/api/users/update`;
      const res = await axios.put(url, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setSubmitSuccess(res.data?.message || "Account updated successfully.");
      setErrors({});
      setForm((f) => ({ ...f, password: "", confirmPassword: "" }));
    } catch (err: any) {
      const resp = err?.response?.data;
      if (resp?.errors && Array.isArray(resp.errors)) {
        const byField: ErrorsState = {};
        resp.errors.forEach((it: any) => {
          if (it.param) byField[it.param] = it.msg;
        });
        setErrors((p) => ({ ...p, ...byField }));
        setSubmitError("Please fix validation errors.");
      } else if (resp?.message) {
        setSubmitError(resp.message);
      } else {
        setSubmitError("Update failed. Try again.");
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-8 py-10">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Edit Account</h1>
            <p className="text-gray-600 mb-6">
              Update your profile information below.
            </p>

            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                {/* First + Last side-by-side */}
                <div className="flex flex-col md:flex-row md:space-x-4">
                  <div className="flex-1 mb-4 md:mb-0">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      onBlur={(e) => validateField("firstName", e.target.value)}
                      className={`block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.firstName
                          ? "border-red-300 focus:ring-red-200"
                          : "border-gray-200 focus:ring-yellow-300"
                      }`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                    )}
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      onBlur={(e) => validateField("lastName", e.target.value)}
                      className={`block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.lastName
                          ? "border-red-300 focus:ring-red-200"
                          : "border-gray-200 focus:ring-yellow-300"
                      }`}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={(e) => validateField("email", e.target.value)}
                    type="email"
                    className={`block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      errors.email
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-200 focus:ring-yellow-300"
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    onBlur={(e) => validateField("password", e.target.value)}
                    type="password"
                    placeholder="Leave blank to keep current password"
                    className={`block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      errors.password
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-200 focus:ring-yellow-300"
                    }`}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    onBlur={(e) => validateField("confirmPassword", e.target.value)}
                    type="password"
                    className={`block w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      errors.confirmPassword
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-200 focus:ring-yellow-300"
                    }`}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* submit & messages */}
                {submitError && (
                  <p className="mt-4 text-center text-red-600">{submitError}</p>
                )}
                {submitSuccess && (
                  <p className="mt-4 text-center text-green-600">{submitSuccess}</p>
                )}

                <div className="mt-6 flex justify-center">
                  <button
                    type="submit"
                    className="bg-yellow-400 text-black font-semibold px-8 py-2 rounded-full hover:bg-yellow-500 transition"
                  >
                    Update
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
