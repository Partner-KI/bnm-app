/**
 * Toast-Notification-System — Slide-in von oben, automatisch dismissbar.
 *
 * Verwendung:
 *   import { ToastProvider, useToast } from "@/components/Toast";
 *   // In _layout.tsx: <ToastProvider>...</ToastProvider>
 *   // In Screens:     const toast = useToast();
 *                      toast.show("Gespeichert!", "success");
 */
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { View, Text, StyleSheet, Animated, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, RADIUS, TYPOGRAPHY, SHADOWS } from "../constants/Colors";
import { useThemeColors } from "../contexts/ThemeContext";
import { BNMPressable } from "./BNMPressable";
import { setGlobalToast } from "../lib/errorHandler";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  show: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ show: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const TOAST_DURATION = 3000;
const ANIMATION_DURATION = 250;

const TOAST_CONFIG: Record<ToastType, { icon: string; color: string; lightBg: string; darkBg: string }> = {
  success: { icon: "checkmark-circle", color: "#0D9C6E", lightBg: "#ECFDF5", darkBg: "#052E16" },
  error:   { icon: "close-circle",     color: "#DC2626", lightBg: "#FEF2F2", darkBg: "#2D0808" },
  warning: { icon: "warning",          color: "#D97706", lightBg: "#FFFBEB", darkBg: "#1C1300" },
  info:    { icon: "information-circle",color: "#0284C7", lightBg: "#F0F9FF", darkBg: "#0C1F2E" },
};

function ToastView({ item, onDismiss }: { item: ToastItem; onDismiss: (id: number) => void }) {
  const themeColors = useThemeColors();
  const isDark = themeColors.background === "#0B0F18";
  const config = TOAST_CONFIG[item.type];
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Einblenden
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
      Animated.timing(opacity, { toValue: 1, duration: ANIMATION_DURATION, useNativeDriver: true }),
    ]).start();

    // Auto-Dismiss
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -80, duration: 200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => onDismiss(item.id));
    }, TOAST_DURATION);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.toast, {
      transform: [{ translateY }],
      opacity,
      backgroundColor: isDark ? config.darkBg : config.lightBg,
      borderColor: config.color + "30",
    }]}>
      <Ionicons name={config.icon as any} size={20} color={config.color} />
      <Text style={[styles.toastText, { color: isDark ? themeColors.text : "#1F2937" }]} numberOfLines={2}>
        {item.message}
      </Text>
      <BNMPressable onPress={() => onDismiss(item.id)} disableHover style={styles.toastClose}>
        <Ionicons name="close" size={16} color={themeColors.textTertiary} />
      </BNMPressable>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const show = useCallback((message: string, type: ToastType = "success") => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]); // Max 3 Toasts
  }, []);

  // Globale Referenz für showSuccess/showError registrieren
  useEffect(() => {
    setGlobalToast(show);
    return () => setGlobalToast(null);
  }, [show]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <View style={[styles.container, { top: insets.top + 8 }]} pointerEvents="box-none">
        {toasts.map((item) => (
          <ToastView key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: "center",
    ...(Platform.OS === "web" ? { pointerEvents: "box-none" as any } : {}),
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    maxWidth: 480,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: 8,
    gap: 10,
    ...SHADOWS.md,
  },
  toastText: {
    flex: 1,
    fontSize: TYPOGRAPHY.size.base,
    fontWeight: TYPOGRAPHY.weight.medium,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
  },
  toastClose: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.xs,
  },
});
