'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Sliders, CheckCircle, Cpu, ShieldCheck, RefreshCw } from 'lucide-react';

export default function AdminThresholdsPage() {
  const [thresholds, setThresholds] = useState<any>({
    minConfidence: 0.65,
    minPotholeAreaSqM: 0.05,
    minEstimatedDepthCm: 3.0,
    highSeverityDepthCm: 8.0,
    maxGpsAccuracyToleranceM: 30.0,
    duplicateDistanceThresholdM: 25.0,
  });
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    apiFetch('/thresholds')
      .then((data) => {
        if (data.thresholds) setThresholds(data.thresholds);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setSuccess(false);
    try {
      await apiFetch('/thresholds', {
        method: 'PUT',
        body: JSON.stringify(thresholds),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Error saving thresholds');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
          <span>AI Computer Vision Detection Thresholds</span>
          <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full">
            FastAPI Pipeline
          </span>
        </h1>
        <p className="text-xs text-slate-500">
          Configure sensitivity parameters for automatic pothole classification, severity assignment, and duplicate grouping
        </p>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>Detection thresholds updated successfully in active AI inference engine!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block font-bold text-slate-900">
              Minimum AI Confidence Threshold ({Math.round(thresholds.minConfidence * 100)}%)
            </label>
            <input
              type="range"
              min="0.5"
              max="0.95"
              step="0.05"
              value={thresholds.minConfidence}
              onChange={(e) => setThresholds({ ...thresholds, minConfidence: parseFloat(e.target.value) })}
              className="w-full accent-blue-600"
            />
            <p className="text-[11px] text-slate-500">
              Detections below this score are flagged for manual engineer confirmation.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block font-bold text-slate-900">
              Critical Damage Depth Cutoff ({thresholds.highSeverityDepthCm} cm)
            </label>
            <input
              type="range"
              min="5.0"
              max="15.0"
              step="0.5"
              value={thresholds.highSeverityDepthCm}
              onChange={(e) => setThresholds({ ...thresholds, highSeverityDepthCm: parseFloat(e.target.value) })}
              className="w-full accent-red-600"
            />
            <p className="text-[11px] text-slate-500">
              Cavities exceeding this depth trigger immediate high hazard flags for two-wheeler safety.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div className="space-y-1">
            <label className="block font-bold text-slate-900 mb-1">
              Minimum Defect Surface Area (m²)
            </label>
            <input
              type="number"
              step="0.01"
              value={thresholds.minPotholeAreaSqM}
              onChange={(e) => setThresholds({ ...thresholds, minPotholeAreaSqM: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900"
            />
            <p className="text-[11px] text-slate-500">Small surface chips below this area are ignored.</p>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-900 mb-1">
              Duplicate Proximity Window (Meters)
            </label>
            <input
              type="number"
              step="1"
              value={thresholds.duplicateDistanceThresholdM}
              onChange={(e) => setThresholds({ ...thresholds, duplicateDistanceThresholdM: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900"
            />
            <p className="text-[11px] text-slate-500">Reports submitted within this radius trigger duplicate warnings.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div className="space-y-1">
            <label className="block font-bold text-slate-900 mb-1">
              Maximum GPS Accuracy Tolerance (Meters)
            </label>
            <input
              type="number"
              value={thresholds.maxGpsAccuracyToleranceM}
              onChange={(e) => setThresholds({ ...thresholds, maxGpsAccuracyToleranceM: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900"
            />
            <p className="text-[11px] text-slate-500">Submissions with degraded GPS signals require user map pin confirmation.</p>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-900 mb-1">
              Minimum Noticeable Cavity Depth (cm)
            </label>
            <input
              type="number"
              step="0.5"
              value={thresholds.minEstimatedDepthCm}
              onChange={(e) => setThresholds({ ...thresholds, minEstimatedDepthCm: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900"
            />
            <p className="text-[11px] text-slate-500">Baseline threshold below which distress is classified as minor.</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saveLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow transition text-xs flex items-center space-x-1.5"
          >
            {saveLoading ? 'Applying Changes...' : 'Save & Deploy Parameters'}
          </button>
        </div>
      </form>
    </div>
  );
}

