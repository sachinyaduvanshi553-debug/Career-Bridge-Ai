"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import {
    User, MapPin, GraduationCap, Mail, Save, Edit3, Sparkles,
    Target, Award, BookOpen, Briefcase
} from "lucide-react";

export default function ProfilePage() {
    const [editing, setEditing] = useState(false);
    const [profile, setProfile] = useState({
        name: "Sachin Sharma",
        email: "sachin@example.com",
        location: "Bangalore, Karnataka",
        education: "Bachelor's Degree",
        bio: "Aspiring full-stack developer passionate about building impactful products for India.",
        skills: ["React", "JavaScript", "HTML5", "CSS3", "Node.js", "Python", "Git", "MongoDB"],
        interests: ["Technology", "Data Science", "Business"],
    });

    const stats = [
        { label: "Career Score", value: "72", icon: Target, color: "text-primary-400" },
        { label: "Skills", value: "8", icon: Sparkles, color: "text-accent-purple" },
        { label: "Courses Active", value: "3", icon: BookOpen, color: "text-accent-cyan" },
        { label: "Interviews Done", value: "5", icon: Award, color: "text-accent-amber" },
    ];

    return (
        <main className="min-h-screen">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-2xl md:text-3xl font-bold font-display text-white flex items-center gap-3">
                        <User className="w-8 h-8 text-primary-400" />
                        My <span className="gradient-text">Profile</span>
                    </h1>
                </motion.div>

                {/* Profile Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="glass-card p-8 mt-8"
                >
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center flex-shrink-0">
                            <span className="text-3xl font-bold text-white">{profile.name.charAt(0)}</span>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-start justify-between">
                                <div>
                                    {editing ? (
                                        <input value={profile.name}
                                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                            className="input-field text-xl font-bold !p-1 !bg-transparent !border-primary-500/30 mb-1"
                                        />
                                    ) : (
                                        <h2 className="text-xl font-bold text-white">{profile.name}</h2>
                                    )}
                                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-dark-400">
                                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {profile.location}</span>
                                        <span className="flex items-center gap-1"><GraduationCap className="w-4 h-4" /> {profile.education}</span>
                                        <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {profile.email}</span>
                                    </div>
                                </div>
                                <button onClick={() => setEditing(!editing)}
                                    className={editing ? "btn-primary !px-4 !py-2 text-sm flex items-center gap-1" : "btn-secondary !px-4 !py-2 text-sm flex items-center gap-1"}
                                >
                                    {editing ? <><Save className="w-4 h-4" /> Save</> : <><Edit3 className="w-4 h-4" /> Edit</>}
                                </button>
                            </div>

                            {editing ? (
                                <textarea value={profile.bio}
                                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                    className="input-field mt-3 text-sm" rows={2}
                                />
                            ) : (
                                <p className="text-sm text-dark-400 mt-3">{profile.bio}</p>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {stats.map((s, i) => (
                        <motion.div key={s.label}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
                            className="glass-card p-5 text-center"
                        >
                            <s.icon className={`w-6 h-6 ${s.color} mx-auto mb-2`} />
                            <div className="text-2xl font-bold text-white">{s.value}</div>
                            <div className="text-xs text-dark-400 mt-1">{s.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Skills */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="glass-card p-6 mt-6"
                >
                    <h3 className="text-lg font-semibold text-white mb-4">My Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {profile.skills.map(s => <span key={s} className="tag">{s}</span>)}
                    </div>
                </motion.div>

                {/* Interests */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="glass-card p-6 mt-6"
                >
                    <h3 className="text-lg font-semibold text-white mb-4">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                        {profile.interests.map(i => (
                            <span key={i} className="px-4 py-2 rounded-xl bg-primary-500/10 text-primary-300 border border-primary-500/20 text-sm">{i}</span>
                        ))}
                    </div>
                </motion.div>

                {/* Quick Links */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    className="glass-card p-6 mt-6"
                >
                    <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                        {[
                            { label: "View Skill Gap Report", href: "/skills", icon: Target },
                            { label: "Resume Analyzer", href: "/resume", icon: Briefcase },
                            { label: "Learning Roadmap", href: "/roadmap", icon: BookOpen },
                            { label: "Mock Interview", href: "/interview", icon: Award },
                        ].map(link => (
                            <a key={link.href} href={link.href}
                                className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/50 border border-white/5 hover:border-primary-500/30 transition-all text-sm text-dark-300 hover:text-white"
                            >
                                <link.icon className="w-5 h-5 text-primary-400" />
                                {link.label}
                            </a>
                        ))}
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
