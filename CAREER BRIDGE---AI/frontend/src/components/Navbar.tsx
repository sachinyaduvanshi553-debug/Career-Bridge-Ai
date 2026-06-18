"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles, LayoutDashboard, FileText, Target, Map, Briefcase,
    MessageSquare, BarChart3, User, Menu, X, LogOut, ChevronRight
} from "lucide-react";

const NAV_ITEMS = [
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

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isLanding = pathname === "/";

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled || !isLanding
                        ? "glass-panel py-2"
                        : "bg-transparent py-4"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link href="/" className="flex items-center gap-3 group">
                                <div className="relative">
                                    <div className="absolute -inset-2 bg-primary-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-xl object-contain bg-white/5 p-1.5 relative z-10 border border-white/5 group-hover:border-primary-500/30 transition-all duration-300" />
                                </div>
                                <span className="text-xl font-bold font-display tracking-tight text-white group-hover:gradient-text transition-all duration-300">CAREER BRIDGE - AI</span>
                            </Link>
                        </motion.div>

                        {/* Desktop Nav */}
                        {!isLanding && (
                            <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5 backdrop-blur-md">
                                {NAV_ITEMS.map((item, i) => {
                                    const active = pathname === item.href;
                                    return (
                                        <motion.div
                                            key={item.href}
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                        >
                                            <Link
                                                href={item.href}
                                                className={`nav-link ${active ? "nav-link-active" : ""}`}
                                            >
                                                <item.icon className={`w-4 h-4 ${active ? "text-primary-400" : "group-hover:text-white"}`} />
                                                {item.label}
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Right side */}
                        <div className="flex items-center gap-4">
                            {isLanding ? (
                                <div className="flex items-center gap-4">
                                    <Link href="/login" className="nav-link !px-0 hidden sm:inline-flex">
                                        Log In
                                    </Link>
                                    <Link href="/register" className="btn-primary flex items-center gap-2 group !py-2.5 !px-6 !rounded-xl !text-sm">
                                        Get Started 
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                        <Link href="/profile" className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all">
                                            <User className="w-5 h-5 text-white" />
                                        </Link>
                                    </motion.div>
                                    <button
                                        className="lg:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 text-dark-400 hover:text-white transition-all"
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
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="fixed inset-x-0 top-16 z-40 glass-panel overflow-hidden lg:hidden"
                    >
                        <div className="p-6 space-y-2">
                            {NAV_ITEMS.map((item, i) => {
                                const active = pathname === item.href;
                                return (
                                    <motion.div
                                        key={item.href}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <Link
                                            href={item.href}
                                            onClick={() => setMobileOpen(false)}
                                            className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl text-base font-semibold transition-all ${active
                                                    ? "bg-primary-500/10 text-primary-400 border border-primary-500/20"
                                                    : "text-dark-400 hover:text-white hover:bg-white/5 border border-transparent"
                                                }`}
                                        >
                                            <item.icon className="w-5 h-5" />
                                            {item.label}
                                        </Link>
                                    </motion.div>
                                );
                            })}
                            <div className="border-t border-white/5 pt-4 mt-4 space-y-2">
                                <Link
                                    href="/profile"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-4 px-5 py-3.5 rounded-2xl text-base font-semibold text-dark-400 hover:text-white hover:bg-white/5 transition-all"
                                >
                                    <User className="w-5 h-5" /> Profile
                                </Link>
                                <Link
                                    href="/"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-4 px-5 py-3.5 rounded-2xl text-base font-semibold text-rose-400 hover:bg-rose-500/10 transition-all"
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
