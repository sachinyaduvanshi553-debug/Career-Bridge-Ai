"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { JOB_ROLES } from "@/lib/data";
import {
    Target, ArrowRight, CheckCircle2, AlertTriangle, XCircle, ChevronDown,
    BarChart3, TrendingUp, BookOpen
} from "lucide-react";

interface SkillGap {
    skill: string;
    current: number;
    required: number;
    status: "strong" | "improve" | "missing";
    priority: "High" | "Medium" | "Low";
}

import { useEffect } from "react";
import { api } from "@/lib/api";

export default function SkillsPage() {
    const [selectedRole, setSelectedRole] = useState("");
    const [gaps, setGaps] = useState<SkillGap[]>([]);
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userSkills, setUserSkills] = useState<string[]>([]);

    useEffect(() => {
        api.getProfile().then(p => setUserSkills(p.skills)).catch(console.error);
    }, []);

    const handleAnalyze = async () => {
        if (!selectedRole) return;
        setLoading(true);
        try {
            const report = await api.getSkillGap(userSkills, selectedRole);
            const role = JOB_ROLES.find(r => r.id === selectedRole);

            const gapData: SkillGap[] = role?.requiredSkills.map(skill => {
                const isMatching = report.matching_skills.includes(skill);
                const current = isMatching ? 80 : 20; // Mock current levels for the bars
                const required = 75;
                return {
                    skill,
                    current,
                    required,
                    status: isMatching ? "strong" : "missing",
                    priority: isMatching ? "Low" : "High"
                };
            }) || [];

            setGaps(gapData);
            setShowResult(true);
        } catch (error) {
            console.error("Gap analysis failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const role = JOB_ROLES.find(r => r.id === selectedRole);
    const strongCount = gaps.filter(g => g.status === "strong").length;
    const improveCount = gaps.filter(g => g.status === "improve").length;
    const missingCount = gaps.filter(g => g.status === "missing").length;
    const overallScore = gaps.length > 0 ? Math.round(gaps.reduce((sum, g) => sum + Math.min(g.current / g.required * 100, 100), 0) / gaps.length) : 0;

    return (
        <main className="min-h-screen">
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-2xl md:text-3xl font-bold font-display text-white flex items-center gap-3">
                        <Target className="w-8 h-8 text-accent-purple" />
                        Skill Gap <span className="gradient-text">Analysis</span>
                    </h1>
                    <p className="text-dark-400 mt-2">Select your target career role and discover what skills you need to build</p>
                </motion.div>

                {/* Role Selector */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="glass-card p-6 mt-8"
                >
                    <h3 className="text-white font-semibold mb-4">Select Target Career Role</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <select value={selectedRole} onChange={(e) => { setSelectedRole(e.target.value); setShowResult(false); }}
                                className="input-field appearance-none pr-10"
                            >
                                <option value="">Choose a career role...</option>
                                {JOB_ROLES.map(r => (
                                    <option key={r.id} value={r.id}>{r.title} — {r.avgSalary}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500 pointer-events-none" />
                        </div>
                        <button onClick={handleAnalyze} disabled={!selectedRole}
                            className="btn-primary flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
                        >
                            <Target className="w-4 h-4" /> Analyze Gaps
                        </button>
                    </div>
                </motion.div>

                {/* Results */}
                {showResult && gaps.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 mt-8">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="glass-card p-5 text-center">
                                <div className="text-3xl font-bold gradient-text">{overallScore}%</div>
                                <div className="text-sm text-dark-400 mt-1">Readiness Score</div>
                            </div>
                            <div className="glass-card p-5 text-center">
                                <div className="text-3xl font-bold text-accent-emerald">{strongCount}</div>
                                <div className="text-sm text-dark-400 mt-1">Strong Skills</div>
                            </div>
                            <div className="glass-card p-5 text-center">
                                <div className="text-3xl font-bold text-accent-amber">{improveCount}</div>
                                <div className="text-sm text-dark-400 mt-1">Need Improvement</div>
                            </div>
                            <div className="glass-card p-5 text-center">
                                <div className="text-3xl font-bold text-rose-400">{missingCount}</div>
                                <div className="text-sm text-dark-400 mt-1">Missing Skills</div>
                            </div>
                        </div>

                        {/* Target Role Info */}
                        {role && (
                            <div className="glass-card p-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">{role.title}</h3>
                                        <p className="text-sm text-dark-400 mt-1">{role.description}</p>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="tag">{role.avgSalary}</span>
                                        <span className="tag-success flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3" /> {role.growth}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Skill Bars */}
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-primary-400" /> Skill-by-Skill Breakdown
                            </h3>
                            <div className="space-y-5">
                                {gaps.sort((a, b) => a.current - b.current).map((gap, i) => (
                                    <motion.div key={gap.skill} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {gap.status === "strong" ? <CheckCircle2 className="w-4 h-4 text-accent-emerald" /> :
                                                    gap.status === "improve" ? <AlertTriangle className="w-4 h-4 text-accent-amber" /> :
                                                        <XCircle className="w-4 h-4 text-rose-400" />}
                                                <span className="text-sm text-white font-medium">{gap.skill}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${gap.priority === "High" ? "bg-rose-500/10 text-rose-400" :
                                                    gap.priority === "Medium" ? "bg-amber-500/10 text-amber-400" :
                                                        "bg-emerald-500/10 text-emerald-400"
                                                    }`}>{gap.priority} Priority</span>
                                                <span className="text-sm text-dark-400">{gap.current}%</span>
                                            </div>
                                        </div>
                                        <div className="relative w-full h-2.5 rounded-full bg-dark-800">
                                            <div className="absolute top-0 left-0 h-full rounded-full bg-dark-700 opacity-50"
                                                style={{ width: `${gap.required}%` }} />
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${gap.current}%` }}
                                                transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 }}
                                                className={`absolute top-0 left-0 h-full rounded-full ${gap.status === "strong" ? "bg-gradient-to-r from-accent-emerald to-green-500" :
                                                    gap.status === "improve" ? "bg-gradient-to-r from-accent-amber to-orange-500" :
                                                        "bg-gradient-to-r from-rose-500 to-red-500"
                                                    }`}
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="text-white font-semibold flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-accent-cyan" /> Ready to fill these gaps?
                                </h3>
                                <p className="text-sm text-dark-400">Get a personalized 30-60-90 day learning roadmap</p>
                            </div>
                            <a href="/roadmap" className="btn-primary flex items-center gap-2 whitespace-nowrap">
                                Generate Roadmap <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>
                    </motion.div>
                )}
            </div>
        </main>
    );
}
