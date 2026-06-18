"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import MessageBubble from "./MessageBubble";
import { Send, Paperclip, Image as ImageIcon, Video, X, MoreVertical, Phone, Video as VideoCall, Search, Smile, MapPin, MessageSquare, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    const ws = useRef<WebSocket | null>(null);

    // Fetch history and connect WebSocket
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const history = await api.getChatHistory(user.email);
                setMessages(history);
            } catch (err) {
                console.error("Failed to load chat history", err);
            }
        };

        loadHistory();

        // Connect WebSocket
        const token = localStorage.getItem("token");
        const wsUrl = `ws://localhost:8000/api/chat/ws/${token}`;
        ws.current = new WebSocket(wsUrl);

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            // Only add if it's from current chat partner or to them
            if (data.sender === user.email || data.sender === currentUser.email) {
                setMessages(prev => [...prev, data]);
            }
        };

        ws.current.onerror = (err) => console.error("WS Error", err);
        ws.current.onclose = () => console.log("WS Closed");

        return () => {
            ws.current?.close();
        };
    }, [user.email, currentUser?.email]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = () => {
        if (!input.trim() || !ws.current) return;

        const data = {
            receiver: user.email,
            message: input,
            type: "text",
            file_url: null
        };

        ws.current.send(JSON.stringify(data));
        
        // Optimistically add to local messages
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
        if (!navigator.geolocation || !ws.current) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setIsSharingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const data = {
                    receiver: user.email,
                    message: "Shared a location",
                    type: "location",
                    latitude,
                    longitude
                };
                ws.current?.send(JSON.stringify(data));

                // Optimistically add
                const localMsg = {
                    sender: currentUser.email,
                    message: "Shared a location",
                    type: "location",
                    latitude,
                    longitude,
                    timestamp: new Date().toISOString()
                };
                setMessages(prev => [...prev, localMsg]);
                setIsSharingLocation(false);
            },
            (err) => {
                console.error("Location error", err);
                setIsSharingLocation(false);
                alert("Failed to get location. Please ensure location permissions are enabled.");
            }
        );
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
        const file = e.target.files?.[0];
        if (!file || !ws.current) return;

        setIsUploading(true);
        try {
            const res = await api.uploadChatMedia(file);
            if (res.url) {
                const data = {
                    receiver: user.email,
                    message: "",
                    type: type,
                    file_url: res.url
                };
                ws.current.send(JSON.stringify(data));
                
                // Optimistically add
                const localMsg = {
                    sender: currentUser.email,
                    message: "",
                    type: type,
                    file_url: res.url,
                    timestamp: new Date().toISOString()
                };
                setMessages(prev => [...prev, localMsg]);
            }
        } catch (err) {
            console.error("Upload failed", err);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-dark-900 shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-dark-900/80 backdrop-blur-xl flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center font-bold text-primary-400">
                            {user.full_name?.[0] || user.email?.[0].toUpperCase()}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-dark-900 rounded-full"></div>
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-bold text-white leading-none">
                                {user.full_name || 'Anonymous User'}
                            </h3>
                            {(user.is_verified || user.verification_status === 'verified') && (
                                <ShieldCheck className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" />
                            )}
                        </div>
                        <p className="text-[10px] text-green-400 font-medium mt-0.5">Online</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-dark-400">
                    <button className="hover:text-white transition-colors"><Phone className="w-4 h-4" /></button>
                    <button className="hover:text-white transition-colors"><VideoCall className="w-4 h-4" /></button>
                    <button className="hover:text-white transition-colors"><MoreVertical className="w-4 h-4" /></button>
                </div>
            </div>

            {/* Messages Area */}
            <div 
                ref={scrollRef}
                className="flex-grow overflow-y-auto p-6 space-y-2 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-fixed"
            >
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-dark-500 italic text-sm">
                        <MessageSquare className="w-8 h-8 mb-2 opacity-20" />
                        <p>No messages yet. Say hi!</p>
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

            {/* Input Area */}
            <div className="p-4 bg-dark-900/80 backdrop-blur-xl border-t border-white/5">
                <div className="flex items-end gap-3 max-w-4xl mx-auto">
                    <div className="flex items-center gap-2 pb-2">
                        <button 
                            onClick={handleShareLocation}
                            disabled={isSharingLocation}
                            className={`p-2 hover:bg-white/5 rounded-full transition-all ${isSharingLocation ? "text-primary-500 animate-pulse" : "text-dark-400 hover:text-primary-400"}`}
                            title="Share Location"
                        >
                            <MapPin className="w-5 h-5" />
                        </button>
                        <label className="cursor-pointer p-2 hover:bg-white/5 rounded-full text-dark-400 hover:text-primary-400 transition-all">
                            <ImageIcon className="w-5 h-5" />
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} />
                        </label>
                        <label className="cursor-pointer p-2 hover:bg-white/5 rounded-full text-dark-400 hover:text-primary-400 transition-all">
                            <Video className="w-5 h-5" />
                            <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, 'video')} />
                        </label>
                    </div>

                    <div className="flex-grow relative group">
                        <textarea 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            placeholder="Type a message..."
                            className="w-full bg-dark-800/80 border border-white/5 rounded-2xl py-3 px-4 pr-12 text-sm focus:outline-none focus:border-primary-500/50 transition-all resize-none min-h-[44px] max-h-32"
                            rows={1}
                        />
                        <button className="absolute right-3 bottom-3 text-dark-500 hover:text-yellow-400 transition-colors">
                            <Smile className="w-5 h-5" />
                        </button>
                    </div>

                    <button 
                        onClick={handleSendMessage}
                        disabled={!input.trim() || isUploading || isSharingLocation}
                        className={`p-3 rounded-2xl transition-all shadow-lg shadow-primary-500/20 ${
                            input.trim() && !isUploading && !isSharingLocation
                            ? "bg-primary-500 text-white hover:scale-105 active:scale-95" 
                            : "bg-dark-800 text-dark-500 cursor-not-allowed"
                        }`}
                    >
                        {isUploading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
