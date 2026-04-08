/**
 * SwipeableRow — Swipe-to-Action für Listenelemente.
 * Nutzt PanResponder (kein extra Package nötig).
 *
 * Verwendung:
 *   <SwipeableRow
 *     leftAction={{ icon: "chatbubble", label: "Chat", color: "#0D9C6E", onPress: ... }}
 *     rightAction={{ icon: "create", label: "Bearbeiten", color: "#0A3A5A", onPress: ... }}
 *   >
 *     <MenteeCard ... />
 *   </SwipeableRow>
 */
import React, { useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, RADIUS, TYPOGRAPHY } from "../constants/Colors";

// Auf Web kein Swipe – nur Mobile
const isNative = Platform.OS !== "web";

const SWIPE_THRESHOLD = 70;
const ACTION_WIDTH = 80;

interface SwipeAction {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
}

interface SwipeableRowProps {
  children: React.ReactNode;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
}

export function SwipeableRow({ children, leftAction, rightAction }: SwipeableRowProps) {
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Nur horizontale Gesten erkennen
        return isNative && Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 20;
      },
      onPanResponderMove: (_, gestureState) => {
        // Clamp: nur in erlaubte Richtungen
        let dx = gestureState.dx;
        if (!leftAction && dx > 0) dx = 0;
        if (!rightAction && dx < 0) dx = 0;
        // Max Swipe-Distanz begrenzen
        dx = Math.max(-ACTION_WIDTH - 10, Math.min(ACTION_WIDTH + 10, dx));
        translateX.setValue(dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD && leftAction) {
          // Swipe rechts → linke Aktion anzeigen
          Animated.spring(translateX, { toValue: ACTION_WIDTH, useNativeDriver: true, tension: 60, friction: 10 }).start();
          setTimeout(() => {
            leftAction.onPress();
            Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
          }, 300);
        } else if (gestureState.dx < -SWIPE_THRESHOLD && rightAction) {
          // Swipe links → rechte Aktion anzeigen
          Animated.spring(translateX, { toValue: -ACTION_WIDTH, useNativeDriver: true, tension: 60, friction: 10 }).start();
          setTimeout(() => {
            rightAction.onPress();
            Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
          }, 300);
        } else {
          // Zurück-Snap
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }).start();
        }
      },
    })
  ).current;

  // Auf Web: kein Swipe, Kinder direkt rendern
  if (!isNative) return <>{children}</>;

  return (
    <View style={styles.container}>
      {/* Linke Aktion (Swipe-Right) */}
      {leftAction && (
        <View style={[styles.actionBg, styles.leftBg, { backgroundColor: leftAction.color }]}>
          <Ionicons name={leftAction.icon as any} size={22} color={COLORS.white} />
          <Text style={styles.actionLabel}>{leftAction.label}</Text>
        </View>
      )}
      {/* Rechte Aktion (Swipe-Left) */}
      {rightAction && (
        <View style={[styles.actionBg, styles.rightBg, { backgroundColor: rightAction.color }]}>
          <Ionicons name={rightAction.icon as any} size={22} color={COLORS.white} />
          <Text style={styles.actionLabel}>{rightAction.label}</Text>
        </View>
      )}
      {/* Content */}
      <Animated.View
        style={{ transform: [{ translateX }] }}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
    borderRadius: RADIUS.md,
    marginBottom: 2,
  },
  actionBg: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: ACTION_WIDTH,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  leftBg: {
    left: 0,
    borderTopLeftRadius: RADIUS.md,
    borderBottomLeftRadius: RADIUS.md,
  },
  rightBg: {
    right: 0,
    borderTopRightRadius: RADIUS.md,
    borderBottomRightRadius: RADIUS.md,
  },
  actionLabel: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
});
