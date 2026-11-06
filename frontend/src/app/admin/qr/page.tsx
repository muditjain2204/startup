'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { QrCode, Plus, Download, MapPin, Eye, ExternalLink } from 'lucide-react';

export default function AdminQRManagerPage() {
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState('28.6139');
  const [longitude, setLongitude] = useState('77.2090');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchQRs = async () => {
    try {
      const data = await apiFetch('/qr');
      setQrCodes(data.qrCodes || []);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQRs();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await apiFetch('/qr/generate', {
        method: 'POST',
        body: JSON.stringify({
          code,
          locationName,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        }),
      });
      setModalOpen(false);
      setCode('');
      setLocationName('');
      fetchQRs();
    } catch (err: any) {
      alert(err.message || 'Error generating QR code');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Municipal Street QR Code Stations
          </h1>
          <p className="text-xs text-slate-500">
            Generate and manage physical QR codes deployed at major intersections, bus stops, and flyovers
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Street QR Station</span>
        </button>
      </div>

      {/* QR Codes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">Loading QR codes...</div>
        ) : qrCodes.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
            No QR stations registered yet.
          </div>
        ) : (
          qrCodes.map((q) => (
            <div
              key={q.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 text-center hover:border-purple-300 transition"
            >
              <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded">
                  {q.code}
                </span>
                <span className="font-semibold text-slate-500">
                  {q.scanCount} Citizen Scans
                </span>
              </div>

              {/* QR Image */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 inline-block shadow-inner">
                {q.qrDataUrl ? (
                  <img src={q.qrDataUrl} alt={`QR Code ${q.code}`} className="w-44 h-44 mx-auto rounded" />
                ) : (
                  <div className="w-44 h-44 bg-slate-200 flex items-center justify-center text-slate-400 text-xs">
                    Generating...
                  </div>
                )}
              </div>

              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-slate-900">{q.locationName}</h4>
                <p className="text-slate-500 flex items-center justify-center space-x-1 text-[11px]">
                  <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                  <span>{q.latitude}° N, {q.longitude}° E</span>
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex gap-2">
                <a
                  href={q.qrDataUrl}
                  download={`smartroad_qr_${q.code}.png`}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-xs transition flex items-center justify-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Print Sign</span>
                </a>
                <a
                  href={q.reportingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 transition"
                  title="Open public scan URL"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Generator Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-purple-600" />
                <span>Deploy New Street QR Checkpoint</span>
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerate} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Location / Landmark Description *</label>
                <input
                  type="text"
                  required
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Ring Road near AIIMS Flyover Pillar 22"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Custom Station Code (Optional)</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. SR-NDLS-005"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono uppercase text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-lg shadow"
                >
                  {actionLoading ? 'Generating...' : 'Generate Station QR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

