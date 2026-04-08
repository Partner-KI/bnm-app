import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Modal,
  LayoutAnimation,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../contexts/DataContext";
import { showError, showConfirm } from "../../lib/errorHandler";
import { COLORS, RADIUS, TYPOGRAPHY, SHADOWS } from "../../constants/Colors";
import { useLanguage } from "../../contexts/LanguageContext";
import { useThemeColors } from "../../contexts/ThemeContext";
import { SkeletonChatMessages } from "../../components/Skeleton";
import { usePageTitle } from "../../hooks/usePageTitle";
import { BNMPressable } from "../../components/BNMPressable";
import { EmptyState } from "../../components/EmptyState";

export default function ChatScreen() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const themeColors = useThemeColors();
  const insets = useSafeAreaInsets();
  const {
    getMessagesByMentorshipId,
    getMentorshipById,
    sendMessage,
    deleteMessage,
    markChatAsRead,
    messageTemplates,
    isLoading: dataLoading,
  } = useData();
  const { mentorshipId } = useLocalSearchParams<{ mentorshipId: string }>();

  const [inputText, setInputText] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [showScrollFab, setShowScrollFab] = useState(false);
  const fabOpacity = useRef(new Animated.Value(0)).current;

  // Scroll-Position tracken für FAB
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
    const shouldShow = distFromBottom > 150;
    if (shouldShow !== showScrollFab) {
      setShowScrollFab(shouldShow);
      Animated.timing(fabOpacity, {
        toValue: shouldShow ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [showScrollFab]);

  const mentorship = mentorshipId ? getMentorshipById(mentorshipId) : undefined;
  const messages = mentorshipId ? getMessagesByMentorshipId(mentorshipId) : [];

  // Beim Öffnen des Chats UND bei neuen eingehenden Nachrichten: als gelesen markieren.
  // Zweite Dependency `messages` stellt sicher, dass auch Realtime-Nachrichten die
  // während der Chat-Screen offen ist reinkommen, sofort als gelesen markiert werden
  // und der Badge in der Chats-Liste nicht fälschlicherweise erscheint.
  useEffect(() => {
    if (mentorshipId) {
      markChatAsRead(mentorshipId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mentorshipId, markChatAsRead, messages.length]);

  // iOS initial scroll: onContentSizeChange feuert manchmal zu früh, bevor das
  // Layout vollständig gerendert wurde. Deshalb nochmal nach 300ms scrollen.
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSend() {
    if (!inputText.trim() || !user || !mentorshipId) return;
    const content = inputText.trim();
    setInputText("");
    try {
      await sendMessage(mentorshipId, user.id, content);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch {
      setInputText(content); // Text wiederherstellen bei Fehler
      showError(t("chat.sendError"));
    }
  }

  async function handleLongPress(messageId: string, isOwn: boolean) {
    if (!isOwn) return; // Nur eigene Nachrichten löschbar

    const ok = await showConfirm(t("chat.deleteConfirmTitle"), t("chat.deleteConfirmText"));
    if (!ok) return;

    try {
      await deleteMessage(messageId);
    } catch {
      showError(t("chat.deleteError"));
    }
  }

  const chatPartnerName = user
    ? (user.id === mentorship?.mentor_id
        ? mentorship?.mentee?.name
        : mentorship?.mentor?.name)
    : undefined;

  usePageTitle(chatPartnerName ? `Chat – ${chatPartnerName}` : "Chat");

  if (!user) return null;

  const statusLabel =
    mentorship?.status === "active"
      ? t("chat.active")
      : mentorship?.status === "completed"
      ? t("chat.completed")
      : mentorship?.status === "pending_approval"
      ? t("mentees.pendingApproval")
      : t("chat.cancelled");

  return (
    <KeyboardAvoidingView
      style={[styles.flex1, { backgroundColor: themeColors.background }]}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* Chat-Header-Info */}
      {mentorship && (
        <View style={[styles.chatHeader, { backgroundColor: themeColors.card, borderBottomColor: themeColors.border }]}>
          <Text style={[styles.chatHeaderName, { color: themeColors.text }]}>{chatPartnerName}</Text>
          <Text style={[styles.chatHeaderSub, { color: themeColors.textTertiary }]}>
            {t("chat.mentorship")} · {statusLabel}
          </Text>
        </View>
      )}

      {/* Nachrichten */}
      <View style={{ flex: 1 }}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesScroll}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: false })
          }
          onScroll={handleScroll}
          scrollEventThrottle={100}
        >
          {dataLoading ? (
            <SkeletonChatMessages count={6} />
          ) : messages.length === 0 ? (
            <EmptyState
              icon="chatbubble-ellipses-outline"
              title={t("chat.noMessages")}
              description="Starte die Konversation mit einer Nachricht."
              compact
            />
          ) : (
            messages.map((msg, idx) => {
              const isOwn = msg.sender_id === user.id;
              const sender =
                msg.sender ??
                (isOwn ? { name: user.name } : { name: chatPartnerName ?? "?" });

              const senderRole = (msg.sender as any)?.role;
              const isThirdParty = !isOwn
                && msg.sender_id !== mentorship?.mentor_id
                && msg.sender_id !== mentorship?.mentee_id;
              const displayName =
                senderRole === "admin" ? "Admin" :
                senderRole === "office" ? "Office" :
                isThirdParty ? "Admin" :
                sender.name ?? chatPartnerName ?? "?";

              const msgDate = new Date(msg.created_at);
              const timeStr = msgDate.toLocaleTimeString("de-DE", {
                hour: "2-digit",
                minute: "2-digit",
              });

              // Timestamp-Gruppierung: Nur anzeigen wenn >15 Min seit letzter Nachricht
              // oder Datumswechsel oder erste Nachricht
              const prevMsg = idx > 0 ? messages[idx - 1] : null;
              const prevDate = prevMsg ? new Date(prevMsg.created_at) : null;
              const showTimeSeparator = !prevDate
                || (msgDate.getTime() - prevDate.getTime() > 15 * 60 * 1000)
                || msgDate.toDateString() !== prevDate.toDateString();

              // Nachrichtengruppe: Aufeinanderfolgende Nachrichten desselben Senders
              const isContinuation = prevMsg
                && prevMsg.sender_id === msg.sender_id
                && !showTimeSeparator;

              // Datum-Separator formatieren
              const dateSepLabel = showTimeSeparator ? (() => {
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                if (msgDate.toDateString() === today.toDateString()) return timeStr;
                if (msgDate.toDateString() === yesterday.toDateString()) return `Gestern, ${timeStr}`;
                return `${msgDate.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}, ${timeStr}`;
              })() : null;

              return (
                <React.Fragment key={msg.id}>
                  {/* Timestamp-Separator */}
                  {showTimeSeparator && (
                    <View style={styles.timeSeparator}>
                      <Text style={[styles.timeSeparatorText, { color: themeColors.textTertiary }]}>
                        {dateSepLabel}
                      </Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.messageBubbleWrapper,
                      isOwn ? { alignSelf: "flex-end" } : { alignSelf: "flex-start" },
                      isContinuation && { marginTop: -6 },
                    ]}
                  >
                    {/* Sender-Name nur bei erstem in der Gruppe */}
                    {!isOwn && !isContinuation && (
                      <Text style={[styles.senderName, { color: themeColors.textTertiary }]}>{displayName}</Text>
                    )}
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onLongPress={() => handleLongPress(msg.id, isOwn)}
                      delayLongPress={500}
                    >
                      <View
                        style={[
                          styles.messageBubble,
                          isOwn
                            ? styles.ownBubble
                            : [styles.otherBubble, { backgroundColor: themeColors.card, borderColor: themeColors.border }],
                          isContinuation && isOwn && { borderTopRightRadius: RADIUS.lg },
                          isContinuation && !isOwn && { borderTopLeftRadius: RADIUS.lg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.messageText,
                            isOwn ? { color: COLORS.white } : { color: themeColors.text },
                          ]}
                        >
                          {msg.content}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </React.Fragment>
              );
            })
          )}
          <View style={{ height: 16 }} />
        </ScrollView>

        {/* Scroll-to-Bottom FAB */}
        {showScrollFab && (
          <Animated.View style={[styles.scrollFab, { opacity: fabOpacity }]}>
            <BNMPressable
              onPress={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
              style={[styles.scrollFabBtn, { backgroundColor: themeColors.card, ...SHADOWS.md }]}
            >
              <Ionicons name="chevron-down" size={20} color={themeColors.text} />
            </BNMPressable>
          </Animated.View>
        )}
      </View>

      {/* Input-Bereich — Admin/Office dürfen schreiben (als Beobachter/Moderator) */}
      {mentorship && (mentorship.status === "active" || mentorship.status === "completed") ? (
        <View style={[styles.inputContainer, { backgroundColor: themeColors.card, borderTopColor: themeColors.border, paddingBottom: Platform.OS !== "web" ? Math.max(insets.bottom, 16) + 12 : 10 }]}>
          {/* Vorlagen-Button */}
          {messageTemplates.length > 0 && (user?.role === "mentor" || user?.role === "admin" || user?.role === "office") && (
            <TouchableOpacity
              style={styles.templateButton}
              onPress={() => setShowTemplates(true)}
              accessibilityLabel={t("chat.templates")}
            >
              <Ionicons name="document-text-outline" size={22} color={themeColors.textSecondary} />
            </TouchableOpacity>
          )}
          <TextInput
            style={[styles.textInput, styles.textInputWithTemplate, { backgroundColor: themeColors.elevated, borderColor: themeColors.border, color: themeColors.text }]}
            value={inputText}
            onChangeText={setInputText}
            placeholder={t("chat.placeholder")}
            placeholderTextColor={themeColors.textTertiary}
            multiline
            returnKeyType="default"
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: inputText.trim() ? themeColors.primary : themeColors.border },
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.inputContainer, { backgroundColor: themeColors.card, borderTopColor: themeColors.border, paddingBottom: Platform.OS !== "web" ? Math.max(insets.bottom, 16) + 12 : 10 }]}>
          <Text style={[styles.inactiveHint, { color: themeColors.textTertiary }]}>
            {t("chat.notActiveHint")}
          </Text>
        </View>
      )}
      {/* Vorlagen-Modal */}
      <Modal visible={showTemplates} transparent animationType="slide" onRequestClose={() => setShowTemplates(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowTemplates(false)}>
          <View style={[styles.modalSheet, { backgroundColor: themeColors.card }]} onStartShouldSetResponder={() => true}>
            <View style={[styles.modalHandle, { backgroundColor: themeColors.border }]} />
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>{t("chat.templates")}</Text>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {messageTemplates.map((tmpl) => {
                const menteeName = mentorship?.mentee?.name?.split(" ")[0] ?? "";
                const menteeGender = mentorship?.mentee?.gender;
                const anrede = menteeGender === "male" ? t("chat.templateBrother") : t("chat.templateSister");
                const mentorName = user?.name ?? "";

                return (
                  <BNMPressable
                    key={tmpl.id}
                    style={[styles.templateCard, { borderColor: themeColors.border }]}
                    onPress={() => {
                      const text = tmpl.body
                        .replace(/\{\{NAME\}\}/g, menteeName)
                        .replace(/\{\{ANREDE\}\}/g, anrede)
                        .replace(/\{\{MENTOR_NAME\}\}/g, mentorName);
                      setInputText(text);
                      setShowTemplates(false);
                    }}
                  >
                    <View style={styles.templateCardHeader}>
                      <Text style={[styles.templateCardTitle, { color: themeColors.text }]}>{tmpl.title}</Text>
                      <Text style={[styles.templateCardCategory, { color: themeColors.textTertiary }]}>{tmpl.category}</Text>
                    </View>
                    <Text style={[styles.templateCardPreview, { color: themeColors.textSecondary }]} numberOfLines={3}>
                      {tmpl.body.replace(/\{\{NAME\}\}/g, menteeName).replace(/\{\{ANREDE\}\}/g, anrede).replace(/\{\{MENTOR_NAME\}\}/g, mentorName)}
                    </Text>
                  </BNMPressable>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  chatHeader: {
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chatHeaderName: { fontWeight: "600", textAlign: "center", fontSize: 15 },
  chatHeaderSub: { fontSize: 12, textAlign: "center", marginTop: 2 },
  messagesScroll: { flex: 1 },
  emptyMessages: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 64 },
  emptyText: { textAlign: "center", fontSize: 14 },
  messageBubbleWrapper: { marginBottom: 6, maxWidth: Platform.OS === "web" ? "60%" : "80%" },
  senderName: { fontSize: TYPOGRAPHY.size.xs, marginBottom: 3, marginLeft: 12, fontWeight: TYPOGRAPHY.weight.medium },
  messageBubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: RADIUS.lg },
  ownBubble: {
    backgroundColor: COLORS.gradientStart,
    borderTopRightRadius: 4,
  },
  otherBubble: {
    borderWidth: 1,
    borderTopLeftRadius: 4,
  },
  messageText: { fontSize: TYPOGRAPHY.size.base, lineHeight: TYPOGRAPHY.lineHeight.relaxed },
  timeSeparator: {
    alignItems: "center",
    marginVertical: 16,
  },
  timeSeparatorText: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  scrollFab: {
    position: "absolute",
    bottom: 12,
    right: 16,
    zIndex: 10,
  },
  scrollFabBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  inputContainer: {
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: RADIUS.xl,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 120,
    minHeight: 44,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
  },
  inactiveHint: { flex: 1, textAlign: "center", fontSize: 13, paddingVertical: 4 },

  // Template Button
  templateButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  textInputWithTemplate: {},

  // Template Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: 20,
    paddingBottom: 32,
    maxHeight: "70%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  modalTitle: {
    fontWeight: "800",
    fontSize: 18,
    marginBottom: 16,
  },
  modalScroll: {
    flex: 1,
  },
  templateCard: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: 14,
    marginBottom: 10,
  },
  templateCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  templateCardTitle: {
    fontWeight: "700",
    fontSize: 14,
  },
  templateCardCategory: {
    fontSize: 11,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  templateCardPreview: {
    fontSize: 12,
    lineHeight: 18,
  },
});
