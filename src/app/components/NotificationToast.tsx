"use client";

import React, { useEffect } from 'react';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface NotificationToastProps {
  open: boolean;
  variant?: ToastVariant;
  title: string;
  message: string;
  onClose: () => void;
  durationMs?: number;
}

const variantStyles: Record<ToastVariant, { wrapper: string; title: string; bar: string }> = {
  success: {
    wrapper: 'border-green-200 bg-green-50 text-green-900 dark:border-green-900/60 dark:bg-green-900/20 dark:text-green-100',
    title: 'text-green-950 dark:text-green-50',
    bar: 'bg-green-500',
  },
  error: {
    wrapper: 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-100',
    title: 'text-red-950 dark:text-red-50',
    bar: 'bg-red-500',
  },
  warning: {
    wrapper: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-900/20 dark:text-amber-100',
    title: 'text-amber-950 dark:text-amber-50',
    bar: 'bg-amber-500',
  },
  info: {
    wrapper: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/60 dark:bg-blue-900/20 dark:text-blue-100',
    title: 'text-blue-950 dark:text-blue-50',
    bar: 'bg-blue-500',
  },
};

export default function NotificationToast({
  open,
  variant = 'info',
  title,
  message,
  onClose,
  durationMs = 4000,
}: NotificationToastProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = window.setTimeout(onClose, durationMs);
    return () => window.clearTimeout(timer);
  }, [durationMs, onClose, open]);

  if (!open) {
    return null;
  }

  const styles = variantStyles[variant];

  return (
    <div className="fixed top-6 right-6 z-80 w-[min(24rem,calc(100vw-2rem))] animate-in slide-in-from-top-2 fade-in duration-200">
      <div className={`overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-sm ${styles.wrapper}`}>
        <div className={`h-1 w-full ${styles.bar}`} />
        <div className="flex items-start gap-4 p-4">
          <div className={`mt-0.5 h-10 w-10 rounded-xl ${styles.bar} flex items-center justify-center text-white shadow-lg`}>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 8v4m0 4h.01M10.3 3.2h3.4L21 14.5v3.7c0 1.5-1.2 2.8-2.8 2.8H5.8C4.2 21 3 19.7 3 18.2v-3.7L10.3 3.2Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <div className={`text-sm font-semibold ${styles.title}`}>{title}</div>
            <p className="mt-1 text-sm leading-6 opacity-90">{message}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-current/70 transition-colors hover:bg-black/5 dark:hover:bg-white/5 hover:text-current"
            aria-label="Dismiss notification"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
