"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react";

type NotifType = "success" | "error" | "warning" | "info";
interface Notification { id: string; type: NotifType; title: string; message?: string; }

interface NotifContextType {
    notify: (type: NotifType, title: string, message?: string) => void;
}

const NotifContext = createContext<NotifContextType>({ notify: () => {} });

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const notify = useCallback((type: NotifType, title: string, message?: string) => {
        const id = Math.random().toString(36).slice(2);
        setNotifications(prev => [...prev, { id, type, title, message }]);
        setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
    }, []);

    const dismiss = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

    const icons = {
        success: CheckCircle2,
        error: XCircle,
        warning: AlertCircle,
        info: Info
    };
    const colors = {
        success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        error: "border-destructive/40 bg-destructive/10 text-destructive",
        warning: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
        info: "border-primary/40 bg-primary/10 text-primary"
    };

    return (
        <NotifContext.Provider value={{ notify }}>
            {children}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {notifications.map(n => {
                        const Icon = icons[n.type];
                        return (
                            <motion.div
                                key={n.id}
                                initial={{ opacity: 0, x: 60, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 60, scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl max-w-sm ${colors[n.type]}`}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm tracking-tight">{n.title}</p>
                                    {n.message && <p className="text-xs opacity-90 mt-0.5">{n.message}</p>}
                                </div>
                                <button
                                    onClick={() => dismiss(n.id)}
                                    className="opacity-40 hover:opacity-100 transition-opacity flex-shrink-0"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </NotifContext.Provider>
    );
}

export const useNotify = () => useContext(NotifContext).notify;
