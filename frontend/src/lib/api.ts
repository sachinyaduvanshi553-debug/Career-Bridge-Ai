// Hardcoded production backend URL — must include /api prefix for this project
const PRODUCTION_BACKEND_URL = "https://career-setu-backend.onrender.com/api";

const getBaseUrl = (): string => {
    // 1. Check Env Var (Highest Priority)
    let envUrl = process.env.NEXT_PUBLIC_API_URL;
    
    // 2. If it's a full URL, ensure it has /api prefix for this project's architecture
    if (envUrl && envUrl.startsWith("http")) {
        let url = envUrl.trim().replace(/\/$/, "");
        if (!url.endsWith("/api")) {
            url = `${url}/api`;
        }
        return url;
    }
    
    // 3. Robust Hostname-based Detection for Render (Client & Server side)
    const isRender = (typeof window !== "undefined" && window.location.hostname.includes("onrender.com")) || process.env.RENDER === "true";
    if (isRender) {
        return PRODUCTION_BACKEND_URL;
    }
    
    // 4. Fallback for Partial Env Var (e.g. just the host)
    if (envUrl && envUrl.trim().length > 0) {
        let cleaned = envUrl.trim().replace(/\/$/, "");
        if (!cleaned.startsWith("http")) cleaned = `https://${cleaned}`;
        if (!cleaned.endsWith("/api")) cleaned = `${cleaned}/api`;
        return cleaned;
    }

    // 5. Local Dev Default (relies on Next.js proxy in next.config.mjs)
    return "/api";
};

const API_URL = getBaseUrl();
// Base URL without the /api suffix (used for serving static files like uploads)
export const BASE_BACKEND_URL = API_URL.startsWith("http") ? API_URL.replace(/\/api$/, "") : "";

/**
 * Generates a WebSocket URL based on the current environment's API URL.
 * Converts http:// to ws:// and https:// to wss://
 */
export const getWsUrl = (path: string): string => {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    if (API_URL.startsWith("http")) {
        const wsProtocol = API_URL.startsWith("https") ? "wss" : "ws";
        const host = API_URL.replace(/^https?:\/\//, "");
        return `${wsProtocol}://${host}${cleanPath}`;
    }
    // Fallback for local development proxy (Next.js)
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    return `${protocol}://${window.location.host}/api${cleanPath}`;
};

if (typeof window !== "undefined") {
    console.log(`[Career Setu API] Base URL: ${API_URL}`);
    console.log(`[Career Setu API] Static Assets URL: ${BASE_BACKEND_URL || "Local Proxy"}`);
}


export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    // Ensure endpoint starts with / if it doesn't already
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    
    // Construct final URL
    const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${cleanEndpoint}`.replace(/([^:]\/)\/+/g, "$1");
    
    console.log(`[API] calling: ${options.method || 'GET'} ${url}`);
    
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
        console.error(`[API ERROR] ${options.method || 'GET'} ${url}: `, error);
        
        // FastAPI uses 'detail', generic may use 'message'
        const errorMessage = error.detail 
            ? (typeof error.detail === 'string' ? error.detail : JSON.stringify(error.detail))
            : (error.message || "Something went wrong");
        throw new Error(errorMessage);
    }
    return response.json();
}

const uploadFile = async (file: File, endpoint: string = "/chat/upload"): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    
    // Ensure accurate URL construction
    const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
    
    const response = await fetch(url, {
        method: "POST",
        body: formData,
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
    });
    
    if (!response.ok) {
        const err = await response.text();
        throw new Error(err || "Upload failed");
    }
    return response.json();
};

export const api = {
    // Shared Upload
    uploadFile,

    // Auth
    register: (data: any) => fetchWithAuth("/auth/register", { method: "POST", body: JSON.stringify(data) }),
    login: (credentials: any) => fetchWithAuth("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
    getProfile: () => fetchWithAuth("/profile"),
    updateProfile: (data: any) => fetchWithAuth("/profile/update", { method: "POST", body: JSON.stringify(data) }),

    // Careers & Skills
    getRecommendations: (skills: string[]) => fetchWithAuth(`/career/recommend?skills=${skills.join(",")}`),
    getSkillGap: (userSkills: string[], roleId: string) => fetchWithAuth("/skills/gap", { method: "POST", body: JSON.stringify({ user_skills: userSkills, role_id: roleId }) }),
    getRoadmap: (roleId: string) => fetchWithAuth(`/roadmap/${roleId}`),

    // Jobs
    getJobs: (location?: string) => fetchWithAuth(`/jobs${location ? `?location=${location}` : ""}`),

    // Resume
    analyzeResume: (file: File) => api.uploadFile(file, "/resume/analyze"),

    // Interview
    startInterview: (roleId: string) => fetchWithAuth("/interview/start", { method: "POST", body: JSON.stringify({ role_id: roleId }) }),
    evaluateAnswer: (question: string, answer: string) => fetchWithAuth("/interview/evaluate", { method: "POST", body: JSON.stringify({ question, answer }) }),

    // Worker Dashboard
    verifyAadhaar: (aadhaar: string) => fetchWithAuth("/worker/verify/aadhaar", { method: "POST", body: JSON.stringify({ aadhaar_number: aadhaar }) }),
    getWorkerProfile: () => fetchWithAuth("/worker/profile"),
    updateWorkerProfile: (data: any) => fetchWithAuth("/worker/profile/update", { method: "POST", body: JSON.stringify(data) }),
    getWorkerRequests: () => fetchWithAuth("/worker/requests"),
    updateWorkerRequestStatus: (requestId: string, status: string) => fetchWithAuth(`/worker/requests/${requestId}/update-status`, { method: "POST", body: JSON.stringify({ status }) }),
    uploadWorkerWork: (file: File) => api.uploadFile(file, "/worker/upload-work"),
    uploadProfilePhoto: (file: File) => api.uploadFile(file, "/chat/upload"),

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
    getChatUsers: (query?: string) => fetchWithAuth(`/chat/users${query ? `?query=${encodeURIComponent(query)}` : ""}`),
    getConversations: () => fetchWithAuth("/chat/conversations"),
    getChatHistory: (receiverEmail: string) => {
        const token = localStorage.getItem("token");
        return fetchWithAuth(`/chat/history/${receiverEmail}?token=${token}`);
    },
    uploadChatMedia: (file: File) => api.uploadFile(file, "/chat/upload"),
    getConnectionStatus: (targetEmail: string) => fetchWithAuth(`/chat/connection-status/${targetEmail}`),
    getPendingRequests: () => fetchWithAuth(`/chat/requests/pending`),
    sendChatRequest: (receiverEmail: string) => fetchWithAuth("/chat/requests/send", { method: "POST", body: JSON.stringify({ receiver_email: receiverEmail }) }),
    respondChatRequest: (requesterEmail: string, status: string) => fetchWithAuth("/chat/requests/respond", { method: "POST", body: JSON.stringify({ requester_email: requesterEmail, status }) }),

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

    // AI Assistant
    assistantQuery: (data: { transcript: string, pathname: string }) => fetchWithAuth("/assistant/query", {
        method: "POST",
        body: JSON.stringify(data)
    }),

    // AI Cover Letter (New Feature)
    generateCoverLetter: (data: { target_role: string, job_description?: string }) => fetchWithAuth("/cover-letter/generate", {
        method: "POST",
        body: JSON.stringify(data)
    }),
};
