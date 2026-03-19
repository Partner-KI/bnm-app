import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../contexts/DataContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { COLORS } from "../../constants/Colors";
import { showConfirm, showError, showSuccess } from "../../lib/errorHandler";
import { Container } from "../../components/Container";
import type { UserRole, Gender } from "../../types";

const ROLES: { key: UserRole; labelKey: "editUser.roleMentor" | "editUser.roleMentee" | "editUser.roleAdmin" | "editUser.roleOffice" }[] = [
  { key: "mentor", labelKey: "editUser.roleMentor" },
  { key: "mentee", labelKey: "editUser.roleMentee" },
  { key: "admin", labelKey: "editUser.roleAdmin" },
  { key: "office", labelKey: "editUser.roleOffice" },
];

export default function EditUserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user: authUser } = useAuth();
  const { getUserById, updateUser, setUserActive } = useData();
  const { t } = useLanguage();

  const target = getUserById(id);

  // Nur Admin/Office darf bearbeiten
  if (!authUser || (authUser.role !== "admin" && authUser.role !== "office")) {
    return (
      <Container>
        <View style={styles.center}>
          <Text style={styles.denied}>{t("editUser.accessDenied")}</Text>
        </View>
      </Container>
    );
  }

  if (!target) {
    return (
      <Container>
        <View style={styles.center}>
          <Text style={styles.denied}>{t("editUser.notFound")}</Text>
        </View>
      </Container>
    );
  }

  return <EditUserForm userId={id} />;
}

