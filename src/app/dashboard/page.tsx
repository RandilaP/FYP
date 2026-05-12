"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import NavBar from "../components/NavBar";

function getDashboardPath(role: string): string {
  const normalized = role.toLowerCase();
  if (normalized === "admin") return "/dashboard/admin";
  if (normalized === "doctor") return "/dashboard/doctor";
  if (normalized === "consultant") return "/dashboard/consultant";
  return "/";
}

export default function DashboardEntryPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      router.replace(getDashboardPath(user.role));
    }
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 dark:from-gray-900 dark:via-black dark:to-gray-900 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            {isAuthenticated
              ? "Redirecting to your role-specific dashboard..."
              : "Please sign in to access your dashboard."}
          </p>
          {!isAuthenticated && (
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/auth/login" className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors">
                Sign In
              </Link>
              <Link href="/auth/sign-up" className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
