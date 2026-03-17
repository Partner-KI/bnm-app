import { View, Text, ScrollView } from "react-native";

export default function DashboardScreen() {
  return (
    <ScrollView className="flex-1 bg-bnm-bg">
      <View className="p-6">
        <Text className="text-2xl font-bold text-bnm-primary mb-2">
          BNM Dashboard
        </Text>
        <Text className="text-bnm-secondary mb-6">
          Betreuung neuer Muslime
        </Text>

        {/* Stats Cards */}
        <View className="flex-row flex-wrap gap-4 mb-6">
          <View className="bg-bnm-card rounded-xl p-4 flex-1 min-w-[140px] border border-bnm-border">
            <Text className="text-bnm-tertiary text-sm">
              Aktive Betreuungen
            </Text>
            <Text className="text-3xl font-bold text-bnm-primary mt-1">0</Text>
          </View>
          <View className="bg-bnm-card rounded-xl p-4 flex-1 min-w-[140px] border border-bnm-border">
            <Text className="text-bnm-tertiary text-sm">Abgeschlossen</Text>
            <Text className="text-3xl font-bold text-bnm-cta mt-1">0</Text>
          </View>
        </View>

        <View className="flex-row flex-wrap gap-4 mb-6">
          <View className="bg-bnm-card rounded-xl p-4 flex-1 min-w-[140px] border border-bnm-border">
            <Text className="text-bnm-tertiary text-sm">Mentoren</Text>
            <Text className="text-3xl font-bold text-bnm-primary mt-1">0</Text>
          </View>
          <View className="bg-bnm-card rounded-xl p-4 flex-1 min-w-[140px] border border-bnm-border">
            <Text className="text-bnm-tertiary text-sm">Neue Mentees</Text>
            <Text className="text-3xl font-bold text-bnm-gold mt-1">0</Text>
          </View>
        </View>

        {/* Mentor des Monats Placeholder */}
        <View className="bg-bnm-card rounded-xl p-5 border border-bnm-border">
          <View className="flex-row items-center mb-3">
            <Text className="text-lg font-bold text-bnm-primary">
              Mentor des Monats
            </Text>
            <Text className="ml-2 text-bnm-gold text-lg">★</Text>
          </View>
          <Text className="text-bnm-tertiary">
            Noch keine Daten verfügbar.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
