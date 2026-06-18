"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ChevronLeft } from "lucide-react";
import { api } from "@/lib/api";

const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
        opacity: 1, 
        scale: 1,
        transition: { duration: 0.5, staggerChildren: 0.1, delayChildren: 0.2 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
};

export default function LoginPage() {
    const router = useRouter();
    const [show, setShow] = useState(false);
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const card = document.querySelector(".glass-card-premium") as HTMLElement;
            if (card) {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty("--mouse-x", `${x}px`);
                card.style.setProperty("--mouse-y", `${y}px`);
            }
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const data = await api.login(form);
            localStorage.setItem("token", data.access_token);
            localStorage.setItem("user", JSON.stringify(data.user));
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Login failed. Please check your credentials.");
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-dark-950 p-4">
            {/* Background elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary-500/10 rounded-full blur-[100px] animate-pulse-slow" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent-purple/10 rounded-full blur-[100px] animate-pulse-slow" />
                <div className="absolute inset-0 bg-grid opacity-10" />
            </div>

            <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-dark-400 hover:text-white transition-colors group z-20">
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold text-sm uppercase tracking-widest">Back to Home</span>
            </Link>

            <motion.div 
                variants={containerVariants} initial="hidden" animate="visible"
                className="relative z-10 w-full max-w-md"
            >
                <div className="text-center mb-10">
                    <motion.div variants={itemVariants} className="inline-block mb-6">
                        <img src="/logo.png" alt="Logo" className="w-16 h-16 rounded-2xl object-contain bg-white/5 p-2 border border-white/10 shadow-2xl" />
                    </motion.div>
                    <motion.h1 variants={itemVariants} className="text-3xl font-black font-display text-white tracking-tighter">
                        Welcome Back
                    </motion.h1>
                    <motion.p variants={itemVariants} className="text-dark-400 font-bold mt-2">
                        Sign in to <span className="text-primary-400 uppercase tracking-tighter">Career Bridge</span>
                    </motion.p>
                </div>

                <div className="glass-card-premium p-10 border-white/10 shadow-3xl">
                    {error && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                            className="p-4 mb-6 text-sm font-bold text-red-400 bg-red-950/30 border border-red-900/50 rounded-xl"
                        >
                            {error}
                        </motion.div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <motion.div variants={itemVariants}>
                            <label className="text-xs font-black uppercase tracking-widest text-dark-300 mb-3 block">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500 group-focus-within:text-primary-400 transition-colors" />
                                <input type="email" placeholder="you@example.com" required
                                    className="input-field !pl-12 !py-4"
                                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label className="text-xs font-black uppercase tracking-widest text-dark-300 mb-3 block">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500 group-focus-within:text-primary-400 transition-colors" />
                                <input type={show ? "text" : "password"} placeholder="••••••••" required
                                    className="input-field !pl-12 !pr-12 !py-4"
                                    value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                                />
                                <button type="button" onClick={() => setShow(!show)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-white transition-colors"
                                >
                                    {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex items-center justify-between text-xs font-black">
                            <label className="flex items-center gap-2 text-dark-400 cursor-pointer hover:text-dark-200 transition-colors uppercase tracking-widest">
                                <input type="checkbox" className="rounded-md border-white/10 bg-white/5 text-primary-500 focus:ring-primary-500/20 w-4 h-4" />
                                Remember me
                            </label>
                            <a href="#" className="text-primary-400 hover:text-primary-300 transition-colors uppercase tracking-widest">Forgot password?</a>
                        </motion.div>

                        <motion.button variants={itemVariants} type="submit" disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-3 !py-5 font-black uppercase tracking-[0.2em] shadow-xl shadow-primary-500/20 hover:shadow-primary-500/40"
                        >
                            {loading ? <div className="loader !w-6 !h-6" /> : <>Sign In <ArrowRight className="w-5 h-5" /></>}
                        </motion.button>
                    </form>

                    <motion.div variants={itemVariants} className="mt-8 text-center text-xs font-black uppercase tracking-widest text-dark-400">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="text-primary-400 hover:text-primary-300 font-black decoration-2 underline-offset-4 hover:underline transition-all">Create account</Link>
                    </motion.div>
                </div>
            </motion.div>
        </main>
    );
}

