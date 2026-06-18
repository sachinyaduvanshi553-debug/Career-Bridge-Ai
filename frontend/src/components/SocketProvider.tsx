"use client";
import { useEffect, useState, createContext, useContext, useCallback, useRef } from "react";
import { toast } from "sonner";

// Dynamically import socket.io-client only on the client side to avoid SSR issues
interface SocketContextType {
    isConnected: boolean;
    emit: (event: string, data: any) => void;
    socket: any | null;
}

const SocketContext = createContext<SocketContextType>({
    isConnected: false,
    emit: () => {},
    socket: null,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [socket, setSocket] = useState<any>(null);
    const socketRef = useRef<any>(null);


    useEffect(() => {
        // Only run on the client side
        if (typeof window === "undefined") return;

        const userStr = localStorage.getItem("user");
        if (!userStr) return;

        let user: any;
        try {
            user = JSON.parse(userStr);
        } catch {
            return;
        }

        // Dynamically import to avoid SSR issues
        import("socket.io-client").then(({ io }) => {
            const protocol = window.location.protocol === "https:" ? "https" : "http";
            const host = window.location.hostname === "localhost" ? "localhost:8000" : window.location.host;

            const socketInstance = io(`${protocol}://${host}`, {
                path: "/ws/socket.io",
                transports: ["websocket"],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 2000,
            });

            socketInstance.on("connect", () => {
                setIsConnected(true);
                console.log("[Socket] Connected to Real-time Engine");
                if (user?.email) {
                    socketInstance.emit("authenticate", { 
                        email: user.email,
                        name: user.name || user.full_name || user.email.split('@')[0],
                        role: user.role || 'member'
                    });
                }
            });

            socketInstance.on("disconnect", () => {
                setIsConnected(false);
                console.log("[Socket] Disconnected from Real-time Engine");
            });

            socketInstance.on("connect_error", (err: any) => {
                // Silently handle – sockets are optional for core functionality
                console.warn("[Socket] Connection issue:", err.message);
            });

            socketInstance.on("request_update", (data: any) => {
                console.log("[Socket] Request update:", data);
                toast.info("Work Update", { description: data.message || `Request #${data.id} is now ${data.status}` });
                window.dispatchEvent(new CustomEvent("WORK_REQUEST_UPDATE", { detail: data }));
            });

            socketInstance.on("request_claimed", (data: any) => {
                window.dispatchEvent(new CustomEvent("WORK_REQUEST_CLAIMED", { detail: data }));
            });

            // Heartbeat Interval to keep connection alive and update presence
            const heartbeatInterval = setInterval(() => {
                if (socketInstance.connected && user?.email) {
                    socketInstance.emit("heartbeat", { email: user.email });
                }
            }, 30000); // 30 seconds

            socketRef.current = socketInstance;
            setSocket(socketInstance);
            
            return () => {
                clearInterval(heartbeatInterval);
                socketInstance.disconnect();
            };
        }).catch((err) => {
            console.warn("[Socket] Failed to load socket.io-client:", err);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    const emit = useCallback((event: string, data: any) => {
        if (socketRef.current) {
            socketRef.current.emit(event, data);
        }
    }, []);

    return (
        <SocketContext.Provider value={{ isConnected, emit, socket }}>
            {children}
        </SocketContext.Provider>
    );
};
