import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { COLORS } from "../constants/Colors";

const BANNER_HEIGHT = 36;

export function OfflineBanner() {
  const isOnline = useNetworkStatus();
  const insets = useSafeAreaInsets();
  // Offset includes safe area so banner slides out completely above the notch
  const hiddenOffset = -(BANNER_HEIGHT + (Platform.OS === "ios" ? Math.max(insets.top, 50) : 0));
  const translateY = useRef(new Animated.Value(hiddenOffset)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: isOnline ? hiddenOffset : 0,
      duration: 250,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, [isOnline]);

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          top: Platform.OS === "ios" ? insets.top : 0,
          transform: [{ translateY }],
        },
      ]}
      pointerEvents="none"
    >
      <View style={styles.inner}>
        <Ionicons name="cloud-offline-outline" size={14} color={COLORS.white} style={styles.icon} />
        <Text style={styles.text}>Keine Verbindung – Daten können veraltet sein</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 999,
    backgroundColor: COLORS.gold,
    height: BANNER_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
});
