"use client";
import React, { useState, useEffect } from "react";
import { Search, MapPin, Star, Plus, Clock, CheckCircle2, ChevronRight, Sparkles, MessageSquare, AlertCircle, X, Loader2, User, Briefcase } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { api, BASE_BACKEND_URL } from "@/lib/api";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function CustomerDashboard({ user }: { user: any }) {
    const [workers, setWorkers] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [search, setSearch] = useState("");
    const [searchLoading, setSearchLoading] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [submitSuccess, setSubmitSuccess] = useState("");
    const [newRequest, setNewRequest] = useState({
        work_type: "",
        description: "",
        budget: "",
        location: user?.location || ""
    });

    const loadData = async () => {
        try {
            const [reqs, s] = await Promise.all([
                api.getCustomerRequests(),
                api.getCustomerStats()
            ]);
            setRequests(reqs);
            setStats(s);
        } catch (err) {
            console.error("Failed to load customer data:", err);
        }
    };

    useEffect(() => {
        loadData();

        // Real-time update listener
        const handleUpdate = (e: any) => {
            const update = e.detail;
            setRequests(prev => prev.map(req => 
                req._id === update.id ? { ...req, status: update.status } : req
            ));
            // Reload stats to keep counter in sync
            api.getCustomerStats().then(setStats).catch(() => {});
        };

        window.addEventListener("WORK_REQUEST_UPDATE", handleUpdate);
        return () => window.removeEventListener("WORK_REQUEST_UPDATE", handleUpdate);
    }, []);

    useEffect(() => {
        if (!containerRef.current) return;
        const els = containerRef.current.querySelectorAll(".gsap-reveal");
        gsap.fromTo(els,
            { opacity: 0, y: 30 },
            { 
                opacity: 1, y: 0, 
                stagger: 0.1, duration: 0.8, ease: "power2.out",
                scrollTrigger: { trigger: containerRef.current, start: "top 80%", once: true }
            }
        );
        return () => ScrollTrigger.getAll().forEach(t => t.kill());
    }, []);

    const handleSearch = async () => {
        setSearchLoading(true);
        try {
            const data = await api.discoverServices(search);
            setWorkers(data);
        } catch (err) {
            console.error("Search failed:", err);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleCreateRequest = async () => {
        setSubmitError("");
        setSubmitSuccess("");

        // Validate fields
        if (!newRequest.work_type.trim()) { setSubmitError("Service type is required."); return; }
        if (!newRequest.description.trim()) { setSubmitError("Description is required."); return; }
        if (!newRequest.budget || parseFloat(String(newRequest.budget)) <= 0) { setSubmitError("Enter a valid budget."); return; }
        if (!newRequest.location.trim()) { setSubmitError("Location is required."); return; }

        setSubmitting(true);
        try {
            const payload = {
                ...newRequest,
                budget: parseFloat(String(newRequest.budget))
            };
            const res = await api.createServiceRequest(payload);

            // Show matched workers
            if (res.suggested_workers && res.suggested_workers.length > 0) {
                setWorkers(res.suggested_workers);
            }

            setSubmitSuccess("Request posted! Workers have been notified.");
            // Reset form
            setNewRequest({ work_type: "", description: "", budget: "", location: user?.location || "" });

            // Re-fetch requests + stats to show the new one
            await loadData();

            // Auto-close modal after 1.5s
            setTimeout(() => {
                setShowRequestModal(false);
                setSubmitSuccess("");
            }, 1500);

        } catch (err: any) {
            setSubmitError("Failed to create request: " + (err?.message || "Unknown error"));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8" ref={containerRef}>
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Link href="/" className="w-12 h-12 flex-shrink-0 group relative">
                        <Image src="/logo.png" alt="Logo" width={48} height={48} className="object-contain transition-transform group-hover:scale-110" />
                    </Link>
                    <div>
                        <p className="text-dark-500 text-[10px] font-mono mb-0.5 uppercase tracking-[0.2em] font-bold">Portal · Customer</p>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Find <span className="gradient-text">Services</span></h1>
                        <p className="text-dark-400 mt-0.5 text-sm">Professional solutions for your home and business.</p>
                    </div>
                </div>
                <button
                    onClick={() => { setShowRequestModal(true); setSubmitError(""); setSubmitSuccess(""); }}
                    className="btn-primary flex items-center gap-2 shadow-2xl shadow-primary-500/30 group py-3.5"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> New Service Request
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">

                    {/* ─── New Request Modal ─── */}
                    {showRequestModal && (
                        <section className="glass-card p-8 border-primary-500/30 bg-primary-500/5 relative animate-in zoom-in-95 duration-300">
                            <button
                                onClick={() => setShowRequestModal(false)}
                                className="absolute top-4 right-4 text-dark-400 hover:text-white transition-colors"
                            ><X className="w-5 h-5" /></button>

                            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <Plus className="w-6 h-6 text-primary-400" /> Create Service Request
                            </h3>

                            {submitSuccess && (
                                <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald text-sm font-bold">
                                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {submitSuccess}
                                </div>
                            )}
                            {submitError && (
                                <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {submitError}
                                </div>
                            )}

                            <div className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-dark-300 mb-2 block font-medium">Service Type *</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Electrician, AC Repair"
                                            value={newRequest.work_type}
                                            onChange={(e) => setNewRequest({ ...newRequest, work_type: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-dark-300 mb-2 block font-medium">Budget (₹) *</label>
                                        <input
                                            type="number"
                                            placeholder="500"
                                            value={newRequest.budget}
                                            onChange={(e) => setNewRequest({ ...newRequest, budget: e.target.value })}
                                            className="input-field"
                                            min="1"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-dark-300 mb-2 block font-medium">Problem Description * <span className="text-dark-500 font-normal">(AI uses this to match workers)</span></label>
                                    <textarea
                                        rows={3}
                                        placeholder="Describe the issue in detail..."
                                        value={newRequest.description}
                                        onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                                        className="input-field resize-none py-3"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-dark-300 mb-2 block font-medium">Location *</label>
                                    <input
                                        type="text"
                                        placeholder="Area, City"
                                        value={newRequest.location}
                                        onChange={(e) => setNewRequest({ ...newRequest, location: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                                <button
                                    onClick={handleCreateRequest}
                                    disabled={submitting}
                                    className="btn-primary w-full py-4 font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Posting Request...</>
                                    ) : "Post Request & Match Workers"}
                                </button>
                            </div>
                        </section>
                    )}

                    {/* ─── Search Section ─── */}
                    <section className="glass-card p-6 bg-primary-500/5 border-primary-500/10">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-accent-cyan" /> Discover Services
                        </h3>
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                <input
                                    type="text"
                                    placeholder="Search for Electricians, Plumbers, Tech Support..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all"
                                />
                            </div>
                            <button onClick={handleSearch} disabled={searchLoading} className="btn-secondary flex items-center gap-2 min-w-[90px] justify-center">
                                {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
                            </button>
                        </div>
                    </section>

                    {/* ─── Matched Workers ─── */}
                    {workers.length > 0 && (
                        <section>
                            <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider underline underline-offset-8 decoration-primary-500/30">
                                Top Matches For You
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {workers.map((w, i) => (
                                    <div key={i} className="glass-card p-4 hover:bg-white/5 transition-all group border-l-2 border-accent-emerald">
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-primary-500 flex items-center justify-center font-bold text-primary-400 text-lg overflow-hidden relative">
                                                {w.profile_photo 
                                                    ? <Image src={w.profile_photo.startsWith('http') ? w.profile_photo : `${BASE_BACKEND_URL}${w.profile_photo}`} fill className="object-cover" alt="worker" unoptimized />
                                                    : (w.name?.[0]?.toUpperCase() || "?")
                                                }
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold group-hover:text-primary-400 transition-colors">{w.name}</h4>
                                                <div className="flex items-center gap-1 text-accent-amber">
                                                    <Star className="w-3 h-3 fill-current" />
                                                    <span className="text-xs font-bold">{w.rating || "New"}</span>
                                                    {w.score && <span className="text-[10px] text-dark-500 ml-2">Match: {Math.round(w.score)}%</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {(w.skills || []).slice(0, 3).map((s: string) => (
                                                <span key={s} className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-dark-300 font-bold uppercase tracking-tighter">{s}</span>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                                            <span className="text-dark-400 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" /> {w.location || "N/A"}
                                            </span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-accent-emerald font-bold">₹{w.charges || 0}/hr</span>
                                                <Link href="/chat" className="p-1.5 hover:bg-white/5 rounded-lg text-dark-400 hover:text-white transition-all">
                                                    <MessageSquare className="w-3.5 h-3.5" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ─── My Requests ─── */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <Clock className="w-6 h-6 text-primary-400" /> My Requests
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400 text-xs font-bold">
                                {requests.length}
                            </span>
                        </h2>
                        <div className="space-y-4">
                            {requests.length === 0 ? (
                                <div className="glass-card p-12 text-center">
                                    <Clock className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                                    <p className="text-dark-400 font-medium italic">No service requests yet.</p>
                                    <button
                                        onClick={() => setShowRequestModal(true)}
                                        className="mt-4 btn-secondary text-sm"
                                    >
                                        Create Your First Request
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {requests.map((req, i) => {
                                        // Determine timeline step based on status
                                        const statuses = ["pending", "accepted", "in_progress", "completed"];
                                        const currentStepIndex = statuses.indexOf(req.status || "pending");
                                        
                                        return (
                                        <div key={req._id || i} className="glass-card p-5 border-l-4 border-primary-500 bg-primary-500/5 hover:bg-white/5 transition-all group">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="text-white font-bold tracking-tight text-lg">{req.work_type}</h4>
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                                                            req.status === "completed"
                                                                ? "bg-accent-emerald/10 border-accent-emerald/30 text-accent-emerald"
                                                                : req.status === "accepted" || req.status === "in_progress"
                                                                ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                                                                : "bg-accent-amber/10 border-accent-amber/30 text-accent-amber"
                                                        }`}>{req.status}</span>
                                                    </div>
                                                    <p className="text-sm text-dark-300 mb-2 line-clamp-2">{req.description}</p>
                                                    <div className="flex flex-wrap items-center gap-4 text-xs text-dark-400 font-medium">
                                                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-primary-400" /> {req.location}</span>
                                                        <span className="flex items-center gap-1 text-accent-emerald bg-accent-emerald/10 px-2 py-1 rounded-md font-bold text-sm">₹{req.budget}</span>
                                                        {req.worker_id && <span className="flex items-center gap-1 text-accent-cyan"><User className="w-3.5 h-3.5" /> Assigned to Worker</span>}
                                                    </div>
                                                </div>
                                                {req.worker_id && (
                                                    <Link href={`/chat`} className="btn-secondary !p-2 rounded-xl group-hover:bg-primary-500 group-hover:text-white transition-all shrink-0">
                                                        <MessageSquare className="w-5 h-5 group-hover:fill-current" />
                                                    </Link>
                                                )}
                                            </div>

                                            {/* Advanced Progress Tracker Timeline UI */}
                                            <div className="mt-6 pt-5 border-t border-white/5">
                                                <div className="flex items-center justify-between relative px-2 sm:px-4">
                                                    <div className="absolute left-[10%] right-[10%] top-3 h-0.5 bg-dark-700 z-0 rounded-full overflow-hidden">
                                                        <motion.div 
                                                            className="h-full bg-gradient-to-r from-primary-500 to-accent-emerald" 
                                                            initial={{ width: "0%" }}
                                                            animate={{ width: `${(Math.max(currentStepIndex, 0) / 3) * 100}%` }}
                                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                                        />
                                                    </div>
                                                    {[
                                                        { key: 'pending', label: 'Requested', icon: Clock },
                                                        { key: 'accepted', label: 'Accepted', icon: User },
                                                        { key: 'in_progress', label: 'In Progress', icon: Briefcase },
                                                        { key: 'completed', label: 'Completed', icon: CheckCircle2 }
                                                    ].map((step, idx) => {
                                                        const isCompleted = currentStepIndex >= idx;
                                                        const isCurrent = currentStepIndex === idx;
                                                        return (
                                                            <div key={step.key} className="relative z-10 flex flex-col items-center gap-2">
                                                                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted ? 'bg-primary-500 border-primary-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-dark-800 border-dark-600'}`}>
                                                                    <step.icon className={`w-3 h-3 sm:w-4 sm:h-4 ${isCompleted ? 'text-white' : 'text-dark-500'} ${isCurrent && idx !== 3 ? 'animate-pulse' : ''}`} />
                                                                </div>
                                                                <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${isCompleted ? 'text-white' : 'text-dark-500'}`}>{step.label}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )})}
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* ─── Sidebar ─── */}
                <div className="space-y-8">
                    <section className="glass-card p-6 border-b-4 border-primary-500">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-purple mx-auto flex items-center justify-center text-2xl font-bold text-white mb-4 shadow-xl overflow-hidden relative">
                                {user?.profile_photo
                                    ? <Image src={user.profile_photo.startsWith('http') ? user.profile_photo : `${BASE_BACKEND_URL}${user.profile_photo}`} fill className="object-cover" alt="avatar" unoptimized />
                                    : user?.name?.[0]?.toUpperCase()
                                }
                            </div>
                            <h3 className="text-xl font-bold text-white tracking-wide">{user?.name}</h3>
                            <p className="text-xs text-dark-400 mt-1 font-mono uppercase tracking-widest flex items-center justify-center gap-1">
                                <MapPin className="w-3 h-3" /> {user?.location || "Location not set"}
                            </p>
                        </div>
                        <div className="mt-6 space-y-4 pt-6 border-t border-white/5">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-dark-400 font-medium tracking-tight">Active Requests</span>
                                <span className="text-accent-amber font-bold uppercase text-xs tracking-wider">{stats?.pending_requests ?? "—"}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-dark-400 font-medium tracking-tight">Completed</span>
                                <span className="text-accent-emerald font-bold uppercase text-xs tracking-wider">{stats?.completed_requests ?? "—"}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-dark-400 font-medium tracking-tight">Wallet Balance</span>
                                <span className="text-accent-cyan font-bold uppercase text-xs tracking-wider">₹{stats?.balance ?? 0}</span>
                            </div>
                            <button className="btn-secondary w-full text-xs py-2 uppercase tracking-widest font-bold mt-2">Add Funds</button>
                        </div>
                    </section>

                    <section className="glass-card p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-accent-amber" /> Popular Services
                        </h3>
                        <div className="space-y-2">
                            {["Electrician", "Plumber", "AC Repair", "Carpenter", "Painter"].map(s => (
                                <button key={s} onClick={() => { setSearch(s); handleSearch(); }}
                                    className="w-full text-left px-4 py-2 rounded-xl bg-slate-900/50 hover:bg-primary-500/10 border border-white/5 hover:border-primary-500/30 text-sm text-dark-300 hover:text-white transition-all flex items-center justify-between group"
                                >
                                    {s} <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                                </button>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
