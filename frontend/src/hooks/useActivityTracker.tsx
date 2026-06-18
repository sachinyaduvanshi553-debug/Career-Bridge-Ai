"use client";
import { useState, useEffect } from "react";

export interface ActivityData {
    totalMinutes: number;
    currentStreak: number;
    activityDates: Record<string, number>; // ISO Date string -> activity intensity mapping
    lastLoginDate: string;
}

export function useActivityTracker(userEmail: string | undefined) {
    const [sessionTime, setSessionTime] = useState(0); // in seconds
    const [stats, setStats] = useState<ActivityData>({
        totalMinutes: 0,
        currentStreak: 0,
        activityDates: {},
        lastLoginDate: "",
    });

    useEffect(() => {
        if (!userEmail) return;

        const storageKey = `activity_${userEmail}`;
        const stored = localStorage.getItem(storageKey);
        
        let initialStats: ActivityData = { totalMinutes: 0, currentStreak: 0, activityDates: {}, lastLoginDate: "" };
        const today = new Date().toISOString().split("T")[0];
        
        if (stored) {
            try {
                initialStats = JSON.parse(stored);
            } catch (e) {
                console.error("Invalid activity data");
            }
        }

        // Initialize ActivityDates map if somehow missing
        if (!initialStats.activityDates) initialStats.activityDates = {};

        // Streak Calculation Logic
        if (initialStats.lastLoginDate !== today) {
            const yesterdayDate = new Date();
            yesterdayDate.setDate(yesterdayDate.getDate() - 1);
            const yesterdayStr = yesterdayDate.toISOString().split("T")[0];

            if (initialStats.lastLoginDate === yesterdayStr) {
                initialStats.currentStreak += 1; // Continued streak!
            } else if (initialStats.lastLoginDate !== today) {
                initialStats.currentStreak = 1; // Streak broken, restart at 1
            }
            
            initialStats.lastLoginDate = today;
            initialStats.activityDates[today] = (initialStats.activityDates[today] || 0) + 1; // 1 point for loging in
            
            localStorage.setItem(storageKey, JSON.stringify(initialStats));
        }

        setStats(initialStats);

        // Timer 1: Session Timer counts up every second for smooth UI display
        const secondInterval = setInterval(() => {
            setSessionTime((prev) => prev + 1);
        }, 1000);

        // Timer 2: Total Life Time counts up every minute, persisted permanently
        const minuteInterval = setInterval(() => {
            setStats((prev) => {
                const newStats = { ...prev, totalMinutes: prev.totalMinutes + 1 };
                localStorage.setItem(storageKey, JSON.stringify(newStats));
                return newStats;
            });
        }, 60000);

        return () => {
            clearInterval(secondInterval);
            clearInterval(minuteInterval);
        };
    }, [userEmail]);

    // Public method to be called from other parts of the app when user performs an action
    const logActivity = (points = 1) => {
        if (!userEmail) return;
        const storageKey = `activity_${userEmail}`;
        const today = new Date().toISOString().split("T")[0];
        
        setStats((prev) => {
            const newStats = { ...prev };
            newStats.activityDates[today] = (newStats.activityDates[today] || 0) + points;
            localStorage.setItem(storageKey, JSON.stringify(newStats));
            return newStats;
        });
    };

    return { sessionTime, stats, logActivity };
}
