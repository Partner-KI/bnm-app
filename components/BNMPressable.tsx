/**
 * BNMPressable — Drop-in-Ersatz für TouchableOpacity mit:
 *   • Android: Ripple-Effekt via Pressable + android_ripple
 *   • iOS:     Haptic Feedback via expo-haptics
 *   • Web:     Hover-State (translateY + Shadow) + Cursor Pointer + Opacity-Feedback
 *
 * Verwendung:
 *   import { BNMPressable } from "@/components/BNMPressable";
 *   <BNMPressable onPress={...} style={...}>...</BNMPressable>
 *
 * Props: wie TouchableOpacity + optional `hapticStyle`
 */
import React, { useState, useCallback } from "react";
import { Pressable, StyleProp, ViewStyle, Platform, PressableProps } from "react-native";
import * as Haptics from "expo-haptics";

const isWeb = Platform.OS === "web";

type HapticStyle = "light" | "medium" | "heavy" | "success" | "warning" | "error";

interface BNMPressableProps extends PressableProps {
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean; hovered?: boolean }) => StyleProp<ViewStyle>);
  children: React.ReactNode;
  hapticStyle?: HapticStyle;
  /** Ripple-Farbe für Android (default: rgba(0,0,0,0.12)) */
  rippleColor?: string;
  /** Ripple auf Borderless setzen (z. B. für Icon-Buttons ohne Hintergrund) */
  rippleBorderless?: boolean;
  activeOpacity?: number;
  /** Web Hover deaktivieren (z.B. für Text-Links die keinen Scale brauchen) */
  disableHover?: boolean;
}

// Web-Hover-Styles
const webBaseStyle: ViewStyle = isWeb ? {
  // @ts-ignore – web-only CSS property
  cursor: "pointer",
  // @ts-ignore
  transition: "transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease",
} : {};

const webHoverStyle: ViewStyle = isWeb ? {
  // @ts-ignore
  transform: [{ translateY: -1 }],
} : {};

export function BNMPressable({
  style,
  children,
  hapticStyle = "light",
  rippleColor = "rgba(0,0,0,0.12)",
  rippleBorderless = false,
  onPress,
  activeOpacity = 0.7,
  disableHover = false,
  disabled,
  ...rest
}: BNMPressableProps) {
  const [hovered, setHovered] = useState(false);

  const onHoverIn = useCallback(() => setHovered(true), []);
  const onHoverOut = useCallback(() => setHovered(false), []);

  async function handlePress(event: Parameters<NonNullable<PressableProps["onPress"]>>[0]) {
    if (Platform.OS === "ios") {
      try {
        switch (hapticStyle) {
          case "light":
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
          case "medium":
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            break;
          case "heavy":
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            break;
          case "success":
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            break;
          case "warning":
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            break;
          case "error":
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            break;
        }
      } catch {
        // Haptics nicht verfügbar — still fail
      }
    }
    onPress?.(event);
  }

  return (
    <Pressable
      onPress={handlePress}
      onHoverIn={isWeb ? onHoverIn : undefined}
      onHoverOut={isWeb ? onHoverOut : undefined}
      style={({ pressed }) => [
        typeof style === "function" ? style({ pressed, hovered }) : style,
        // Web: Basis-Styles (cursor, transition)
        isWeb && !disabled && webBaseStyle,
        // Web: Hover-Effekt (leichtes Anheben)
        isWeb && hovered && !pressed && !disabled && !disableHover && webHoverStyle,
        // Opacity-Feedback (Web + iOS)
        Platform.OS !== "android" && pressed ? { opacity: activeOpacity } : undefined,
        // Disabled-Stil
        disabled ? { opacity: 0.5 } : undefined,
      ]}
      android_ripple={
        Platform.OS === "android"
          ? { color: rippleColor, borderless: rippleBorderless }
          : undefined
      }
      disabled={disabled}
      {...rest}
    >
      {children}
    </Pressable>
  );
}
