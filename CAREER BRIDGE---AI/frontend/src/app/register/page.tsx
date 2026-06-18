"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Mail, Lock, User, MapPin, Eye, EyeOff, ArrowRight, GraduationCap, Phone, ChevronLeft, Shield } from "lucide-react";
import { SKILLS_DATABASE } from "@/lib/data";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { api } from "@/lib/api";

declare global {
    interface Window {
        recaptchaVerifier: RecaptchaVerifier;
    }
}

const INTERESTS = ["Technology", "Data Science", "Design", "Marketing", "Business", "Blue-Collar Skills", "Healthcare", "Finance"];

const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.5, staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
};

export default function RegisterPage() {
    const router = useRouter();
    const [show, setShow] = useState(false);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [form, setForm] = useState({
        name: "", email: "", phone: "", password: "", location: "", education: "",
        selectedSkills: [] as string[], interests: [] as string[], otp: "", role: "professional"
    });

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

    const toggleSkill = (skill: string) => {
        setForm(prev => ({
            ...prev,
            selectedSkills: prev.selectedSkills.includes(skill)
                ? prev.selectedSkills.filter(s => s !== skill)
                : [...prev.selectedSkills, skill]
        }));
    };

    const toggleInterest = (interest: string) => {
        setForm(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (step < 3) { setStep(step + 1); return; }
        if (step === 3) {
            setLoading(true);
            setError("");
            try {
                if (!window.recaptchaVerifier) {
                    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
                }
                const phoneNumber = form.phone.startsWith('+') ? form.phone : `+91${form.phone}`;
                const confResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
                setConfirmationResult(confResult);
                setStep(4);
            } catch (err: any) {
                setError(err.message || "Failed to send OTP. Ensure number is valid.");
            } finally {
                setLoading(false);
            }
            return;
        }

        setLoading(true);
        setError("");
        try {
            if (!confirmationResult && form.otp === "123567") {
                await api.register({ ...form, skills: form.selectedSkills, otp: "123567" });
                router.push("/login");
                return;
            }
            if (!confirmationResult) throw new Error("Verification failed. Try again.");
            const result = await confirmationResult.confirm(form.otp);
            const idToken = await result.user.getIdToken();
            await api.register({ ...form, skills: form.selectedSkills, otp: idToken });
            router.push("/login");
        } catch (err: any) {
            setError(err.message || "Registration failed.");
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-dark-950 py-20 p-4">
            {/* Background elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent-purple/10 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute inset-0 bg-grid opacity-10" />
            </div>

            <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-dark-400 hover:text-white transition-colors group z-20">
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold text-sm uppercase tracking-widest">Back to Home</span>
            </Link>

            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative z-10 w-full max-w-xl">
                <div className="text-center mb-10">
                    <motion.div variants={itemVariants} className="inline-block mb-6">
                        <img src="/logo.png" alt="Logo" className="w-16 h-16 rounded-2xl object-contain bg-white/5 p-2 border border-white/10 shadow-2xl" />
                    </motion.div>
                    <motion.h1 variants={itemVariants} className="text-3xl font-black font-display text-white tracking-tighter uppercase">
                        Join Career Bridge
                    </motion.h1>
                    <motion.p variants={itemVariants} className="text-dark-400 font-bold mt-2 uppercase tracking-tight text-sm">
                        Step <span className="text-primary-400">{step}</span> of 4 — 
                        <span className="text-white ml-1">
                            {step === 1 ? "Profile" : step === 2 ? "Skills" : step === 3 ? "Interests" : "Verify"}
                        </span>
                    </motion.p>
                </div>

                {/* Progress Bar */}
                <div className="flex gap-3 mb-10 px-4">
                    {[1, 2, 3, 4].map(s => (
                        <div key={s} className="flex-1 overflow-hidden h-1.5 rounded-full bg-white/5 border border-white/5">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: s <= step ? "100%" : "0%" }}
                                transition={{ duration: 0.8, ease: "circOut" }}
                                className="h-full bg-gradient-to-r from-primary-500 via-accent-purple to-accent-cyan" 
                            />
                        </div>
                    ))}
                </div>

                <div className="glass-card-premium p-10 border-white/10 shadow-3xl">
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="p-4 mb-6 text-sm font-bold text-red-400 bg-red-950/30 border border-red-900/50 rounded-xl"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                    <div className="grid grid-cols-3 gap-3 mb-8">
                                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-dark-400 col-span-3">I am a...</label>
                                       {['professional', 'worker', 'customer'].map(r => (
                                           <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
                                               className={`p-4 rounded-2xl border text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${form.role === r ? 'bg-primary-500/20 border-primary-500/50 text-white shadow-xl shadow-primary-500/10' : 'bg-white/5 border-white/5 text-dark-500 hover:border-white/20'}`}
                                           >
                                               {r}
                                           </button>
                                       ))}
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-dark-400 block px-1">Full Name</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500 group-focus-within:text-primary-400 transition-colors" />
                                                <input type="text" placeholder="John Doe" required className="input-field !pl-12 !py-4 shadow-inner"
                                                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-dark-400 block px-1">Phone Number</label>
                                            <div className="relative group">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500 group-focus-within:text-primary-400 transition-colors" />
                                                <input type="tel" placeholder="+91 9876543210" required className="input-field !pl-12 !py-4"
                                                    value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-dark-400 block px-1">Email Address</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500 group-focus-within:text-primary-400 transition-colors" />
                                            <input type="email" placeholder="john@example.com" required className="input-field !pl-12 !py-4"
                                                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-dark-400 block px-1">Location</label>
                                            <div className="relative group">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500 group-focus-within:text-primary-400 transition-colors" />
                                                <input type="text" placeholder="Indore, MP" required className="input-field !pl-12 !py-4"
                                                    value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-dark-400 block px-1">Education</label>
                                            <div className="relative group">
                                                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500 group-focus-within:text-primary-400 transition-colors" />
                                                <select required className="input-field !pl-12 !py-4 appearance-none"
                                                    value={form.education} onChange={e => setForm({ ...form, education: e.target.value })} >
                                                    <option value="" className="bg-dark-900">Select Level</option>
                                                    <option value="10th" className="bg-dark-900">10th Pass</option>
                                                    <option value="12th" className="bg-dark-900">12th Pass</option>
                                                    <option value="diploma" className="bg-dark-900">Diploma</option>
                                                    <option value="bachelor" className="bg-dark-900">Bachelor&apos;s</option>
                                                    <option value="master" className="bg-dark-900">Master&apos;s</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-dark-400 block px-1">Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500 group-focus-within:text-primary-400 transition-colors" />
                                            <input type={show ? "text" : "password"} placeholder="••••••••" required className="input-field !pl-12 !pr-12 !py-4"
                                                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                                            <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-white transition-colors">
                                                {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                    <p className="text-xs font-black uppercase tracking-widest text-dark-400 mb-6 px-1 italic">Select your top expertise areas:</p>
                                    <div className="max-h-[350px] overflow-y-auto space-y-8 pr-4 custom-scrollbar">
                                        {Object.entries(SKILLS_DATABASE).map(([cat, skills]) => (
                                            <div key={cat} className="space-y-3">
                                                <h4 className="text-[10px] font-black text-primary-400/80 uppercase tracking-[0.3em] mb-4 border-b border-white/5 pb-2">{cat}</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {skills.map(skill => (
                                                        <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${form.selectedSkills.includes(skill)
                                                                    ? "bg-primary-500/20 text-white border-primary-500/50 shadow-lg shadow-primary-500/10"
                                                                     : "bg-white/5 text-dark-400 border-white/5 hover:border-white/20"
                                                                }`}
                                                        >
                                                            {skill}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-primary-400 pt-4 text-center">
                                        {form.selectedSkills.length} Skills Locked In
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark-400 mb-6 italic">Dream career fields:</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            {INTERESTS.map(interest => (
                                                <button key={interest} type="button" onClick={() => toggleInterest(interest)}
                                                    className={`p-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-left transition-all duration-500 border-2 ${form.interests.includes(interest)
                                                            ? "bg-primary-500/10 text-white border-primary-500/50 shadow-2xl"
                                                            : "bg-white/5 text-dark-500 border-white/5 hover:border-white/10"
                                                        }`}
                                                >
                                                    {interest}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10 py-4">
                                    <div className="text-center">
                                        <div className="w-20 h-20 bg-primary-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary-500/20 shadow-2xl">
                                            <Shield className="w-10 h-10 text-primary-400" />
                                        </div>
                                        <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Security Check</h3>
                                        <p className="text-xs font-bold text-dark-400 uppercase tracking-widest"> Sent to <span className="text-primary-400">{form.phone}</span> </p>
                                    </div>
                                    <div>
                                        <input type="text" placeholder="000000" maxLength={6} required 
                                            className="input-field text-center tracking-[1em] text-4xl !py-8 font-mono font-black"
                                            value={form.otp} onChange={e => setForm({ ...form, otp: e.target.value })} 
                                        />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-dark-500 mt-6 text-center">
                                            Code not received? Use <span className="text-primary-400 font-black">123567</span>
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div id="recaptcha-container"></div>

                        <div className="flex gap-4 pt-4">
                            {step > 1 && (
                                <button type="button" onClick={() => setStep(step - 1)} 
                                    className="btn-secondary flex-1 !py-5 font-black uppercase tracking-[0.2em] border-white/10 hover:bg-white/10"
                                >
                                    Back
                                </button>
                            )}
                            <button type="submit" disabled={loading}
                                className="btn-primary flex-1 flex items-center justify-center gap-3 !py-5 font-black uppercase tracking-[0.2em] shadow-xl shadow-primary-500/20"
                            >
                                {loading ? <div className="loader !w-6 !h-6" /> : 
                                    <>{step === 4 ? "Finalize Account" : step === 3 ? "Secure Verification" : "Next Step"} 
                                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" /></>
                                }
                            </button>
                        </div>
                    </form>

                    {step === 1 && (
                        <motion.div variants={itemVariants} className="mt-10 text-center text-[10px] font-black uppercase tracking-[0.2em] text-dark-400">
                            Already part of Bharat&apos;s future?{" "}
                            <Link href="/login" className="text-primary-400 hover:text-primary-300 font-black decoration-2 underline-offset-4 hover:underline transition-all ml-1">Log In</Link>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </main>
    );
}


