import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import {
  Plus,
  Trash2,
  Clock,
  Calendar as CalendarIcon,
  CheckCircle2,
  Timer,
  XCircle,
} from "lucide-react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import type { DateData } from "react-native-calendars";
import AppContainer from "../../../components/ui/layout/AppContainer";
import AppText from "../../../components/ui/typography/AppText";
import AppButton from "../../../components/ui/buttons/AppButton";
import AppInput from "../../../components/ui/inputs/AppInput";
import AppSegmentedPicker from "../../../components/ui/buttons/AppSegmentedPicker";
import GlassCard from "../../../components/ui/cards/GlassCard";
import IconButton from "../../../components/ui/buttons/IconButton";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { useAppDispatch, useAppSelector } from "../../../../application/store/hooks";
import {
  fetchTasks,
  fetchTaskDates,
  createTask,
  updateTask,
  deleteTask,
  fetchPomodoroPresets,
  recordPomodoroSession,
  fetchPomodoroSessions,
} from "../../../../application/thunks/plan.thunks";
import {
  startTimer,
  tickTimer,
  stopTimer,
  resetTimer,
  setTimerPreset,
} from "../../../../application/slices/plan.slice";
import {
  selectTasks,
  selectTaskDates,
  selectPomodoroPresets,
  selectTimerState,
} from "../../../../application/selectors/plan.selectors";
import { RETRY_MESSAGE } from "../../../../shared/messages";

LocaleConfig.locales.es = {
  monthNames: [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ],
  monthNamesShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
  dayNames: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
  dayNamesShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
  today: "Hoy",
};
LocaleConfig.defaultLocale = "es";

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, "0");
  const sc = (secs % 60).toString().padStart(2, "0");
  return `${m}:${sc}`;
}

