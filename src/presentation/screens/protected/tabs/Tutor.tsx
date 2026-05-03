import React, { useState, useCallback, useMemo, useRef } from "react";
import {
  View,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import type { ViewStyle } from "react-native";
import { Bot, Sparkles, Send, AlertCircle } from "lucide-react-native";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { useMockChat } from "../../../../shared/hooks/useMockChat";
import AppContainer from "../../../components/ui/layout/AppContainer";
import AppText from "../../../components/ui/typography/AppText";
import ChatBubble from "../../../components/ui/cards/ChatBubble";
import TypingIndicator from "../../../components/ui/feedback/TypingIndicator";

const Tutor: React.FC = () => {
  const theme = useThemeColors();
  const { messages, isLoading, send } = useMockChat();
  const [inputText, setInputText] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = useCallback(() => {
    const trimmed = inputText.trim();
    if (trimmed.length === 0 || isLoading) return;
    send(trimmed);
    setInputText("");
  }, [inputText, isLoading, send]);

  const canSend = inputText.trim().length > 0 && !isLoading;

  const headerStyle = useMemo<ViewStyle>(
    () => ({
      backgroundColor: theme.primaryLight,
      borderBottomWidth: 1,
      borderBottomColor: `${theme.primary}14`,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 18,
      flexDirection: "row",
      alignItems: "center",
    }),
    [theme.primaryLight, theme.primary],
  );

  const avatarStyle = useMemo<ViewStyle>(
    () => ({
      width: 44,
      height: 44,
      borderRadius: 16,
      backgroundColor: theme.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    }),
    [theme.primary],
  );

  const statusDotStyle = useMemo<ViewStyle>(
    () => ({
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#10B981",
      marginRight: 6,
    }),
    [],
  );

  const sendButtonStyle = useMemo<ViewStyle>(
    () => ({
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: canSend ? theme.primary : `${theme.textMuted}22`,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: canSend ? theme.primary : "transparent",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: canSend ? 0.3 : 0,
      shadowRadius: 8,
      elevation: canSend ? 4 : 0,
    }),
    [canSend, theme.primary, theme.textMuted],
  );

  const textInputStyle = useMemo<ViewStyle>(
    () => ({
      flex: 1,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 14,
      lineHeight: 20,
      maxHeight: 100,
      color: theme.textPrimary,
    }),
    [theme.surface, theme.border, theme.textPrimary],
  );

  return (
    <AppContainer style={styles.container}>
      <View style={[styles.chatBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {/* Header Bar */}
        <View style={headerStyle}>
          <View style={avatarStyle}>
            <Bot size={24} color="white" />
          </View>
          <View style={styles.headerCenter}>
            <AppText variant="subtitle" weight="600">Tutor Socrático</AppText>
            <View style={styles.statusRow}>
              <View style={statusDotStyle} />
              <AppText variant="verySmall" color={theme.success} weight="600">
                ACTIVO
              </AppText>
            </View>
          </View>
          <Sparkles size={22} color={theme.primary} />
        </View>

        {/* Messages Area */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesArea}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }}
        >
          {messages.map((msg, idx) => (
            <ChatBubble
              key={`${msg.role}-${idx}`}
              role={msg.role}
              text={msg.text}
            />
          ))}
          {isLoading && <TypingIndicator />}
        </ScrollView>

        {/* Input Bar */}
        <View style={[styles.inputBar, { borderTopColor: theme.border }]}>
          <View style={styles.inputRow}>
            <TextInput
              style={textInputStyle}
              placeholder="Haz una pregunta o comparte una duda..."
              placeholderTextColor={theme.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={sendButtonStyle}
              onPress={handleSend}
              disabled={!canSend}
              activeOpacity={0.6}
            >
              <Send size={18} color={canSend ? theme.textOnPrimary : theme.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={styles.disclaimerRow}>
            <AlertCircle size={10} color={theme.textMuted} />
            <AppText variant="verySmall" muted style={styles.disclaimerText}>
              {" Refuerza tu pensamiento crítico con guía AI"}
            </AppText>
          </View>
        </View>
      </View>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 20,
  },
  chatBox: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  messagesArea: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
    gap: 10,
  },
  inputBar: {
    borderTopWidth: 1,
    padding: 16,
    paddingTop: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  disclaimerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  disclaimerText: {
    marginLeft: 4,
  },
});

export default React.memo(Tutor);
