'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Camera,
  MapPin,
  Upload,
  CheckCircle,
  AlertTriangle,
  Cpu,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

const DynamicGISMap = dynamic(() => import('@/components/GISMap').then((m) => m.GISMap), {
  ssr: false,
  loading: () => <div className="h-[250px] bg-slate-100 rounded-lg animate-pulse"></div>,
});

function ReportDamageForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qrParam = searchParams.get('qr');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [damageCategory, setDamageCategory] = useState('POTHOLE');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Delhi NCR');
  const [qrCode, setQrCode] = useState(qrParam || '');

  // GPS coordinates
  const [latitude, setLatitude] = useState<number>(28.5583);
  const [longitude, setLongitude] = useState<number>(77.1738);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsStatus, setGpsStatus] = useState<string>('Detecting location...');

  // Media files
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);

  // Submission & AI Analysis Result
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [createdReport, setCreatedReport] = useState<any>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<number>(0);

  // Request browser geolocation on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
          setGpsAccuracy(Math.round(pos.coords.accuracy));
          setGpsStatus('GPS Location Acquired (High Precision)');
          if (!address) {
            setAddress(`Road coordinates: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
          }
        },
        () => {
          setGpsStatus('Defaulting to Delhi NCR Center (Location permission optional)');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selected]);

      // Generate previews
      const newPreviews = selected.map((f) => URL.createObjectURL(f));
      setFilePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleLocationPick = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    setAddress(`Selected Location: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      alert('Please upload or capture at least one photograph or video of the road defect.');
      return;
    }

    setLoading(true);
    setAiResult(null);

    try {
      const formData = new FormData();
      formData.append('title', title || `${damageCategory} on ${address || 'Delhi Road'}`);
      formData.append('description', description);
      formData.append('damageCategory', damageCategory);
      formData.append('latitude', latitude.toString());
      formData.append('longitude', longitude.toString());
      formData.append('address', address);
      formData.append('city', city);
      if (qrCode) formData.append('qrCode', qrCode);

      for (const file of files) {
        formData.append('files', file);
      }

      const res = await apiFetch('/reports', {
        method: 'POST',
        body: formData,
      });

      setCreatedReport(res.report);
      setAiResult(res.aiAnalysis);
      setDuplicateWarning(res.duplicateCandidatesCount || 0);
      setSubmissionComplete(true);
    } catch (err: any) {
      alert(err.message || 'Error submitting report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
          <span>Report Road Damage & Potholes</span>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
            AI Scanned
          </span>
        </h1>
        <p className="text-xs text-slate-500">
          Upload photo or video evidence with verified GPS coordinates for automatic AI severity scoring and municipal repair scheduling.
        </p>
      </div>

      {submissionComplete ? (
        /* SUBMISSION SUCCESS & REAL-TIME AI RESULT MODAL/CARD */
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-emerald-200 shadow-xl space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center space-x-3 text-emerald-600">
            <CheckCircle className="w-8 h-8 shrink-0" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Report Submitted Successfully! ({createdReport?.reportNumber})
              </h2>
              <p className="text-xs text-slate-500">
                Processed by SmartRoad AI Computer Vision Engine and logged in PWD registry.
              </p>
            </div>
          </div>

          {/* AI Detection Summary Card */}
          {aiResult && (
            <div className="bg-slate-900 rounded-xl p-5 text-white space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
                <span className="font-mono text-emerald-400 flex items-center space-x-1.5">
                  <Cpu className="w-4 h-4" />
                  <span>AI Computer Vision Inference Result</span>
                </span>
                <span className="text-slate-400 font-medium">{aiResult.provider}</span>
              </div>

              {aiResult.detections && aiResult.detections[0] && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                    <span className="text-slate-400 block">Classified Defect</span>
                    <span className="font-bold text-base text-white">
                      {aiResult.detections[0].damage_category}
                    </span>
                    <span className="text-emerald-400 block mt-0.5">
                      Confidence: {Math.round(aiResult.detections[0].confidence * 100)}%
                    </span>
                  </div>

                  <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                    <span className="text-slate-400 block">Estimated Dimensions</span>
                    <span className="font-bold text-base text-white">
                      Depth: {aiResult.detections[0].estimated_depth_cm} cm
                    </span>
                    <span className="text-slate-300 block mt-0.5">
                      Area: {aiResult.detections[0].estimated_area_sq_m} m²
                    </span>
                  </div>

                  <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                    <span className="text-slate-400 block">Assigned Severity</span>
                    <span
                      className={`font-black text-base ${
                        aiResult.overall_severity === 'CRITICAL'
                          ? 'text-red-400'
                          : aiResult.overall_severity === 'HIGH'
                          ? 'text-amber-400'
                          : 'text-blue-400'
                      }`}
                    >
                      {aiResult.overall_severity}
                    </span>
                    <span className="text-slate-400 block mt-0.5">MoRTH Standard</span>
                  </div>
                </div>
              )}

              {/* Annotated image if available */}
              {aiResult.detections && aiResult.detections[0]?.annotated_image_base64 && (
                <div className="rounded-lg overflow-hidden border border-slate-700">
                  <p className="text-[11px] text-slate-400 bg-slate-800 px-3 py-1 font-mono">
                    Visual Evidence Frame with Detected Bounding Box
                  </p>
                  <img
                    src={aiResult.detections[0].annotated_image_base64}
                    alt="AI Annotated Road Defect"
                    className="w-full max-h-80 object-cover"
                  />
                </div>
              )}
            </div>
          )}

          {duplicateWarning > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                Note: {duplicateWarning} existing damage report(s) found within 50 meters. PWD administrators will cross-verify during tender preparation.
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/citizen/reports"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-lg text-xs transition"
            >
              Track This Report
            </Link>
            <button
              onClick={() => {
                setSubmissionComplete(false);
                setFiles([]);
                setFilePreviews([]);
                setTitle('');
                setDescription('');
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-4 py-2.5 rounded-lg text-xs transition"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      ) : (
        /* REPORT SUBMISSION FORM */
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 text-xs">
          {/* Step 1: Media Evidence */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <Camera className="w-4 h-4 text-blue-600" />
                <span>1. Photographic & Video Evidence *</span>
              </label>
              <span className="text-[11px] text-slate-500">Max 50MB (JPEG, PNG, MP4)</span>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-500 bg-slate-50 transition cursor-pointer relative">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="space-y-2 flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="font-bold text-slate-800">
                  Click to capture or upload road photographs / video
                </p>
                <p className="text-slate-500 text-[11px]">
                  Supports mobile camera direct capture or gallery files
                </p>
              </div>
            </div>

            {/* Previews */}
            {filePreviews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                {filePreviews.map((src, i) => (
                  <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 bg-black">
                    <img src={src} alt="Defect Evidence" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Damage Category & Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Defect Category *</label>
              <select
                value={damageCategory}
                onChange={(e) => setDamageCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
              >
                <option value="POTHOLE">Pothole (Cavity / Depression)</option>
                <option value="ALLIGATOR_CRACK">Alligator Cracking (Interconnected mesh)</option>
                <option value="SURFACE_BREAK">Broken Surface / Asphalt Peeling</option>
                <option value="RUTTING">Rutting (Wheel path depression)</option>
                <option value="EROSION">Shoulder Erosion</option>
                <option value="OTHER">Other Structural Road Defect</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">QR Code Station Identifier (Optional)</label>
              <input
                type="text"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                placeholder="e.g. SR-NDLS-001"
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Defect Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Deep cavity in center lane before flyover. High risk of two-wheeler skid."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
            />
          </div>

          {/* Step 3: High Precision Location & Map Pin Picker */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-red-600" />
                <span>2. GPS Incident Coordinates & Landmark *</span>
              </label>
              <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {gpsStatus} {gpsAccuracy ? `(±${gpsAccuracy}m)` : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-600 mb-1">Road Landmark / Address *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Outer Ring Road, Munirka Westbound, New Delhi"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">City / Region</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Click anywhere on the map below to pinpoint the exact road carriageway location:
            </p>

            <DynamicGISMap
              center={[latitude, longitude]}
              zoom={14}
              interactiveSelect={true}
              selectedPos={[latitude, longitude]}
              onLocationSelect={handleLocationPick}
              heightClass="h-[260px]"
            />
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition disabled:opacity-60 text-sm flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Running AI Road Surface Vision Analysis...</span>
              </div>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Submit Report & Run AI Defect Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ReportDamagePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading reporting interface...</div>}>
      <ReportDamageForm />
    </Suspense>
  );
}
