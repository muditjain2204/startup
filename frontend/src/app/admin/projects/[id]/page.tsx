'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { apiFetch } from '@/lib/api';
import {
  ShieldCheck,
  CheckCircle,
  Clock,
  Camera,
  MapPin,
  ArrowRight,
  HardHat,
  FileText,
  AlertTriangle,
} from 'lucide-react';

export default function AdminProjectInspectPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inspectNotes, setInspectNotes] = useState('Surface roughness verified with laser profilometer. Quality meets MoRTH Section 500 standards.');
  const [actionLoading, setActionLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchProject = async () => {
    try {
      const data = await apiFetch(`/projects/${id}`);
      setProject(data.project);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProject();
  }, [id]);

  const handleApproveInspection = async () => {
    setActionLoading(true);
    try {
      await apiFetch(`/projects/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'COMPLETED',
          inspectionNotes: inspectNotes,
        }),
      });

      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {
        // Ignore
      }

      setSuccess(true);
      fetchProject();
    } catch (err: any) {
      alert(err.message || 'Inspection sign-off failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-500">Loading repair project inspection dossier...</div>;
  }

  if (!project) {
    return <div className="p-12 text-center text-xs text-slate-500">Project not found</div>;
  }

  const isCompleted = project.status === 'COMPLETED';
  const contract = project.contract;
  const updates = project.updates || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <span className="font-mono font-bold text-sm text-blue-700 bg-blue-50 px-3 py-1 rounded border border-blue-200">
              {contract.contractNumber}
            </span>
            <span
              className={`text-xs font-bold px-3 py-0.5 rounded-full uppercase ${
                isCompleted
                  ? 'bg-green-100 text-green-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {project.status.replace(/_/g, ' ')}
            </span>
          </div>

          {!isCompleted && (
            <button
              onClick={handleApproveInspection}
              disabled={actionLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-md transition flex items-center space-x-2 text-xs"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approve Inspection & Mark Road Repaired</span>
            </button>
          )}
        </div>

        <h1 className="text-2xl font-black text-slate-900">{contract.title}</h1>
        <p className="text-xs text-slate-600">
          Awarded Contractor: <b className="text-slate-900">{project.contractor?.companyName}</b>
        </p>
      </div>

      {success && (
        <div className="p-5 bg-green-50 border border-green-200 rounded-2xl text-green-800 text-xs font-semibold flex items-center space-x-3">
          <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
          <div>
            <p className="font-bold text-sm">Inspection Passed & Defect Closed!</p>
            <p className="text-green-700 font-normal">
              Original citizen damage report marked as REPAIRED. Notification sent to reporter and contractor.
            </p>
          </div>
        </div>
      )}

      {/* Before / In-Progress / After Milestone Evidence */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between border-b border-slate-100 pb-3">
          <span>Photographic Inspection Evidence</span>
          <span className="text-xs font-mono text-slate-400">{updates.length} Stage Logs</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {updates.map((u: any) => {
            let photos: string[] = [];
            try {
              photos = JSON.parse(u.photoUrls);
            } catch {
              photos = [u.photoUrls];
            }

            return (
              <div key={u.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 text-xs">
                <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 text-[10px] uppercase block">
                  {u.stage.replace(/_/g, ' ')}
                </span>

                <div className="aspect-video rounded-lg overflow-hidden bg-black border border-slate-200">
                  <img src={photos[0]} alt="Milestone photo" className="w-full h-full object-cover" />
                </div>

                <p className="text-slate-600 leading-relaxed text-[11px]">{u.notes}</p>
                <span className="text-[10px] text-slate-400 block">
                  {new Date(u.uploadedAt).toLocaleString('en-IN', { timeStyle: 'short', dateStyle: 'short' })}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Engineer Inspection Sign-off Form */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs">
        <h3 className="font-bold text-slate-900 text-sm">Chief Engineer Inspection Quality Assessment</h3>
        <textarea
          rows={3}
          value={inspectNotes}
          onChange={(e) => setInspectNotes(e.target.value)}
          placeholder="Enter quality evaluation remarks..."
          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-medium"
        />

        {!isCompleted && (
          <button
            onClick={handleApproveInspection}
            disabled={actionLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md transition text-xs flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Certify PWD MoRTH Quality & Finalize Completion</span>
          </button>
        )}
      </div>
    </div>
  );
}

