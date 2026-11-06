import React from 'react';
import Link from 'next/link';
import { Compass, ShieldCheck, Cpu, HardHat, FileText } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">SmartRoad AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI-powered road surface damage detection and transparent public infrastructure repair contract management platform for India.
            </p>
            <div className="text-[11px] text-slate-500">
              Compliant with MoRTH Specifications for Road and Bridge Works (5th Revision).
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Portals</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/admin" className="hover:text-blue-400 transition">
                  PWD Municipal Admin
                </Link>
              </li>
              <li>
                <Link href="/contractor" className="hover:text-blue-400 transition">
                  Contractor Bidding Portal
                </Link>
              </li>
              <li>
                <Link href="/citizen" className="hover:text-blue-400 transition">
                  Citizen Reporting Dashboard
                </Link>
              </li>
              <li>
                <Link href="/citizen/scan" className="hover:text-blue-400 transition">
                  Live QR Pothole Scanner
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Technology Stack</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>YOLO Computer Vision & OpenCV</li>
              <li>PostgreSQL 16 + PostGIS Spatial Index</li>
              <li>Next.js 14 App Router & Tailwind CSS</li>
              <li>OpenStreetMap GIS Integration</li>
              <li>Automated Radius Geo-Allocation</li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Government Alignment</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Designed for Public Works Departments (PWD), National Highways Authority of India (NHAI), and Smart Cities Mission.
            </p>
            <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 text-xs">
              <span className="block font-semibold text-white">Emergency Road Helpline</span>
              <span className="text-slate-300 font-mono text-xs">1800-11-ROAD (7623)</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 SmartRoad AI Infrastructure Technologies. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Powered by Antigravity Full-Stack Agentic Architecture</p>
        </div>
      </div>
    </footer>
  );
};
