'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { apiFetch } from '@/lib/api';
import { MapPin, Filter, Layers, CheckCircle, AlertTriangle } from 'lucide-react';

const DynamicGISMap = dynamic(() => import('@/components/GISMap').then((m) => m.GISMap), {
  ssr: false,
  loading: () => <div className="h-[600px] bg-slate-100 rounded-xl animate-pulse"></div>,
});

export default function AdminGISMapPage() {
  const [markers, setMarkers] = useState<any>({
    reports: [],
    contracts: [],
    contractors: [],
    qrCodes: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/analytics/map-markers')
      .then((data) => setMarkers(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Geographic Information System (GIS) Map</span>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full">
              PostGIS 3.4
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Spatial monitoring of road distress, active municipal tender radius circles, and contractor plant locations
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold">
          <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-xs flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
            <span>Critical Potholes ({markers.reports.filter((r: any) => r.severity === 'CRITICAL').length})</span>
          </div>
          <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-xs flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span>Tenders ({markers.contracts.length})</span>
          </div>
          <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-xs flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-600"></span>
            <span>Repaired ({markers.reports.filter((r: any) => r.status === 'REPAIRED').length})</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <DynamicGISMap
          reports={markers.reports}
          contracts={markers.contracts}
          contractors={markers.contractors}
          qrCodes={markers.qrCodes}
          heightClass="h-[620px]"
          zoom={12}
        />
      </div>
    </div>
  );
}

