import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import {
  MOCK_MENTORSHIPS,
  MOCK_USERS,
  SESSION_TYPES,
  getMentorshipsByMentorId,
  getMentorshipByMenteeId,
  getSessionsByMentorshipId,
  getCompletedStepIds,
} from "../../data/mockData";
import type { Mentorship } from "../../types";

export default function MenteesScreen() {
  const { user } = useAuth();
  if (!user) return null;

  if (user.role === "admin") return <AdminMenteesView />;
  if (user.role === "mentor") return <MentorMenteesView />;
  return <MenteeProgressView />;
}

function AdminMenteesView() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "assigned" | "unassigned">(
    "all"
  );
  const allMentees = MOCK_USERS.filter((u) => u.role === "mentee");

  const filteredMentees = allMentees.filter((mentee) => {
    const hasMentorship = MOCK_MENTORSHIPS.find(
      (m) => m.mentee_id === mentee.id
    );
    const matchesSearch =
      mentee.name.toLowerCase().includes(search.toLowerCase()) ||
      mentee.city.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "assigned"
        ? !!hasMentorship
        : !hasMentorship;
    return matchesSearch && matchesFilter;
  });

  return (
    <ScrollView className="flex-1 bg-bnm-bg">
      <View className="p-6">
        <Text className="text-2xl font-bold text-bnm-primary mb-1">
          Alle Mentees
        </Text>
        <Text className="text-bnm-secondary mb-4">
          {allMentees.length} Mentees registriert
        </Text>

        {/* Suche */}
        <TextInput
          className="bg-white border border-bnm-border rounded-xl px-4 py-3 text-bnm-primary mb-4"
          placeholder="Suchen nach Name oder Stadt..."
          placeholderTextColor="#98A2B3"
          value={search}
          onChangeText={setSearch}
        />

        {/* Filter-Tabs */}
        <View className="flex-row gap-2 mb-6">
          {(
            [
              { key: "all", label: "Alle" },
              { key: "assigned", label: "Zugewiesen" },
              { key: "unassigned", label: "Offen" },
            ] as const
          ).map((tab) => (
            <TouchableOpacity
              key={tab.key}
              className={`px-4 py-2 rounded-full border ${
                filter === tab.key
                  ? "bg-bnm-primary border-bnm-primary"
                  : "bg-white border-bnm-border"
              }`}
              onPress={() => setFilter(tab.key)}
            >
              <Text
                className={`text-sm font-medium ${
                  filter === tab.key ? "text-white" : "text-bnm-secondary"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mentee-Liste */}
        {filteredMentees.length === 0 ? (
          <View className="bg-white rounded-xl border border-bnm-border p-8 items-center">
            <Text className="text-bnm-tertiary text-center">
              Keine Mentees gefunden.
            </Text>
          </View>
        ) : (
          filteredMentees.map((mentee) => {
            const mentorship = MOCK_MENTORSHIPS.find(
              (m) => m.mentee_id === mentee.id
            );
            const completedSteps = mentorship
              ? getCompletedStepIds(mentorship.id)
              : [];
            const progress = mentorship
              ? Math.round(
                  (completedSteps.length / SESSION_TYPES.length) * 100
                )
              : 0;

            return (
              <View
                key={mentee.id}
                className="bg-white rounded-xl border border-bnm-border p-4 mb-3"
              >
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1">
                    <Text className="font-bold text-bnm-primary">
                      {mentee.name}
                    </Text>
                    <Text className="text-bnm-tertiary text-xs">
                      {mentee.city} · {mentee.age} J. ·{" "}
                      {mentee.gender === "male" ? "Bruder" : "Schwester"}
                    </Text>
                  </View>
                  {mentorship ? (
                    <View
                      className={`px-2 py-0.5 rounded-full ${
                        mentorship.status === "active"
                          ? "bg-green-100"
                          : mentorship.status === "completed"
                          ? "bg-blue-100"
                          : "bg-red-100"
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          mentorship.status === "active"
                            ? "text-green-700"
                            : mentorship.status === "completed"
                            ? "text-blue-700"
                            : "text-red-700"
                        }`}
                      >
                        {mentorship.status === "active"
                          ? "Aktiv"
                          : mentorship.status === "completed"
                          ? "Abgeschlossen"
                          : "Abgebrochen"}
                      </Text>
                    </View>
                  ) : (
                    <View className="bg-amber-100 px-2 py-0.5 rounded-full">
                      <Text className="text-amber-700 text-xs font-medium">
                        Offen
                      </Text>
                    </View>
                  )}
                </View>

                {mentorship ? (
                  <>
                    <Text className="text-bnm-tertiary text-xs mb-2">
                      Mentor: {mentorship.mentor?.name}
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <View className="flex-1 h-1.5 bg-bnm-bg rounded-full overflow-hidden">
                        <View
                          className="h-full bg-bnm-cta rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </View>
                      <Text className="text-bnm-secondary text-xs">
                        {completedSteps.length}/{SESSION_TYPES.length}
                      </Text>
                    </View>
                  </>
                ) : (
                  <TouchableOpacity className="mt-2 bg-bnm-primary rounded-lg py-2 items-center">
                    <Text className="text-white text-sm font-semibold">
                      Mentor zuweisen
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

function MentorMenteesView() {
  const { user } = useAuth();
  if (!user) return null;

  const myMentorships = getMentorshipsByMentorId(user.id);

  return (
    <ScrollView className="flex-1 bg-bnm-bg">
      <View className="p-6">
        <Text className="text-2xl font-bold text-bnm-primary mb-1">
          Meine Mentees
        </Text>
        <Text className="text-bnm-secondary mb-6">
          {myMentorships.filter((m) => m.status === "active").length} aktive
          Betreuungen
        </Text>

        {myMentorships.length === 0 ? (
          <View className="bg-white rounded-xl border border-bnm-border p-8 items-center">
            <Text className="text-bnm-tertiary text-center">
              Dir sind noch keine Mentees zugewiesen.
            </Text>
          </View>
        ) : (
          myMentorships.map((mentorship) => (
            <MentorMenteeCard key={mentorship.id} mentorship={mentorship} />
          ))
        )}
      </View>
    </ScrollView>
  );
}

function MentorMenteeCard({ mentorship }: { mentorship: Mentorship }) {
  const completedStepIds = getCompletedStepIds(mentorship.id);
  const sessions = getSessionsByMentorshipId(mentorship.id);
  const progress = Math.round(
    (completedStepIds.length / SESSION_TYPES.length) * 100
  );

  return (
    <View className="bg-white rounded-xl border border-bnm-border p-4 mb-4">
      {/* Mentee-Header */}
      <View className="flex-row items-start justify-between mb-3">
        <View>
          <Text className="font-bold text-bnm-primary text-lg">
            {mentorship.mentee?.name}
          </Text>
          <Text className="text-bnm-tertiary text-xs">
            {mentorship.mentee?.city} · {mentorship.mentee?.age} J. ·{" "}
            {mentorship.mentee?.gender === "male" ? "Bruder" : "Schwester"}
          </Text>
        </View>
        <View
          className={`px-2 py-0.5 rounded-full ${
            mentorship.status === "active" ? "bg-green-100" : "bg-gray-100"
          }`}
        >
          <Text
            className={`text-xs font-medium ${
              mentorship.status === "active"
                ? "text-green-700"
                : "text-gray-600"
            }`}
          >
            {mentorship.status === "active" ? "Aktiv" : "Abgeschlossen"}
          </Text>
        </View>
      </View>

      {/* Fortschrittsbalken */}
      <View className="flex-row items-center gap-3 mb-3">
        <View className="flex-1 h-2 bg-bnm-bg rounded-full overflow-hidden">
          <View
            className="h-full bg-bnm-cta rounded-full"
            style={{ width: `${progress}%` }}
          />
        </View>
        <Text className="text-bnm-secondary text-xs font-semibold">
          {completedStepIds.length}/{SESSION_TYPES.length} Steps
        </Text>
      </View>

      {/* Step-Liste */}
      <Text className="text-bnm-tertiary text-xs uppercase font-semibold mb-2 tracking-wider">
        Fortschritt
      </Text>
      <View className="flex-row flex-wrap gap-1 mb-3">
        {SESSION_TYPES.map((step, idx) => {
          const isDone = completedStepIds.includes(step.id);
          const isCurrent = !isDone && idx === completedStepIds.length;
          return (
            <View
              key={step.id}
              className={`px-2 py-1 rounded-lg ${
                isDone
                  ? "bg-green-100"
                  : isCurrent
                  ? "bg-amber-100"
                  : "bg-bnm-bg"
              }`}
            >
              <Text
                className={`text-xs ${
                  isDone
                    ? "text-green-700 font-medium"
                    : isCurrent
                    ? "text-amber-700 font-medium"
                    : "text-bnm-tertiary"
                }`}
              >
                {idx + 1}. {step.name}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Session-Anzahl */}
      <View className="border-t border-bnm-border pt-3 flex-row items-center justify-between">
        <Text className="text-bnm-tertiary text-xs">
          {sessions.length} Session{sessions.length !== 1 ? "s" : ""} dokumentiert
        </Text>
        <Text className="text-bnm-tertiary text-xs">
          Seit {new Date(mentorship.assigned_at).toLocaleDateString("de-DE")}
        </Text>
      </View>
    </View>
  );
}

function MenteeProgressView() {
  const { user } = useAuth();
  if (!user) return null;

  const mentorship = getMentorshipByMenteeId(user.id);
  const completedStepIds = mentorship
    ? getCompletedStepIds(mentorship.id)
    : [];
  const sessions = mentorship ? getSessionsByMentorshipId(mentorship.id) : [];

  if (!mentorship) {
    return (
      <ScrollView className="flex-1 bg-bnm-bg">
        <View className="p-6">
          <Text className="text-2xl font-bold text-bnm-primary mb-2">
            Mein Fortschritt
          </Text>
          <View className="bg-white rounded-xl border border-bnm-border p-8 items-center mt-4">
            <Text className="text-bnm-primary font-semibold mb-2 text-center">
              Noch keine Zuweisung
            </Text>
            <Text className="text-bnm-tertiary text-sm text-center">
              Das BNM-Team weist dir bald einen Mentor zu.
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-bnm-bg">
      <View className="p-6">
        <Text className="text-2xl font-bold text-bnm-primary mb-1">
          Mein Fortschritt
        </Text>
        <Text className="text-bnm-secondary mb-6">
          Mentor: {mentorship.mentor?.name}
        </Text>

        {/* Gesamtfortschritt */}
        <View className="bg-bnm-primary rounded-2xl p-5 mb-6">
          <Text className="text-white opacity-70 text-sm mb-1">
            Gesamtfortschritt
          </Text>
          <Text className="text-white text-4xl font-bold mb-3">
            {Math.round(
              (completedStepIds.length / SESSION_TYPES.length) * 100
            )}
            %
          </Text>
          <View className="h-3 bg-white/20 rounded-full overflow-hidden">
            <View
              className="h-full bg-bnm-gold rounded-full"
              style={{
                width: `${Math.round(
                  (completedStepIds.length / SESSION_TYPES.length) * 100
                )}%`,
              }}
            />
          </View>
          <Text className="text-white opacity-60 text-xs mt-2">
            {completedStepIds.length} von {SESSION_TYPES.length} Schritten abgeschlossen
          </Text>
        </View>

        {/* Detaillierte Schritt-Liste */}
        <Text className="font-bold text-bnm-primary mb-3">
          Deine 10 Schritte im Detail
        </Text>
        <View className="bg-white rounded-xl border border-bnm-border overflow-hidden mb-6">
          {SESSION_TYPES.map((step, idx) => {
            const isDone = completedStepIds.includes(step.id);
            const isCurrent = !isDone && idx === completedStepIds.length;
            const isLocked = !isDone && idx > completedStepIds.length;
            const session = sessions.find(
              (s) => s.session_type_id === step.id
            );

            return (
              <View
                key={step.id}
                className={`px-4 py-4 ${
                  idx < SESSION_TYPES.length - 1
                    ? "border-b border-bnm-border"
                    : ""
                } ${isCurrent ? "bg-amber-50" : ""}`}
              >
                <View className="flex-row items-start">
                  {/* Status-Indikator */}
                  <View
                    className={`w-9 h-9 rounded-full items-center justify-center mr-3 flex-shrink-0 ${
                      isDone
                        ? "bg-bnm-cta"
                        : isCurrent
                        ? "bg-bnm-gold"
                        : "bg-bnm-bg border border-bnm-border"
                    }`}
                  >
                    {isDone ? (
                      <Text className="text-white font-bold">✓</Text>
                    ) : (
                      <Text
                        className={`text-sm font-bold ${
                          isCurrent ? "text-white" : "text-bnm-tertiary"
                        }`}
                      >
                        {idx + 1}
                      </Text>
                    )}
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-0.5">
                      <Text
                        className={`font-semibold ${
                          isDone
                            ? "text-bnm-cta"
                            : isCurrent
                            ? "text-bnm-primary"
                            : isLocked
                            ? "text-bnm-tertiary"
                            : "text-bnm-primary"
                        }`}
                      >
                        {step.name}
                      </Text>
                      {isLocked && (
                        <Text className="text-bnm-tertiary text-xs">
                          Gesperrt
                        </Text>
                      )}
                      {isCurrent && (
                        <View className="bg-amber-100 px-2 py-0.5 rounded-full">
                          <Text className="text-amber-700 text-xs font-medium">
                            Aktuell
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-bnm-tertiary text-xs">
                      {step.description}
                    </Text>
                    {isDone && session && (
                      <Text className="text-green-600 text-xs mt-1">
                        Abgeschlossen am{" "}
                        {new Date(session.date).toLocaleDateString("de-DE")}
                        {session.is_online ? " (Online)" : " (Vor Ort)"}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
