"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Dashboard
        </h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            Welcome back, {user?.firstName}!
          </h2>
          <p className="text-gray-600">
            This is your protected dashboard. Only authenticated users can see this page.
          </p>
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h3 className="font-medium text-yellow-800">User Information:</h3>
            <p className="text-yellow-700">Email: {user?.email}</p>
            <p className="text-yellow-700">ID: {user?.id}</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}