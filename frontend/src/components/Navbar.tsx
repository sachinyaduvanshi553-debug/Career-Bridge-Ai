"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles, LayoutDashboard, FileText, Target, Map, Briefcase,
    MessageSquare, BarChart3, User, Menu, X, LogOut, ChevronRight, Bell
} from "lucide-react";


const DEFAULT_NAV_ITEMS = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Resume", href: "/resume", icon: FileText },
    { label: "Skill Gap", href: "/skills", icon: Target },
    { label: "Roadmap", href: "/roadmap", icon: Map },
    { label: "Jobs", href: "/jobs", icon: Briefcase },
    { label: "Interview", href: "/interview", icon: MessageSquare },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

export default function Navbar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState(true);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([
        { id: 1, title: "Welcome back!", message: "Your dashboard is ready.", time: "Just now", read: false }
    ]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        
        
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        setIsOnline(typeof window !== "undefined" && navigator.onLine);
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        try {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                const userObj = JSON.parse(userStr);
                setUserRole(userObj?.role || null);
            }
        } catch (e) {}

        const addNotification = (title: string, message: string) => {
            setNotifications(prev => [{
                id: Date.now(), title, message, time: "Just now", read: false
            }, ...prev]);
        };

        const onWorkUpdate = (e: any) => {
            addNotification("Request Update", `Request status changed to ${e.detail?.status || "updated"}.`);
        };
        const onWorkClaimed = (e: any) => {
            addNotification("New Job Taken", "A job request you were viewing has been claimed.");
        };

        window.addEventListener("WORK_REQUEST_UPDATE", onWorkUpdate);
        window.addEventListener("WORK_REQUEST_CLAIMED", onWorkClaimed);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
            window.removeEventListener("WORK_REQUEST_UPDATE", onWorkUpdate);
            window.removeEventListener("WORK_REQUEST_CLAIMED", onWorkClaimed);
        };
    }, []);

    const getNavItems = () => {
        let items = [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }];
        
        if (userRole === "professional") {
            items.push(
                { label: "Resume", href: "/resume", icon: FileText },
                { label: "Cover Letter", href: "/cover-letter", icon: FileText },
                { label: "Skill Gap", href: "/skills", icon: Target },
                { label: "Roadmap", href: "/roadmap", icon: Map },
                { label: "Jobs", href: "/jobs", icon: Briefcase },
                { label: "Job Tracker", href: "/job-tracker", icon: LayoutDashboard },
                { label: "Interview", href: "/interview", icon: MessageSquare },
                { label: "Analytics", href: "/analytics", icon: BarChart3 }
            );
        } else if (userRole === "worker") {
            items.push(
                { label: "Work Requests", href: "/work-requests", icon: Briefcase }
            );
        }
        
        // Customers only get Dashboard, or others if needed
        return items;
    };

    const navItems = getNavItems();

    const isLanding = pathname === "/";

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || !isLanding
                        ? "bg-background/90 backdrop-blur-xl border-b border-border/40"
                        : "bg-transparent"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-4">
                            <Link href="/" className="flex items-center gap-3.5 group">
                                <div className="w-10 h-10 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 relative">
                                    <Image src="/logo.png" alt="Career Bridge AI Logo" width={40} height={40} className="object-contain filter drop-shadow-[0_0_8px_rgba(99,102,241,0.3)]" />
                                </div>
                                <span className="text-xl font-bold font-display text-foreground tracking-tight leading-none">Career Bridge <span className="text-primary font-extrabold pb-0.5">AI</span></span>
                            </Link>

                            {!isOnline && (
                                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-500">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                    <span className="text-xs font-bold uppercase tracking-wider">Offline Mode</span>
                                </div>
                            )}
                        </div>

                        {/* Desktop Nav */}
                        {!isLanding && (
                            <div className="hidden lg:flex items-center gap-1">
                                {navItems.map((item) => {
                                    const active = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${active
                                                    ? "bg-primary-500/10 text-primary-400 border border-primary-500/20"
                                                    : "text-dark-400 hover:text-white hover:bg-white/5"
                                                }`}
                                        >
                                            <item.icon className="w-4 h-4" />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        )}

                        {/* Right side */}
                        <div className="flex items-center gap-3">
                            {isLanding ? (
                                <>
                                    <Link href="/login" className="btn-secondary text-sm !px-4 !py-2 hidden sm:inline-flex">
                                        Log In
                                    </Link>
                                    <Link href="/register" className="btn-primary text-sm !px-4 !py-2 flex items-center gap-1">
                                        Get Started <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </>
                            ) : (
                                <div className="flex items-center gap-4">

                                    {/* Notifications */}
                                    <div className="relative">
                                        <button 
                                            onClick={() => setShowNotifications(!showNotifications)}
                                            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all relative"
                                        >
                                            <Bell className="w-5 h-5" />
                                            {notifications.filter(n => !n.read).length > 0 && (
                                                <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse border border-background"></span>
                                            )}
                                        </button>
                                        
                                        <AnimatePresence>
                                            {showNotifications && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    className="absolute top-full right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col"
                                                >
                                                    <div className="p-4 border-b border-border flex justify-between items-center bg-muted/50">
                                                        <h3 className="font-bold text-foreground uppercase tracking-wider text-xs">Notifications</h3>
                                                        <button 
                                                            onClick={() => setNotifications(prev => prev.map(n => ({...n, read: true})))}
                                                            className="text-[10px] text-primary hover:text-primary/80 uppercase tracking-widest font-bold"
                                                        >
                                                            Mark Read
                                                        </button>
                                                    </div>
                                                    <div className="max-h-[300px] overflow-y-auto">
                                                        {notifications.map(n => (
                                                            <div key={n.id} className={`p-4 border-b border-border hover:bg-muted/50 transition-all cursor-pointer ${n.read ? 'opacity-60' : 'bg-primary/5'}`}>
                                                                <h4 className="text-sm font-bold text-foreground mb-1 leading-tight">{n.title}</h4>
                                                                <p className="text-xs text-muted-foreground mb-2 leading-tight">{n.message}</p>
                                                                <p className="text-[10px] text-muted-foreground/70 flex justify-between pr-2">
                                                                    <span>{n.time}</span>
                                                                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <Link href="/profile" className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center hover:shadow-lg hover:shadow-primary-500/30 transition-all">
                                        <User className="w-4 h-4 text-white" />
                                    </Link>
                                    <button
                                        className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
                                        onClick={() => setMobileOpen(!mobileOpen)}
                                    >
                                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && !isLanding && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="fixed inset-x-0 top-16 z-40 bg-background/95 backdrop-blur-xl border-b border-border/40 lg:hidden"
                    >
                        <div className="p-4 space-y-1">
                            {navItems.map((item) => {
                                const active = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active
                                                    ? "bg-primary/10 text-primary border border-primary/20"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                                            }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                            <div className="border-t border-border pt-3 mt-3">
                                <Link
                                    href="/profile"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                                >
                                    <User className="w-5 h-5" /> Profile
                                </Link>
                                <Link
                                    href="/"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-destructive hover:bg-destructive/10"
                                >
                                    <LogOut className="w-5 h-5" /> Log Out
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
