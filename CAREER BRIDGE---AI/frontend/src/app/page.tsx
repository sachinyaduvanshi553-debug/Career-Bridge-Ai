"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
    Sparkles, Target, Map, Briefcase, MessageSquare, BarChart3,
    FileText, ChevronRight, ArrowRight, Users, BookOpen, TrendingUp,
    Zap, Globe, Award, Shield, CheckCircle2
} from "lucide-react";

const fadeUp = {
    hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
    visible: (i: number) => ({
        opacity: 1, y: 0, filter: "blur(0px)",
        transition: { delay: i * 0.15, duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }
    }),
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
};

const FEATURES = [
    { icon: Target, title: "Skill Gap Analysis", desc: "AI-powered detection of missing skills with visual radar charts and personalized insights.", color: "from-primary-500 to-indigo-600" },
    { icon: Map, title: "Learning Roadmap", desc: "Personalized 30-60-90 day upskilling plans with free & affordable course links.", color: "from-accent-purple to-fuchsia-600" },
    { icon: FileText, title: "Resume Analyzer", desc: "ATS score, keyword match, and AI-driven improvement suggestions.", color: "from-accent-cyan to-blue-500" },
    { icon: Briefcase, title: "Job Matching", desc: "Region-based real job listings matched to your skills and aspirations.", color: "from-accent-emerald to-teal-600" },
    { icon: MessageSquare, title: "Mock Interview AI", desc: "Practice interviews with AI-generated questions and instant feedback.", color: "from-accent-amber to-orange-500" },
    { icon: BarChart3, title: "Gov Analytics", desc: "District-wise skill gap maps and training-to-placement dashboards.", color: "from-rose-500 to-pink-600" },
];

const STATS = [
    { label: "Skills Tracked", value: "500+", icon: Zap },
    { label: "Career Paths", value: "100+", icon: TrendingUp },
    { label: "Districts Covered", value: "50+", icon: Globe },
    { label: "Courses Mapped", value: "200+", icon: BookOpen },
];

const MISSIONS = [
    { title: "Skill India Mission", desc: "Mapping workforce capabilities to industry demand using AI", icon: Award },
    { title: "Digital India", desc: "Digitizing skill development and career guidance for every citizen", icon: Globe },
    { title: "Employment Mission", desc: "Reducing unemployment through data-driven skill matching", icon: Users },
];

