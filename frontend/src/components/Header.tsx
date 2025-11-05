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
		<header className="bg-white shadow-md">
			<nav className="container mx-auto px-6 py-4 flex justify-between items-center">
				<Link href="/" className="text-2xl font-bold text-gray-800">
					Busy Bee 🐝
				</Link>
				<div className="space-x-4 flex items-center">
					{user ? (
						// --- User is Logged In ---
						<>
							<span className="text-gray-800">
								Welcome, {user.firstName}!
							</span>
							<Link
								href="/"
								className="text-gray-600 hover:text-gray-800"
							>
								Dashboard
							</Link>
							<LogoutButton />
						</>
					) : (
						// --- User is Logged Out ---
						<>
							<Link
								href="/login"
								className="text-gray-600 hover:text-gray-800"
							>
								Login
							</Link>
							<Link
								href="/signup"
								className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold py-2 px-4 rounded"
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
