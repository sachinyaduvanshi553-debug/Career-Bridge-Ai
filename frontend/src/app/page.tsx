"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
    Sparkles, Target, Map, Briefcase, MessageSquare, BarChart3,
    FileText, ChevronRight, ArrowRight, Users, BookOpen, TrendingUp,
    Zap, Globe, Award, Shield, CheckCircle2
} from "lucide-react";

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" }
    }),
};

const FEATURES = [
    { icon: Target, title: "Skill Gap Analysis", desc: "AI-powered detection of missing skills with visual radar charts and personalized insights.", color: "from-primary-500 to-primary-700" },
    { icon: Map, title: "Learning Roadmap", desc: "Personalized 30-60-90 day upskilling plans with free & affordable course links.", color: "from-accent-purple to-pink-600" },
    { icon: FileText, title: "Resume Analyzer", desc: "ATS score, keyword match, and AI-driven improvement suggestions.", color: "from-accent-cyan to-blue-600" },
    { icon: Briefcase, title: "Job Matching", desc: "Region-based real job listings matched to your skills and aspirations.", color: "from-accent-emerald to-green-700" },
    { icon: MessageSquare, title: "Mock Interview AI", desc: "Practice interviews with AI-generated questions and instant feedback.", color: "from-accent-amber to-orange-600" },
    { icon: BarChart3, title: "Gov Analytics", desc: "District-wise skill gap maps and training-to-placement dashboards.", color: "from-rose-500 to-red-700" },
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
    return (
        <main className="relative">
            <Navbar />

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Background effects */}
                <div className="absolute inset-0 bg-hero-glow" />
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary-500/10 rounded-full blur-[128px] animate-pulse-slow" />
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent-purple/10 rounded-full blur-[128px] animate-pulse-slow" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-primary-500/5 rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] border border-primary-500/5 rounded-full" />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-16">
                    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8"
                    >
                        <Sparkles className="w-4 h-4" /> Aligned with Skill India & Digital India Missions
                    </motion.div>

                    <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1}
                        className="text-4xl sm:text-5xl md:text-7xl font-bold font-display leading-tight"
                    >
                        Your AI-Powered
                        <br />
                        <span className="gradient-text">Career GPS</span> for Bharat
                    </motion.h1>

                    <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2}
                        className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
                    >
                        Detect skill gaps, get personalized learning roadmaps, and connect with real
                        job opportunities — all powered by AI. From blue-collar workers to tech professionals.
                    </motion.p>

                    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}
                        className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link href="/register" className="btn-primary text-base !px-8 !py-4 flex items-center gap-2 group">
                            Start Free Analysis
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link href="/analytics" className="btn-secondary text-base !px-8 !py-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            View Analytics Demo
                        </Link>
                    </motion.div>

                    {/* Stats Row */}
                    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}
                        className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
                    >
                        {STATS.map((stat) => (
                            <div key={stat.label} className="glass-card p-5 text-center group hover:border-primary/30 transition-all duration-300">
                                <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                                <div className="text-2xl md:text-3xl font-bold font-display text-foreground">{stat.value}</div>
                                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-500/[0.02] to-transparent" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} className="text-center mb-16"
                    >
                        <h2 className="section-heading text-foreground">
                            Everything You Need to <span className="gradient-text">Build Your Career</span>
                        </h2>
                        <p className="section-subheading mx-auto">
                            Six powerful AI modules working together to transform your career trajectory
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {FEATURES.map((feat, i) => (
                            <motion.div key={feat.title}
                                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                                className="glass-card-hover p-6 group"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                    <feat.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">{feat.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">{feat.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} className="text-center mb-16"
                    >
                        <h2 className="section-heading text-foreground">
                            How <span className="gradient-text-cyan">Career Bridge AI</span> Works
                        </h2>
                        <p className="section-subheading mx-auto">
                            From profile creation to job placement in 4 simple steps
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-4 gap-8 relative">
                        {/* Connection line */}
                        <div className="hidden md:block absolute top-16 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-primary-500/50 via-accent-purple/50 to-accent-cyan/50" />

                        {[
                            { step: "01", title: "Create Profile", desc: "Enter your education, skills, interests, and career goals", icon: Users },
                            { step: "02", title: "AI Analysis", desc: "Our AI engine maps your skills against industry demand", icon: Sparkles },
                            { step: "03", title: "Get Roadmap", desc: "Receive personalized learning paths with free courses", icon: Map },
                            { step: "04", title: "Land Your Job", desc: "Connect with matching jobs in your region", icon: Briefcase },
                        ].map((item, i) => (
                            <motion.div key={item.step}
                                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                                className="text-center relative"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto mb-4 relative z-10">
                                    <item.icon className="w-7 h-7 text-primary" />
                                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                                        {item.step}
                                    </div>
                                </div>
                                <h3 className="text-foreground font-semibold mb-2">{item.title}</h3>
                                <p className="text-muted-foreground text-sm">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission Alignment */}
            <section className="py-24 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-purple/[0.02] to-transparent" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} className="text-center mb-16"
                    >
                        <h2 className="section-heading text-foreground">
                            Aligned with India&apos;s <span className="gradient-text">National Missions</span>
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {MISSIONS.map((m, i) => (
                            <motion.div key={m.title}
                                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                                className="glass-card p-8 text-center group hover:border-primary-500/30 transition-all duration-300"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                                    <m.icon className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">{m.title}</h3>
                                <p className="text-muted-foreground text-sm">{m.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Impact Section */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="glass-card p-8 md:p-12 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px]" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-purple/10 rounded-full blur-[80px]" />

                        <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
                            <div>
                                <h2 className="section-heading text-foreground mb-6">
                                    Transforming India&apos;s Workforce,
                                    <span className="gradient-text"> One Skill at a Time</span>
                                </h2>
                                <ul className="space-y-4">
                                    {[
                                        "Reduces random course enrollment with demand-based guidance",
                                        "Helps rural youth choose high-demand careers",
                                        "Assists blue-collar workers with digital upskilling",
                                        "Enables government workforce planning with real data",
                                        "Bridges the skill gap between education and employment",
                                    ].map((item) => (
                                        <li key={item} className="flex items-start gap-3 text-muted-foreground">
                                            <CheckCircle2 className="w-5 h-5 text-accent-emerald flex-shrink-0 mt-0.5" />
                                            <span className="text-sm">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { value: "73%", label: "Placement Rate Improvement" },
                                    { value: "45%", label: "Skill Gap Reduction" },
                                    { value: "2.5x", label: "Faster Career Progression" },
                                    { value: "60%", label: "Cost Savings on Training" },
                                ].map((s) => (
                                    <div key={s.label} className="glass-card p-5 text-center">
                                        <div className="text-2xl font-bold gradient-text">{s.value}</div>
                                        <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-3xl mx-auto px-4"
                >
                    <h2 className="section-heading text-foreground mb-4">
                        Ready to <span className="gradient-text">Bridge Your Skills</span>?
                    </h2>
                    <p className="text-muted-foreground text-lg mb-8">
                        Join thousands of Indians building demand-driven careers with AI guidance.
                    </p>
                    <Link href="/register" className="btn-primary text-lg !px-10 !py-4 inline-flex items-center gap-2 group">
                        Get Started — It&apos;s Free
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border/40 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-bold font-display text-foreground">Career Bridge AI</span>
                            </div>
                            <p className="text-sm text-muted-foreground">AI-powered career guidance for every Indian citizen. Skill India aligned.</p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-3 text-sm">Platform</h4>
                            <ul className="space-y-2 text-sm text-dark-400">
                                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                                <li><Link href="/resume" className="hover:text-white transition-colors">Resume Analyzer</Link></li>
                                <li><Link href="/skills" className="hover:text-white transition-colors">Skill Gap Analysis</Link></li>
                                <li><Link href="/jobs" className="hover:text-white transition-colors">Job Explorer</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-3 text-sm">Resources</h4>
                            <ul className="space-y-2 text-sm text-dark-400">
                                <li><Link href="/roadmap" className="hover:text-white transition-colors">Learning Roadmap</Link></li>
                                <li><Link href="/interview" className="hover:text-white transition-colors">Mock Interviews</Link></li>
                                <li><Link href="/analytics" className="hover:text-white transition-colors">Workforce Analytics</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-3 text-sm">Aligned With</h4>
                            <ul className="space-y-2 text-sm text-dark-400">
                                <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Skill India Mission</li>
                                <li className="flex items-center gap-2"><Globe className="w-4 h-4 text-primary" /> Digital India</li>
                                <li className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Employment Mission</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-border/40 mt-8 pt-8 text-center text-sm text-muted-foreground/60">
                        © 2026 CAREER BRIDGE - AI. Built for India, by India. 🇮🇳
                    </div>
                </div>
            </footer>
        </main>
    );
}
