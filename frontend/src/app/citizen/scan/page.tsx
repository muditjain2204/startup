'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  QrCode,
  Camera,
  ArrowRight,
  MapPin,
  CheckCircle,
  Search,
  Upload,
  VideoOff,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function QRScannerPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrDetails, setQrDetails] = useState<any>(null);

  // Real Camera Scanner State
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [availableQRs, setAvailableQRs] = useState<any[]>([]);
  const scannerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load real registered QR codes from database (no hardcoded samples)
  useEffect(() => {
    apiFetch('/qr')
      .then((data) => {
        if (data && data.qrCodes) {
          setAvailableQRs(data.qrCodes);
        }
      })
      .catch(() => {});
  }, []);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const extractCode = (decodedText: string): string => {
    let clean = decodedText.trim();
    if (clean.includes('/qr/')) {
      const parts = clean.split('/qr/');
      clean = parts[parts.length - 1].split('?')[0].split('#')[0];
    }
    return clean;
  };

  const handleLookup = async (codeToLookup: string) => {
    setError('');
    setLoading(true);
    const parsedCode = extractCode(codeToLookup);
    try {
      const data = await apiFetch(`/qr/${parsedCode}`);
      setQrDetails(data.qrCode);
      setCode(parsedCode);
      // Record scan telemetry
      apiFetch(`/qr/${parsedCode}/scan`, { method: 'POST', body: JSON.stringify({}) }).catch(() => {});
    } catch (err: any) {
      setError(err.message || `QR code "${parsedCode}" not found in PWD registry`);
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    setCameraError('');
    setError('');

    try {
      const { Html5Qrcode } = await import('html5-qrcode');

      if (scannerRef.current) {
        await stopCamera();
      }

      const html5QrCode = new Html5Qrcode('qr-reader-container');
      scannerRef.current = html5QrCode;

      setIsScanning(true);

      const qrCodeSuccessCallback = async (decodedText: string) => {
        stopCamera();
        const extracted = extractCode(decodedText);
        setCode(extracted);
        await handleLookup(extracted);
      };

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        qrCodeSuccessCallback,
        () => {
          // ignore frame scan failures
        }
      );
    } catch (err: any) {
      console.error('Camera start error:', err);
      setIsScanning(false);
      setCameraError(
        err.message || 'Unable to access device camera. Please check camera permissions in your browser or upload a QR image.'
      );
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (e) {
        console.warn('Error stopping scanner:', e);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCameraError('');
    setError('');
    setLoading(true);

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const tempScanner = new Html5Qrcode('qr-reader-container');
      const decodedText = await tempScanner.scanFile(file, true);
      tempScanner.clear();

      const extracted = extractCode(decodedText);
      setCode(extracted);
      await handleLookup(extracted);
    } catch (err: any) {
      setError('Could not detect a valid QR code in the uploaded image. Please ensure the QR code is clearly visible.');
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
          Scan physical PWD QR plaques mounted on streetlights, flyovers, or arterial junctions
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md space-y-6">
        {/* Real Live Camera Scanner Box */}
        <div className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-purple-500 min-h-[300px] flex flex-col items-center justify-center">
            {/* HTML5 QR reader mounts into this container */}
            <div id="qr-reader-container" className="w-full h-full min-h-[300px]"></div>

            {!isScanning && (
              <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-purple-900/50 border border-purple-400/50 flex items-center justify-center text-purple-300">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Live Camera Scanner Ready</h3>
                  <p className="text-xs text-slate-400 max-w-xs mt-1">
                    Align your phone or device camera with the official PWD SmartRoad QR sticker
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition flex items-center space-x-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Start Camera</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-4 py-2.5 rounded-xl text-xs transition flex items-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload QR Image</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {isScanning && (
              <div className="absolute top-3 right-3 z-10">
                <button
                  type="button"
                  onClick={stopCamera}
                  className="bg-red-600/90 hover:bg-red-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow transition flex items-center space-x-1"
                >
                  <VideoOff className="w-3.5 h-3.5" />
                  <span>Stop Camera</span>
                </button>
              </div>
            )}
          </div>

          {cameraError && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Camera Notice:</span>
                <span>{cameraError}</span>
              </div>
            </div>
          )}
        </div>

        {/* Manual Code Input Form */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-800">
            Or Enter QR Identifier Directly:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. SR-NDLS-001"
              className="flex-1 px-3 py-2.5 border border-slate-300 rounded-xl text-xs font-mono uppercase text-slate-900 focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={() => handleLookup(code)}
              disabled={loading || !code}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* QR Verified Card */}
        {qrDetails && (
          <div className="p-5 bg-purple-50 border border-purple-200 rounded-2xl space-y-3 animate-in fade-in">
            <div className="flex items-center space-x-2 text-purple-900">
              <CheckCircle className="w-5 h-5 text-purple-700 shrink-0" />
              <span className="font-bold text-xs uppercase tracking-wider">
                Official PWD QR Station Verified
              </span>
            </div>
            <div>
              <p className="font-bold text-slate-900 text-base">{qrDetails.locationName}</p>
              <p className="text-slate-600 text-xs mt-1 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-purple-600" />
                <span>
                  Coordinates: {qrDetails.latitude}° N, {qrDetails.longitude}° E
                </span>
              </p>
              <p className="text-[11px] text-purple-700 font-semibold mt-1">
                Station Code: <span className="font-mono">{qrDetails.code}</span> • Total Scans: {qrDetails.scanCount || 0}
              </p>
            </div>
            <button
              onClick={handleProceed}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-2"
            >
              <span>Continue to Photo/Video Capture at this Location</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Active Registered PWD QR Stations from Database */}
        {availableQRs.length > 0 && (
          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Active Registered PWD QR Stations ({availableQRs.length}):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableQRs.slice(0, 4).map((q) => (
                <button
                  key={q.id || q.code}
                  onClick={() => {
                    setCode(q.code);
                    handleLookup(q.code);
                  }}
                  className="text-left p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 text-xs transition"
                >
                  <span className="font-mono font-bold text-purple-700 block">{q.code}</span>
                  <span className="text-[10px] text-slate-600 truncate block mt-0.5">{q.locationName}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
