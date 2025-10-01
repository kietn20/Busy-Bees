"use client";
import { useState, ChangeEvent, FormEvent, FocusEvent } from "react";
import axios from "axios";

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function EditAccountForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState("");

  // 🔹 Field-specific validation
  const validateField = (name: string, value: string) => {
    let error = "";

    switch (name) {
      case "firstName":
        if (!value.trim()) error = "First name is required.";
        break;
      case "lastName":
        if (!value.trim()) error = "Last name is required.";
        break;
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) error = "Please enter a valid email address.";
        break;
      case "password":
        if (value && value.length < 8)
          error = "Password must be at least 8 characters.";
        break;
      case "confirmPassword":
        if (value !== password) error = "Passwords do not match.";
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // 🔹 Validate all fields before submit
  const validateAll = (): boolean => {
    validateField("firstName", firstName);
    validateField("lastName", lastName);
    validateField("email", email);
    validateField("password", password);
    validateField("confirmPassword", confirmPassword);

    return Object.values(errors).every((err) => !err);
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateAll()) return;

    try {
      await axios.put("http://localhost:5000/api/users/update", {
        firstName,
        lastName,
        email,
        password,
      });

      setSuccess("Account updated successfully!");
      setErrors({});
    } catch (error: any) {
      setSuccess("");
      setErrors({ email: "Failed to update account. Please try again." });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow space-y-4"
    >
      <h2 className="text-2xl font-bold text-center">Edit Account</h2>

      {/* First & Last Name */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <label className="block text-sm font-medium">First Name</label>
          <input
            type="text"
            name="firstName"
            value={firstName}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFirstName(e.target.value)
            }
            onBlur={handleBlur}
            className="w-full border p-2 rounded"
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm">{errors.firstName}</p>
          )}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={lastName}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setLastName(e.target.value)
            }
            onBlur={handleBlur}
            className="w-full border p-2 rounded"
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          onBlur={handleBlur}
          className="w-full border p-2 rounded"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium">New Password</label>
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          onBlur={handleBlur}
          className="w-full border p-2 rounded"
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-medium">Confirm New Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setConfirmPassword(e.target.value)
          }
          onBlur={handleBlur}
          className="w-full border p-2 rounded"
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Success message */}
      {success && <p className="text-green-600 text-center">{success}</p>}

      {/* Update button */}
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
