import React, { useRef, useEffect } from "react";
import {
  Animated,
  Platform,
  TouchableWithoutFeedback,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useThemeColors } from "../contexts/ThemeContext";

interface SlideOverPanelProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}

export function SlideOverPanel({ visible, onClose, children }: SlideOverPanelProps) {
  const themeColors = useThemeColors();

  // Breite: 40% des Screens, min 500, max 700
  const screenWidth = Dimensions.get("window").width;
  const panelWidth = Math.min(700, Math.max(500, screenWidth * 0.4));

  const slideAnim = useRef(new Animated.Value(panelWidth)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: panelWidth,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (Platform.OS !== "web") return null;

  if (!visible) {
    return null;
  }

  const shadowStyle =
    Platform.OS === "web"
      ? ({
          boxShadow: "-8px 0 32px rgba(0,0,0,0.28)",
        } as any)
      : {
          shadowColor: "#000",
          shadowOffset: { width: -4, height: 0 },
          shadowOpacity: 0.22,
          shadowRadius: 20,
          elevation: 16,
        };

  return (
    <View style={styles.container}>
      {/* Overlay */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[
            styles.overlay,
            { opacity: overlayAnim },
          ]}
        />
      </TouchableWithoutFeedback>

      {/* Panel */}
      <Animated.View
        style={[
          styles.panel,
          shadowStyle,
          {
            width: panelWidth,
            backgroundColor: themeColors.background,
            borderLeftColor: themeColors.border,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {/* Panel Header mit X-Button */}
        <View style={[styles.panelHeader, { borderBottomColor: themeColors.border }]}>
          <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: themeColors.card }]} activeOpacity={0.7}>
            <Text style={[styles.closeButtonText, { color: themeColors.textSecondary }]}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.panelContent}
          contentContainerStyle={styles.panelContentInner}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute" as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  overlay: {
    position: "absolute" as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  panel: {
    position: "absolute" as any,
    right: 0,
    top: 0,
    bottom: 0,
    borderLeftWidth: 1,
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 16,
  },
  panelContent: {
    flex: 1,
  },
  panelContentInner: {
    padding: 24,
    paddingBottom: 48,
  },
});
