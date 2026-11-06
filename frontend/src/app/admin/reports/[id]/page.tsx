'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import {
  FileCheck2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Cpu,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  Copy,
} from 'lucide-react';

export default function AdminReportVerifyPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [report, setReport] = useState<any>(null);
  const [duplicateCandidates, setDuplicateCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  // Contract creation modal state
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [contractTitle, setContractTitle] = useState('');
  const [contractBudget, setContractBudget] = useState('150000');
  const [contractRadius, setContractRadius] = useState('25');
  const [contractRequirements, setContractRequirements] = useState('');
  const [deadlineDays, setDeadlineDays] = useState('5');

  const fetchReport = async () => {
    try {
      const data = await apiFetch(`/reports/${id}`);
      setReport(data.report);
      setDuplicateCandidates(data.duplicateCandidates || []);
      setAdminNotes(data.report.adminNotes || '');
      setContractTitle(`Road Pavement & Defect Repair for ${data.report.reportNumber}`);
      setContractRequirements(`Excavation and cold milling to sound layer. Tack coat application and 50mm Bituminous Concrete (BC) overlay according to MoRTH Section 500.`);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchReport();
  }, [id]);

  const handleVerify = async (status: 'VERIFIED' | 'REJECTED') => {
    setActionLoading(true);
    try {
      await apiFetch(`/reports/${id}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({ status, adminNotes }),
      });
      fetchReport();
    } catch (err: any) {
      alert(err.message || 'Verification update failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMergeDuplicate = async (duplicateReportId: string) => {
    setActionLoading(true);
    try {
      await apiFetch(`/reports/${id}/merge`, {
        method: 'POST',
        body: JSON.stringify({ duplicateReportId }),
      });
      alert('Duplicate report merged into primary incident record.');
      fetchReport();
    } catch (err: any) {
      alert(err.message || 'Merge failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await apiFetch('/contracts', {
        method: 'POST',
        body: JSON.stringify({
          damageReportId: id,
          title: contractTitle,
          description: `Contract generated from verified defect ${report.reportNumber} at ${report.address}`,
          repairRequirements: contractRequirements,
          estimatedBudget: parseFloat(contractBudget),
          eligibleRadiusKm: parseFloat(contractRadius),
          biddingDeadlineDays: parseInt(deadlineDays, 10),
        }),
      });

      alert(`Contract ${res.contract.contractNumber} published! ${res.eligibleContractorsCount} verified contractors in radius notified.`);
      setContractModalOpen(false);
      router.push(`/admin/contracts/${res.contract.id}`);
    } catch (err: any) {
      alert(err.message || 'Error generating contract');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-500">Loading damage report dossier...</div>;
  }

  if (!report) {
    return <div className="p-12 text-center text-xs text-slate-500">Report not found</div>;
  }

  const detection = report.detections && report.detections[0];
  const photo = report.evidence && report.evidence[0]?.mediaUrl;
  const isVerified = report.status === 'VERIFIED';
  const hasContract = !!report.repairContract;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <span className="font-mono font-black text-sm text-blue-700 bg-blue-50 px-3 py-1 rounded border border-blue-200">
              {report.reportNumber}
            </span>
            <span
              className={`text-xs font-bold px-3 py-0.5 rounded-full uppercase ${
                report.status === 'VERIFIED'
                  ? 'bg-blue-100 text-blue-800'
                  : report.status === 'REPAIRED'
                  ? 'bg-green-100 text-green-800'
                  : report.status === 'REJECTED'
                  ? 'bg-slate-100 text-slate-500'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {report.status.replace('_', ' ')}
            </span>
            {report.qrCode && (
              <span className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded">
                QR Station: {report.qrCode.code}
              </span>
            )}
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex gap-2">
            {!hasContract && (
              <>
                <button
                  onClick={() => handleVerify('VERIFIED')}
                  disabled={actionLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow-xs transition flex items-center space-x-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Approve & Verify</span>
                </button>

                <button
                  onClick={() => handleVerify('REJECTED')}
                  disabled={actionLoading}
                  className="bg-white hover:bg-red-50 text-red-700 border border-red-200 font-bold px-4 py-2 rounded-lg text-xs shadow-xs transition flex items-center space-x-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </>
            )}

            {isVerified && !hasContract && (
              <button
                onClick={() => setContractModalOpen(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-lg text-xs shadow-xs transition flex items-center space-x-1.5"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Create Repair Tender</span>
              </button>
            )}

            {hasContract && (
              <Link
                href={`/admin/contracts/${report.repairContract.id}`}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow-xs transition flex items-center space-x-1.5"
              >
                <span>View Tender ({report.repairContract.contractNumber})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        <h1 className="text-2xl font-black text-slate-900">{report.title}</h1>
        <p className="text-xs text-slate-600 flex items-center space-x-1.5">
          <MapPin className="w-4 h-4 text-red-500 shrink-0" />
          <span>{report.address} (GPS: {report.latitude}° N, {report.longitude}° E)</span>
        </p>
      </div>

      {/* Duplicate Candidates Alert */}
      {duplicateCandidates.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Potential Duplicate Incident Detected ({duplicateCandidates.length} within 50 meters)</span>
          </div>
          <p className="text-xs text-amber-800">
            SmartRoad AI identified reports located in close physical proximity. Merge to avoid publishing multiple contracts for the same physical pothole.
          </p>

          <div className="space-y-2 pt-1">
            {duplicateCandidates.map((dup) => (
              <div key={dup.id} className="bg-white p-3 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">{dup.reportNumber}</span> —{' '}
                  <span className="text-slate-600">{dup.title}</span>
                  <span className="block text-[10px] text-slate-400">
                    Distance: {dup.distanceMeters} meters away • Status: {dup.status}
                  </span>
                </div>
                <button
                  onClick={() => handleMergeDuplicate(dup.id)}
                  disabled={actionLoading}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition"
                >
                  Merge into This Report
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Visuals and Technical Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Photographic & Bounding Box Evidence */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Visual Evidence & AI Inspection Frame</h3>

            {photo ? (
              <div className="aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                <img src={photo} alt="Report evidence" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="aspect-video rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                No photo evidence
              </div>
            )}

            {/* AI Bounding Box Image if generated */}
            {detection?.annotatedImageUrl && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 block">AI Morphological Bounding Box Frame:</span>
                <div className="aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                  <img src={detection.annotatedImageUrl} alt="Annotated frame" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: AI Detection Parameters & Verification Notes */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span>AI Quantification Metadata</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Defect Classification:</span>
                <span className="font-bold text-slate-900">{detection?.damageCategory || report.damageCategory}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Confidence Score:</span>
                <span className="font-bold text-emerald-600">
                  {detection ? `${Math.round(detection.confidence * 100)}%` : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Estimated Depth:</span>
                <span className="font-bold text-red-600">
                  {detection?.estimatedDepthCm ? `${detection.estimatedDepthCm} cm` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Estimated Distress Area:</span>
                <span className="font-bold text-slate-900">
                  {detection?.estimatedAreaSqM ? `${detection.estimatedAreaSqM} m²` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Assigned Severity:</span>
                <span className="font-black text-red-600">{detection?.severity || 'MEDIUM'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="block font-bold text-slate-800">Engineer Field Verification Notes</label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add verification comments or priority inspection instructions..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contract Creation Modal */}
      {contractModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                <span>Create Road Repair Tender Contract</span>
              </h3>
              <button
                onClick={() => setContractModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateContract} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Contract Tender Title *</label>
                <input
                  type="text"
                  required
                  value={contractTitle}
                  onChange={(e) => setContractTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Estimated Budget (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    value={contractBudget}
                    onChange={(e) => setContractBudget(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Eligible Radius (km) *</label>
                  <input
                    type="number"
                    required
                    value={contractRadius}
                    onChange={(e) => setContractRadius(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Bidding Window (Days) *</label>
                <input
                  type="number"
                  required
                  value={deadlineDays}
                  onChange={(e) => setDeadlineDays(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">MoRTH Repair Specifications</label>
                <textarea
                  rows={3}
                  value={contractRequirements}
                  onChange={(e) => setContractRequirements(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setContractModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-lg shadow transition"
                >
                  {actionLoading ? 'Publishing Tender...' : 'Publish Tender & Notify Contractors'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

