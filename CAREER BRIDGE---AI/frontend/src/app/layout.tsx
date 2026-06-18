import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "CAREER BRIDGE - AI – Intelligent Career & Upskilling Platform",
    description:
        "AI-powered career guidance and skill development platform. Identify skill gaps, get personalized learning roadmaps, and connect with real job opportunities across India.",
    keywords: "career guidance, skill development, AI, upskilling, jobs, India, Career Bridge",
    icons: {
        icon: "/logo.png",
    },
};


export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className="dark">
            <body className="bg-dark-950 text-dark-200 antialiased bg-grid min-h-screen">
                {children}
            </body>
        </html>
    );
}
