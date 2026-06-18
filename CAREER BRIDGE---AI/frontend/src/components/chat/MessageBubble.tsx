"use client";

import { motion } from "framer-motion";
import { Check, CheckCheck, FileIcon, Play, ExternalLink, MapPin } from "lucide-react";

interface MessageBubbleProps {
    message: any;
    isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
    const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Determine backend URL for media
    const baseUrl = "http://localhost:8000";
    const mediaUrl = message.file_url ? (message.file_url.startsWith('http') ? message.file_url : `${baseUrl}${message.file_url}`) : null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} mb-4`}
        >
            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl relative shadow-md ${
                isOwn 
                ? 'bg-primary-500 text-white rounded-tr-none' 
                : 'bg-dark-800 text-dark-100 rounded-tl-none border border-white/5'
            }`}>
                {/* Media ... */}

                {/* Location Rendering */}
                {message.type === "location" && (
                    <div className="mb-2 -mx-2 -mt-1 rounded-lg overflow-hidden bg-dark-900 border border-white/10">
                        <div className="h-32 w-full bg-dark-800 flex items-center justify-center relative group">
                            <iframe
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                style={{ border: 0 }}
                                src={`https://www.google.com/maps?q=${message.latitude},${message.longitude}&output=embed`}
                                allowFullScreen
                            ></iframe>
                            <div className="absolute inset-0 bg-transparent group-hover:bg-black/20 transition-colors pointer-events-none flex items-center justify-center">
                                <div className="p-2 bg-primary-500 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ExternalLink className="w-4 h-4 text-white" />
                                </div>
                            </div>
                        </div>
                        <div className="p-2 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 overflow-hidden">
                                <MapPin className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" />
                                <span className="text-[10px] font-medium truncate italic text-dark-300">
                                    {message.latitude.toFixed(4)}, {message.longitude.toFixed(4)}
                                </span>
                            </div>
                            <button 
                                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${message.latitude},${message.longitude}`, '_blank')}
                                className="text-[10px] font-bold text-primary-400 hover:underline flex-shrink-0"
                            >
                                Open Maps
                            </button>
                        </div>
                    </div>
                )}
                {/* Media Rendering */}
                {message.type === "image" && mediaUrl && (
                    <div className="mb-2 -mx-2 -mt-1 rounded-lg overflow-hidden border border-white/10 dark:border-black/20">
                        <img 
                            src={mediaUrl} 
                            alt="Shared" 
                            className="max-h-60 w-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer" 
                            onClick={() => window.open(mediaUrl, '_blank')}
                        />
                    </div>
                )}

                {message.type === "video" && mediaUrl && (
                    <div className="mb-2 -mx-2 -mt-1 rounded-lg overflow-hidden bg-black/20 group relative">
                        <video 
                            src={mediaUrl} 
                            className="max-h-60 w-full" 
                            controls
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <Play className="w-10 h-10 text-white fill-white" />
                        </div>
                    </div>
                )}

                {/* Text Content */}
                {message.message && (
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {message.message}
                    </p>
                )}

                {/* Metadata */}
                <div className={`flex items-center gap-1.5 mt-1.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <span className={`text-[10px] ${isOwn ? 'text-primary-100/70' : 'text-dark-500'}`}>
                        {time}
                    </span>
                    {isOwn && (
                        <CheckCheck className="w-3 h-3 text-primary-100/70" />
                    )}
                </div>
            </div>
            
            {/* Sender Name (Optional) */}
            {!isOwn && (
                <span className="text-[10px] text-dark-500 mt-1 ml-1 font-medium px-1">
                    {message.sender_name || 'Sender'}
                </span>
            )}
        </motion.div>
    );
}
