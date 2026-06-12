import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  View,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import type { TextStyle, ViewStyle } from "react-native";
import { FileText, Wand2, Lightbulb, Copy, Check, HelpCircle, Paperclip, X, AlertCircle } from "lucide-react-native";
import AiMarkdownView from "../../../components/ui/typography/AiMarkdownView";
import { useThemeColors } from "../../../hooks/useThemeColors";
import AppContainer from "../../../components/ui/layout/AppContainer";
import AppText from "../../../components/ui/typography/AppText";
import AppButton from "../../../components/ui/buttons/AppButton";
import GlassCard from "../../../components/ui/cards/GlassCard";
import IconButton from "../../../components/ui/buttons/IconButton";
import { useAppDispatch, useAppSelector } from "../../../../application/store/hooks";
import { fetchSummaries, generateSummary, generateSummaryFromFile, deleteSummary } from "../../../../application/thunks/summaries.thunks";
import { summaryApiRepository } from "../../../../infrastructure/api/repositories/summary.api.repository";
import { selectSummaries, selectSummariesStatus, selectActiveSummary } from "../../../../application/selectors/summaries.selectors";
import { setActiveSummary } from "../../../../application/slices/summaries.slice";
import { useConnectivity } from "../../../hooks/useConnectivity";
import { Trash2 } from "lucide-react-native";
import { useSoundEffect } from "../../../../infrastructure/sound/useSoundEffect";
import { showPlanLimitAlert, showPremiumFeatureAlert } from "../../../../infrastructure/api/plan-error.utils";
import {
  selectCanUseSummary,
  selectTrialExhausted,
  selectTrialSummaryLabel,
  selectIsOnActiveTrial,
  selectSummaryRequestLimit,
} from "../../../../application/selectors/user.selectors";

