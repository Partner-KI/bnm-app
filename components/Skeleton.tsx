import React, { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, View, ViewStyle } from "react-native";
import { COLORS, RADIUS } from "../constants/Colors";
import { useThemeColors } from "../contexts/ThemeContext";

const isWeb = Platform.OS === "web";

// Lazy-Import: LinearGradient nur wenn verfügbar (vermeidet Web-Crashes)
let LinearGradient: any = null;
try {
  LinearGradient = require("expo-linear-gradient").LinearGradient;
} catch {
  // expo-linear-gradient nicht verfügbar — Fallback auf Pulse
}

// Shimmer-Animation: Gradient wandert von links nach rechts
function useShimmer() {
  const translateX = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: !isWeb,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [translateX]);

  return translateX;
}

// Fallback Pulse-Animation (wenn LinearGradient nicht verfügbar)
function usePulse() {
  const opacity = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: !isWeb }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: !isWeb }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);
  return opacity;
}

// Basis-Skeleton-Block mit Shimmer (oder Pulse-Fallback)
function SkeletonBase({ style }: { style?: ViewStyle }) {
  const shimmerX = useShimmer();
  const pulseOpacity = usePulse();
  const themeColors = useThemeColors();
  const isDark = themeColors.background === "#0B0F18";

  const baseColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const shimmerColor = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.11)";

  // LinearGradient-Shimmer wenn verfügbar, sonst Pulse-Fallback
  if (!LinearGradient) {
    return (
      <Animated.View
        style={[styles.base, { backgroundColor: themeColors.border, opacity: pulseOpacity }, style]}
      />
    );
  }

  return (
    <View style={[styles.base, { backgroundColor: baseColor, overflow: "hidden" }, style]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [{
              translateX: shimmerX.interpolate({
                inputRange: [-1, 1],
                outputRange: [-200, 200],
              }),
            }],
          },
        ]}
      >
        <LinearGradient
          colors={["transparent", shimmerColor, "transparent"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

// Rechteckige Karte
export function SkeletonCard({ height = 80, style }: { height?: number; style?: ViewStyle }) {
  return <SkeletonBase style={{ height, borderRadius: RADIUS.md, ...(style ?? {}) }} />;
}

// Schmale Linie
export function SkeletonLine({
  width = "100%",
  height = 14,
  style,
}: {
  width?: number | `${number}%`;
  height?: number;
  style?: ViewStyle;
}) {
  return (
    <SkeletonBase
      style={{ height, width: width as any, borderRadius: 4, ...(style ?? {}) }}
    />
  );
}

// Kreis (für Avatare)
export function SkeletonCircle({ size = 44 }: { size?: number }) {
  return (
    <SkeletonBase
      style={{ width: size, height: size, borderRadius: size / 2 }}
    />
  );
}

// Vorgefertigtes Mentee-/Mentor-Card-Skeleton
export function SkeletonUserCard() {
  const themeColors = useThemeColors();
  return (
    <View style={[styles.userCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
      <SkeletonCircle size={44} />
      <View style={styles.userCardContent}>
        <SkeletonLine width="60%" height={16} style={{ marginBottom: 8 }} />
        <SkeletonLine width="40%" height={12} />
      </View>
    </View>
  );
}

// Liste von Skeleton-Karten
export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonUserCard key={i} />
      ))}
    </>
  );
}

// KPI-Karte für Dashboard (Admin/Mentor)
export function SkeletonKPICard() {
  const themeColors = useThemeColors();
  return (
    <View style={[skeletonStyles.kpiCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
      <SkeletonLine width="40%" height={12} style={{ marginBottom: 10 }} />
      <SkeletonLine width="55%" height={28} style={{ marginBottom: 6 }} />
      <SkeletonLine width="30%" height={11} />
    </View>
  );
}

// Dashboard-Skeleton: 4 KPI-Karten + 2 Platzhalter-Sections
export function SkeletonDashboard() {
  const themeColors = useThemeColors();
  return (
    <View style={{ padding: 24 }}>
      {/* KPI-Reihe */}
      <View style={skeletonStyles.kpiRow}>
        <SkeletonKPICard />
        <SkeletonKPICard />
      </View>
      <View style={skeletonStyles.kpiRow}>
        <SkeletonKPICard />
        <SkeletonKPICard />
      </View>
      {/* Section-Platzhalter */}
      <View style={[skeletonStyles.section, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
        <SkeletonLine width="50%" height={16} style={{ marginBottom: 14 }} />
        <SkeletonLine width="100%" height={12} style={{ marginBottom: 8 }} />
        <SkeletonLine width="85%" height={12} style={{ marginBottom: 8 }} />
        <SkeletonLine width="70%" height={12} />
      </View>
      <View style={[skeletonStyles.section, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
        <SkeletonLine width="45%" height={16} style={{ marginBottom: 14 }} />
        <SkeletonUserCard />
        <SkeletonUserCard />
      </View>
    </View>
  );
}

// Chat-Message-Skeleton
export function SkeletonChatMessages({ count = 5 }: { count?: number }) {
  return (
    <View style={{ padding: 16, gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => {
        const isRight = i % 3 !== 0;
        return (
          <View key={i} style={{ alignItems: isRight ? "flex-end" : "flex-start" }}>
            <SkeletonBase
              style={{
                height: 44 + (i % 2) * 20,
                width: `${50 + (i % 3) * 15}%` as `${number}%`,
                borderRadius: RADIUS.md,
              }}
            />
          </View>
        );
      })}
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  kpiCard: {
    flex: 1,
    borderRadius: RADIUS.lg,
    padding: 14,
    borderWidth: 1,
    margin: 4,
  },
  kpiRow: {
    flexDirection: "row",
    marginBottom: 0,
  },
  section: {
    borderRadius: RADIUS.lg,
    padding: 16,
    borderWidth: 1,
    marginTop: 12,
  },
});

const styles = StyleSheet.create({
  base: {
    // backgroundColor applied dynamically via themeColors.border
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: RADIUS.md,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
  },
  userCardContent: {
    flex: 1,
  },
});
