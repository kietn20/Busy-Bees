"use client";

import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import LogoutButton from "@/components/logout-button";
import DeleteAccountButton from "@/components/DeleteAccountButton";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/navigation";

export default function Account() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <h1 className="text-xl font-bold mb-4">Account Settings</h1>

        <div className="p-6">
          <h2 className="text-lg font-semibold mb-6 border-b pb-2">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 mx-4">
              <label htmlFor="firstName" className="block text-sm font-medium">
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
            <div className="space-y-2 mx-4">
              <label htmlFor="lastName" className="block text-sm font-medium">
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
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div className="space-y-2 mb-4 w-full mx-4">
                <label htmlFor="email" className="block text-sm font-medium t">
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
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">
            Account Actions
          </h2>

          {/* Edit Account Section */}
          <div className="flex justify-between items-center w-full mb-6">
            <div className="space-y-1 mx-4">
              <h4 className="font-medium">Edit Profile</h4>
              <p className="text-sm text-muted-foreground">
                Update your personal information.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/edit-account")}
              className="cursor-pointer"
            >
              Edit Account
            </Button>
          </div>

          {/* Logout Section */}
          <div className="mb-6 flex justify-between items-center w-full">
            <div className="space-y-1 mx-4">
              <h4 className="font-medium">Sign Out</h4>
              <p className="text-sm text-muted-foreground">
                Sign out of your account on this device.
              </p>
            </div>
            <div className="mt-4 bg-red-500 rounded-lg px-4 py-2 text-white text-sm">
              <LogoutButton />
            </div>
          </div>

          {/* Delete Account Section */}
          <div className=" flex justify-between items-center w-full">
            <div className="space-y-1 mx-4">
              <h4 className="font-medium">Delete Account</h4>
              <p className="text-sm text-muted-foreground">
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
