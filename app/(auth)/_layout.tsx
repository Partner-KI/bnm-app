import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#FFFFFF" },
        headerTintColor: "#101828",
        headerBackTitle: "Zurück",
        contentStyle: { backgroundColor: "#F9FAFB" },
      }}
    >
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen
        name="register-mentee"
        options={{ title: "Als Mentee registrieren" }}
      />
      <Stack.Screen
        name="register-mentor"
        options={{ title: "Als Mentor bewerben" }}
      />
    </Stack>
  );
}
