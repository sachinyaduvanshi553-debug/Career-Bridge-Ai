"use client";
import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import ProfessionalDashboard from "@/components/dashboards/ProfessionalDashboard";
import WorkerDashboard from "@/components/dashboards/WorkerDashboard";
import CustomerDashboard from "@/components/dashboards/CustomerDashboard";
import AdminDashboard from "@/components/dashboards/AdminDashboard";

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProfile() {
            try {
                const profile = await api.getProfile();
                setUser(profile);
            } catch (err) {
                console.error("Failed to load profile", err);
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-20 bg-slate-950 min-h-screen">
                <h2 className="text-2xl font-bold text-white mb-4">You are not logged in</h2>
                <a href="/login" className="btn-primary">Go to Login</a>
            </div>
        );
    }

    // Dispatcher
    switch (user.role) {
        case "worker":
            return <WorkerDashboard user={user} />;
        case "customer":
            return <CustomerDashboard user={user} />;
        case "admin":
            return <AdminDashboard user={user} />;
        case "professional":
        default:
            return <ProfessionalDashboard user={user} />;
    }
}
