'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { apiFetch } from '@/lib/api';
import {
  FileSpreadsheet,
  CheckCircle,
  Award,
  DollarSign,
  Clock,
  MapPin,
  HardHat,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export default function AdminContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [awardLoading, setAwardLoading] = useState(false);
  const [awardedProject, setAwardedProject] = useState<any>(null);

  const fetchContract = async () => {
    try {
      const data = await apiFetch(`/contracts/${id}`);
      setContract(data.contract);
      if (data.contract.repairProject) {
        setAwardedProject(data.contract.repairProject);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchContract();
  }, [id]);

  const handleAward = async (bidId: string, companyName: string) => {
    if (!confirm(`Are you sure you want to award tender ${contract.contractNumber} to "${companyName}"? This will generate the active repair work order.`)) {
      return;
    }

    setAwardLoading(true);
    try {
      const res = await apiFetch(`/contracts/${id}/award`, {
        method: 'POST',
        body: JSON.stringify({ bidId }),
      });

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Ignore
      }

      setAwardedProject(res.project);
      fetchContract();
    } catch (err: any) {
      alert(err.message || 'Error awarding tender');
    } finally {
      setAwardLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-500">Loading tender and submitted bids...</div>;
  }

  if (!contract) {
    return <div className="p-12 text-center text-xs text-slate-500">Contract not found</div>;
  }

  const isAwarded = contract.status === 'AWARDED';
  const bids = contract.bids || [];
  const lowestBid = bids.length > 0 ? bids[0] : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <span className="font-mono font-black text-sm text-blue-700 bg-blue-50 px-3 py-1 rounded border border-blue-200">
              {contract.contractNumber}
            </span>
            <span
              className={`text-xs font-bold px-3 py-0.5 rounded-full uppercase ${
                isAwarded
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {contract.status.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <span className="text-slate-500">
              Budget: <b className="text-slate-900">₹{contract.estimatedBudget?.toLocaleString('en-IN')}</b>
            </span>
            <span className="text-slate-500">
              Bidding Closes:{' '}
              <b className="text-slate-900">
                {new Date(contract.biddingDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </b>
            </span>
          </div>
        </div>

        <h1 className="text-2xl font-black text-slate-900">{contract.title}</h1>
        <p className="text-xs text-slate-600 leading-relaxed">{contract.description}</p>
        <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <span className="font-bold text-slate-700 block mb-0.5">Repair Specification (MoRTH):</span>
          <span>{contract.repairRequirements}</span>
        </div>
      </div>

      {/* Awarded Banner if complete */}
      {isAwarded && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Award className="w-8 h-8 text-emerald-600 shrink-0" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Tender Awarded & Repair Project Active</h3>
              <p className="text-xs text-slate-600">
                Work order issued. Milestone photographic updates and PWD quality inspections can now be managed.
              </p>
            </div>
          </div>
          {awardedProject && (
            <Link
              href={`/admin/projects/${awardedProject.id}`}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition shrink-0"
            >
              Inspect Active Project Execution
            </Link>
          )}
        </div>
      )}

      {/* Bids Evaluation Console */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Submitted Competitive Contractor Bids</h3>
            <p className="text-xs text-slate-500">
              Ranked in order of price ascending (lowest responsive eligible tenderer)
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-700">
            {bids.length} Bid(s) Registered
          </span>
        </div>

        {bids.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No bids have been submitted by eligible contractors yet.
          </div>
        ) : (
          <div className="space-y-4">
            {bids.map((bid: any, idx: number) => {
              const isLowest = idx === 0;
              const isWinner = bid.status === 'ACCEPTED';
              const contractor = bid.contractor;

              return (
                <div
                  key={bid.id}
                  className={`p-5 rounded-2xl border transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    isWinner
                      ? 'border-emerald-400 bg-emerald-50/40 shadow-xs'
                      : isLowest && !isAwarded
                      ? 'border-blue-400 bg-blue-50/20 shadow-xs'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {contractor?.companyName || 'Contractor'}
                      </span>
                      {isLowest && !isAwarded && (
                        <span className="bg-blue-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center space-x-1">
                          <TrendingDown className="w-3 h-3" />
                          <span>Lowest Responsive Bid</span>
                        </span>
                      )}
                      {isWinner && (
                        <span className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Awarded Contract</span>
                        </span>
                      )}
                    </div>

                    <p className="text-slate-600">{bid.proposalDetails || 'Standard MoRTH paving deployment.'}</p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                      <span>Timeline: <b className="text-slate-800">{bid.estimatedDays} Days</b></span>
                      <span>Rating: <b className="text-amber-600">★ {contractor?.rating || '4.8'} / 5.0</b></span>
                      <span>GSTIN: <b className="text-slate-700">{contractor?.gstNumber || 'Verified'}</b></span>
                      <span>License: <b className="text-slate-700">{contractor?.licenseNumber || 'Class-A'}</b></span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-5 shrink-0 pt-2 sm:pt-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                        Quoted Amount
                      </span>
                      <span className="text-xl font-black text-slate-900">
                        ₹{bid.amount?.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {!isAwarded && (
                      <button
                        onClick={() => handleAward(bid.id, contractor?.companyName)}
                        disabled={awardLoading}
                        className={`font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs transition flex items-center space-x-1.5 ${
                          isLowest
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        <Award className="w-4 h-4" />
                        <span>Award Tender</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
