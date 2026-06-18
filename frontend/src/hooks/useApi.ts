import useSWR from "swr";
import { api } from "@/lib/api";

// Use the singleton API instance's internal fetch wrapper or standard API functions

// A generic fetcher using the centralized api class
const fetcher = (url: string) => fetch(url, {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
}).then(res => {
    if (!res.ok) throw new Error("Failed to fetch data");
    return res.json();
});

export function useProfile() {
    return useSWR("/api/profile", () => api.getProfile(), {
        revalidateOnFocus: true,
        shouldRetryOnError: false, // Don't keep retrying if 401
    });
}

export function useJobs(skills: string, location?: string) {
    const params = new URLSearchParams({ skills });
    if (location) params.append("location", location);
    
    return useSWR(skills ? `/api/jobs?${params.toString()}` : null, fetcher, {
        revalidateOnFocus: false, // Jobs update less frequently
        dedupingInterval: 60000, // dedupe requests for 1 min
    });
}

export function useAnalyticsOverview() {
    return useSWR("/api/analytics/overview", fetcher, {
        revalidateOnFocus: true
    });
}
