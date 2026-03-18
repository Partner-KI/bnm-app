import React, { ReactNode } from "react";
import { View, Platform, StyleSheet } from "react-native";

interface ContainerProps {
  children: ReactNode;
  style?: object;
}

/**
 * Responsive Wrapper-Komponente.
 * Auf Web: Content wird auf max. 600px begrenzt und zentriert.
 * Auf Native: volle Breite (kein Wrapper-Overhead).
 */
export function Container({ children, style }: ContainerProps) {
  if (Platform.OS !== "web") {
    return <>{children}</>;
  }

  return (
    <View style={styles.outerWeb}>
      <View style={[styles.innerWeb, style]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWeb: {
    flex: 1,
    alignItems: "center",
    width: "100%",
  },
  innerWeb: {
    width: "100%",
    maxWidth: 600,
    flex: 1,
  },
});
