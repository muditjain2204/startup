'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { QrCode, MapPin, Camera, ArrowRight, ShieldCheck } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function DirectQRReportingPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [qrCode, setQrCode] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!code) return;

    apiFetch(`/qr/${code}`)
      .then((data) => {
        setQrCode(data.qrCode);
        // Record scan telemetry
        if (typeof window !== 'undefined' && 'geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              apiFetch(`/qr/${code}/scan`, {
                method: 'POST',
                body: JSON.stringify({
                  latitude: pos.coords.latitude,
                  longitude: pos.coords.longitude,
                  accuracyMeters: pos.coords.accuracy,
                }),
              }).catch(() => {});
            },
            () => {
              apiFetch(`/qr/${code}/scan`, { method: 'POST', body: JSON.stringify({}) }).catch(() => {});
            }
          );
        }
      })
      .catch((err) => {
        setError(err.message || 'QR code not recognized');
      })
      .finally(() => setLoading(false));
  }, [code]);

  const handleStartReport = () => {
    router.push(`/citizen/report?qr=${code}`);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium">Resolving PWD Road Station...</p>
        </div>
      </div>
    );
  }

  if (error || !qrCode) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <QrCode className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">QR Code Error</h2>
        <p className="text-xs text-slate-600">{error || 'Invalid road identifier'}</p>
        <button
          onClick={() => router.push('/citizen/report')}
          className="bg-blue-600 text-white font-bold px-4 py-2 rounded-lg text-xs"
        >
          Report Damage Without QR
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xl space-y-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-700 text-white flex items-center justify-center mx-auto shadow-md">
          <QrCode className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 bg-green-100 text-green-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official PWD Street Checkpoint</span>
          </div>
          <h1 className="text-xl font-black text-slate-900">{qrCode.locationName}</h1>
          <p className="text-xs text-slate-500 font-mono">Code: {qrCode.code}</p>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Verified Location:</span>
            <span className="font-bold text-slate-800">Delhi NCR Grid</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">GPS Coordinates:</span>
            <span className="font-mono text-slate-700">
              {qrCode.latitude}° N, {qrCode.longitude}° E
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Citizen Scan Count:</span>
            <span className="font-bold text-blue-700">{qrCode.scanCount} scans</span>
          </div>
        </div>

        <button
          onClick={handleStartReport}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-blue-600/25 transition text-sm flex items-center justify-center space-x-2"
        >
          <Camera className="w-5 h-5 text-amber-300" />
          <span>Capture Pothole & Video Evidence</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-[11px] text-slate-400">
          Your camera will open to record road surface damage. Location coordinates will be attached automatically.
        </p>
      </div>
    </div>
  );
}
