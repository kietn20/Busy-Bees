"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import LogoutButton from "./logout-button";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header>
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-semibold text-gray-800">
          BusyBee
        </Link>
        <div className="space-x-4 flex items-center">
          {user ? (
            // --- User is Logged In ---
            <>
              <p className="text-gray-800">Welcome, {user.firstName}!</p>
              <button className="text-gray-600 hover:text-gray-800 border border-gray-600 font-medium py-2 px-5 rounded-3xl mx-2">
                <LogoutButton />
              </button>
            </>
          ) : (
            // --- User is Logged Out ---
            <>
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-800 border border-gray-600 font-medium py-2 px-5 rounded-3xl mx-2"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="text-gray-600 hover:text-gray-100 border border-gray-600 bg-gray-600 text-white font-medium py-2 px-5 rounded-3xl mx-2"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
