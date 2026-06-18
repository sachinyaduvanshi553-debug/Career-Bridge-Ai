"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Star, Clock, CheckCircle2, AlertCircle, User, Volume2, VolumeX, MessageSquare, Camera, FileIcon, Upload, X, Phone, Mail, Edit3, Save, ChevronRight, Loader2, Plus, ShieldCheck, Briefcase, Trophy, Flame, Shield, Hexagon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { api, BASE_BACKEND_URL } from "@/lib/api";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { useNotify } from "@/components/NotificationProvider";
import { EmptyState, StatusBadge, FadeIn, Spinner } from "@/components/ui";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function WorkerDashboard({ user }: { user: any }) {
    const { speak, toggleVoice, isVoiceEnabled, phrases } = useVoiceAssistant();
    const notify = useNotify();
    const [requests, setRequests] = useState<any[]>([]);
    const [workerStats, setWorkerStats] = useState<any>(null);
    const [aadhaar, setAadhaar] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [docUploading, setDocUploading] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [showProfileEditor, setShowProfileEditor] = useState(false);
    const [saving, setSaving] = useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<"requests" | "portfolio" | "profile">("requests");
    const [profileForm, setProfileForm] = useState({
        skills: [] as string[],
        experience_years: 0,
        service_charges: 0,
        specialty: "",
        description: "",
    });

    const loadData = async () => {
        try {
            const [reqs, profile] = await Promise.all([
                api.getWorkerRequests(),
                api.getWorkerProfile()
            ]);
            setRequests(Array.isArray(reqs) ? reqs : (reqs?.requests || []));
            setWorkerStats(profile);
            if (profile && profile.status !== "incomplete") {
                setProfileForm({
                    skills: profile.skills || [],
                    experience_years: profile.experience_years || 0,
                    service_charges: profile.service_charges || 0,
                    specialty: profile.specialty || "",
                    description: profile.description || "",
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => { 
        loadData(); 

        const handleClaimed = (e: any) => {
            const { id, worker_id } = e.detail;
            // If someone else claimed it, remove it from our requests list
            setRequests(prev => prev.filter(r => r._id !== id));
        };

        window.addEventListener("WORK_REQUEST_CLAIMED", handleClaimed);
        return () => window.removeEventListener("WORK_REQUEST_CLAIMED", handleClaimed);
    }, []);

    const handleAcceptJob = async (id: string) => {
        try {
            await api.updateWorkerRequestStatus(id, "accepted");
            speak(phrases.ACCEPT_JOB); 
            notify("success", "Job Accepted", "The customer has been notified. You can now start the work.");
            // Refresh list
            loadData();
        } catch (err: any) {
            notify("error", "Failed to accept", err.message);
        }
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            await api.updateWorkerRequestStatus(id, status);
            const msg = status === "in_progress" ? "Work Started" : "Work Completed";
            notify("success", msg, `Job status updated to ${status.replace("_", " ")}`);
            loadData();
        } catch (err: any) {
            notify("error", "Failed to update status", err.message);
        }
    };

    const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            await api.uploadWorkerWork(file);
            const updatedProfile = await api.getWorkerProfile();
            setWorkerStats(updatedProfile);
            notify("success", "Upload Successful", `${file.name} added to your portfolio.`);
        } catch (err: any) {
            notify("error", "Upload Failed", err?.message || "Please try again.");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    const handleAadhaarVerify = async () => {
        if (aadhaar.length !== 12) return;
        setVerifying(true);
        speak(phrases.VERIFY_AADHAAR_PROMPT);
        try {
            await api.verifyAadhaar(aadhaar);
            const updated = await api.getProfile(); // Refresh main user
            notify("success", "Identity Verified", "Your Aadhaar number has been verified.");
            speak(phrases.VERIFY_SUCCESS);
            setTimeout(() => window.location.reload(), 2000);
        } catch (err: any) {
            notify("error", "Verification Failed", err?.message || "Check your Aadhaar number.");
        } finally {
            setVerifying(false);
        }
    };

    const handleDocUpload = async (type: "resume" | "aadhaar", file: File) => {
        setDocUploading(type);
        try {
            const res = await api.uploadChatMedia(file);
            if (res.url) {
                const field = type === "resume" ? "resume_url" : "aadhaar_url";
                await api.updateProfile({ [field]: res.url });
                notify("success", "Document Saved", `${type === 'resume' ? 'Resume' : 'Aadhaar Card'} uploaded successfully.`);
                const updated = await api.getProfile(); // Refresh
                if (updated) {
                    // Update local if needed
                }
            }
        } catch (err: any) {
            notify("error", "Upload Failed", err?.message);
        } finally {
            setDocUploading(null);
        }
    };

    const handleUpdateProfile = async () => {
        setSaving(true);
        try {
            await api.updateWorkerProfile(profileForm);
            setShowProfileEditor(false);
            const updatedProfile = await api.getWorkerProfile();
            setWorkerStats(updatedProfile);
            notify("success", "Profile Updated", "Your worker profile has been saved.");
        } catch (err: any) {
            notify("error", "Save Failed", err?.message || "Please try again.");
        } finally {
            setSaving(false);
        }
    };

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

    const portfolioItems = workerStats?.work_photos || [];

    return (
        <div className="space-y-8" ref={containerRef}>
            {/* ─── Header ─── */}
            <motion.header
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
            >
                <div className="flex items-center gap-4">
                    <Link href="/" className="w-12 h-12 flex-shrink-0 group relative">
                        <Image src="/logo.png" alt="Logo" width={48} height={48} className="object-contain transition-transform group-hover:scale-110" />
                    </Link>
                    <div>
                        <p className="text-muted-foreground/60 text-[10px] font-mono mb-0.5 uppercase tracking-[0.2em] font-bold">Portal · Worker</p>
                        <h1 className="text-3xl font-bold text-foreground font-display">
                            Worker <span className="gradient-text">Hub</span>
                        </h1>
                        <p className="text-muted-foreground mt-0.5 text-sm">Manage services, verification, and job requests.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowProfileEditor(true)}
                        className="btn-secondary flex items-center gap-2 text-sm !px-5 !py-2.5 shadow-xl shadow-primary/5 hover:border-primary/30"
                    >
                        <Edit3 className="w-4 h-4 text-primary" /> Edit Worker Profile
                    </button>
                </div>
            </motion.header>

            {/* ─── Profile Editor Panel ─── */}
            <AnimatePresence>
                {showProfileEditor && (
                    <motion.section
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: "auto", marginBottom: 8 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        className="glass-card p-6 border-primary-500/30 bg-primary-500/5 relative overflow-hidden"
                    >
                        <button onClick={() => setShowProfileEditor(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" /> Update Worker Profile
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className="text-xs text-dark-300 mb-2 block font-semibold uppercase tracking-wider">Skills (comma-separated)</label>
                                <input
                                    type="text"
                                    value={profileForm.skills.join(", ")}
                                    onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                                    className="input-field"
                                    placeholder="e.g. Electrician, Plumbing, Carpentry"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-dark-300 mb-2 block font-semibold uppercase tracking-wider">Specialty</label>
                                <input
                                    type="text"
                                    value={profileForm.specialty}
                                    onChange={(e) => setProfileForm({ ...profileForm, specialty: e.target.value })}
                                    className="input-field"
                                    placeholder="e.g. AC Repair, House Wiring"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-dark-300 mb-2 block font-semibold uppercase tracking-wider">Service Rate (₹/hr)</label>
                                <input
                                    type="number"
                                    value={profileForm.service_charges}
                                    onChange={(e) => setProfileForm({ ...profileForm, service_charges: parseFloat(e.target.value) })}
                                    className="input-field"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-dark-300 mb-2 block font-semibold uppercase tracking-wider">Years of Experience</label>
                                <input
                                    type="number"
                                    value={profileForm.experience_years}
                                    onChange={(e) => setProfileForm({ ...profileForm, experience_years: parseInt(e.target.value) })}
                                    className="input-field"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground mb-2 block font-semibold uppercase tracking-wider">About Your Work</label>
                                <textarea
                                    value={profileForm.description}
                                    onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                                    className="input-field resize-none"
                                    rows={2}
                                    placeholder="Describe your expertise and services..."
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleUpdateProfile}
                            disabled={saving}
                            className="btn-primary mt-5 flex items-center gap-2 !px-6"
                        >
                            {saving ? <><Spinner size={16} /> Saving...</> : <><Save className="w-4 h-4" /> Save Profile</>}
                        </button>
                    </motion.section>
                )}
            </AnimatePresence>

            {/* ─── Verification Banner ─── */}
            {!user?.is_verified && !showProfileEditor && (
                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="gsap-reveal glass-card p-6 border-l-4 border-emerald-500 bg-muted/30 space-y-6"
                >
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-500" /> Identity & Documents
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Digital Verification */}
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-bold text-foreground mb-1">Digital Aadhaar Verification</h4>
                                <p className="text-xs text-muted-foreground">Enter your 12-digit number for instant verification status.</p>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="12-digit Aadhaar"
                                    value={aadhaar}
                                    onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, "").slice(0, 12))}
                                    className="input-field flex-1 !py-2 font-mono"
                                />
                                <button
                                    onClick={handleAadhaarVerify}
                                    disabled={verifying || aadhaar.length !== 12 || user?.is_verified}
                                    className="btn-primary text-xs !px-4 whitespace-nowrap"
                                >
                                    {verifying ? <Spinner size={14} /> : user?.is_verified ? "Verified" : "Verify Now"}
                                </button>
                            </div>
                        </div>

                        {/* Document Uploads */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { label: "Aadhaar Card (Photo)", key: "aadhaar" as const, current: user?.aadhaar_url },
                                { label: "Resume / CV (PDF)", key: "resume" as const, current: user?.resume_url }
                            ].map(doc => (
                                <div key={doc.key} className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
                                    <div className="flex justify-between items-start">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{doc.label}</p>
                                        {doc.current && (
                                            <a href={doc.current.startsWith('http') ? doc.current : `${BASE_BACKEND_URL}${doc.current}`} target="_blank" className="text-[10px] text-primary hover:underline">View</a>
                                        )}
                                    </div>
                                    <label className={`btn-secondary w-full !py-2 text-[10px] flex items-center justify-center gap-2 ${docUploading === doc.key ? "opacity-50" : "cursor-pointer"}`}>
                                        {docUploading === doc.key ? <Spinner size={12} /> : <Upload className="w-3.5 h-3.5" />}
                                        {doc.current ? "Update" : "Upload"}
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            onChange={(e) => {
                                                const f = e.target.files?.[0];
                                                if (f) handleDocUpload(doc.key, f);
                                            }}
                                            disabled={!!docUploading}
                                        />
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.section>
            )}

            {user?.is_verified && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="gsap-reveal glass-card px-5 py-3 border-l-4 border-emerald-500 bg-emerald-500/5 flex items-center gap-3"
                >
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <div>
                        <span className="text-foreground font-bold text-sm">Identity Verified</span>
                        <span className="text-muted-foreground text-xs ml-2">You&apos;re eligible for premium job requests</span>
                    </div>
                </motion.div>
            )}

            {/* ─── Main Grid ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Tabs content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Tabs */}
                    <div className="flex gap-2 p-1 glass-card !rounded-xl w-fit">
                        {(["requests", "portfolio", "profile"] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={activeTab === tab ? "tab-btn-active capitalize" : "tab-btn capitalize"}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {/* ── Job Requests Tab ── */}
                        {activeTab === "requests" && (
                            <motion.div key="requests" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-primary" /> Incoming Requests
                                    <span className="ml-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold">{requests.length}</span>
                                </h2>
                                {requests.length === 0 ? (
                                    <EmptyState
                                        icon={Clock}
                                        title="No Requests Yet"
                                        description="Job requests from customers will appear here. Make sure your profile is complete and Aadhaar is verified."
                                    />
                                ) : (
                                    requests.map((req, i) => (
                                        <motion.div
                                            key={req._id || i}
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.06 }}
                                            className="glass-card p-5 hover:border-primary-500/30 transition-all group"
                                        >
                                            <div className="flex flex-col gap-4 w-full">
                                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 w-full">
                                                    <div className="flex-1">
                                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                                            <span className="tag uppercase">{req.work_type}</span>
                                                            <StatusBadge status={req.status || "pending"} />
                                                            {req.location && (
                                                                <span className="text-xs text-dark-500 flex items-center gap-1">
                                                                    <MapPin className="w-3 h-3" /> {req.location}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-white font-semibold text-sm mb-1">{req.description}</p>
                                                        <p className="text-xs text-dark-500 font-mono">Customer: {req.customer_id?.substring(0, 15)}...</p>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right hidden sm:block">
                                                            <div className="text-lg font-bold text-emerald-500">₹{req.budget}</div>
                                                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Budget</div>
                                                        </div>
                                                        <Link href="/chat" className="p-2 glass-card !rounded-xl text-muted-foreground hover:text-foreground transition-all shrink-0">
                                                            <MessageSquare className="w-4 h-4" />
                                                        </Link>
                                                    </div>
                                                </div>

                                                {/* Advanced Progress Tracker Timeline UI */}
                                                <div className="mt-4 pt-4 border-t border-white/5">
                                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                                        <div className="flex items-center justify-between relative px-2 sm:px-4 w-full sm:w-2/3">
                                                            <div className="absolute left-[10%] right-[10%] top-3 h-0.5 bg-dark-700 z-0 rounded-full overflow-hidden">
                                                                <motion.div 
                                                                    className="h-full bg-gradient-to-r from-primary-500 to-accent-emerald" 
                                                                    initial={{ width: "0%" }}
                                                                    animate={{ width: `${(Math.max(["pending", "accepted", "in_progress", "completed"].indexOf(req.status || "pending"), 0) / 3) * 100}%` }}
                                                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                                                />
                                                            </div>
                                                            {[
                                                                { key: 'pending', label: 'Requested', icon: Clock },
                                                                { key: 'accepted', label: 'Accepted', icon: User },
                                                                { key: 'in_progress', label: 'In Progress', icon: Briefcase },
                                                                { key: 'completed', label: 'Completed', icon: CheckCircle2 }
                                                            ].map((step, idx) => {
                                                                const currentStepIndex = ["pending", "accepted", "in_progress", "completed"].indexOf(req.status || "pending");
                                                                const isCompleted = currentStepIndex >= idx;
                                                                const isCurrent = currentStepIndex === idx;
                                                                return (
                                                                    <div key={step.key} className="relative z-10 flex flex-col items-center gap-2">
                                                                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted ? 'bg-primary-500 border-primary-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-dark-800 border-dark-600'}`}>
                                                                            <step.icon className={`w-3 h-3 sm:w-4 sm:h-4 ${isCompleted ? 'text-white' : 'text-dark-500'} ${isCurrent && idx !== 3 ? 'animate-pulse' : ''}`} />
                                                                        </div>
                                                                        <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider hidden sm:block md:block lg:block ${isCompleted ? 'text-white' : 'text-dark-500'}`}>{step.label}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>

                                                        {/* Dynamic Actions */}
                                                        <div className="w-full sm:w-auto shrink-0 flex justify-end">
                                                            {req.status === "pending" && (
                                                                <button onClick={() => handleAcceptJob(req._id)} className="btn-primary w-full sm:w-auto !px-6 !py-2 text-sm uppercase tracking-widest font-bold">
                                                                    Accept Job
                                                                </button>
                                                            )}
                                                            {req.status === "accepted" && (
                                                                <button onClick={() => handleStatusUpdate(req._id, "in_progress")} className="btn-secondary w-full sm:w-auto !px-6 !py-2 text-sm uppercase tracking-widest font-bold text-accent-cyan border-accent-cyan/30 hover:bg-accent-cyan hover:text-dark-950">
                                                                    Start Work
                                                                </button>
                                                            )}
                                                            {req.status === "in_progress" && (
                                                                <button onClick={() => handleStatusUpdate(req._id, "completed")} className="btn-secondary w-full sm:w-auto !px-6 !py-2 text-sm uppercase tracking-widest font-bold text-accent-emerald border-accent-emerald/30 hover:bg-accent-emerald hover:text-dark-950 animate-pulse">
                                                                    Mark Complete
                                                                </button>
                                                            )}
                                                            {req.status === "completed" && (
                                                                <span className="text-sm font-bold text-accent-emerald uppercase tracking-widest flex items-center gap-2">
                                                                    <CheckCircle2 className="w-5 h-5" /> Done
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </motion.div>
                        )}

                        {/* ── Portfolio Tab ── */}
                        {activeTab === "portfolio" && (
                            <motion.div key="portfolio" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-foreground">My Portfolio</h2>
                                    <label className={`btn-secondary text-xs !px-4 !py-2 cursor-pointer flex items-center gap-2 ${uploading ? "opacity-60 pointer-events-none" : ""}`}>
                                        {uploading ? <><Spinner size={14} /> Uploading...</> : <><Upload className="w-4 h-4" /> Upload Work</>}
                                        <input type="file" className="hidden" onChange={handlePortfolioUpload} accept="image/*,video/*,.pdf,.doc,.docx" disabled={uploading} />
                                    </label>
                                </div>

                                {portfolioItems.length === 0 ? (
                                    <EmptyState
                                        icon={Camera}
                                        title="Portfolio is Empty"
                                        description="Upload photos, videos, or documents of your work to attract more customers."
                                        action={{
                                            label: "Upload First File",
                                            onClick: () => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()
                                        }}
                                    />
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {portfolioItems.map((url: string, i: number) => {
                                            const isVideo = /\.(mp4|webm|ogg)$/.test(url);
                                            const isDoc = /\.(pdf|doc|docx)$/.test(url);
                                            const src = url.startsWith("http") ? url : `${BASE_BACKEND_URL}${url}`;
                                            return (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    className="aspect-square rounded-xl bg-slate-800 border border-white/5 overflow-hidden flex items-center justify-center relative group"
                                                >
                                                    {isVideo ? (
                                                        <video src={src} className="w-full h-full object-cover" controls />
                                                    ) : isDoc ? (
                                                        <div className="flex flex-col items-center gap-2 text-dark-400 p-4 text-center">
                                                            <FileIcon className="w-10 h-10" />
                                                            <span className="text-[10px] font-bold uppercase tracking-widest">Document</span>
                                                            <a href={src} target="_blank" className="text-xs text-primary-400 hover:underline">View →</a>
                                                        </div>
                                                    ) : (
                                                        <Image src={src} alt={`Work ${i + 1}`} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                        {/* Upload more slot */}
                                        <label className="aspect-square rounded-xl border-2 border-dashed border-white/10 hover:border-primary-500/40 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group">
                                            <Plus className="w-6 h-6 text-dark-500 group-hover:text-primary-400 transition-colors" />
                                            <span className="text-[10px] text-dark-500 group-hover:text-dark-300 uppercase tracking-wider">Add More</span>
                                            <input type="file" className="hidden" onChange={handlePortfolioUpload} accept="image/*,video/*,.pdf,.doc,.docx" disabled={uploading} />
                                        </label>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* ── Quick Stats Tab ── */}
                        {activeTab === "profile" && (
                            <motion.div key="profile-stats" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                                <h2 className="text-xl font-bold text-white">Profile Overview</h2>
                                <div className="glass-card p-6 space-y-4">
                                    <div className="flex justify-between text-sm border-b border-white/5 pb-3">
                                        <span className="text-dark-400">Full Name</span>
                                        <span className="text-white font-semibold">{user?.name}</span>
                                    </div>
                                    <div className="flex justify-between text-sm border-b border-white/5 pb-3">
                                        <span className="text-dark-400">Email</span>
                                        <span className="text-white font-mono text-xs">{user?.email}</span>
                                    </div>
                                    <div className="flex justify-between text-sm border-b border-white/5 pb-3">
                                        <span className="text-dark-400">Phone</span>
                                        <span className="text-white">{user?.phone || "Not set"}</span>
                                    </div>
                                    <div className="flex justify-between text-sm border-b border-white/5 pb-3">
                                        <span className="text-dark-400">Location</span>
                                        <span className="text-white">{user?.location || "Not set"}</span>
                                    </div>
                                    <div className="flex justify-between text-sm border-b border-white/5 pb-3">
                                        <span className="text-dark-400">Experience</span>
                                        <span className="text-white font-bold">{workerStats?.experience_years || 0} Years</span>
                                    </div>
                                    <div className="flex justify-between text-sm border-b border-white/5 pb-3">
                                        <span className="text-dark-400">Rate</span>
                                        <span className="text-accent-emerald font-bold">₹{workerStats?.service_charges || 0}/hr</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-dark-400">Identity Status</span>
                                        <StatusBadge status={user?.is_verified ? "verified" : "unverified"} />
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(workerStats?.skills || user?.skills || []).map((s: string) => (
                                        <span key={s} className="tag">{s}</span>
                                    ))}
                                </div>
                                <button
                                    onClick={() => { setShowProfileEditor(true); setActiveTab("requests"); }}
                                    className="btn-secondary text-sm flex items-center gap-2"
                                >
                                    <Edit3 className="w-4 h-4" /> Edit Profile
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ─── Sidebar ─── */}
                <div className="space-y-6">
                    {/* Profile card */}
                    <motion.section className="glass-card p-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                        <div className="flex items-center gap-4 mb-5">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-amber/40 to-orange-600/40 border border-accent-amber/20 flex items-center justify-center text-2xl font-bold text-white overflow-hidden flex-shrink-0 relative">
                                {user?.profile_photo
                                    ? <Image src={user.profile_photo.startsWith('http') ? user.profile_photo : `${BASE_BACKEND_URL}${user.profile_photo}`} alt="avatar" fill className="object-cover" unoptimized />
                                    : user?.name?.[0]?.toUpperCase()
                                }
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">{user?.name}</h3>
                                <div className="flex items-center gap-1 text-accent-amber">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span className="text-sm font-bold">{workerStats?.rating || "0.0"}</span>
                                    <span className="text-xs text-dark-400">({workerStats?.total_reviews || 0})</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3 pt-4 border-t border-white/5">
                            {[
                                { label: "Status", value: workerStats?.availability ? "Available" : "Busy", color: workerStats?.availability ? "text-accent-emerald" : "text-red-400" },
                                { label: "Experience", value: `${workerStats?.experience_years || 0} Years`, color: "text-white" },
                                { label: "Rate", value: `₹${workerStats?.service_charges || 0}/hr`, color: "text-white" },
                                { label: "Earnings", value: `₹${workerStats?.total_earnings || 0}`, color: "text-accent-emerald" },
                                { label: "Jobs Done", value: workerStats?.completed_jobs_count || 0, color: "text-accent-cyan" },
                            ].map(item => (
                                <div key={item.label} className="flex justify-between items-center text-sm">
                                    <span className="text-dark-400">{item.label}</span>
                                    <span className={`font-bold text-xs uppercase tracking-wider ${item.color}`}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Trust Score & Gamification Panel */}
                    <motion.section className="glass-card p-5 border-l-4 border-accent-cyan bg-accent-cyan/5 relative overflow-hidden" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <Shield className="w-24 h-24 text-accent-cyan" />
                        </div>
                        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                            <Shield className="w-4 h-4 text-accent-cyan" /> Trust Score
                        </h3>
                        
                        <div className="flex items-center gap-4 mb-5">
                            <div className="flex-1 bg-dark-800 rounded-full h-2.5 overflow-hidden">
                                <motion.div 
                                    className="bg-gradient-to-r from-accent-cyan to-primary-500 h-full" 
                                    initial={{ width: 0 }} 
                                    animate={{ width: `${Math.min(((workerStats?.rating || 4.2) / 5) * 100, 100)}%` }} 
                                    transition={{ duration: 1, delay: 0.5 }}
                                />
                            </div>
                            <span className="text-accent-cyan font-bold text-lg">{workerStats?.rating || 4.2} <span className="text-xs text-dark-500 font-normal">/ 5.0</span></span>
                        </div>

                        <h4 className="text-xs font-bold text-dark-300 mb-3 uppercase tracking-wider border-t border-white/5 pt-4">Your Badges</h4>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-900 border border-white/5 relative group cursor-default">
                                <Trophy className="w-6 h-6 text-accent-amber drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                                <span className="text-[9px] font-bold text-dark-300 uppercase tracking-wider text-center">Top Rated</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-900 border border-white/5 relative group cursor-default">
                                <Flame className="w-6 h-6 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                <span className="text-[9px] font-bold text-dark-300 uppercase tracking-wider text-center">Fast Worker</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-900 border border-white/5 relative group cursor-default">
                                <Hexagon className="w-6 h-6 text-accent-emerald drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-[9px] font-bold text-dark-300 uppercase tracking-wider text-center">Verified ID</span>
                            </div>
                        </div>
                    </motion.section>

                    {/* Quick Links */}
                    <motion.section className="glass-card p-5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                        <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Quick Links</h3>
                        <div className="space-y-2">
                            {[
                                { label: "Chat with Customers", href: "/chat", icon: MessageSquare },
                                { label: "View Profile Page", href: "/profile", icon: User },
                            ].map(link => (
                                <Link key={link.href} href={link.href}
                                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all text-dark-400 hover:text-white group"
                                >
                                    <link.icon className="w-4 h-4 group-hover:text-primary-400 transition-colors" />
                                    <span className="text-sm">{link.label}</span>
                                    <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            ))}
                        </div>
                    </motion.section>
                </div>
            </div>
        </div>
    );
}
