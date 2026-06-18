import React from "react";

interface ActivityHeatmapProps {
    activityDates: Record<string, number>;
}

export default function ActivityHeatmap({ activityDates }: ActivityHeatmapProps) {
    const totalDays = 84; // 12 weeks representation
    const today = new Date();
    
    const days = Array.from({ length: totalDays }).map((_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (totalDays - 1 - i));
        const dateStr = d.toISOString().split("T")[0];
        const intensity = activityDates[dateStr] || 0;
        return { dateStr, intensity, dateObj: d };
    });

    const getIntensityColor = (intensity: number) => {
        if (intensity === 0) return "bg-dark-800/50 border-dark-700/50";
        if (intensity < 3) return "bg-primary-500/30 border-primary-500/20";
        if (intensity < 6) return "bg-primary-500/60 border-primary-500/40";
        return "bg-primary-500/90 border-primary-400/50 glow-indigo shadow-[0_0_10px_rgba(99,102,241,0.5)]";
    };

    return (
        <div className="glass-card p-6 w-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white font-display">Activity Heatmap</h3>
                    <p className="text-sm text-dark-400">Your engagement history over the last 12 weeks</p>
                </div>
            </div>

            <div className="overflow-x-auto pb-4">
                <div className="min-w-max flex gap-2">
                    {Array.from({ length: 12 }).map((_, weekIdx) => {
                        return (
                            <div key={`week-${weekIdx}`} className="flex flex-col gap-2">
                                {Array.from({ length: 7 }).map((_, dayIdx) => {
                                    const dayOriginalIdx = weekIdx * 7 + dayIdx;
                                    const day = days[dayOriginalIdx];
                                    if (!day) return null;
                                    
                                    const formattedDate = day.dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                                    const tooltipText = `${day.intensity} activities on ${formattedDate}`;

                                    return (
                                        <div
                                            key={day.dateStr}
                                            title={tooltipText}
                                            className={`w-4 h-4 rounded-sm border ${getIntensityColor(day.intensity)} transition-transform duration-200 hover:scale-125 cursor-pointer`}
                                        ></div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
            
            <div className="flex items-center justify-end gap-2 text-xs text-dark-400 mt-2">
                <span>Less</span>
                <div className="w-3 h-3 rounded-sm border bg-dark-800/50 border-dark-700/50"></div>
                <div className="w-3 h-3 rounded-sm border bg-primary-500/30 border-primary-500/20"></div>
                <div className="w-3 h-3 rounded-sm border bg-primary-500/60 border-primary-500/40"></div>
                <div className="w-3 h-3 rounded-sm border bg-primary-500/90 border-primary-400/50"></div>
                <span>More</span>
            </div>
        </div>
    );
}
