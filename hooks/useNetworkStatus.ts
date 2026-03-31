// Detects online/offline status cross-platform
// Web: uses navigator.onLine + online/offline events
// Native: uses fetch-based polling (no extra dependency)
// Requires 2 consecutive failures before reporting offline to avoid false positives
import { useState, useEffect } from "react";
import { Platform } from "react-native";

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (Platform.OS === "web") {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    } else {
      let mounted = true;
      let failCount = 0;

      async function checkOnline() {
        try {
          await fetch("https://www.google.com/generate_204", {
            method: "HEAD",
            cache: "no-store",
          });
          failCount = 0;
          if (mounted) setIsOnline(true);
        } catch {
          failCount += 1;
          // Only declare offline after 2 consecutive failures to avoid startup false positives
          if (failCount >= 2 && mounted) setIsOnline(false);
        }
      }

      checkOnline();
      const interval = setInterval(checkOnline, 15000);
      return () => {
        mounted = false;
        clearInterval(interval);
      };
    }
  }, []);

  return isOnline;
}
