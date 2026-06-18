import React from "react";
import { Clock, Timer, Flame } from "lucide-react";

interface SessionTimerProps {
    sessionSeconds: number;
    totalMinutes: number;
    currentStreak: number;
}

export default function SessionTimer({ sessionSeconds, totalMinutes, currentStreak }: SessionTimerProps) {
    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    const formatTotalInvested = (mins: number) => {
        if (mins < 60) return `${mins}m`;
        const hrs = Math.floor(mins / 60);
        return `${hrs}h ${mins % 60}m`;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="glass-card p-6 flex items-center justify-between relative overflow-hidden group">
                <div className="relative z-10">
                    <p className="text-dark-400 text-sm font-semibold tracking-wider uppercase mb-1">Current Session</p>
                    <h3 className="text-3xl font-display font-bold text-white tracking-widest">{formatTime(sessionSeconds)}</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center relative z-10 border border-primary-500/20 group-hover:scale-110 transition-transform">
                    <Clock className="w-6 h-6 text-primary-400" />
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary-500/5 rounded-full blur-2xl transition-all group-hover:bg-primary-500/10"></div>
            </div>

            <div className="glass-card p-6 flex items-center justify-between relative overflow-hidden group">
                <div className="relative z-10">
                    <p className="text-dark-400 text-sm font-semibold tracking-wider uppercase mb-1">Time Invested</p>
                    <h3 className="text-3xl font-display font-bold text-white">{formatTotalInvested(totalMinutes)}</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-accent-cyan/10 flex items-center justify-center relative z-10 border border-accent-cyan/20 group-hover:scale-110 transition-transform">
                    <Timer className="w-6 h-6 text-accent-cyan" />
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-accent-cyan/5 rounded-full blur-2xl transition-all group-hover:bg-accent-cyan/10"></div>
            </div>

            <div className="glass-card p-6 flex items-center justify-between relative overflow-hidden group">
                <div className="relative z-10">
                    <p className="text-dark-400 text-sm font-semibold tracking-wider uppercase mb-1">Focus Streak</p>
                    <h3 className="text-3xl font-display font-bold text-white flex items-baseline gap-2">
                        {currentStreak} <span className="text-sm text-dark-400 font-normal">Days</span>
                    </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-accent-amber/10 flex items-center justify-center relative z-10 border border-accent-amber/20 group-hover:scale-110 transition-transform">
                    <Flame className="w-6 h-6 text-accent-amber" />
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-accent-amber/5 rounded-full blur-2xl transition-all group-hover:bg-accent-amber/10"></div>
            </div>
        </div>
    );
}
