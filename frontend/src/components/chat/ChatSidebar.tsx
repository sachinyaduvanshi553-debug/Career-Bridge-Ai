"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Users, MessageSquare, ShieldCheck, Fingerprint, X, Activity, Check, X as XIcon, Bell } from "lucide-react";
import IdentityVerification from "../profile/IdentityVerification";
import { useSocket } from "@/components/SocketProvider";

interface ChatSidebarProps {
    onSelectUser: (user: any) => void;
    selectedUser: any;
    currentUser: any;
}

export default function ChatSidebar({ onSelectUser, selectedUser, currentUser }: ChatSidebarProps) {
    const [view, setView] = useState<"chats" | "discover" | "requests">("chats");
    const [users, setUsers] = useState<any[]>([]);
    const [conversations, setConversations] = useState<any[]>([]);
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [showVerifyPortal, setShowVerifyPortal] = useState(false);
    
    const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
    const [incomingRequest, setIncomingRequest] = useState<any | null>(null);
    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) return;
        const handleActiveUsers = (activeUsersList: any[]) => {
            setOnlineUsers(activeUsersList.filter(u => u.email !== currentUser?.email));
        };
        const handleRequestReceived = (data: any) => {
            setIncomingRequest(data);
            api.getPendingRequests().then(reqs => setPendingRequests(Array.isArray(reqs) ? reqs : []));
        };
        socket.on("active_users", handleActiveUsers);
        socket.on("chat_request_received", handleRequestReceived);
        return () => {
            socket.off("active_users", handleActiveUsers);
            socket.off("chat_request_received", handleRequestReceived);
        };
    }, [socket, currentUser]);

    const handleSendRequest = (receiver_email: string) => {
        if (!socket) return;
        socket.emit("chat_request", { receiver_email });
    };

    const handleDeclineRequest = (requester_email?: string) => {
        if (!socket) return;
        const email = requester_email || incomingRequest?.requester_email;
        if (email) {
            socket.emit("chat_request_response", { requester_email: email, status: "declined" });
            if (incomingRequest?.requester_email === email) setIncomingRequest(null);
            setPendingRequests(prev => prev.filter(r => r.requester_email !== email));
        }
    };
    
    const handleAcceptRequestExplicit = (requester_email?: string) => {
        if (!socket) return;
        const email = requester_email || incomingRequest?.requester_email;
        if (email) {
            socket.emit("chat_request_response", { requester_email: email, status: "accepted" });
            if (incomingRequest?.requester_email === email) setIncomingRequest(null);
            setPendingRequests(prev => prev.filter(r => r.requester_email !== email));
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (view === "discover") {
                    const allUsers = await api.getChatUsers(searchQuery);
                    setUsers(Array.isArray(allUsers) ? allUsers : (allUsers?.users || []));
                } else if (view === "requests") {
                    const requests = await api.getPendingRequests();
                    setPendingRequests(Array.isArray(requests) ? requests : []);
                } else if (view === "chats") {
                    const convs = await api.getConversations();
                    setConversations(Array.isArray(convs) ? convs : (convs?.conversations || []));
                }
            } catch (err) {
                console.error("Failed to fetch sidebar data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [view, searchQuery]);

    useEffect(() => {
        api.getPendingRequests().then(reqs => setPendingRequests(Array.isArray(reqs) ? reqs : []));
    }, []);

    const textMatch = (text: string | null) => (text || '').toLowerCase().includes(searchQuery.toLowerCase());
    const filteredConversations = conversations.filter(u => textMatch(u.name) || textMatch(u.email));
    const filteredDiscover = users.filter(u => textMatch(u.name) || textMatch(u.email));
    const filteredActive = onlineUsers.filter(u => textMatch(u.name) || textMatch(u.email));

    const renderUserItem = (user: any, showRequestButton: boolean) => {
        const isOnline = onlineUsers.some(u => u.email === user.email);
        return (
            <div key={user.email} className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group ${
                selectedUser?.email === user.email ? "bg-[#1e293b] border border-[#8b5cf6]/20 shadow-sm" : "hover:bg-[#1e293b]/50 border border-transparent"
            }`}>
                <button onClick={() => onSelectUser(user)} className="flex-grow flex items-center gap-3 text-left overflow-hidden">
                    <div className="relative flex-shrink-0">
                        <div className="w-11 h-11 rounded-full bg-[#1e293b] border border-white/5 flex items-center justify-center text-sm font-bold text-slate-300">
                            {user.name?.[0] || user.email?.[0]?.toUpperCase()}
                        </div>
                        {isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#0f172a] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
                        )}
                    </div>
                    <div className="flex-grow text-left overflow-hidden">
                        <div className="flex items-center justify-between gap-2 overflow-hidden">
                            <span className="font-semibold text-slate-200 truncate group-hover:text-[#8b5cf6] transition-colors font-sans tracking-tight">
                                {user.name || 'Anonymous User'}
                            </span>
                            {(user.is_verified || user.verification_status === 'verified') && <ShieldCheck className="w-3.5 h-3.5 text-[#8b5cf6] flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5 font-sans">{user.email}</p>
                    </div>
                </button>
                {showRequestButton && selectedUser?.email !== user.email && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleSendRequest(user.email); }} 
                        className="ml-2 px-3 py-1.5 border border-[#8b5cf6]/30 text-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white rounded-lg text-xs font-semibold whitespace-nowrap transition-all shadow-sm"
                    >
                        Request
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-[#0f172a]/90 backdrop-blur-xl border-r border-[#1e293b] shadow-2xl overflow-hidden font-sans">
            <div className="p-5 pb-3">
                <div className="flex items-center justify-between mb-5">
                    <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-blue-600 flex items-center justify-center shadow-lg shadow-[#8b5cf6]/20">
                            <MessageSquare className="w-4 h-4 text-white" />
                        </div>
                        CareerBridge
                    </h1>
                    
                    {/* Position Notification Bell in clean header with badge */}
                    <button onClick={() => setView("requests")} className={`relative p-2 rounded-xl transition-all flex items-center justify-center gap-2 ${view === "requests" ? "bg-[#8b5cf6]/10 text-[#8b5cf6]" : "bg-[#1e293b] text-slate-400 hover:text-white"}`} title="Pending Requests">
                        <Bell className="w-5 h-5" />
                        {pendingRequests.length > 0 && (
                            <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#8b5cf6] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#0f172a] shadow-sm">
                                {pendingRequests.length}
                            </div>
                        )}
                    </button>
                </div>

                <div className="flex gap-2 mb-4 bg-[#1e293b] p-1 rounded-xl">
                    <button onClick={() => setView("chats")} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${view === "chats" ? "bg-[#0f172a] text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}>
                        Chats
                    </button>
                    <button onClick={() => setView("discover")} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${view === "discover" ? "bg-[#0f172a] text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}>
                        Discover
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type="text" placeholder={view === "chats" ? "Search conversations..." : view === "requests" ? "Search requests..." : "Find emails to connect..."} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#1e293b]/50 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#8b5cf6]/50 transition-all"/>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto px-3 pb-6 custom-scrollbar">
                {view === "requests" && (
                    <div className="mb-4">
                        <div className="px-1 pb-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Pending Requests</div>
                        {pendingRequests.length === 0 ? (
                            <div className="text-center py-6 text-slate-500 text-sm">No pending requests.</div>
                        ) : (
                            <div className="space-y-2">
                                {pendingRequests.map((req) => (
                                    <div key={req.requester_email} className="w-full flex items-center justify-between p-3 rounded-xl bg-[#1e293b] border border-white/5 shadow-sm group">
                                        <div className="flex-grow flex items-center gap-3 overflow-hidden">
                                            <div className="w-10 h-10 rounded-full bg-[#8b5cf6]/10 text-[#8b5cf6] border border-[#8b5cf6]/20 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                {req.requester_name?.[0] || req.requester_email?.[0]?.toUpperCase()}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="font-semibold text-sm text-slate-200 truncate tracking-tight">{req.requester_name || req.requester_email}</p>
                                                <p className="text-[11px] text-slate-500 truncate">Wants to connect</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            <button onClick={() => handleDeclineRequest(req.requester_email)} className="p-2 border border-slate-700 text-slate-400 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 rounded-lg transition-all"><XIcon className="w-4 h-4" /></button>
                                            <button onClick={() => handleAcceptRequestExplicit(req.requester_email)} className="p-2 border border-slate-700 text-slate-400 hover:bg-[#8b5cf6]/10 hover:text-[#8b5cf6] hover:border-[#8b5cf6]/30 rounded-lg transition-all"><Check className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {view === "discover" && (
                    <div className="mb-4 animate-in fade-in duration-300">
                        {/* Distinct Active Users Section */}
                        <div className="px-1 pb-2 flex items-center gap-2 mt-2">
                            <div className="relative flex items-center justify-center w-4 h-4">
                                <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-20 animate-ping"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </div>
                            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Active Now</span>
                        </div>
                        <div className="space-y-1 bg-[#1e293b]/30 rounded-xl p-1 mb-6 border border-white/5">
                            {filteredActive.length === 0 ? (
                                <div className="text-center py-6 text-slate-500 text-sm">No active users at the moment.</div>
                            ) : (
                                filteredActive.map(u => renderUserItem(u, true))
                            )}
                        </div>

                        <div className="px-1 pb-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest">All Members</div>
                        <div className="space-y-1">
                            {filteredDiscover.length === 0 ? (
                                <div className="text-center py-6 text-slate-500 text-sm">No users found.</div>
                            ) : (
                                filteredDiscover.map(u => renderUserItem(u, true))
                            )}
                        </div>
                    </div>
                )}

                {view === "chats" && (
                    <div className="space-y-1 mt-2 animate-in fade-in duration-300">
                        {loading ? (
                            <div className="flex justify-center p-6"><div className="w-6 h-6 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin"></div></div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 text-sm flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full bg-[#1e293b] flex items-center justify-center mb-4">
                                    <MessageSquare className="w-6 h-6 text-slate-400" />
                                </div>
                                <p>No conversations yet.</p>
                                <p className="text-xs mt-1">Go to Discover to find someone!</p>
                            </div>
                        ) : (
                            filteredConversations.map(u => renderUserItem(u, false))
                        )}
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-[#1e293b] bg-[#0f172a]/95 backdrop-blur-md">
                {currentUser && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8b5cf6] to-blue-600 flex items-center justify-center font-bold text-white flex-shrink-0 shadow-lg shadow-[#8b5cf6]/20">
                                {currentUser.name?.[0] || currentUser.email?.[0].toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold text-slate-200 truncate leading-tight flex items-center gap-1.5 tracking-tight">
                                    {currentUser.name}
                                    {(currentUser.is_verified || currentUser.verification_status === 'verified') && <ShieldCheck className="w-3.5 h-3.5 text-[#8b5cf6]" />}
                                </p>
                                <p className="text-[11px] text-slate-500 truncate mt-0.5">{currentUser.email}</p>
                            </div>
                        </div>
                        <button onClick={() => setShowVerifyPortal(true)} className="p-2 hover:bg-[#1e293b] rounded-xl text-slate-400 hover:text-white transition-all" title="Settings / Verification">
                            <Fingerprint className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showVerifyPortal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0f172a]/80 backdrop-blur-lg">
                        <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} className="w-full max-w-lg relative">
                            <button onClick={() => setShowVerifyPortal(false)} className="absolute right-4 top-4 z-10 p-2 bg-[#1e293b] hover:bg-white/10 rounded-full text-slate-300 transition-all shadow-xl border border-white/5">
                                <X className="w-4 h-4" />
                            </button>
                            <IdentityVerification />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
