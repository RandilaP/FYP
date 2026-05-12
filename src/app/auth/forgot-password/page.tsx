"use client";

import React, { useState } from "react";
import NavBar from '@/app/components/NavBar';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      const resp = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, new_password: newPassword }),
      });

      const text = await resp.text();
      let data: any = text;
      try { data = text ? JSON.parse(text) : null; } catch {}

      if (!resp.ok) {
        const detail = (data && data.detail) || (data && data.message) || data || resp.statusText;
        setError(String(detail));
      } else {
        setMessage('Password updated successfully. You can now sign in with the new password.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-red-50 via-white to-blue-50 dark:from-gray-900 dark:via-black dark:to-gray-900">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Forgot Password</h2>
            <p className="mt-2 text-sm text-gray-600">Enter your email and a new password to reset.</p>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="p-3 bg-red-50 text-red-800 rounded">{error}</div>}
              {message && <div className="p-3 bg-green-50 text-green-800 rounded">{message}</div>}

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md" placeholder="you@hospital.lk" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input required type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md" placeholder="New password" />
              </div>

              <div>
                <button disabled={isLoading} type="submit" className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-2 rounded-md">
                  {isLoading ? 'Updating...' : 'Reset Password'}
                </button>
              </div>

              <div className="text-sm text-center">
                <Link href="/auth/login" className="text-red-600">Back to sign in</Link>
              </div>
            </form>
          </div>

          <p className="text-center text-xs text-gray-500">If your account exists and is allowed, the password will be changed.</p>
        </div>
      </div>
    </>
  );
}
