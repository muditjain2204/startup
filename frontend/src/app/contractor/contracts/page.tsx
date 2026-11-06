'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { HardHat, Compass, Clock, MapPin, Search, ArrowRight, DollarSign } from 'lucide-react';

export default function ContractorContractsPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEligible, setFilterEligible] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiFetch(`/contracts?eligibleOnly=${filterEligible}`)
      .then((data) => setContracts(data.contracts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filterEligible]);

  const filtered = contracts.filter((c) =>
    search ? c.title.toLowerCase().includes(search.toLowerCase()) || c.contractNumber.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Road Repair Tender Opportunities
          </h1>
          <p className="text-xs text-slate-500">
            Open competitive tenders published by Delhi NCR Public Works Department (PWD)
          </p>
        </div>

        {/* Radius Filter Toggle */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilterEligible(true)}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterEligible ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            Within My Radius
          </button>
          <button
            onClick={() => setFilterEligible(false)}
            className={`px-3 py-1.5 rounded-lg transition ${
              !filterEligible ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            All NCT Delhi Tenders
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by tender title or contract number (e.g. RC-2026-0001)..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600"
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-white rounded-xl border border-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <HardHat className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Matching Tenders Found</h3>
          <p className="text-xs text-slate-500">
            Check back soon or expand the filter to view tenders across all circles.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-bold text-sm text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                    {c.contractNumber}
                  </span>
                  <span className="text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full uppercase">
                    {c.status.replace('_', ' ')}
                  </span>
                  {c.contractorDistanceKm !== null && (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      {c.contractorDistanceKm} km from your plant
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-500 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Deadline: {new Date(c.biddingDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="md:col-span-3 space-y-1.5 text-xs">
                  <h3 className="text-base font-bold text-slate-900">{c.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{c.description}</p>
                  <p className="text-[11px] text-slate-500">
                    Requirements: <span className="font-medium text-slate-700">{c.repairRequirements}</span>
                  </p>
                </div>

                <div className="md:col-span-1 flex flex-col sm:items-end justify-center space-y-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="sm:text-right">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                      Estimated Budget
                    </span>
                    <span className="text-lg font-black text-slate-900">
                      ₹{c.estimatedBudget.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <Link
                    href={`/contractor/contracts/${c.id}`}
                    className="inline-flex items-center justify-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow transition w-full sm:w-auto"
                  >
                    <span>Inspect & Bid</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
