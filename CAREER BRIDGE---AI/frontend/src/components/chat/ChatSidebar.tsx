"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Users, MessageSquare, MoreVertical, ShieldCheck, Fingerprint, X, User } from "lucide-react";
import IdentityVerification from "../profile/IdentityVerification";

interface ChatSidebarProps {
    onSelectUser: (user: any) => void;
    selectedUser: any;
    currentUser: any;
}

export default function ChatSidebar({ onSelectUser, selectedUser, currentUser }: ChatSidebarProps) {
    const [view, setView] = useState<"chats" | "discover">("chats");
    const [users, setUsers] = useState<any[]>([]);
    const [conversations, setConversations] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [showVerifyPortal, setShowVerifyPortal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (view === "discover") {
                    const allUsers = await api.getChatUsers();
                    setUsers(allUsers);
                } else {
                    const convs = await api.getConversations();
                    setConversations(convs);
                }
            } catch (err) {
                console.error("Failed to fetch sidebar data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [view]);

    const filteredList = (view === "chats" ? conversations : users).filter(u => 
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-dark-900 border-r border-white/5 shadow-2xl">
            {/* Sidebar Header */}
            <div className="p-6 pb-2">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        Messages
                    </h1>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setView("chats")}
                            className={`p-2 rounded-xl transition-all ${view === "chats" ? "bg-primary-500/20 text-primary-400" : "text-dark-400 hover:text-white hover:bg-white/5"}`}
                        >
                            <MessageSquare className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => setView("discover")}
                            className={`p-2 rounded-xl transition-all ${view === "discover" ? "bg-primary-500/20 text-primary-400" : "text-dark-400 hover:text-white hover:bg-white/5"}`}
                        >
                            <Users className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                    <input 
                        type="text" 
                        placeholder={view === "chats" ? "Search conversations..." : "Discover people..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-dark-800/50 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-primary-500/50 transition-all"
                    />
                </div>
            </div>

            {/* User List */}
            <div className="flex-grow overflow-y-auto px-3 pb-6">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : filteredList.length > 0 ? (
                    <div className="space-y-1">
                        {filteredList.map((user) => (
                            <button
                                key={user.email}
                                onClick={() => onSelectUser(user)}
                                className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all group ${
                                    selectedUser?.email === user.email 
                                    ? "bg-primary-500/10 border border-primary-500/20" 
                                    : "hover:bg-white/5 border border-transparent"
                                }`}
                            >
                                <div className="relative flex-shrink-0">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                                        user.role === 'worker' ? 'bg-orange-500/20 text-orange-400' :
                                        user.role === 'professional' ? 'bg-blue-500/20 text-blue-400' :
                                        'bg-purple-500/20 text-purple-400'
                                    }`}>
                                        {user.full_name?.[0] || user.email?.[0]?.toUpperCase()}
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-dark-900 rounded-full"></div>
                                </div>
                                <div className="flex-grow text-left overflow-hidden">
                                    <div className="flex items-center justify-between gap-2 overflow-hidden">
                                        <span className="font-semibold truncate group-hover:text-primary-400 transition-colors">
                                            {user.full_name || 'Anonymous User'}
                                        </span>
                                        {(user.is_verified || user.verification_status === 'verified') && (
                                            <ShieldCheck className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-xs text-dark-500 truncate mt-0.5">
                                        {user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Member'}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-dark-500">
                        <Search className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-xs italic">No {view} found</p>
                    </div>
                )}
            </div>

            {/* Current User Footer */}
            <div className="p-4 border-t border-white/5 bg-dark-900/80 backdrop-blur-md">
                {currentUser && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center font-bold text-primary-400 flex-shrink-0">
                                {currentUser.full_name?.[0] || currentUser.email?.[0].toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold truncate leading-none mb-1 flex items-center gap-1.5">
                                    {currentUser.full_name}
                                    {(currentUser.is_verified || currentUser.verification_status === 'verified') && (
                                        <ShieldCheck className="w-3 h-3 text-primary-400" />
                                    )}
                                </p>
                                <p className="text-[10px] text-dark-500 truncate">{currentUser.email}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowVerifyPortal(true)}
                            className="p-2 hover:bg-white/5 rounded-xl text-dark-400 hover:text-primary-400 transition-all border border-transparent hover:border-primary-500/20"
                            title="Verify Identity"
                        >
                            <Fingerprint className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Verification Modal */}
            <AnimatePresence>
                {showVerifyPortal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="w-full max-w-lg relative"
                        >
                            <button 
                                onClick={() => setShowVerifyPortal(false)}
                                className="absolute right-4 top-4 z-10 p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all shadow-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <IdentityVerification />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
