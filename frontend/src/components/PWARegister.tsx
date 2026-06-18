"use client";

import { useEffect } from "react";

/**
 * PWARegister - Handles manual Service Worker registration.
 * Ensures registration only happens in the browser and handles path correctly.
 */
export default function PWARegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        const swPath = "/sw.js";
        
        navigator.serviceWorker
          .register(swPath)
          .then((registration) => {
            console.log("[PWA] ServiceWorker registration successful:", registration.scope);
          })
          .catch((err) => {
            console.error("[PWA] ServiceWorker registration failed:", err);
          });
      });
    }
  }, []);

  return null;
}