export default function LandingPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, -500]);
    const rotate = useTransform(scrollYProgress, [0, 1], [0, 45]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const cards = document.getElementsByClassName("glass-card-premium");
            for (const card of cards as any) {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty("--mouse-x", `${x}px`);
                card.style.setProperty("--mouse-y", `${y}px`);
            }
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <main ref={containerRef} className="relative bg-dark-950">
            <Navbar />

            {/* Hero Section */}
            <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden py-24">
                {/* Background Decor */}
                <div className="absolute inset-0 z-0">
                    <motion.div style={{ y: y1, rotate }} className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px]" />
                    <motion.div style={{ y: y2, rotate: -rotate }} className="absolute bottom-1/4 -right-32 w-[600px] h-[600px] bg-accent-purple/10 rounded-full blur-[120px]" />
                    <div className="absolute inset-0 bg-grid opacity-20" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-12">
                    <motion.div 
                        initial="hidden" animate="visible" variants={fadeUp} custom={0}
                        className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-primary-300 text-sm font-bold mb-10 backdrop-blur-md shadow-2xl"
                    >
                        <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        >
                            <Sparkles className="w-5 h-5" />
                        </motion.div>
                        Aligned with Skill India & Digital India Missions
                    </motion.div>

                    <motion.h1 
                        initial="hidden" animate="visible" variants={fadeUp} custom={1}
                        className="text-5xl sm:text-7xl md:text-8xl font-black font-display tracking-tight leading-[1.1]"
                    >
                        Your AI-Powered
                        <br />
                        <span className="gradient-text h-[1.2em] inline-block">Career GPS</span> For Bharat
                    </motion.h1>

                    <motion.p 
                        initial="hidden" animate="visible" variants={fadeUp} custom={2}
                        className="mt-8 text-xl sm:text-2xl text-dark-400 max-w-3xl mx-auto leading-relaxed font-medium"
                    >
                        Detect skill gaps, get personalized learning roadmaps, and connect with real
                        job opportunities — all optimized for India&apos;s dynamic job market.
                    </motion.p>

                    <motion.div 
                        initial="hidden" animate="visible" variants={fadeUp} custom={3}
                        className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6"
                    >
                        <Link href="/register" className="btn-primary group !px-10 !py-5 text-lg">
                            Start AI Skills Analysis
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        </Link>
                        <Link href="/analytics" className="btn-secondary group !px-10 !py-5 text-lg flex items-center gap-3">
                            <BarChart3 className="w-6 h-6 group-hover:text-primary-400 transition-colors" />
                            Workforce Insights
                        </Link>
                    </motion.div>

                    {/* Stats Grid */}
                    <motion.div 
                        variants={staggerContainer} initial="hidden" animate="visible"
                        className="mt-24 grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto"
                    >
                        {STATS.map((stat, i) => (
                            <motion.div 
                                key={stat.label} 
                                variants={fadeUp} custom={4 + i}
                                className="glass-card-premium p-8 group"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-500/20 transition-all duration-500 scale-110">
                                    <stat.icon className="w-6 h-6 text-primary-400" />
                                </div>
                                <div className="text-3xl md:text-4xl font-black font-display text-white mb-1">{stat.value}</div>
                                <div className="text-sm font-bold uppercase tracking-widest text-dark-500 group-hover:text-dark-300 transition-colors">{stat.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-32 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }} transition={{ duration: 0.8 }}
                        className="text-center mb-20"
                    >
                        <h2 className="section-heading text-white">
                            Universal Career <span className="gradient-text-cyan">Intelligence</span>
                        </h2>
                        <p className="section-subheading mx-auto">
                            Six specialized AI engines working in harmony to power your professional growth
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {FEATURES.map((feat, i) => (
                            <motion.div 
                                key={feat.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.6 }}
                                whileHover={{ y: -10 }}
                                className="glass-card-premium p-8 group border-white/5 hover:border-white/10"
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feat.color} flex items-center justify-center mb-6 shadow-xl group-hover:rotate-6 transition-transform duration-500`}>
                                    <feat.icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3 group-hover:gradient-text transition-all duration-300">{feat.title}</h3>
                                <p className="text-dark-400 text-base leading-relaxed font-medium">{feat.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Steps Section */}
            <section className="py-32 bg-dark-900/40 relative border-y border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-24">
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                            className="section-heading text-white"
                        >
                            The Road to <span className="gradient-text">Success</span>
                        </motion.h2>
                    </div>

                    <div className="grid md:grid-cols-4 gap-12 relative">
                        {/* Connection Flow Line */}
                        <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-primary-500/20 via-accent-purple/50 to-accent-cyan/20" />

                        {[
                            { step: "01", title: "Build Profile", desc: "AI maps your academic & professional background", icon: Users },
                            { step: "02", title: "Gap Analysis", desc: "Identify critical skill deficits for your target roles", icon: Target },
                            { step: "03", title: "Smart Roadmap", desc: "Dynamic learning paths with curated resources", icon: Map },
                            { step: "04", title: "Placement", desc: "Direct connection with verified job opportunities", icon: Award },
                        ].map((item, i) => (
                            <motion.div 
                                key={item.step}
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="relative text-center group"
                            >
                                <motion.div 
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="w-28 h-28 rounded-[2rem] bg-dark-800 border-2 border-white/5 flex items-center justify-center mx-auto mb-8 relative z-10 group-hover:border-primary-500/30 transition-all duration-500 shadow-2xl"
                                >
                                    <item.icon className="w-10 h-10 text-white transition-transform duration-500 group-hover:scale-110" />
                                    <div className="absolute -top-3 -right-3 w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 text-white text-sm font-black flex items-center justify-center shadow-lg">
                                        {item.step}
                                    </div>
                                </motion.div>
                                <h3 className="text-xl font-bold text-white mb-4 italic group-hover:text-primary-400 transition-colors uppercase tracking-widest">{item.title}</h3>
                                <p className="text-dark-400 text-sm font-semibold max-w-[200px] mx-auto leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats/National Mission section */}
            <section className="py-32 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <motion.div 
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="section-heading text-white mb-8">
                                Transforming Bharat&apos;s 
                                <span className="gradient-text"> Digital Workforce</span>
                            </h2>
                            <p className="text-xl text-dark-400 mb-10 font-medium leading-relaxed">
                                Our platform leverages high-frequency labor market data and generative AI to create a truly inclusive career ecosystem.
                            </p>
                            <div className="space-y-6">
                                {[
                                    { title: "Skill India Aligned", desc: "Curriculums mapped to national NSCF standards", icon: Shield },
                                    { title: "Vernacular Support", desc: "Guidance available in regional languages", icon: Globe },
                                    { title: "Rural Reach", desc: "Optimized for low-bandwidth environments", icon: Zap },
                                ].map((item, i) => (
                                    <motion.div 
                                        key={item.title}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-start gap-5 p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0">
                                            <item.icon className="w-6 h-6 text-primary-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold mb-1">{item.title}</h4>
                                            <p className="text-dark-400 text-sm font-medium">{item.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="absolute -inset-4 bg-gradient-to-br from-primary-500/20 to-accent-purple/20 rounded-3xl blur-2xl" />
                            <div className="glass-card-premium p-10 relative z-10 grid grid-cols-2 gap-8 border-white/10">
                                {[
                                    { value: "73%", label: "Placement Increase", color: "from-primary-400 to-primary-600" },
                                    { value: "45%", label: "Skill-Gap Reduction", color: "from-accent-cyan to-blue-500" },
                                    { value: "2.5x", label: "Salary Growth", color: "from-accent-purple to-fuchsia-600" },
                                    { value: "60%", label: "Training Efficiency", color: "from-accent-emerald to-green-500" },
                                ].map((impact) => (
                                    <div key={impact.label} className="text-center">
                                        <div className={`text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br ${impact.color} mb-2 tracking-tighter`}>{impact.value}</div>
                                        <div className="text-xs font-black uppercase tracking-[0.2em] text-dark-500 leading-tight">{impact.label}</div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-40 text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/10 rounded-full blur-[160px] z-0" />
                <div className="relative z-10 max-w-4xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-5xl md:text-7xl font-black text-white mb-10 tracking-tight">
                            Build Your <span className="gradient-text">Dream Career</span> Today
                        </h2>
                        <Link href="/register" className="btn-primary !px-12 !py-6 text-xl shadow-2xl shadow-primary-500/40 hover:shadow-primary-500/60 inline-flex items-center gap-3">
                            Join CAREER BRIDGE AI
                            <ChevronRight className="w-6 h-6" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-20 bg-dark-950/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-16">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-xl object-contain bg-white/5 p-1.5 border border-white/10" />
                                <span className="text-2xl font-black font-display text-white tracking-tighter">CAREER BRIDGE</span>
                            </div>
                            <p className="text-dark-400 font-medium leading-relaxed">
                                Defining the future of skill development through advanced AI and data-driven insights. 
                                Aligned with India&apos;s National Career Service.
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="text-white font-bold mb-8 text-lg uppercase tracking-widest">Platform</h4>
                            <ul className="space-y-4 text-dark-400 font-semibold">
                                <li><Link href="/dashboard" className="hover:text-primary-400 transition-colors">Career Hub</Link></li>
                                <li><Link href="/resume" className="hover:text-primary-400 transition-colors">AI Resume Engine</Link></li>
                                <li><Link href="/skills" className="hover:text-primary-400 transition-colors">Gap Analytics</Link></li>
                                <li><Link href="/jobs" className="hover:text-primary-400 transition-colors">Opportunity Portal</Link></li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="text-white font-bold mb-8 text-lg uppercase tracking-widest">Support</h4>
                            <ul className="space-y-4 text-dark-400 font-semibold">
                                <li><Link href="/roadmap" className="hover:text-primary-400 transition-colors">Skill Pathways</Link></li>
                                <li><Link href="/interview" className="hover:text-primary-400 transition-colors">AI Mock Coaching</Link></li>
                                <li><Link href="/analytics" className="hover:text-primary-400 transition-colors">Impact Data</Link></li>
                                <li><Link href="/contact" className="hover:text-primary-400 transition-colors">Contact Expert</Link></li>
                            </ul>
                        </div>
                        
                        <div className="glass-card-premium p-8 border-white/10">
                            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-widest">Stay Updated</h4>
                            <p className="text-dark-500 text-xs font-bold mb-4">Subscribe for the latest career trends and upskilling opportunities.</p>
                            <div className="flex gap-2">
                                <input type="email" placeholder="Email" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs w-full focus:outline-none focus:border-primary-500/50" />
                                <button className="bg-primary-500 hover:bg-primary-600 text-white rounded-lg px-3 py-2 transition-colors">
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="border-t border-white/5 mt-20 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-dark-500 text-sm font-bold">
                            © 2026 CAREER BRIDGE - AI. All rights reserved. 🇮🇳
                        </div>
                        <div className="flex gap-8 text-dark-500 text-sm font-bold">
                            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                            <Link href="/accessibility" className="hover:text-white transition-colors">Accessibility</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </main>
    );
}

