"use client";
import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import {
    FileText, Upload, CheckCircle2, AlertTriangle, XCircle, ArrowRight,
    TrendingUp, Target, Sparkles, BarChart3, Lightbulb
} from "lucide-react";

interface AnalysisResult {
    atsScore: number;
    keywordMatch: number;
    sections: { name: string; status: "good" | "warning" | "missing"; tip: string }[];
    improvements: string[];
    strongPoints: string[];
    extractedSkills: string[];
    missingKeywords: string[];
}

const MOCK_RESULT: AnalysisResult = {
    atsScore: 68,
    keywordMatch: 72,
    sections: [
        { name: "Contact Information", status: "good", tip: "All contact details present" },
        { name: "Professional Summary", status: "warning", tip: "Could be more targeted to specific role" },
        { name: "Work Experience", status: "good", tip: "Well-structured with action verbs" },
        { name: "Skills Section", status: "warning", tip: "Add more industry-specific keywords" },
        { name: "Education", status: "good", tip: "Properly formatted" },
        { name: "Projects / Portfolio", status: "missing", tip: "Add 2-3 relevant projects" },
        { name: "Certifications", status: "missing", tip: "Include relevant certifications (AWS, Google, etc.)" },
    ],
    improvements: [
        "Add a 'Projects' section with 2-3 relevant portfolio items",
        "Include relevant certifications (Google, AWS, Microsoft)",
        "Use more industry-specific keywords like 'REST APIs', 'Agile', 'CI/CD'",
        "Quantify achievements (e.g., 'improved load time by 40%')",
        "Add a GitHub or portfolio link in the header",
    ],
    strongPoints: [
        "Clean, scannable formatting",
        "Good use of action verbs in experience section",
        "Education section is well-structured",
        "Contact information is complete",
    ],
    extractedSkills: ["React", "JavaScript", "HTML5", "CSS3", "Node.js", "Python", "Git", "MongoDB"],
    missingKeywords: ["TypeScript", "Docker", "AWS", "REST APIs", "Agile", "CI/CD", "PostgreSQL", "Unit Testing"],
};

import { api } from "@/lib/api";

