'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import {
  FileCheck2,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  MapPin,
  ArrowRight,
  Eye,
} from 'lucide-react';

export default function AdminReportsListPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (categoryFilter !== 'ALL') params.append('damageCategory', categoryFilter);
      if (search) params.append('search', search);

      const data = await apiFetch(`/reports?${params.toString()}`);
      setReports(data.reports || []);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReports();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Damage Reports & Verification Console
          </h1>
          <p className="text-xs text-slate-500">
            Verify AI detections, eliminate duplicate submissions, and approve defects for repair contracting
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search report number (SR-2026-0001), road name, or city..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600"
          />
        </form>

        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="AI_PROCESSED">AI Processed</option>
            <option value="VERIFIED">Verified</option>
            <option value="CONTRACTED">Contracted</option>
            <option value="REPAIRED">Repaired</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="ALL">All Categories</option>
            <option value="POTHOLE">Potholes</option>
            <option value="ALLIGATOR_CRACK">Alligator Cracks</option>
            <option value="SURFACE_BREAK">Surface Breaks</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Evidence</th>
                <th className="py-3 px-4">Report ID</th>
                <th className="py-3 px-4">Defect & Location</th>
                <th className="py-3 px-4">AI Confidence</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading records...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No damage reports found matching filter.
                  </td>
                </tr>
              ) : (
                reports.map((r) => {
                  const detection = r.detections && r.detections[0];
                  const photo = r.evidence && r.evidence[0]?.mediaUrl;
                  const isCritical = detection?.severity === 'CRITICAL' || detection?.severity === 'HIGH';

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        {photo ? (
                          <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-900 border border-slate-200">
                            <img src={photo} alt="Report thumbnail" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-14 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">
                            No photo
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                          {r.reportNumber}
                        </span>
                        {r.qrCode && (
                          <span className="block text-[10px] text-purple-600 font-semibold mt-0.5">
                            via QR: {r.qrCode.code}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-bold text-slate-900 truncate">{r.title}</p>
                        <p className="text-slate-500 truncate text-[11px] flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{r.address}</span>
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        {detection ? (
                          <span className="font-bold text-slate-800">
                            {Math.round(detection.confidence * 100)}%
                          </span>
                        ) : (
                          <span className="text-slate-400">Pending</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {detection ? (
                          <span
                            className={`font-black text-[10px] px-2 py-0.5 rounded uppercase ${
                              detection.severity === 'CRITICAL'
                                ? 'bg-red-100 text-red-800'
                                : detection.severity === 'HIGH'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {detection.severity}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase ${
                            r.status === 'REPAIRED'
                              ? 'bg-green-100 text-green-800'
                              : r.status === 'VERIFIED'
                              ? 'bg-blue-100 text-blue-800'
                              : r.status === 'CONTRACTED'
                              ? 'bg-purple-100 text-purple-800'
                              : r.status === 'REJECTED'
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {r.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/admin/reports/${r.id}`}
                          className="inline-flex items-center space-x-1 bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect & Verify</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

