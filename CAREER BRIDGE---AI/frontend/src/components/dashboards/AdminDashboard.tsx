"use client";
import React, { useState, useEffect } from "react";
import { ShieldCheck, Users, CheckCircle2, XCircle, TrendingUp, Activity, BarChart3, AlertCircle, Search } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminDashboard({ user }: { user: any }) {
    const [users, setUsers] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function loadAdminData() {
            try {
                const [u, s] = await Promise.all([api.getAdminUsers(), api.getAdminStats()]);
                setUsers(u);
                setStats(s);
            } catch (err) { console.error(err); }
        }
        loadAdminData();
    }, []);

    const handleVerify = async (email: string, status: boolean) => {
        try {
            await api.verifyUser(email, status);
            setUsers(prev => prev.map(u => u.email === email ? { ...u, is_verified: status } : u));
        } catch (err) { alert(err); }
    };

    const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-primary-500" />
                    System Administration
                </h1>
                <p className="text-dark-400 mt-2 font-medium tracking-tight uppercase font-mono">Platform Health & Governance</p>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Users", value: stats?.total_users || 0, icon: Users, color: "text-primary-400" },
                    { label: "Active Jobs", value: stats?.active_requests || 0, icon: Activity, color: "text-accent-amber" },
                    { label: "Completed", value: stats?.completed_jobs || 0, icon: CheckCircle2, color: "text-accent-emerald" },
                    { label: "Revenue", value: `₹${stats?.revenue || 0}`, icon: TrendingUp, color: "text-accent-cyan" },
                ].map((s, i) => (
                    <div key={i} className="glass-card p-6 border-b-2 border-white/5 hover:border-primary-500/50 transition-all group">
                        <div className="flex items-center justify-between mb-2">
                            <s.icon className={`w-5 h-5 ${s.color}`} />
                        </div>
                        <div className="text-2xl font-bold text-white tracking-widest">{s.value}</div>
                        <div className="text-xs text-dark-500 uppercase font-bold tracking-tighter mt-1">{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex items-center justify-between">
                         <h2 className="text-xl font-bold text-white flex items-center gap-2">
                             <Users className="w-6 h-6 text-primary-400" /> User Directory
                        </h2>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                            <input 
                                type="text" 
                                placeholder="Filter users..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-slate-900 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white w-full focus:ring-1 focus:ring-primary-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="glass-card overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 border-b border-white/10 uppercase text-xs font-bold tracking-widest text-dark-400">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Verification</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredUsers.map((u, i) => (
                                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-white tracking-tight">{u.name}</div>
                                            <div className="text-xs text-dark-500 font-mono tracking-tighter">{u.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${u.role === 'admin' ? 'bg-red-500/10 text-red-400' : 'bg-primary-500/10 text-primary-400'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-dark-300">Active</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {u.is_verified ? (
                                                    <span className="flex items-center gap-1 text-accent-emerald text-xs font-bold"><CheckCircle2 className="w-3 h-3" /> Verified</span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-accent-amber text-xs font-bold"><AlertCircle className="w-3 h-3" /> Pending</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {!u.is_verified ? (
                                                <button 
                                                    onClick={() => handleVerify(u.email, true)}
                                                    className="text-primary-400 hover:text-primary-300 font-bold uppercase text-[10px] tracking-widest"
                                                >
                                                    Approve
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleVerify(u.email, false)}
                                                    className="text-red-400 hover:text-red-300 font-bold uppercase text-[10px] tracking-widest"
                                                >
                                                    Revoke
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
