'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Compass, ShieldCheck, HardHat, User as UserIcon, ArrowRight, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, switchDemoUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN') router.push('/admin');
      else if (user.role === 'CONTRACTOR') router.push('/contractor');
      else router.push('/citizen');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'ADMIN' | 'CONTRACTOR_RAJPUT' | 'CONTRACTOR_DELHI' | 'CITIZEN') => {
    setError('');
    setLoading(true);
    try {
      const user = await switchDemoUser(role);
      if (user.role === 'ADMIN') router.push('/admin');
      else if (user.role === 'CONTRACTOR') router.push('/contractor');
      else router.push('/citizen');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center mx-auto shadow-md">
            <Compass className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">SmartRoad AI Sign In</h2>
          <p className="text-xs text-slate-500">
            Access your government administration, contractor, or citizen portal
          </p>
        </div>

        {/* 1-Click Demo Accounts */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 space-y-2 text-xs">
          <span className="font-bold text-blue-900 block text-[11px] uppercase tracking-wider">
            ⚡ Quick Demo Logins (1-Click Switch):
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('ADMIN')}
              className="flex items-center space-x-1.5 p-2 bg-white rounded-lg border border-blue-200 text-left hover:border-blue-500 hover:shadow-xs transition"
            >
              <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
              <div>
                <p className="font-bold text-slate-900 leading-tight">Admin PWD</p>
                <p className="text-[10px] text-slate-500">Chief Engineer</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('CONTRACTOR_RAJPUT')}
              className="flex items-center space-x-1.5 p-2 bg-white rounded-lg border border-blue-200 text-left hover:border-blue-500 hover:shadow-xs transition"
            >
              <HardHat className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold text-slate-900 leading-tight">Rajput Infra</p>
                <p className="text-[10px] text-slate-500">Approved (30km)</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('CONTRACTOR_DELHI')}
              className="flex items-center space-x-1.5 p-2 bg-white rounded-lg border border-blue-200 text-left hover:border-blue-500 hover:shadow-xs transition"
            >
              <HardHat className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <p className="font-bold text-slate-900 leading-tight">Delhi Paving</p>
                <p className="text-[10px] text-slate-500">Approved (25km)</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('CITIZEN')}
              className="flex items-center space-x-1.5 p-2 bg-white rounded-lg border border-blue-200 text-left hover:border-blue-500 hover:shadow-xs transition"
            >
              <UserIcon className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-slate-900 leading-tight">Citizen</p>
                <p className="text-[10px] text-slate-500">Aarav Sharma</p>
              </div>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@smartroad.gov.in"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-900 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-900 text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg shadow-md transition disabled:opacity-60 text-xs flex items-center justify-center space-x-1.5"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          Need an account?{' '}
          <Link href="/register" className="font-bold text-blue-600 hover:underline">
            Register as Citizen or Contractor
          </Link>
        </div>
      </div>
    </div>
  );
}
