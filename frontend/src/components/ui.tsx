"use client";
import React from "react";
import { motion } from "framer-motion";

// ─── Skeleton loader ─────────────────────────────────────────────────────────
export function Skeleton({ className = "" }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-muted rounded-xl ${className}`} />
    );
}

// ─── Full-page loading screen ─────────────────────────────────────────────────
export function PageLoader({ label = "Loading..." }: { label?: string }) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
                <div className="absolute inset-2 rounded-full border-t-2 border-accent-purple animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.6s" }} />
            </div>
            <p className="mt-4 text-muted-foreground text-sm font-medium animate-pulse">{label}</p>
        </div>
    );
}

// ─── Inline spinner ──────────────────────────────────────────────────────────
export function Spinner({ size = 20, className = "" }: { size?: number; className?: string }) {
    return (
        <svg
            className={`animate-spin text-current ${className}`}
            style={{ width: size, height: size }}
            fill="none" viewBox="0 0 24 24"
        >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    );
}

// ─── Fade-in wrapper ──────────────────────────────────────────────────────────
export function FadeIn({
    children,
    delay = 0,
    className = "",
    direction = "up"
}: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
    direction?: "up" | "down" | "left" | "right" | "none";
}) {
    const dirMap = {
        up: { y: 24 },
        down: { y: -24 },
        left: { x: 24 },
        right: { x: -24 },
        none: {}
    };
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, ...dirMap[direction] }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </motion.div>
    );
}

// ─── Stagger children ─────────────────────────────────────────────────────────
export function StaggerList({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <motion.div
            className={className}
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        >
            {React.Children.map(children, (child) => (
                <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
                    {child}
                </motion.div>
            ))}
        </motion.div>
    );
}

// ─── Card hover wrapper ───────────────────────────────────────────────────────
export function HoverCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <motion.div
            className={`glass-card ${className}`}
            whileHover={{ y: -3, boxShadow: "0 0 40px rgba(99,102,241,0.15)" }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
            {children}
        </motion.div>
    );
}

// ─── Empty state ─────────────────────────────────────────────────────────────
export function EmptyState({
    icon: Icon,
    title,
    description,
    action
}: {
    icon: React.ElementType;
    title: string;
    description?: string;
    action?: { label: string; onClick: () => void };
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-12 flex flex-col items-center text-center"
        >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-foreground font-bold text-lg mb-2">{title}</h3>
            {description && <p className="text-muted-foreground text-sm max-w-sm">{description}</p>}
            {action && (
                <button onClick={action.onClick} className="btn-primary mt-6 text-sm !px-6 !py-2">
                    {action.label}
                </button>
            )}
        </motion.div>
    );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        pending: "bg-amber-500/10 border-amber-500/30 text-amber-500",
        accepted: "bg-blue-500/10 border-blue-500/30 text-blue-500",
        completed: "bg-emerald-500/10 border-emerald-500/30 text-emerald-500",
        cancelled: "bg-destructive/10 border-destructive/30 text-destructive",
        verified: "bg-emerald-500/10 border-emerald-500/30 text-emerald-500",
        unverified: "bg-muted border-border text-muted-foreground",
    };
    return (
        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${map[status] || "bg-muted border-border text-muted-foreground"}`}>
            {status}
        </span>
    );
}
