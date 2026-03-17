import { View, Text, ScrollView } from "react-native";

export default function ProfileScreen() {
  return (
    <ScrollView className="flex-1 bg-bnm-bg">
      <View className="p-6">
        <Text className="text-2xl font-bold text-bnm-primary mb-6">
          Profil
        </Text>

        {/* Profile Card */}
        <View className="bg-bnm-card rounded-xl p-6 border border-bnm-border items-center mb-6">
          <View className="w-20 h-20 rounded-full bg-bnm-bg items-center justify-center mb-4 border-2 border-bnm-border">
            <Text className="text-3xl">👤</Text>
          </View>
          <Text className="text-xl font-bold text-bnm-primary">
            Nicht angemeldet
          </Text>
          <Text className="text-bnm-tertiary mt-1">Mentor</Text>
        </View>

        {/* Info Placeholder */}
        <View className="bg-bnm-card rounded-xl p-5 border border-bnm-border">
          <Text className="text-sm font-semibold text-bnm-tertiary uppercase mb-3">
            Informationen
          </Text>
          <View className="flex-row justify-between py-3 border-b border-bnm-border">
            <Text className="text-bnm-secondary">E-Mail</Text>
            <Text className="text-bnm-primary">—</Text>
          </View>
          <View className="flex-row justify-between py-3 border-b border-bnm-border">
            <Text className="text-bnm-secondary">Stadt</Text>
            <Text className="text-bnm-primary">—</Text>
          </View>
          <View className="flex-row justify-between py-3">
            <Text className="text-bnm-secondary">Rolle</Text>
            <Text className="text-bnm-primary">—</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
