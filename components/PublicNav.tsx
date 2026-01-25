"use client";

import Link from "next/link";
import { useState } from "react";

export default function PublicNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-3xl">🌳</span>
              <div>
                <span className="text-xl font-bold text-green-600">
                  SL Forest Monitor
                </span>
                <p className="text-xs text-gray-500">Sierra Leone</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
            >
              About
            </Link>
            <Link
              href="/features"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
            >
              Features
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/monitor"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
            >
              Monitor
            </Link>
            <div className="border-l border-gray-300 h-6"></div>
            <Link
              href="/auth/login"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
            >
              Register
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-green-600"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className="block px-3 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-md font-medium"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="block px-3 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-md font-medium"
            >
              About
            </Link>
            <Link
              href="/features"
              className="block px-3 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-md font-medium"
            >
              Features
            </Link>
            <Link
              href="/contact"
              className="block px-3 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-md font-medium"
            >
              Contact
            </Link>
            <Link
              href="/monitor"
              className="block px-3 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-md font-medium"
            >
              Monitor
            </Link>
            <div className="border-t border-gray-200 my-2"></div>
            <Link
              href="/auth/login"
              className="block px-3 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-md font-medium"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="block px-3 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 text-center"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
