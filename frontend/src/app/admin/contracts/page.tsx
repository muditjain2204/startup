'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import {
  FileSpreadsheet,
  Plus,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Eye,
  DollarSign,
} from 'lucide-react';

export default function AdminContractsListPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    apiFetch(`/contracts${statusFilter !== 'ALL' ? `?status=${statusFilter}` : ''}`)
      .then((data) => setContracts(data.contracts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Repair Contracts & Bidding Management
          </h1>
          <p className="text-xs text-slate-500">
            Publish municipal road repair contracts, monitor competitive contractor bids, and award projects
          </p>
        </div>

        <Link
          href="/admin/reports"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow-xs transition flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Tender From Verified Defect</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2 text-xs font-semibold overflow-x-auto">
        {['ALL', 'OPEN_FOR_BIDDING', 'AWARDED', 'UNDER_REVIEW', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              statusFilter === st
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {st.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Tender ID</th>
                <th className="py-3 px-4">Project Title</th>
                <th className="py-3 px-4">Estimated Budget</th>
                <th className="py-3 px-4">Bids Submitted</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading tenders...
                  </td>
                </tr>
              ) : contracts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No repair contracts found.
                  </td>
                </tr>
              ) : (
                contracts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                        {c.contractNumber}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-bold text-slate-900 truncate">{c.title}</p>
                      <p className="text-slate-500 truncate text-[11px]">
                        Target: {c.targetLatitude}° N, {c.targetLongitude}° E • {c.eligibleRadiusKm} km radius
                      </p>
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900">
                      ₹{c.estimatedBudget?.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                        {c.bids?.length || 0} Bids
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-500">
                      {new Date(c.biddingDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase ${
                          c.status === 'AWARDED'
                            ? 'bg-green-100 text-green-800'
                            : c.status === 'OPEN_FOR_BIDDING'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {c.status.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/contracts/${c.id}`}
                        className="inline-flex items-center space-x-1 bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Bids & Award</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

