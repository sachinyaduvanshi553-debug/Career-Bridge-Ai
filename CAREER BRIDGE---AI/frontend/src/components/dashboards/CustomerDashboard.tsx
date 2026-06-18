"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Star, Plus, Clock, CheckCircle2, ChevronRight, Sparkles, MessageSquare } from "lucide-react";
import { api } from "@/lib/api";

export default function CustomerDashboard({ user }: { user: any }) {
    const [workers, setWorkers] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function loadData() {
            try {
                const [reqs, s] = await Promise.all([
                    api.getCustomerRequests(),
                    api.getCustomerStats()
                ]);
                setRequests(reqs);
                setStats(s);
            } catch (err) { console.error(err); }
        }
        loadData();
    }, []);

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

    const handleSearch = async () => {
        setLoading(true);
        try {
            const data = await api.discoverServices(search);
            setWorkers(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

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
            <motion.header variants={itemVariants} className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                        <span className="gradient-text">Customer Portal</span>
                        <span className="text-dark-600">/</span>
                        <span className="text-2xl font-bold italic opacity-50 uppercase tracking-widest">{user.name}</span>
                    </h1>
                    <p className="text-dark-400 mt-2 text-lg font-medium">Find skilled professionals for all your home and business needs.</p>
                </div>
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary flex items-center gap-3 shadow-2xl shadow-primary-500/20 px-8"
                >
                    <Plus className="w-6 h-6" /> <span className="text-lg">New Request</span>
                </motion.button>
            </motion.header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Search Section */}
                    <motion.section variants={itemVariants} className="glass-card-premium p-8 bg-primary-500/5 border-primary-500/10">
                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 tracking-tight">
                             <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center border border-accent-cyan/20">
                                <Sparkles className="w-6 h-6 text-accent-cyan" />
                             </div>
                             Quick Discovery
                        </h3>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-dark-400 group-focus-within:text-primary-400 transition-colors" />
                                <input 
                                    type="text" 
                                    placeholder="Need an Electrician, Plumber, or Tech Support?" 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="input-field pl-14 text-lg"
                                />
                            </div>
                            <button 
                                onClick={handleSearch} 
                                className="btn-secondary px-10 group flex items-center justify-center gap-2"
                                disabled={loading}
                            >
                                {loading ? "Searching..." : "Search"}
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </motion.section>

                    {/* Results / Workers */}
                    <AnimatePresence>
                        {workers.length > 0 && (
                            <motion.section 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 tracking-tight">
                                    <div className="w-2 h-8 bg-primary-500 rounded-full" />
                                    Top Rated Professionals
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {workers.map((w, i) => (
                                        <motion.div 
                                            key={i} 
                                            variants={itemVariants}
                                            whileHover={{ y: -4 }}
                                            className="glass-card-premium p-6 hover:bg-white/5 transition-all group flex flex-col border-white/5"
                                        >
                                            <div className="flex items-center gap-5 mb-5">
                                                <div className="relative">
                                                    <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-primary-500 flex items-center justify-center font-black text-2xl text-primary-400 group-hover:scale-110 transition-transform">
                                                        {w.name[0]}
                                                    </div>
                                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-accent-emerald rounded-full border-4 border-dark-950" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-bold text-white group-hover:text-primary-400 transition-colors tracking-tight">{w.name}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="flex items-center gap-1 text-accent-amber bg-accent-amber/10 px-2 py-0.5 rounded border border-accent-amber/20">
                                                            <Star className="w-3.5 h-3.5 fill-current" />
                                                            <span className="text-xs font-black">{w.rating}</span>
                                                        </div>
                                                        <span className="text-xs text-dark-500 font-bold uppercase tracking-widest">• Verified</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {w.skills.map((s: string) => (
                                                        <span key={s} className="px-3 py-1 rounded-full bg-white/5 text-[10px] text-dark-300 font-black uppercase tracking-widest border border-white/5 group-hover:border-primary-500/20 transition-colors">{s}</span>
                                                    ))}
                                                </div>
                                                <div className="flex items-center justify-between pt-5 border-t border-white/5">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-dark-500 font-black uppercase tracking-widest leading-none mb-1">Fee Starts From</span>
                                                        <span className="text-2xl font-black text-accent-emerald">₹{w.charges}</span>
                                                    </div>
                                                    <button className="btn-primary py-2 px-6 text-sm font-black uppercase tracking-widest scale-90 hover:scale-100 transition-all">
                                                        Hire Now
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.section>
                        )}
                    </AnimatePresence>

                    {/* My Requests */}
                    <motion.section variants={itemVariants}>
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 tracking-tight">
                             <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center border border-primary-500/20">
                                <Clock className="w-6 h-6 text-primary-400" />
                             </div>
                             Recent Activity
                        </h2>
                        <div className="grid gap-4">
                            {requests.length === 0 ? (
                                <div className="glass-card-premium p-16 text-center border-dashed border-2 border-white/5 opacity-60">
                                    <Clock className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                                    <p className="text-xl font-bold text-white mb-2">No active requests</p>
                                    <p className="text-dark-400 font-medium max-w-xs mx-auto">Post your first service request to get connected with pros.</p>
                                </div>
                            ) : (
                                requests.map((req, i) => (
                                    <motion.div 
                                        key={i} 
                                        whileHover={{ x: 8 }}
                                        className="glass-card-premium p-6 flex items-center justify-between border-l-4 border-primary-500 group cursor-pointer"
                                    >
                                        <div>
                                            <h4 className="text-xl font-bold text-white tracking-tight group-hover:text-primary-400 transition-colors">{req.work_type}</h4>
                                            <div className="flex items-center gap-3 mt-2 text-xs font-bold uppercase tracking-widest">
                                                <span className="text-dark-400 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-accent-pink" /> {req.location}</span>
                                                <span className="w-1 h-1 rounded-full bg-dark-600" />
                                                <span className="text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded border border-primary-500/20">{req.status}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-dark-400 hover:text-white hover:bg-white/5 transition-all"><MessageSquare className="w-5 h-5" /></button>
                                            <button className="btn-secondary py-2 px-5 text-xs font-black uppercase tracking-widest">Details</button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.section>
                </div>

                <div className="space-y-8">
                     <motion.section variants={itemVariants} className="glass-card-premium p-8 border-b-4 border-primary-500 relative overflow-hidden">
                        <div className="text-center relative z-10">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-accent-purple p-1 mx-auto mb-6 shadow-2xl">
                                <div className="w-full h-full rounded-full bg-dark-950 flex items-center justify-center text-4xl font-black text-white">
                                    {user.name?.[0]}
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-white tracking-tight leading-none">{user.name}</h3>
                            <div className="flex items-center justify-center gap-1.5 text-dark-400 mt-3 font-bold uppercase tracking-widest text-[10px]">
                                <MapPin className="w-3 h-3 text-accent-pink" /> {user.location}
                            </div>
                        </div>
                        <div className="mt-10 space-y-5 pt-8 border-t border-white/5 relative z-10">
                            {[
                                { label: "Active Requests", value: stats?.pending_requests || 0, color: "text-white" },
                                { label: "Lifetime Savings", value: "₹2,450", color: "text-accent-emerald" },
                                { label: "Wallet Balance", value: `₹${stats?.balance || 0}`, color: "text-accent-cyan" }
                            ].map((stat, idx) => (
                                <div key={idx} className="flex justify-between items-center group">
                                    <span className="text-dark-400 font-bold text-xs uppercase tracking-widest">{stat.label}</span>
                                    <span className={`${stat.color} font-black text-sm tracking-tight group-hover:scale-110 transition-transform`}>{stat.value}</span>
                                </div>
                            ))}
                            <button className="btn-primary w-full py-3 mt-4 text-[10px] uppercase font-black tracking-widest shadow-xl shadow-primary-500/10">Refill Wallet</button>
                        </div>
                        <div className="absolute -left-12 -top-12 w-32 h-32 bg-primary-500/10 blur-3xl rounded-full" />
                    </motion.section>

                    <motion.div 
                        variants={itemVariants} 
                        className="glass-card-premium p-8 bg-gradient-to-br from-accent-purple/10 to-primary-500/10 border-accent-purple/20 relative group"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Sparkles className="w-7 h-7 text-accent-purple" />
                        </div>
                        <h4 className="text-xl font-bold text-white mb-2 tracking-tight">AI Matching</h4>
                        <p className="text-dark-400 text-sm font-medium leading-relaxed">Our AI analyzes over 50 metrics to connect you with the most reliable professionals in seconds.</p>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
