'use client';

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
    const { user } = useAuth();

    return (
        <ProtectedRoute>
            <div className="p-24">
                <h1 className="text-3xl font-bold">User Dashboard</h1>

                {user && (
                    <div className="mt-8 bg-white p-6 rounded-lg shadow-md text-black">
                        <h2 className="text-2xl font-semibold">Account Information</h2>
                        <p className="mt-4">
                            <strong>Name:</strong> {user.firstName}
                        </p>
                        <p className="mt-2">
                            <strong>Email:</strong> {user.email}
                        </p>
                        <p className="mt-2">
                            <strong>User ID:</strong> {user.id}
                        </p>
                    </div>
                )}


            </div>
        </ProtectedRoute>
    );
}