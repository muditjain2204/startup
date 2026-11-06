'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { apiFetch } from '@/lib/api';
import {
  ShieldAlert,
  HardHat,
  User as UserIcon,
  Bell,
  LogOut,
  Menu,
  X,
  Compass,
  FileText,
  MapPin,
  QrCode,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, switchDemoUser } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifs = async () => {
    if (!user) return;
    try {
      const data = await apiFetch('/notifications');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const markRead = async (id: string) => {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
      fetchNotifs();
    } catch {
      // Ignore
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center text-white shadow-md">
                <Compass className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  SmartRoad <span className="text-blue-600 font-extrabold">AI</span>
                </span>
                <span className="block text-[10px] font-semibold tracking-wider text-slate-600 uppercase">
                  Govt of NCT Delhi • PWD
                </span>
              </div>
            </Link>

            {/* Portal Switcher Tabs */}
            {user && (
              <div className="hidden lg:flex items-center ml-6 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                <Link
                  href="/admin"
                  className={`px-3 py-1.5 rounded-md flex items-center space-x-1.5 transition ${
                    pathname.startsWith('/admin')
                      ? 'bg-white text-blue-700 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Admin PWD</span>
                </Link>
                <Link
                  href="/contractor"
                  className={`px-3 py-1.5 rounded-md flex items-center space-x-1.5 transition ${
                    pathname.startsWith('/contractor')
                      ? 'bg-white text-blue-700 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <HardHat className="w-3.5 h-3.5" />
                  <span>Contractor</span>
                </Link>
                <Link
                  href="/citizen"
                  className={`px-3 py-1.5 rounded-md flex items-center space-x-1.5 transition ${
                    pathname.startsWith('/citizen')
                      ? 'bg-white text-blue-700 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Citizen</span>
                </Link>
              </div>
            )}
          </div>

          {/* Quick Demo Switcher Pills */}
          <div className="hidden xl:flex items-center space-x-2 bg-blue-50/70 border border-blue-200/60 px-3 py-1.5 rounded-full text-xs">
            <span className="text-blue-900 font-medium text-[11px] mr-1">Switch Role:</span>
            <button
              onClick={() => switchDemoUser('ADMIN')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                user?.role === 'ADMIN' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-blue-100'
              }`}
            >
              Admin PWD
            </button>
            <button
              onClick={() => switchDemoUser('CONTRACTOR_RAJPUT')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                user?.role === 'CONTRACTOR' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-blue-100'
              }`}
            >
              Contractor
            </button>
            <button
              onClick={() => switchDemoUser('CITIZEN')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                user?.role === 'USER' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-blue-100'
              }`}
            >
              Citizen
            </button>
          </div>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center space-x-3">
            <Link
              href="/citizen/report"
              className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-3 py-2 rounded-lg shadow-sm transition"
            >
              <QrCode className="w-4 h-4" />
              <span>Report Damage</span>
            </Link>

            {user ? (
              <div className="flex items-center space-x-3">
                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 relative transition"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Popover */}
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                        <span className="font-semibold text-sm text-slate-900">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => markRead('all')}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-600">No new notifications</div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => markRead(n.id)}
                              className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition ${
                                !n.isRead ? 'bg-blue-50/50' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <span className="font-semibold text-slate-800">{n.title}</span>
                                {!n.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-blue-600 mt-1"></span>
                                )}
                              </div>
                              <p className="text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                              {n.link && (
                                <Link
                                  href={n.link}
                                  className="text-blue-600 font-medium mt-1 inline-flex items-center space-x-1"
                                >
                                  <span>View details</span>
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Pill */}
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-900">{user.fullName}</span>
                  <span className="text-[10px] font-medium text-slate-600 uppercase">
                    {user.role === 'ADMIN'
                      ? 'PWD Chief Engineer'
                      : user.role === 'CONTRACTOR'
                      ? 'Verified Contractor'
                      : 'Registered Citizen'}
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="p-2 text-slate-600 hover:text-red-600 rounded-lg hover:bg-slate-100 transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 px-3 py-2 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="text-xs sm:text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-lg transition"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2">
          {user ? (
            <>
              <div className="py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{user.fullName}</p>
                <p className="text-[11px] text-slate-600">{user.email}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 py-2">
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 px-1 text-xs font-semibold bg-slate-50 rounded-lg hover:bg-blue-50 text-slate-700"
                >
                  Admin Portal
                </Link>
                <Link
                  href="/contractor"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 px-1 text-xs font-semibold bg-slate-50 rounded-lg hover:bg-blue-50 text-slate-700"
                >
                  Contractor
                </Link>
                <Link
                  href="/citizen"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 px-1 text-xs font-semibold bg-slate-50 rounded-lg hover:bg-blue-50 text-slate-700"
                >
                  Citizen
                </Link>
              </div>
            </>
          ) : (
            <div className="space-y-1">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-semibold text-slate-700"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-semibold text-blue-600"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

