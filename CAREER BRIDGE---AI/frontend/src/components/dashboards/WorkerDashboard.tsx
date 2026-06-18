"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Briefcase, MapPin, Star, Clock, CheckCircle2, AlertCircle, ChevronRight, User } from "lucide-react";
import { api } from "@/lib/api";

export default function WorkerDashboard({ user }: { user: any }) {
    const [requests, setRequests] = useState<any[]>([]);
    const [workerStats, setWorkerStats] = useState<any>(null);
    const [aadhaar, setAadhaar] = useState("");
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        async function loadData() {
            try {
                const [reqs, stats] = await Promise.all([
                    api.getWorkerRequests(),
                    api.getWorkerProfile()
                ]);
                setRequests(reqs);
                setWorkerStats(stats);
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

    const handleAadhaarVerify = async () => {
        setVerifying(true);
        try {
            await api.verifyAadhaar(aadhaar);
            window.location.reload(); // Refresh to update status
        } catch (err) {
            alert("Verification failed: " + err);
        } finally {
            setVerifying(false);
        }
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
            <motion.header variants={itemVariants} className="mb-8">
                <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                    <span className="gradient-text">Worker Hub</span>
                    <span className="text-dark-600">/</span>
                    <span className="text-2xl font-bold italic opacity-50 uppercase tracking-widest">{user.name}</span>
                </h1>
                <p className="text-dark-400 mt-2 text-lg font-medium">Manage your services, verification, and job requests in one place.</p>
            </motion.header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Aadhaar Verification Section */}
                    {!user.is_verified && (
                        <motion.section variants={itemVariants} className="glass-card-premium p-8 border-l-4 border-accent-amber bg-accent-amber/5">
                            <div className="flex items-start gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-accent-amber/10 flex items-center justify-center flex-shrink-0 border border-accent-amber/20">
                                    <AlertCircle className="w-7 h-7 text-accent-amber" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Identity Verification Required</h3>
                                    <p className="text-dark-300 mb-8 text-lg font-medium leading-relaxed">To start accepting job requests and build your professional reputation, please verify your identity using your <span className="text-accent-amber font-bold">12-digit Aadhaar number</span>.</p>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <input 
                                            type="text" 
                                            placeholder="XXXX XXXX XXXX" 
                                            value={aadhaar}
                                            onChange={(e) => setAadhaar(e.target.value)}
                                            className="input-field flex-1 font-mono tracking-[0.3em] text-xl text-center"
                                        />
                                        <button 
                                            onClick={handleAadhaarVerify}
                                            disabled={verifying || aadhaar.length !== 12}
                                            className="btn-primary min-w-[200px]"
                                        >
                                            {verifying ? (
                                                <span className="flex items-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Verifying...
                                                </span>
                                            ) : "Verify Identity"}
                                        </button>
                                    </div>
                                    <p className="mt-4 text-xs text-dark-500 font-medium">* Your data is encrypted and handled securely as per digital identity guidelines.</p>
                                </div>
                            </div>
                        </motion.section>
                    )}

                    {user.is_verified && (
                        <motion.section variants={itemVariants} className="glass-card-premium p-6 border-l-4 border-accent-emerald bg-accent-emerald/5">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-full bg-accent-emerald/10 flex items-center justify-center border border-accent-emerald/20">
                                    <CheckCircle2 className="w-7 h-7 text-accent-emerald" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white tracking-tight">Identity Secured & Verified</h3>
                                    <p className="text-dark-400 font-medium">Your profile is visible to premium customers looking for verified professionals.</p>
                                </div>
                            </div>
                        </motion.section>
                    )}

                    {/* Job Requests */}
                    <motion.section variants={itemVariants}>
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 tracking-tight">
                             <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center border border-primary-500/20">
                                <Briefcase className="w-6 h-6 text-primary-400" />
                             </div>
                             Incoming Service Requests
                        </h2>
                        <div className="grid gap-4">
                            {requests.length === 0 ? (
                                <div className="glass-card-premium p-16 text-center border-dashed border-2 border-white/5">
                                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Clock className="w-10 h-10 text-dark-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Waiting for opportunities</h3>
                                    <p className="text-dark-400 font-medium max-w-xs mx-auto">No new requests in your area. Ensure your skills are up-to-date to get more matches.</p>
                                </div>
                            ) : (
                                requests.map((req, i) => (
                                    <motion.div 
                                        key={i} 
                                        whileHover={{ x: 8 }}
                                        className="glass-card-premium p-6 hover:bg-white/5 transition-all group cursor-pointer border-white/5"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className="px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 text-[10px] font-black uppercase tracking-widest border border-primary-500/20">{req.work_type}</span>
                                                    <span className="text-xs text-dark-400 flex items-center gap-1.5 font-bold"><MapPin className="w-3.5 h-3.5 text-accent-pink" /> {req.location}</span>
                                                </div>
                                                <h4 className="text-white font-bold text-xl mb-2 group-hover:text-primary-400 transition-colors leading-tight">{req.description}</h4>
                                                <div className="flex items-center gap-3 text-xs text-dark-500 uppercase tracking-widest font-bold">
                                                    <span className="text-dark-600">ID:</span>
                                                    <span>{req.customer_id.substring(0, 8)}...</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6">
                                                <div className="text-left md:text-right min-w-[120px]">
                                                    <div className="text-2xl font-black text-accent-emerald">₹{req.budget}</div>
                                                    <div className="text-[10px] text-dark-500 font-black uppercase tracking-widest opacity-60">Estimated Budget</div>
                                                </div>
                                                <button className="btn-secondary px-6 py-3 text-sm group-hover:bg-primary-500 group-hover:border-primary-500 transition-all font-bold">
                                                    Accept
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.section>
                </div>

                <div className="space-y-8">
                    <motion.section variants={itemVariants} className="glass-card-premium p-8 border-white/5 overflow-hidden relative">
                         <div className="flex items-center gap-5 mb-8">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-purple p-[2px]">
                                    <div className="w-full h-full rounded-2xl bg-dark-950 flex items-center justify-center text-3xl font-black text-white">
                                        {user.name?.[0]}
                                    </div>
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent-emerald rounded-full border-4 border-dark-950 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tight">{user.name}</h3>
                                <div className="flex items-center gap-1.5 text-accent-amber mt-1 bg-accent-amber/10 px-3 py-1 rounded-full border border-accent-amber/20 w-fit">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span className="text-sm font-black">4.8</span>
                                </div>
                            </div>
                         </div>
                         
                         <div className="grid gap-4 pt-6 border-t border-white/5">
                            {[
                                { label: "Availability", value: "Available", color: "text-accent-emerald" },
                                { label: "Experience", value: `${workerStats?.experience_years || 0} Years`, color: "text-white" },
                                { label: "Completed", value: workerStats?.completed_jobs_count || 0, color: "text-white" },
                                { label: "Earnings", value: `₹${workerStats?.total_earnings || 0}`, color: "text-accent-emerald" }
                            ].map((stat, idx) => (
                                <div key={idx} className="flex justify-between items-center group">
                                    <span className="text-dark-400 font-bold text-xs uppercase tracking-widest">{stat.label}</span>
                                    <span className={`${stat.color} font-black text-sm tracking-tight group-hover:scale-110 transition-transform`}>{stat.value}</span>
                                </div>
                            ))}
                         </div>

                         <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-primary-500/10 blur-3xl rounded-full" />
                    </motion.section>

                    <motion.div 
                        variants={itemVariants} 
                        className="glass-card-premium p-8 bg-gradient-to-br from-accent-cyan/10 to-primary-500/10 border-accent-cyan/20"
                    >
                        <ShieldCheck className="w-10 h-10 text-accent-cyan mb-4" />
                        <h4 className="text-lg font-bold text-white mb-2">Platform Protection</h4>
                        <p className="text-dark-400 text-sm font-medium leading-relaxed">All your transactions are insured. We prioritize your safety and timely payments.</p>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
