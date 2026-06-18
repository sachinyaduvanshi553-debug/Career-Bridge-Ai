"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Target, BookOpen, Briefcase, FileText, MessageSquare, ChevronRight, Sparkles, Zap, ArrowUpRight, Award } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

function CircularProgress({ value, size = 120, stroke = 8 }: { value: number; size?: number; stroke?: number }) {
    const radius = (size - stroke) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(99,102,241,0.1)" strokeWidth={stroke} fill="none" />
                <motion.circle
                    cx={size / 2} cy={size / 2} r={radius}
                    stroke="url(#scoreGrad)" strokeWidth={stroke} fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeDasharray={circumference}
                />
                <defs>
                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute text-center">
                <div className="text-3xl font-bold font-display text-white">{value}</div>
                <div className="text-xs text-dark-400">/ 100</div>
            </div>
        </div>
    );
}

export default function ProfessionalDashboard({ user }: { user: any }) {
    const [stats, setStats] = useState<{
        careerScore: number;
        recommendations: any[];
        skills: any[];
    }>({
        careerScore: 72,
        recommendations: [],
        skills: []
    });

    useEffect(() => {
        async function loadData() {
            try {
                const recommendations = await api.getRecommendations(user.skills || []);
                setStats({
                    careerScore: recommendations[0]?.match_score || 72,
                    recommendations: recommendations,
                    skills: (user.skills || []).map((s: string) => ({ name: s, level: 85 }))
                });
            } catch (err) {
                console.error(err);
            }
        }
        loadData();
    }, [user]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const cards = document.querySelectorAll('.glass-card-premium');
            cards.forEach((card) => {
                const rect = (card as HTMLElement).getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                (card as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
                (card as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    };

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 pb-12"
        >
            <motion.header variants={itemVariants} className="mb-8">
                <h1 className="text-4xl font-black text-white tracking-tight">
                    Hello, <span className="gradient-text">{user?.name}</span>
                </h1>
                <p className="text-dark-400 mt-2 text-lg">Track your professional growth and upcoming opportunities.</p>
            </motion.header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div variants={itemVariants} className="glass-card-premium p-8 flex flex-col items-center justify-center text-center group">
                            <div className="relative">
                                <CircularProgress value={stats.careerScore} size={160} stroke={10} />
                                <motion.div 
                                    className="absolute -inset-4 bg-primary-500/20 blur-2xl rounded-full -z-10"
                                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                />
                            </div>
                            <h3 className="mt-6 text-2xl font-bold text-white tracking-tight">Career Score</h3>
                            <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm font-bold bg-emerald-400/10 px-4 py-1.5 rounded-full border border-emerald-400/20">
                                <TrendingUp className="w-4 h-4" /> Improving Daily
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="glass-card-premium p-8 flex flex-col justify-between group">
                            <div className="relative">
                                <h3 className="text-2xl font-bold text-white flex items-center gap-3 mb-6 tracking-tight">
                                    <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center">
                                        <Sparkles className="w-6 h-6 text-accent-cyan" />
                                    </div>
                                    AI Insight
                                </h3>
                                <p className="text-dark-200 text-lg leading-relaxed font-medium italic">
                                    "Your profile shows strong alignment with <span className="text-primary-400 font-bold">{stats.recommendations[0]?.title || 'Emerging'}</span> roles. We recommend focusing on <span className="text-accent-purple font-bold">{stats.recommendations[0]?.missing_skills?.[0] || 'advanced certifications'}</span> to boost your score to 90+."
                                </p>
                            </div>
                            <button className="btn-secondary w-full mt-8 group flex items-center justify-center gap-2 py-4">
                                View Action Plan <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    </section>

                    <motion.section variants={itemVariants}>
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 tracking-tight">
                             <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center border border-primary-500/20">
                                <Target className="w-6 h-6 text-primary-400" />
                             </div>
                             Personalized Matches
                        </h2>
                        <div className="grid gap-4">
                            {stats.recommendations.map((career, i) => (
                                <motion.div 
                                    key={i} 
                                    whileHover={{ x: 8, backgroundColor: "rgba(255,255,255,0.05)" }}
                                    className="glass-card-premium p-5 flex items-center justify-between group cursor-pointer border-white/5"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-400 font-black text-lg border border-primary-500/20 group-hover:bg-primary-500/20 transition-colors">
                                            {Math.round(career.match_score)}%
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-lg group-hover:text-primary-400 transition-colors">{career.title}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs font-bold text-dark-400 uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded">{career.category}</span>
                                                <span className="w-1 h-1 rounded-full bg-dark-600"></span>
                                                <span className="text-xs font-medium text-dark-500">High Demand</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary-500/20 transition-all border border-white/10">
                                        <ArrowUpRight className="w-5 h-5 text-dark-400 group-hover:text-primary-400" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>
                </div>

                <div className="space-y-8">
                     <motion.section variants={itemVariants} className="glass-card-premium p-8 border-white/5">
                        <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3 tracking-tight">
                            <div className="w-10 h-10 rounded-xl bg-accent-amber/10 flex items-center justify-center border border-accent-amber/20">
                                <Zap className="w-6 h-6 text-accent-amber" />
                            </div>
                            Quick Actions
                        </h3>
                        <div className="grid gap-4">
                            <Link href="/resume" className="group">
                                <motion.div 
                                    whileHover={{ x: 4 }}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary-500/30 hover:bg-primary-500/5 transition-all"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-primary-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <FileText className="w-6 h-6 text-primary-400" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">Analyze Resume</div>
                                        <div className="text-xs text-dark-400 mt-0.5">Score: 84% Optimizable</div>
                                    </div>
                                </motion.div>
                            </Link>
                            <Link href="/roadmap" className="group">
                                <motion.div 
                                    whileHover={{ x: 4 }}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-accent-purple/30 hover:bg-accent-purple/5 transition-all"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-accent-purple/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <BookOpen className="w-6 h-6 text-accent-purple" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">Learning Roadmap</div>
                                        <div className="text-xs text-dark-400 mt-0.5">3 paths in progress</div>
                                    </div>
                                </motion.div>
                            </Link>
                        </div>
                    </motion.section>

                    <motion.div 
                        variants={itemVariants} 
                        className="glass-card-premium p-8 relative overflow-hidden group bg-gradient-to-br from-primary-500/20 to-accent-purple/20 border-primary-500/20"
                    >
                        <div className="relative z-10">
                            <Award className="w-12 h-12 text-primary-400 mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Premium Member</h3>
                            <p className="text-dark-300 text-sm font-medium">Enjoy unlimited AI credits and priority career analysis.</p>
                        </div>
                        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-primary-500/10 blur-3xl rounded-full" />
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
