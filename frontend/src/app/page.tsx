'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Compass,
  Scan,
  ShieldCheck,
  HardHat,
  Cpu,
  Layers,
  MapPin,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  Activity,
  Award,
  Users,
  Building2,
  Sparkles,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

// Dynamic import for GISMap with SSR disabled
const DynamicGISMap = dynamic(() => import('@/components/GISMap').then((m) => m.GISMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400">
      Loading Live Delhi NCR GIS Infrastructure Grid...
    </div>
  ),
});

export default function HomePage() {
  const [markers, setMarkers] = useState<any>({
    reports: [],
    contracts: [],
    contractors: [],
    qrCodes: [],
  });
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Fetch live GIS markers
    apiFetch('/analytics/map-markers')
      .then((data) => setMarkers(data))
      .catch(() => {});

    // Fetch dashboard overview KPIs
    apiFetch('/analytics/overview')
      .then((data) => setStats(data.kpis))
      .catch(() => {
        setStats({
          totalReports: 0,
          verifiedReports: 0,
          repairedReports: 0,
          totalContractors: 0,
          totalQRScans: 0,
        });
      });
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-white to-slate-50 pt-16 pb-20 lg:pt-24 lg:pb-28 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 bg-blue-100/80 border border-blue-200/80 px-3 py-1.5 rounded-full text-xs font-semibold text-blue-900 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                <span>Next-Gen Smart Infrastructure Platform • India PWD & NHAI</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                Building Smarter Roads Through{' '}
                <span className="text-blue-600 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  Artificial Intelligence.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
                Detect road damage, connect verified contractors, and manage infrastructure repairs through one intelligent platform.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/citizen/report"
                  className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-blue-600/25 transition-all transform hover:-translate-y-0.5"
                >
                  <Scan className="w-5 h-5" />
                  <span>Report Road Damage</span>
                </Link>
                <Link
                  href="/admin"
                  className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold px-6 py-3.5 rounded-xl shadow-sm transition"
                >
                  <span>Explore Platform</span>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </Link>
                <Link
                  href="/citizen/scan"
                  className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-3.5 rounded-xl transition"
                >
                  <Scan className="w-4 h-4 text-amber-400" />
                  <span>Scan PWD QR Code</span>
                </Link>
              </div>

              {/* Quick live metrics */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200 text-slate-700">
                <div>
                  <div className="text-2xl font-black text-slate-900">{stats ? stats.totalReports : 0}</div>
                  <div className="text-xs text-slate-500 font-medium">Damage Reports Detected</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-blue-600">{stats ? stats.repairedReports : 0}</div>
                  <div className="text-xs text-slate-500 font-medium">Repairs Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">{stats ? stats.totalContractors : 0}</div>
                  <div className="text-xs text-slate-500 font-medium">Verified Contractors</div>
                </div>
              </div>
            </div>

            {/* Right Visual: Live GIS Road Infrastructure Monitor */}
            <div className="lg:col-span-5 relative">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-3 bg-gradient-to-b from-white to-slate-50">
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 text-xs font-semibold text-slate-700">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Live PostGIS Surface Grid • New Delhi</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">OpenStreetMap 16.1</span>
                </div>
                <div className="rounded-xl overflow-hidden mt-2">
                  <DynamicGISMap
                    reports={markers.reports}
                    contracts={markers.contracts}
                    contractors={markers.contractors}
                    qrCodes={markers.qrCodes}
                    heightClass="h-[380px]"
                  />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] font-medium text-slate-600 bg-slate-50 p-2 rounded-lg">
                  <div className="flex items-center justify-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-red-600"></span>
                    <span>Critical Defect</span>
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    <span>Active Tender</span>
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-green-600"></span>
                    <span>Repaired Surface</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE WORKFLOW: 8-STAGE INFRASTRUCTURE LIFECYCLE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <h2 className="text-xs font-bold tracking-widest text-blue-600 uppercase">
            End-To-End Infrastructure Governance
          </h2>
          <h3 className="text-3xl font-extrabold text-slate-900">
            How SmartRoad AI Powers the Entire Road Journey
          </h3>
          <p className="text-sm text-slate-600">
            A seamless bridge from citizen reporting and computer vision inspection to transparent contractor bidding and verified completion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 hover:border-blue-400 transition">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h4 className="font-bold text-slate-900 text-base">Citizen Reports Damage</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Scan on-site QR code or open mobile portal. Captures video, photo evidence, and high-precision GPS coordinates.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 hover:border-blue-400 transition">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h4 className="font-bold text-slate-900 text-base">AI Computer Vision</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              YOLO model detects potholes, cracks, and surface breaks. Calculates depth, area, and confidence rating.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 hover:border-blue-400 transition">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h4 className="font-bold text-slate-900 text-base">Admin Verification</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              PWD engineers review evidence, check duplicate reports within 50m, approve severity, and approve for contracting.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 hover:border-blue-400 transition">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
              04
            </div>
            <h4 className="font-bold text-slate-900 text-base">PostGIS Tender Notice</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Repair contract published. PostGIS automatically identifies verified contractors within operating radius and notifies them.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 hover:border-blue-400 transition">
            <div className="w-10 h-10 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold text-sm">
              05
            </div>
            <h4 className="font-bold text-slate-900 text-base">Competitive Bidding</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Eligible contractors submit confidential bids with price and estimated timeline. System ranks eligible lowest bid.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 hover:border-blue-400 transition">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
              06
            </div>
            <h4 className="font-bold text-slate-900 text-base">Contract Award</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Admin awards contract. Work order generated automatically. Winning contractor, competitors, and citizen notified.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 hover:border-blue-400 transition">
            <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm">
              07
            </div>
            <h4 className="font-bold text-slate-900 text-base">Repair Execution</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Contractor uploads photographic evidence for Before, In-Progress, and After repair milestones compliant with MoRTH.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 hover:border-blue-400 transition">
            <div className="w-10 h-10 rounded-lg bg-green-50 text-green-700 flex items-center justify-center font-bold text-sm">
              08
            </div>
            <h4 className="font-bold text-slate-900 text-base">Inspection & Completion</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              PWD Chief Engineer inspects after-repair evidence, approves quality, closes audit trail, and marks defect as repaired.
            </p>
          </div>
        </div>
      </section>

      {/* 3. THREE INDEPENDENT PORTALS */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Three Dedicated Enterprise Portals
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Tailored dashboards and role-based permissions designed for municipal authorities, verified contractors, and citizens.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Admin Portal Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                  Govt / PWD
                </span>
              </div>
              <h4 className="text-xl font-bold text-slate-900">Admin Portal</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Central command for municipal engineers. GIS defect mapping, AI threshold tuning, tender publishing, contractor verification, and inspection sign-off.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Real-time PostGIS defect distribution map</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Duplicate detection & merge engine</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Audit trail & competitive tender award</span>
                </li>
              </ul>
              <Link
                href="/admin"
                className="block text-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-lg transition"
              >
                Launch Admin Portal
              </Link>
            </div>

            {/* Contractor Portal Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <HardHat className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                  Bidding & Execution
                </span>
              </div>
              <h4 className="text-xl font-bold text-slate-900">Contractor Portal</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Platform for verified road paving companies. Radius-matched tender discovery, competitive bidding, milestone photo uploads, and payment approvals.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Radius-filtered tenders matching your depot</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Confidential price and schedule bidding</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Before/After progress evidence upload</span>
                </li>
              </ul>
              <Link
                href="/contractor"
                className="block text-center bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-lg transition"
              >
                Launch Contractor Portal
              </Link>
            </div>

            {/* Citizen Portal Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold text-purple-800 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full">
                  Public Participation
                </span>
              </div>
              <h4 className="text-xl font-bold text-slate-900">Citizen Portal</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mobile-first public tool. Scan street QR codes or record video/photo evidence with automatic GPS tagging, and track your report in real time until repaired.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Instant camera capture with GPS validation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Interactive OpenStreetMap location picker</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Live status notifications from PWD to completion</span>
                </li>
              </ul>
              <Link
                href="/citizen"
                className="block text-center bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-lg transition"
              >
                Launch Citizen Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. AI & DEEP TECH CAPABILITIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full text-xs font-bold text-indigo-700">
              <Cpu className="w-4 h-4" />
              <span>Python FastAPI + YOLO Vision Architecture</span>
            </div>
            <h3 className="text-3xl font-extrabold text-slate-900">
              High-Precision Computer Vision Damage Quantification
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Unlike generic photo reporting apps, SmartRoad AI processes visual frames to classify damage type, compute estimated surface area (sq meters), and approximate pothole cavity depth (centimeters).
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-start space-x-3">
                <div className="w-8 h-8 rounded bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs shrink-0">
                  !
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-sm">Critical Severity Filter</h5>
                  <p className="text-xs text-slate-600">
                    Cavities exceeding 8cm depth trigger immediate priority hazard flags for two-wheeler safety on high-speed corridors.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-start space-x-3">
                <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                  ⚡
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-sm">Smart Duplicate Suppression</h5>
                  <p className="text-xs text-slate-600">
                    Reports within a 25m radius window are correlated to prevent duplicate municipal repair tenders.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Detection Visual Mockup Card */}
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <span className="font-mono text-emerald-400">AI Vision Engine [ACTIVE]</span>
              <span className="text-slate-400">Provider: YOLOv8 / Morphological Analyzer</span>
            </div>
            <div className="relative rounded-xl overflow-hidden bg-slate-800 aspect-video flex items-center justify-center border border-slate-700">
              <img
                src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80"
                alt="Road Defect Analysis"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 flex flex-col justify-between p-4">
                <div className="inline-block self-start bg-red-600/90 text-white font-mono text-[11px] px-2 py-1 rounded shadow">
                  DEFECT DETECTED: POTHOLE (Conf: 94%)
                </div>
                <div className="self-end bg-slate-900/90 backdrop-blur p-2.5 rounded-lg border border-slate-700 text-right text-[11px] space-y-0.5">
                  <p className="text-slate-300">Estimated Depth: <b className="text-white">9.8 cm</b></p>
                  <p className="text-slate-300">Estimated Area: <b className="text-white">0.85 m²</b></p>
                  <p className="text-amber-400 font-bold">Severity: CRITICAL</p>
                </div>
              </div>
            </div>
            <div className="text-xs text-slate-400 flex items-center justify-between pt-1">
              <span>GPS: 28.5583° N, 77.1738° E</span>
              <span className="text-emerald-400">MoRTH Code 500 Compliance</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. STAKEHOLDER BENEFITS */}
      <section className="bg-white py-16 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Measurable Impact For All Stakeholders
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Transforming how Indian municipal corporations maintain urban and national highways.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">For Municipalities & PWD</h4>
              <ul className="text-xs text-slate-600 space-y-2">
                <li>• 70% reduction in tender preparation time</li>
                <li>• Guaranteed MoRTH compliant photo audit trail</li>
                <li>• Elimination of fraudulent repeat billing</li>
                <li>• Live geographic heatmaps of road surface distress</li>
              </ul>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                <HardHat className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">For Road Contractors</h4>
              <ul className="text-xs text-slate-600 space-y-2">
                <li>• Fair, transparent radius-based tender matching</li>
                <li>• Faster bid awards without manual paper delays</li>
                <li>• Direct digital milestone inspection sign-offs</li>
                <li>• Transparent rating system rewarding quality</li>
              </ul>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">For Everyday Citizens</h4>
              <ul className="text-xs text-slate-600 space-y-2">
                <li>• 10-second QR scan reporting on any road</li>
                <li>• Transparent progress updates right to their phone</li>
                <li>• Notification upon verified repair completion</li>
                <li>• Safer roads and fewer vehicular suspension damages</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Ready to Upgrade Road Infrastructure Management?
            </h3>
            <p className="text-sm text-blue-100 leading-relaxed">
              Experience the end-to-end journey right now: submit a defect, inspect with AI, verify tender bidding, and complete repair inspection.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              href="/citizen/report"
              className="text-center bg-white text-blue-900 font-extrabold px-6 py-3.5 rounded-xl shadow-lg hover:bg-blue-50 transition"
            >
              Report a Road Pothole
            </Link>
            <Link
              href="/admin"
              className="text-center bg-blue-600 hover:bg-blue-500 border border-blue-400 text-white font-bold px-6 py-3.5 rounded-xl transition"
            >
              Enter PWD Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
