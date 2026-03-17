import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import type { UserRole } from "../../types";

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator",
  mentor: "Mentor",
  mentee: "Mentee (Neuer Muslim)",
};

const CONTACT_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  phone: "Telefon",
  telegram: "Telegram",
  email: "E-Mail",
};

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  if (!user) return null;

  function handleLogout() {
    Alert.alert("Abmelden", "Möchtest du dich wirklich abmelden?", [
      { text: "Abbrechen", style: "cancel" },
      {
        text: "Abmelden",
        style: "destructive",
        onPress: logout,
      },
    ]);
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <ScrollView className="flex-1 bg-bnm-bg">
      <View className="p-6">
        <Text className="text-2xl font-bold text-bnm-primary mb-6">
          Profil
        </Text>

        {/* Avatar + Name Card */}
        <View className="bg-white rounded-2xl border border-bnm-border p-6 items-center mb-6">
          {/* Avatar-Kreis mit Initialen */}
          <View className="w-20 h-20 rounded-full bg-bnm-primary items-center justify-center mb-4">
            <Text className="text-white text-2xl font-bold">{initials}</Text>
          </View>

          <Text className="text-xl font-bold text-bnm-primary mb-1">
            {user.name}
          </Text>

          {/* Rollen-Badge */}
          <View
            className={`px-3 py-1 rounded-full ${
              user.role === "admin"
                ? "bg-purple-100"
                : user.role === "mentor"
                ? "bg-blue-100"
                : "bg-green-100"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                user.role === "admin"
                  ? "text-purple-700"
                  : user.role === "mentor"
                  ? "text-blue-700"
                  : "text-green-700"
              }`}
            >
              {ROLE_LABELS[user.role]}
            </Text>
          </View>

          {/* Geschlecht-Badge */}
          <View className="mt-2">
            <Text className="text-bnm-tertiary text-xs">
              {user.gender === "male" ? "Bruder" : "Schwester"}
            </Text>
          </View>
        </View>

        {/* Persönliche Infos */}
        <View className="bg-white rounded-xl border border-bnm-border p-4 mb-4">
          <Text className="text-xs font-semibold text-bnm-tertiary uppercase tracking-wider mb-3">
            Persönliche Informationen
          </Text>

          <InfoRow label="E-Mail" value={user.email} />
          <InfoRow label="Stadt" value={user.city} />
          <InfoRow label="Alter" value={`${user.age} Jahre`} />
          {user.phone && <InfoRow label="Telefon" value={user.phone} />}
          <InfoRow
            label="Kontakt"
            value={CONTACT_LABELS[user.contact_preference] ?? user.contact_preference}
            isLast
          />
        </View>

        {/* Konto-Aktionen */}
        <View className="bg-white rounded-xl border border-bnm-border overflow-hidden mb-6">
          <Text className="text-xs font-semibold text-bnm-tertiary uppercase tracking-wider px-4 pt-4 pb-2">
            Konto
          </Text>
          <TouchableOpacity className="flex-row items-center justify-between px-4 py-3 border-b border-bnm-border">
            <Text className="text-bnm-primary">Profil bearbeiten</Text>
            <Text className="text-bnm-tertiary">›</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center justify-between px-4 py-3">
            <Text className="text-bnm-primary">Passwort ändern</Text>
            <Text className="text-bnm-tertiary">›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          className="bg-red-50 border border-red-200 rounded-xl py-4 items-center mb-4"
          onPress={handleLogout}
        >
          <Text className="text-red-600 font-semibold">Abmelden</Text>
        </TouchableOpacity>

        {/* App-Info */}
        <Text className="text-bnm-tertiary text-xs text-center">
          BNM App · Betreuung neuer Muslime
        </Text>
      </View>
    </ScrollView>
  );
}

function InfoRow({
  label,
  value,
  isLast,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View
      className={`flex-row justify-between items-center py-3 ${
        !isLast ? "border-b border-bnm-border" : ""
      }`}
    >
      <Text className="text-bnm-secondary text-sm">{label}</Text>
      <Text className="text-bnm-primary text-sm font-medium max-w-[60%] text-right">
        {value}
      </Text>
    </View>
  );
}
