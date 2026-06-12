import React, { useMemo, useState, useEffect, useRef } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import type { ViewStyle } from "react-native";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Clock,
  Calendar,
  CheckCircle2,
  Timer,
  XCircle,
} from "lucide-react-native";
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
  createTask,
  updateTask,
  deleteTask,
  fetchPomodoroPresets,
  recordPomodoroSession,
  fetchPomodoroSessions,
} from "../../../../application/thunks/plan.thunks";
import { startTimer, tickTimer, stopTimer, resetTimer } from "../../../../application/slices/plan.slice";
import { selectTasks, selectPomodoroPresets, selectTimerState } from "../../../../application/selectors/plan.selectors";

function generateCalendarDays(offset: number = 0): {
  dayName: string;
  dayNumber: number;
  date: Date;
  isToday: boolean;
}[] {
  const today = new Date();
  const base = new Date(today);
  base.setDate(today.getDate() + offset * 30);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(base);
    date.setDate(base.getDate() + i);
    const raw = date.toLocaleDateString("es-ES", { weekday: "short" });
    const dayName = raw.charAt(0).toUpperCase() + raw.slice(1);
    return {
      dayName,
      dayNumber: date.getDate(),
      date,
      isToday: offset === 0 && i === 0,
    };
  });
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, "0");
  const sc = (secs % 60).toString().padStart(2, "0");
  return `${m}:${sc}`;
}

function dateToString(date: Date): string {
  return date.toISOString().split("T")[0] ?? "";
}

