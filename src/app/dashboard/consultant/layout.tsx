'use client';

import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const DashboardIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const UserCheckIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M2 21v-2a4 4 0 014-4h6a4 4 0 014 4v2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M17 11l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const HospitalIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const FileTextIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

interface LayoutProps {
  children: ReactNode;
}

export default function ConsultantLayout({ children }: LayoutProps) {
  const pathname = usePathname();

  const navItems = [
    { 
      href: '/dashboard/consultant', 
      label: 'Dashboard', 
      icon: DashboardIcon,
      exact: true 
    },
    { 
      href: '/dashboard/consultant/doctor-approvals', 
      label: 'Doctor Approvals', 
      icon: UserCheckIcon 
    },
    { 
      href: '/dashboard/consultant/wards', 
      label: 'Ward Management', 
      icon: HospitalIcon 
    },
    { 
      href: '/dashboard/consultant/bht-records', 
      label: 'BHT Records', 
      icon: FileTextIcon 
    },
  ];

  const isActive = (href: string, exact = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 fixed h-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-red-500 to-red-600 flex items-center justify-center text-white">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-gray-100">Consultant</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Dashboard</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, item.exact);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    active
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 bg-gray-50 dark:bg-gray-950">
        {children}
      </main>
    </div>
  );
}
