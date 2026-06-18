"use client";
import React, { useState, useEffect, useRef } from "react";
import { Send, User, Search, MessageSquare, Clock } from "lucide-react";
import { api } from "@/lib/api";

export default function ChatPage() {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [receiver, setReceiver] = useState("");
    const [user, setUser] = useState<any>(null);
    const ws = useRef<WebSocket | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function init() {
            const profile = await api.getProfile();
            setUser(profile);
            
            const token = localStorage.getItem("token");
            const socket = new WebSocket(`ws://localhost:8000/api/chat/ws/${token}`);
            
            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                setMessages(prev => [...prev, data]);
            };
            
            ws.current = socket;
        }
        init();
        return () => ws.current?.close();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = () => {
        if (!input || !receiver || !ws.current) return;
        
        const payload = { receiver, message: input };
        ws.current.send(JSON.stringify(payload));
        
        setMessages(prev => [...prev, {
            sender: user.email,
            message: input,
            timestamp: new Date().toISOString()
        }]);
        setInput("");
    };

    return (
        <div className="flex h-[calc(100vh-10rem)] gap-6 animate-in fade-in zoom-in-95 duration-500">
            {/* Sidebar: Recent Chats */}
            <div className="w-80 glass-card flex flex-col overflow-hidden">
                <div className="p-4 border-b border-white/5">
                    <h3 className="font-bold text-white mb-4">Messages</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                        <input 
                            type="text" 
                            placeholder="Find or start chat..." 
                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {/* Placeholder for recent chats */}
                    <div className="p-4 text-center text-dark-500 text-sm italic py-20 opacity-50">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        Start a new conversation by typing an email address.
                    </div>
                </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 glass-card flex flex-col overflow-hidden">
                <header className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-primary-400">
                            {receiver ? receiver[0].toUpperCase() : "?"}
                        </div>
                        <div>
                            <input 
                                type="text" 
                                placeholder="Enter recipient email..." 
                                value={receiver}
                                onChange={(e) => setReceiver(e.target.value)}
                                className="bg-transparent border-none text-white font-bold focus:outline-none placeholder:text-dark-600 tracking-tight"
                            />
                            <p className="text-[10px] text-dark-500 font-mono flex items-center gap-1"><Clock className="w-2 h-2" /> Real-time active</p>
                        </div>
                    </div>
                </header>

                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950/20 backdrop-invert-[0.02]">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender === user?.email ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                                msg.sender === user?.email 
                                    ? "bg-primary-600 text-white rounded-tr-none shadow-lg shadow-primary-900/20" 
                                    : "bg-slate-800 text-dark-200 rounded-tl-none border border-white/5"
                            }`}>
                                <p className="leading-relaxed">{msg.message}</p>
                                <p className={`text-[9px] mt-1 opacity-50 text-right ${msg.sender === user?.email ? "text-white" : "text-dark-400"}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <footer className="p-4 border-t border-white/5 bg-slate-900/30">
                    <div className="flex gap-4">
                        <input 
                            type="text" 
                            placeholder="Type your message..." 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                        />
                        <button 
                            onClick={sendMessage}
                            disabled={!input || !receiver}
                            className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center text-white hover:bg-primary-500 transition-all shadow-lg shadow-primary-900/30 disabled:opacity-50"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
}
