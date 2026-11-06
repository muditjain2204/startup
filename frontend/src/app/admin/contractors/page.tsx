'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import {
  HardHat,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Building2,
  MapPin,
  FileText,
  Sliders,
} from 'lucide-react';

export default function AdminContractorsPage() {
  const [contractors, setContractors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedRadius, setSelectedRadius] = useState<Record<string, string>>({});

  const fetchContractors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (search) params.append('search', search);

      const data = await apiFetch(`/contractors?${params.toString()}`);
      setContractors(data.contractors || []);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractors();
  }, [statusFilter]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const radius = selectedRadius[id];
    try {
      await apiFetch(`/contractors/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: newStatus,
          operatingRadiusKm: radius ? parseFloat(radius) : undefined,
        }),
      });
      alert(`Contractor status updated to ${newStatus}`);
      fetchContractors();
    } catch (err: any) {
      alert(err.message || 'Error updating contractor');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Registered Contractor Verification & Fleet Registry
          </h1>
          <p className="text-xs text-slate-500">
            Verify GSTIN details, enlistment licenses, machinery fleet, and configure operating radius
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg transition ${
              statusFilter === st
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Contractors Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading contractor registry...</div>
        ) : contractors.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
            No contractors found in this category.
          </div>
        ) : (
          contractors.map((c) => {
            const isApproved = c.status === 'APPROVED';
            let machineryList: string[] = [];
            try {
              machineryList = typeof c.machinery === 'string' ? JSON.parse(c.machinery) : c.machinery;
            } catch {
              machineryList = [c.machinery];
            }

            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-slate-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                      <HardHat className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{c.companyName}</h3>
                      <p className="text-xs text-slate-500">Contact: {c.user?.fullName} ({c.user?.email})</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`text-xs font-bold px-3 py-0.5 rounded-full uppercase ${
                        isApproved
                          ? 'bg-green-100 text-green-800'
                          : c.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {c.status}
                    </span>
                    <span className="text-xs font-bold text-amber-600">
                      ★ {c.rating} / 5.0
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Verification Credentials</span>
                    <p className="text-slate-700">GSTIN: <b className="font-mono text-slate-900">{c.gstNumber || 'Pending'}</b></p>
                    <p className="text-slate-700">License: <b className="text-slate-900">{c.licenseNumber || 'Unspecified'}</b></p>
                    <p className="text-slate-700">Experience: <b>{c.experienceYears} Years</b> • Workforce: <b>{c.workforceCount} Persons</b></p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Registered Depot & Operating Range</span>
                    <p className="text-slate-700">{c.address}</p>
                    <p className="text-blue-700 font-semibold">
                      Current Range: {c.operatingRadiusKm} km radius from plant
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Machinery & Fleet</span>
                    <div className="flex flex-wrap gap-1">
                      {machineryList.map((m: string, i: number) => (
                        <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px]">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Verification Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center space-x-2">
                    <label className="text-slate-600 font-medium">Set Operating Radius (km):</label>
                    <input
                      type="number"
                      defaultValue={c.operatingRadiusKm}
                      onChange={(e) =>
                        setSelectedRadius({ ...selectedRadius, [c.id]: e.target.value })
                      }
                      className="w-20 px-2 py-1 border border-slate-300 rounded font-bold text-center"
                    />
                  </div>

                  <div className="flex gap-2">
                    {c.status !== 'APPROVED' && (
                      <button
                        onClick={() => handleUpdateStatus(c.id, 'APPROVED')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition flex items-center space-x-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve Contractor</span>
                      </button>
                    )}

                    {c.status !== 'REJECTED' && (
                      <button
                        onClick={() => handleUpdateStatus(c.id, 'REJECTED')}
                        className="bg-white hover:bg-red-50 text-red-700 border border-red-200 font-bold px-3 py-1.5 rounded-lg text-xs transition"
                      >
                        Reject
                      </button>
                    )}

                    {c.status !== 'SUSPENDED' && (
                      <button
                        onClick={() => handleUpdateStatus(c.id, 'SUSPENDED')}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg text-xs transition"
                      >
                        Suspend
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
