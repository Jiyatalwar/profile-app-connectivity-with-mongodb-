// components/Navbar.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getSession, handleLogout } from "@/app/actions/auth"

interface User {
  id?: string
  name?: string
  email?: string
  role?: "user" | "superuser"
}

export default function Navbar({ initialUser }: { initialUser?: User | null }) {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<User | null>(initialUser || null)

  // Fetch session on client mount if not passed as prop
  useEffect(() => {
    if (!initialUser) {
      getSession().then((session) => {
        if (session) setUser(session)
      })
    }
  }, [initialUser])

  // Get first character of name or email
  const initial = user?.name
    ? user.name.trim().charAt(0).toUpperCase()
    : user?.email
    ? user.email.trim().charAt(0).toUpperCase()
    : null

  return (
    <nav className="w-full bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      {/* Brand / Logo */}
      <Link href="/" className="text-xl font-bold text-gray-900">
        App
      </Link>

      {/* Right Side Avatar & Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-800 flex items-center justify-center font-bold text-lg transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          aria-label="User Menu"
        >
          {user && initial ? (
            /* Show User's First Initial when logged in */
            <span>{initial}</span>
          ) : (
            /* Default Gray Silhouette Icon when logged out */
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          )}
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <>
            {/* Backdrop to handle click outside */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20 transition-all">
              {user ? (
                /* LOGGED IN VIEW */
                <>
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-400 font-medium">Signed in as</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {user.name || user.email}
                    </p>
                    {user.role === "superuser" && (
                      <p className="text-xs text-blue-600 font-medium">Super user</p>
                    )}
                  </div>

                  {user.role === "superuser" && (
                    <Link
                      href="/admin"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 transition-colors"
                    >
                      Admin dashboard
                    </Link>
                  )}

                  <button
                    onClick={async () => {
                      setIsOpen(false)
                      await handleLogout()
                      setUser(null)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 font-medium hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                /* LOGGED OUT VIEW */
                <>
                  <Link
                    href="/signin"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-teal-100 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 text-sm text-teal-600 font-medium hover:bg-teal-100 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  )
}