/**
 * VoiceAssistant Utility — Supercharged
 * Uses Web Speech API for TTS (Hindi/English).
 * Uses Web SpeechRecognition for STT (Hindi/English).
 */

export const HINDI_PHRASES = {
    WELCOME: "नमस्ते! करियर सेतु एआई में आपका स्वागत है। यहाँ आपको अपनी पसंद का काम और सीखने के बेहतरीन मौके मिलेंगे।",
    ENTER_NAME: "अपना पूरा नाम यहाँ लिखें।",
    ENTER_PHONE: "अपना मोबाइल नंबर यहाँ दर्ज करें।",
    REGISTER_SUCCESS: "बधाई हो! आपका अकाउंट बन गया है। अब आप अपनी प्रोफाइल पूरी कर सकते हैं।",
    VERIFY_AADHAAR_PROMPT: "पहचान पक्की करने के लिए अपना आधार नंबर डालें। यह पूरी तरह सुरक्षित है।",
    VERIFY_SUCCESS: "आधार सफलतापूर्वक सत्यापित हो गया है।",
    UPDATE_PROFILE: "अपनी प्रोफाइल अपडेट करें ताकि हम आपको सही काम दिखा सकें।",
    ACCEPT_JOB: "काम स्वीकार कर लिया गया है। अब आप अगले स्टेप्स देख सकते हैं।",
    REJECT_JOB: "कोई बात नहीं, हम आपके लिए दूसरा बेहतर काम ढूँढेंगे।",
    ENABLE_VOICE: "आवाज़ सहायता चालू है। मैं आपकी हर कदम पर मदद करूँगा।",
    DISABLE_VOICE: "आवाज़ सहायता बंद कर दी गई है।",
    CHAT_PROMPT: "यहाँ से आप सीधे बात कर सकते हैं और सवाल पूछ सकते हैं।",
    UPLOAD_SUCCESS: "फ़ाइल सफलतापूर्वक अपलोड हो गई है।",
    PROFILE_SAVED: "आपकी जानकारी सुरक्षित सेव कर ली गई है।",
    REQUEST_SENT: "आपका अनुरोध भेज दिया गया है। कृपया जवाब का इंतज़ार करें।",
    JOBS_PAGE: "यहाँ आपको आपकी स्किल्स के हिसाब से ताज़ा नौकरियाँ मिलेंगी।",
    SKILLS_PAGE: "इस पेज पर आप देख सकते हैं कि आपको आगे बढ़ने के लिए क्या सीखना चाहिए।",
    ANALYTICS: "यहाँ आप अपनी प्रोग्रेस और कमाई का पूरा हिसाब देख सकते हैं।",
    RESUME_PAGE: "यहाँ अपना रेज़्यूमे अपलोड करें या एक नया प्रोफेशनल रेज़्यूमे बनाएँ।",
    INTERVIEW_PAGE: "इंटरव्यू की तैयारी करें और हमारे एआई के साथ प्रैक्टिस करें।",
};

class VoiceAssistant {
    private synthesis: SpeechSynthesis | null = null;
    private recognition: any = null;
    private voice: SpeechSynthesisVoice | null = null;
    private enabled: boolean = true;
    private currentInterval: NodeJS.Timeout | null = null;
    private isListening: boolean = false;

    constructor() {
        if (typeof window !== "undefined") {
            this.synthesis = window.speechSynthesis;
            this.initVoices();
            this.initRecognition();
        }
    }

    private initVoices() {
        if (!this.synthesis) return;
        const tryLoad = () => {
            const voices = this.synthesis!.getVoices();
            if (voices.length === 0) return false;
            this.voice = voices.find(v => v.lang === "hi-IN" && v.name.includes("Google")) || 
                         voices.find(v => v.lang === "hi-IN") ||
                         voices.find(v => v.lang.startsWith("hi")) || null;
            return true;
        };
        if (!tryLoad()) {
            this.synthesis.onvoiceschanged = () => { tryLoad(); this.synthesis!.onvoiceschanged = null; };
        }
    }

    private initRecognition() {
        if (typeof window !== "undefined") {
            const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRec) {
                this.recognition = new SpeechRec();
                this.recognition.continuous = false;
                this.recognition.interimResults = true;
                this.recognition.lang = "hi-IN";
            }
        }
    }

    public setEnabled(status: boolean) {
        this.enabled = status;
        if (!status) this.stop();
    }

    private clearInterval() {
        if (this.currentInterval) { clearInterval(this.currentInterval); this.currentInterval = null; }
    }

    public speak(text: string, onEnd?: () => void) {
        if (!this.enabled || !this.synthesis) return;
        this.stop(); 
        const utterance = new SpeechSynthesisUtterance(text);
        if (this.voice) { utterance.voice = this.voice; utterance.lang = this.voice.lang; }
        else { utterance.lang = "hi-IN"; }
        utterance.rate = 1.15;
        utterance.onstart = () => {
            this.clearInterval();
            this.currentInterval = setInterval(() => {
                if (!this.synthesis!.speaking) this.clearInterval();
                else this.synthesis!.resume();
            }, 5000) as any;
        };
        utterance.onend = () => { this.clearInterval(); if (onEnd) onEnd(); };
        utterance.onerror = () => this.clearInterval();
        this.synthesis.speak(utterance);
    }

    public startListening(onResult: (text: string, isFinal: boolean) => void, onEnd?: () => void) {
        if (!this.recognition) return;
        this.stop();
        this.isListening = true;
        this.recognition.onresult = (event: any) => {
            const result = event.results[event.results.length - 1];
            onResult(result[0].transcript, result.isFinal);
        };
        this.recognition.onend = () => { this.isListening = false; if (onEnd) onEnd(); };
        this.recognition.start();
    }

    public stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }

    public stop() {
        if (this.synthesis) this.synthesis.cancel();
        this.stopListening();
        this.clearInterval();
    }
}

export const voiceAssistant = new VoiceAssistant();
