/**
 * FAB — Floating Action Button mit optionalem Speed-Dial.
 *
 * Verwendung:
 *   <FAB icon="add" onPress={...} />
 *   <FAB icon="add" actions={[{ icon: "...", label: "...", onPress: ... }]} />
 */
import React, { useState, useRef, useCallback } from "react";
import { View, Text, StyleSheet, Animated, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, RADIUS, TYPOGRAPHY, SHADOWS } from "../constants/Colors";
import { useThemeColors } from "../contexts/ThemeContext";
import { BNMPressable } from "./BNMPressable";

interface FABAction {
  icon: string;
  label: string;
  onPress: () => void;
  color?: string;
}

interface FABProps {
  icon?: string;
  onPress?: () => void;
  actions?: FABAction[];
  color?: string;
  bottom?: number;
  right?: number;
}

export function FAB({
  icon = "add",
  onPress,
  actions,
  color = COLORS.gold,
  bottom = 24,
  right = 20,
}: FABProps) {
  const themeColors = useThemeColors();
  const [expanded, setExpanded] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggle = useCallback(() => {
    const toValue = expanded ? 0 : 1;
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue, useNativeDriver: true, tension: 65, friction: 8 }),
      Animated.timing(rotateAnim, { toValue, duration: 200, useNativeDriver: true }),
    ]).start();
    setExpanded(!expanded);
  }, [expanded]);

  const handleMainPress = useCallback(() => {
    if (actions && actions.length > 0) {
      toggle();
    } else {
      onPress?.();
    }
  }, [actions, onPress, toggle]);

  const handleActionPress = useCallback((action: FABAction) => {
    toggle();
    setTimeout(() => action.onPress(), 150);
  }, [toggle]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  return (
    <View style={[styles.container, { bottom, right }]} pointerEvents="box-none">
      {/* Speed-Dial Actions */}
      {actions && actions.map((action, idx) => {
        const translateY = scaleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -(60 * (idx + 1))],
        });
        const opacity = scaleAnim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 0, 1],
        });

        return (
          <Animated.View
            key={idx}
            style={[
              styles.actionRow,
              { transform: [{ translateY }], opacity },
            ]}
          >
            <View style={[styles.actionLabel, {
              backgroundColor: themeColors.card,
              ...SHADOWS.sm,
            }]}>
              <Text style={[styles.actionLabelText, { color: themeColors.text }]}>{action.label}</Text>
            </View>
            <BNMPressable
              onPress={() => handleActionPress(action)}
              hapticStyle="medium"
              style={[styles.actionButton, {
                backgroundColor: action.color ?? themeColors.primary,
                ...SHADOWS.md,
              }]}
            >
              <Ionicons name={action.icon as any} size={20} color="#FFFFFF" />
            </BNMPressable>
          </Animated.View>
        );
      })}

      {/* Main FAB Button */}
      <BNMPressable
        onPress={handleMainPress}
        hapticStyle="medium"
        style={[styles.mainButton, {
          backgroundColor: color,
          ...SHADOWS.lg,
          shadowColor: color,
          shadowOpacity: 0.3,
        }]}
      >
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Ionicons name={icon as any} size={26} color="#FFFFFF" />
        </Animated.View>
      </BNMPressable>

      {/* Backdrop */}
      {expanded && (
        <BNMPressable
          onPress={toggle}
          disableHover
          style={styles.backdrop}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 100,
    alignItems: "flex-end",
  },
  mainButton: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  actionRow: {
    position: "absolute",
    bottom: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  actionLabelText: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  backdrop: {
    position: "absolute",
    top: -2000,
    left: -2000,
    right: -100,
    bottom: -100,
    zIndex: -1,
    ...(Platform.OS === "web" ? { cursor: "default" as any } : {}),
  },
});
