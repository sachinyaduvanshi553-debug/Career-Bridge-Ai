"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { 
  LayoutDashboard, User, Briefcase, MessageSquare, 
  Settings, LogOut, ShieldCheck, Search, Bell 
} from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function checkAuth() {
            try {
                const profile = await api.getProfile();
                setUser(profile);
            } catch (err) {
                console.error("Auth check failed", err);
                router.push("/login");
            } finally {
                setLoading(false);
            }
        }
        checkAuth();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500"></div>
            </div>
        );
    }

    const menuItems = [
        { label: "Overview", icon: LayoutDashboard, href: "/dashboard", roles: ["all"] },
        { label: "Profile", icon: User, href: "/profile", roles: ["all"] },
        { label: "Marketplace", icon: Search, href: "/dashboard/customer", roles: ["customer", "admin"] },
        { label: "Work Requests", icon: Briefcase, href: "/dashboard/worker", roles: ["worker", "admin"] },
        { label: "Job Matching", icon: Briefcase, href: "/jobs", roles: ["professional", "admin"] },
        { label: "Chat", icon: MessageSquare, href: "/dashboard/chat", roles: ["all"] },
        { label: "Admin Panel", icon: ShieldCheck, href: "/dashboard/admin", roles: ["admin"] },
    ];

    const filteredMenu = menuItems.filter(item => 
        item.roles.includes("all") || item.roles.includes(user?.role || "professional")
    );

    return (
        <div className="min-h-screen bg-slate-950 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900/50 border-r border-white/5 flex flex-col hidden md:flex">
                <div className="p-6">
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-xl object-contain bg-white/5 p-1" />
                        <span className="text-xl font-bold font-display text-white italic">CAREER BRIDGE - AI</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1">
                    {filteredMenu.map((item) => (
                        <Link 
                            key={item.label} 
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 text-dark-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group"
                        >
                            <item.icon className="w-5 h-5 group-hover:text-primary-400 transition-colors" />
                            <span className="text-sm font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button 
                        onClick={() => { localStorage.removeItem("token"); router.push("/login"); }}
                        className="flex items-center gap-3 px-4 py-3 w-full text-dark-400 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all group"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-semibold text-white capitalize">{user?.role} Dashboard</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-dark-400 hover:text-white transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full"></span>
                        </button>
                        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                            <div className="text-right">
                                <p className="text-sm font-medium text-white">{user?.name}</p>
                                <p className="text-xs text-dark-400 font-mono tracking-tighter uppercase">{user?.role}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-primary-400 font-bold">
                                {user?.name?.charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 bg-slate-950">
                    {children}
                </main>
            </div>
        </div>
    );
}
