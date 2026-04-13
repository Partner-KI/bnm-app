import { Link, Stack } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { useThemeColors } from "../contexts/ThemeContext";

export default function NotFoundScreen() {
  const colors = useThemeColors();

  return (
    <>
      <Stack.Screen options={{ title: "Nicht gefunden" }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Seite nicht gefunden
        </Text>
        <Link href="/" style={styles.link}>
          <Text style={[styles.linkText, { color: colors.link }]}>Zurück zum Dashboard</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    marginTop: 16,
    paddingVertical: 16,
  },
  linkText: {},
});