const Plan = () => {
  const theme = useThemeColors();
  const dispatch = useAppDispatch();

  const tasks = useAppSelector(selectTasks);
  const presets = useAppSelector(selectPomodoroPresets);
  const timerState = useAppSelector(selectTimerState);
  const pomodoroSessions = useAppSelector((state) => state.plan.pomodoroSessions);

  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("");
  const [sessionCount, setSessionCount] = useState(0);

  const timerStartedAtRef = useRef<string | null>(null);

  const calendarDays = useMemo(() => generateCalendarDays(currentMonthOffset), [currentMonthOffset]);

  const selectedDate = useMemo(() => {
    const day = calendarDays[selectedDayIndex];
    return day ? dateToString(day.date) : dateToString(new Date());
  }, [calendarDays, selectedDayIndex]);

  const currentMonth = useMemo(() => {
    const now = new Date();
    now.setDate(now.getDate() + currentMonthOffset * 30);
    return now.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  }, [currentMonthOffset]);

  useEffect(() => {
    dispatch(fetchPomodoroPresets());
    dispatch(fetchPomodoroSessions());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchTasks(selectedDate));
  }, [dispatch, selectedDate]);

  // Timer tick effect
  useEffect(() => {
    if (!timerState.running) return;
    const interval = setInterval(() => {
      dispatch(tickTimer());
    }, 1000);
    return () => clearInterval(interval);
  }, [timerState.running, dispatch]);

  // Timer complete effect
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
  }, [timerState.running, timerState.seconds]);

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

  const dayItem: ViewStyle = useMemo(
    () => ({
      width: 50,
      height: 72,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: theme.border,
    }),
    [theme.border],
  );

  const handleToggleTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    dispatch(updateTask({ id, isCompleted: !task.isCompleted }));
  };

  const handleDeleteTask = (id: string) => {
    dispatch(deleteTask(id));
  };

  const handleStartTimer = () => {
    if (timerState.running) {
      dispatch(stopTimer());
    } else {
      const preset = selectedPreset;
      if (!preset) return;
      timerStartedAtRef.current = new Date().toISOString();
      dispatch(startTimer({ seconds: timerState.seconds || preset.durationMinutes * 60, presetId: preset.id }));
    }
  };

  const handleResetTimer = () => {
    timerStartedAtRef.current = null;
    dispatch(resetTimer());
  };

  const handleSelectPreset = (presetId: string) => {
    if (timerState.running) return;
    const preset = presets.find((p) => p.id === presetId);
    if (!preset) return;
    dispatch(resetTimer());
    dispatch(startTimer({ seconds: preset.durationMinutes * 60, presetId: preset.id }));
    dispatch(stopTimer());
  };

  const timerDisplay =
    timerState.seconds > 0
      ? formatTime(timerState.seconds)
      : selectedPreset
        ? formatTime(selectedPreset.durationMinutes * 60)
        : "00:00";

  return (
    <AppContainer style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <View style={s.headerTitleRow}>
              <View style={[s.headerIconBox, { backgroundColor: theme.primaryLight }]}>
                <Calendar size={20} color={theme.primary} />
              </View>
              <AppText variant="title">Planificador</AppText>
            </View>
            <AppText variant="paragraph" muted style={s.mt4}>
              Organiza tu autonomía.
            </AppText>
          </View>
          <View style={[s.monthNavigator, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <IconButton
              icon={<ChevronLeft size={14} color={theme.textPrimary} />}
              size="small"
              onPress={() => setCurrentMonthOffset((o) => o - 1)}
            />
            <AppText variant="smallParagraph" weight="600" style={s.monthLabel}>
              {currentMonth}
            </AppText>
            <IconButton
              icon={<ChevronRight size={14} color={theme.textPrimary} />}
              size="small"
              onPress={() => setCurrentMonthOffset((o) => o + 1)}
            />
          </View>
        </View>

        {/* Calendar Strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.calendarScrollView}
          contentContainerStyle={s.calendarStrip}
        >
          {calendarDays.map((day, index) => {
            const isSelected = index === selectedDayIndex;
            return (
              <TouchableOpacity
                key={day.date.toISOString()}
                activeOpacity={0.6}
                style={[
                  dayItem,
                  isSelected && {
                    backgroundColor: theme.primary,
                    borderColor: theme.primary,
                    shadowColor: theme.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                  },
                  !isSelected && { backgroundColor: theme.surface },
                ]}
                onPress={() => setSelectedDayIndex(index)}
              >
                <AppText
                  variant="verySmall"
                  color={isSelected ? "#FFFFFF" : theme.textMuted}
                  weight={isSelected ? "600" : "normal"}
                >
                  {day.dayName}
                </AppText>
                <AppText
                  variant="smallSubtitle"
                  color={isSelected ? "#FFFFFF" : theme.textPrimary}
                  weight={isSelected ? "bold" : "normal"}
                >
                  {day.dayNumber}
                </AppText>
                {day.isToday && !isSelected && <View style={[s.todayDot, { backgroundColor: theme.primary }]} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Task List */}
        <GlassCard padding={16} style={s.section}>
          <View style={s.taskListHeader}>
            <AppText variant="subtitle" weight="600">
              Sesiones de Hoy
            </AppText>
            <IconButton
              icon={<Plus size={16} color="#FFFFFF" />}
              variant="primary"
              size="small"
              onPress={() => setShowAddForm((v) => !v)}
            />
          </View>

          {/* Inline add form */}
          {showAddForm && (
            <View style={s.addForm}>
              <AppInput placeholder="Título de la tarea" value={newTaskTitle} onChangeText={setNewTaskTitle} />
              <AppInput
                placeholder="Hora o recordatorio (ej: 15:00, A las 3)"
                value={newTaskTime}
                onChangeText={setNewTaskTime}
                stylesContainer={{ marginTop: 8 }}
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
                      Alert.alert("Error", "No se pudo guardar la tarea. Intentá de nuevo.");
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
              No hay sesiones para hoy.
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
                    numberOfLines={1}
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
                    <Timer size={16} color={theme.primary} style={{ marginRight: 10 }} />
                    <View style={s.taskInfo}>
                      <AppText variant="smallParagraph" weight="500">
                        {session.durationMinutes} min
                      </AppText>
                    </View>
                    <AppText variant="verySmall" muted style={{ marginRight: 10 }}>
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

        {/* Pomodoro Tip Card */}
        <View style={s.section}>
          <View
            style={[
              s.pomodoroCard,
              {
                backgroundColor: theme.primaryLight,
                borderColor: `${theme.primary}20`,
              },
            ]}
          >
            <View style={s.pomodoroTagRow}>
              <View style={[s.pomodoroTagDot, { backgroundColor: theme.primary }]} />
              <AppText variant="verySmall" color={theme.primary} weight="bold" style={s.pomodoroTag}>
                TIP DE AUTONOMÍA
              </AppText>
            </View>
            <AppText variant="subtitle" style={s.mb8}>
              Técnica Pomodoro Adaptativa
            </AppText>

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
              <AppText variant="bigSubtitle" weight="bold" color={theme.primary} style={s.timerDisplay}>
                {timerDisplay}
              </AppText>
              <TouchableOpacity onPress={handleResetTimer} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <AppText variant="verySmall" color={theme.textMuted}>
                  Reiniciar
                </AppText>
              </TouchableOpacity>
            </View>

            <AppButton variant="primary" style={s.pomodoroButton} onPress={handleStartTimer}>
              <View style={s.pomodoroButtonContent}>
                <Clock size={16} color={theme.textOnPrimary} />
                <AppText variant="smallSubtitle" color={theme.textOnPrimary} weight="600">
                  {timerState.running ? " Pausar" : " Iniciar temporizador"}
                </AppText>
              </View>
            </AppButton>
            <Clock size={90} color={`${theme.primary}20`} style={s.pomodoroIcon} />
          </View>
        </View>
      </ScrollView>
    </AppContainer>
  );
};

const s = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 0,
  },
  section: {
    marginTop: 24,
  },
  mt4: {
    marginTop: 4,
  },
  mb8: {
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  monthNavigator: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  monthLabel: {
    marginHorizontal: 6,
    textTransform: "capitalize",
  },
  calendarScrollView: {
    marginTop: 24,
    marginHorizontal: -20,
  },
  calendarStrip: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 10,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
  taskListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTasks: {
    paddingVertical: 28,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  taskAccent: {
    width: 3,
    alignSelf: "stretch",
    borderRadius: 2,
    marginRight: 12,
  },
  taskCheckRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
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
    marginLeft: 8,
  },
  pomodoroCard: {
    borderRadius: 20,
    padding: 22,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
  },
  pomodoroTagRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  pomodoroTagDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pomodoroTag: {
    letterSpacing: 1,
  },
  timerDisplay: {
    textAlign: "center",
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 12,
  },
  sessionBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  durationPicker: {
    marginBottom: 12,
  },
  pomodoroTaskMsg: {
    marginBottom: 16,
    fontStyle: "italic",
  },
  pomodoroButton: {
    borderRadius: 14,
    alignSelf: "flex-start",
  },
  pomodoroButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  pomodoroIcon: {
    position: "absolute",
    bottom: -14,
    right: -14,
  },
  addForm: {
    marginTop: 12,
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
