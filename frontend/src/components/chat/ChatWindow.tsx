"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import MessageBubble from "./MessageBubble";
import { Send, Paperclip, ImageIcon, Video, X, MoreVertical, Phone, VideoIcon, Search, Smile, MapPin, MessageSquare, ShieldCheck, UserCheck, UserX, Check, Orbit, Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "@/components/SocketProvider";

interface ChatWindowProps {
    user: any;
    currentUser: any;
}

export default function ChatWindow({ user, currentUser }: ChatWindowProps) {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isSharingLocation, setIsSharingLocation] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { socket } = useSocket();
    const [connectionStatus, setConnectionStatus] = useState<string>("none");
    const [requestBy, setRequestBy] = useState<string | null>(null);
    const [isCheckingStatus, setIsCheckingStatus] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const loadHistory = async () => {
            try {
                if (!user) return;
                const connRes = await api.getConnectionStatus(user.email);
                if (isMounted) {
                    setConnectionStatus(connRes.status || "none");
                    if (connRes.status === "pending") setRequestBy(connRes.requested_by);
                }

                if (connRes.status === "accepted") {
                    const history = await api.getChatHistory(user.email);
                    if (isMounted) setMessages(history);
                }
            } catch (err) {
                console.error("Failed to load chat setup", err);
            } finally {
                if (isMounted) setIsCheckingStatus(false);
            }
        };

        if (user) {
            loadHistory();
        } else {
            setIsCheckingStatus(false);
        }

        if (socket && user) {
            const handleMessage = (data: any) => {
                if (data.sender === user.email || data.sender === currentUser.email) {
                    setMessages(prev => [...prev, data]);
                }
            };

            const handleRequestReceived = (data: any) => {
                console.log("Frontend Log: Request Received from", data.requester_email);
                if (data.requester_email === user.email) {
                    setConnectionStatus("pending");
                    setRequestBy(data.requester_email);
                }
            };

            const handleRequestUpdated = (data: any) => {
                console.log("Frontend Log: Request Updated ->", data.status);
                if (data.receiver_email === user.email || data.receiver_email === currentUser.email) {
                    setConnectionStatus(data.status);
                    if (data.status === "accepted") {
                        console.log("Frontend Log: Chat Unlocked");
                        api.getChatHistory(user.email).then(history => {
                            if (isMounted) setMessages(history);
                        });
                    }
                }
            };

            socket.on("receive_message", handleMessage);
            socket.on("chat_request_received", handleRequestReceived);
            socket.on("chat_request_updated", handleRequestUpdated);

            return () => {
                isMounted = false;
                socket.off("receive_message", handleMessage);
                socket.off("chat_request_received", handleRequestReceived);
                socket.off("chat_request_updated", handleRequestUpdated);
            };
        }

        return () => { isMounted = false; };
    }, [user, currentUser?.email, socket]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendRequest = async () => {
        if (!user) return;
        try {
            console.log("Frontend Log: Sending Request...");
            await api.sendChatRequest(user.email);
            setConnectionStatus("pending");
            setRequestBy(currentUser.email);
            console.log("Frontend Log: Request Sent Successfully");
        } catch (error) {
            console.error("Failed to send request:", error);
        }
    };

    const handleAcceptRequest = async () => {
        if (!user) return;
        try {
            console.log("Frontend Log: Accepting Request...");
            await api.respondChatRequest(user.email, "accepted");
            setConnectionStatus("accepted");
            console.log("Frontend Log: Request Accepted Successfully");
        } catch (error) {
            console.error("Failed to accept request:", error);
        }
    };

    const handleDeclineRequest = async () => {
        if (!user) return;
        try {
            console.log("Frontend Log: Declining Request...");
            await api.respondChatRequest(user.email, "declined");
            setConnectionStatus("declined");
            console.log("Frontend Log: Request Declined Successfully");
        } catch (error) {
            console.error("Failed to decline request:", error);
        }
    };

    const handleSendMessage = () => {
        if (!input.trim() || !socket || connectionStatus !== "accepted" || !user) return;

        const data = {
            receiver: user.email,
            message: input,
            type: "text",
            file_url: null
        };

        socket.emit("private_message", data);

        const localMsg = {
            sender: currentUser.email,
            message: input,
            type: "text",
            file_url: null,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, localMsg]);
        setInput("");
    };

    const handleShareLocation = () => {
        if (!navigator.geolocation || !socket || !user) return;
        setIsSharingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                socket.emit("private_message", { receiver: user.email, message: "Shared a location", type: "location", latitude, longitude });
                setMessages(prev => [...prev, { sender: currentUser.email, message: "Shared a location", type: "location", latitude, longitude, timestamp: new Date().toISOString() }]);
                setIsSharingLocation(false);
            },
            () => setIsSharingLocation(false)
        );
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
        const file = e.target.files?.[0];
        if (!file || !socket || !user) return;
        setIsUploading(true);
        try {
            const res = await api.uploadChatMedia(file);
            if (res.url) {
                socket.emit("private_message", { receiver: user.email, message: "", type: type, file_url: res.url });
                setMessages(prev => [...prev, { sender: currentUser.email, message: "", type: type, file_url: res.url, timestamp: new Date().toISOString() }]);
            }
        } finally {
            setIsUploading(false);
        }
    };

    if (!user) {
        return (
            <div className="flex-grow flex flex-col items-center justify-center p-12 text-center bg-[#0f172a] h-full">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="w-32 h-32 rounded-full border border-[#8b5cf6]/20 bg-gradient-to-br from-[#1e293b] to-[#0f172a] flex items-center justify-center mb-8 shadow-2xl shadow-[#8b5cf6]/10 relative group"
                >
                    <div className="absolute inset-0 rounded-full border border-[#8b5cf6]/20 animate-ping opacity-20"></div>
                    <Orbit className="w-14 h-14 text-[#8b5cf6] stroke-[1.5]" />
                </motion.div>
                <h2 className="text-3xl font-black text-slate-100 mb-3 tracking-tight">AI Connected Workspace</h2>
                <p className="text-slate-400 text-sm max-w-sm">
                    Select a professional to start your journey. Securely form connections, innovate, and grow.
                </p>
            </div>
        );
    }

    const isLocked = connectionStatus !== "accepted";

    if (isCheckingStatus) {
        return <div className="flex h-full items-center justify-center bg-[#0f172a] text-slate-500 font-medium">Loading session state...</div>;
    }

    return (
        <div className="flex flex-col h-full bg-[#0f172a] shadow-2xl relative font-sans overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-[#1e293b] bg-[#0f172a]/80 backdrop-blur-xl flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-11 h-11 rounded-full bg-[#1e293b] border border-white/5 flex items-center justify-center font-bold text-slate-200">
                            {user.name?.[0] || user.email?.[0].toUpperCase()}
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <h3 className="text-base font-bold text-slate-100 leading-none tracking-tight">
                                {user.name || user.email}
                            </h3>
                            {(user.is_verified || user.verification_status === 'verified') && <ShieldCheck className="w-4 h-4 text-[#8b5cf6] flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-slate-400 font-medium mt-1">{user.email}</p>
                    </div>
                </div>
                
                {/* Header Actions - Locked state handling */}
                <div className="flex items-center gap-3 text-slate-400">
                    {!isLocked && (
                        <>
                            <button className="p-2 hover:bg-[#1e293b] rounded-lg hover:text-white transition-all"><Video className="w-5 h-5" /></button>
                        </>
                    )}
                    <button className="p-2 hover:bg-[#1e293b] rounded-lg hover:text-white transition-all"><MoreVertical className="w-5 h-5" /></button>
                </div>
            </div>

            {/* Central Area: Messages or Lock Screen */}
            {isLocked ? (
                <div className="flex-grow flex flex-col items-center justify-center p-8 bg-[#0f172a] relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#8b5cf6]/10 blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]"></div>

                    <div className="z-10 flex flex-col items-center text-center max-w-md w-full">
                        {connectionStatus === "none" && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                                <div className="w-20 h-20 rounded-2xl bg-[#1e293b] border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/40 rotate-3 text-[#8b5cf6]">
                                    <ShieldCheck className="w-10 h-10 -rotate-3" />
                                </div>
                                <h2 className="text-2xl font-black text-white mb-3 tracking-tight">Private Connection Required</h2>
                                <p className="text-slate-400 mb-8 text-sm leading-relaxed">
                                    You are not connected with <span className="text-slate-200 font-bold">{user.name || user.email}</span>. A Secure Handshake must be validated before messaging.
                                </p>
                                <button 
                                    onClick={handleSendRequest} 
                                    className="w-full bg-gradient-to-r from-[#8b5cf6] to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white py-4 px-6 rounded-full text-base font-bold shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all flex items-center justify-center gap-3 hover:-translate-y-0.5"
                                >
                                    <UserCheck className="w-5 h-5" /> Send Connection Request
                                </button>
                            </motion.div>
                        )}

                        {connectionStatus === "pending" && requestBy === currentUser.email && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full flex flex-col items-center">
                                {/* Soft professional pulsing glow (purple/blue) */}
                                <div className="relative w-24 h-24 flex items-center justify-center mb-8">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#8b5cf6] to-blue-500 opacity-20 animate-pulse blur-xl"></div>
                                    <div className="absolute inset-2 rounded-full border border-[#8b5cf6]/30 animate-[spin_4s_linear_infinite]"></div>
                                    <div className="w-14 h-14 rounded-full bg-[#1e293b] border border-white/10 flex items-center justify-center z-10 shadow-xl text-[#8b5cf6]">
                                        <Check className="w-6 h-6" />
                                    </div>
                                </div>
                                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8b5cf6] to-blue-400 mb-2">Request Sent - Awaiting Approval</h2>
                                <p className="text-sm text-slate-400">Secure connection requested. We will notify you when they accept.</p>
                            </motion.div>
                        )}

                        {connectionStatus === "pending" && requestBy === user.email && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full bg-[#1e293b]/60 backdrop-blur-md border border-white/5 p-8 rounded-3xl shadow-2xl">
                                <div className="w-16 h-16 rounded-full bg-[#8b5cf6]/10 flex items-center justify-center mx-auto mb-4 border border-[#8b5cf6]/20">
                                    <UserCheck className="w-8 h-8 text-[#8b5cf6]" />
                                </div>
                                <h2 className="text-lg font-bold text-white mb-2">{user.name || user.email} wants to connect</h2>
                                <p className="text-sm text-slate-400 mb-6 drop-shadow-sm">Accept their handshake to initiate a secure messaging line.</p>
                                <div className="flex w-full gap-3">
                                    <button onClick={handleDeclineRequest} className="flex-1 border border-slate-700 text-slate-300 py-3 rounded-xl font-semibold hover:bg-slate-800 transition">
                                        Decline
                                    </button>
                                    <button onClick={handleAcceptRequest} className="flex-1 bg-[#8b5cf6] text-white py-3 rounded-xl font-bold shadow-lg shadow-[#8b5cf6]/20 hover:bg-[#7c3aed] transition">
                                        Accept
                                    </button>
                                </div>
                            </motion.div>
                        )}
                        
                        {connectionStatus === "declined" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                                <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
                                    <UserX className="w-8 h-8 text-red-500" />
                                </div>
                                <h2 className="text-lg font-bold text-red-400 mb-2">Connection Declined</h2>
                                <p className="text-sm text-slate-500">Access to this private channel is restricted.</p>
                            </motion.div>
                        )}
                    </div>
                </div>
            ) : (
                <div
                    ref={scrollRef}
                    className="flex-grow overflow-y-auto p-6 space-y-4"
                >
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-3 animate-in fade-in zoom-in-95 duration-500">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/20 flex items-center justify-center mb-1">
                                <Check className="w-7 h-7 text-green-400" />
                            </div>
                            <p className="text-[15px] text-slate-200 font-semibold tracking-wide">Request Accepted</p>
                            <span className="text-xs text-slate-500">You can now start the conversation.</span>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <MessageBubble
                                key={idx}
                                message={msg}
                                isOwn={msg.sender === currentUser?.email}
                            />
                        ))
                    )}
                </div>
            )}

            {/* Input Box Area - Floating Bar logic requested perfectly */}
            {!isLocked && (
                <div className="p-4 bg-[#0f172a] border-t border-[#1e293b]">
                    <div className="max-w-4xl mx-auto flex items-end gap-2 relative">
                        {/* Action buttons embedded into left side */}
                        <div className="flex gap-1 pb-1">
                            <label className="cursor-pointer p-2.5 rounded-full text-slate-400 hover:text-[#8b5cf6] hover:bg-[#8b5cf6]/10 transition-colors">
                                <ImageIcon className="w-5 h-5" />
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} />
                            </label>
                        </div>

                        {/* Floating Modern Input Bar styling */}
                        <div className="flex-grow flex items-center bg-[#1e293b] rounded-[24px] border border-white/5 focus-within:border-[#8b5cf6]/50 focus-within:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all">
                            <button className="pl-4 text-slate-500 hover:text-[#8b5cf6] transition-colors"><Smile className="w-5 h-5" /></button>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                placeholder="Write a message..."
                                className="w-full bg-transparent py-3 pr-4 pl-3 text-[15px] text-slate-200 placeholder:text-slate-500 focus:outline-none resize-none min-h-[48px] max-h-32 flex items-center"
                                rows={1}
                            />
                        </div>

                        {/* Voice Enabled FAB as requested - Subtle mic icon */}
                        {!input.trim() ? (
                            <button title="Voice Message (Coming Soon)" className="mb-0.5 p-3.5 rounded-full bg-[#1e293b] text-slate-400 hover:bg-[#8b5cf6]/20 hover:text-[#8b5cf6] transition-all shadow-md">
                                <Mic className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSendMessage}
                                disabled={isUploading}
                                className={`mb-0.5 p-3.5 rounded-full shadow-lg transition-all ${
                                    !isUploading 
                                    ? "bg-[#8b5cf6] text-white hover:scale-105 active:scale-95 shadow-[#8b5cf6]/30" 
                                    : "bg-[#1e293b] text-slate-500 cursor-not-allowed"
                                }`}
                            >
                                {isUploading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Send className="w-5 h-5" />}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
