"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";

interface EditAccountFormProps {
  userId: string;
}

export default function EditAccountForm({ userId }: EditAccountFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!formData.firstName) newErrors.push("First name is required.");
    if (!formData.lastName) newErrors.push("Last name is required.");
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.push("Email is invalid.");

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

    if (formData.password && !passwordRegex.test(formData.password)) {
      newErrors.push(
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character."
      );
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.push("Passwords do not match.");
    }

    return newErrors;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMessage("");

    const newErrors = validateForm();
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/users/${userId}`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });

      setSuccessMessage("Account updated successfully.");
      setFormData({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" });
    } catch (error: any) {
      setErrors([error.response?.data?.message || "Update failed."]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 border rounded">
      <h2 className="text-xl mb-4 font-bold">Edit Account</h2>

      {errors.length > 0 && (
        <div className="mb-4 text-red-600">
          {errors.map((err, i) => (
            <p key={i}>{err}</p>
          ))}
        </div>
      )}

      {successMessage && <p className="mb-4 text-green-600">{successMessage}</p>}

      {/* First + Last name side by side */}
      <div className="flex gap-4 mb-2">
        <label className="flex-1">
          First Name:
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </label>

        <label className="flex-1">
          Last Name:
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </label>
      </div>

      <label className="block mb-2">
        Email:
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="border p-2 w-full"
        />
      </label>

      <label className="block mb-2">
        New Password:
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="border p-2 w-full"
        />
      </label>

      <label className="block mb-4">
        Confirm New Password:
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="border p-2 w-full"
        />
      </label>

      <div className="flex justify-center">
        <button
          type="submit"
          className="bg-yellow-400 text-black font-semibold px-6 py-2 rounded hover:bg-yellow-500 transition"
        >
          Update
        </button>
      </div>
    </form>
  );
}

