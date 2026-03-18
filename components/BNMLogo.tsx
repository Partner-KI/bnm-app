import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { COLORS } from "../constants/Colors";

interface BNMLogoProps {
  size?: number;
  showSubtitle?: boolean;
  color?: string;
}

export function BNMLogo({
  size = 60,
  showSubtitle = false,
  color = COLORS.gradientStart,
}: BNMLogoProps) {
  const iconSize = size;
  const textSize = size * 0.22;
  const subSize = size * 0.14;

  return (
    <View style={styles.wrapper}>
      <Svg width={iconSize} height={iconSize} viewBox="0 0 100 100">
        {/* Linke Person — Kopf */}
        <Circle cx="32" cy="22" r="10" fill={color} />
        {/* Rechte Person — Kopf */}
        <Circle cx="68" cy="22" r="10" fill={color} />

        {/* Verbindungskurve — Infinity/Mentoring-Symbol */}
        {/* Linke Person geht nach rechts unten, kreuzt, rechte Person geht nach links unten */}
        <Path
          d="M 22 38 C 22 58, 50 58, 50 48 C 50 38, 78 38, 78 58"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d="M 78 38 C 78 58, 50 58, 50 48 C 50 38, 22 38, 22 58"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />

        {/* Linke Hand/Arm */}
        <Path
          d="M 22 38 Q 15 32, 20 26"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Rechte Hand/Arm */}
        <Path
          d="M 78 38 Q 85 32, 80 26"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
      </Svg>

      {showSubtitle && (
        <View style={styles.textContainer}>
          <Text style={[styles.title, { fontSize: textSize, color }]}>
            BETREUUNG
          </Text>
          <Text style={[styles.subtitle, { fontSize: subSize, color }]}>
            NEUER MUSLIME
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
  },
  textContainer: {
    marginTop: 4,
    alignItems: "center",
  },
  title: {
    fontWeight: "800",
    letterSpacing: 3,
  },
  subtitle: {
    fontWeight: "500",
    letterSpacing: 2,
    opacity: 0.7,
    marginTop: 1,
  },
});

export default BNMLogo;
