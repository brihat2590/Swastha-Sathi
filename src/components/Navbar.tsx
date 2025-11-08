"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { authClient } from "@/lib/auth-client";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string; email?: string; image?: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle dropdown close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch session
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
        {/* Left side: Logo + Links */}
        <div className="flex items-center space-x-8">
          <Link href="/">
            <img src="/synergy.svg" alt="Logo" className="h-9 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8 text-gray-700 font-medium">
            <Link href="/dashboard" className="hover:text-indigo-600">
              Dashboard
            </Link>
            <Link href="/chat" className="hover:text-indigo-600">
              Chat
            </Link>
            <Link href="/custom" className="hover:text-indigo-600">
              Plans
            </Link>
            <Link href="/nearby" className="hover:text-indigo-600">
              Finder
            </Link>
            <Link href="/weather" className="hover:text-indigo-600">
              Weather
            </Link>
          </nav>
        </div>

        {/* Right Side: Buttons / User */}
        <div className="flex items-center space-x-4 relative">
          {!user && (
            <Link
              href="/contact"
              className="hidden md:inline text-gray-700 hover:text-indigo-600"
            >
              Contact sales
            </Link>
          )}

          {/* USER DROPDOWN:
              Hidden on small screens (visible only on lg and up).
              Mobile users get profile links inside the mobile menu below.
          */}
          {user ? (
            <div className="hidden lg:flex relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-center h-10 w-10 rounded-full border bg-gray-100 text-gray-700 font-semibold hover:ring-2 hover:ring-indigo-300 transition"
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
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

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-lg py-2 z-50"
                  >
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/updateHealth"
                      onClick={() => setDropdownOpen(false)}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Daily health
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/sign-in"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition hidden sm:inline"
            >
              Get started
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-gray-700 focus:outline-none"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Overlay + Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Mobile Menu */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="absolute top-16 left-0 right-0 bg-white shadow-lg rounded-b-2xl px-6 py-6 space-y-5 z-50 text-gray-800 font-medium flex flex-col"
            >
              <Link className="text-purple-600 underline" href="/dashboard" onClick={() => setMobileOpen(false)}>
                Dashboard
              </Link>
              <Link className="text-purple-600 underline" href="/chat" onClick={() => setMobileOpen(false)}>
                Chat
              </Link>
              <Link className="text-purple-600 underline" href="/custom" onClick={() => setMobileOpen(false)}>
                Plans
              </Link>
              <Link className="text-purple-600 underline" href="/nearby" onClick={() => setMobileOpen(false)}>
                Finder
              </Link>
              <Link className="text-purple-600 underline" href="/weather" onClick={() => setMobileOpen(false)}>
                Weather
              </Link>

              {!user && (
                <>
                  <Link className="text-purple-600 underline" href="/contact" onClick={() => setMobileOpen(false)}>
                    Contact sales
                  </Link>
                  <Link className="text-purple-600 underline" href="/sign-in" onClick={() => setMobileOpen(false)}>
                    Get started
                  </Link>
                </>
              )}

              {/* Mobile-only profile links when user is logged in */}
              {user && (
                <>
                  <Link className="text-purple-600 underline" href="/profile" onClick={() => setMobileOpen(false)}>
                    Profile
                  </Link>
                  <Link className="text-purple-600 underline" href="/updateHealth" onClick={() => setMobileOpen(false)}>
                    Daily health
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileOpen(false);
                    }}
                    className="text-left w-full text-purple-800 underline"
                  >
                    Sign Out
                  </button>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
