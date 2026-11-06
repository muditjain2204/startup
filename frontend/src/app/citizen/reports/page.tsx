'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/authContext';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  MapPin,
  Camera,
  ShieldCheck,
  Search,
} from 'lucide-react';

export default function MyReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    apiFetch(`/reports?myReportsOnly=true${filterStatus !== 'ALL' ? `&status=${filterStatus}` : ''}`)
      .then((data) => setReports(data.reports || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filterStatus]);

  const getLifecycleStage = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 1;
      case 'AI_PROCESSED':
        return 2;
      case 'VERIFIED':
        return 3;
      case 'CONTRACTED':
        return 4;
      case 'REPAIRED':
        return 5;
      default:
        return 1;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            My Submitted Road Reports
          </h1>
          <p className="text-xs text-slate-500">
            Track real-time status from citizen submission to PWD inspection approval
          </p>
        </div>

        <Link
          href="/citizen/report"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-lg text-xs shadow-sm transition flex items-center space-x-1.5"
        >
          <Camera className="w-4 h-4" />
          <span>New Damage Report</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2 text-xs font-semibold overflow-x-auto">
        {['ALL', 'SUBMITTED', 'AI_PROCESSED', 'VERIFIED', 'CONTRACTED', 'REPAIRED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              filterStatus === st
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-white rounded-xl border border-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Reports Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't submitted any road damage reports in this category yet.
          </p>
          <Link
            href="/citizen/report"
            className="inline-block bg-blue-600 text-white font-bold px-4 py-2 rounded-lg text-xs"
          >
            Report Road Damage Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const stage = getLifecycleStage(report.status);
            const isRepaired = report.status === 'REPAIRED';
            const evidencePhoto = report.evidence && report.evidence[0]?.mediaUrl;

            return (
              <div
                key={report.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5 hover:border-slate-300 transition"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-bold text-sm text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                      {report.reportNumber}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        isRepaired
                          ? 'bg-green-100 text-green-800'
                          : report.status === 'VERIFIED'
                          ? 'bg-blue-100 text-blue-800'
                          : report.status === 'CONTRACTED'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {report.status.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Reported on {new Date(report.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                {/* Content details */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  {/* Photo Thumbnail */}
                  <div className="md:col-span-1">
                    {evidencePhoto ? (
                      <div className="aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                        <img src={evidencePhoto} alt="Report evidence" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="aspect-video rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Description & AI findings */}
                  <div className="md:col-span-3 space-y-2 text-xs">
                    <h3 className="text-sm font-bold text-slate-900">{report.title}</h3>
                    <p className="text-slate-600 flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span>{report.address}</span>
                    </p>

                    {report.detections && report.detections[0] && (
                      <div className="inline-flex items-center space-x-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-[11px]">
                        <span>
                          AI Defect: <b>{report.detections[0].damageCategory}</b>
                        </span>
                        <span>
                          Severity: <b className="text-red-600">{report.detections[0].severity}</b>
                        </span>
                        {report.detections[0].estimatedDepthCm && (
                          <span>
                            Depth: <b>{report.detections[0].estimatedDepthCm} cm</b>
                          </span>
                        )}
                      </div>
                    )}

                    {report.repairContract && (
                      <div className="text-[11px] text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-lg flex items-center justify-between">
                        <span>
                          Tender Issued: <b>{report.repairContract.contractNumber}</b>
                        </span>
                        <span className="font-semibold uppercase">{report.repairContract.status}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Visual Lifecycle Stepper */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-bold">
                    <div className={`p-2 rounded-lg ${stage >= 1 ? 'bg-blue-50 text-blue-800' : 'bg-slate-50 text-slate-400'}`}>
                      <span>1. Submitted</span>
                    </div>
                    <div className={`p-2 rounded-lg ${stage >= 2 ? 'bg-blue-50 text-blue-800' : 'bg-slate-50 text-slate-400'}`}>
                      <span>2. AI Scanned</span>
                    </div>
                    <div className={`p-2 rounded-lg ${stage >= 3 ? 'bg-blue-50 text-blue-800' : 'bg-slate-50 text-slate-400'}`}>
                      <span>3. PWD Verified</span>
                    </div>
                    <div className={`p-2 rounded-lg ${stage >= 4 ? 'bg-purple-50 text-purple-800' : 'bg-slate-50 text-slate-400'}`}>
                      <span>4. Tender Awarded</span>
                    </div>
                    <div className={`p-2 rounded-lg ${stage >= 5 ? 'bg-green-100 text-green-900 font-extrabold' : 'bg-slate-50 text-slate-400'}`}>
                      <span>5. Repaired ✓</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

