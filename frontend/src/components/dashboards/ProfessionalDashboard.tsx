"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
    TrendingUp, Target, BookOpen, Briefcase, FileText, ChevronRight,
    Sparkles, Zap, ArrowUpRight, Award, ShoppingBag, Edit3, Save,
    X, Plus, Trash2, GraduationCap, Globe, Linkedin, Github, User,
    BarChart2, Clock, Star, CheckCircle2, Loader2, Badge
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { api, BASE_BACKEND_URL } from "@/lib/api";
import { useNotify } from "@/components/NotificationProvider";
import { FadeIn, Spinner, Skeleton, EmptyState, HoverCard } from "@/components/ui";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import SessionTimer from "./SessionTimer";
import ActivityHeatmap from "./ActivityHeatmap";

gsap.registerPlugin(ScrollTrigger);

/* ── Animated circular career score ─────────────────────────── */
export function CircularProgress({ value, size = 130, stroke = 10 }: { value: number; size?: number; stroke?: number }) {
    const radius = (size - stroke) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;
    const color = value >= 80 ? "#34d399" : value >= 60 ? "#f59e0b" : "#6366f1";

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} fill="none" />
                <motion.circle
                    cx={size / 2} cy={size / 2} r={radius}
                    stroke="url(#scoreGrad)" strokeWidth={stroke} fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.8, ease: [0.65, 0, 0.35, 1] }}
                    strokeDasharray={circumference}
                />
                <defs>
                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%">
                        <stop offset="0%" stopColor={color} />
                        <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute text-center">
                <motion.div
                    className="text-3xl font-bold font-display text-white"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                >
                    {value}
                </motion.div>
                <div className="text-xs text-dark-400">/ 100</div>
            </div>
        </div>
    );
}

/* ── Skill bar ───────────────────────────────────────────────── */
function SkillBar({ name, level }: { name: string; level: number }) {
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
                <span className="text-dark-300 font-medium">{name}</span>
                <span className="text-primary-400 font-bold">{level}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, #6366f1, #a855f7)" }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${level}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                />
            </div>
        </div>
    );
}

/* ── Professional profile editor ─────────────────────────────── */
const TABS = ["overview", "experience", "education", "projects", "certifications"] as const;
type Tab = typeof TABS[number];

type Project = { title: string; description: string; link: string; tech: string };
type Education = { degree: string; institution: string; year: string; grade: string };
type Cert = { name: string; issuer: string; year: string; url: string };

