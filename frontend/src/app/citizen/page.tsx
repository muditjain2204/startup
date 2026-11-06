'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuth } from '@/lib/authContext';
import { apiFetch } from '@/lib/api';
import { Scan, QrCode, FileText, CheckCircle, Clock, MapPin, ArrowRight } from 'lucide-react';

const DynamicGISMap = dynamic(() => import('@/components/GISMap').then((m) => m.GISMap), {
  ssr: false,
  loading: () => <div className="h-[360px] bg-slate-100 rounded-xl animate-pulse"></div>,
});

export default function CitizenDashboardPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [markers, setMarkers] = useState<any>({ reports: [], contracts: [], contractors: [], qrCodes: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load citizen reports
    apiFetch('/reports?myReportsOnly=true')
      .then((data) => setReports(data.reports || []))
      .catch(() => {});

    // Load GIS markers
    apiFetch('/analytics/map-markers')
      .then((data) => setMarkers(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Hero Card */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-200">
            Citizen Grievance & Infrastructure Redressal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user ? user.fullName : 'Citizen'}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
            Help improve road safety in Delhi NCR. Report potholes and damaged pavement with instant AI computer vision verification.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          <Link
            href="/citizen/report"
            className="flex items-center justify-center space-x-2 bg-white text-blue-900 font-extrabold px-5 py-3 rounded-xl shadow hover:bg-blue-50 transition text-xs sm:text-sm"
          >
            <Scan className="w-4 h-4 text-blue-700" />
            <span>Report Road Defect</span>
          </Link>
          <Link
            href="/citizen/scan"
            className="flex items-center justify-center space-x-2 bg-blue-900/60 hover:bg-blue-900 border border-blue-400 text-white font-bold px-5 py-3 rounded-xl transition text-xs sm:text-sm"
          >
            <QrCode className="w-4 h-4 text-amber-300" />
            <span>Scan Street QR</span>
          </Link>
        </div>
      </div>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/citizen/report"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition space-y-3 block"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
            <Scan className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">New Damage Report</h3>
          <p className="text-xs text-slate-500">
            Upload photo or video with automatic GPS coordinates and AI defect scoring.
          </p>
          <div className="text-xs font-bold text-blue-600 flex items-center space-x-1">
            <span>Start Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/citizen/scan"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-purple-500 hover:shadow-md transition space-y-3 block"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
            <QrCode className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">On-Site QR Scanner</h3>
          <p className="text-xs text-slate-500">
            Scan official PWD QR stickers installed at junctions, flyovers, and arterial roads.
          </p>
          <div className="text-xs font-bold text-purple-600 flex items-center space-x-1">
            <span>Open Camera Scanner</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/citizen/reports"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition space-y-3 block"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">My Submitted Reports</h3>
          <p className="text-xs text-slate-500">
            Track verification, tender bidding, and before/after repair inspection sign-offs.
          </p>
          <div className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
            <span>View All ({reports.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>

      {/* Live Road Defect Grid */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Delhi NCR Road Infrastructure Grid</h3>
            <p className="text-xs text-slate-500">
              Live OpenStreetMap view of reported potholes, open tenders, and repaired stretches
            </p>
          </div>
          <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
            Interactive GIS Layer
          </span>
        </div>

        <DynamicGISMap
          reports={markers.reports}
          contracts={markers.contracts}
          contractors={markers.contractors}
          qrCodes={markers.qrCodes}
          heightClass="h-[420px]"
        />
      </div>
    </div>
  );
}
