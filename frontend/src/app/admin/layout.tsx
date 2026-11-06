'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MapPin,
  FileCheck2,
  FileSpreadsheet,
  HardHat,
  QrCode,
  Sliders,
  Users,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

const adminNav = [
  { name: 'Dashboard Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'GIS Road Map', href: '/admin/map', icon: MapPin },
  { name: 'Damage Reports', href: '/admin/reports', icon: FileCheck2 },
  { name: 'Repair Tenders & Bids', href: '/admin/contracts', icon: FileSpreadsheet },
  { name: 'Contractors Registry', href: '/admin/contractors', icon: HardHat },
  { name: 'QR Code Stations', href: '/admin/qr', icon: QrCode },
  { name: 'AI Detection Thresholds', href: '/admin/thresholds', icon: Sliders },
  { name: 'User Management', href: '/admin/users', icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-300 hidden lg:flex flex-col border-r border-slate-800 shrink-0">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center space-x-2 text-white font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <span>PWD Enterprise Admin</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">NCT Delhi Municipal Circle</p>
        </div>

        <nav className="p-4 space-y-1 flex-1">
          {adminNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500">
          <span>SmartRoad AI • PostGIS 3.4 Active</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}

