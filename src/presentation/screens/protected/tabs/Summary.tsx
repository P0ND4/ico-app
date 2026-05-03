import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import type { TextStyle, ViewStyle } from "react-native";
import { FileText, Wand2, Lightbulb, Copy, Check, HelpCircle } from "lucide-react-native";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { useMockSummary } from "../../../../shared/hooks/useMockSummary";
import AppContainer from "../../../components/ui/layout/AppContainer";
import AppText from "../../../components/ui/typography/AppText";
import AppButton from "../../../components/ui/buttons/AppButton";
import GlassCard from "../../../components/ui/cards/GlassCard";

const Summary: React.FC = () => {
  const theme = useThemeColors();
  const { summary, isLoading, generate } = useMockSummary();
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSummarize = useCallback(() => {
    if (text.trim().length === 0) return;
    setCopied(false);
    generate(text);
  }, [text, generate]);

  const handleCopy = useCallback(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

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

        {/* Input Card */}
        <GlassCard padding={18}>
          <TextInput
            multiline
            numberOfLines={6}
            placeholder="Pega aquí el contenido de tus lecturas o apuntes..."
            placeholderTextColor={theme.textMuted}
            value={text}
            onChangeText={setText}
            style={inputStyle}
          />
          <View style={styles.buttonSpacer} />
          <AppButton
            variant="primary"
            widthFull
            loading={isLoading}
            onPress={handleSummarize}
          >
            <View style={styles.buttonContent}>
              <Wand2 size={18} color={theme.textOnPrimary} />
              <AppText variant="paragraph" color={theme.textOnPrimary} weight="600">
                {" Generar Resumen Crítico"}
              </AppText>
            </View>
          </AppButton>
        </GlassCard>

        {/* Summary Output */}
        {summary.length > 0 && (
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
                <TouchableOpacity
                  onPress={handleCopy}
                  style={[styles.copyButton, { backgroundColor: `${theme.primary}0F` }]}
                  activeOpacity={0.6}
                >
                  {copied ? (
                    <Check size={18} color={theme.success} />
                  ) : (
                    <Copy size={18} color={theme.primary} />
                  )}
                </TouchableOpacity>
              </View>

              {summary.split("\n\n").map((paragraph, idx) => (
                <AppText
                  key={idx}
                  variant="paragraph"
                  style={idx > 0 ? styles.paragraphSpacer : undefined}
                >
                  {paragraph}
                </AppText>
              ))}

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
    marginBottom: 24,
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
  paragraphSpacer: {
    marginTop: 14,
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
});

export default React.memo(Summary);
