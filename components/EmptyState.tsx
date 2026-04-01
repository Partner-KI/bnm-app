/**
 * EmptyState — Wiederverwendbare Leer-Zustand-Anzeige mit:
 *   - Großem Icon (Ionicons) als visuelle Illustration
 *   - Headline + beschreibendem Text
 *   - Optionaler CTA-Button
 *
 * Ersetzt die generischen "Keine Einträge"-Texte überall in der App.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, RADIUS, TYPOGRAPHY, SPACING, SHADOWS } from "../constants/Colors";
import { useThemeColors } from "../contexts/ThemeContext";
import { BNMPressable } from "./BNMPressable";

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}

export function EmptyState({ icon, title, description, actionLabel, onAction, compact }: EmptyStateProps) {
  const themeColors = useThemeColors();

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* Icon-Illustration */}
      <View style={[styles.iconCircle, { backgroundColor: themeColors.accent + "12" }]}>
        <View style={[styles.iconInner, { backgroundColor: themeColors.accent + "18" }]}>
          <Ionicons name={icon as any} size={compact ? 28 : 36} color={themeColors.accent} />
        </View>
      </View>

      {/* Text */}
      <Text style={[styles.title, { color: themeColors.text }]}>{title}</Text>
      {description && (
        <Text style={[styles.description, { color: themeColors.textSecondary }]}>{description}</Text>
      )}

      {/* CTA Button */}
      {actionLabel && onAction && (
        <BNMPressable
          onPress={onAction}
          hapticStyle="medium"
          style={[styles.actionButton, { backgroundColor: COLORS.gradientStart }]}
        >
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </BNMPressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  containerCompact: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
  },
  iconInner: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...TYPOGRAPHY.styles.h3,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  description: {
    ...TYPOGRAPHY.styles.body,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
  },
  actionButton: {
    marginTop: SPACING.xl,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: RADIUS.sm,
    ...SHADOWS.sm,
  },
  actionButtonText: {
    color: COLORS.white,
    ...TYPOGRAPHY.styles.button,
  },
});