const Summary: React.FC = () => {
  const theme = useThemeColors();
  const dispatch = useAppDispatch();
  const isOnline = useConnectivity();

  const summariesStatus = useAppSelector(selectSummariesStatus);
  const activeSummary = useAppSelector(selectActiveSummary);
  const allSummaries = useAppSelector(selectSummaries);
  const canUseSummary = useAppSelector(selectCanUseSummary);
  const trialExhausted = useAppSelector(selectTrialExhausted);
  const trialSummaryLabel = useAppSelector(selectTrialSummaryLabel);
  const isOnActiveTrial = useAppSelector(selectIsOnActiveTrial);
  const summaryRequestLimit = useAppSelector(selectSummaryRequestLimit);

  const summaryAlertOptions = trialExhausted
    ? { reason: 'device_blocked' as const }
    : { reason: 'summary_quota' as const, summaryLimit: summaryRequestLimit };

  const { play } = useSoundEffect();
  const prevLoadingRef = useRef(false);
  const isLoading = summariesStatus === "generating";
  const [text, setText] = useState("");
  const [inputHeight, setInputHeight] = useState(130);
  const [copied, setCopied] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  useEffect(() => {
    dispatch(fetchSummaries());
  }, [dispatch]);

  useEffect(() => {
    if (prevLoadingRef.current && !isLoading && activeSummary) {
      play('generated');
      setShowOutput(true);
    }
    prevLoadingRef.current = isLoading;
  }, [isLoading, activeSummary, play]);

  const handleSummarize = useCallback(async () => {
    if (text.trim().length === 0 || !isOnline) return;
    if (!canUseSummary) {
      showPremiumFeatureAlert("generar resúmenes", summaryAlertOptions);
      return;
    }
    setCopied(false);
    setShowOutput(false);
    try {
      await dispatch(generateSummary(text)).unwrap();
    } catch (err) {
      showPlanLimitAlert(err, "generar resúmenes", { summaryLimit: summaryRequestLimit });
    }
  }, [text, isOnline, dispatch, canUseSummary, summaryAlertOptions, summaryRequestLimit]);

  const handleClear = useCallback(() => {
    setText("");
    setInputHeight(130);
    setShowOutput(false);
  }, []);

  const handleCopy = useCallback(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleFilePick = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets[0]) return;
      if (!canUseSummary) {
        showPremiumFeatureAlert("generar resúmenes", summaryAlertOptions);
        return;
      }
      const asset = result.assets[0];
      setShowOutput(false);
      try {
        await dispatch(
          generateSummaryFromFile({ uri: asset.uri, name: asset.name, type: asset.mimeType ?? 'application/octet-stream' }),
        ).unwrap();
      } catch (err) {
        showPlanLimitAlert(err, "generar resúmenes", { summaryLimit: summaryRequestLimit });
      }
    } catch {
      Alert.alert('Error', 'No se pudo cargar el archivo.');
    }
  }, [dispatch, canUseSummary, summaryAlertOptions, summaryRequestLimit]);

  const handleExport = useCallback(
    async (format: "pdf" | "txt" | "docx") => {
      if (!activeSummary || !isOnline) return;
      try {
        const buffer = await summaryApiRepository.export(activeSummary.id, format);
        const bytes = new Uint8Array(buffer);
        let binary = '';
        const chunkSize = 0x8000;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
        }
        const base64 = btoa(binary);
        const rawName = activeSummary.sourceFilename
          ? activeSummary.sourceFilename.replace(/\.[^.]+$/, '')
          : activeSummary.summaryText.slice(0, 40).trim();
        const safeName = rawName.replace(/[/\\:*?"<>|]/g, '_').replace(/\s+/g, '_');
        const uri = `${FileSystem.cacheDirectory}${safeName}.${format}`;
        await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
        await Sharing.shareAsync(uri);
      } catch {
        Alert.alert('Error', `No se pudo exportar como ${format.toUpperCase()}.`);
      }
    },
    [activeSummary, isOnline],
  );

  const handleSelectSummary = useCallback(
    (id: string, originalText: string, hasSourceFilename: boolean) => {
      dispatch(setActiveSummary(id));
      setText(!hasSourceFilename ? originalText : "");
      setShowOutput(true);
    },
    [dispatch],
  );

  const handleDeleteSummary = useCallback(
    (id: string) => {
      Alert.alert(
        "Eliminar resumen",
        "¿Estás seguro de que querés eliminar este resumen?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: () => dispatch(deleteSummary(id)),
          },
        ],
      );
    },
    [dispatch],
  );

  const recentSummaries = useMemo(() => allSummaries.slice(0, 5), [allSummaries]);

  const inputStyle = useMemo<TextStyle>(
    () => ({
      backgroundColor: theme.background,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 14,
      padding: 16,
      color: theme.textPrimary,
      fontSize: 14,
      lineHeight: 20,
      minHeight: 130,
      textAlignVertical: "top",
    }),
    [theme.background, theme.border, theme.textPrimary],
  );

  const reflectionBorderStyle = useMemo<ViewStyle>(
    () => ({
      backgroundColor: `${theme.success}0A`,
      borderColor: theme.success,
      borderWidth: 1,
      borderStyle: "dashed",
      borderRadius: 12,
      padding: 16,
    }),
    [theme.success],
  );

  const summaryText = activeSummary?.summaryText ?? "";

  return (
    <AppContainer style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={[styles.headerIconBox, { backgroundColor: theme.primaryLight }]}>
            <FileText size={24} color={theme.primary} />
          </View>
          <AppText variant="title" style={styles.headerTitle}>
            Generador de Resúmenes
          </AppText>
        </View>
        <AppText variant="paragraph" muted style={styles.headerSubtitle}>
          Transforma textos largos en conocimiento significativo.
        </AppText>

        {isOnActiveTrial && canUseSummary && trialSummaryLabel && (
          <View style={[styles.trialInfoBanner, { backgroundColor: `${theme.primary}10`, borderColor: `${theme.primary}30` }]}>
            <AlertCircle size={14} color={theme.primary} />
            <AppText variant="verySmall" color={theme.primary} weight="600">
              {`Tu plan: ${trialSummaryLabel}`}
            </AppText>
          </View>
        )}
        {!canUseSummary && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => showPremiumFeatureAlert("generar resúmenes", summaryAlertOptions)}
            style={[styles.trialBlockedBanner, { backgroundColor: `${theme.primary}14`, borderColor: `${theme.primary}40` }]}
          >
            <AlertCircle size={14} color={theme.primary} />
            <AppText variant="verySmall" color={theme.primary} weight="600">
              {trialExhausted
                ? "Prueba gratuita agotada en este dispositivo — suscribite a Prémium para seguir"
                : `Cupo de resúmenes agotado${summaryRequestLimit != null ? ` (${summaryRequestLimit} resúmenes)` : ""} — suscribite a Prémium para seguir`}
            </AppText>
          </TouchableOpacity>
        )}

        {/* Saved summaries list */}
        {recentSummaries.length > 0 && (
          <GlassCard padding={16} style={styles.savedCard}>
            <View style={styles.savedHeader}>
              <AppText variant="smallSubtitle" weight="600">
                Resúmenes guardados
              </AppText>
              <View style={[styles.countBadge, { backgroundColor: theme.primaryLight }]}>
                <AppText variant="verySmall" color={theme.primary} weight="700">
                  {allSummaries.length}
                </AppText>
              </View>
            </View>
            {recentSummaries.map((summary, idx) => (
              <TouchableOpacity
                key={summary.id}
                activeOpacity={0.7}
                onPress={() => handleSelectSummary(summary.id, summary.originalText, !!summary.sourceFilename)}
                style={[
                  styles.summaryRow,
                  idx < recentSummaries.length - 1 && styles.summaryRowBorder,
                  { borderColor: theme.border },
                ]}
              >
                <View style={[styles.summaryRowIcon, { backgroundColor: theme.primaryLight }]}>
                  <FileText size={14} color={theme.primary} />
                </View>
                <View style={styles.summaryRowContent}>
                  <AppText variant="verySmall" muted>
                    {new Date(summary.createdAt).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </AppText>
                  <AppText variant="smallParagraph" numberOfLines={1}>
                    {summary.summaryText.slice(0, 60)}
                    {summary.summaryText.length > 60 ? "…" : ""}
                  </AppText>
                </View>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDeleteSummary(summary.id);
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={[styles.deleteBtn, { backgroundColor: `${theme.danger}0F` }]}
                  activeOpacity={0.6}
                >
                  <Trash2 size={14} color={theme.danger} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </GlassCard>
        )}

        {/* Input Card */}
        <GlassCard padding={18}>
          <View style={styles.inputHeaderRow}>
            <View style={styles.inputHeaderLeft}>
              <IconButton
                icon={<Paperclip size={16} color={theme.textMuted} />}
                size="small"
                onPress={handleFilePick}
              />
              <AppText variant="smallSubtitle" weight="600">
                Tu texto
              </AppText>
            </View>
            {text.length > 0 && (
              <AppText variant="verySmall" muted>
                {text.length} caracteres
              </AppText>
            )}
          </View>
          <View style={styles.inputHeaderSpacer} />
          <TextInput
            multiline
            scrollEnabled={false}
            placeholder="Pega aquí el contenido de tus lecturas o apuntes..."
            placeholderTextColor={theme.textMuted}
            value={text}
            onChangeText={setText}
            onContentSizeChange={(event) => {
              setInputHeight(Math.max(130, event.nativeEvent.contentSize.height));
            }}
            style={[inputStyle, { height: inputHeight }]}
          />
          <View style={styles.buttonSpacer} />
          <AppButton
            variant="primary"
            widthFull
            loading={isLoading}
            onPress={handleSummarize}
            disabled={!isOnline || !canUseSummary}
          >
            <View style={styles.buttonContent}>
              <Wand2 size={18} color={theme.textOnPrimary} />
              <AppText variant="paragraph" color={theme.textOnPrimary} weight="600">
                {" Generar Resumen Crítico"}
              </AppText>
            </View>
          </AppButton>
        </GlassCard>

        {/* Summary loading */}
        {isLoading && (
          <View style={styles.outputSection}>
            <GlassCard variant="accent" padding={18}>
              <View style={styles.loadingOutputRow}>
                <ActivityIndicator size="small" color={theme.primary} />
                <AppText variant="smallParagraph" muted style={styles.loadingOutputText}>
                  Generando resumen...
                </AppText>
              </View>
            </GlassCard>
          </View>
        )}

        {/* Summary Output */}
        {!isLoading && showOutput && summaryText.length > 0 && (
          <View style={styles.outputSection}>
            <GlassCard variant="accent" padding={18}>
              <View style={styles.outputHeaderRow}>
                <View style={styles.outputTitleRow}>
                  <View style={[styles.outputIconBox, { backgroundColor: `${theme.accent}18` }]}>
                    <Lightbulb size={18} color={theme.accent} />
                  </View>
                  <AppText variant="subtitle" weight="600" style={styles.outputTitleText}>
                    Resumen Generado
                  </AppText>
                </View>
                <View style={styles.outputHeaderActions}>
                  <TouchableOpacity
                    onPress={handleCopy}
                    style={[styles.actionBtn, { backgroundColor: `${theme.primary}0F` }]}
                    activeOpacity={0.6}
                  >
                    {copied ? (
                      <Check size={18} color={theme.success} />
                    ) : (
                      <Copy size={18} color={theme.primary} />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleClear}
                    style={[styles.actionBtn, { backgroundColor: `${theme.danger}0F` }]}
                    activeOpacity={0.6}
                  >
                    <X size={18} color={theme.danger} />
                  </TouchableOpacity>
                </View>
              </View>

              <AiMarkdownView content={summaryText} fontSize={14} passThroughScroll />

              {/* Reflection CTA */}
              <View style={[reflectionBorderStyle, styles.reflectionCta]}>
                <View style={styles.reflectionRow}>
                  <HelpCircle size={16} color={theme.success} />
                  <AppText
                    variant="verySmall"
                    color={theme.success}
                    weight="bold"
                    style={styles.reflectionLabel}
                  >
                    PARA TU REFLEXIÓN
                  </AppText>
                </View>
                <AppText variant="smallParagraph" muted style={styles.reflectionText}>
                  Este resumen destaca lo esencial. ¿Cómo se conecta esto con tus conocimientos previos?
                </AppText>
              </View>
            </GlassCard>

            {/* Download row */}
            <View style={styles.downloadRow}>
              <AppText variant="verySmall" muted style={styles.downloadLabel}>
                Descargar como:
              </AppText>
              <View style={styles.downloadBtns}>
                {(["pdf", "docx", "txt"] as const).map((fmt) => (
                  <AppButton
                    key={fmt}
                    variant="outline"
                    style={styles.downloadBtn}
                    onPress={() => handleExport(fmt)}
                  >
                    <AppText
                      variant="verySmall"
                      color={theme.primary}
                      weight="700"
                    >
                      {fmt.toUpperCase()}
                    </AppText>
                  </AppButton>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 10,
  },
  headerIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
  },
  headerSubtitle: {
    marginBottom: 12,
  },
  trialInfoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  trialBlockedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  inputHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inputHeaderSpacer: {
    height: 12,
  },
  buttonSpacer: {
    height: 14,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  outputSection: {
    marginTop: 24,
  },
  loadingOutputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 24,
  },
  loadingOutputText: {
    marginLeft: 4,
  },
  outputHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  outputTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  outputIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  outputTitleText: {
  },
  copyButton: {
    padding: 8,
    borderRadius: 10,
  },
  outputHeaderActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 10,
  },

  reflectionCta: {
    marginTop: 18,
  },
  reflectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  reflectionLabel: {
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  reflectionText: {
    marginTop: 2,
  },
  downloadRow: {
    marginTop: 16,
  },
  downloadLabel: {
    marginBottom: 8,
  },
  downloadBtns: {
    flexDirection: "row",
    gap: 8,
  },
  downloadBtn: {
    flex: 1,
    borderRadius: 10,
    height: 36,
  },
  savedCard: {
    marginBottom: 20,
  },
  savedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  summaryRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  summaryRowIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryRowContent: {
    flex: 1,
    gap: 2,
  },
  deleteBtn: {
    padding: 7,
    borderRadius: 8,
  },
});

export default React.memo(Summary);
