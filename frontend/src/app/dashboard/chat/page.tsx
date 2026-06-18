"use client";

import { useState, useEffect } from "react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ShieldCheck } from "lucide-react";

export default function DashboardChatPage() {
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profile = await api.getProfile();
                setCurrentUser(profile);
            } catch (err) {
                console.error("Failed to fetch profile", err);
            }
        };
        fetchProfile();
    }, []);

    return (
        <div className="flex h-[calc(100vh-6rem)] bg-dark-950 text-white overflow-hidden p-4 gap-4 animate-in fade-in zoom-in-95 duration-500 rounded-3xl">
            {/* Sidebar Component */}
            <div className="w-80 flex-shrink-0 bg-dark-900/50 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden flex flex-col">
                <ChatSidebar 
                    onSelectUser={setSelectedUser} 
                    selectedUser={selectedUser}
                    currentUser={currentUser}
                />
            </div>

            {/* Main Chat Area Component */}
            <div className="flex-grow bg-dark-900/50 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden flex flex-col relative">
                <AnimatePresence mode="wait">
                    {selectedUser ? (
                        <ChatWindow 
                            key={selectedUser.email}
                            user={selectedUser} 
                            currentUser={currentUser}
                        />
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex-grow flex flex-col items-center justify-center p-12 text-center relative overflow-hidden"
                        >
                            {/* Subtle Background Glow */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#8b5cf6]/5 rounded-full blur-[120px] pointer-events-none"></div>
                            
                            <div className="relative mb-8 z-10">
                                <div className="absolute inset-0 bg-[#8b5cf6] blur-xl opacity-20 rounded-full animate-pulse"></div>
                                <div className="w-24 h-24 rounded-3xl bg-[#1e293b] border border-white/10 flex items-center justify-center shadow-2xl relative z-10 rotate-3 overflow-hidden">
                                    {/* Glass reflection */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent"></div>
                                    <ShieldCheck className="w-12 h-12 text-[#8b5cf6] filter drop-shadow-[0_0_10px_rgba(139,92,246,0.8)] -rotate-3" />
                                </div>
                            </div>
                            <h2 className="text-3xl font-black mb-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-[#8b5cf6] to-blue-400 z-10">
                                Secure Networking
                            </h2>
                            <p className="text-slate-400 max-w-md text-[15px] leading-relaxed z-10">
                                Connect with professionals to unlock private messaging.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
