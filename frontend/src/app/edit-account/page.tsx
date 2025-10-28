"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import axios from "axios";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function EditAccount() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);

  const isOAuthUser = !!user?.googleId;

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    // Validation
    if (!form.firstName.trim()) {
      toast.error("First name is required");
      return;
    }
    if (form.firstName.length > 50) {
      toast.error("First name must be 50 characters or less");
      return;
    }
    if (!form.lastName.trim()) {
      toast.error("Last name is required");
      return;
    }
    if (form.lastName.length > 50) {
      toast.error("Last name must be 50 characters or less");
      return;
    }
    
    if (!isOAuthUser) {
      if (!form.email.trim()) {
        toast.error("Email is required");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        toast.error("Please enter a valid email address");
        return;
      }
    }

    if (!isOAuthUser && form.password) {
      if (form.password.length < 8) {
        toast.error("Password must be at least 8 characters");
        return;
      }
      const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
      if (!strongPasswordRegex.test(form.password)) {
        toast.error("Password must include uppercase, lowercase, number, and special character");
        return;
      }
      if (form.password !== form.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }

    setSaving(true);
    try {
      const payload: any = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
      };

      if (!isOAuthUser) {
        payload.email = form.email.trim();
        if (form.password) {
          payload.password = form.password;
        }
      }
      
      const response = await axios.put(
        "http://localhost:8080/api/account/update",
        payload,
        { 
          withCredentials: true,
          headers: {
            ...(localStorage.getItem('authToken') && {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            }),
          }
        }
      );

      toast.success(response.data.message || "Profile updated successfully!");
      
      await refreshUser();

      setForm(prev => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));

      setTimeout(() => {
        router.push("/account");
      }, 1000);
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to update profile";
      toast.error(message);
      
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err: any) => {
          toast.error(err.msg || err.message);
        });
      }
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Edit Account</h1>
          <p className="text-gray-600 mt-2">Update your profile information below.</p>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-6 text-gray-800 border-b pb-2">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="firstName"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                placeholder="Enter your first name"
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="lastName"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                placeholder="Enter your last name"
                maxLength={50}
              />
            </div>
          </div>

          {/* Email - Read-only for OAuth users */}
          <div className="space-y-2 mt-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address {!isOAuthUser && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={isOAuthUser}
                className={isOAuthUser ? "bg-gray-50 pr-36" : ""}
                placeholder="Enter your email"
              />
              {isOAuthUser && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                  Managed by Google
                </span>
              )}
            </div>
            {isOAuthUser && (
              <p className="text-xs text-gray-500">
                Your email is managed through your Google account and cannot be changed here.
              </p>
            )}
          </div>
        </div>

        {/* Password Section - Only for non-OAuth users */}
        {!isOAuthUser ? (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-6 text-gray-800 border-b pb-2">
              Change Password
            </h2>

            <div className="space-y-4 max-w-md">
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Leave blank to keep current password"
                />
                <p className="text-xs text-gray-500">
                  Must be at least 8 characters with uppercase, lowercase, number, and special character
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Confirm your new password"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-6 text-gray-800 border-b pb-2">
              Password
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <p className="text-sm text-blue-900 font-medium mb-1">
                    You're signed in with Google
                  </p>
                  <p className="text-sm text-blue-800 mb-3">
                    Your password is managed through your Google account.
                  </p>
                  <a
                    href="https://myaccount.google.com/security"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 font-medium"
                  >
                    Manage Google Account Security
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons - AT THE BOTTOM */}
        <div className="flex gap-4 justify-end">
          <Button variant="outline" onClick={() => router.push("/account")}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveProfile} 
            disabled={saving} 
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  );
}