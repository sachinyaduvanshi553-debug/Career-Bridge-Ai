import type { Metadata, Viewport } from "next";
import "./globals.css";
import { NotificationProvider } from "@/components/NotificationProvider";
import { GlobalVoiceAssistant } from "@/components/GlobalVoiceAssistant";
import { SocketProvider } from "@/components/SocketProvider";
import PageTransition from "@/components/PageTransition";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster } from "sonner";
import { SWRProvider } from "@/components/SWRProvider";
import PWARegister from "@/components/PWARegister";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
    title: "Career Bridge AI — Intelligent Career & Upskilling Platform",
    description:
        "AI-powered career guidance and skill development platform. Identify skill gaps, get personalized learning roadmaps, and connect with real job opportunities across India.",
    keywords: "career guidance, skill development, AI, upskilling, jobs, India, Career Bridge",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "Career Bridge",
    },
};

export const viewport: Viewport = {
    themeColor: "#6366f1",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <body className="bg-dark-950 text-dark-200 antialiased bg-grid min-h-screen relative overflow-x-hidden">
                <PWARegister />
                <ThemeProvider>
                    <NotificationProvider>
                        <SocketProvider>
                            <SWRProvider>
                                <ErrorBoundary>
                                    <PageTransition>
                                        {children}
                                    </PageTransition>
                                </ErrorBoundary>
                                <GlobalVoiceAssistant />
                            </SWRProvider>
                            <Toaster position="bottom-right" theme="dark" richColors />
                        </SocketProvider>
                    </NotificationProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
