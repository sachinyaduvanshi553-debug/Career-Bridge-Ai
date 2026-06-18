"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { DISTRICT_ANALYTICS } from "@/lib/data";
import {
    BarChart3, MapPin, Users, GraduationCap, Briefcase, TrendingUp,
    ChevronDown, Building2, Target, Award, ArrowUpRight
} from "lucide-react";

const OVERVIEW = {
    totalWorkers: 2545000,
    totalTrained: 1004000,
    totalPlaced: 784000,
    trainingCenters: 810,
    placementRate: 78.1,
    avgSkillGap: 34,
};

function BarChartSimple({ data, max }: { data: { label: string; value: number; color: string }[]; max: number }) {
    return (
        <div className="space-y-3">
            {data.map((item, i) => (
                <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-dark-300">{item.label}</span>
                        <span className="text-dark-400">{(item.value / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-dark-800">
                        <motion.div
                            initial={{ width: 0 }} animate={{ width: `${(item.value / max) * 100}%` }}
                            transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                            className={`h-full rounded-full ${item.color}`}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

import { useEffect } from "react";
import { api } from "@/lib/api";

export default function AnalyticsPage() {
    const [selectedState, setSelectedState] = useState("");
    const [overview, setOverview] = useState(OVERVIEW);
    const [districts, setDistricts] = useState(DISTRICT_ANALYTICS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadAnalytics() {
            try {
                const ovData = await api.getAnalyticsOverview();
                setOverview(ovData);
                const dData = await api.getAnalyticsDistricts(selectedState || undefined);
                setDistricts(dData);
            } catch (error) {
                console.error("Failed to load analytics:", error);
            } finally {
                setLoading(false);
            }
        }
        loadAnalytics();
    }, [selectedState]);

    const states = Array.from(new Set(DISTRICT_ANALYTICS.map(d => d.state)));
    const filtered = districts;

    return (
        <main className="min-h-screen">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="tag text-xs">🏛️ Government / NGO Dashboard</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold font-display text-white flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-rose-400" />
                        Workforce <span className="gradient-text">Analytics</span>
                    </h1>
                    <p className="text-dark-400 mt-2">District-wise skill gap mapping, training outcomes, and placement analytics</p>
                </motion.div>

                {/* Overview Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
                    {[
                        { label: "Total Workforce", value: `${(OVERVIEW.totalWorkers / 1000000).toFixed(1)}M`, icon: Users, color: "text-primary-400" },
                        { label: "Trained Workers", value: `${(OVERVIEW.totalTrained / 1000000).toFixed(1)}M`, icon: GraduationCap, color: "text-accent-cyan" },
                        { label: "Placed Workers", value: `${(OVERVIEW.totalPlaced / 1000).toFixed(0)}K`, icon: Briefcase, color: "text-accent-emerald" },
                        { label: "Placement Rate", value: `${OVERVIEW.placementRate}%`, icon: TrendingUp, color: "text-accent-emerald" },
                        { label: "Training Centers", value: `${OVERVIEW.trainingCenters}`, icon: Building2, color: "text-accent-amber" },
                        { label: "Avg Skill Gap", value: `${OVERVIEW.avgSkillGap}%`, icon: Target, color: "text-rose-400" },
                    ].map((card, i) => (
                        <motion.div key={card.label}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className="glass-card p-4 text-center"
                        >
                            <card.icon className={`w-6 h-6 ${card.color} mx-auto mb-2`} />
                            <div className="text-xl font-bold text-white">{card.value}</div>
                            <div className="text-xs text-dark-400 mt-1">{card.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Filter + Charts Row */}
                <div className="mt-8 grid lg:grid-cols-3 gap-6">
                    {/* Training vs Placement Chart */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="lg:col-span-2 glass-card p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-white">Training & Placement by District</h3>
                            <div className="relative">
                                <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)}
                                    className="input-field appearance-none pr-10 !py-2 text-sm !w-auto min-w-[140px]"
                                >
                                    <option value="">All States</option>
                                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 pointer-events-none" />
                            </div>
                        </div>
                        <BarChartSimple
                            max={Math.max(...DISTRICT_ANALYTICS.map(d => d.totalWorkers))}
                            data={filtered.map(d => ({
                                label: `${d.district}, ${d.state}`,
                                value: d.totalWorkers,
                                color: "bg-gradient-to-r from-primary-500 to-accent-purple",
                            }))}
                        />
                    </motion.div>

                    {/* Demand vs Supply */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="glass-card p-6"
                    >
                        <h3 className="text-lg font-semibold text-white mb-6">Placement Rate by District</h3>
                        <div className="space-y-4">
                            {filtered.slice(0, 6).map((d, i) => {
                                const rate = Math.round((d.placedWorkers / d.trainedWorkers) * 100);
                                return (
                                    <div key={d.district} className="flex items-center gap-3">
                                        <div className="w-8 text-xs text-dark-400 text-right">{i + 1}</div>
                                        <div className="flex-1">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-dark-300">{d.district}</span>
                                                <span className={rate >= 75 ? "text-accent-emerald" : rate >= 50 ? "text-accent-amber" : "text-rose-400"}>{rate}%</span>
                                            </div>
                                            <div className="w-full h-2 rounded-full bg-dark-800">
                                                <motion.div
                                                    initial={{ width: 0 }} animate={{ width: `${rate}%` }}
                                                    transition={{ duration: 1, delay: i * 0.1 }}
                                                    className={`h-full rounded-full ${rate >= 75 ? "bg-gradient-to-r from-accent-emerald to-green-500" :
                                                        rate >= 50 ? "bg-gradient-to-r from-accent-amber to-orange-500" :
                                                            "bg-gradient-to-r from-rose-500 to-red-500"
                                                        }`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>

                {/* District Detail Cards */}
                <div className="mt-8 grid md:grid-cols-2 gap-4">
                    {filtered.map((d, i) => (
                        <motion.div key={d.district}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className="glass-card-hover p-6"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-white font-semibold flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-primary-400" /> {d.district}
                                    </h3>
                                    <p className="text-sm text-dark-400">{d.state}</p>
                                </div>
                                <span className="tag text-xs">{d.trainingCenters} Centers</span>
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <div className="text-center p-2 rounded-lg bg-dark-800/50">
                                    <div className="text-sm font-bold text-white">{(d.totalWorkers / 1000).toFixed(0)}K</div>
                                    <div className="text-xs text-dark-500">Workers</div>
                                </div>
                                <div className="text-center p-2 rounded-lg bg-dark-800/50">
                                    <div className="text-sm font-bold text-accent-cyan">{(d.trainedWorkers / 1000).toFixed(0)}K</div>
                                    <div className="text-xs text-dark-500">Trained</div>
                                </div>
                                <div className="text-center p-2 rounded-lg bg-dark-800/50">
                                    <div className="text-sm font-bold text-accent-emerald">{(d.placedWorkers / 1000).toFixed(0)}K</div>
                                    <div className="text-xs text-dark-500">Placed</div>
                                </div>
                            </div>

                            <div className="mb-3">
                                <h4 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">Top Skill Gaps</h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {d.topSkillGaps.map(s => <span key={s} className="tag-warning text-xs">{s}</span>)}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">In-Demand Roles</h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {d.demandRoles.map(r => <span key={r} className="tag-success text-xs">{r}</span>)}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </main>
    );
}
