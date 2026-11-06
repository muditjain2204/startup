'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import { AlertTriangle, CheckCircle, ExternalLink, HardHat, QrCode } from 'lucide-react';

// Fix default Leaflet icon paths
const createIcon = (color: string, label?: string) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="
      background-color: ${color};
      width: 26px;
      height: 26px;
      border-radius: 50%;
      border: 3px solid #ffffff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 11px;
      font-weight: bold;
    ">${label || ''}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14],
  });
};

const redIcon = createIcon('#dc2626', '!');
const amberIcon = createIcon('#d97706', '▲');
const greenIcon = createIcon('#16a34a', '✓');
const blueIcon = createIcon('#2563eb', 'C');
const purpleIcon = createIcon('#7c3aed', 'QR');
const hardHatIcon = createIcon('#0284c7', '👷');

interface LocationPickerProps {
  onLocationSelect?: (lat: number, lng: number) => void;
  selectedPos?: [number, number] | null;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationSelect, selectedPos }) => {
  useMapEvents({
    click(e) {
      if (onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  return selectedPos ? (
    <Marker position={selectedPos} icon={createIcon('#2563eb', '📍')}>
      <Popup>Selected Incident Location</Popup>
    </Marker>
  ) : null;
};

interface GISMapProps {
  reports?: any[];
  contracts?: any[];
  contractors?: any[];
  qrCodes?: any[];
  center?: [number, number];
  zoom?: number;
  interactiveSelect?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
  selectedPos?: [number, number] | null;
  heightClass?: string;
}

export const GISMap: React.FC<GISMapProps> = ({
  reports = [],
  contracts = [],
  contractors = [],
  qrCodes = [],
  center = [28.6139, 77.209], // Default Delhi NCR
  zoom = 12,
  interactiveSelect = false,
  onLocationSelect,
  selectedPos,
  heightClass = 'h-[500px]',
}) => {
  const [mounted, setMounted] = useState(false);
  const [showReports, setShowReports] = useState(true);
  const [showContracts, setShowContracts] = useState(true);
  const [showContractors, setShowContractors] = useState(true);
  const [showQRCodes, setShowQRCodes] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-full ${heightClass} bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200`}>
        <div className="flex items-center space-x-2 text-slate-500 text-sm">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading OpenStreetMap GIS Visualizer...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${heightClass} relative rounded-xl overflow-hidden border border-slate-200 shadow-sm`}>
      {/* Map Layer Filter Pills Overlay */}
      <div className="absolute top-3 right-3 z-[400] bg-white/95 backdrop-blur p-2 rounded-lg shadow-md border border-slate-200 flex flex-wrap gap-2 text-xs">
        <label className="flex items-center space-x-1.5 cursor-pointer text-slate-700 font-medium">
          <input
            type="checkbox"
            checked={showReports}
            onChange={(e) => setShowReports(e.target.checked)}
            className="rounded text-blue-600"
          />
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span>
          <span>Defects ({reports.length})</span>
        </label>
        <label className="flex items-center space-x-1.5 cursor-pointer text-slate-700 font-medium">
          <input
            type="checkbox"
            checked={showContracts}
            onChange={(e) => setShowContracts(e.target.checked)}
            className="rounded text-blue-600"
          />
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
          <span>Contracts ({contracts.length})</span>
        </label>
        <label className="flex items-center space-x-1.5 cursor-pointer text-slate-700 font-medium">
          <input
            type="checkbox"
            checked={showContractors}
            onChange={(e) => setShowContractors(e.target.checked)}
            className="rounded text-blue-600"
          />
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 inline-block"></span>
          <span>Contractors ({contractors.length})</span>
        </label>
        <label className="flex items-center space-x-1.5 cursor-pointer text-slate-700 font-medium">
          <input
            type="checkbox"
            checked={showQRCodes}
            onChange={(e) => setShowQRCodes(e.target.checked)}
            className="rounded text-blue-600"
          />
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block"></span>
          <span>QRs ({qrCodes.length})</span>
        </label>
      </div>

      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {interactiveSelect && (
          <LocationPicker onLocationSelect={onLocationSelect} selectedPos={selectedPos} />
        )}

        {/* Damage Reports */}
        {showReports &&
          reports.map((report) => {
            const isRepaired = report.status === 'REPAIRED';
            const isCritical = report.severity === 'CRITICAL' || report.severity === 'HIGH';
            const markerIcon = isRepaired ? greenIcon : isCritical ? redIcon : amberIcon;

            return (
              <Marker
                key={report.id}
                position={[report.latitude, report.longitude]}
                icon={markerIcon}
              >
                <Popup>
                  <div className="p-1 max-w-xs text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{report.reportNumber}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isRepaired
                            ? 'bg-green-100 text-green-800'
                            : isCritical
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-800">{report.title}</p>
                    <p className="text-slate-500">{report.address}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                      <span>Category: <b>{report.damageCategory}</b></span>
                      <span>Severity: <b>{report.severity}</b></span>
                    </div>
                    {report.depth && (
                      <p className="text-[11px] text-red-600 font-semibold">
                        Estimated Depth: {report.depth} cm
                      </p>
                    )}
                    <Link
                      href={`/admin/reports/${report.id}`}
                      className="block text-center bg-blue-600 hover:bg-blue-700 text-white rounded py-1 font-medium transition"
                    >
                      Inspect Report Evidence
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* Contracts & Radius Circles */}
        {showContracts &&
          contracts.map((contract) => (
            <React.Fragment key={contract.id}>
              <Marker position={[contract.latitude, contract.longitude]} icon={blueIcon}>
                <Popup>
                  <div className="p-1 max-w-xs text-xs space-y-1">
                    <span className="text-[10px] font-bold text-blue-700 uppercase">
                      PWD Tender • {contract.contractNumber}
                    </span>
                    <p className="font-bold text-slate-900">{contract.title}</p>
                    <p className="text-slate-600 font-semibold text-green-700">
                      Budget: ₹{contract.budget?.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Eligible Radius: {contract.radiusKm} km
                    </p>
                    <Link
                      href={`/contractor/contracts/${contract.id}`}
                      className="block text-center bg-slate-900 text-white rounded py-1 font-medium mt-2"
                    >
                      View Tender & Place Bid
                    </Link>
                  </div>
                </Popup>
              </Marker>
              <Circle
                center={[contract.latitude, contract.longitude]}
                radius={(contract.radiusKm || 25) * 1000}
                pathOptions={{
                  color: '#2563eb',
                  fillColor: '#3b82f6',
                  fillOpacity: 0.08,
                  weight: 1.5,
                  dashArray: '4, 4',
                }}
              />
            </React.Fragment>
          ))}

        {/* Contractors */}
        {showContractors &&
          contractors.map((contractor) => (
            <Marker
              key={contractor.id}
              position={[contractor.latitude, contractor.longitude]}
              icon={hardHatIcon}
            >
              <Popup>
                <div className="p-1 text-xs space-y-1">
                  <span className="font-bold text-slate-900">{contractor.name}</span>
                  <p className="text-slate-500">Operating Radius: {contractor.radiusKm} km</p>
                  <p className="text-amber-600 font-semibold">Rating: ★ {contractor.rating} / 5.0</p>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* QR Codes */}
        {showQRCodes &&
          qrCodes.map((qr) => (
            <Marker key={qr.id} position={[qr.latitude, qr.longitude]} icon={purpleIcon}>
              <Popup>
                <div className="p-1 text-xs space-y-1">
                  <span className="font-bold text-purple-700">QR Station • {qr.code}</span>
                  <p className="text-slate-800 font-medium">{qr.name}</p>
                  <p className="text-slate-500">Total Scans: {qr.scans}</p>
                  <Link
                    href={`/qr/${qr.code}`}
                    className="block text-center bg-purple-600 text-white rounded py-1 font-medium mt-1"
                  >
                    Open QR Reporting Flow
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
};

