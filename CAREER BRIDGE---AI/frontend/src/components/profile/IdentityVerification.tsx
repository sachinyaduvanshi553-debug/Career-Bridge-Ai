"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShieldAlert, Fingerprint, CreditCard, Loader2, CheckCircle2, ChevronRight, Lock } from "lucide-react";

export default function IdentityVerification() {
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [docType, setDocType] = useState<"aadhaar" | "pan">("aadhaar");
    const [docNum, setDocNum] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const data = await api.getIdentityStatus();
            setStatus(data);
        } catch (err) {
            console.error("Failed to fetch verification status", err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        if (!docNum) return;
        setVerifying(true);
        setError("");
        try {
            const res = await api.verifyIdentity(docType, docNum);
            setStatus(res);
        } catch (err: any) {
            setError(err.message || "Verification failed");
        } finally {
            setVerifying(false);
        }
    };

    if (loading) return <div className="animate-pulse h-40 bg-dark-800 rounded-3xl"></div>;

    const isVerified = status?.verification_status === "verified" || status?.is_verified;

    return (
        <div className="bg-dark-900 shadow-2xl rounded-3xl border border-white/5 overflow-hidden">
            <div className="p-8 border-b border-white/5">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Fingerprint className="text-primary-400 w-6 h-6" />
                        Identity Verification
                    </h2>
                    {isVerified ? (
                        <span className="px-3 py-1.5 bg-green-500/20 text-green-400 text-xs font-bold rounded-full flex items-center gap-1.5 uppercase tracking-wider">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Verified
                        </span>
                    ) : (
                        <span className="px-3 py-1.5 bg-yellow-500/20 text-yellow-500 text-xs font-bold rounded-full flex items-center gap-1.5 uppercase tracking-wider">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Action Required
                        </span>
                    )}
                </div>
                <p className="text-sm text-dark-400 italic">
                    {isVerified 
                        ? "Your identity has been authenticated via DigiLocker. You have a verified badge on your profile."
                        : "Complete verification to unlock premium features and build trust with other users."}
                </p>
            </div>

            <div className="p-8">
                <AnimatePresence mode="wait">
                    {isVerified ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6 flex items-start gap-4"
                        >
                            <CheckCircle2 className="w-10 h-10 text-green-500 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-green-400 mb-1 leading-none">Authentication Successful</h3>
                                <p className="text-sm text-dark-300 mb-3">
                                    Document: {status.document_type?.toUpperCase()} (Ends in {status.document_last_4})
                                </p>
                                <div className="flex items-center gap-2 text-[10px] text-dark-500 uppercase tracking-widest font-bold">
                                    <Lock className="w-3 h-3" />
                                    Secure DigiLocker Hash Stored
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => setDocType("aadhaar")}
                                    className={`p-4 rounded-xl border transition-all text-left group ${docType === "aadhaar" ? "bg-primary-500/10 border-primary-500 shadow-lg shadow-primary-500/5" : "bg-dark-800 border-white/5 hover:border-white/10"}`}
                                >
                                    <CreditCard className={`w-6 h-6 mb-3 ${docType === "aadhaar" ? "text-primary-400" : "text-dark-500 group-hover:text-dark-300"}`} />
                                    <p className="font-bold text-sm">Aadhaar Card</p>
                                    <p className="text-[10px] text-dark-500 mt-0.5 italic">12-Digit UIDAI ID</p>
                                </button>
                                <button 
                                    onClick={() => setDocType("pan")}
                                    className={`p-4 rounded-xl border transition-all text-left group ${docType === "pan" ? "bg-primary-500/10 border-primary-500 shadow-lg shadow-primary-500/5" : "bg-dark-800 border-white/5 hover:border-white/10"}`}
                                >
                                    <CreditCard className={`w-6 h-6 mb-3 ${docType === "pan" ? "text-primary-400" : "text-dark-500 group-hover:text-dark-300"}`} />
                                    <p className="font-bold text-sm">PAN Card</p>
                                    <p className="text-[10px] text-dark-500 mt-0.5 italic">IT Department ID</p>
                                </button>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-dark-500 uppercase tracking-widest mb-2 ml-1">
                                    {docType === "aadhaar" ? "Aadhaar Number" : "PAN Number"}
                                </label>
                                <input 
                                    type="text" 
                                    value={docNum}
                                    onChange={(e) => setDocNum(e.target.value)}
                                    placeholder={docType === "aadhaar" ? "XXXX XXXX XXXX" : "ABCDE1234F"}
                                    className="w-full bg-dark-800 border border-white/5 rounded-xl py-4 px-5 text-sm focus:outline-none focus:border-primary-500 transition-all font-mono tracking-widest uppercase"
                                />
                            </div>

                            {error && (
                                <p className="text-xs text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20 italic">
                                    {error}
                                </p>
                            )}

                            <button
                                onClick={handleVerify}
                                disabled={verifying || !docNum}
                                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-primary-500/10 ${verifying || !docNum ? "bg-dark-800 text-dark-500 cursor-not-allowed" : "bg-primary-500 text-white hover:scale-[1.02] active:scale-95"}`}
                            >
                                {verifying ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Connecting to DigiLocker...
                                    </>
                                ) : (
                                    <>
                                        Verify Identity
                                        <ChevronRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                            <p className="text-[10px] text-center text-dark-500 italic">
                                Powered by Secure DigiLocker Gateway. Your original documents are never stored.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
