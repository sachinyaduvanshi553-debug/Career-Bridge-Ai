"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { JOB_LISTINGS } from "@/lib/data";
import {
    Briefcase, Search, MapPin, Clock, Users, ChevronDown, ExternalLink,
    Building2, Filter, X, TrendingUp
} from "lucide-react";

const STATES = Array.from(new Set(JOB_LISTINGS.map(j => j.state)));
const TYPES = ["Full-time", "Part-time", "Remote", "Internship"];

import { useEffect } from "react";
import { api } from "@/lib/api";

export default function JobsPage() {
    const [search, setSearch] = useState("");
    const [stateFilter, setStateFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [jobs, setJobs] = useState(JOB_LISTINGS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadJobs() {
            try {
                const data = await api.getJobs(stateFilter || undefined);
                setJobs(data);
            } catch (error) {
                console.error("Failed to load jobs:", error);
            } finally {
                setLoading(false);
            }
        }
        loadJobs();
    }, [stateFilter]);

    const filtered = useMemo(() => {
        return jobs.filter(job => {
            const matchSearch = !search || job.title.toLowerCase().includes(search.toLowerCase()) || job.company.toLowerCase().includes(search.toLowerCase()) || job.skills.some((s: string) => s.toLowerCase().includes(search.toLowerCase()));
            const matchType = !typeFilter || job.type === typeFilter;
            return matchSearch && matchType;
        });
    }, [search, typeFilter, jobs]);

    const clearFilters = () => { setSearch(""); setStateFilter(""); setTypeFilter(""); };

    return (
        <main className="min-h-screen">
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-2xl md:text-3xl font-bold font-display text-white flex items-center gap-3">
                        <Briefcase className="w-8 h-8 text-accent-emerald" />
                        Job <span className="gradient-text">Explorer</span>
                    </h1>
                    <p className="text-dark-400 mt-2">Discover region-based job opportunities matched to your skills</p>
                </motion.div>

                {/* Search & Filters */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="glass-card p-6 mt-8"
                >
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                            <input type="text" placeholder="Search roles, companies, or skills..." className="input-field !pl-11"
                                value={search} onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button onClick={() => setShowFilters(!showFilters)}
                            className="btn-secondary flex items-center gap-2 sm:w-auto"
                        >
                            <Filter className="w-4 h-4" /> Filters
                            {(stateFilter || typeFilter) && (
                                <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">
                                    {(stateFilter ? 1 : 0) + (typeFilter ? 1 : 0)}
                                </span>
                            )}
                        </button>
                    </div>

                    {showFilters && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                            className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/5"
                        >
                            <div className="relative">
                                <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}
                                    className="input-field appearance-none pr-10 !py-2 text-sm !w-auto min-w-[160px]"
                                >
                                    <option value="">All States</option>
                                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 pointer-events-none" />
                            </div>
                            <div className="relative">
                                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                                    className="input-field appearance-none pr-10 !py-2 text-sm !w-auto min-w-[140px]"
                                >
                                    <option value="">All Types</option>
                                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 pointer-events-none" />
                            </div>
                            {(stateFilter || typeFilter) && (
                                <button onClick={clearFilters} className="text-sm text-dark-400 hover:text-white flex items-center gap-1">
                                    <X className="w-4 h-4" /> Clear
                                </button>
                            )}
                        </motion.div>
                    )}
                </motion.div>

                {/* Results Count */}
                <div className="mt-6 mb-4 text-sm text-dark-400">
                    Showing <span className="text-white font-medium">{filtered.length}</span> job{filtered.length !== 1 ? "s" : ""}
                </div>

                {/* Job Listings */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 glass-card">
                        <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mb-4"></div>
                        <p className="text-dark-400 animate-pulse">Fetching the best roles for you...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map((job, i) => (
                            <motion.div key={job.id}
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                className="glass-card-hover p-6 group cursor-pointer"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-purple/20 border border-white/10 flex items-center justify-center">
                                                <Building2 className="w-5 h-5 text-primary-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-white font-semibold group-hover:text-primary-300 transition-colors">{job.title}</h3>
                                                <p className="text-sm text-dark-400">{job.company}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-dark-400 mb-3">{job.description}</p>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {job.skills.map(s => <span key={s} className="tag text-xs">{s}</span>)}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-xs text-dark-400">
                                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}, {job.state}</span>
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {job.posted}</span>
                                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {job.applicants} applicants</span>
                                            <span className="tag-success text-xs">{job.type}</span>
                                        </div>
                                    </div>
                                    <div className="flex sm:flex-col items-center sm:items-end gap-3">
                                        <div className="text-lg font-bold text-accent-emerald">{job.salary}</div>
                                        <button className="btn-primary !px-4 !py-2 text-sm flex items-center gap-1">
                                            Apply <ExternalLink className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {filtered.length === 0 && (
                    <div className="glass-card p-12 text-center">
                        <Briefcase className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">No Jobs Found</h3>
                        <p className="text-dark-400 text-sm">Try adjusting your search or filters</p>
                        <button onClick={clearFilters} className="btn-secondary mt-4">Clear Filters</button>
                    </div>
                )}
            </div>
        </main>
    );
}
