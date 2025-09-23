import Link from 'next/link';

export default function Header() {
    return (
        <header className="bg-white shadow-md">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold text-gray-800">
                    Busy Bee 🐝
                </Link>
                <div className="space-x-4">
                    <Link href="/login" className="text-gray-600 hover:text-gray-800">
                        Login
                    </Link>
                    <Link href="/register" className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold py-2 px-4 rounded">
                        Sign Up
                    </Link>
                    <Link href="/dashboard" className="text-gray-600 hover:text-gray-800">
                        Dashboard
                    </Link>
                </div>
            </nav>
        </header>
    );
}