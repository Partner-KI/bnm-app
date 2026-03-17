import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import type { UserRole } from "../../types";

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginAs, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setErrorMsg("Bitte E-Mail und Passwort eingeben.");
      return;
    }
    setErrorMsg("");
    const success = await login(email.trim(), password);
    if (!success) {
      setErrorMsg("E-Mail oder Passwort ist falsch.");
    }
  }

  function handleQuickLogin(role: UserRole) {
    setErrorMsg("");
    loginAs(role);
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-bnm-bg"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Banner */}
        <View className="bg-bnm-primary pt-16 pb-10 px-6 items-center">
          <View className="w-16 h-16 rounded-2xl bg-bnm-gold items-center justify-center mb-4">
            <Text className="text-white text-3xl font-bold">B</Text>
          </View>
          <Text className="text-white text-2xl font-bold mb-1">BNM</Text>
          <Text className="text-white opacity-70 text-sm text-center">
            Betreuung neuer Muslime
          </Text>
        </View>

        {/* Login Card */}
        <View className="flex-1 px-6 pt-8">
          <Text className="text-bnm-primary text-xl font-bold mb-1">
            Willkommen
          </Text>
          <Text className="text-bnm-secondary text-sm mb-6">
            Melde dich an, um fortzufahren.
          </Text>

          {/* E-Mail */}
          <Text className="text-bnm-secondary text-sm font-medium mb-1">
            E-Mail-Adresse
          </Text>
          <TextInput
            className="bg-white border border-bnm-border rounded-xl px-4 py-3 text-bnm-primary mb-4"
            placeholder="deine@email.de"
            placeholderTextColor="#98A2B3"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          {/* Passwort */}
          <Text className="text-bnm-secondary text-sm font-medium mb-1">
            Passwort
          </Text>
          <TextInput
            className="bg-white border border-bnm-border rounded-xl px-4 py-3 text-bnm-primary mb-4"
            placeholder="Passwort"
            placeholderTextColor="#98A2B3"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* Fehlermeldung */}
          {errorMsg ? (
            <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
              <Text className="text-red-600 text-sm">{errorMsg}</Text>
            </View>
          ) : null}

          {/* Login-Button */}
          <TouchableOpacity
            className="bg-bnm-cta rounded-xl py-4 items-center mb-4"
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-bold text-base">Anmelden</Text>
            )}
          </TouchableOpacity>

          {/* Registrierungs-Links */}
          <View className="flex-row justify-center gap-4 mb-8">
            <TouchableOpacity
              onPress={() => router.push("/(auth)/register-mentee")}
            >
              <Text className="text-bnm-link text-sm">Mentee registrieren</Text>
            </TouchableOpacity>
            <Text className="text-bnm-tertiary text-sm">|</Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/register-mentor")}
            >
              <Text className="text-bnm-link text-sm">Als Mentor bewerben</Text>
            </TouchableOpacity>
          </View>

          {/* Test-Schnellzugang */}
          <View className="border-t border-bnm-border pt-6 mb-8">
            <Text className="text-bnm-tertiary text-xs text-center mb-3 uppercase tracking-wider">
              Schnellzugang (Entwicklung)
            </Text>
            <View className="flex-row gap-2">
              <TouchableOpacity
                className="flex-1 bg-bnm-bg border border-bnm-border rounded-xl py-3 items-center"
                onPress={() => handleQuickLogin("admin")}
              >
                <Text className="text-bnm-primary text-xs font-semibold">
                  Admin
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-bnm-bg border border-bnm-border rounded-xl py-3 items-center"
                onPress={() => handleQuickLogin("mentor")}
              >
                <Text className="text-bnm-primary text-xs font-semibold">
                  Mentor
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-bnm-bg border border-bnm-border rounded-xl py-3 items-center"
                onPress={() => handleQuickLogin("mentee")}
              >
                <Text className="text-bnm-primary text-xs font-semibold">
                  Mentee
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
