"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import { useNotify } from "@/components/NotificationProvider";
import { FileText, Sparkles, Copy, Send, LayoutDashboard, Loader2 } from "lucide-react";
import Link from "next/link";

export default function CoverLetterPage() {
    const notify = useNotify();
    const [targetRole, setTargetRole] = useState("");
    const [jobDesc, setJobDesc] = useState("");
    const [coverLetter, setCoverLetter] = useState("");
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!targetRole.trim()) {
            notify("error", "Missing Target Role", "Please enter the job title you are applying for.");
            return;
        }

        setLoading(true);
        try {
            const data = await api.generateCoverLetter({
                target_role: targetRole,
                job_description: jobDesc
            });
            
            // Clean up Gemini markdown if any
            let cleanLetter = data.cover_letter.replace(/^```[a-z]*\n?/gm, '').replace(/```$/gm, '');
            setCoverLetter(cleanLetter.trim());
            notify("success", "Cover Letter Generated!", "Your personalized cover letter is ready.");
        } catch (error: any) {
            console.error(error);
            notify("error", "Generation Failed", error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!coverLetter) return;
        navigator.clipboard.writeText(coverLetter);
        notify("success", "Copied", "Cover letter copied to clipboard!");
    };

    return (
        <main className="min-h-screen">
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
                
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold font-display text-white flex items-center gap-3">
                            <FileText className="w-8 h-8 text-secondary-400" />
                            AI Cover Letter <span className="gradient-text-alt">Generator</span>
                        </h1>
                        <p className="text-dark-400 mt-2">Generate instantly customized cover letters based on your profile.</p>
                    </div>
                    <Link href="/dashboard" className="btn-secondary hidden sm:flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" /> Back to Dashboard
                    </Link>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Input Form */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                        className="glass-card p-6 space-y-5"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-5 h-5 text-accent-cyan" />
                            <h3 className="text-lg font-bold text-white">Target Job Details</h3>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-1.5 block">
                                Job Title <span className="text-red-400">*</span>
                            </label>
                            <input
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                placeholder="e.g. Senior Frontend Developer"
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-1.5 block flex items-center justify-between">
                                Job Description (Optional)
                                <span className="text-[10px] text-dark-500 font-normal normal-case tracking-normal">Paste description for better matches</span>
                            </label>
                            <textarea
                                value={jobDesc}
                                onChange={(e) => setJobDesc(e.target.value)}
                                placeholder="Paste the exact job description here..."
                                rows={8}
                                className="input-field resize-none"
                            />
                        </div>

                        <div className="pt-2">
                            <button 
                                onClick={handleGenerate}
                                disabled={loading || !targetRole.trim()}
                                className="btn-primary w-full !py-3 flex items-center justify-center gap-2 group disabled:opacity-50"
                            >
                                {loading ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Generating AI Letter...</>
                                ) : (
                                    <><Send className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" /> Generate Cover Letter</>
                                )}
                            </button>
                            <p className="text-center text-[10px] text-dark-500 mt-3">
                                Powered by Google Gemini. This tool combines your Profile Skills & Bio with the required Job Traits.
                            </p>
                        </div>
                    </motion.div>

                    {/* Right: Output */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                        className="glass-card p-6 flex flex-col h-full min-h-[500px]"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">Generated Letter</h3>
                            {coverLetter && (
                                <button onClick={handleCopy} className="btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-2">
                                    <Copy className="w-3 h-3 text-primary-400" /> Copy Text
                                </button>
                            )}
                        </div>
                        
                        <div className="flex-1 bg-dark-900/50 border border-white/5 rounded-xl p-6 overflow-y-auto w-full font-serif text-dark-200 leading-relaxed text-sm whitespace-pre-wrap">
                            {coverLetter ? (
                                coverLetter
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-50 space-y-4">
                                    <FileText className="w-16 h-16 text-dark-500" />
                                    <p className="text-center max-w-[250px]">Your perfectly crafted cover letter will appear here.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

            </div>
        </main>
    );
}
