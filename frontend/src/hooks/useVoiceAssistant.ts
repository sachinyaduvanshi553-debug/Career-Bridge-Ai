import { useEffect, useState, useCallback } from 'react';
import { voiceAssistant, HINDI_PHRASES } from '../lib/VoiceAssistant';

export function useVoiceAssistant() {
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('voice_enabled') !== 'false';
        }
        return true;
    });
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        voiceAssistant.setEnabled(isVoiceEnabled);
        localStorage.setItem('voice_enabled', String(isVoiceEnabled));
    }, [isVoiceEnabled]);

    const speak = useCallback((phraseKey: keyof typeof HINDI_PHRASES | string) => {
        const text = (HINDI_PHRASES as any)[phraseKey] || phraseKey;
        voiceAssistant.speak(text);
    }, []);

    const startListening = () => {
        if (!isVoiceEnabled) return;
        setIsListening(true);
        setTranscript("");
        voiceAssistant.startListening(
            (text, isFinal) => {
                setTranscript(text);
            },
            () => setIsListening(false)
        );
    };

    const stopListening = () => {
        voiceAssistant.stopListening();
        setIsListening(false);
    };

    const toggleVoice = () => {
        const newState = !isVoiceEnabled;
        setIsVoiceEnabled(newState);
        if (newState) {
            speak(HINDI_PHRASES.ENABLE_VOICE);
        } else {
            stopListening();
        }
    };

    return {
        isVoiceEnabled,
        isListening,
        transcript,
        isProcessing,
        setIsProcessing,
        toggleVoice,
        speak,
        startListening,
        stopListening,
        phrases: HINDI_PHRASES
    };
}
