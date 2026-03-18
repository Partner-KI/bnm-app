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
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import type { UserRole } from "../../types";
import { COLORS } from "../../constants/Colors";

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
      style={styles.flex1}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.flex1}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero Header – dunkelblaues NGO-Design */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoLetter}>B</Text>
          </View>
          <Text style={styles.logoTitle}>BNM</Text>
          <Text style={styles.logoSubtitle}>
            Betreuung neuer Muslime
          </Text>
          {/* Gold-Linie als Trenner */}
          <View style={styles.goldDivider} />
        </View>

        {/* Login-Formular */}
        <View style={styles.formContainer}>
          <Text style={styles.welcomeTitle}>
            Willkommen
          </Text>
          <Text style={styles.welcomeSubtitle}>
            Melde dich an, um fortzufahren.
          </Text>

          {/* E-Mail */}
          <Text style={styles.fieldLabel}>
            E-Mail-Adresse
          </Text>
          <TextInput
            style={styles.input}
            placeholder="deine@email.de"
            placeholderTextColor="#98A2B3"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          {/* Passwort */}
          <Text style={styles.fieldLabel}>
            Passwort
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Passwort"
            placeholderTextColor="#98A2B3"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* Fehlermeldung */}
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Login-Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Anmelden</Text>
            )}
          </TouchableOpacity>

          {/* Registrierungs-Links */}
          <View style={styles.registerRow}>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/register-mentee")}
            >
              <Text style={styles.linkText}>Mentee registrieren</Text>
            </TouchableOpacity>
            <Text style={styles.divider}>|</Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/register-mentor")}
            >
              <Text style={styles.linkText}>Als Mentor bewerben</Text>
            </TouchableOpacity>
          </View>

          {/* Öffentliche Anmeldung */}
          <TouchableOpacity
            style={styles.publicRegisterButton}
            onPress={() => router.push("/(auth)/register-public")}
          >
            <Text style={styles.publicRegisterText}>
              Neu beim Islam? Hier anmelden →
            </Text>
          </TouchableOpacity>

          {/* Test-Schnellzugang */}
          <View style={styles.quickSection}>
            <Text style={styles.quickLabel}>
              {"SCHNELLZUGANG (ENTWICKLUNG)"}
            </Text>
            <View style={styles.quickRow}>
              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => handleQuickLogin("admin")}
              >
                <Text style={styles.quickButtonText}>
                  Admin
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => handleQuickLogin("mentor")}
              >
                <Text style={styles.quickButtonText}>
                  Mentor
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => handleQuickLogin("mentee")}
              >
                <Text style={styles.quickButtonText}>
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

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    backgroundColor: COLORS.gradientStart,
    paddingTop: 64,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoLetter: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: "700",
  },
  logoTitle: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 6,
  },
  logoSubtitle: {
    color: COLORS.white,
    opacity: 0.75,
    fontSize: 15,
    textAlign: "center",
  },
  goldDivider: {
    marginTop: 24,
    width: 60,
    height: 3,
    backgroundColor: COLORS.gold,
    borderRadius: 2,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  welcomeTitle: {
    color: COLORS.primary,
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 6,
  },
  welcomeSubtitle: {
    color: COLORS.secondary,
    fontSize: 15,
    marginBottom: 24,
  },
  fieldLabel: {
    color: COLORS.secondary,
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 5,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: COLORS.primary,
    marginBottom: 16,
    fontSize: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 5,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: COLORS.gradientStart,
    borderRadius: 5,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  loginButtonText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 16,
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 16,
  },
  publicRegisterButton: {
    backgroundColor: "rgba(238,167,27,0.10)",
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  publicRegisterText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  linkText: {
    color: COLORS.link,
    fontSize: 14,
  },
  divider: {
    color: COLORS.tertiary,
    fontSize: 14,
  },
  quickSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 20,
    marginBottom: 32,
  },
  quickLabel: {
    color: COLORS.tertiary,
    fontSize: 11,
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: 1,
  },
  quickRow: {
    flexDirection: "row",
    gap: 8,
  },
  quickButton: {
    flex: 1,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: "center",
  },
  quickButtonText: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: "500",
  },
});
