import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, ViewStyle } from "react-native";
import { COLORS } from "../constants/Colors";
import { useThemeColors } from "../contexts/ThemeContext";

// Gemeinsame Pulsier-Animation
function usePulse() {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return opacity;
}

// Basis-Skeleton-Block
function SkeletonBase({ style }: { style?: ViewStyle }) {
  const opacity = usePulse();
  const themeColors = useThemeColors();
  return (
    <Animated.View
      style={[styles.base, { backgroundColor: themeColors.border }, style, { opacity }]}
    />
  );
}

// Rechteckige Karte
export function SkeletonCard({ height = 80, style }: { height?: number; style?: ViewStyle }) {
  return <SkeletonBase style={{ height, borderRadius: 8, ...(style ?? {}) }} />;
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

const styles = StyleSheet.create({
  base: {
    // backgroundColor applied dynamically via themeColors.border
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
  },
  userCardContent: {
    flex: 1,
  },
});
