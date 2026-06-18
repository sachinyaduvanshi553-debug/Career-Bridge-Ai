"use client";
import React, { useEffect, useState, useRef } from "react";
import { Mic, MicOff, Volume2, X, MessageCircle, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { motion, AnimatePresence } from "framer-motion";

// 🎙️ Pure Hindi Page Guidance for Blue-Collar Users (Production Ready)
const LOCAL_PAGE_GUIDES: Record<string, string> = {
    "/": "करियर सेतु में आपका स्वागत है! यहाँ आप अपनी पसंद की नौकरी ढूँढ सकते हैं। 'Get Started' बटन दबाकर शुरुआत करें।",
    "/dashboard": "यह आपका डैशबोर्ड है। यहाँ आप अपनी प्रोग्रेस और नई नौकरियों के सुझाव देख सकते हैं।",
    "/profile": "यह आपका प्रोफाइल है। यहाँ अपनी जानकारी जैसे नाम, पता और स्किल्स भरें ताकि आपको अच्छी नौकरी मिले।",
    "/jobs": "यहाँ आपके लिए ताज़ा नौकरियाँ हैं। अपनी लोकेशन के हिसाब से नौकरी चुनें और सीधे अप्लाई करें।",
    "/skills": "यहाँ आप देख सकते हैं कि अच्छी नौकरी के लिए आपको और क्या सीखने की ज़रूरत है।",
    "/roadmap": "यह आपका सीखने का रास्ता है। यहाँ अगले 30, 60 और 90 दिनों का प्लान है।",
    "/resume": "यहाँ अपना रेज़्यूमे अपलोड करें। हमारा एआई उसे चेक करके बेहतर बनाने में मदद करेगा।",
    "/interview": "इंटरव्यू की तैयारी के लिए यहाँ एआई के साथ बातचीत करें। इससे आपका आत्मविश्वास बढ़ेगा।",
    "/analytics": "यहाँ आप देख सकते हैं कि आपके क्षेत्र में कौन सी नौकरियों की सबसे ज़्यादा मांग है।",
    "/chat": "यहाँ आप अन्य लोगों और मालिकों से सीधे चैट पर बात कर सकते हैं।",
    "/login": "यहाँ अपना नंबर और पासवर्ड डालकर लॉगिन करें। अगर पासवर्ड भूल गए हैं तो 'Forgot Password' दबाएँ।",
    "/register": "नया अकाउंट बनाने के लिए अपना नाम, नंबर और काम करने का तरीका (रोल) चुनें।",
};

export function GlobalVoiceAssistant() {
    const { 
        isVoiceEnabled, isListening,
        toggleVoice, startListening, stopListening, speak
    } = useVoiceAssistant();
    const pathname = usePathname();
    const [hasInteracted, setHasInteracted] = useState(false);
    const [assistantResponse, setAssistantResponse] = useState("");
    const lastPath = useRef(pathname);

    // Initial interaction tracker
    useEffect(() => {
        const handleFirstInteraction = () => {
            setHasInteracted(true);
            window.removeEventListener("click", handleFirstInteraction);
        };
        window.addEventListener("click", handleFirstInteraction);
        return () => window.removeEventListener("click", handleFirstInteraction);
    }, []);

    // Manual Page Help Request
    useEffect(() => {
        if (!isListening && isVoiceEnabled && hasInteracted) {
             // If mic stopped, and we have guidance for current page - tell them.
             // Actually, the button itself can trigger the guidance.
        }
    }, [isListening, isVoiceEnabled, hasInteracted]);

    const handleHelpRequest = () => {
        setHasInteracted(true);
        if (!isVoiceEnabled) {
            toggleVoice();
            return;
        }
        
        const guidance = LOCAL_PAGE_GUIDES[pathname] || "नमस्ते! हम आपकी मदद के लिए तैयार हैं।";
        setAssistantResponse(guidance);
        speak(guidance);
    };

    // Focus listener for field guidance (Fast Response)
    useEffect(() => {
        if (!isVoiceEnabled || !hasInteracted) return;
        const handleFocus = (e: FocusEvent) => {
            const el = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
            if (!el) return;
            const id = (el.id || el.name || ("placeholder" in el ? el.placeholder : "") || "").toLowerCase();
            
            if (id.includes("name")) speak("अपना नाम भरें।");
            else if (id.includes("phone") || id.includes("mobile")) speak("अपना मोबाइल नंबर डालें।");
            else if (id.includes("skill")) speak("अपनी स्किल्स के बारे में बताएँ।");
            else if (id.includes("location")) speak("अपना शहर चुनें।");
        };
        document.addEventListener("focusin", handleFocus);
        return () => document.removeEventListener("focusin", handleFocus);
    }, [isVoiceEnabled, hasInteracted, speak]);

    // Page Greetings (Auto-explain when entering a new page)
    useEffect(() => {
        if (!isVoiceEnabled || !hasInteracted || lastPath.current === pathname) return;
        lastPath.current = pathname;
        
        const timer = setTimeout(() => {
            if (LOCAL_PAGE_GUIDES[pathname]) {
                const text = LOCAL_PAGE_GUIDES[pathname];
                setAssistantResponse(text);
                speak(text);
            }
        }, 1200);
        return () => clearTimeout(timer);
    }, [pathname, isVoiceEnabled, hasInteracted, speak]);

    // Voice Wave Component
    const VoiceWave = () => (
        <div className="flex items-center gap-1 h-4">
            {[1, 2, 3, 4, 5].map((i) => (
                <motion.div
                    key={i}
                    animate={{ height: isListening ? [4, 16, 4] : 4 }}
                    transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                    className="w-1 bg-accent-emerald rounded-full"
                />
            ))}
        </div>
    );

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4 pointer-events-none">
            
            {/* Guidance Display */}
            <AnimatePresence>
                {assistantResponse && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="bg-slate-900/95 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl max-w-sm pointer-events-auto flex flex-col gap-2"
                    >
                        <div className="flex items-center justify-between gap-8 border-b border-white/5 pb-2">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary-400" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-dark-400">
                                    Hindi Guide
                                </span>
                            </div>
                            <button onClick={() => setAssistantResponse("")} className="text-dark-400 hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-sm font-medium text-white leading-relaxed italic">
                            {assistantResponse}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center gap-3">
                {/* Secondary Help Text bubble */}
                <AnimatePresence>
                    {isVoiceEnabled && !assistantResponse && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="bg-primary-600 px-4 py-2 rounded-xl text-white text-xs font-bold shadow-lg pointer-events-auto flex items-center gap-2"
                        >
                            मदद चाहिए? 🎙️
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Help Button */}
                <button
                    onClick={handleHelpRequest}
                    className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 pointer-events-auto group ${
                        isVoiceEnabled 
                            ? "bg-primary-500 text-white" 
                            : "bg-slate-900 text-dark-500 border border-white/10 grayscale"
                    }`}
                >
                    <div className="relative z-10">
                         <Volume2 className="w-6 h-6" />
                    </div>

                    {isVoiceEnabled && (
                        <motion.div 
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0 bg-primary-500/20 rounded-full"
                        />
                    )}
                </button>
            </div>
            
            {/* Toggle State Label (small) */}
            <button 
                onClick={toggleVoice}
                className="text-[10px] font-bold uppercase tracking-widest text-dark-500 hover:text-white transition-colors pointer-events-auto mr-4"
            >
                {isVoiceEnabled ? "Voice Enabled" : "Voice Disabled"}
            </button>
        </div>
    );
}
