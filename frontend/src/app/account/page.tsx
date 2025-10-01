"use client";

import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import LogoutButton from "@/components/logout-button";
import DeleteAccountButton from "@/components/DeleteAccountButton";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Account() {
  const { user } = useAuth();
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <h1 className="text-xl font-bold text-gray-800 mb-4">
          Account Settings
        </h1>

        <div className="p-6">
          <h2 className="text-lg font-semibold mb-6 text-gray-800 border-b pb-2">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 mx-4">
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700"
              >
                First Name
              </label>
              <Input
                id="firstName"
                type="text"
                value={user?.firstName || ""}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700"
              >
                Last Name
              </label>
              <Input
                id="lastName"
                type="text"
                value={user?.lastName || ""}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-semibold mb-6 text-gray-800 border-b pb-2">
            Account Security
          </h2>

          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div className="space-y-2 mb-4 w-full mx-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-gray-50 w-3/4"
                />
              </div>

              <Button variant="outline" className="w-full sm:w-auto mt-2 w-1/4">
                Change Email
              </Button>
            </div>
            <div className="pt-6 flex justify-between items-center">
              <div className="w-3/4 space-y-1 mx-4">
                <h3 className="text-gray-700 font-medium">Password</h3>
                <p className="text-sm text-gray-600">
                  Change your password for security purposes.
                </p>
              </div>
              <Button variant="outline" className="w-full sm:w-auto w-1/4 mt-4">
                Change Password
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
            Account Actions
          </h2>

          {/* Logout Section */}
          <div className="mb-6 flex justify-between items-center w-full">
            <div className="space-y-1 mx-4">
              <h4 className="font-medium text-gray-800">Sign Out</h4>
              <p className="text-sm text-gray-600">
                Sign out of your account on this device.
              </p>
            </div>
            <div className="mt-4">
              <LogoutButton />
            </div>
          </div>

          {/* Delete Account Section */}
          <div className="pt-4 flex justify-between items-center w-full">
            <div className="space-y-1 mx-4">
              <h4 className="font-medium text-gray-800">Delete Account</h4>
              <p className="text-sm text-gray-600">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>
            </div>
            <div className="mt-4">
              <DeleteAccountButton />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
