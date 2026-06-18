"use client";

import { useState, useEffect } from "react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Users, Settings, Search, MoreVertical, Send, Paperclip, Image as ImageIcon, Video, X } from "lucide-react";

export default function ChatPage() {
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
        <div className="flex h-screen bg-dark-950 text-white overflow-hidden p-4 gap-4">
            {/* Sidebar */}
            <div className="w-80 flex-shrink-0 bg-dark-900/50 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden flex flex-col">
                <ChatSidebar 
                    onSelectUser={setSelectedUser} 
                    selectedUser={selectedUser}
                    currentUser={currentUser}
                />
            </div>

            {/* Main Chat Area */}
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
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-grow flex flex-col items-center justify-center p-12 text-center"
                        >
                            <div className="w-24 h-24 rounded-full bg-primary-500/10 flex items-center justify-center mb-6">
                                <MessageSquare className="w-12 h-12 text-primary-400" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Your Messages</h2>
                            <p className="text-dark-400 max-w-sm">
                                Select a conversation from the sidebar or find new users to start chatting.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
