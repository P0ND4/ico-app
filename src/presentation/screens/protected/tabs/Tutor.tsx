import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { View, TextInput, ScrollView, StyleSheet, TouchableOpacity, Alert, Animated, Modal, Dimensions } from "react-native";
import type { ViewStyle } from "react-native";
import { exportConversationAsPdf } from "../../../../infrastructure/export/tutor-pdf";
import { Bot, Send, AlertCircle, Download, Trash2, WifiOff, Menu, X, Plus, MessageSquare, Pencil, Check } from "lucide-react-native";
import { useFocusEffect } from "expo-router";
import { useThemeColors } from "../../../hooks/useThemeColors";
import AppContainer from "../../../components/ui/layout/AppContainer";
import AppText from "../../../components/ui/typography/AppText";
import ChatBubble from "../../../components/ui/cards/ChatBubble";
import TypingIndicator from "../../../components/ui/feedback/TypingIndicator";
import { useAppDispatch, useAppSelector } from "../../../../application/store/hooks";
import {
  fetchConversations,
  createConversation,
  sendMessage,
  deleteConversation,
  fetchMessages,
  updateConversation,
} from "../../../../application/thunks/tutor.thunks";
import {
  selectConversations,
  selectActiveConversationId,
  selectTutorStatus,
  selectMessagesByConversation,
} from "../../../../application/selectors/tutor.selectors";
import { setActiveConversation } from "../../../../application/slices/tutor.slice";
import { useConnectivity } from "../../../hooks/useConnectivity";
import { useAppSessionContinuity } from "../../../hooks/useAppSessionContinuity";
import { useSoundEffect } from "../../../../infrastructure/sound/useSoundEffect";
import { showPlanLimitAlert, showPremiumFeatureAlert } from "../../../../infrastructure/api/plan-error.utils";
import {
  selectCanUseTutor,
  selectTrialExhausted,
  selectTrialTutorLabel,
  selectIsOnActiveTrial,
  selectTutorRequestLimit,
} from "../../../../application/selectors/user.selectors";

