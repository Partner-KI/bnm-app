import { Link, Stack } from "expo-router";
import { View, Text } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Nicht gefunden" }} />
      <View className="flex-1 items-center justify-center p-5 bg-bnm-bg">
        <Text className="text-xl font-bold text-bnm-primary">
          Seite nicht gefunden
        </Text>
        <Link href="/" className="mt-4 py-4">
          <Text className="text-bnm-link">Zurück zum Dashboard</Text>
        </Link>
      </View>
    </>
  );
}
