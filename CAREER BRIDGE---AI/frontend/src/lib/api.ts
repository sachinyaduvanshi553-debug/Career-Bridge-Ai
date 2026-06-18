const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;
    
    // Get token from localStorage (standard for client-side Auth)
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Something went wrong");
    }
    return response.json();
}

export const api = {
    // Auth
    register: (data: any) => fetchWithAuth("/auth/register", { method: "POST", body: JSON.stringify(data) }),
    login: (credentials: any) => fetchWithAuth("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
    getProfile: () => fetchWithAuth("/profile"),

    // Careers & Skills
    getRecommendations: (skills: string[]) => fetchWithAuth(`/career/recommend?skills=${skills.join(",")}`),
    getSkillGap: (userSkills: string[], roleId: string) => fetchWithAuth("/skills/gap", { method: "POST", body: JSON.stringify({ user_skills: userSkills, role_id: roleId }) }),
    getRoadmap: (roleId: string) => fetchWithAuth(`/roadmap/${roleId}`),

    // Jobs
    getJobs: (location?: string) => fetchWithAuth(`/jobs${location ? `?location=${location}` : ""}`),

    // Resume
    analyzeResume: async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/resume/analyze`, {
            method: "POST",
            body: formData,
            headers: token ? { "Authorization": `Bearer ${token}` } : {},
        });
        return response.json();
    },

    // Interview
    startInterview: (roleId: string) => fetchWithAuth("/interview/start", { method: "POST", body: JSON.stringify({ role_id: roleId }) }),
    evaluateAnswer: (question: string, answer: string) => fetchWithAuth("/interview/evaluate", { method: "POST", body: JSON.stringify({ question, answer }) }),

    // Worker Dashboard (New)
    verifyAadhaar: (aadhaar: string) => fetchWithAuth("/worker/verify/aadhaar", { method: "POST", body: JSON.stringify({ aadhaar_number: aadhaar }) }),
    getWorkerProfile: () => fetchWithAuth("/worker/profile"),
    updateWorkerProfile: (data: any) => fetchWithAuth("/worker/profile/update", { method: "POST", body: JSON.stringify(data) }),
    getWorkerRequests: () => fetchWithAuth("/worker/requests"),

    // Customer Dashboard (New)
    discoverServices: (query?: string) => fetchWithAuth(`/customer/services${query ? `?query=${query}` : ""}`),
    createServiceRequest: (data: any) => fetchWithAuth("/customer/request", { method: "POST", body: JSON.stringify(data) }),
    getCustomerRequests: () => fetchWithAuth("/customer/my-requests"),
    getCustomerStats: () => fetchWithAuth("/customer/stats"),

    // Admin Dashboard (New)
    getAdminUsers: () => fetchWithAuth("/admin/users"),
    getAdminStats: () => fetchWithAuth("/admin/stats"),
    verifyUser: (email: string, status: boolean) => fetchWithAuth(`/admin/verify/${email}?status=${status}`, { method: "POST" }),

    // Analytics (Existing)
    getAnalyticsOverview: () => fetchWithAuth("/analytics/overview"),
    getAnalyticsDistricts: (state?: string) => fetchWithAuth(`/analytics/districts${state ? `?state=${state}` : ""}`),

    // Chat (New)
    getChatUsers: () => fetchWithAuth("/chat/users"),
    getConversations: () => fetchWithAuth("/chat/conversations"),
    getChatHistory: (receiverEmail: string) => {
        const token = localStorage.getItem("token");
        return fetchWithAuth(`/chat/history/${receiverEmail}?token=${token}`);
    },
    uploadChatMedia: async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/chat/upload`, {
            method: "POST",
            body: formData,
            headers: token ? { "Authorization": `Bearer ${token}` } : {},
        });
        return response.json();
    },

    // Identity & Verification (New)
    verifyIdentity: (docType: string, docNum: string) => fetchWithAuth("/identity/verify", { 
        method: "POST", 
        body: JSON.stringify({ document_type: docType, document_number: docNum }) 
    }),
    getIdentityStatus: () => fetchWithAuth("/identity/status"),

    // Location Tracking
    updateUserLocation: (lat: number, lng: number) => fetchWithAuth("/profile/update-location", {
        method: "POST",
        body: JSON.stringify({ latitude: lat, longitude: lng })
    }),
};