function dateToString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const Plan = () => {
  const theme = useThemeColors();
  const dispatch = useAppDispatch();

  const tasks = useAppSelector(selectTasks);
  const taskDates = useAppSelector(selectTaskDates);
  const presets = useAppSelector(selectPomodoroPresets);
  const timerState = useAppSelector(selectTimerState);
  const pomodoroSessions = useAppSelector((state) => state.plan.pomodoroSessions);

  const [selectedDate, setSelectedDate] = useState(() => dateToString(new Date()));
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("");
  const [sessionCount, setSessionCount] = useState(0);

  const timerStartedAtRef = useRef<string | null>(null);

  const calendarTheme = useMemo(
    () => ({
      backgroundColor: theme.surface,
      calendarBackground: theme.surface,
      textSectionTitleColor: theme.textMuted,
      selectedDayBackgroundColor: theme.primary,
      selectedDayTextColor: "#ffffff",
      todayTextColor: theme.primary,
      dayTextColor: theme.textPrimary,
      textDisabledColor: theme.border,
      arrowColor: theme.primary,
      monthTextColor: theme.textPrimary,
      textDayFontWeight: "400" as const,
      textMonthFontWeight: "700" as const,
      textDayHeaderFontWeight: "600" as const,
    }),
    [theme],
  );

  const markedDates = useMemo(() => {
    const marks = Object.fromEntries(
      taskDates.map((date) => [date, { marked: true, dotColor: theme.primary }]),
    ) as Record<
      string,
      { marked?: boolean; dotColor?: string; selected?: boolean; selectedColor?: string }
    >;

    marks[selectedDate] = {
      ...marks[selectedDate],
      selected: true,
      selectedColor: theme.primary,
      ...(marks[selectedDate] ? { marked: true, dotColor: theme.primary } : {}),
    };

    return marks;
  }, [taskDates, selectedDate, theme.primary]);

  const handleDayPress = useCallback((day: DateData) => {
    setSelectedDate(day.dateString);
  }, []);

  useEffect(() => {
    dispatch(fetchPomodoroPresets());
    dispatch(fetchPomodoroSessions());
    dispatch(fetchTaskDates());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchTasks(selectedDate));
  }, [dispatch, selectedDate]);

  useEffect(() => {
    if (!timerState.running) return;
    const interval = setInterval(() => {
      dispatch(tickTimer());
    }, 1000);
    return () => clearInterval(interval);
  }, [timerState.running, dispatch]);

  useEffect(() => {
    if (timerState.running === false && timerState.seconds === 0 && timerStartedAtRef.current !== null) {
      const startedAt = timerStartedAtRef.current;
      timerStartedAtRef.current = null;
      const preset = presets.find((p) => p.id === timerState.presetId);
      const durationMinutes = preset?.durationMinutes ?? 25;
      setSessionCount((c) => {
        const next = c + 1;
        Alert.alert(
          "¡Sesión completada!",
          `Completaste ${next} sesión${next > 1 ? "es" : ""} hoy. Toma un descanso de 10 minutos.`,
        );
        return next;
      });
      dispatch(
        recordPomodoroSession({
          durationMinutes,
          isCompleted: true,
          startedAt,
          completedAt: new Date().toISOString(),
        }),
      );
    }
  }, [timerState.running, timerState.seconds, timerState.presetId, presets, dispatch]);

  const selectedPreset = useMemo(
    () => presets.find((p) => p.id === timerState.presetId) ?? presets[0] ?? null,
    [presets, timerState.presetId],
  );

  const pickerOptions = useMemo(
    () => presets.map((p) => ({ label: `${p.durationMinutes} min`, value: p.id })),
    [presets],
  );

  const selectedTask = useMemo(() => tasks.find((t) => !t.isCompleted), [tasks]);

  const pomodoroMsg = selectedTask
    ? `Enfocate en: "${selectedTask.title}"`
    : "Elige una tarea y mantén el foco durante la sesión.";

  const handleToggleTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    dispatch(updateTask({ id, isCompleted: !task.isCompleted }));
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await dispatch(deleteTask(id)).unwrap();
      dispatch(fetchTaskDates());
    } catch {
      Alert.alert("Error", `No se pudo eliminar la tarea. ${RETRY_MESSAGE}`);
    }
  };

  const handleStartTimer = () => {
    if (timerState.running) {
      dispatch(stopTimer());
      return;
    }
    const preset = selectedPreset;
    if (!preset) return;
    timerStartedAtRef.current = new Date().toISOString();
    dispatch(
      startTimer({
        seconds: timerState.seconds || preset.durationMinutes * 60,
        presetId: preset.id,
      }),
    );
  };

  const handleResetTimer = () => {
    timerStartedAtRef.current = null;
    if (selectedPreset) {
      dispatch(
        setTimerPreset({
          seconds: selectedPreset.durationMinutes * 60,
          presetId: selectedPreset.id,
        }),
      );
      return;
    }
    dispatch(resetTimer());
  };

  const handleSelectPreset = (presetId: string) => {
    if (timerState.running) return;
    const preset = presets.find((p) => p.id === presetId);
    if (!preset) return;
    dispatch(
      setTimerPreset({
        seconds: preset.durationMinutes * 60,
        presetId: preset.id,
      }),
    );
  };

  const timerDisplay =
    timerState.seconds > 0
      ? formatTime(timerState.seconds)
      : selectedPreset
        ? formatTime(selectedPreset.durationMinutes * 60)
        : "00:00";

  return (
    <AppContainer style={s.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerTitleRow}>
            <View style={[s.headerIconBox, { backgroundColor: theme.primaryLight }]}>
              <CalendarIcon size={20} color={theme.primary} />
            </View>
            <View style={s.headerTextCol}>
              <AppText variant="title">Planificador</AppText>
              <AppText variant="paragraph" muted>
                Organiza tu autonomía.
              </AppText>
            </View>
          </View>
        </View>

        <View style={[s.calendarCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Calendar
            current={selectedDate}
            onDayPress={handleDayPress}
            markedDates={markedDates}
            theme={calendarTheme}
            enableSwipeMonths
            firstDay={1}
            style={s.calendar}
          />
        </View>

        {/* Pomodoro */}
        <View
          style={[
            s.pomodoroCard,
            {
              backgroundColor: theme.primaryLight,
              borderColor: `${theme.primary}25`,
            },
          ]}
        >
          <View style={s.pomodoroTagRow}>
            <View style={[s.pomodoroTagDot, { backgroundColor: theme.primary }]} />
            <AppText variant="verySmall" color={theme.primary} weight="bold" style={s.pomodoroTag}>
              TÉCNICA POMODORO
            </AppText>
          </View>

          {sessionCount > 0 && (
            <View style={[s.sessionBadge, { backgroundColor: `${theme.success}18` }]}>
              <AppText variant="verySmall" color={theme.success} weight="700">
                {sessionCount} sesión{sessionCount > 1 ? "es" : ""} hoy
              </AppText>
            </View>
          )}

          {pickerOptions.length > 0 && (
            <AppSegmentedPicker
              options={pickerOptions}
              selectedValue={timerState.presetId ?? pickerOptions[0]?.value ?? ""}
              onSelect={handleSelectPreset}
              style={s.durationPicker}
            />
          )}

          <AppText variant="smallParagraph" muted style={s.pomodoroTaskMsg}>
            {pomodoroMsg}
          </AppText>

          <View style={s.timerRow}>
            <AppText variant="bigSubtitle" weight="bold" color={theme.primary}>
              {timerDisplay}
            </AppText>
            <TouchableOpacity onPress={handleResetTimer} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <AppText variant="verySmall" color={theme.textMuted}>
                Reiniciar
              </AppText>
            </TouchableOpacity>
          </View>

          <AppButton variant="primary" widthFull onPress={handleStartTimer} style={s.pomodoroButton}>
            <View style={s.pomodoroButtonContent}>
              <Clock size={16} color={theme.textOnPrimary} />
              <AppText variant="smallSubtitle" color={theme.textOnPrimary} weight="600">
                {timerState.running ? "Pausar" : "Iniciar temporizador"}
              </AppText>
            </View>
          </AppButton>
        </View>

        {/* Task List */}
        <GlassCard padding={16} style={s.section}>
          <View style={s.taskListHeader}>
            <AppText variant="subtitle" weight="600">
              Sesiones del día
            </AppText>
            <IconButton
              icon={<Plus size={16} color="#FFFFFF" />}
              variant="primary"
              size="small"
              onPress={() => setShowAddForm((v) => !v)}
            />
          </View>

          {showAddForm && (
            <View style={s.addForm}>
              <AppInput placeholder="Título de la tarea" value={newTaskTitle} onChangeText={setNewTaskTitle} />
              <AppInput
                placeholder="Hora o recordatorio (ej: 15:00)"
                value={newTaskTime}
                onChangeText={setNewTaskTime}
                stylesContainer={s.addFormTimeInput}
              />
              <View style={s.addFormActions}>
                <AppButton
                  variant="outline"
                  style={s.addFormBtn}
                  onPress={() => {
                    setShowAddForm(false);
                    setNewTaskTitle("");
                    setNewTaskTime("");
                  }}
                >
                  <AppText variant="smallParagraph" color={theme.primary}>
                    Cancelar
                  </AppText>
                </AppButton>
                <AppButton
                  variant="primary"
                  style={s.addFormBtn}
                  onPress={async () => {
                    if (!newTaskTitle.trim()) return;
                    const trimmedTime = newTaskTime.trim();
                    try {
                      await dispatch(
                        createTask({
                          title: newTaskTitle.trim(),
                          scheduledDate: selectedDate,
                          ...(trimmedTime ? { scheduledTime: trimmedTime } : {}),
                        }),
                      ).unwrap();
                      setShowAddForm(false);
                      setNewTaskTitle("");
                      setNewTaskTime("");
                    } catch {
                      Alert.alert("Error", `No se pudo guardar la tarea. ${RETRY_MESSAGE}`);
                    }
                  }}
                >
                  <AppText variant="smallParagraph" color="#FFFFFF">
                    Guardar
                  </AppText>
                </AppButton>
              </View>
            </View>
          )}

          {tasks.length === 0 && (
            <AppText variant="smallParagraph" muted align="center" style={s.emptyTasks}>
              No hay sesiones para este día.
            </AppText>
          )}

          {tasks.map((task, idx) => (
            <View
              key={task.id}
              style={[
                s.taskRow,
                idx > 0 && {
                  borderTopColor: theme.border,
                  borderTopWidth: 1,
                },
              ]}
            >
              <View
                style={[
                  s.taskAccent,
                  {
                    backgroundColor: task.isCompleted ? theme.success : theme.primary,
                  },
                ]}
              />
              <TouchableOpacity activeOpacity={0.6} onPress={() => handleToggleTask(task.id)} style={s.taskCheckRow}>
                <View
                  style={[
                    s.checkbox,
                    {
                      borderColor: task.isCompleted ? theme.primary : theme.border,
                      backgroundColor: task.isCompleted ? theme.primary : "transparent",
                    },
                  ]}
                >
                  {task.isCompleted && (
                    <AppText variant="verySmall" color="#FFFFFF" weight="bold">
                      ✓
                    </AppText>
                  )}
                </View>
                <View style={s.taskInfo}>
                  <AppText
                    variant="paragraph"
                    muted={task.isCompleted}
                    lineThrough={task.isCompleted}
                    numberOfLines={2}
                    weight={task.isCompleted ? "normal" : "500"}
                  >
                    {task.title}
                  </AppText>
                  {task.scheduledTime && (
                    <View style={s.taskTimeRow}>
                      <Clock size={12} color={theme.textMuted} />
                      <AppText variant="verySmall" muted style={s.taskTimeText}>
                        {task.scheduledTime}
                      </AppText>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteTask(task.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={s.deleteBtn}
              >
                <Trash2 size={16} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
          ))}
        </GlassCard>

        {/* Pomodoro Session History */}
        <GlassCard padding={16} style={s.section}>
          <View style={s.taskListHeader}>
            <AppText variant="subtitle" weight="600">
              Historial de Pomodoros
            </AppText>
            <View style={[s.sessionBadge, { backgroundColor: `${theme.primary}15` }]}>
              <AppText variant="verySmall" color={theme.primary} weight="700">
                {pomodoroSessions.length}
              </AppText>
            </View>
          </View>
          {pomodoroSessions.length === 0 ? (
            <AppText variant="verySmall" muted align="center" style={s.emptyTasks}>
              Sin sesiones registradas
            </AppText>
          ) : (
            [...pomodoroSessions]
              .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
              .slice(0, 10)
              .map((session, idx) => {
                const sessionDate = new Date(session.startedAt);
                const dd = sessionDate.getDate().toString().padStart(2, "0");
                const mm = (sessionDate.getMonth() + 1).toString().padStart(2, "0");
                return (
                  <View
                    key={session.id}
                    style={[s.taskRow, idx > 0 && { borderTopColor: theme.border, borderTopWidth: 1 }]}
                  >
                    <Timer size={16} color={theme.primary} style={s.historyIcon} />
                    <View style={s.taskInfo}>
                      <AppText variant="smallParagraph" weight="500">
                        {session.durationMinutes} min
                      </AppText>
                    </View>
                    <AppText variant="verySmall" muted style={s.historyDate}>
                      {dd}/{mm}
                    </AppText>
                    {session.isCompleted ? (
                      <CheckCircle2 size={16} color={theme.success} />
                    ) : (
                      <XCircle size={16} color={theme.danger} />
                    )}
                  </View>
                );
              })
          )}
        </GlassCard>
      </ScrollView>
    </AppContainer>
  );
};

const s = StyleSheet.create({
  container: {
    padding: 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 110,
  },
  section: {
    marginTop: 16,
  },
  header: {
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTextCol: {
    flex: 1,
    gap: 2,
  },
  headerIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 16,
  },
  calendar: {
    borderRadius: 16,
  },
  pomodoroCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    marginBottom: 4,
  },
  pomodoroTagRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  pomodoroTagDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pomodoroTag: {
    letterSpacing: 0.8,
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    marginBottom: 14,
  },
  sessionBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  durationPicker: {
    marginBottom: 10,
  },
  pomodoroTaskMsg: {
    marginBottom: 12,
    fontStyle: "italic",
  },
  pomodoroButton: {
    borderRadius: 14,
  },
  pomodoroButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  taskListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  emptyTasks: {
    paddingVertical: 20,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  taskAccent: {
    width: 3,
    alignSelf: "stretch",
    borderRadius: 2,
    marginRight: 10,
  },
  taskCheckRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  taskTimeText: {
    marginLeft: 4,
  },
  deleteBtn: {
    padding: 4,
    marginLeft: 6,
  },
  historyIcon: {
    marginRight: 10,
  },
  historyDate: {
    marginRight: 10,
  },
  addForm: {
    marginBottom: 12,
  },
  addFormTimeInput: {
    marginTop: 8,
  },
  addFormActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  addFormBtn: {
    flex: 1,
    borderRadius: 10,
  },
});

export default React.memo(Plan);
