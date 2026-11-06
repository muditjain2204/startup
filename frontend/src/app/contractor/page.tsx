'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { apiFetch } from '@/lib/api';
import {
  HardHat,
  FileCheck,
  Award,
  Clock,
  Compass,
  MapPin,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  DollarSign,
} from 'lucide-react';

export default function ContractorDashboardPage() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch('/contracts?eligibleOnly=true'),
      apiFetch('/projects'),
    ])
      .then(([contractsData, projectsData]) => {
        setContracts(contractsData.contracts || []);
        setProjects(projectsData.projects || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const contractorProfile = user?.contractorProfile;
  const isApproved = contractorProfile?.status === 'APPROVED';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile & Status Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center space-x-1 ${
                isApproved
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              <span>{contractorProfile?.status || 'PENDING'} CONTRACTOR</span>
            </span>
            <span className="text-xs text-amber-400 font-bold">
              ★ {contractorProfile?.rating || '4.8'} / 5.0 PWD Performance Rating
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {contractorProfile?.companyName || user?.fullName || 'Contractor Portal'}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>Registered Depot: Okhla Phase-III, New Delhi</span>
            </span>
            <span className="flex items-center space-x-1">
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              <span>Operating Radius: <b>{contractorProfile?.operatingRadiusKm || 30} km</b></span>
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href="/contractor/contracts"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-3 rounded-xl shadow text-xs sm:text-sm flex items-center space-x-2 transition"
          >
            <HardHat className="w-4 h-4" />
            <span>Browse Open Tenders ({contracts.length})</span>
          </Link>
        </div>
      </div>

      {!isApproved && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <span className="font-bold">Verification Pending: </span>
            Your contractor registration is under review by PWD Chief Engineer. You can browse tenders now, but bidding will unlock once approved.
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium">Eligible Tenders in Radius</span>
          <div className="text-2xl font-black text-slate-900">{contracts.length}</div>
          <span className="text-[11px] text-blue-600 font-semibold">PostGIS Verified</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium">Active Repair Projects</span>
          <div className="text-2xl font-black text-amber-600">
            {projects.filter((p) => p.status !== 'COMPLETED').length}
          </div>
          <span className="text-[11px] text-slate-400">In execution</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium">Completed Projects</span>
          <div className="text-2xl font-black text-emerald-600">
            {projects.filter((p) => p.status === 'COMPLETED').length}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">Inspection Approved</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium">Contract Value Won</span>
          <div className="text-2xl font-black text-slate-900">₹2,47,000</div>
          <span className="text-[11px] text-slate-400">PWD Delhi Circle</span>
        </div>
      </div>

      {/* Available Tenders List */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Active Road Repair Tenders</h3>
            <p className="text-xs text-slate-500">
              Filtered for your registered plant radius ({contractorProfile?.operatingRadiusKm || 30} km)
            </p>
          </div>
          <Link
            href="/contractor/contracts"
            className="text-xs font-bold text-blue-600 hover:underline flex items-center space-x-1"
          >
            <span>View All Tenders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {contracts.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No tenders currently open within your radius.</p>
        ) : (
          <div className="space-y-3">
            {contracts.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                      {c.contractNumber}
                    </span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                      {c.contractorDistanceKm ? `${c.contractorDistanceKm} km away` : 'Within Radius'}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{c.title}</h4>
                  <p className="text-slate-500">{c.description}</p>
                </div>

                <div className="flex items-center space-x-4 shrink-0">
                  <div className="text-right text-xs">
                    <span className="text-slate-400 block text-[10px]">Estimated Budget</span>
                    <span className="font-black text-slate-900 text-sm">
                      ₹{c.estimatedBudget.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <Link
                    href={`/contractor/contracts/${c.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition"
                  >
                    Submit Bid
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ongoing Projects Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">My Awarded Repair Projects</h3>
            <p className="text-xs text-slate-500">
              Upload photographic evidence for Before, In-Progress, and After milestones
            </p>
          </div>
        </div>

        {projects.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No awarded projects active right now.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((p) => (
              <div key={p.id} className="p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-blue-700">{p.contract.contractNumber}</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      p.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs">{p.contract.title}</h4>
                <p className="text-[11px] text-slate-500">
                  Total Milestone Updates: <b>{p.updates?.length || 0} stages logged</b>
                </p>
                <Link
                  href={`/contractor/projects/${p.id}`}
                  className="block text-center bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 rounded-lg transition"
                >
                  Manage Project & Evidence
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
