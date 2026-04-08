import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "../../contexts/ThemeContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { RADIUS } from "../../constants/Colors";
import { Container } from "../../components/Container";
import { BNMPressable } from "../../components/BNMPressable";

function Section({ title, children, themeColors }: { title: string; children: React.ReactNode; themeColors: any }) {
  return (
    <View style={[sectionStyles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
      <Text style={[sectionStyles.title, { color: themeColors.text }]}>{title}</Text>
      {children}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  card: { borderRadius: RADIUS.md, padding: 16, borderWidth: 1 },
  title: { fontSize: 15, fontWeight: "700", marginBottom: 8 },
});

export default function AGBScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const themeColors = useThemeColors();
  const { t } = useLanguage();

  const P = ({ children, style }: { children: React.ReactNode; style?: any }) => (
    <Text style={[styles.paragraph, { color: themeColors.textSecondary }, style]}>{children}</Text>
  );

  return (
    <Container>
      <View style={[styles.root, { backgroundColor: themeColors.background }]}>
        <View style={[styles.header, { backgroundColor: themeColors.card, borderBottomColor: themeColors.border, paddingTop: insets.top + 16 }]}>
          <BNMPressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={[styles.backText, { color: themeColors.text }]}>‹ {t("common.back")}</Text>
          </BNMPressable>
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>Nutzungsbedingungen</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>

          <Section title="§ 1 Geltungsbereich" themeColors={themeColors}>
            <P>
              Diese Nutzungsbedingungen regeln die Nutzung der BNM-App (Betreuung neuer Muslime), betrieben vom Verein IMAN, Simmeringer Hauptstraße 24, 1110 Wien, Österreich (nachfolgend „Betreiber"). Mit der Registrierung und Nutzung der App akzeptierst du diese Bedingungen.
            </P>
          </Section>

          <Section title="§ 2 Leistungsbeschreibung" themeColors={themeColors}>
            <P>
              Die BNM-App dient der Koordination und Durchführung eines ehrenamtlichen Mentoring-Programms für Konvertierte zum Islam. Die App stellt folgende Funktionen bereit:{"\n\n"}
              • Zuweisung von Mentoren und Mentees{"\n"}
              • Chat-Kommunikation zwischen Mentor und Mentee{"\n"}
              • Dokumentation von Mentoring-Sitzungen{"\n"}
              • Fortschrittsverfolgung und Feedback{"\n"}
              • Informationsangebote (FAQ, Hadithe){"\n\n"}
              Die Nutzung ist kostenlos. Es besteht kein Anspruch auf ununterbrochene Verfügbarkeit der App.
            </P>
          </Section>

          <Section title="§ 3 Registrierung und Konto" themeColors={themeColors}>
            <P>
              Die Nutzung der App erfordert eine Registrierung. Du bist verpflichtet, wahrheitsgemäße Angaben zu machen. Dein Konto ist persönlich und darf nicht an Dritte weitergegeben werden.{"\n\n"}
              Mentee-Registrierungen werden von einem Administrator geprüft und freigeschaltet. Der Betreiber behält sich vor, Registrierungen ohne Angabe von Gründen abzulehnen.
            </P>
          </Section>

          <Section title="§ 4 Verhaltensregeln" themeColors={themeColors}>
            <P>
              Bei der Nutzung der App verpflichtest du dich:{"\n\n"}
              • Respektvoll und wertschätzend mit anderen Nutzern umzugehen{"\n"}
              • Keine beleidigenden, diskriminierenden oder extremistischen Inhalte zu verbreiten{"\n"}
              • Die Privatsphäre anderer Nutzer zu respektieren{"\n"}
              • Keine vertraulichen Informationen aus Mentoring-Gesprächen weiterzugeben{"\n"}
              • Die App nicht für kommerzielle Zwecke zu nutzen{"\n\n"}
              Verstöße können zum Ausschluss aus dem Programm und zur Sperrung des Kontos führen.
            </P>
          </Section>

          <Section title="§ 5 Datenschutz" themeColors={themeColors}>
            <P>
              Die Verarbeitung personenbezogener Daten erfolgt gemäß unserer Datenschutzerklärung, die in der App unter „Datenschutz" abrufbar ist. Durch die Nutzung der App stimmst du der dort beschriebenen Datenverarbeitung zu.
            </P>
          </Section>

          <Section title="§ 6 Geistiges Eigentum" themeColors={themeColors}>
            <P>
              Alle Inhalte der App (Texte, Bilder, Design) sind urheberrechtlich geschützt. Die Vervielfältigung, Verbreitung oder anderweitige Nutzung ohne schriftliche Genehmigung des Betreibers ist untersagt.
            </P>
          </Section>

          <Section title="§ 7 Haftung" themeColors={themeColors}>
            <P>
              Das Mentoring wird ehrenamtlich durchgeführt. Der Betreiber übernimmt keine Haftung für:{"\n\n"}
              • Inhalte, die von Nutzern im Chat oder in Sitzungsprotokollen erstellt werden{"\n"}
              • Ratschläge oder Empfehlungen, die im Rahmen des Mentorings gegeben werden{"\n"}
              • Technische Störungen oder Datenverlust{"\n"}
              • Schäden, die durch die Nutzung der App entstehen{"\n\n"}
              Die Haftung des Betreibers ist auf Vorsatz und grobe Fahrlässigkeit beschränkt.
            </P>
          </Section>

          <Section title="§ 8 Kündigung und Kontolöschung" themeColors={themeColors}>
            <P>
              Du kannst dein Konto jederzeit über die Einstellungen der App löschen. Mit der Kontolöschung werden deine personenbezogenen Daten gemäß der Datenschutzerklärung gelöscht.{"\n\n"}
              Der Betreiber kann Nutzerkonten bei Verstößen gegen diese Nutzungsbedingungen sperren oder löschen.
            </P>
          </Section>

          <Section title="§ 9 Änderungen der Nutzungsbedingungen" themeColors={themeColors}>
            <P>
              Der Betreiber behält sich vor, diese Nutzungsbedingungen zu ändern. Über wesentliche Änderungen wirst du über die App informiert. Die fortgesetzte Nutzung nach Inkrafttreten der Änderungen gilt als Zustimmung.
            </P>
          </Section>

          <Section title="§ 10 Anwendbares Recht und Gerichtsstand" themeColors={themeColors}>
            <P>
              Es gilt das Recht der Republik Österreich unter Ausschluss des UN-Kaufrechts. Bei Verbrauchern gilt diese Rechtswahl nur insoweit, als nicht der gewährte Schutz durch zwingende Bestimmungen des Rechts des Staates, in dem der Verbraucher seinen gewöhnlichen Aufenthalt hat, entzogen wird. Gerichtsstand ist Wien, sofern gesetzlich zulässig.
            </P>
          </Section>

          <Section title="§ 11 Schlussbestimmungen" themeColors={themeColors}>
            <P>
              Sollten einzelne Bestimmungen dieser Nutzungsbedingungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
            </P>
            <P style={{ marginTop: 8, fontStyle: "italic" }}>
              Stand: April 2026
            </P>
          </Section>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  backButton: { flex: 1 },
  backText: { fontSize: 16 },
  headerTitle: { fontSize: 18, fontWeight: "700", textAlign: "center", flex: 2 },
  headerRight: { flex: 1 },
  scrollView: { flex: 1 },
  content: { padding: 20, gap: 16 },
  paragraph: { fontSize: 14, lineHeight: 22 },
});
