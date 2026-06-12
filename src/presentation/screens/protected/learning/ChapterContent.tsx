import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput, ActivityIndicator, Modal, KeyboardAvoidingView, Platform } from "react-native";
import type { ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import Markdown from "react-native-markdown-display";
import { X, CheckCircle, XCircle, Bot, Send } from "lucide-react-native";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { usePreventRemove } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "../../../hooks/useThemeColors";
import type { Lesson } from "../../../../domain/entities/path.entity";
import type { ThemeColors } from "../../../../config/theme.config";
import AppText from "../../../components/ui/typography/AppText";
import AppButton from "../../../components/ui/buttons/AppButton";
import ProgressBar from "../../../components/ui/feedback/ProgressBar";
import { useAppDispatch, useAppSelector } from "../../../../application/store/hooks";
import { fetchChapterWithLessons, completeChapter, recordAnswer, askTutor } from "../../../../application/thunks/paths.thunks";
import { evaluateExam } from "../../../../infrastructure/api/repositories/chapter.api.repository";
import { selectLessonsByChapterId, selectChapterById } from "../../../../application/selectors/paths.selectors";
import { selectCanUseTutor, selectTrialExhausted, selectTutorRequestLimit } from "../../../../application/selectors/user.selectors";
import { showPlanLimitAlert, showPremiumFeatureAlert } from "../../../../infrastructure/api/plan-error.utils";
import ChatBubble from "../../../components/ui/cards/ChatBubble";
import AiMarkdownView from "../../../components/ui/typography/AiMarkdownView";
import { preprocessMath } from "../../../utils/math.utils";
import PaywallModal from "../../shared/PaywallModal";

function mdStyles(theme: ThemeColors) {
  return {
    body: { color: theme.textPrimary, fontSize: 14, lineHeight: 22 },
    paragraph: { marginTop: 0, marginBottom: 10, color: theme.textPrimary },
    heading1: { color: theme.textPrimary, fontSize: 17, fontWeight: "700" as const, marginBottom: 6 },
    heading2: { color: theme.textPrimary, fontSize: 15, fontWeight: "700" as const, marginBottom: 4 },
    heading3: { color: theme.textPrimary, fontSize: 14, fontWeight: "700" as const, marginBottom: 4 },
    strong: { fontWeight: "700" as const, color: theme.textPrimary },
    em: { fontStyle: "italic" as const, color: theme.textPrimary },
    code_inline: {
      fontFamily: "monospace",
      backgroundColor: `${theme.primary}18`,
      color: theme.textPrimary,
      paddingHorizontal: 4,
      borderRadius: 4,
      fontSize: 13,
    },
    fence: {
      fontFamily: "monospace",
      backgroundColor: theme.surfaceElevated,
      borderColor: theme.border,
      borderWidth: StyleSheet.hairlineWidth,
      padding: 12,
      borderRadius: 10,
      marginVertical: 6,
      color: theme.textPrimary,
      fontSize: 13,
    },
    code_block: {
      fontFamily: "monospace",
      backgroundColor: theme.surfaceElevated,
      borderColor: theme.border,
      borderWidth: StyleSheet.hairlineWidth,
      padding: 12,
      borderRadius: 10,
      marginVertical: 6,
      color: theme.textPrimary,
      fontSize: 13,
    },
    blockquote: {
      backgroundColor: theme.accentLight,
      borderLeftWidth: 3,
      borderLeftColor: theme.accent,
      paddingLeft: 12,
      paddingRight: 10,
      paddingVertical: 8,
      marginLeft: 0,
      marginVertical: 8,
      borderRadius: 8,
    },
    bullet_list_icon: { color: theme.textPrimary },
    ordered_list_icon: { color: theme.textPrimary },
    table: { borderWidth: 1, borderColor: theme.border, borderRadius: 8, marginVertical: 8 },
    th: { backgroundColor: `${theme.primary}10`, fontWeight: "700" as const, padding: 8, color: theme.textPrimary },
    td: { padding: 8, color: theme.textPrimary, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border },
  };
}

function questionMdStyles(theme: ThemeColors) {
  const base = mdStyles(theme);
  return { ...base, body: { ...base.body, fontSize: 15, fontWeight: "600" as const }, paragraph: { ...base.paragraph, marginBottom: 0 } };
}


interface ReadingLessonProps {
  lesson: Lesson;
  theme: ThemeColors;
  onContinue: () => void;
  label?: string;
}

const ReadingLesson: React.FC<ReadingLessonProps> = ({ lesson, theme, onContinue, label = "Entendido →" }) => (
  <View style={s.readingWrap}>
    {lesson.title ? (
      <AppText variant="smallSubtitle" weight="700" style={s.lessonTitle}>
        {lesson.title}
      </AppText>
    ) : null}
    <AiMarkdownView content={lesson.content} fontSize={14} scrollable />
    <AppButton variant="primary" widthFull style={s.continueBtn} onPress={onContinue}>
      <AppText color="#fff" weight="600">{label}</AppText>
    </AppButton>
  </View>
);

interface MCProps {
  lesson: Lesson;
  theme: ThemeColors;
  selected: number | null;
  answered: boolean;
  onSelect: (i: number) => void;
}

const MCLesson: React.FC<MCProps> = ({ lesson, theme, selected, answered, onSelect }) => (
  <View style={s.mcWrap}>
    <Markdown style={questionMdStyles(theme)}>{preprocessMath(lesson.question ?? "")}</Markdown>
    {(lesson.options ?? []).map((opt, i) => {
      const isCorrect = i === lesson.correctIndex;
      const isSelected = i === selected;
      let bg = theme.surface;
      let border = theme.border;
      let color = theme.textPrimary;
      if (answered) {
        if (isCorrect) { bg = `${theme.success}18`; border = theme.success; color = theme.success; }
        else if (isSelected) { bg = `${theme.danger}12`; border = theme.danger; color = theme.danger; }
      } else if (isSelected) {
        border = theme.primary;
      }
      return (
        <TouchableOpacity
          key={i}
          disabled={answered}
          activeOpacity={0.7}
          onPress={() => onSelect(i)}
          style={[s.option, { backgroundColor: bg, borderColor: border }]}
        >
          <AppText variant="paragraph" color={color} weight={isCorrect && answered ? "700" : "normal"}>
            {preprocessMath(opt)}
          </AppText>
        </TouchableOpacity>
      );
    })}
  </View>
);

interface TFProps {
  lesson: Lesson;
  theme: ThemeColors;
  selected: boolean | null;
  answered: boolean;
  onSelect: (v: boolean) => void;
}

const TFLesson: React.FC<TFProps> = ({ lesson, theme, selected, answered, onSelect }) => {
  const getStyle = (val: boolean): ViewStyle => {
    if (!answered) return selected === val ? { borderColor: theme.primary } : {};
    if (val === lesson.correctAnswer) return { backgroundColor: `${theme.success}18`, borderColor: theme.success };
    if (val === selected) return { backgroundColor: `${theme.danger}12`, borderColor: theme.danger };
    return {};
  };

  return (
    <View style={s.tfWrap}>
      <Markdown style={questionMdStyles(theme)}>{preprocessMath(lesson.question ?? "")}</Markdown>
      <View style={s.tfRow}>
        {([true, false] as const).map((val) => (
          <TouchableOpacity
            key={String(val)}
            disabled={answered}
            activeOpacity={0.7}
            onPress={() => onSelect(val)}
            style={[
              s.tfBtn,
              val
                ? { borderColor: theme.success, backgroundColor: `${theme.success}08` }
                : { borderColor: theme.danger, backgroundColor: `${theme.danger}08` },
              getStyle(val),
            ]}
          >
            <AppText
              variant="smallSubtitle"
              color={val ? theme.success : theme.danger}
              weight="700"
            >
              {val ? "Verdadero" : "Falso"}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

interface OEProps {
  lesson: Lesson;
  theme: ThemeColors;
  answer: string;
  onChangeAnswer: (text: string) => void;
  onSubmit: () => void;
  isLast: boolean;
}

const OpenEndedLesson: React.FC<OEProps> = ({ lesson, theme, answer, onChangeAnswer, onSubmit, isLast }) => (
  <View style={s.oeWrap}>
    <Markdown style={questionMdStyles(theme)}>{preprocessMath(lesson.question ?? "")}</Markdown>
    <TextInput
      value={answer}
      onChangeText={onChangeAnswer}
      placeholder="Escribí tu respuesta..."
      placeholderTextColor={theme.textMuted}
      multiline
      style={[s.oeInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textPrimary }]}
    />
    <AppButton variant="primary" widthFull style={s.continueBtn} onPress={onSubmit} disabled={answer.trim().length === 0}>
      <AppText color="#fff" weight="600">{isLast ? "Enviar examen" : "Siguiente →"}</AppText>
    </AppButton>
  </View>
);

const ChapterContent = () => {
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { pathId, chapterId } = useLocalSearchParams<{ pathId: string; chapterId: string }>();
  const navigation = useNavigation();

  const lessonsSelector = useMemo(() => selectLessonsByChapterId(chapterId ?? ""), [chapterId]);
  const chapterSelector = useMemo(() => selectChapterById(chapterId ?? ""), [chapterId]);
  const lessons = useAppSelector(lessonsSelector);
  const chapter = useAppSelector(chapterSelector);

  const [lessonIndex, setLessonIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [selectedTF, setSelectedTF] = useState<boolean | null>(null);
  const [answered, setAnswered] = useState(false);
  const [earned, setEarned] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const canUseTutor = useAppSelector(selectCanUseTutor);
  const trialExhausted = useAppSelector(selectTrialExhausted);
  const tutorRequestLimit = useAppSelector(selectTutorRequestLimit);
  const [tutorOpen, setTutorOpen] = useState(false);
  const [tutorQuestion, setTutorQuestion] = useState("");
  const [tutorAnswer, setTutorAnswer] = useState<string | null>(null);
  const [tutorLoading, setTutorLoading] = useState(false);
  const [openEndedAnswers, setOpenEndedAnswers] = useState<Record<string, string>>({});
  const [submittingExam, setSubmittingExam] = useState(false);
  const isExamChapter = useMemo(() => lessons.some((l) => l.type === 'open_ended'), [lessons]);
  const allowLeaveRef = useRef(false);

  useEffect(() => {
    if (pathId && chapterId) dispatch(fetchChapterWithLessons({ pathId, chapterId }));
  }, [dispatch, pathId, chapterId]);

  useEffect(() => {
    setTutorOpen(false);
    setTutorQuestion("");
    setTutorAnswer(null);
    setTutorLoading(false);
  }, [lessonIndex]);

  const tutorAlertOptions = trialExhausted
    ? { reason: 'device_blocked' as const }
    : { reason: 'tutor_quota' as const, tutorLimit: tutorRequestLimit };

  const handleAskTutor = useCallback(async () => {
    const trimmed = tutorQuestion.trim();
    if (!trimmed || tutorLoading || !pathId) return;

    if (!canUseTutor) {
      showPremiumFeatureAlert("el tutor con IA", tutorAlertOptions);
      return;
    }

    const currentLesson = lessons[lessonIndex];
    const chapterContext = [
      chapter?.title ? `Capítulo: ${chapter.title}` : "",
      currentLesson?.title ? `Lección: ${currentLesson.title}` : "",
      currentLesson?.content ? `Contenido:\n${currentLesson.content.slice(0, 2500)}` : "",
    ].filter(Boolean).join("\n\n");

    setTutorLoading(true);
    setTutorAnswer(null);
    try {
      const result = await dispatch(
        askTutor({ pathId, question: trimmed, chapterContext }),
      ).unwrap();
      setTutorAnswer(result.answer);
      setTutorQuestion("");
    } catch (err) {
      showPlanLimitAlert(err, "el tutor con IA", { tutorLimit: tutorRequestLimit });
    } finally {
      setTutorLoading(false);
    }
  }, [
    tutorQuestion,
    tutorLoading,
    pathId,
    canUseTutor,
    tutorAlertOptions,
    lessons,
    lessonIndex,
    chapter,
    dispatch,
    tutorRequestLimit,
  ]);

  const confirmExit = useCallback(() => {
    router.back();
  }, []);

  usePreventRemove(true, ({ data }) => {
    if (allowLeaveRef.current) {
      navigation.dispatch(data.action);
      return;
    }
    Alert.alert(
      "¿Salir de la lección?",
      "Tu progreso en esta lección no se guardará.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salir",
          style: "destructive",
          onPress: () => navigation.dispatch(data.action),
        },
      ],
    );
  });

  const totalQ = lessons.filter((l) => l.type === "multiple_choice" || l.type === "true_false").length;

  const cardOpacity = useSharedValue(1);
  const cardY = useSharedValue(0);
  const ptsScale = useSharedValue(0);
  const ptsOpacity = useSharedValue(0);
  const feedbackY = useSharedValue(80);
  const shakeX = useSharedValue(0);

  const cardStyle = useAnimatedStyle(() => ({ opacity: cardOpacity.value, transform: [{ translateY: cardY.value }] }));
  const ptsStyle = useAnimatedStyle(() => ({ transform: [{ scale: ptsScale.value }], opacity: ptsOpacity.value }));
  const feedbackStyle = useAnimatedStyle(() => ({ transform: [{ translateY: feedbackY.value }] }));
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }] }));

  const showFeedback = useCallback((type: "correct" | "wrong", pts: number) => {
    setFeedback(type);
    if (type === "correct") {
      setCorrectCount((c) => c + 1);
      setEarned((p) => p + pts);
      ptsScale.value = withSequence(
        withTiming(1.3, { duration: 200 }),
        withTiming(1.0, { duration: 150 }),
        withDelay(500, withTiming(0, { duration: 200 })),
      );
      ptsOpacity.value = withSequence(
        withTiming(1, { duration: 150 }),
        withDelay(650, withTiming(0, { duration: 200 })),
      );
    } else {
      shakeX.value = withSequence(
        withTiming(-8, { duration: 55 }), withTiming(8, { duration: 55 }),
        withTiming(-8, { duration: 55 }), withTiming(8, { duration: 55 }),
        withTiming(0, { duration: 55 }),
      );
    }
    feedbackY.value = withSpring(0, { damping: 20, stiffness: 200 });
  }, []);

  const advance = useCallback(() => {
    setFeedback(null);
    feedbackY.value = 80;
    setSelected(null);
    setSelectedTF(null);
    setAnswered(false);

    // Reading lessons award their points when the user taps "Entendido"
    const currentLesson = lessons[lessonIndex];
    const readingTypes = new Set(["theory", "concept", "example"]);
    const readingPts = readingTypes.has(currentLesson?.type as string) ? (currentLesson?.points ?? 10) : 0;
    const finalEarned = earned + readingPts;
    if (readingPts > 0) setEarned(finalEarned);

    const next = lessonIndex + 1;
    if (next >= lessons.length) {
      if (isExamChapter) {
        // Exam chapter: submit for AI evaluation before completing
        setSubmittingExam(true);
        const answers = Object.entries(openEndedAnswers).map(([lessonId, text]) => ({ lessonId, text }));
        evaluateExam(pathId ?? "", chapterId ?? "", answers)
          .then((result) => {
            allowLeaveRef.current = true;
            router.replace({
              pathname: "/(protected)/exam-result",
              params: {
                score: String(result.score),
                passed: String(result.passed),
                strengths: JSON.stringify(result.feedback.strengths),
                weaknesses: JSON.stringify(result.feedback.weaknesses),
                recommendations: JSON.stringify(result.feedback.recommendations),
                pathId: pathId ?? "",
                chapterId: chapterId ?? "",
                earnedPoints: String(finalEarned),
              },
            });
          })
          .catch(() => {
            allowLeaveRef.current = false;
            setSubmittingExam(false);
            Alert.alert("Error", "No se pudo evaluar el examen. Intentá de nuevo.");
          });
        return;
      }
      dispatch(completeChapter({
        pathId: pathId ?? "",
        chapterId: chapterId ?? "",
        earnedXp: finalEarned,
        correctCount,
        totalQuestions: totalQ,
      })).unwrap().then((result) => {
        allowLeaveRef.current = true;
        router.replace({
          pathname: "/(protected)/chapter-complete",
          params: {
            pathId: pathId ?? "",
            chapterId: chapterId ?? "",
            earnedPoints: String(finalEarned),
            correctCount: String(correctCount),
            totalQuestions: String(totalQ),
            totalLessons: String(lessons.length),
            chapterTitle: chapter?.title ?? "",
            pathCompleted: String((result as { pathCompleted?: boolean }).pathCompleted ?? false),
          },
        });
      }).catch(() => {
        allowLeaveRef.current = true;
        router.replace({
          pathname: "/(protected)/chapter-complete",
          params: {
            pathId: pathId ?? "",
            chapterId: chapterId ?? "",
            earnedPoints: String(finalEarned),
            correctCount: String(correctCount),
            totalQuestions: String(totalQ),
            totalLessons: String(lessons.length),
            chapterTitle: chapter?.title ?? "",
            pathCompleted: "false",
          },
        });
      });
      return;
    }

    cardOpacity.value = withTiming(0, { duration: 150 }, () => { runOnJS(setLessonIndex)(next); });
    setTimeout(() => {
      cardY.value = 16;
      cardOpacity.value = withTiming(1, { duration: 200 });
      cardY.value = withTiming(0, { duration: 200 });
    }, 160);
  }, [lessonIndex, lessons, earned, correctCount, totalQ, pathId, chapterId, chapter, dispatch, isExamChapter, openEndedAnswers]);

  const handleMC = useCallback((i: number) => {
    if (answered || !lessons[lessonIndex]) return;
    const lesson = lessons[lessonIndex]!;
    setSelected(i);
    setAnswered(true);
    const ok = i === lesson.correctIndex;
    dispatch(recordAnswer({ pathId: pathId ?? "", chapterId: chapterId ?? "", lessonId: lesson.id, isCorrect: ok, selectedIndex: i }));
    showFeedback(ok ? "correct" : "wrong", lesson.points);
  }, [answered, lessons, lessonIndex, showFeedback, dispatch, pathId, chapterId]);

  const handleTF = useCallback((v: boolean) => {
    if (answered || !lessons[lessonIndex]) return;
    const lesson = lessons[lessonIndex]!;
    setSelectedTF(v);
    setAnswered(true);
    const ok = v === lesson.correctAnswer;
    dispatch(recordAnswer({ pathId: pathId ?? "", chapterId: chapterId ?? "", lessonId: lesson.id, isCorrect: ok, selectedAnswer: v }));
    showFeedback(ok ? "correct" : "wrong", lesson.points);
  }, [answered, lessons, lessonIndex, showFeedback, dispatch, pathId, chapterId]);

  const lesson: Lesson | undefined = lessons[lessonIndex];

  if (!lesson) {
    return (
      <View style={[s.screen, { backgroundColor: theme.background, justifyContent: "center", alignItems: "center" }]}>
        <AppText muted>Cargando lecciones...</AppText>
      </View>
    );
  }

  const isReading =
    lesson.type === "theory" ||
    (lesson.type as string) === "example" ||
    (lesson.type as string) === "concept";

  const progress = lessons.length > 0 ? (lessonIndex / lessons.length) * 100 : 0;
  const isQuestion = lesson.type === "multiple_choice" || lesson.type === "true_false";

  return (
    <View style={[s.screen, { backgroundColor: theme.background }]}>
      {/* Top bar */}
      <View style={[s.topBar, { paddingTop: insets.top + 8, backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity
          onPress={confirmExit}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <X size={20} color={theme.textMuted} />
        </TouchableOpacity>
        <View style={s.progressWrap}>
          <ProgressBar progress={progress} variant="primary" size="default" />
        </View>
        {isReading && (
          <TouchableOpacity
            style={[s.tutorTopBtn, { backgroundColor: theme.primary }]}
            activeOpacity={0.85}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => {
              if (!canUseTutor) {
                showPremiumFeatureAlert("el tutor con IA", tutorAlertOptions);
                return;
              }
              setTutorOpen(true);
            }}
          >
            <Bot size={18} color="#fff" />
          </TouchableOpacity>
        )}
        <View style={[s.counter, { backgroundColor: theme.primaryLight }]}>
          <AppText variant="verySmall" color={theme.primary} weight="700">
            {lessonIndex + 1}/{lessons.length}
          </AppText>
        </View>
      </View>

      {/* Lesson card */}
      <View style={s.content}>
        <Animated.View style={[s.cardWrap, shakeStyle, isReading && { flex: 1, minHeight: 0 }]}>
          <Animated.View style={[cardStyle, isReading && { flex: 1, minHeight: 0 }]}>
            <View style={[s.card, { backgroundColor: theme.surface, borderColor: theme.border }, isReading && { flex: 1, minHeight: 0 }]}>
              {(lesson.type === "theory" || (lesson.type as string) === "example") && (
                <ReadingLesson
                  lesson={lesson}
                  theme={theme}
                  onContinue={advance}
                  label={(lesson.type as string) === "example" ? "Continuar →" : "Entendido →"}
                />
              )}
              {(lesson.type as string) === "concept" && (
                <ReadingLesson lesson={lesson} theme={theme} onContinue={advance} label="Continuar" />
              )}
              {lesson.type === "multiple_choice" && (
                <MCLesson lesson={lesson} theme={theme} selected={selected} answered={answered} onSelect={handleMC} />
              )}
              {lesson.type === "true_false" && (
                <TFLesson lesson={lesson} theme={theme} selected={selectedTF} answered={answered} onSelect={handleTF} />
              )}
              {(lesson.type as string) === "open_ended" && (
                <OpenEndedLesson
                  lesson={lesson}
                  theme={theme}
                  answer={openEndedAnswers[lesson.id] ?? ""}
                  onChangeAnswer={(text) => setOpenEndedAnswers((prev) => ({ ...prev, [lesson.id]: text }))}
                  onSubmit={advance}
                  isLast={lessonIndex === lessons.length - 1}
                />
              )}
            </View>
          </Animated.View>
        </Animated.View>

        {/* Points flash */}
        <Animated.View style={[s.ptsFlash, ptsStyle]} pointerEvents="none">
          <AppText variant="bigSubtitle" color={theme.success} weight="bold">
            +{lesson.points}
          </AppText>
        </Animated.View>
      </View>

      {/* Feedback banner — questions only */}
      {feedback !== null && isQuestion && (
        <Animated.View
          style={[
            s.banner,
            { backgroundColor: feedback === "correct" ? theme.success : theme.danger, paddingBottom: insets.bottom + 12 },
            feedbackStyle,
          ]}
        >
          <View style={s.bannerRow}>
            {feedback === "correct"
              ? <CheckCircle size={20} color="#fff" />
              : <XCircle size={20} color="#fff" />}
            <AppText variant="smallSubtitle" color="#fff" weight="700">
              {feedback === "correct" ? "¡Correcto!" : "Incorrecto"}
            </AppText>
          </View>
          <AppButton
            variant="primary"
            style={[s.bannerBtn, { backgroundColor: "rgba(255,255,255,0.22)" }]}
            onPress={advance}
          >
            <AppText color="#fff" weight="700">Continuar</AppText>
          </AppButton>
        </Animated.View>
      )}

      <Modal
        visible={tutorOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setTutorOpen(false)}
      >
        <KeyboardAvoidingView
          style={[s.tutorModal, { backgroundColor: theme.background }]}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={[s.tutorHeader, { borderBottomColor: theme.border, paddingTop: insets.top + 8 }]}>
            <View style={s.tutorHeaderTitle}>
              <Bot size={20} color={theme.primary} />
              <AppText variant="subtitle" weight="700">Asistente IA</AppText>
            </View>
            <TouchableOpacity onPress={() => setTutorOpen(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={20} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={s.tutorScroll}
            contentContainerStyle={s.tutorScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <AppText variant="smallParagraph" muted style={s.tutorHint}>
              Preguntá sobre el contenido de esta lección. Te ayudo a entender, no a copiar respuestas.
            </AppText>
            {tutorAnswer && <ChatBubble role="model" text={tutorAnswer} />}
            {tutorLoading && (
              <View style={s.tutorLoadingRow}>
                <ActivityIndicator size="small" color={theme.primary} />
                <AppText variant="smallParagraph" muted>Pensando...</AppText>
              </View>
            )}
          </ScrollView>

          <View style={[s.tutorInputBar, { borderTopColor: theme.border, paddingBottom: insets.bottom + 8 }]}>
            <TextInput
              value={tutorQuestion}
              onChangeText={setTutorQuestion}
              placeholder="¿Qué no te quedó claro?"
              placeholderTextColor={theme.textMuted}
              style={[s.tutorInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
              multiline
              editable={!tutorLoading}
            />
            <TouchableOpacity
              onPress={handleAskTutor}
              disabled={tutorLoading || tutorQuestion.trim().length === 0}
              style={[
                s.tutorSendBtn,
                { backgroundColor: theme.primary, opacity: tutorLoading || tutorQuestion.trim().length === 0 ? 0.5 : 1 },
              ]}
            >
              <Send size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <PaywallModal
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
        featureBlocked="tutor"
      />
      {submittingExam && (
        <View style={s.examOverlay} pointerEvents="box-only">
          <View style={[s.examOverlayCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <ActivityIndicator size="large" color={theme.primary} />
            <AppText variant="smallParagraph" weight="600" style={{ marginTop: 12 }}>
              Evaluando tu examen...
            </AppText>
          </View>
        </View>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  screen: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  progressWrap: { flex: 1 },
  counter: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  content: { flex: 1, justifyContent: "center", paddingHorizontal: 20, paddingVertical: 16, minHeight: 0 },
  cardWrap: {},
  card: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
  },
  ptsFlash: { position: "absolute", alignSelf: "center", top: "30%" },
  banner: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    paddingTop: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  bannerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  bannerBtn: { borderRadius: 14, marginTop: 4 },
  // Reading lesson
  readingWrap: { flex: 1, gap: 14, minHeight: 0 },
  lessonTitle: { marginBottom: 4 },
  continueBtn: { borderRadius: 14, marginTop: 4 },
  // Open-ended
  oeWrap: { gap: 14 },
  oeInput: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  // MC
  mcWrap: { gap: 12 },
  question: { marginBottom: 4 },
  option: { borderWidth: 1.5, borderRadius: 12, padding: 14 },
  // TF
  tfWrap: { gap: 24, alignItems: "center" },
  tfRow: { flexDirection: "row", gap: 12, width: "100%" },
  tfBtn: { flex: 1, borderWidth: 2, borderRadius: 14, padding: 18, alignItems: "center" },
  // Exam overlay
  examOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  examOverlayCard: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 32,
    alignItems: 'center',
    minWidth: 200,
  },
  tutorTopBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  tutorModal: { flex: 1 },
  tutorHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tutorHeaderTitle: { flexDirection: "row", alignItems: "center", gap: 8 },
  tutorScroll: { flex: 1 },
  tutorScrollContent: { padding: 16, gap: 12, paddingBottom: 24 },
  tutorHint: { marginBottom: 4 },
  tutorLoadingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  tutorInputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tutorInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    textAlignVertical: "top",
  },
  tutorSendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default React.memo(ChapterContent);
