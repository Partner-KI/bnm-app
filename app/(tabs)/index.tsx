import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import {
  MOCK_MENTORSHIPS,
  MOCK_USERS,
  SESSION_TYPES,
  getMentorshipsByMentorId,
  getMentorshipByMenteeId,
  getCompletedStepIds,
} from "../../data/mockData";

export default function DashboardScreen() {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role === "admin") return <AdminDashboard />;
  if (user.role === "mentor") return <MentorDashboard />;
  return <MenteeDashboard />;
}

function AdminDashboard() {
  const allMentors = MOCK_USERS.filter((u) => u.role === "mentor");
  const allMentees = MOCK_USERS.filter((u) => u.role === "mentee");
  const activeMentorships = MOCK_MENTORSHIPS.filter(
    (m) => m.status === "active"
  );
  const completedMentorships = MOCK_MENTORSHIPS.filter(
    (m) => m.status === "completed"
  );
  const unassignedMentees = allMentees.filter(
    (mentee) => !MOCK_MENTORSHIPS.find((m) => m.mentee_id === mentee.id)
  );

  return (
    <ScrollView className="flex-1 bg-bnm-bg">
      <View className="p-6">
        <Text className="text-2xl font-bold text-bnm-primary mb-1">
          Admin Dashboard
        </Text>
        <Text className="text-bnm-secondary mb-6">
          Gesamtübersicht BNM-Programm
        </Text>

        {/* KPI Karten – Reihe 1 */}
        <View className="flex-row gap-3 mb-3">
          <StatCard
            label="Aktive Betreuungen"
            value={activeMentorships.length}
            color="text-bnm-primary"
          />
          <StatCard
            label="Abgeschlossen"
            value={completedMentorships.length}
            color="text-bnm-cta"
          />
        </View>

        {/* KPI Karten – Reihe 2 */}
        <View className="flex-row gap-3 mb-6">
          <StatCard
            label="Mentoren"
            value={allMentors.length}
            color="text-bnm-primary"
          />
          <StatCard
            label="Mentees gesamt"
            value={allMentees.length}
            color="text-bnm-gold"
          />
        </View>

        {/* Nicht zugewiesene Mentees */}
        {unassignedMentees.length > 0 && (
          <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <Text className="text-amber-800 font-semibold mb-1">
              {unassignedMentees.length} Mentee{unassignedMentees.length > 1 ? "s" : ""} ohne Zuweisung
            </Text>
            {unassignedMentees.map((mentee) => (
              <View
                key={mentee.id}
                className="flex-row items-center justify-between py-2 border-b border-amber-100"
              >
                <View>
                  <Text className="text-bnm-primary font-medium">
                    {mentee.name}
                  </Text>
                  <Text className="text-bnm-tertiary text-xs">
                    {mentee.city} · {mentee.gender === "male" ? "Bruder" : "Schwester"}
                  </Text>
                </View>
                <TouchableOpacity className="bg-bnm-primary px-3 py-1 rounded-lg">
                  <Text className="text-white text-xs font-semibold">
                    Zuweisen
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Aktive Betreuungen Übersicht */}
        <View className="bg-white rounded-xl border border-bnm-border p-4 mb-6">
          <Text className="font-bold text-bnm-primary mb-3">
            Aktive Betreuungen
          </Text>
          {activeMentorships.map((m, index) => {
            const completedSteps = getCompletedStepIds(m.id);
            const progress = Math.round(
              (completedSteps.length / SESSION_TYPES.length) * 100
            );
            const isLast = index === activeMentorships.length - 1;
            return (
              <View
                key={m.id}
                className={`py-3 ${isLast ? "" : "border-b border-bnm-border"}`}
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View>
                    <Text className="font-semibold text-bnm-primary">
                      {m.mentee?.name}
                    </Text>
                    <Text className="text-bnm-tertiary text-xs">
                      Mentor: {m.mentor?.name}
                    </Text>
                  </View>
                  <View className="bg-bnm-bg px-2 py-1 rounded-lg">
                    <Text className="text-bnm-primary text-xs font-bold">
                      {progress}%
                    </Text>
                  </View>
                </View>
                <ProgressBar progress={progress} />
              </View>
            );
          })}
        </View>

        {/* Geschlechtertrennung Hinweis */}
        <View className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <Text className="text-blue-800 font-semibold text-sm mb-1">
            Geschlechtertrennung aktiv
          </Text>
          <Text className="text-blue-600 text-xs">
            Brüder werden nur Brüdern zugewiesen, Schwestern nur Schwestern.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function MentorDashboard() {
  const { user } = useAuth();
  if (!user) return null;

  const myMentorships = getMentorshipsByMentorId(user.id);
  const activeMentorships = myMentorships.filter(
    (m) => m.status === "active"
  );
  const completedMentorships = myMentorships.filter(
    (m) => m.status === "completed"
  );

  return (
    <ScrollView className="flex-1 bg-bnm-bg">
      <View className="p-6">
        {/* Begrüssung */}
        <View className="bg-bnm-primary rounded-2xl p-5 mb-6">
          <Text className="text-white text-sm opacity-70 mb-1">
            Salam Aleikum,
          </Text>
          <Text className="text-white text-xl font-bold">{user.name}</Text>
          <Text className="text-white opacity-60 text-sm mt-1">
            {user.city} · {user.gender === "male" ? "Bruder" : "Schwester"}
          </Text>
        </View>

        {/* Stats */}
        <View className="flex-row gap-3 mb-6">
          <StatCard
            label="Aktive Mentees"
            value={activeMentorships.length}
            color="text-bnm-primary"
          />
          <StatCard
            label="Abgeschlossen"
            value={completedMentorships.length}
            color="text-bnm-cta"
          />
        </View>

        {/* Aktive Betreuungen */}
        <Text className="font-bold text-bnm-primary mb-3">
          Meine aktiven Betreuungen
        </Text>
        {activeMentorships.length === 0 ? (
          <View className="bg-white rounded-xl border border-bnm-border p-8 items-center mb-6">
            <Text className="text-bnm-tertiary text-center">
              Dir sind aktuell keine Mentees zugewiesen.
            </Text>
          </View>
        ) : (
          activeMentorships.map((m) => {
            const completedSteps = getCompletedStepIds(m.id);
            const nextStepIdx = completedSteps.length;
            const nextStep =
              nextStepIdx < SESSION_TYPES.length
                ? SESSION_TYPES[nextStepIdx]
                : null;
            const progress = Math.round(
              (completedSteps.length / SESSION_TYPES.length) * 100
            );

            return (
              <View
                key={m.id}
                className="bg-white rounded-xl border border-bnm-border p-4 mb-3"
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View>
                    <Text className="font-bold text-bnm-primary">
                      {m.mentee?.name}
                    </Text>
                    <Text className="text-bnm-tertiary text-xs">
                      {m.mentee?.city} · Seit{" "}
                      {new Date(m.assigned_at).toLocaleDateString("de-DE")}
                    </Text>
                  </View>
                  <View className="bg-bnm-bg px-3 py-1 rounded-full">
                    <Text className="text-bnm-primary text-sm font-bold">
                      {completedSteps.length}/{SESSION_TYPES.length}
                    </Text>
                  </View>
                </View>
                <ProgressBar progress={progress} />
                {nextStep && (
                  <View className="mt-3 flex-row items-center">
                    <View className="w-2 h-2 rounded-full bg-bnm-gold mr-2" />
                    <Text className="text-bnm-secondary text-xs">
                      Nächster Schritt: {nextStep.name}
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        )}

        {/* Mentor des Monats Platzhalter */}
        <View className="bg-bnm-gold/10 border border-bnm-gold/30 rounded-xl p-4 mt-2">
          <View className="flex-row items-center mb-1">
            <Text className="text-bnm-gold text-lg mr-2">★</Text>
            <Text className="font-bold text-bnm-primary">Mentor des Monats</Text>
          </View>
          <Text className="text-bnm-secondary text-sm">
            Dokumentiere deine Sessions regelmässig, um in die Auswahl zu kommen.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function MenteeDashboard() {
  const { user } = useAuth();
  if (!user) return null;

  const mentorship = getMentorshipByMenteeId(user.id);
  const completedStepIds = mentorship
    ? getCompletedStepIds(mentorship.id)
    : [];

  return (
    <ScrollView className="flex-1 bg-bnm-bg">
      <View className="p-6">
        {/* Begrüssung */}
        <View className="bg-bnm-primary rounded-2xl p-5 mb-6">
          <Text className="text-white text-sm opacity-70 mb-1">
            Salam Aleikum,
          </Text>
          <Text className="text-white text-xl font-bold">{user.name}</Text>
          {mentorship ? (
            <Text className="text-white opacity-60 text-sm mt-1">
              Mentor: {mentorship.mentor?.name}
            </Text>
          ) : (
            <Text className="text-white opacity-60 text-sm mt-1">
              Noch kein Mentor zugewiesen
            </Text>
          )}
        </View>

        {/* Fortschritts-Übersicht */}
        {mentorship ? (
          <>
            <View className="bg-white rounded-xl border border-bnm-border p-4 mb-6">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="font-bold text-bnm-primary">
                  Dein Fortschritt
                </Text>
                <Text className="text-bnm-gold font-bold">
                  {completedStepIds.length}/{SESSION_TYPES.length}
                </Text>
              </View>
              <ProgressBar
                progress={Math.round(
                  (completedStepIds.length / SESSION_TYPES.length) * 100
                )}
              />
            </View>

            {/* 10-Schritte-Gamification */}
            <Text className="font-bold text-bnm-primary mb-3">
              Deine 10 Schritte
            </Text>
            <View className="bg-white rounded-xl border border-bnm-border overflow-hidden mb-6">
              {SESSION_TYPES.map((step, idx) => {
                const isDone = completedStepIds.includes(step.id);
                const isCurrent =
                  !isDone && idx === completedStepIds.length;

                return (
                  <View
                    key={step.id}
                    className={`flex-row items-center px-4 py-3 ${
                      idx < SESSION_TYPES.length - 1
                        ? "border-b border-bnm-border"
                        : ""
                    } ${isCurrent ? "bg-green-50" : ""}`}
                  >
                    {/* Schritt-Indikator */}
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                        isDone
                          ? "bg-bnm-cta"
                          : isCurrent
                          ? "bg-bnm-gold"
                          : "bg-bnm-bg border border-bnm-border"
                      }`}
                    >
                      {isDone ? (
                        <Text className="text-white text-sm font-bold">✓</Text>
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
                      <Text
                        className={`font-medium ${
                          isDone
                            ? "text-bnm-cta"
                            : isCurrent
                            ? "text-bnm-primary"
                            : "text-bnm-tertiary"
                        }`}
                      >
                        {step.name}
                      </Text>
                      {isCurrent && (
                        <Text className="text-bnm-secondary text-xs mt-0.5">
                          Aktuelle Session
                        </Text>
                      )}
                    </View>

                    {isDone && (
                      <View className="bg-green-100 px-2 py-0.5 rounded-full">
                        <Text className="text-green-700 text-xs">
                          Erledigt
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </>
        ) : (
          <View className="bg-white rounded-xl border border-bnm-border p-8 items-center">
            <Text className="text-bnm-primary font-semibold mb-2">
              Zuweisung ausstehend
            </Text>
            <Text className="text-bnm-tertiary text-center text-sm">
              Das BNM-Team weist dir bald einen passenden Mentor zu.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View className="flex-1 bg-white rounded-xl p-4 border border-bnm-border">
      <Text className="text-bnm-tertiary text-xs mb-1">{label}</Text>
      <Text className={`text-3xl font-bold ${color}`}>{value}</Text>
    </View>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <View className="h-2 bg-bnm-bg rounded-full overflow-hidden">
      <View
        className="h-full bg-bnm-cta rounded-full"
        style={{ width: `${progress}%` }}
      />
    </View>
  );
}