function EditUserForm({ userId }: { userId: string }) {
  const router = useRouter();
  const { getUserById, updateUser, setUserActive } = useData();
  const { t } = useLanguage();

  const target = getUserById(userId)!;

  const [name, setName] = useState(target.name);
  const [city, setCity] = useState(target.city);
  const [age, setAge] = useState(String(target.age));
  const [phone, setPhone] = useState(target.phone ?? "");
  const [role, setRole] = useState<UserRole>(target.role);
  const [gender, setGender] = useState<Gender>(target.gender);
  const [isSaving, setIsSaving] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isBlocked = target.is_active === false;

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = t("editUser.errorName");
    if (!city.trim()) newErrors.city = t("editUser.errorCity");
    const ageNum = parseInt(age, 10);
    if (!age || isNaN(ageNum) || ageNum < 12 || ageNum > 120) {
      newErrors.age = t("editUser.errorAge");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setIsSaving(true);
    try {
      await updateUser(userId, {
        name: name.trim(),
        city: city.trim(),
        age: parseInt(age, 10),
        phone: phone.trim() || undefined,
        role,
        gender,
      });
      showSuccess(t("editUser.successMsg"), () => router.back());
    } catch {
      showError(t("editUser.errorName"));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleBlock() {
    const confirmTitle = isBlocked ? t("editUser.unblockTitle") : t("editUser.blockTitle");
    const confirmText = isBlocked
      ? t("editUser.unblockText").replace("{0}", target.name)
      : t("editUser.blockText").replace("{0}", target.name);

    const ok = await showConfirm(confirmTitle, confirmText);
    if (!ok) return;

    setIsBlocking(true);
    try {
      await setUserActive(userId, isBlocked);
      showSuccess(isBlocked ? t("editUser.unblockSuccess") : t("editUser.blockSuccess"));
    } catch {
      showError(t("common.error"));
    } finally {
      setIsBlocking(false);
    }
  }

  return (
    <Container>
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>{t("editUser.back")}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("editUser.title")}</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>

          {/* Gesperrt-Badge */}
          {isBlocked && (
            <View style={styles.blockedBanner}>
              <Text style={styles.blockedBannerText}>⚠ {t("editUser.blocked")}</Text>
            </View>
          )}

          {/* Profil-Avatar */}
          <View style={styles.avatarRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {target.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
              </Text>
            </View>
            <View>
              <Text style={styles.avatarName}>{target.name}</Text>
              <Text style={styles.avatarEmail}>{target.email}</Text>
            </View>
          </View>

          {/* Formular */}
          <Text style={styles.sectionLabel}>PROFILDATEN</Text>

          <FormField label={t("editUser.name")} error={errors.name}>
            <TextInput
              style={[styles.input, errors.name ? styles.inputError : {}]}
              value={name}
              onChangeText={setName}
              placeholder={t("editUser.namePlaceholder")}
              placeholderTextColor={COLORS.tertiary}
            />
          </FormField>

          <FormField label={t("editUser.city")} error={errors.city}>
            <TextInput
              style={[styles.input, errors.city ? styles.inputError : {}]}
              value={city}
              onChangeText={setCity}
              placeholder={t("editUser.cityPlaceholder")}
              placeholderTextColor={COLORS.tertiary}
            />
          </FormField>

          <FormField label={t("editUser.age")} error={errors.age}>
            <TextInput
              style={[styles.input, errors.age ? styles.inputError : {}]}
              value={age}
              onChangeText={setAge}
              placeholder={t("editUser.agePlaceholder")}
              placeholderTextColor={COLORS.tertiary}
              keyboardType="numeric"
            />
          </FormField>

          <FormField label={t("editUser.phone")}>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+49 ..."
              placeholderTextColor={COLORS.tertiary}
              keyboardType="phone-pad"
            />
          </FormField>

          {/* Geschlecht */}
          <Text style={styles.sectionLabel}>{t("editUser.gender").toUpperCase()}</Text>
          <View style={styles.pillRow}>
            {(["male", "female"] as Gender[]).map((g) => (
              <TouchableOpacity
                key={g}
                style={[
                  styles.pill,
                  gender === g
                    ? g === "male"
                      ? styles.pillActiveMale
                      : styles.pillActiveFemale
                    : styles.pillInactive,
                ]}
                onPress={() => setGender(g)}
              >
                <Text style={[styles.pillText, gender === g ? styles.pillTextActive : styles.pillTextInactive]}>
                  {g === "male" ? t("editUser.male") : t("editUser.female")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Rolle */}
          <Text style={styles.sectionLabel}>{t("editUser.role").toUpperCase()}</Text>
          <View style={styles.pillRow}>
            {ROLES.map(({ key, labelKey }) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.pill,
                  role === key ? styles.pillActiveRole : styles.pillInactive,
                ]}
                onPress={() => setRole(key)}
              >
                <Text style={[styles.pillText, role === key ? styles.pillTextActive : styles.pillTextInactive]}>
                  {t(labelKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Speichern */}
          <TouchableOpacity
            style={[styles.saveButton, isSaving ? { opacity: 0.6 } : {}]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? t("editUser.saving") : t("editUser.save")}
            </Text>
          </TouchableOpacity>

          {/* User sperren / entsperren */}
          <TouchableOpacity
            style={[styles.blockButton, isBlocked ? styles.unblockButton : {}, isBlocking ? { opacity: 0.6 } : {}]}
            onPress={handleToggleBlock}
            disabled={isBlocking}
          >
            <Text style={[styles.blockButtonText, isBlocked ? styles.unblockButtonText : {}]}>
              {isBlocking ? "..." : isBlocked ? t("editUser.unblockUser") : t("editUser.blockUser")}
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={fieldStyles.container}>
      <Text style={fieldStyles.label}>{label}</Text>
      {children}
      {error ? <Text style={fieldStyles.error}>{error}</Text> : null}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { color: COLORS.secondary, fontSize: 13, fontWeight: "500", marginBottom: 4 },
  error: { color: COLORS.error, fontSize: 12, marginTop: 4 },
});

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  denied: { color: COLORS.error, textAlign: "center", fontSize: 14 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { flex: 1 },
  backBtnText: { color: COLORS.primary, fontSize: 16, fontWeight: "500" },
  headerTitle: { fontWeight: "bold", color: COLORS.primary, fontSize: 16 },
  headerRight: { flex: 1 },
  scrollView: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, paddingBottom: 40 },
  blockedBanner: {
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  blockedBannerText: { color: "#b91c1c", fontWeight: "700", fontSize: 14 },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 20,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: COLORS.white, fontWeight: "bold", fontSize: 18 },
  avatarName: { fontWeight: "700", color: COLORS.primary, fontSize: 16 },
  avatarEmail: { color: COLORS.secondary, fontSize: 12, marginTop: 2 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.tertiary,
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 4,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: COLORS.primary,
    fontSize: 14,
  },
  inputError: { borderColor: COLORS.error },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
  },
  pillActiveMale: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pillActiveFemale: { backgroundColor: "#7e22ce", borderColor: "#7e22ce" },
  pillActiveRole: { backgroundColor: COLORS.gradientStart, borderColor: COLORS.gradientStart },
  pillInactive: { backgroundColor: COLORS.white, borderColor: COLORS.border },
  pillText: { fontSize: 13, fontWeight: "500" },
  pillTextActive: { color: COLORS.white },
  pillTextInactive: { color: COLORS.secondary },
  saveButton: {
    backgroundColor: COLORS.cta,
    borderRadius: 6,
    paddingVertical: 11,
    alignItems: "center",
    marginBottom: 12,
    marginTop: 8,
  },
  saveButtonText: { color: COLORS.white, fontWeight: "700", fontSize: 15 },
  blockButton: {
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 6,
    paddingVertical: 11,
    alignItems: "center",
  },
  blockButtonText: { color: "#b91c1c", fontWeight: "600", fontSize: 14 },
  unblockButton: {
    backgroundColor: "#dcfce7",
    borderColor: "#86efac",
  },
  unblockButtonText: { color: "#15803d" },
});