export default function ResumePage() {
    const [step, setStep] = useState<"upload" | "analyzing" | "result">("upload");
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (e?: React.ChangeEvent<HTMLInputElement> | React.DragEvent | File) => {
        let file: File | undefined;

        if (e instanceof File) {
            file = e;
        } else if (e && 'target' in e && (e.target as HTMLInputElement).files) {
            const target = e.target as HTMLInputElement;
            file = target.files?.[0];
        } else if (e && 'dataTransfer' in e) {
            const dragEvent = e as React.DragEvent;
            file = dragEvent.dataTransfer.files[0];
        }

        if (!file) return;

        setStep("analyzing");
        try {
            const analysis = await api.analyzeResume(file);
            // Map backend response to AnalysisResult interface
            setResult({
                atsScore: analysis.overall_score || 0,
                keywordMatch: analysis.keyword_match || 0,
                sections: (analysis.section_analysis || []).map((s: any) => ({
                    name: s.section,
                    status: s.score >= 80 ? "good" : s.score >= 50 ? "warning" : "missing",
                    tip: s.feedback
                })),
                improvements: analysis.suggestions || [],
                strongPoints: analysis.strengths || [],
                extractedSkills: analysis.extracted_skills || [],
                missingKeywords: analysis.missing_keywords || []
            });
            setStep("result");
        } catch (error) {
            console.error("Analysis failed:", error);
            setStep("upload");
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "good": return <CheckCircle2 className="w-4 h-4 text-accent-emerald" />;
            case "warning": return <AlertTriangle className="w-4 h-4 text-accent-amber" />;
            case "missing": return <XCircle className="w-4 h-4 text-rose-400" />;
        }
    };

    return (
        <main className="min-h-screen">
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-2xl md:text-3xl font-bold font-display text-white flex items-center gap-3">
                        <FileText className="w-8 h-8 text-primary-400" />
                        Resume <span className="gradient-text">Analyzer</span>
                    </h1>
                    <p className="text-dark-400 mt-2">Upload your resume and get AI-powered ATS analysis and improvement tips</p>
                </motion.div>

                <div className="mt-8">
                    <AnimatePresence mode="wait">
                        {/* Upload Step */}
                        {step === "upload" && (
                            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                                className="glass-card p-8 md:p-12"
                            >
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e); }}
                                    className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${dragOver ? "border-primary-500 bg-primary-500/5" : "border-white/10 hover:border-primary-500/50"
                                        }`}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,.txt"
                                        onChange={handleFile}
                                    />
                                    <Upload className="w-14 h-14 text-primary-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-white mb-2">Drop your resume here</h3>
                                    <p className="text-dark-400 text-sm mb-6">Supports PDF, DOC, DOCX, TXT (Max 5MB)</p>
                                    <button className="btn-primary inline-flex items-center gap-2">
                                        <Upload className="w-4 h-4" /> Choose File
                                    </button>
                                </div>
                                <div className="mt-6 text-center text-sm text-dark-500">
                                    <p>🔒 Your resume data is processed securely and never stored permanently</p>
                                </div>
                            </motion.div>
                        )}

                        {/* Analyzing Step */}
                        {step === "analyzing" && (
                            <motion.div key="analyzing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                                className="glass-card p-12 text-center"
                            >
                                <div className="loader mx-auto mb-6 !w-16 !h-16" />
                                <h3 className="text-xl font-semibold text-white mb-2">Analyzing Your Resume</h3>
                                <p className="text-dark-400 text-sm">Our AI is parsing skills, scoring ATS compatibility, and generating suggestions...</p>
                                <div className="mt-8 max-w-md mx-auto space-y-3">
                                    {["Extracting skills & keywords", "Checking ATS compatibility", "Generating improvement suggestions"].map((t, i) => (
                                        <motion.div key={t} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.8 }}
                                            className="flex items-center gap-3 text-sm text-dark-300"
                                        >
                                            <Sparkles className="w-4 h-4 text-primary-400 animate-pulse" /> {t}
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Result Step */}
                        {step === "result" && result && (
                            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                {/* Score Cards */}
                                <div className="grid md:grid-cols-3 gap-4">
                                    {[
                                        { label: "ATS Score", value: result.atsScore, icon: BarChart3, color: result.atsScore >= 70 ? "text-accent-emerald" : "text-accent-amber" },
                                        { label: "Keyword Match", value: result.keywordMatch, icon: Target, color: result.keywordMatch >= 70 ? "text-accent-emerald" : "text-accent-amber" },
                                        { label: "Skills Found", value: result.extractedSkills.length, icon: TrendingUp, color: "text-primary-400", noPercent: true },
                                    ].map(card => (
                                        <div key={card.label} className="glass-card p-6 text-center">
                                            <card.icon className={`w-8 h-8 ${card.color} mx-auto mb-2`} />
                                            <div className={`text-3xl font-bold font-display ${card.color}`}>
                                                {card.value}{'noPercent' in card ? '' : '%'}
                                            </div>
                                            <div className="text-sm text-dark-400 mt-1">{card.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Section Analysis */}
                                <div className="glass-card p-6">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-primary-400" /> Section Analysis
                                    </h3>
                                    <div className="space-y-3">
                                        {result.sections.map(s => (
                                            <div key={s.name} className="flex items-center gap-3 p-3 rounded-lg bg-dark-800/50">
                                                {getStatusIcon(s.status)}
                                                <span className="text-sm text-white font-medium flex-1">{s.name}</span>
                                                <span className="text-xs text-dark-400">{s.tip}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Extracted Skills */}
                                    <div className="glass-card p-6">
                                        <h3 className="text-lg font-semibold text-white mb-4">Skills Found</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {result.extractedSkills.map(s => <span key={s} className="tag-success">{s}</span>)}
                                        </div>
                                        <h4 className="text-sm font-semibold text-dark-300 mt-5 mb-3">Missing Keywords (Recommended)</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {result.missingKeywords.map(s => <span key={s} className="tag-danger">{s}</span>)}
                                        </div>
                                    </div>

                                    {/* Improvements */}
                                    <div className="glass-card p-6">
                                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                            <Lightbulb className="w-5 h-5 text-accent-amber" /> Improvement Tips
                                        </h3>
                                        <ul className="space-y-3">
                                            {result.improvements.map((tip, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-dark-300">
                                                    <ArrowRight className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                                                    {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* CTA */}
                                <div className="glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-white font-semibold">Want to improve your score?</h3>
                                        <p className="text-sm text-dark-400">Get a personalized learning roadmap to fill your skill gaps</p>
                                    </div>
                                    <a href="/skills" className="btn-primary flex items-center gap-2 whitespace-nowrap">
                                        View Skill Gap <ArrowRight className="w-4 h-4" />
                                    </a>
                                </div>

                                <button onClick={() => { setStep("upload"); setResult(null); }} className="btn-secondary w-full !py-3">
                                    Analyze Another Resume
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </main>
    );
}
