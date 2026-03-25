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
} from "react-native";
import { useThemeColors } from "../contexts/ThemeContext";

interface SlideOverPanelProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}

export function SlideOverPanel({ visible, onClose, children, width = 500 }: SlideOverPanelProps) {
  const themeColors = useThemeColors();
  const slideAnim = useRef(new Animated.Value(width)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const panelWidth = width;
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: panelWidth,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (Platform.OS !== "web") return null;

  if (!visible) {
    return null;
  }

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
          {
            width: width,
            backgroundColor: themeColors.background,
            borderLeftColor: themeColors.border,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {/* Close Button */}
        <View style={[styles.panelHeader, { borderBottomColor: themeColors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
            <Text style={[styles.closeButtonText, { color: themeColors.textSecondary }]}>X</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.panelContent} contentContainerStyle={styles.panelContentInner}>
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
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  panel: {
    position: "absolute" as any,
    right: 0,
    top: 0,
    bottom: 0,
    borderLeftWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  panelContent: {
    flex: 1,
  },
  panelContentInner: {
    paddingBottom: 40,
  },
});
