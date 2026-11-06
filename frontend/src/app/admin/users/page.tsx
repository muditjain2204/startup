'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Users, Search, ShieldAlert, CheckCircle, Ban, ArrowRight } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter !== 'ALL') params.append('role', roleFilter);
      if (search) params.append('search', search);

      const data = await apiFetch(`/users?${params.toString()}`);
      setUsers(data.users || []);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await apiFetch(`/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            User Accounts & Grievance Directory
          </h1>
          <p className="text-xs text-slate-500">
            Manage citizen reporters, verified road contractors, and municipal admin access permissions
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            placeholder="Search user by name, email, or mobile..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
        >
          <option value="ALL">All Roles</option>
          <option value="ADMIN">PWD Administrators</option>
          <option value="CONTRACTOR">Contractors</option>
          <option value="USER">Citizens</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Reports Logged</th>
                <th className="py-3 px-4 text-right">Account Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">Loading accounts...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">No users found.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{u.fullName}</p>
                      <p className="text-[11px] text-slate-400">{u.phone || 'No phone'}</p>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-700">{u.email}</td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          u.role === 'ADMIN'
                            ? 'bg-blue-100 text-blue-800'
                            : u.role === 'CONTRACTOR'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          u.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : u.status === 'SUSPENDED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-800">
                      {u._count?.reports || 0}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {u.role !== 'ADMIN' && (
                        <div className="flex justify-end gap-1.5">
                          {u.status === 'ACTIVE' ? (
                            <button
                              onClick={() => handleUpdateStatus(u.id, 'SUSPENDED')}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1 rounded text-[11px] transition"
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateStatus(u.id, 'ACTIVE')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded text-[11px] transition"
                            >
                              Activate
                            </button>
                          )}
                          <button
                            onClick={() => handleUpdateStatus(u.id, 'BLOCKED')}
                            className="bg-white hover:bg-red-50 text-red-700 border border-red-200 font-bold px-2 py-1 rounded text-[11px] transition"
                          >
                            Block
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