export default function ProfessionalDashboard({ user }: { user: any }) {
    const notify = useNotify();
    const containerRef = useRef<HTMLDivElement>(null);

    // ── Activity Tracking ───────────────────────────────────────
    const { sessionTime, stats: activityStats, logActivity } = useActivityTracker(user?.email);

    // ── Dashboard data ──────────────────────────────────────────
    const [stats, setStats] = useState({ careerScore: 72, recommendations: [] as any[], skills: [] as any[] });
    const [loadingStats, setLoadingStats] = useState(true);

    // ── Profile editor ──────────────────────────────────────────
    const [activeTab, setActiveTab] = useState<Tab>("overview");
    const [showEditor, setShowEditor] = useState(false);
    const [saving, setSaving] = useState(false);
    const [prof, setProf] = useState({
        current_job_title: user?.current_job_title || "",
        industry: user?.industry || "",
        experience_years: user?.experience_years || "",
        bio: user?.bio || "",
        linkedin: user?.linkedin || "",
        github: user?.github || "",
        portfolio_url: user?.portfolio_url || "",
        mentorship_available: user?.professional_info?.mentorship_available || false,
    });
    const [docUploading, setDocUploading] = useState<string | null>(null);
    const [projects, setProjects] = useState<Project[]>(user?.professional_info?.professional_projects || []);
    const [education, setEducation] = useState<Education[]>(
        user?.professional_info?.education_history || [
            { degree: user?.education || "", institution: "", year: "", grade: "" }
        ]
    );
    const [certs, setCerts] = useState<Cert[]>(user?.professional_info?.certifications_list || []);

    // ── Load stats ──────────────────────────────────────────────
    useEffect(() => {
        async function loadData() {
            try {
                const recs = await api.getRecommendations(user.skills || []);
                setStats({
                    careerScore: recs[0]?.match_score ? Math.round(recs[0].match_score) : 72,
                    recommendations: recs.slice(0, 5),
                    skills: (user.skills || []).map((s: string, i: number) => ({
                        name: s,
                        level: Math.max(60, 95 - i * 7)
                    }))
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingStats(false);
            }
        }
        loadData();
    }, [user]);

    // ── GSAP scroll animations ──────────────────────────────────
    useEffect(() => {
        if (!containerRef.current) return;
        const els = containerRef.current.querySelectorAll(".gsap-card");

        gsap.fromTo(els,
            { opacity: 0, y: 40, scale: 0.97 },
            {
                opacity: 1, y: 0, scale: 1,
                duration: 0.6,
                stagger: 0.1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 85%",
                    once: true
                }
            }
        );

        return () => ScrollTrigger.getAll().forEach(t => t.kill());
    }, []);

    // ── Save handler ────────────────────────────────────────────
    const handleSave = async () => {
        setSaving(true);
        try {
            await api.updateProfile({
                ...prof,
                professional_projects: projects,
                education_history: education,
                certifications_list: certs,
            });
            logActivity(5); // Award 5 intensity points for updating profile!
            notify("success", "Profile Updated!", "All your professional details have been saved.");
            setShowEditor(false);
        } catch (err: any) {
            notify("error", "Save Failed", err?.message || "Please try again.");
        } finally {
            setSaving(false);
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
                window.location.reload(); // Refresh to show
            }
        } catch (err: any) {
            notify("error", "Upload Failed", err?.message);
        } finally {
            setDocUploading(null);
        }
    };

    // ── Project helpers ─────────────────────────────────────────
    const addProject = () => setProjects([...projects, { title: "", description: "", link: "", tech: "" }]);
    const updateProject = (i: number, field: keyof Project, val: string) =>
        setProjects(projects.map((p, idx) => idx === i ? { ...p, [field]: val } : p));
    const removeProject = (i: number) => setProjects(projects.filter((_, idx) => idx !== i));

    // ── Education helpers ───────────────────────────────────────
    const addEducation = () => setEducation([...education, { degree: "", institution: "", year: "", grade: "" }]);
    const updateEdu = (i: number, field: keyof Education, val: string) =>
        setEducation(education.map((e, idx) => idx === i ? { ...e, [field]: val } : e));
    const removeEdu = (i: number) => setEducation(education.filter((_, idx) => idx !== i));

    // ── Cert helpers ────────────────────────────────────────────
    const addCert = () => setCerts([...certs, { name: "", issuer: "", year: "", url: "" }]);
    const updateCert = (i: number, field: keyof Cert, val: string) =>
        setCerts(certs.map((c, idx) => idx === i ? { ...c, [field]: val } : c));
    const removeCert = (i: number) => setCerts(certs.filter((_, idx) => idx !== i));

    const roleLabel = (
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border bg-primary-500/10 border-primary-500/30 text-primary-400">
            Professional
        </span>
    );

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
                        <p className="text-dark-500 text-[10px] font-mono mb-0.5 uppercase tracking-[0.2em] font-bold">Portal · Pro</p>
                        <h1 className="text-3xl font-bold text-white font-display">
                            Hello, <span className="gradient-text">{user?.name?.split(" ")[0]}</span> 👋
                        </h1>
                        <p className="text-dark-400 mt-0.5 text-sm">Welcome back to Career Setu AI dashboard.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowEditor(true)}
                        className="btn-secondary flex items-center gap-2 text-sm !px-5 !py-2.5 shadow-xl shadow-primary-500/5 hover:border-primary-500/30"
                    >
                        <Edit3 className="w-4 h-4 text-primary-400" /> Edit Professional Profile
                    </button>
                </div>
            </motion.header>

            {/* ─── User Summary Card ─── */}
            <motion.div 
                className="gsap-card glass-card p-6 border-l-4 border-accent-purple bg-accent-purple/5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-accent-cyan" /> Profile Summary
                        </h3>
                        <p className="text-dark-300 text-sm leading-relaxed max-w-2xl">
                            {prof.bio || "You haven't added a bio yet. Update your profile to showcase your professional story and attract better opportunities."}
                        </p>
                    </div>
                    <div className="flex gap-4 border-l border-white/10 pl-6 h-full min-w-[200px]">
                        <div>
                            <p className="text-[10px] text-dark-500 uppercase font-bold tracking-wider">Expertise</p>
                            <p className="text-white font-semibold text-sm">{prof.industry || "Not set"}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-dark-500 uppercase font-bold tracking-wider">Status</p>
                            <p className="text-accent-emerald font-bold text-sm">Ready to Glow</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ─── Profile Editor Drawer ─── */}
            <AnimatePresence>
                {showEditor && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowEditor(false)}
                        />
                        {/* Drawer */}
                        <motion.div
                            key="drawer"
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-xl bg-slate-950 border-l border-white/10 overflow-y-auto shadow-2xl"
                        >
                            <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur border-b border-white/5 px-6 py-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-white">Professional Profile</h2>
                                    <p className="text-xs text-dark-400">All changes are saved to your account</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="btn-primary !px-5 !py-2 text-sm flex items-center gap-2"
                                    >
                                        {saving ? <><Spinner size={14} /> Saving...</> : <><Save className="w-4 h-4" /> Save All</>}
                                    </button>
                                    <button onClick={() => setShowEditor(false)} className="p-2 text-dark-400 hover:text-white transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                {/* Tab navigator */}
                                <div className="flex gap-1 flex-wrap mb-6 p-1 bg-white/3 rounded-2xl border border-white/5">
                                    {TABS.map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`${activeTab === tab ? "tab-btn-active" : "tab-btn"} capitalize text-xs flex-1`}
                                        >
                                            {tab === "certifications" ? "Certs" : tab}
                                        </button>
                                    ))}
                                </div>

                                <AnimatePresence mode="wait">
                                    {/* ── Overview ── */}
                                    {activeTab === "overview" && (
                                        <motion.div key="ov" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                                            {[
                                                { label: "Current Job Title", key: "current_job_title", placeholder: "e.g. Senior Software Engineer" },
                                                { label: "Industry / Field", key: "industry", placeholder: "e.g. Information Technology" },
                                                { label: "Years of Experience", key: "experience_years", placeholder: "e.g. 5", type: "number" },
                                            ].map(f => (
                                                <div key={f.key}>
                                                    <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-1.5 block">{f.label}</label>
                                                    <input
                                                        type={f.type || "text"}
                                                        value={(prof as any)[f.key]}
                                                        onChange={(e) => setProf({ ...prof, [f.key]: e.target.value })}
                                                        className="input-field"
                                                        placeholder={f.placeholder}
                                                    />
                                                </div>
                                            ))}
                                            <div>
                                                <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-1.5 block">Professional Bio</label>
                                                <textarea
                                                    value={prof.bio}
                                                    onChange={(e) => setProf({ ...prof, bio: e.target.value })}
                                                    className="input-field resize-none"
                                                    rows={4}
                                                    placeholder="Describe your expertise, achievements, and goals..."
                                                />
                                            </div>
                                            <div className="divider" />
                                            <h4 className="text-sm font-bold text-white mb-3">Social Links</h4>
                                            {[
                                                { label: "LinkedIn URL", key: "linkedin", placeholder: "https://linkedin.com/in/yourhandle", icon: Linkedin },
                                                { label: "GitHub URL", key: "github", placeholder: "https://github.com/yourhandle", icon: Github },
                                                { label: "Portfolio / Website", key: "portfolio_url", placeholder: "https://yourwebsite.com", icon: Globe },
                                            ].map(f => (
                                                <div key={f.key} className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                                                        <f.icon className="w-4 h-4 text-dark-400" />
                                                    </div>
                                                    <input
                                                        value={(prof as any)[f.key]}
                                                        onChange={(e) => setProf({ ...prof, [f.key]: e.target.value })}
                                                        className="input-field !py-2"
                                                        placeholder={f.placeholder}
                                                    />
                                                </div>
                                            ))}
                                            <div className="divider" />
                                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5">
                                                <div>
                                                    <p className="text-white font-semibold text-sm">Available for Mentorship</p>
                                                    <p className="text-dark-400 text-xs">Let junior professionals find you for guidance</p>
                                                </div>
                                                <button
                                                    onClick={() => setProf({ ...prof, mentorship_available: !prof.mentorship_available })}
                                                    className={`relative w-12 h-6 rounded-full transition-all duration-300 ${prof.mentorship_available ? "bg-accent-emerald" : "bg-white/10"}`}
                                                >
                                                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${prof.mentorship_available ? "left-6" : "left-0.5"}`} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* ── Experience / Projects ── */}
                                    {activeTab === "experience" && (
                                        <motion.div key="exp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                            <p className="text-dark-400 text-xs mb-4">Add projects from your work experience. These appear on your public profile.</p>
                                            <div className="space-y-4">
                                                {projects.map((p, i) => (
                                                    <div key={i} className="glass-card p-4 space-y-3 border-l-2 border-primary-500/40">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-xs font-bold text-primary-400 uppercase tracking-widest">Project {i + 1}</span>
                                                            <button onClick={() => removeProject(i)} className="text-red-400 hover:text-red-300 transition-colors">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        {([
                                                            { label: "Project Title", key: "title", placeholder: "e.g. AI Resume Analyzer" },
                                                            { label: "Tech Stack", key: "tech", placeholder: "e.g. React, Python, MongoDB" },
                                                            { label: "Project Link", key: "link", placeholder: "https://github.com/..." },
                                                        ] as const).map(f => (
                                                            <div key={f.key}>
                                                                <label className="text-[10px] font-semibold text-dark-400 uppercase tracking-wider mb-1 block">{f.label}</label>
                                                                <input value={p[f.key]} onChange={(e) => updateProject(i, f.key, e.target.value)} className="input-field !py-2 text-sm" placeholder={f.placeholder} />
                                                            </div>
                                                        ))}
                                                        <div>
                                                            <label className="text-[10px] font-semibold text-dark-400 uppercase tracking-wider mb-1 block">Description</label>
                                                            <textarea value={p.description} onChange={(e) => updateProject(i, "description", e.target.value)} className="input-field !py-2 text-sm resize-none" rows={2} placeholder="What did you build and what impact did it have?" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <button onClick={addProject} className="btn-secondary mt-4 text-sm flex items-center gap-2 !py-2">
                                                <Plus className="w-4 h-4" /> Add Project
                                            </button>
                                        </motion.div>
                                    )}

                                    {/* ── Education ── */}
                                    {activeTab === "education" && (
                                        <motion.div key="edu" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                            <div className="space-y-4">
                                                {education.map((e, i) => (
                                                    <div key={i} className="glass-card p-4 space-y-3 border-l-2 border-accent-cyan/40">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-bold text-accent-cyan uppercase tracking-widest">Education {i + 1}</span>
                                                            <button onClick={() => removeEdu(i)} className="text-red-400 hover:text-red-300 transition-colors">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            {([
                                                                { label: "Degree", key: "degree", placeholder: "B.Tech, MBA, etc." },
                                                                { label: "Institution", key: "institution", placeholder: "IIT Delhi, NIT, etc." },
                                                                { label: "Year", key: "year", placeholder: "2022" },
                                                                { label: "Grade / CGPA", key: "grade", placeholder: "8.5 / 90%" },
                                                            ] as const).map(f => (
                                                                <div key={f.key} className={f.key === "institution" || f.key === "degree" ? "col-span-2" : ""}>
                                                                    <label className="text-[10px] font-semibold text-dark-400 uppercase tracking-wider mb-1 block">{f.label}</label>
                                                                    <input value={e[f.key]} onChange={(ev) => updateEdu(i, f.key, ev.target.value)} className="input-field !py-2 text-sm" placeholder={f.placeholder} />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <button onClick={addEducation} className="btn-secondary mt-4 text-sm flex items-center gap-2 !py-2">
                                                <Plus className="w-4 h-4" /> Add Education
                                            </button>
                                        </motion.div>
                                    )}

                                    {/* ── Projects tab (alias for experience quick add) ── */}
                                    {activeTab === "projects" && (
                                        <motion.div key="proj" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                            <div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/20 mb-4">
                                                <p className="text-primary-300 text-sm font-medium">💡 Projects are also managed under the <strong>Experience</strong> tab. This view shows a quick summary.</p>
                                            </div>
                                            {projects.length === 0 ? (
                                                <p className="text-dark-500 italic text-sm">No projects added yet. Go to the Experience tab to add some.</p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {projects.map((p, i) => (
                                                        <div key={i} className="glass-card p-4">
                                                            <p className="text-white font-bold">{p.title || `Project ${i + 1}`}</p>
                                                            <p className="text-dark-400 text-xs mt-1">{p.tech}</p>
                                                            {p.link && <a href={p.link} target="_blank" className="text-primary-400 text-xs hover:underline mt-1 block">{p.link}</a>}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* ── Certifications ── */}
                                    {activeTab === "certifications" && (
                                        <motion.div key="cert" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                            <div className="space-y-4">
                                                {certs.map((c, i) => (
                                                    <div key={i} className="glass-card p-4 space-y-3 border-l-2 border-accent-amber/40">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-bold text-accent-amber uppercase tracking-widest">Certification {i + 1}</span>
                                                            <button onClick={() => removeCert(i)} className="text-red-400 hover:text-red-300 transition-colors">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            {([
                                                                { label: "Certificate Name", key: "name", placeholder: "AWS Solutions Architect", col: "2" },
                                                                { label: "Issuer", key: "issuer", placeholder: "Amazon, Google, Coursera...", col: "1" },
                                                                { label: "Year", key: "year", placeholder: "2024", col: "1" },
                                                                { label: "Certificate URL", key: "url", placeholder: "https://...", col: "2" },
                                                            ] as const).map(f => (
                                                                <div key={f.key} className={f.col === "2" ? "col-span-2" : ""}>
                                                                    <label className="text-[10px] font-semibold text-dark-400 uppercase tracking-wider mb-1 block">{f.label}</label>
                                                                    <input value={c[f.key as keyof Cert]} onChange={(ev) => updateCert(i, f.key as keyof Cert, ev.target.value)} className="input-field !py-2 text-sm" placeholder={f.placeholder} />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <button onClick={addCert} className="btn-secondary mt-4 text-sm flex items-center gap-2 !py-2">
                                                <Plus className="w-4 h-4" /> Add Certification
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ─── Main Grid ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Main content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* ── Activity Tracker Widgets ── */}
                    <div className="space-y-6 mb-8">
                        <SessionTimer 
                            sessionSeconds={sessionTime} 
                            totalMinutes={activityStats.totalMinutes} 
                            currentStreak={activityStats.currentStreak} 
                        />
                        <ActivityHeatmap activityDates={activityStats.activityDates} />
                    </div>

                    {/* ── Marketplace CTA ── */}
                    <motion.section
                        className="gsap-card glass-card p-6 border-l-4 border-primary-500 bg-primary-500/5 relative overflow-hidden group"
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 400 }}
                    >
                        <div className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-opacity">
                            <ShoppingBag className="w-40 h-40 text-primary-400 rotate-12" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-5 h-5 text-accent-cyan" />
                                <h3 className="text-xl font-bold text-white">Explore Service Marketplace</h3>
                            </div>
                            <p className="text-dark-300 text-sm mb-5 max-w-md">Need home repairs or technical services? Access our verified network of skilled workers.</p>
                            <div className="flex gap-3">
                                <button className="btn-primary !px-5 !py-2 text-sm">Browse Services</button>
                                <button className="text-dark-400 hover:text-white text-sm font-semibold transition-colors">How it works →</button>
                            </div>
                        </div>
                    </motion.section>

                    {/* ── Score + AI Insight ── */}
                    <div className="gsap-card grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
                            {loadingStats ? (
                                <div className="flex flex-col items-center gap-3">
                                    <Skeleton className="w-32 h-32 rounded-full" />
                                    <Skeleton className="h-5 w-28" />
                                </div>
                            ) : (
                                <>
                                    <CircularProgress value={stats.careerScore} />
                                    <h3 className="mt-4 text-lg font-bold text-white">Career Score</h3>
                                    <p className="text-xs text-dark-400 mt-1">Based on your skills & activity</p>
                                    <div className="mt-3 flex items-center gap-1.5 text-accent-emerald text-xs font-semibold">
                                        <TrendingUp className="w-4 h-4" /> Improving Daily
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="glass-card p-6 flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
                                    <Sparkles className="w-5 h-5 text-accent-cyan" /> AI Insight
                                </h3>
                                <p className="text-dark-300 text-sm italic leading-relaxed border-l-2 border-primary-500/30 pl-3">
                                    {loadingStats ? (
                                        <span className="text-dark-500">Analyzing your profile...</span>
                                    ) : stats.recommendations[0] ? (
                                        <>Your profile aligns well with <strong className="text-white">{stats.recommendations[0]?.title}</strong> roles. Focus on <strong className="text-primary-300">{stats.recommendations[0]?.missing_skills?.[0] || "advanced certifications"}</strong> to push your score higher.</>
                                    ) : (
                                        "Add more skills to your profile to get personalized AI career recommendations."
                                    )}
                                </p>
                            </div>
                            <Link href="/skills" className="btn-secondary mt-5 text-sm flex items-center gap-2 !py-2 justify-center group">
                                View Skill Gap Report <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    {/* ── Identity & Academic Verification ── */}
                    <motion.section 
                        className="gsap-card glass-card p-6 border-l-4 border-primary-500 bg-white/5 space-y-4"
                    >
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-primary-400" /> Identity & Academic Documents
                            </h3>
                        </div>
                        <p className="text-xs text-dark-400">Maintain your professional authority by providing document proof of your credentials.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { label: "Resume / CV (PDF)", key: "resume" as const, current: user?.resume_url },
                                { label: "Identity Proof (Aadhaar/PAN)", key: "aadhaar" as const, current: user?.aadhaar_url }
                            ].map(doc => (
                                <div key={doc.key} className="p-4 rounded-xl bg-white/3 border border-white/5 flex flex-col justify-between">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-dark-400 uppercase tracking-widest">{doc.label}</p>
                                            {doc.current ? (
                                                <p className="text-[10px] text-accent-emerald flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5" /> Verified Upload</p>
                                            ) : (
                                                <p className="text-[10px] text-dark-500 italic">Not uploaded yet</p>
                                            )}
                                        </div>
                                        {doc.current && (
                                            <a href={doc.current.startsWith('http') ? doc.current : `${BASE_BACKEND_URL}${doc.current}`} target="_blank" className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-primary-400 transition-all">
                                                <ArrowUpRight className="w-3.5 h-3.5" />
                                            </a>
                                        )}
                                    </div>
                                    <label className={`btn-secondary w-full !py-1.5 text-[10px] flex items-center justify-center gap-2 ${docUploading === doc.key ? "opacity-50" : "cursor-pointer hover:bg-white/10"}`}>
                                        {docUploading === doc.key ? <Spinner size={12} /> : <FileText className="w-3.5 h-3.5" />}
                                        {doc.current ? "Change File" : "Upload File"}
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
                    </motion.section>

                    {/* ── Skills ── */}
                    {stats.skills.length > 0 && (
                        <motion.section
                            className="gsap-card glass-card p-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                                <BarChart2 className="w-5 h-5 text-primary-400" /> Skill Proficiency
                            </h3>
                            <div className="space-y-4">
                                {stats.skills.map((s) => (
                                    <SkillBar key={s.name} name={s.name} level={s.level} />
                                ))}
                            </div>
                        </motion.section>
                    )}

                    {/* ── Career Matches ── */}
                    <motion.section className="gsap-card space-y-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary-400" /> Career Matches
                        </h2>
                        {loadingStats ? (
                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
                            </div>
                        ) : stats.recommendations.length === 0 ? (
                            <EmptyState
                                icon={Briefcase}
                                title="No matches yet"
                                description="Add skills to your profile to get AI-powered career recommendations."
                                action={{ label: "Go to Skills", onClick: () => window.location.href = "/skills" }}
                            />
                        ) : (
                            stats.recommendations.map((career, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    className="glass-card p-4 flex items-center justify-between hover:border-primary-500/30 transition-all group cursor-pointer"
                                    whileHover={{ x: 4 }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/10 flex items-center justify-center font-bold text-primary-400 text-sm">
                                            {Math.round(career.match_score || 0)}%
                                        </div>
                                        <div>
                                            <h4 className="text-white font-semibold text-sm">{career.title}</h4>
                                            <p className="text-xs text-dark-400">{career.category}</p>
                                        </div>
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 text-dark-600 group-hover:text-primary-400 transition-colors" />
                                </motion.div>
                            ))
                        )}
                    </motion.section>

                    {/* ── Projects Display ── */}
                    {projects.filter(p => p.title).length > 0 && (
                        <motion.section className="gsap-card space-y-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Zap className="w-5 h-5 text-accent-amber" /> My Projects
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {projects.filter(p => p.title).map((p, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="glass-card p-4 hover:border-primary-500/30 transition-all group"
                                        whileHover={{ y: -2 }}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="text-white font-bold text-sm">{p.title}</h4>
                                            {p.link && (
                                                <a href={p.link} target="_blank" className="text-primary-400 hover:text-primary-300 transition-colors">
                                                    <ArrowUpRight className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                        {p.description && <p className="text-dark-400 text-xs mb-2 line-clamp-2">{p.description}</p>}
                                        {p.tech && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {p.tech.split(",").map(t => (
                                                    <span key={t.trim()} className="px-1.5 py-0.5 bg-white/5 rounded text-[10px] text-dark-400 font-mono">{t.trim()}</span>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.section>
                    )}

                    {/* ── Certifications Display ── */}
                    {certs.filter(c => c.name).length > 0 && (
                        <motion.section className="gsap-card space-y-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Award className="w-5 h-5 text-accent-amber" /> Certifications
                            </h2>
                            <div className="space-y-3">
                                {certs.filter(c => c.name).map((c, i) => (
                                    <div key={i} className="glass-card p-4 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-accent-amber/10 border border-accent-amber/20 flex items-center justify-center flex-shrink-0">
                                            <Award className="w-5 h-5 text-accent-amber" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-bold text-sm">{c.name}</p>
                                            <p className="text-dark-400 text-xs">{c.issuer} {c.year && `· ${c.year}`}</p>
                                        </div>
                                        {c.url && (
                                            <a href={c.url} target="_blank" className="text-primary-400 hover:underline text-xs flex items-center gap-1">
                                                View <ArrowUpRight className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.section>
                    )}
                </div>

                {/* ─── Sidebar ─── */}
                <div className="space-y-6">
                    {/* Profile card */}
                    <motion.section
                        className="gsap-card glass-card p-6 border-b-4 border-primary-500"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="text-center mb-5">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-purple mx-auto flex items-center justify-center text-2xl font-bold text-white shadow-xl overflow-hidden mb-3">
                                {user?.profile_photo
                                    ? <Image src={user.profile_photo.startsWith('http') ? user.profile_photo : `${BASE_BACKEND_URL}${user.profile_photo}`} alt="avatar" width={64} height={64} className="object-cover" unoptimized />
                                    : user?.name?.[0]?.toUpperCase()
                                }
                            </div>
                            <h3 className="text-lg font-bold text-white">{user?.name}</h3>
                            <p className="text-xs text-dark-400 mt-1 font-mono">{prof.current_job_title || user?.current_job_title || "Professional"}</p>
                            <div className="mt-1">{roleLabel}</div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-white/5 text-sm">
                            {[
                                { label: "Industry", value: prof.industry || "Not set" },
                                { label: "Experience", value: prof.experience_years ? `${prof.experience_years} Years` : "Not set" },
                                { label: "Certifications", value: certs.filter(c => c.name).length },
                                { label: "Projects", value: projects.filter(p => p.title).length },
                                { label: "Mentorship", value: prof.mentorship_available ? "Active 🟢" : "Inactive", color: prof.mentorship_available ? "text-accent-emerald" : "text-dark-500" },
                            ].map(item => (
                                <div key={item.label} className="flex justify-between items-center">
                                    <span className="text-dark-400 text-xs uppercase tracking-wide">{item.label}</span>
                                    <span className={`font-bold text-xs ${(item as any).color || "text-white"}`}>{String(item.value)}</span>
                                </div>
                            ))}
                        </div>

                        <button onClick={() => setShowEditor(true)} className="btn-secondary w-full mt-5 text-xs !py-2 flex items-center justify-center gap-2">
                            <Edit3 className="w-3.5 h-3.5" /> Edit Details
                        </button>
                    </motion.section>

                    {/* Social Links */}
                    {(prof.linkedin || prof.github || prof.portfolio_url) && (
                        <motion.section
                            className="gsap-card glass-card p-5"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Links</h3>
                            <div className="space-y-2">
                                {prof.linkedin && (
                                    <a href={prof.linkedin} target="_blank" className="flex items-center gap-2 text-sm text-dark-300 hover:text-white transition-colors group">
                                        <Linkedin className="w-4 h-4 text-blue-400" /> LinkedIn <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 ml-auto" />
                                    </a>
                                )}
                                {prof.github && (
                                    <a href={prof.github} target="_blank" className="flex items-center gap-2 text-sm text-dark-300 hover:text-white transition-colors group">
                                        <Github className="w-4 h-4 text-white" /> GitHub <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 ml-auto" />
                                    </a>
                                )}
                                {prof.portfolio_url && (
                                    <a href={prof.portfolio_url} target="_blank" className="flex items-center gap-2 text-sm text-dark-300 hover:text-white transition-colors group">
                                        <Globe className="w-4 h-4 text-accent-cyan" /> Portfolio <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 ml-auto" />
                                    </a>
                                )}
                            </div>
                        </motion.section>
                    )}

                    {/* Quick Actions — NO chat link */}
                    <motion.section
                        className="gsap-card glass-card p-5"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">
                            <Zap className="w-4 h-4 text-accent-amber inline mr-1" /> Quick Actions
                        </h3>
                        <div className="space-y-2">
                            {[
                                { label: "Analyze Resume", href: "/resume", icon: FileText, color: "bg-primary-600/20 text-primary-400" },
                                { label: "Learning Roadmap", href: "/roadmap", icon: BookOpen, color: "bg-accent-purple/20 text-accent-purple" },
                                { label: "Skill Gap Report", href: "/skills", icon: Target, color: "bg-accent-cyan/20 text-accent-cyan" },
                                { label: "Mock Interview", href: "/interview", icon: Award, color: "bg-accent-amber/20 text-accent-amber" },
                            ].map(link => (
                                <Link key={link.href} href={link.href}
                                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all group"
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${link.color}`}>
                                        <link.icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm text-dark-300 group-hover:text-white transition-colors">{link.label}</span>
                                    <ChevronRight className="w-3.5 h-3.5 text-dark-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            ))}
                        </div>
                    </motion.section>

                    {/* Education Display */}
                    {education.filter(e => e.degree).length > 0 && (
                        <motion.section
                            className="gsap-card glass-card p-5"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider flex items-center gap-1.5">
                                <GraduationCap className="w-4 h-4 text-accent-cyan" /> Education
                            </h3>
                            <div className="space-y-3">
                                {education.filter(e => e.degree).map((e, i) => (
                                    <div key={i} className="pl-3 border-l-2 border-accent-cyan/30">
                                        <p className="text-white font-semibold text-sm">{e.degree}</p>
                                        <p className="text-dark-400 text-xs">{e.institution}</p>
                                        {(e.year || e.grade) && <p className="text-dark-500 text-[10px] mt-0.5">{e.year}{e.year && e.grade ? " · " : ""}{e.grade}</p>}
                                    </div>
                                ))}
                            </div>
                        </motion.section>
                    )}
                </div>
            </div>
        </div>
    );
}
