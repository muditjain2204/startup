'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import {
  HardHat,
  Camera,
  Upload,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  FileText,
} from 'lucide-react';

export default function ContractorProjectManagePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Evidence upload form
  const [stage, setStage] = useState('BEFORE_REPAIR');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

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

  const handleUpdateStatus = async (newStatus: string) => {
    setActionLoading(true);
    try {
      await apiFetch(`/projects/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      fetchProject();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEvidenceUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('stage', stage);
      formData.append('notes', notes);
      if (file) {
        formData.append('updatePhoto', file);
      } else if (photoUrl) {
        formData.append('photoUrl', photoUrl);
      }

      await apiFetch(`/projects/${id}/updates`, {
        method: 'POST',
        body: formData,
      });

      setNotes('');
      setPhotoUrl('');
      setFile(null);
      setUploadSuccess(true);
      fetchProject();
    } catch (err: any) {
      alert(err.message || 'Error recording evidence');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-500">Loading project dossier...</div>;
  }

  if (!project) {
    return <div className="p-12 text-center text-xs text-slate-500">Project not found</div>;
  }

  const contract = project.contract;
  const isCompleted = project.status === 'COMPLETED';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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

          {/* Quick Status Action Button */}
          <div className="flex gap-2">
            {project.status === 'AWARDED' && (
              <button
                onClick={() => handleUpdateStatus('ACCEPTED')}
                disabled={actionLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition"
              >
                Accept Project Work Order
              </button>
            )}
            {project.status === 'ACCEPTED' && (
              <button
                onClick={() => handleUpdateStatus('IN_PROGRESS')}
                disabled={actionLoading}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition"
              >
                Commence On-Site Work (In Progress)
              </button>
            )}
            {project.status === 'IN_PROGRESS' && (
              <button
                onClick={() => handleUpdateStatus('SUBMITTED_FOR_INSPECTION')}
                disabled={actionLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition"
              >
                Request PWD Final Inspection
              </button>
            )}
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-slate-900">{contract.title}</h1>
        <p className="text-xs text-slate-600">{contract.repairRequirements}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Upload Milestone Evidence */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
              <Camera className="w-4 h-4 text-blue-600" />
              <span>Log Milestone Photographic Evidence</span>
            </div>

            {uploadSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 font-semibold flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Milestone update recorded successfully!</span>
              </div>
            )}

            <form onSubmit={handleEvidenceUpload} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Execution Stage *</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-medium text-slate-900"
                >
                  <option value="BEFORE_REPAIR">Before Repair (Site Barricading & Milling)</option>
                  <option value="IN_PROGRESS">In Progress (Tack Coat & Compaction)</option>
                  <option value="AFTER_REPAIR">After Repair (Finished Surface & Rolling)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Photographic Evidence</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Or Photo URL</label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Execution Notes & Quality Metrics</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Sub-base compacted to 98% Proctor density. 50mm BC overlay laid at 150°C..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg shadow transition disabled:opacity-50"
              >
                {actionLoading ? 'Recording Evidence...' : 'Upload Stage Evidence'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Timeline of Updates */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between border-b border-slate-100 pb-3">
              <span>Project Execution Timeline & Audit Log</span>
              <span className="text-xs font-mono text-slate-400">
                {project.updates?.length || 0} Stages Logged
              </span>
            </h3>

            {project.updates?.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                No milestone updates logged yet. Start by uploading Before-Repair photographs.
              </p>
            ) : (
              <div className="space-y-4">
                {project.updates?.map((u: any) => {
                  let photos: string[] = [];
                  try {
                    photos = JSON.parse(u.photoUrls);
                  } catch {
                    photos = [u.photoUrls];
                  }

                  return (
                    <div key={u.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px] uppercase">
                          {u.stage.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(u.uploadedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>

                      <p className="text-slate-700 leading-relaxed">{u.notes}</p>

                      {photos && photos.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                          {photos.map((src, i) => (
                            <div key={i} className="aspect-video rounded-lg overflow-hidden border border-slate-200 bg-black">
                              <img src={src} alt="Evidence" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