const Tutor: React.FC = () => {
  const theme = useThemeColors();
  const dispatch = useAppDispatch();
  const isOnline = useConnectivity();

  const conversations = useAppSelector(selectConversations);
  const activeId = useAppSelector(selectActiveConversationId);
  const tutorStatus = useAppSelector(selectTutorStatus);
  const messages = useAppSelector((state) => selectMessagesByConversation(state, activeId));
  const canUseTutor = useAppSelector(selectCanUseTutor);
  const trialExhausted = useAppSelector(selectTrialExhausted);
  const trialTutorLabel = useAppSelector(selectTrialTutorLabel);
  const isOnActiveTrial = useAppSelector(selectIsOnActiveTrial);
  const tutorRequestLimit = useAppSelector(selectTutorRequestLimit);

  const tutorAlertOptions = trialExhausted
    ? { reason: 'device_blocked' as const }
    : { reason: 'tutor_quota' as const, tutorLimit: tutorRequestLimit };

  const { play } = useSoundEffect();
  const isLoading = tutorStatus === "sending";
  const prevLoadingRef = useRef(false);
  const [inputText, setInputText] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameText, setRenameText] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const renameOriginalRef = useRef("");
  const isCommittingRenameRef = useRef(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { shouldResetTutorSession, markTutorSessionHandled } = useAppSessionContinuity();

  const scrollToBottom = useCallback((animated = true) => {
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd({ animated });
    });
  }, []);

  const PANEL_WIDTH = Dimensions.get("window").width * 0.75;
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-PANEL_WIDTH)).current;

  const openHistory = useCallback(() => {
    setIsHistoryOpen(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const closeHistory = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: -PANEL_WIDTH,
      duration: 240,
      useNativeDriver: true,
    }).start(() => setIsHistoryOpen(false));
  }, [slideAnim, PANEL_WIDTH]);

  const handleSelectConversation = useCallback((id: string) => {
    dispatch(setActiveConversation(id));
    dispatch(fetchMessages(id));
    closeHistory();
  }, [dispatch, closeHistory]);

  const handleNewConversation = useCallback(() => {
    dispatch(setActiveConversation(null));
    closeHistory();
  }, [dispatch, closeHistory]);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      if (shouldResetTutorSession()) {
        dispatch(setActiveConversation(null));
      }
      markTutorSessionHandled();
    }, [dispatch, shouldResetTutorSession, markTutorSessionHandled]),
  );

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeId && isOnline) {
      dispatch(fetchMessages(activeId));
    }
  }, [activeId, isOnline, dispatch]);

  useEffect(() => {
    if (prevLoadingRef.current && !isLoading) {
      const last = messages[messages.length - 1];
      if (last?.role === 'model') {
        play('generated');
        setTimeout(() => scrollToBottom(true), 400);
      }
    }
    prevLoadingRef.current = isLoading;
  }, [isLoading, messages, play, scrollToBottom]);

  useEffect(() => {
    if (messages.length === 0) return;
    const t = setTimeout(() => scrollToBottom(false), 50);
    return () => clearTimeout(t);
  }, [messages.length, activeId, scrollToBottom]);

  useEffect(() => {
    if (!isLoading) return;
    scrollToBottom(true);
  }, [isLoading, scrollToBottom]);

  const handleSend = useCallback(async () => {
    const trimmed = inputText.trim();
    if (trimmed.length === 0 || isLoading || !isOnline) return;

    if (!canUseTutor) {
      showPremiumFeatureAlert("el tutor con IA", tutorAlertOptions);
      return;
    }

    let conversationId = activeId;
    if (!conversationId) {
      const result = await dispatch(createConversation(undefined));
      if (!createConversation.fulfilled.match(result)) return;
      conversationId = result.payload.id;
      dispatch(setActiveConversation(conversationId));
    }

    try {
      await dispatch(sendMessage({ conversationId, content: trimmed })).unwrap();
      setInputText("");
    } catch (err) {
      showPlanLimitAlert(err, "el tutor con IA", { tutorLimit: tutorRequestLimit });
    }
  }, [inputText, isLoading, activeId, isOnline, dispatch, canUseTutor, tutorAlertOptions, tutorRequestLimit]);

  const canSend = inputText.trim().length > 0 && !isLoading && isOnline && canUseTutor;
  const hasContent = messages.length > 1;

  const handleClearHistory = useCallback(() => {
    if (!activeId) return;
    Alert.alert("Borrar conversación", "¿Eliminar toda la conversación?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Borrar",
        style: "destructive",
        onPress: () => {
          dispatch(deleteConversation(activeId));
          dispatch(setActiveConversation(null));
        },
      },
    ]);
  }, [activeId, dispatch]);

  const commitHeaderRename = useCallback(async () => {
    const trimmed = renameText.trim();
    if (!activeId || !trimmed) {
      isCommittingRenameRef.current = false;
      setIsRenaming(false);
      return;
    }
    if (trimmed === renameOriginalRef.current) {
      isCommittingRenameRef.current = false;
      setIsRenaming(false);
      return;
    }
    isCommittingRenameRef.current = true;
    try {
      await dispatch(updateConversation({ id: activeId, title: trimmed })).unwrap();
    } catch {
      Alert.alert("Error", "No se pudo renombrar la conversación.");
      dispatch(fetchConversations());
    } finally {
      isCommittingRenameRef.current = false;
      setIsRenaming(false);
    }
  }, [renameText, activeId, dispatch]);

  const commitPanelRename = useCallback(async (convId: string) => {
    const trimmed = renameDraft.trim();
    if (!trimmed) {
      isCommittingRenameRef.current = false;
      setRenamingId(null);
      return;
    }
    if (trimmed === renameOriginalRef.current) {
      isCommittingRenameRef.current = false;
      setRenamingId(null);
      return;
    }
    isCommittingRenameRef.current = true;
    try {
      await dispatch(updateConversation({ id: convId, title: trimmed })).unwrap();
    } catch {
      Alert.alert("Error", "No se pudo renombrar la conversación.");
      dispatch(fetchConversations());
    } finally {
      isCommittingRenameRef.current = false;
      setRenamingId(null);
    }
  }, [renameDraft, dispatch]);

  const handleExportPdf = useCallback(async () => {
    if (!activeId || !isOnline || messages.length === 0) return;
    try {
      const conv = conversations.find((c) => c.id === activeId);
      await exportConversationAsPdf(conv?.title ?? null, messages);
    } catch {
      Alert.alert("Error", "No se pudo exportar el PDF.");
    }
  }, [activeId, isOnline, messages, conversations]);

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
      borderRadius: 22,
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
      paddingTop: 0,
      paddingBottom: 0,
      fontSize: 14,
      minHeight: 44,
      maxHeight: 100,
      color: theme.textPrimary,
      textAlignVertical: "center",
    }),
    [theme.surface, theme.border, theme.textPrimary],
  );

  return (
    <AppContainer style={styles.container}>
      <View style={[styles.chatBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {/* Header Bar */}
        <View style={headerStyle}>
          <TouchableOpacity onPress={openHistory} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.menuButton}>
            <Menu size={22} color={theme.textPrimary} />
          </TouchableOpacity>
          <View style={avatarStyle}>
            <Bot size={24} color="white" />
          </View>
          <View style={styles.headerCenter}>
            {isRenaming ? (
              <TextInput
                value={renameText}
                onChangeText={setRenameText}
                onSubmitEditing={() => { void commitHeaderRename(); }}
                onBlur={() => {
                  if (!isCommittingRenameRef.current) {
                    void commitHeaderRename();
                  }
                }}
                style={{ color: theme.textPrimary, fontWeight: "600", fontSize: 16, flex: 1 }}
                autoFocus
                returnKeyType="done"
              />
            ) : (
              <TouchableOpacity
                activeOpacity={0.7}
                onLongPress={() => {
                  const active = conversations.find((c) => c.id === activeId);
                  const currentTitle = active?.title ?? "Tutor Socrático";
                  renameOriginalRef.current = currentTitle;
                  setRenameText(currentTitle);
                  setIsRenaming(true);
                }}
              >
                <AppText variant="subtitle" weight="600" numberOfLines={1}>
                  {conversations.find((c) => c.id === activeId)?.title ?? 'Tutor Socrático'}
                </AppText>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.headerIcons}>
            {hasContent && (
              <TouchableOpacity onPress={handleExportPdf} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Download size={20} color={theme.primary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleClearHistory} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Trash2 size={18} color={theme.danger} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages Area */}
        <ScrollView
          ref={scrollViewRef}
          style={[styles.messagesArea, { backgroundColor: theme.background }]}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          {messages.length === 0 && !isLoading && (
            <ChatBubble
              role="model"
              text="¡Hola! Soy tu tutor socrático. Estoy aquí para ayudarte a pensar, no solo a responder. ¿Qué quieres aprender o entender mejor hoy?"
            />
          )}
          {messages.map((msg) => (
            <ChatBubble key={msg.id} role={msg.role} text={msg.content} />
          ))}
          {isLoading && <TypingIndicator />}
        </ScrollView>

        {/* Input Bar */}
        <View style={[styles.inputBar, { borderTopColor: theme.border }]}>
          {isOnActiveTrial && canUseTutor && trialTutorLabel && (
            <View style={[styles.trialInfoBanner, { backgroundColor: `${theme.primary}10`, borderColor: `${theme.primary}30` }]}>
              <AlertCircle size={14} color={theme.primary} />
              <AppText variant="verySmall" color={theme.primary} weight="600" style={styles.premiumBannerText}>
                {`Tu plan: ${trialTutorLabel}`}
              </AppText>
            </View>
          )}
          {!canUseTutor && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => showPremiumFeatureAlert("el tutor con IA", tutorAlertOptions)}
              style={[styles.premiumBanner, { backgroundColor: `${theme.primary}14`, borderColor: `${theme.primary}40` }]}
            >
              <AlertCircle size={14} color={theme.primary} />
              <AppText variant="verySmall" color={theme.primary} weight="600" style={styles.premiumBannerText}>
                {trialExhausted
                  ? "Prueba gratuita agotada en este dispositivo — suscríbete a Prémium para seguir"
                  : `Cupo de tutor agotado${tutorRequestLimit != null ? ` (${tutorRequestLimit} mensajes)` : ""} — suscríbete a Prémium para seguir`}
              </AppText>
            </TouchableOpacity>
          )}
          {!isOnline && (
            <View
              style={[styles.offlineBanner, { backgroundColor: `${theme.danger}15`, borderColor: `${theme.danger}30` }]}
            >
              <WifiOff size={14} color={theme.danger} />
              <AppText variant="verySmall" color={theme.danger} style={styles.offlineText}>
                Sin conexión — no se pueden enviar mensajes
              </AppText>
            </View>
          )}
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
            <TouchableOpacity style={sendButtonStyle} onPress={handleSend} disabled={!canSend} activeOpacity={0.6}>
              <Send size={18} color={canSend ? theme.textOnPrimary : theme.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={styles.disclaimerRow}>
            <AlertCircle size={10} color={theme.textMuted} />
            <AppText variant="verySmall" muted style={styles.disclaimerText}>
              {" Refuerza tu pensamiento crítico con guía de IA"}
            </AppText>
          </View>
        </View>
      </View>
      <Modal visible={isHistoryOpen} transparent animationType="none" onRequestClose={closeHistory}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.overlayDismiss} activeOpacity={1} onPress={closeHistory} />
          <Animated.View
            style={[
              styles.historyPanel,
              { width: PANEL_WIDTH, backgroundColor: theme.surface, borderRightColor: theme.border },
              { transform: [{ translateX: slideAnim }] },
            ]}
          >
            <View style={[styles.panelHeader, { borderBottomColor: theme.border }]}>
              <AppText variant="smallTitle" weight="700">Conversaciones</AppText>
              <TouchableOpacity onPress={closeHistory} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.newConvButton, { backgroundColor: theme.primary }]}
              activeOpacity={0.8}
              onPress={handleNewConversation}
            >
              <Plus size={16} color="#FFF" />
              <AppText variant="smallParagraph" color="#FFF" weight="600">Nueva conversación</AppText>
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.convList} keyboardShouldPersistTaps="handled">
              {conversations.map((conv) => {
                const isActive = conv.id === activeId;
                const isPanelRenaming = renamingId === conv.id;
                return (
                  <View
                    key={conv.id}
                    style={[
                      styles.convItem,
                      isActive && { backgroundColor: `${theme.primary}14` },
                      { borderBottomColor: theme.border },
                    ]}
                  >
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleSelectConversation(conv.id)}
                      style={styles.convItemMain}
                    >
                      <MessageSquare size={16} color={isActive ? theme.primary : theme.textMuted} />
                      {isPanelRenaming ? (
                        <TextInput
                          value={renameDraft}
                          onChangeText={setRenameDraft}
                          onSubmitEditing={() => { void commitPanelRename(conv.id); }}
                          onBlur={() => {
                            if (!isCommittingRenameRef.current) {
                              void commitPanelRename(conv.id);
                            }
                          }}
                          autoFocus
                          returnKeyType="done"
                          style={{ color: theme.textPrimary, fontSize: 14, flex: 1 }}
                        />
                      ) : (
                        <AppText
                          variant="smallParagraph"
                          color={isActive ? theme.primary : theme.textPrimary}
                          weight={isActive ? "600" : "400"}
                          numberOfLines={2}
                          style={styles.convTitle}
                        >
                          {conv.title ?? 'Conversación'}
                        </AppText>
                      )}
                    </TouchableOpacity>
                    {isPanelRenaming ? (
                      <TouchableOpacity
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        onPressIn={() => { isCommittingRenameRef.current = true; }}
                        onPress={() => { void commitPanelRename(conv.id); }}
                      >
                        <Check size={14} color={theme.primary} />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        onPress={() => {
                          renameOriginalRef.current = conv.title ?? "";
                          setRenamingId(conv.id);
                          setRenameDraft(conv.title ?? "");
                        }}
                      >
                        <Pencil size={14} color={theme.textMuted} />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
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
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
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
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  trialInfoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  premiumBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  premiumBannerText: {
    flex: 1,
  },
  offlineText: {
    flex: 1,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
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
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  menuButton: {
    marginRight: 10,
  },
  modalOverlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  overlayDismiss: {
    flex: 1,
  },
  historyPanel: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRightWidth: 1,
    paddingTop: 56,
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  newConvButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },
  convList: {
    flex: 1,
  },
  convItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  convItemMain: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  convTitle: {
    flex: 1,
  },
});

export default React.memo(Tutor);
