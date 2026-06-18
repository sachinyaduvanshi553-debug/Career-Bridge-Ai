"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import { useNotify } from "@/components/NotificationProvider";
import { FadeIn, Spinner, StatusBadge } from "@/components/ui";
import { Briefcase, MapPin, Search, Filter, CheckCircle, XCircle, Clock, Trash2 } from "lucide-react";

export default function WorkRequestsPage() {
    const notify = useNotify();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterCategory, setFilterCategory] = useState("all");
    const [searchLocation, setSearchLocation] = useState("");

    const fetchRequests = async () => {
        try {
            const data = await api.getWorkerRequests();
            setRequests(Array.isArray(data) ? data : (data?.requests || []));
        } catch (error: any) {
            notify("error", "Failed to load requests", error?.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();

        // Real-time listeners
        const handleClaimed = (e: any) => {
            const { id } = e.detail;
            setRequests(prev => prev.filter(r => r._id !== id));
        };

        window.addEventListener("WORK_REQUEST_CLAIMED", handleClaimed);
        return () => window.removeEventListener("WORK_REQUEST_CLAIMED", handleClaimed);
    }, []);

    const handleAccept = async (requestId: string) => {
        try {
            await api.updateWorkerRequestStatus(requestId, "accepted");
            notify("success", "Job Accepted", "You have claimed this work request.");
            // Filter it out locally immediately
            setRequests(prev => prev.filter(r => r._id !== requestId));
        } catch (err: any) {
            notify("error", "Action Failed", err.message);
        }
    };


    const categories = Array.from(new Set(requests.map(r => r.work_type).filter(Boolean)));

    const filteredRequests = requests.filter(req => {
        if (filterStatus !== "all" && req.status !== filterStatus) return false;
        if (filterCategory !== "all" && req.work_type !== filterCategory) return false;
        if (searchLocation && !req.location?.toLowerCase().includes(searchLocation.toLowerCase())) return false;
        return true;
    });

    return (
        <main className="min-h-screen">
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">
                <FadeIn>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold font-display text-white flex items-center gap-3">
                                <Briefcase className="w-8 h-8 text-primary-400" /> Worker <span className="gradient-text">Dashboard</span>
                            </h1>
                            <p className="text-dark-400 text-sm mt-1">Manage your incoming work requests and track your jobs.</p>
                        </div>
                    </div>
                </FadeIn>

                {/* Filters */}
                <FadeIn delay={0.1}>
                    <div className="glass-card p-4 sm:p-6 mb-8 flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                            <input
                                placeholder="Filter by Location..."
                                value={searchLocation}
                                onChange={e => setSearchLocation(e.target.value)}
                                className="input-field !pl-9 h-full w-full"
                            />
                        </div>
                        <div className="flex gap-4">
                            <select 
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value)}
                                className="input-field appearance-none cursor-pointer"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="accepted">Accepted</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <select 
                                value={filterCategory}
                                onChange={e => setFilterCategory(e.target.value)}
                                className="input-field appearance-none cursor-pointer"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat as string} value={cat as string}>{cat as string}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </FadeIn>

                {/* Requests List */}
                <FadeIn delay={0.2}>
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Spinner size={32} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence>
                                {filteredRequests.length > 0 ? (
                                    filteredRequests.map((req: any, index: number) => (
                                        <motion.div 
                                            key={req._id || index}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="glass-card p-6 flex flex-col h-full"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 text-xs font-bold uppercase tracking-wider">
                                                    {req.work_type || "Service"}
                                                </span>
                                                <StatusBadge status={req.status || "pending"} />
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-2 line-clamp-2" title={req.description || "Service Request"}>
                                                {req.description || "Service Request"}
                                            </h3>
                                            <div className="space-y-2 mb-6 flex-1">
                                                <div className="flex items-center gap-2 text-dark-300 text-sm">
                                                    <MapPin className="w-4 h-4 text-accent-cyan" /> {req.location || "Location not specified"}
                                                </div>
                                                <div className="flex items-center gap-2 text-dark-300 text-sm">
                                                    <Briefcase className="w-4 h-4 text-accent-emerald" /> Budget: ₹{req.budget || 0}
                                                </div>
                                            </div>
                                            {req.status === "pending" && (
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => handleAccept(req._id)}
                                                        className="flex-1 btn-primary !py-2 !px-4 text-sm flex justify-center items-center gap-2 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/30 transition-all font-bold"
                                                    >
                                                        <CheckCircle className="w-4 h-4" /> Accept Job
                                                    </button>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-16 glass-card bg-dark-800/20">
                                        <Briefcase className="w-16 h-16 text-dark-500 mx-auto mb-4" />
                                        <p className="text-dark-300 font-medium text-lg">No work requests found.</p>
                                        <p className="text-dark-500 text-sm mt-1">Try adjusting your filters or check back later.</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </FadeIn>
            </div>
        </main>
    );
}
