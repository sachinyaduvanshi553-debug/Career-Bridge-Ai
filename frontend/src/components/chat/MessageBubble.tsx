"use client";

import { BASE_BACKEND_URL } from "@/lib/api";
import { motion } from "framer-motion";
import { MapPin, ExternalLink, Play, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
    message: any;
    isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
    const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Determine backend URL for media
    const mediaUrl = message.file_url ? (message.file_url.startsWith('http') ? message.file_url : `${BASE_BACKEND_URL}${message.file_url}`) : null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} mb-4`}
        >
            <div className={`max-w-[75%] px-4 py-3 rounded-2xl relative shadow-md tracking-tight ${
                isOwn 
                ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-900/20' 
                : 'bg-[#1e293b] text-slate-100 rounded-tl-none border border-white/5 shadow-black/20'
            }`}>
                {/* Location Rendering */}
                {message.type === "location" && (
                    <div className="mb-2 -mx-2 -mt-1 rounded-lg overflow-hidden bg-slate-900 border border-white/5">
                        <div className="h-32 w-full bg-slate-800 flex items-center justify-center relative group">
                            <iframe
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                style={{ border: 0 }}
                                src={`https://www.google.com/maps?q=${message.latitude},${message.longitude}&output=embed`}
                                allowFullScreen
                            ></iframe>
                            <div className="absolute inset-0 bg-transparent group-hover:bg-black/20 transition-colors pointer-events-none flex items-center justify-center">
                                <div className="p-2 bg-[#8b5cf6] rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ExternalLink className="w-4 h-4 text-white" />
                                </div>
                            </div>
                        </div>
                        <div className="p-2 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 overflow-hidden">
                                <MapPin className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                                <span className="text-[10px] font-medium truncate italic text-slate-300">
                                    {message.latitude.toFixed(4)}, {message.longitude.toFixed(4)}
                                </span>
                            </div>
                            <button 
                                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${message.latitude},${message.longitude}`, '_blank')}
                                className="text-[10px] font-bold text-purple-400 hover:text-purple-300 flex-shrink-0"
                            >
                                Open Maps
                            </button>
                        </div>
                    </div>
                )}

                {/* Media Rendering */}
                {message.type === "image" && mediaUrl && (
                    <div className="mb-2 -mx-2 -mt-1 rounded-lg overflow-hidden border border-white/5 bg-slate-900">
                        <img 
                            src={mediaUrl} 
                            alt="Shared" 
                            className="max-h-64 w-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer" 
                            onClick={() => window.open(mediaUrl, '_blank')}
                        />
                    </div>
                )}

                {message.type === "video" && mediaUrl && (
                    <div className="mb-2 -mx-2 -mt-1 rounded-lg overflow-hidden bg-black/40 group relative">
                        <video 
                            src={mediaUrl} 
                            className="max-h-64 w-full" 
                            controls
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <Play className="w-10 h-10 text-white fill-white" />
                        </div>
                    </div>
                )}

                {/* Text Content */}
                {message.message && (
                    <p className={`text-[15px] whitespace-pre-wrap leading-relaxed ${isOwn ? 'text-white' : 'text-slate-200'}`}>
                        {message.message}
                    </p>
                )}

                {/* Metadata */}
                <div className={`flex items-center gap-1.5 mt-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <span className={`text-[10px] font-medium ${isOwn ? 'text-blue-200/70' : 'text-slate-500'}`}>
                        {time}
                    </span>
                    {isOwn && (
                        <CheckCheck className="w-3.5 h-3.5 text-blue-300/70" />
                    )}
                </div>
            </div>
            
            {/* Sender Name (Optional) */}
            {!isOwn && (
                <span className="text-[11px] text-slate-500 mt-1.5 ml-2 font-medium">
                    {message.sender_name || 'Sender'}
                </span>
            )}
        </motion.div>
    );
}
