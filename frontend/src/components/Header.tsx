"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import LogoutButton from "./logout-button";

export default function Header() {
  const { user } = useAuth();

  return (
    <header>
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-semibold">
          BusyBee
        </Link>
        <div className="space-x-4 flex items-center">
          {user ? (
            // --- User is Logged In ---
            <>
              <p className="text-[#5f471d]">Welcome, {user.firstName}!</p>
              <button className="cursor-pointer text-[#5f471d] border border-[#5f471d] hover:bg-accent hover:text-accent-foreground font-medium py-2 px-5 rounded-3xl mx-2 text-base">
                <LogoutButton />
              </button>
            </>
          ) : (
            // --- User is Logged Out ---
            <>
              <Link
                href="/login"
                className="text-[#5f471d] border border-[#5f471d] hover:bg-accent hover:text-accent-foreground font-medium py-2 px-5 rounded-3xl mx-2"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="text-[#5f471d] bg-[#FFDEA3] hover:bg-primary/80 font-medium py-2 px-5 rounded-3xl mx-2"
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
