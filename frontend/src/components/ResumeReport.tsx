"use client";
import React from "react";
import { motion } from "framer-motion";
import { 
    Award, CheckCircle2, AlertCircle, Sparkles, 
    TrendingUp, FileText, Target, Zap 
} from "lucide-react";
import { CircularProgress } from "./dashboards/ProfessionalDashboard"; // Reuse the epic circular progress

interface ResumeReportProps {
    data: {
        overall_score: number;
        keyword_match: number;
        extracted_skills: string[];
        missing_keywords: string[];
        suggestions: string[];
        strengths: string[];
        section_analysis?: any[];
    };
}

export default function ResumeReport({ data }: ResumeReportProps) {
    return (
        <div className="space-y-8 py-4">
            {/* Header / Score Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Award className="w-32 h-32 text-primary-400 rotate-12" />
                    </div>
                    <CircularProgress value={data.overall_score} size={160} stroke={12} />
                    <h3 className="mt-6 text-2xl font-bold text-white font-display">Match Score</h3>
                    <p className="text-dark-400 text-sm mt-1">Overall Profile Strength</p>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <div className="glass-card p-6 bg-primary-500/5 border-l-4 border-primary-500">
                        <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-accent-cyan" /> AI Executive Summary
                        </h4>
                        <p className="text-dark-300 text-sm leading-relaxed italic">
                            &quot;{data.suggestions[0]?.substring(0, 300)}...&quot;
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="glass-card p-5 border-l-4 border-accent-emerald bg-accent-emerald/5">
                            <p className="text-[10px] uppercase font-bold tracking-widest text-dark-500 mb-1">Keywords Match</p>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold text-white font-mono">{data.keyword_match}%</span>
                                <TrendingUp className="w-5 h-5 text-accent-emerald mb-1.5" />
                            </div>
                        </div>
                        <div className="glass-card p-5 border-l-4 border-accent-amber bg-accent-amber/5">
                            <p className="text-[10px] uppercase font-bold tracking-widest text-dark-500 mb-1">Skills Found</p>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold text-white font-mono">{data.extracted_skills?.length || 0}</span>
                                <Zap className="w-5 h-5 text-accent-amber mb-1.5" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Strengths */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 px-2">
                        <CheckCircle2 className="w-5 h-5 text-accent-emerald" /> Key Strengths
                    </h3>
                    <div className="space-y-3">
                        {data.strengths.map((s, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card p-4 flex items-start gap-3 bg-white/3 hover:bg-white/5 transition-colors"
                            >
                                <div className="w-5 h-5 rounded-full bg-accent-emerald/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <div className="w-2 h-2 rounded-full bg-accent-emerald" />
                                </div>
                                <span className="text-dark-200 text-sm">{s}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Gaps / Needs Improvement */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 px-2">
                        <AlertCircle className="w-5 h-5 text-accent-amber" /> Optimization Gaps
                    </h3>
                    <div className="space-y-3">
                        {data.missing_keywords.map((m, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card p-4 flex items-start gap-3 border-dashed border-white/10 hover:border-accent-amber/30 transition-colors"
                            >
                                <div className="w-5 h-5 rounded-full bg-accent-amber/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <div className="w-2 h-2 rounded-full bg-accent-amber" />
                                </div>
                                <span className="text-dark-300 text-sm">{m}</span>
                            </motion.div>
                        ))}
                        {data.missing_keywords.length === 0 && (
                            <p className="text-dark-500 italic text-sm px-4">No critical gaps identified. Excellent match!</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Actionable Recommendations */}
            <div className="glass-card p-8 bg-gradient-to-br from-primary-900/20 to-transparent border-t-2 border-primary-500/50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-3">
                        <h4 className="text-2xl font-bold text-white font-display">Ready to bridge the gap?</h4>
                        <p className="text-dark-400 max-w-xl">
                            Our AI has generated a personalized skill development roadmap based on these findings. 
                            Complete it to increase your match score by up to <strong className="text-primary-400">25%</strong>.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button className="btn-primary !px-8 flex items-center gap-2">
                            Generate Roadmap <Zap className="w-4 h-4 fill-white" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
