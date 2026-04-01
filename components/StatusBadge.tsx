/**
 * StatusBadge — Einheitliches Status-Badge mit:
 *   - Farbiger Dot (6px) links
 *   - Farbiger Text auf halbtransparentem Hintergrund
 *   - Konsistentes Farb-Schema für Light + Dark Mode
 *
 * Statuse: active, pending, completed, cancelled, none/default
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { RADIUS, TYPOGRAPHY, SPACING } from "../constants/Colors";
import { useThemeColors } from "../contexts/ThemeContext";

type BadgeStatus = "active" | "pending" | "completed" | "cancelled" | "none" | "warning" | "info";

interface StatusBadgeProps {
  status: BadgeStatus;
  label: string;
  compact?: boolean;
}

// Farb-Schema pro Status — [dot/text light, bg light, dot/text dark, bg dark]
const STATUS_COLORS: Record<BadgeStatus, { light: { fg: string; bg: string }; dark: { fg: string; bg: string } }> = {
  active:    { light: { fg: "#059669", bg: "#ECFDF5" }, dark: { fg: "#34D399", bg: "#052E16" } },
  pending:   { light: { fg: "#D97706", bg: "#FFFBEB" }, dark: { fg: "#FBBF24", bg: "#2A1F0A" } },
  completed: { light: { fg: "#2563EB", bg: "#EFF6FF" }, dark: { fg: "#60A5FA", bg: "#0C1F2E" } },
  cancelled: { light: { fg: "#DC2626", bg: "#FEF2F2" }, dark: { fg: "#F87171", bg: "#2D1010" } },
  none:      { light: { fg: "#6B7280", bg: "#F3F4F6" }, dark: { fg: "#9CA3AF", bg: "#1F2937" } },
  warning:   { light: { fg: "#D97706", bg: "#FFFBEB" }, dark: { fg: "#FBBF24", bg: "#2A1F0A" } },
  info:      { light: { fg: "#0284C7", bg: "#F0F9FF" }, dark: { fg: "#60CDFF", bg: "#0C1F2E" } },
};

export function StatusBadge({ status, label, compact }: StatusBadgeProps) {
  const themeColors = useThemeColors();
  const isDark = themeColors.background === "#0B0F18";
  const colors = STATUS_COLORS[status] ?? STATUS_COLORS.none;
  const { fg, bg } = isDark ? colors.dark : colors.light;

  return (
    <View style={[styles.badge, compact && styles.badgeCompact, { backgroundColor: bg }]}>
      <View style={[styles.dot, { backgroundColor: fg }]} />
      <Text style={[styles.label, compact && styles.labelCompact, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    gap: 6,
    alignSelf: "flex-start",
  },
  badgeCompact: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  labelCompact: {
    fontSize: TYPOGRAPHY.size.xs,
  },
});
