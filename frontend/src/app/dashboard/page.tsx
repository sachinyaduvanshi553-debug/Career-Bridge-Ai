"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProfile } from "@/hooks/useApi";
import Navbar from "@/components/Navbar";
import ProfessionalDashboard from "@/components/dashboards/ProfessionalDashboard";
import WorkerDashboard from "@/components/dashboards/WorkerDashboard";
import CustomerDashboard from "@/components/dashboards/CustomerDashboard";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import { Skeleton } from "@/components/ui";
import { useNotify } from "@/components/NotificationProvider";

gsap.registerPlugin(ScrollTrigger);

function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-3">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-10 w-32 rounded-xl" />
            </div>
            {/* Stats skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="glass-card p-6 space-y-3">
                        <Skeleton className="h-6 w-6 rounded-lg" />
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-4 w-28" />
                    </div>
                ))}
            </div>
            {/* Main content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="glass-card p-6 space-y-3">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    ))}
                </div>
                <div className="space-y-4">
                    <div className="glass-card p-6 space-y-4">
                        <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                        <Skeleton className="h-5 w-32 mx-auto" />
                        <Skeleton className="h-4 w-24 mx-auto" />
                        <div className="space-y-2 pt-4 border-t border-border/40">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex justify-between">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-12" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const { data: user, isLoading: loading, error } = useProfile();
    const notify = useNotify();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (error) {
            console.error("Failed to load profile", error);
            if (error?.message?.includes("401") || error?.message?.includes("403") || error?.message?.includes("not authenticated")) {
                window.location.href = "/login";
            } else {
                notify("error", "Failed to load dashboard", "Please refresh the page.");
            }
        }
    }, [error, notify]);

    // GSAP scroll animation on mount
    useEffect(() => {
        if (!loading && user && containerRef.current) {
            gsap.fromTo(
                containerRef.current.querySelectorAll(".gsap-reveal"),
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    stagger: 0.1,
                    duration: 0.6,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top 80%",
                    }
                }
            );
        }
    }, [loading, user]);

    const roleConfig: Record<string, { label: string; color: string; bg: string }> = {
        worker: { label: "Worker", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/30" },
        customer: { label: "Customer", color: "text-cyan-500", bg: "bg-cyan-500/10 border-cyan-500/30" },
        professional: { label: "Professional", color: "text-primary", bg: "bg-primary/10 border-primary/30" },
        admin: { label: "Admin", color: "text-destructive", bg: "bg-destructive/10 border-destructive/30" },
    };

    const roleMeta = user ? (roleConfig[user.role] || roleConfig.professional) : null;

    return (
        <div className="min-h-screen">
            <Navbar />
            <div className="dashboard-wrapper" ref={containerRef}>
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <DashboardSkeleton />
                        </motion.div>
                    ) : !user ? (
                        <motion.div
                            key="not-logged-in"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center min-h-[60vh] text-center"
                        >
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center mb-6 glow-sm">
                                <span className="text-4xl">🔐</span>
                            </div>
                            <h2 className="text-3xl font-bold text-foreground mb-3 font-display">Session Expired</h2>
                            <p className="text-muted-foreground mb-8 max-w-sm">Please log in again to access your personalized dashboard.</p>
                            <a href="/login" className="btn-primary !px-8 !py-4 text-base">Return to Login</a>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {/* Role greeting banner */}
                            <div className="mb-6 flex items-center gap-3">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${roleMeta?.bg} ${roleMeta?.color}`}>
                                    {roleMeta?.label} Dashboard
                                </span>
                                <span className="text-muted-foreground text-sm hidden sm:block">
                                    Welcome back, <span className="text-foreground font-semibold">{user.name?.split(" ")[0]}</span> 👋
                                </span>
                            </div>

                            {/* Route to role-specific dashboard */}
                            {user.role === "worker" && <WorkerDashboard user={user} />}
                            {user.role === "customer" && <CustomerDashboard user={user} />}
                            {user.role === "admin" && <AdminDashboard user={user} />}
                            {(user.role === "professional" || !user.role) && <ProfessionalDashboard user={user} />}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
