'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import {
  FileCheck2,
  HardHat,
  Users,
  QrCode,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  Activity,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/analytics/overview')
      .then((res) => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-28 bg-white rounded-xl border border-slate-200 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const distributions = data?.distributions || {};

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            PWD Infrastructure Administration Console
          </h1>
          <p className="text-xs text-slate-500">
            Delhi NCT Road Maintenance Operations • Live Municipal Database
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/map"
            className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold px-4 py-2 rounded-lg text-xs shadow-xs transition"
          >
            Open GIS Visualizer
          </Link>
          <Link
            href="/admin/reports"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow-xs transition"
          >
            Verify Pending Reports ({kpis.pendingReports || 0})
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium">Pending Damage Reports</span>
          <div className="text-2xl font-black text-amber-600">{kpis.pendingReports || 0}</div>
          <span className="text-[11px] text-slate-400">Requires engineer review</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium">Verified Defect Records</span>
          <div className="text-2xl font-black text-blue-600">{kpis.verifiedReports || 0}</div>
          <span className="text-[11px] text-slate-400">Ready for contracting</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium">Active Repair Contracts</span>
          <div className="text-2xl font-black text-purple-600">{kpis.openContracts || 0}</div>
          <span className="text-[11px] text-slate-400">Open for bidding</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium">Completed Repairs</span>
          <div className="text-2xl font-black text-emerald-600">{kpis.repairedReports || 0}</div>
          <span className="text-[11px] text-emerald-600 font-semibold">Inspection Approved</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium">Contractor Fleet</span>
          <div className="text-2xl font-black text-slate-900">{kpis.totalContractors || 0}</div>
          <span className="text-[11px] text-amber-600 font-semibold">
            {kpis.pendingContractors || 0} Pending Verification
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium">Total Bids Submitted</span>
          <div className="text-2xl font-black text-slate-900">{kpis.totalBids || 0}</div>
          <span className="text-[11px] text-slate-400">Competitive tender pool</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium">On-Street QR Stations</span>
          <div className="text-2xl font-black text-slate-900">{kpis.totalQRCodes || 0}</div>
          <span className="text-[11px] text-purple-600 font-semibold">
            {kpis.totalQRScans || 0} Total Citizen Scans
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium">Registered Citizens</span>
          <div className="text-2xl font-black text-slate-900">{kpis.totalUsers || 0}</div>
          <span className="text-[11px] text-slate-400">Delhi Public Grievance</span>
        </div>
      </div>

      {/* Analytics Distributions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Severity & Category Progress Bars */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Defect Severity Distribution</h3>
            <p className="text-xs text-slate-500">Live classification from AI Vision Computer Vision engine</p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-bold text-slate-800 mb-1">
                <span className="text-red-600 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-red-600 inline-block"></span>
                  <span>CRITICAL (Depth &gt; 8cm)</span>
                </span>
                <span>{distributions.severity?.CRITICAL || 0}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full"
                  style={{ width: `${Math.min(100, ((distributions.severity?.CRITICAL || 1) / (kpis.totalDetections || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-800 mb-1">
                <span className="text-amber-600 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                  <span>HIGH (Depth 6 - 8cm)</span>
                </span>
                <span>{distributions.severity?.HIGH || 0}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, ((distributions.severity?.HIGH || 1) / (kpis.totalDetections || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-800 mb-1">
                <span className="text-blue-600 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
                  <span>MEDIUM (Depth 3 - 6cm)</span>
                </span>
                <span>{distributions.severity?.MEDIUM || 0}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min(100, ((distributions.severity?.MEDIUM || 1) / (kpis.totalDetections || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 text-xs mb-3">Defect Categories</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(distributions.categories || {}).map(([cat, count]: [string, any]) => (
                <div key={cat} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="font-semibold text-slate-700">{cat}</span>
                  <span className="font-mono font-bold text-blue-700">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Audit Trail */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">System Audit Trail</h3>
              <p className="text-xs text-slate-500">Immutable record of engineer and contractor actions</p>
            </div>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3">
            {data?.recentActivities?.map((log: any) => (
              <div key={log.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 text-[10px]">
                    {log.action}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(log.timestamp).toLocaleString('en-IN', { timeStyle: 'short', dateStyle: 'short' })}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
