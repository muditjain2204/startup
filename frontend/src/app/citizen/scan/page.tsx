'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, Camera, ArrowRight, MapPin, CheckCircle, Search } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function QRScannerPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrDetails, setQrDetails] = useState<any>(null);

  const sampleQRs = [
    { code: 'SR-NDLS-001', name: 'Barakhamba Road, Connaught Place' },
    { code: 'SR-NDLS-002', name: 'Ring Road near AIIMS Flyover' },
    { code: 'SR-NDLS-003', name: 'Vikas Marg, Laxmi Nagar' },
    { code: 'SR-NDLS-004', name: 'Mathura Road near Ashram Chowk' },
  ];

  const handleLookup = async (codeToLookup: string) => {
    setError('');
    setLoading(true);
    try {
      const data = await apiFetch(`/qr/${codeToLookup.trim()}`);
      setQrDetails(data.qrCode);
      // Record scan
      apiFetch(`/qr/${codeToLookup.trim()}/scan`, { method: 'POST', body: JSON.stringify({}) }).catch(() => {});
    } catch (err: any) {
      setError(err.message || 'QR code not found in SmartRoad registry');
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => {
    if (qrDetails) {
      router.push(`/citizen/report?qr=${qrDetails.code}`);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-purple-700 text-white flex items-center justify-center mx-auto shadow-md">
          <QrCode className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Scan PWD Roadside QR Code
        </h1>
        <p className="text-xs text-slate-500">
          Official QR codes are installed on flyover pillars, bus shelters, and junction poles
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md space-y-6">
        {/* Camera Scanner Viewfinder simulation */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border-2 border-purple-500 flex flex-col items-center justify-center p-4 text-center">
          <div className="w-40 h-40 border-2 border-dashed border-purple-400 rounded-xl flex items-center justify-center relative">
            <span className="w-full h-0.5 bg-red-500 absolute top-1/2 -translate-y-1/2 animate-pulse shadow-sm"></span>
            <Camera className="w-10 h-10 text-slate-500" />
          </div>
          <span className="text-[11px] text-purple-300 font-medium mt-3">
            Align camera with PWD SmartRoad QR sticker
          </span>
        </div>

        {/* Manual Code Input Form */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-800">
            Or Enter QR Identifier Directly:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. SR-NDLS-001"
              className="flex-1 px-3 py-2.5 border border-slate-300 rounded-lg text-xs font-mono uppercase text-slate-900"
            />
            <button
              onClick={() => handleLookup(code)}
              disabled={loading || !code}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2.5 rounded-lg text-xs transition disabled:opacity-50"
            >
              Verify Code
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
            {error}
          </div>
        )}

        {/* QR Verified Card */}
        {qrDetails && (
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-3 animate-in fade-in">
            <div className="flex items-center space-x-2 text-purple-800">
              <CheckCircle className="w-5 h-5 text-purple-700 shrink-0" />
              <span className="font-bold text-xs">Official PWD QR Station Verified</span>
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">{qrDetails.locationName}</p>
              <p className="text-slate-500 text-xs mt-0.5">
                Coordinates: {qrDetails.latitude}° N, {qrDetails.longitude}° E
              </p>
              <p className="text-[11px] text-purple-600 font-semibold mt-1">
                Total Citizen Reports from this Station: {qrDetails.reports?.length || 0}
              </p>
            </div>
            <button
              onClick={handleProceed}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-lg text-xs shadow transition flex items-center justify-center space-x-1.5"
            >
              <span>Continue to Photo/Video Capture</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Sample QRs for testing */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Sample On-Street QR Codes:
          </span>
          <div className="grid grid-cols-2 gap-2">
            {sampleQRs.map((s) => (
              <button
                key={s.code}
                onClick={() => {
                  setCode(s.code);
                  handleLookup(s.code);
                }}
                className="text-left p-2 rounded-lg bg-slate-50 hover:bg-purple-50 border border-slate-200 text-xs transition"
              >
                <span className="font-mono font-bold text-purple-700 block">{s.code}</span>
                <span className="text-[10px] text-slate-500 truncate block">{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

