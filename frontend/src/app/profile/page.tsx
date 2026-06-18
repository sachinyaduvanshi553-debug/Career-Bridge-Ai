"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import { useNotify } from "@/components/NotificationProvider";
import { FadeIn, Spinner, StatusBadge, Skeleton } from "@/components/ui";
import {
    User, MapPin, GraduationCap, Mail, Save, Edit3, Sparkles, Target,
    Award, BookOpen, Briefcase, Camera, Check, Phone, Globe, Linkedin,
    Github, Plus, X, FileText, Shield, Upload
} from "lucide-react";
import { BASE_BACKEND_URL } from "@/lib/api";

const TABS_PROFESSIONAL = ["overview", "professional", "social", "documents"] as const;
const TABS_CUSTOMER = ["overview", "verification"] as const;
type Tab = typeof TABS_PROFESSIONAL[number] | typeof TABS_CUSTOMER[number];

function ProfileSkeleton() {
    return (
        <div className="space-y-6">
            <div className="glass-card p-8 flex gap-6">
                <Skeleton className="w-24 h-24 rounded-2xl flex-shrink-0" />
                <div className="flex-1 space-y-3">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-64 mt-2" />
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
            </div>
        </div>
    );
}

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState<Tab>("overview");
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [photoUploading, setPhotoUploading] = useState(false);
    const [docUploading, setDocUploading] = useState<string | null>(null);
    const [newSkill, setNewSkill] = useState("");
    const [newInterest, setNewInterest] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const notify = useNotify();

    useEffect(() => {
        async function loadProfile() {
            try {
                const data = await api.getProfile();
                setUser(data);
            } catch (err) {
                notify("error", "Failed to load profile");
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.updateProfile(user);
            setEditing(false);
            notify("success", "Profile Saved!", "Your changes have been persisted.");
        } catch (err: any) {
            notify("error", "Save Failed", err?.message || "Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoUploading(true);
        try {
            const res = await api.uploadProfilePhoto(file);
            if (res.url) {
                const photoUrl = res.url.startsWith("http") ? res.url : `${BASE_BACKEND_URL}${res.url}`;
                const updatedUser = { ...user, profile_photo: photoUrl };
                setUser(updatedUser);
                await api.updateProfile({ profile_photo: photoUrl });
                notify("success", "Photo Updated!", "Your profile photo has been saved.");
            }
        } catch (err: any) {
            notify("error", "Photo Upload Failed", err?.message);
        } finally {
            setPhotoUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDocumentUpload = async (docType: string, file: File) => {
        setDocUploading(docType);
        try {
            const res = await api.uploadChatMedia(file); // Reusing media upload for docs
            if (res.url) {
                const docUrl = res.url.startsWith("http") ? res.url : `${BASE_BACKEND_URL}${res.url}`;
                const fieldMap: any = {
                    "Resume / CV": "resume_url",
                    "Aadhaar Card": "aadhaar_url"
                };
                const field = fieldMap[docType];
                if (field) {
                    const updatedUser = { ...user, [field]: docUrl };
                    setUser(updatedUser);
                    await api.updateProfile({ [field]: docUrl });
                    notify("success", `${docType} Uploaded!`, "Your document has been saved.");
                }
            }
        } catch (err: any) {
            notify("error", `${docType} Upload Failed`, err?.message);
        } finally {
            setDocUploading(null);
        }
    };

    const addSkill = () => {
        if (!newSkill.trim() || (user.skills || []).includes(newSkill.trim())) return;
        setUser({ ...user, skills: [...(user.skills || []), newSkill.trim()] });
        setNewSkill("");
    };

    const removeSkill = (s: string) =>
        setUser({ ...user, skills: (user.skills || []).filter((x: string) => x !== s) });

    const addInterest = () => {
        if (!newInterest.trim() || (user.interests || []).includes(newInterest.trim())) return;
        setUser({ ...user, interests: [...(user.interests || []), newInterest.trim()] });
        setNewInterest("");
    };

    const removeInterest = (s: string) =>
        setUser({ ...user, interests: (user.interests || []).filter((x: string) => x !== s) });

    if (loading) return (
        <main className="min-h-screen">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 pt-24 pb-16"><ProfileSkeleton /></div>
        </main>
    );

    if (!user) return (
        <main className="min-h-screen flex items-center justify-center flex-col gap-4">
            <p className="text-white text-xl font-bold">Not logged in</p>
            <a href="/login" className="btn-primary">Go to Login</a>
        </main>
    );

    const roleColor = user.role === "worker" ? "text-accent-amber" : user.role === "customer" ? "text-accent-cyan" : "text-primary-400";
    const roleBg = user.role === "worker" ? "bg-accent-amber/10 border-accent-amber/30" : user.role === "customer" ? "bg-accent-cyan/10 border-accent-cyan/30" : "bg-primary-500/10 border-primary-500/30";
    const stats = [
        { label: "Skills", value: user.skills?.length || 0, icon: Sparkles, color: "text-accent-purple" },
        { label: "Interests", value: user.interests?.length || 0, icon: Target, color: "text-primary-400" },
        { label: "Role", value: user.role || "N/A", icon: Briefcase, color: roleColor },
        { label: "Status", value: user.is_verified ? "Verified" : "Basic", icon: Award, color: user.is_verified ? "text-accent-emerald" : "text-dark-500" },
    ];

    return (
        <main className="min-h-screen">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
                <FadeIn>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold font-display text-white flex items-center gap-3">
                                <User className="w-7 h-7 text-primary-400" /> My <span className="gradient-text">Profile</span>
                            </h1>
                            <p className="text-dark-400 text-sm mt-1">Manage your personal and professional information.</p>
                        </div>
                        <button
                            onClick={editing ? handleSave : () => setEditing(true)}
                            disabled={saving}
                            className={editing ? "btn-primary !px-5 !py-2 text-sm flex items-center gap-2" : "btn-secondary !px-5 !py-2 text-sm flex items-center gap-2"}
                        >
                            {saving ? <><Spinner size={15} /> Saving...</>
                                : editing ? <><Save className="w-4 h-4" /> Save All</>
                                : <><Edit3 className="w-4 h-4" /> Edit Profile</>}
                        </button>
                    </div>
                </FadeIn>

                {/* ─── Profile Card ─── */}
                <FadeIn delay={0.05}>
                    <div className="glass-card p-6 sm:p-8 mb-6">
                        <div className="flex flex-col sm:flex-row items-start gap-6">
                            {/* Avatar */}
                            <div
                                className="relative flex-shrink-0 cursor-pointer group"
                                onClick={() => fileInputRef.current?.click()}
                                title="Click to change photo"
                            >
                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center shadow-xl overflow-hidden border-2 border-white/10 group-hover:border-primary-500/60 transition-all">
                                    {user.profile_photo ? (
                                        <img src={user.profile_photo.startsWith('http') ? user.profile_photo : `${BASE_BACKEND_URL}${user.profile_photo}`} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-bold text-white uppercase">{user.name?.charAt(0)}</span>
                                    )}
                                    {photoUploading && (
                                        <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                                            <Spinner size={24} />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center border-2 border-slate-950 shadow-lg group-hover:bg-primary-400 transition-colors">
                                    <Camera className="w-3.5 h-3.5 text-white" />
                                </div>
                                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                            </div>

                            <div className="flex-1 min-w-0">
                                {editing ? (
                                    <input
                                        value={user.name || ""}
                                        onChange={(e) => setUser({ ...user, name: e.target.value })}
                                        className="input-field text-xl font-bold mb-2 !bg-transparent !border-primary-500/30"
                                        placeholder="Your Name"
                                    />
                                ) : (
                                    <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
                                )}
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border mb-3 ${roleBg} ${roleColor}`}>
                                    {user.role}
                                </span>
                                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-dark-400">
                                    <span className="flex items-center gap-1.5">
                                        <Mail className="w-3.5 h-3.5 flex-shrink-0" /> {user.email}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                                        {editing
                                            ? <input value={user.phone || ""} onChange={(e) => setUser({ ...user, phone: e.target.value })} className="bg-transparent border-b border-white/10 outline-none text-sm w-28" placeholder="Phone" />
                                            : user.phone || "Not set"}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                        {editing
                                            ? <input value={user.location || ""} onChange={(e) => setUser({ ...user, location: e.target.value })} className="bg-transparent border-b border-white/10 outline-none text-sm" placeholder="City, State" />
                                            : user.location || "Not set"}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <GraduationCap className="w-3.5 h-3.5 flex-shrink-0" />
                                        {editing
                                            ? <input value={user.education || ""} onChange={(e) => setUser({ ...user, education: e.target.value })} className="bg-transparent border-b border-white/10 outline-none text-sm" placeholder="Education" />
                                            : user.education || "Not set"}
                                    </span>
                                </div>
                                {editing ? (
                                    <textarea
                                        value={user.bio || ""}
                                        onChange={(e) => setUser({ ...user, bio: e.target.value })}
                                        className="input-field mt-3 text-sm resize-none"
                                        rows={2}
                                        placeholder="Tell us about yourself..."
                                    />
                                ) : (
                                    <p className="text-sm text-dark-300 mt-3 italic leading-relaxed border-l-2 border-white/5 pl-3">
                                        {user.bio || <span className="text-dark-600">No bio yet — click Edit Profile to add one.</span>}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </FadeIn>

                {/* ─── Stat Cards ─── */}
                <FadeIn delay={0.1}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        {stats.map((s) => (
                            <motion.div
                                key={s.label}
                                whileHover={{ y: -2 }}
                                className="glass-card p-4 text-center"
                            >
                                <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-2`} />
                                <div className="text-xl font-bold text-white capitalize">{s.value}</div>
                                <div className="text-[11px] text-dark-400 mt-0.5 uppercase tracking-wide">{s.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </FadeIn>

                {/* ─── Tabs ─── */}
                <FadeIn delay={0.15}>
                    <div className="flex gap-2 p-1 glass-card !rounded-2xl mb-6 overflow-x-auto">
                        {(user.role === "customer" ? TABS_CUSTOMER : TABS_PROFESSIONAL).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={activeTab === tab ? "tab-btn-active capitalize flex-shrink-0" : "tab-btn capitalize flex-shrink-0"}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </FadeIn>

                {/* ─── Tab Content ─── */}
                <AnimatePresence mode="wait">
                    {/* OVERVIEW TAB */}
                    {activeTab === "overview" && (
                        <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-5">
                            {/* Skills */}
                            <div className="glass-card p-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-accent-purple" /> Skills
                                </h3>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {(user.skills || []).map((s: string) => (
                                        <span key={s} className="tag flex items-center gap-1 group">
                                            {s}
                                            {editing && (
                                                <button onClick={() => removeSkill(s)} className="ml-1 opacity-60 hover:opacity-100 transition-opacity text-red-400">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            )}
                                        </span>
                                    ))}
                                    {(user.skills || []).length === 0 && !editing && (
                                        <span className="text-dark-500 text-sm italic">No skills listed yet.</span>
                                    )}
                                </div>
                                {editing && (
                                    <div className="flex gap-2 mt-3">
                                        <input
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && addSkill()}
                                            placeholder="Add a skill..."
                                            className="input-field !py-2 flex-1 text-sm max-w-xs"
                                        />
                                        <button onClick={addSkill} className="btn-secondary !py-2 !px-4 text-sm flex items-center gap-1">
                                            <Plus className="w-4 h-4" /> Add
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Interests */}
                            <div className="glass-card p-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-primary-400" /> Interests
                                </h3>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {(user.interests || []).map((i: string) => (
                                        <span key={i} className="px-3 py-1.5 rounded-xl bg-primary-500/10 text-primary-300 border border-primary-500/20 text-sm font-semibold flex items-center gap-1 group">
                                            {i}
                                            {editing && (
                                                <button onClick={() => removeInterest(i)} className="ml-1 opacity-60 hover:opacity-100 transition-opacity text-red-400">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            )}
                                        </span>
                                    ))}
                                    {(user.interests || []).length === 0 && !editing && (
                                        <span className="text-dark-500 text-sm italic">No interests added yet.</span>
                                    )}
                                </div>
                                {editing && (
                                    <div className="flex gap-2 mt-3">
                                        <input
                                            value={newInterest}
                                            onChange={(e) => setNewInterest(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && addInterest()}
                                            placeholder="Add interest..."
                                            className="input-field !py-2 flex-1 text-sm max-w-xs"
                                        />
                                        <button onClick={addInterest} className="btn-secondary !py-2 !px-4 text-sm flex items-center gap-1">
                                            <Plus className="w-4 h-4" /> Add
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Quick Links */}
                            {user.role !== "customer" && (
                            <div className="glass-card p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {[
                                        { label: "Skill Gap Report", href: "/skills", icon: Target },
                                        { label: "Resume Analyzer", href: "/resume", icon: FileText },
                                        { label: "Learning Roadmap", href: "/roadmap", icon: BookOpen },
                                        { label: "Mock Interview", href: "/interview", icon: Award },
                                    ].map(link => (
                                        <a key={link.href} href={link.href}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/50 border border-white/5 hover:border-primary-500/30 transition-all text-sm text-dark-300 hover:text-white group"
                                        >
                                            <link.icon className="w-4 h-4 text-primary-400" />
                                            {link.label}
                                        </a>
                                    ))}
                                </div>
                            </div>
                            )}
                        </motion.div>
                    )}

                    {/* PROFESSIONAL TAB */}
                    {activeTab === "professional" && (
                        <motion.div key="professional" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-5">
                            <div className="glass-card p-6">
                                <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-primary-400" /> Professional Details
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        { label: "Current Job / Role", key: "current_job_title", placeholder: "e.g. Senior Software Engineer" },
                                        { label: "Industry / Field", key: "industry", placeholder: "e.g. Information Technology" },
                                        { label: "Years of Experience", key: "experience_years", placeholder: "e.g. 5", type: "number" },
                                    ].map(field => (
                                        <div key={field.key}>
                                            <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2 block">{field.label}</label>
                                            {editing ? (
                                                <input
                                                    type={field.type || "text"}
                                                    value={user[field.key] || ""}
                                                    onChange={(e) => setUser({ ...user, [field.key]: e.target.value })}
                                                    className="input-field"
                                                    placeholder={field.placeholder}
                                                />
                                            ) : (
                                                <p className="text-white">{user[field.key] || <span className="text-dark-600 italic text-sm">Not set</span>}</p>
                                            )}
                                        </div>
                                    ))}
                                    <div>
                                        <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2 block">About / Bio</label>
                                        {editing ? (
                                            <textarea
                                                value={user.bio || ""}
                                                onChange={(e) => setUser({ ...user, bio: e.target.value })}
                                                className="input-field resize-none"
                                                rows={4}
                                                placeholder="Write a professional summary..."
                                            />
                                        ) : (
                                            <p className="text-white text-sm leading-relaxed">{user.bio || <span className="text-dark-600 italic">Not set</span>}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* SOCIAL TAB */}
                    {activeTab === "social" && (
                        <motion.div key="social" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                            <div className="glass-card p-6">
                                <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-accent-cyan" /> Social Links
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        { label: "LinkedIn", key: "linkedin", icon: Linkedin, placeholder: "https://linkedin.com/in/yourhandle" },
                                        { label: "GitHub", key: "github", icon: Github, placeholder: "https://github.com/yourhandle" },
                                        { label: "Portfolio / Website", key: "portfolio_url", icon: Globe, placeholder: "https://yourwebsite.com" },
                                    ].map(field => (
                                        <div key={field.key} className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                                                <field.icon className="w-5 h-5 text-dark-300" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-1 block">{field.label}</label>
                                                {editing ? (
                                                    <input
                                                        value={user[field.key] || ""}
                                                        onChange={(e) => setUser({ ...user, [field.key]: e.target.value })}
                                                        className="input-field !py-2"
                                                        placeholder={field.placeholder}
                                                    />
                                                ) : (
                                                    user[field.key]
                                                        ? <a href={user[field.key]} target="_blank" className="text-primary-400 hover:underline text-sm">{user[field.key]}</a>
                                                        : <span className="text-dark-600 italic text-sm">Not set</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {editing && (
                                    <button onClick={handleSave} disabled={saving} className="btn-primary mt-6 flex items-center gap-2">
                                        {saving ? <><Spinner size={15} /> Saving...</> : <><Save className="w-4 h-4" /> Save Social Links</>}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* DOCUMENTS TAB */}
                    {activeTab === "documents" && (
                        <motion.div key="documents" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                            <div className="glass-card p-6">
                                <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-accent-amber" /> Documents & Verification
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        { label: "Resume / CV", desc: "PDF format recommended", accept: ".pdf,.doc,.docx" },
                                        { label: "Aadhaar Card", desc: "For identity verification", accept: "image/*,.pdf" },
                                    ].map(doc => (
                                        <div key={doc.label} className="flex items-center gap-4 p-4 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition-all">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                                                <FileText className="w-5 h-5 text-dark-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white font-semibold text-sm">{doc.label}</p>
                                                <p className="text-dark-500 text-xs">{doc.desc}</p>
                                            </div>
                                            {((doc.label === "Resume / CV" && user.resume_url) || (doc.label === "Aadhaar Card" && user.aadhaar_url)) && (
                                                <a 
                                                    href={(doc.label === "Resume / CV" ? user.resume_url : user.aadhaar_url).startsWith('http') ? (doc.label === "Resume / CV" ? user.resume_url : user.aadhaar_url) : `${BASE_BACKEND_URL}${doc.label === "Resume / CV" ? user.resume_url : user.aadhaar_url}`}
                                                    target="_blank"
                                                    className="btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1 hover:text-primary-400"
                                                >
                                                    View
                                                </a>
                                            )}
                                            <label className={`btn-secondary !py-1.5 !px-4 text-xs flex items-center gap-1.5 ${docUploading === doc.label ? "opacity-60 pointer-events-none" : "cursor-pointer"}`}>
                                                {docUploading === doc.label ? <Spinner size={12} /> : <Upload className="w-3.5 h-3.5" />}
                                                {docUploading === doc.label ? "Uploading..." : "Upload"}
                                                <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    accept={doc.accept} 
                                                    onChange={(e) => {
                                                        const f = e.target.files?.[0];
                                                        if (f) handleDocumentUpload(doc.label, f);
                                                    }} 
                                                    disabled={!!docUploading}
                                                />
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 p-4 rounded-xl bg-primary-500/5 border border-primary-500/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Check className="w-4 h-4 text-primary-400" />
                                        <span className="text-sm font-bold text-white">Verification Status</span>
                                    </div>
                                    <StatusBadge status={user?.is_verified ? "verified" : "unverified"} />
                                    <p className="text-xs text-dark-400 mt-2">
                                        {user?.is_verified
                                            ? "Your identity has been verified. You can access premium features."
                                            : "Complete Aadhaar verification in the Worker Dashboard to unlock premium features."}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* CUSTOMER VERIFICATION TAB */}
                    {activeTab === "verification" && (
                        <motion.div key="verification" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                            <div className="glass-card p-6">
                                <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-accent-amber" /> Identity Verification
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                                            <FileText className="w-5 h-5 text-dark-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-semibold text-sm">Aadhaar Card Details</p>
                                            <p className="text-dark-500 text-xs">For customer identity verification</p>
                                        </div>
                                        {user.aadhaar_url && (
                                            <a 
                                                href={user.aadhaar_url?.startsWith('http') ? user.aadhaar_url : `${BASE_BACKEND_URL}${user.aadhaar_url}`}
                                                target="_blank"
                                                className="btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1 hover:text-primary-400"
                                            >
                                                View
                                            </a>
                                        )}
                                        <label className={`btn-secondary !py-1.5 !px-4 text-xs flex items-center gap-1.5 ${docUploading === "Aadhaar Card" ? "opacity-60 pointer-events-none" : "cursor-pointer"}`}>
                                            {docUploading === "Aadhaar Card" ? <Spinner size={12} /> : <Upload className="w-3.5 h-3.5" />}
                                            {docUploading === "Aadhaar Card" ? "Uploading..." : "Upload"}
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                accept="image/*,.pdf" 
                                                onChange={(e) => {
                                                    const f = e.target.files?.[0];
                                                    if (f) handleDocumentUpload("Aadhaar Card", f);
                                                }} 
                                                disabled={!!docUploading}
                                            />
                                        </label>
                                    </div>
                                </div>
                                <div className="mt-6 p-4 rounded-xl bg-primary-500/5 border border-primary-500/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Check className="w-4 h-4 text-primary-400" />
                                        <span className="text-sm font-bold text-white">Status</span>
                                    </div>
                                    <StatusBadge status={user?.is_verified ? "verified" : "unverified"} />
                                    <p className="text-xs text-dark-400 mt-2">
                                        {user?.is_verified
                                            ? "Your identity has been verified."
                                            : "Please upload your Aadhaar details so we can verify your identity."}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
