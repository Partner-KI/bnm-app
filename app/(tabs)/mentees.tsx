import { View, Text, ScrollView } from "react-native";

export default function MenteesScreen() {
  return (
    <ScrollView className="flex-1 bg-bnm-bg">
      <View className="p-6">
        <Text className="text-2xl font-bold text-bnm-primary mb-2">
          Meine Mentees
        </Text>
        <Text className="text-bnm-secondary mb-6">
          Übersicht deiner zugewiesenen Mentees
        </Text>

        {/* Empty State */}
        <View className="bg-bnm-card rounded-xl p-8 border border-bnm-border items-center">
          <Text className="text-5xl mb-4">🤝</Text>
          <Text className="text-lg font-semibold text-bnm-primary mb-2">
            Keine Mentees zugewiesen
          </Text>
          <Text className="text-bnm-tertiary text-center">
            Sobald dir ein Mentee zugewiesen wird, erscheint er/sie hier.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
