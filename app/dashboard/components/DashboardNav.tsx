"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import NotificationBell from "@/components/notifications/NotificationBell";

interface User {
  name?: string | null;
  email?: string | null;
  role: string;
  avatarUrl?: string | null;
}

export default function DashboardNav({ user }: { user: User }) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-green-600">🌳</span>
              <span className="ml-2 text-xl font-semibold text-gray-900">
                SL Forest Monitor
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <NotificationBell />

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100"
              >
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {user.name || "User"}
                  </div>
                  <div className="text-xs text-gray-500">{user.role}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                  {user.name?.charAt(0) || "U"}
                </div>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200">
                  <a
                    href="/dashboard/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Your Profile
                  </a>
                  <a
                    href="/dashboard/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </a>
                  <hr className="my-1" />
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
