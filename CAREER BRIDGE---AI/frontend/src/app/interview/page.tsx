"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { INTERVIEW_QUESTIONS, JOB_ROLES } from "@/lib/data";
import {
    MessageSquare, ChevronDown, Play, Send, RotateCcw, CheckCircle2,
    Sparkles, Award, Target, ArrowRight, Mic, User, Bot
} from "lucide-react";

interface Message {
    role: "ai" | "user";
    content: string;
    feedback?: string;
    score?: number;
}

import { api } from "@/lib/api";

export default function InterviewPage() {
    const [selectedRole, setSelectedRole] = useState("");
    const [started, setStarted] = useState(false);
    const [currentQ, setCurrentQ] = useState(0);
    const [answer, setAnswer] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [evaluating, setEvaluating] = useState(false);
    const [finished, setFinished] = useState(false);
    const [questions, setQuestions] = useState<string[]>([]);

    const handleStart = async () => {
        if (!selectedRole) return;
        setStarted(true);
        try {
            const qs = await api.startInterview(selectedRole);
            setQuestions(qs);
            setCurrentQ(0);
            setMessages([{
                role: "ai",
                content: `Welcome! I'm your AI interviewer. Let's get started with your ${JOB_ROLES.find(r => r.id === selectedRole)?.title} interview. I'll ask you ${qs.length} questions.\n\n**Question 1:** ${qs[0]}`,
            }]);
        } catch (error) {
            console.error("Failed to start interview:", error);
            setStarted(false);
        }
    };

    const handleSubmit = async () => {
        if (!answer.trim()) return;
        const userMsg: Message = { role: "user", content: answer };
        setMessages(prev => [...prev, userMsg]);
        setAnswer("");
        setEvaluating(true);

        try {
            const evaluation = await api.evaluateAnswer(questions[currentQ], userMsg.content);
            const score = evaluation.score;
            const feedback = evaluation.feedback;

            const aiMsg: Message = { role: "ai", content: feedback, score };

            if (currentQ < questions.length - 1) {
                const nextQ = questions[currentQ + 1];
                aiMsg.content += `\n\n**Question ${currentQ + 2}:** ${nextQ}`;
                setCurrentQ(prev => prev + 1);
            } else {
                aiMsg.content += "\n\n🎉 **Interview Complete!** Here's your overall performance summary.";
                setFinished(true);
            }

            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error("Evaluation failed:", error);
        } finally {
            setEvaluating(false);
        }
    };

    const handleReset = () => {
        setStarted(false);
        setCurrentQ(0);
        setAnswer("");
        setMessages([]);
        setFinished(false);
        setSelectedRole("");
    };

    const avgScore = messages.filter(m => m.score).reduce((sum, m) => sum + (m.score || 0), 0) / (messages.filter(m => m.score).length || 1);

    return (
        <main className="min-h-screen">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-2xl md:text-3xl font-bold font-display text-white flex items-center gap-3">
                        <MessageSquare className="w-8 h-8 text-accent-amber" />
                        Mock Interview <span className="gradient-text">AI</span>
                    </h1>
                    <p className="text-dark-400 mt-2">Practice with AI-generated interview questions and get instant feedback</p>
                </motion.div>

                {!started ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="glass-card p-8 mt-8"
                    >
                        <div className="text-center max-w-md mx-auto">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-amber/20 to-orange-500/20 border border-accent-amber/20 flex items-center justify-center mx-auto mb-6">
                                <Mic className="w-10 h-10 text-accent-amber" />
                            </div>
                            <h2 className="text-xl font-semibold text-white mb-2">Start a Mock Interview</h2>
                            <p className="text-dark-400 text-sm mb-6">Select your target role and answer AI-generated questions. Get scored and feedback instantly.</p>

                            <div className="relative mb-4">
                                <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}
                                    className="input-field appearance-none pr-10 text-center"
                                >
                                    <option value="">Choose interview role...</option>
                                    {JOB_ROLES.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500 pointer-events-none" />
                            </div>

                            <button onClick={handleStart} disabled={!selectedRole}
                                className="btn-primary w-full flex items-center justify-center gap-2 !py-3.5 disabled:opacity-50"
                            >
                                <Play className="w-5 h-5" /> Begin Interview
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="mt-8 space-y-4">
                        {/* Chat Messages */}
                        <div className="glass-card p-6 max-h-[500px] overflow-y-auto space-y-4">
                            {messages.map((msg, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.role === "ai" ? "bg-primary-500/20" : "bg-accent-emerald/20"
                                        }`}>
                                        {msg.role === "ai" ? <Bot className="w-4 h-4 text-primary-400" /> : <User className="w-4 h-4 text-accent-emerald" />}
                                    </div>
                                    <div className={`max-w-[80%] p-4 rounded-xl text-sm leading-relaxed ${msg.role === "ai"
                                        ? "bg-dark-800/80 text-dark-200 border border-white/5"
                                        : "bg-primary-500/10 text-dark-200 border border-primary-500/20"
                                        }`}>
                                        {msg.content.split('\n').map((line, j) => (
                                            <p key={j} className={j > 0 ? "mt-2" : ""}>
                                                {line.includes('**') ?
                                                    line.split('**').map((part, k) =>
                                                        k % 2 === 1 ? <strong key={k} className="text-white">{part}</strong> : part
                                                    ) : line}
                                            </p>
                                        ))}
                                        {msg.score && (
                                            <div className={`mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${msg.score >= 80 ? "bg-emerald-500/10 text-emerald-400" :
                                                msg.score >= 60 ? "bg-amber-500/10 text-amber-400" :
                                                    "bg-rose-500/10 text-rose-400"
                                                }`}>
                                                <Award className="w-3 h-3" /> {msg.score}/100
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            {evaluating && (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center">
                                        <Bot className="w-4 h-4 text-primary-400" />
                                    </div>
                                    <div className="bg-dark-800/80 border border-white/5 p-4 rounded-xl">
                                        <div className="flex items-center gap-2 text-sm text-dark-400">
                                            <Sparkles className="w-4 h-4 animate-pulse text-primary-400" /> Evaluating your answer...
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input / Finished */}
                        {!finished ? (
                            <div className="flex gap-3">
                                <textarea
                                    value={answer} onChange={(e) => setAnswer(e.target.value)}
                                    placeholder="Type your answer here..."
                                    rows={3}
                                    className="input-field flex-1 resize-none"
                                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                                />
                                <button onClick={handleSubmit} disabled={!answer.trim() || evaluating}
                                    className="btn-primary !px-4 self-end disabled:opacity-50"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="glass-card p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <Award className="w-5 h-5 text-accent-amber" /> Interview Summary
                                    </h3>
                                    <div className={`text-2xl font-bold ${avgScore >= 80 ? "text-accent-emerald" : avgScore >= 60 ? "text-accent-amber" : "text-rose-400"}`}>
                                        {Math.round(avgScore)}/100
                                    </div>
                                </div>
                                <p className="text-sm text-dark-400 mb-4">
                                    {avgScore >= 80 ? "Outstanding performance! You're well-prepared for this role." :
                                        avgScore >= 60 ? "Good effort! Practice the areas with lower scores to improve." :
                                            "Keep practicing! Review the sample answers and try again."}
                                </p>
                                <div className="flex gap-3">
                                    <button onClick={handleReset} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                                        <RotateCcw className="w-4 h-4" /> Try Again
                                    </button>
                                    <a href="/roadmap" className="btn-primary flex-1 flex items-center justify-center gap-2">
                                        <Target className="w-4 h-4" /> Improve Skills
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
