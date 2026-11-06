'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/authContext';
import {
  HardHat,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  DollarSign,
  Calendar,
  FileText,
  ShieldCheck,
} from 'lucide-react';

export default function ContractDetailsBiddingPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;

  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Bid form
  const [amount, setAmount] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('3');
  const [proposalDetails, setProposalDetails] = useState('');
  const [biddingLoading, setBiddingLoading] = useState(false);
  const [bidSuccess, setBidSuccess] = useState(false);

  const fetchContract = async () => {
    try {
      const data = await apiFetch(`/contracts/${id}`);
      setContract(data.contract);
      // Pre-fill if contractor already submitted a bid
      const myBid = data.contract.bids?.find((b: any) => b.isMyBid);
      if (myBid) {
        setAmount(myBid.amount ? myBid.amount.toString() : '');
        setEstimatedDays(myBid.estimatedDays ? myBid.estimatedDays.toString() : '3');
        setProposalDetails(myBid.proposalDetails || '');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading contract');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchContract();
  }, [id]);

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid bid amount.');
      return;
    }

    setBiddingLoading(true);
    try {
      await apiFetch(`/contracts/${id}/bids`, {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(amount),
          estimatedDays: parseInt(estimatedDays, 10),
          proposalDetails,
        }),
      });
      setBidSuccess(true);
      fetchContract();
    } catch (err: any) {
      alert(err.message || 'Error submitting bid');
    } finally {
      setBiddingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
        Loading tender specifications...
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">{error || 'Contract Not Found'}</h2>
      </div>
    );
  }

  const damageReport = contract.damageReport;
  const evidencePhoto = damageReport?.evidence && damageReport.evidence[0]?.mediaUrl;
  const isApproved = user?.contractorProfile?.status === 'APPROVED';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <span className="font-mono font-black text-sm text-blue-700 bg-blue-50 px-3 py-1 rounded border border-blue-200">
              {contract.contractNumber}
            </span>
            <span className="text-xs font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200 px-3 py-0.5 rounded-full">
              {contract.status.replace('_', ' ')}
            </span>
            {contract.contractorDistanceKm !== null && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
                Distance: {contract.contractorDistanceKm} km
              </span>
            )}
          </div>

          <div className="text-xs text-slate-500 flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>
              Bidding Closes: <b>{new Date(contract.biddingDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</b>
            </span>
          </div>
        </div>

        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{contract.title}</h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{contract.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Scope, Specifications, and Evidence */}
        <div className="lg:col-span-7 space-y-6">
          {/* Photographic Evidence */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <span>On-Site Damage Photographic Evidence</span>
            </h3>

            {evidencePhoto ? (
              <div className="aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                <img src={evidencePhoto} alt="Damage evidence" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="aspect-video rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                No visual evidence attached
              </div>
            )}

            {damageReport?.detections && damageReport.detections[0] && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-slate-400 block text-[10px]">AI Category</span>
                  <span className="font-bold text-slate-800">{damageReport.detections[0].damageCategory}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Confidence</span>
                  <span className="font-bold text-emerald-600">
                    {Math.round(damageReport.detections[0].confidence * 100)}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Est. Depth</span>
                  <span className="font-bold text-red-600">{damageReport.detections[0].estimatedDepthCm} cm</span>
                </div>
              </div>
            )}
          </div>

          {/* Scope and Technical Specifications */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Technical Specifications & Repair Guidelines</h3>
            <p className="text-slate-600 leading-relaxed">{contract.repairRequirements}</p>
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-slate-700 space-y-1">
              <span className="font-bold text-blue-900 block">MoRTH Compliance Requirements:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-600">
                <li>Bituminous concrete overlay must use VG-30 / VG-40 bitumen grade.</li>
                <li>Compaction to minimum 98% laboratory density using vibratory tandem roller.</li>
                <li>Before, In-Progress, and After photographs must be uploaded digitally.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Col: Competitive Bidding Console */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Submit Competitive Bid</span>
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">
                Budget: ₹{contract.estimatedBudget.toLocaleString('en-IN')}
              </span>
            </div>

            {!isApproved ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-2">
                <span className="font-bold block">Account Pending Approval:</span>
                Your contractor registration has not yet been approved by PWD administrators. Once verified, bidding controls will activate automatically.
              </div>
            ) : (
              <>
                {bidSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-800 font-semibold flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>Your bid has been submitted and sealed confidentially!</span>
                  </div>
                )}

                <form onSubmit={handleBidSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Total Bid Price (₹ INR, Inclusive of Taxes) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="e.g. 170000"
                        className="w-full pl-8 pr-3 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Execution Timeline (Working Days) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="30"
                      value={estimatedDays}
                      onChange={(e) => setEstimatedDays(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Technical Proposal & Plant Mobilization Details
                    </label>
                    <textarea
                      rows={3}
                      value={proposalDetails}
                      onChange={(e) => setProposalDetails(e.target.value)}
                      placeholder="Specify machinery to be deployed, cold milling schedule, and traffic diversion plan..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={biddingLoading || contract.status !== 'OPEN_FOR_BIDDING'}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl shadow-md transition disabled:opacity-50 text-xs flex items-center justify-center space-x-2"
                  >
                    {biddingLoading ? (
                      <span>Submitting Encrypted Bid...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Submit / Update Tender Bid</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-slate-400 text-center">
                    Bids remain strictly confidential and will be ranked upon bidding deadline closure.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
