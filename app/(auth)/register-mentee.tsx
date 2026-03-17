import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import type { Gender, ContactPreference } from "../../types";

interface MenteeFormData {
  name: string;
  email: string;
  gender: Gender | "";
  city: string;
  age: string;
  phone: string;
  contact_preference: ContactPreference | "";
}

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "Bruder" },
  { value: "female", label: "Schwester" },
];

const CONTACT_OPTIONS: { value: ContactPreference; label: string }[] = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "phone", label: "Telefon" },
  { value: "telegram", label: "Telegram" },
  { value: "email", label: "E-Mail" },
];

export default function RegisterMenteeScreen() {
  const router = useRouter();
  const [form, setForm] = useState<MenteeFormData>({
    name: "",
    email: "",
    gender: "",
    city: "",
    age: "",
    phone: "",
    contact_preference: "",
  });
  const [errors, setErrors] = useState<Partial<MenteeFormData>>({});

  function validate(): boolean {
    const newErrors: Partial<MenteeFormData> = {};
    if (!form.name.trim()) newErrors.name = "Pflichtfeld";
    if (!form.email.trim()) newErrors.email = "Pflichtfeld";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Ungültige E-Mail";
    if (!form.gender) newErrors.gender = "Pflichtfeld";
    if (!form.city.trim()) newErrors.city = "Pflichtfeld";
    if (!form.age.trim()) newErrors.age = "Pflichtfeld";
    else if (isNaN(Number(form.age)) || Number(form.age) < 10)
      newErrors.age = "Ungültiges Alter";
    if (!form.contact_preference)
      newErrors.contact_preference = "Pflichtfeld";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    Alert.alert(
      "Registrierung eingegangen",
      "Vielen Dank! Deine Registrierung wurde eingereicht. Das BNM-Team wird sich bald bei dir melden.",
      [{ text: "OK", onPress: () => router.replace("/(auth)/login") }]
    );
  }

  function update(field: keyof MenteeFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-bnm-bg"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-6 pt-6">
          <Text className="text-bnm-secondary text-sm mb-6">
            Melde dich als neuer Muslim an, um einer Betreuung zugewiesen zu werden.
          </Text>

          {/* Name */}
          <FieldLabel label="Vollständiger Name" error={errors.name} />
          <TextInput
            className={`bg-white border rounded-xl px-4 py-3 text-bnm-primary mb-4 ${errors.name ? "border-red-400" : "border-bnm-border"}`}
            placeholder="Dein Name"
            placeholderTextColor="#98A2B3"
            value={form.name}
            onChangeText={(v) => update("name", v)}
          />

          {/* E-Mail */}
          <FieldLabel label="E-Mail-Adresse" error={errors.email} />
          <TextInput
            className={`bg-white border rounded-xl px-4 py-3 text-bnm-primary mb-4 ${errors.email ? "border-red-400" : "border-bnm-border"}`}
            placeholder="deine@email.de"
            placeholderTextColor="#98A2B3"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(v) => update("email", v)}
          />

          {/* Telefon */}
          <FieldLabel label="Telefonnummer (optional)" />
          <TextInput
            className="bg-white border border-bnm-border rounded-xl px-4 py-3 text-bnm-primary mb-4"
            placeholder="+49 151 ..."
            placeholderTextColor="#98A2B3"
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={(v) => update("phone", v)}
          />

          {/* Geschlecht */}
          <FieldLabel label="Ich bin" error={errors.gender} />
          <View className="flex-row gap-3 mb-4">
            {GENDER_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                className={`flex-1 py-3 rounded-xl border items-center ${
                  form.gender === opt.value
                    ? "bg-bnm-primary border-bnm-primary"
                    : "bg-white border-bnm-border"
                }`}
                onPress={() => update("gender", opt.value)}
              >
                <Text
                  className={`font-medium ${
                    form.gender === opt.value
                      ? "text-white"
                      : "text-bnm-secondary"
                  }`}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Stadt */}
          <FieldLabel label="Wohnort / Stadt" error={errors.city} />
          <TextInput
            className={`bg-white border rounded-xl px-4 py-3 text-bnm-primary mb-4 ${errors.city ? "border-red-400" : "border-bnm-border"}`}
            placeholder="z.B. Berlin"
            placeholderTextColor="#98A2B3"
            value={form.city}
            onChangeText={(v) => update("city", v)}
          />

          {/* Alter */}
          <FieldLabel label="Alter" error={errors.age} />
          <TextInput
            className={`bg-white border rounded-xl px-4 py-3 text-bnm-primary mb-4 ${errors.age ? "border-red-400" : "border-bnm-border"}`}
            placeholder="z.B. 25"
            placeholderTextColor="#98A2B3"
            keyboardType="number-pad"
            value={form.age}
            onChangeText={(v) => update("age", v)}
          />

          {/* Kontaktpräferenz */}
          <FieldLabel
            label="Bevorzugter Kontaktweg"
            error={errors.contact_preference}
          />
          <View className="flex-row flex-wrap gap-2 mb-6">
            {CONTACT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                className={`px-4 py-2 rounded-full border ${
                  form.contact_preference === opt.value
                    ? "bg-bnm-primary border-bnm-primary"
                    : "bg-white border-bnm-border"
                }`}
                onPress={() => update("contact_preference", opt.value)}
              >
                <Text
                  className={`text-sm font-medium ${
                    form.contact_preference === opt.value
                      ? "text-white"
                      : "text-bnm-secondary"
                  }`}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Submit */}
          <TouchableOpacity
            className="bg-bnm-cta rounded-xl py-4 items-center"
            onPress={handleSubmit}
          >
            <Text className="text-white font-bold text-base">
              Registrierung einreichen
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function FieldLabel({
  label,
  error,
}: {
  label: string;
  error?: string;
}) {
  return (
    <View className="flex-row justify-between mb-1">
      <Text className="text-bnm-secondary text-sm font-medium">{label}</Text>
      {error ? <Text className="text-red-500 text-xs">{error}</Text> : null}
    </View>
  );
}
