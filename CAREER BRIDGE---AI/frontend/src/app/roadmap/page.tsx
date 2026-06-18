"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { COURSES, JOB_ROLES } from "@/lib/data";
import {
    Map, ChevronDown, BookOpen, ExternalLink, Star, Clock, Globe, CheckCircle2,
    ChevronRight, Sparkles
} from "lucide-react";

interface Phase {
    title: string;
    duration: string;
    skills: string[];
    courses: typeof COURSES;
    goals: string[];
}

import { api } from "@/lib/api";

export default function RoadmapPage() {
    const [selectedRole, setSelectedRole] = useState("");
    const [roadmap, setRoadmap] = useState<Phase[]>([]);
    const [activePhase, setActivePhase] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!selectedRole) return;
        setLoading(true);
        try {
            const data = await api.getRoadmap(selectedRole);
            // Format the backend response into phases if needed, or if backend returns phases
            // For now, let's assume backend returns the phase structure or we map it
            // Based on roadmap_generator.py, it returns a list of phases
            setRoadmap(data);
            setActivePhase(0);
        } catch (error) {
            console.error("Failed to generate roadmap:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen">
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-2xl md:text-3xl font-bold font-display text-white flex items-center gap-3">
                        <Map className="w-8 h-8 text-accent-cyan" />
                        Learning <span className="gradient-text-cyan">Roadmap</span>
                    </h1>
                    <p className="text-dark-400 mt-2">Get a personalized 30-60-90 day upskilling plan with free courses</p>
                </motion.div>

                {/* Role Selector */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="glass-card p-6 mt-8"
                >
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <select value={selectedRole} onChange={(e) => { setSelectedRole(e.target.value); setRoadmap([]); }}
                                className="input-field appearance-none pr-10"
                            >
                                <option value="">Choose your target career...</option>
                                {JOB_ROLES.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500 pointer-events-none" />
                        </div>
                        <button onClick={handleGenerate} disabled={!selectedRole}
                            className="btn-primary flex items-center gap-2 disabled:opacity-50"
                        >
                            <Sparkles className="w-4 h-4" /> Generate Roadmap
                        </button>
                    </div>
                </motion.div>

                {/* Roadmap */}
                {roadmap.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-6">
                        {/* Phase Tabs */}
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {roadmap.map((phase, i) => (
                                <button key={i} onClick={() => setActivePhase(i)}
                                    className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${i === activePhase
                                        ? "bg-primary-500/15 text-primary-300 border border-primary-500/30"
                                        : "bg-dark-800/50 text-dark-400 border border-white/5 hover:border-white/20"
                                        }`}
                                >
                                    <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${i === activePhase ? "bg-primary-500 text-white" : "bg-dark-700 text-dark-400"
                                        }`}>{i + 1}</span>
                                    {phase.title}
                                </button>
                            ))}
                        </div>

                        {/* Active Phase Content */}
                        <motion.div key={activePhase} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            {/* Goals */}
                            <div className="glass-card p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">🎯 Phase Goals</h3>
                                <div className="space-y-2">
                                    {roadmap[activePhase].goals.map(g => (
                                        <div key={g} className="flex items-center gap-3 text-sm text-dark-300">
                                            <CheckCircle2 className="w-4 h-4 text-accent-emerald flex-shrink-0" /> {g}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Skills to Learn */}
                            <div className="glass-card p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">📚 Skills to Learn</h3>
                                <div className="flex flex-wrap gap-2">
                                    {roadmap[activePhase].skills.map(s => <span key={s} className="tag">{s}</span>)}
                                </div>
                            </div>

                            {/* Recommended Courses */}
                            <div className="glass-card p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">🎓 Recommended Courses</h3>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {(roadmap[activePhase].courses.length > 0 ? roadmap[activePhase].courses : COURSES.slice(0, 4)).map(course => (
                                        <a key={course.id} href={course.url} target="_blank" rel="noopener noreferrer"
                                            className="p-4 rounded-xl bg-dark-800/50 border border-white/5 hover:border-primary-500/30 transition-all group"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h4 className="text-sm font-medium text-white group-hover:text-primary-300 transition-colors">{course.title}</h4>
                                                    <p className="text-xs text-dark-500 mt-0.5">{course.platform}</p>
                                                </div>
                                                <ExternalLink className="w-4 h-4 text-dark-600 group-hover:text-primary-400 transition-colors flex-shrink-0" />
                                            </div>
                                            <div className="flex items-center gap-3 mt-3 text-xs text-dark-400">
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration}</span>
                                                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-accent-amber" /> {course.rating}</span>
                                                <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {course.language}</span>
                                                <span className={course.price === "Free" ? "text-accent-emerald font-medium" : "text-dark-400"}>{course.price}</span>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Next Phase */}
                        {activePhase < roadmap.length - 1 && (
                            <button onClick={() => setActivePhase(activePhase + 1)}
                                className="btn-secondary w-full flex items-center justify-center gap-2 !py-3"
                            >
                                Next Phase: {roadmap[activePhase + 1].title} <ChevronRight className="w-4 h-4" />
                            </button>
                        )}
                    </motion.div>
                )}
            </div>
        </main>
    );
}
