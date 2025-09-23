import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <div className="p-24">
                <h1 className="text-3xl font-bold">User Dashboard</h1>
            </div>
        </ProtectedRoute>
    );
}