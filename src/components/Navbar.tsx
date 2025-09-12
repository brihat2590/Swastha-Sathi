"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{
    name?: string;
    email?: string;
    image?: string;
  } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const session = await authClient.getSession();
      if (session?.data?.user) {
        setUser({
          name: session.data.user.name,
          email: session.data.user.email,
          image: session.data.user.image || undefined,
        });
      }
    };
    getSession();
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut();
    setUser(null);
    setDropdownOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b h-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo + Nav */}
        <div className="flex items-center space-x-10">
          <Link href={"/"}>
            <img src={"/synergy.svg"} alt="Logo" className="h-10 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8 text-gray-700 font-medium">
            <Link href="/dashboard" className="hover:text-indigo-600">
              Chat
            </Link>
            <Link href="/nearby" className="hover:text-indigo-600">
              Finder
            </Link>
            <Link href="/weather" className="hover:text-indigo-600">
              Weather
            </Link>
          </nav>
        </div>

        {/* Right Nav */}
        <div className="flex items-center space-x-6 relative">
          {!user&&<Link
            href="/contact"
            className="hidden md:inline text-gray-700 hover:text-indigo-600"
          >
            Contact sales
          </Link>}

          {/* If logged in → show user photo OR initial */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="focus:outline-none flex items-center justify-center h-10 w-10 rounded-full border bg-gray-100 text-gray-700 font-semibold"
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt="User Avatar"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <span>{user.name?.charAt(0).toUpperCase()}</span>
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg py-2 z-50">
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/sign-in"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition"
            >
              Get started
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-gray-700 focus:outline-none"
          >
            {mobileOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white shadow-md px-6 pb-4 space-y-4">
          <Link
            href="/dashboard"
            className="block text-gray-700 hover:text-indigo-600"
            onClick={() => setMobileOpen(false)}
          >
            Chat
          </Link>
          <Link
            href="/nearby"
            className="block text-gray-700 hover:text-indigo-600"
            onClick={() => setMobileOpen(false)}
          >
            Finder
          </Link>
          <Link
            href="/weather"
            className="block text-gray-700 hover:text-indigo-600"
            onClick={() => setMobileOpen(false)}
          >
            Weather
          </Link>
          {!user&&<Link
            href="/contact"
            className="block text-gray-700 hover:text-indigo-600"
            onClick={() => setMobileOpen(false)}
          >
            Contact sales
          </Link>}
        </div>
      )}
    </header>
  );
}
