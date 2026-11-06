'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Compass, HardHat, User, ArrowRight, Building2, MapPin, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [role, setRole] = useState<'USER' | 'CONTRACTOR'>('USER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Contractor specific
  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [address, setAddress] = useState('');
  const [operatingRadiusKm, setOperatingRadiusKm] = useState('25');
  const [experienceYears, setExperienceYears] = useState('5');
  const [machinery, setMachinery] = useState('Asphalt Paver, Tandem Roller, Bitumen Sprayer');
  const [workforceCount, setWorkforceCount] = useState('20');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload: any = {
        fullName,
        email,
        password,
        phone,
        role,
      };

      if (role === 'CONTRACTOR') {
        payload.companyName = companyName || fullName;
        payload.gstNumber = gstNumber;
        payload.licenseNumber = licenseNumber;
        payload.address = address;
        payload.operatingRadiusKm = parseFloat(operatingRadiusKm);
        payload.experienceYears = parseInt(experienceYears, 10);
        payload.machinery = machinery;
        payload.workforceCount = parseInt(workforceCount, 10);
        payload.latitude = 28.5355; // Default Delhi NCR
        payload.longitude = 77.2732;
      }

      await register(payload);
      setSuccessMsg(
        role === 'CONTRACTOR'
          ? 'Registration submitted! Your contractor profile has been sent for PWD verification.'
          : 'Account created successfully!'
      );
      setTimeout(() => {
        if (role === 'CONTRACTOR') router.push('/contractor');
        else router.push('/citizen');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="max-w-xl w-full space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center mx-auto shadow-md">
            <Compass className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create SmartRoad Account</h2>
          <p className="text-xs text-slate-500">
            Join the digital road maintenance ecosystem in Delhi NCR
          </p>
        </div>

        {/* Role Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setRole('USER')}
            className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center space-x-2 transition ${
              role === 'USER' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Citizen / Reporter</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('CONTRACTOR')}
            className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center space-x-2 transition ${
              role === 'CONTRACTOR' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HardHat className="w-4 h-4" />
            <span>Road Contractor</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg font-medium flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Vikram Rajput"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mobile Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98201 54321"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vikram@rajputroadworks.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>

          {/* Contractor Specific Section */}
          {role === 'CONTRACTOR' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h4 className="font-bold text-slate-900 text-xs flex items-center space-x-1.5 text-blue-900">
                <Building2 className="w-4 h-4 text-blue-700" />
                <span>Contractor Enterprise & Fleet Profile</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Company / Firm Name *</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="M/s Rajput Road Infrastructures Ltd"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">GSTIN Number *</label>
                  <input
                    type="text"
                    required
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder="07AAAAA0000A1Z5"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">PWD / CPWD License</label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="PWD/DEL/CLASS-A/2022"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">Operating Radius (km)</label>
                  <input
                    type="number"
                    value={operatingRadiusKm}
                    onChange={(e) => setOperatingRadiusKm(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Registered Depot / Plant Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Plot 42, Okhla Industrial Area, New Delhi"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Machinery & Equipment</label>
                <input
                  type="text"
                  value={machinery}
                  onChange={(e) => setMachinery(e.target.value)}
                  placeholder="Vögele Paver, Tandem Roller, Bitumen Sprayer"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg shadow-md transition disabled:opacity-60 text-xs flex items-center justify-center space-x-1.5"
          >
            {loading ? (
              <span>Registering...</span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          Already registered?{' '}
          <Link href="/login" className="font-bold text-blue-600 hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
