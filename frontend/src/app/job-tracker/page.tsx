"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Building2, Plus, Trash2, LayoutDashboard, Briefcase, GripVertical } from "lucide-react";
import Link from "next/link";

type Status = "Wishlist" | "Applied" | "Interviewing" | "Offer" | "Rejected";

interface JobCard {
    id: string;
    company: string;
    role: string;
    status: Status;
    date: string;
}

const COLUMNS: { id: Status; title: string; color: string }[] = [
    { id: "Wishlist", title: "Wishlist", color: "border-primary-500 bg-primary-500/5 text-primary-400" },
    { id: "Applied", title: "Applied", color: "border-accent-cyan bg-accent-cyan/5 text-accent-cyan" },
    { id: "Interviewing", title: "Interviewing", color: "border-accent-amber bg-accent-amber/5 text-accent-amber" },
    { id: "Offer", title: "Offer", color: "border-accent-emerald bg-accent-emerald/5 text-accent-emerald" },
    { id: "Rejected", title: "Rejected", color: "border-rose-500 bg-rose-500/5 text-rose-400" }
];

export default function JobTrackerPage() {
    const [jobs, setJobs] = useState<JobCard[]>([]);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [loaded, setLoaded] = useState(false);
    
    // Add new job form state
    const [showAdd, setShowAdd] = useState<Status | null>(null);
    const [newCompany, setNewCompany] = useState("");
    const [newRole, setNewRole] = useState("");

    // Load from local storage mapped to the user
    useEffect(() => {
        const stored = localStorage.getItem("career_setu_kanban");
        if (stored) {
            try { setJobs(JSON.parse(stored)); } catch (e) {}
        }
        setLoaded(true);
    }, []);

    // Save to local storage whenever jobs change
    useEffect(() => {
        if (loaded) {
            localStorage.setItem("career_setu_kanban", JSON.stringify(jobs));
        }
    }, [jobs, loaded]);

const handleDragStart = (e: React.DragEvent<HTMLDivElement> | any, id: string) => {        setDraggingId(id);
        e.dataTransfer.effectAllowed = "move";
        // Ghost image transparency fix
        setTimeout(() => setDraggingId(id), 0);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // allow drop
    };

    const handleDrop = (e: React.DragEvent, newStatus: Status) => {
        e.preventDefault();
        if (!draggingId) return;

        setJobs(prev => prev.map(job => 
            job.id === draggingId ? { ...job, status: newStatus } : job
        ));
        setDraggingId(null);
    };

    const handleAddJob = (status: Status) => {
        if (!newCompany.trim() || !newRole.trim()) return;
        
        const newJob: JobCard = {
            id: Date.now().toString(),
            company: newCompany,
            role: newRole,
            status,
            date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        };
        
        setJobs([...jobs, newJob]);
        setNewCompany("");
        setNewRole("");
        setShowAdd(null);
    };

    const handleDelete = (id: string) => {
        setJobs(jobs.filter(j => j.id !== id));
    };

    if (!loaded) return <div className="min-h-screen bg-slate-950"></div>;

    return (
        <main className="min-h-screen">
            <Navbar />
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
                
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold font-display text-white flex items-center gap-3">
                            <Briefcase className="w-8 h-8 text-accent-cyan" />
                            Job Tracker <span className="gradient-text-alt">Visual Card</span>
                        </h1>
                        <p className="text-dark-400 mt-2">Visually manage your job hunt pipeline. Drag and drop cards to update status.</p>
                    </div>
                    <Link href="/dashboard" className="btn-secondary !py-2 flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                </motion.div>

                {/* Board */}
                <div className="flex gap-6 overflow-x-auto pb-8 min-h-[70vh]">
                    {COLUMNS.map(col => {
                        const columnJobs = jobs.filter(j => j.status === col.id);
                        
                        return (
                            <motion.div 
                                key={col.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: COLUMNS.indexOf(col) * 0.1 }}
                                className="flex-shrink-0 w-80 glass-card p-4 flex flex-col"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, col.id)}
                            >
                                {/* Column Header */}
                                <div className={`flex items-center justify-between mb-4 pb-2 border-b-2 ${col.color.split(' ')[0]}`}>
                                    <h3 className={`font-bold tracking-wider uppercase text-xs ${col.color.split(' ')[2]}`}>
                                        {col.title}
                                    </h3>
                                    <span className="w-6 h-6 rounded-full bg-dark-800 flex items-center justify-center text-xs font-bold text-dark-300">
                                        {columnJobs.length}
                                    </span>
                                </div>

                                {/* Jobs List */}
                                <div className="flex-1 space-y-3 overflow-y-auto">
                                    <AnimatePresence>
                                        {columnJobs.map(job => (
                                            <motion.div
                                                key={job.id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: draggingId === job.id ? 0.5 : 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                draggable
onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent<HTMLDivElement>, job.id)}                                                onDragEnd={() => setDraggingId(null)}
                                                className="p-4 rounded-xl bg-dark-900 border border-white/5 cursor-grab active:cursor-grabbing hover:border-white/20 transition-colors group relative"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-white text-sm">{job.role}</h4>
                                                    <GripVertical className="w-4 h-4 text-dark-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-dark-400 mb-3">
                                                    <Building2 className="w-3.5 h-3.5 text-primary-400" /> {job.company}
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] text-dark-500 border-t border-white/5 pt-2">
                                                    <span>Added {job.date}</span>
                                                    <button onClick={() => handleDelete(job.id)} className="hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    {/* Add New Job UI */}
                                    {showAdd === col.id ? (
                                        <div className="p-3 rounded-xl bg-dark-800 border border-white/10 space-y-2 mt-2">
                                            <input 
                                                autoFocus
                                                placeholder="Company Name" 
                                                className="w-full bg-dark-950 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white placeholder-dark-500 outline-none focus:border-primary-500/50"
                                                value={newCompany} onChange={e => setNewCompany(e.target.value)}
                                            />
                                            <input 
                                                placeholder="Job Title" 
                                                className="w-full bg-dark-950 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white placeholder-dark-500 outline-none focus:border-primary-500/50"
                                                value={newRole} onChange={e => setNewRole(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleAddJob(col.id)}
                                            />
                                            <div className="flex gap-2 pt-1">
                                                <button onClick={() => handleAddJob(col.id)} className="btn-primary !py-1 !px-3 text-[10px] flex-1">Add</button>
                                                <button onClick={() => setShowAdd(null)} className="btn-secondary !py-1 !px-3 text-[10px]">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => setShowAdd(col.id)}
                                            className="w-full py-2.5 rounded-xl border border-dashed border-white/10 text-dark-400 hover:text-white hover:border-white/30 hover:bg-white/5 transition-colors flex items-center justify-center gap-2 text-xs mt-2"
                                        >
                                            <Plus className="w-4 h-4" /> Add Card
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
