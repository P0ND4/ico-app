import React, { useMemo, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import type { ViewStyle } from "react-native";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Clock,
} from "lucide-react-native";
import AppContainer from "../../../components/ui/layout/AppContainer";
import AppText from "../../../components/ui/typography/AppText";
import AppButton from "../../../components/ui/buttons/AppButton";
import GlassCard from "../../../components/ui/cards/GlassCard";
import IconButton from "../../../components/ui/buttons/IconButton";
import { useThemeColors } from "../../../hooks/useThemeColors";

interface Task {
  id: number;
  title: string;
  time: string;
  completed: boolean;
}

function generateCalendarDays(): {
  dayName: string;
  dayNumber: number;
  date: Date;
  isToday: boolean;
}[] {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const raw = date.toLocaleDateString("es-ES", { weekday: "short" });
    const dayName = raw.charAt(0).toUpperCase() + raw.slice(1);
    return {
      dayName,
      dayNumber: date.getDate(),
      date,
      isToday: i === 0,
    };
  });
}

const Plan = () => {
  const theme = useThemeColors();

  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: "Repasar Derivadas",
      time: "10:00 AM",
      completed: true,
    },
    {
      id: 2,
      title: "Lectura de Antropología",
      time: "2:30 PM",
      completed: false,
    },
    {
      id: 3,
      title: "Práctica de Java",
      time: "5:00 PM",
      completed: false,
    },
  ]);

  const calendarDays = useMemo(() => generateCalendarDays(), []);

  const currentMonth = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  }, []);

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

  const handleToggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  };

  const handleDeleteTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <AppContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <AppText variant="title">Planificador</AppText>
            <AppText variant="paragraph" muted style={s.mt4}>
              Organiza tu autonomía.
            </AppText>
          </View>
          <View style={[s.monthNavigator, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <IconButton
              icon={<ChevronLeft size={14} color={theme.textPrimary} />}
              size="small"
              onPress={() => console.log("Previous month")}
            />
            <AppText variant="smallParagraph" weight="600" style={s.monthLabel}>
              {currentMonth}
            </AppText>
            <IconButton
              icon={<ChevronRight size={14} color={theme.textPrimary} />}
              size="small"
              onPress={() => console.log("Next month")}
            />
          </View>
        </View>

        {/* Calendar Strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
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
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Task List */}
        <GlassCard padding={16} style={s.section}>
          <View style={s.taskListHeader}>
            <AppText variant="subtitle" weight="600">Sesiones de Hoy</AppText>
            <IconButton
              icon={<Plus size={16} color="#FFFFFF" />}
              variant="primary"
              size="small"
              onPress={() => console.log("Add task")}
            />
          </View>

          {tasks.length === 0 && (
            <AppText
              variant="smallParagraph"
              muted
              align="center"
              style={s.emptyTasks}
            >
              No hay sesiones para hoy.
            </AppText>
          )}

          {tasks.map((task, idx) => (
            <View
              key={task.id}
              style={[
                s.taskRow,
                idx > 0 && { borderTopColor: theme.border, borderTopWidth: 1 },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.6}
                onPress={() => handleToggleTask(task.id)}
                style={s.taskCheckRow}
              >
                <View
                  style={[
                    s.checkbox,
                    {
                      borderColor: task.completed
                        ? theme.primary
                        : theme.border,
                      backgroundColor: task.completed
                        ? theme.primary
                        : "transparent",
                    },
                  ]}
                >
                  {task.completed && (
                    <AppText variant="verySmall" color="#FFFFFF" weight="bold">
                      ✓
                    </AppText>
                  )}
                </View>
                <View style={s.taskInfo}>
                  <AppText
                    variant="paragraph"
                    muted={task.completed}
                    lineThrough={task.completed}
                    numberOfLines={1}
                    weight={task.completed ? "normal" : "500"}
                  >
                    {task.title}
                  </AppText>
                  <View style={s.taskTimeRow}>
                    <Clock size={12} color={theme.textMuted} />
                    <AppText variant="verySmall" muted style={s.taskTimeText}>
                      {task.time}
                    </AppText>
                  </View>
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
              <AppText
                variant="verySmall"
                color={theme.primary}
                weight="bold"
                style={s.pomodoroTag}
              >
                TIP DE AUTONOMÍA
              </AppText>
            </View>
            <AppText variant="subtitle" style={s.mb8}>
              Técnica Pomodoro Adaptativa
            </AppText>
            <AppText
              variant="smallParagraph"
              muted
              style={s.pomodoroDesc}
            >
              Tu tutor sugiere bloques de 45 minutos con pausas de 10, ideales
              para mantener la concentración en temas complejos.
            </AppText>
            <AppButton
              variant="primary"
              style={s.pomodoroButton}
              onPress={() => console.log("Iniciar Timer")}
            >
              <View style={s.pomodoroButtonContent}>
                <Clock size={16} color={theme.textOnPrimary} />
                <AppText variant="smallSubtitle" color={theme.textOnPrimary} weight="600">
                  {" Iniciar Timer"}
                </AppText>
              </View>
            </AppButton>
            <Clock
              size={90}
              color={`${theme.primary}20`}
              style={s.pomodoroIcon}
            />
          </View>
        </View>
      </ScrollView>
    </AppContainer>
  );
};

const s = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
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
  calendarStrip: {
    marginTop: 24,
    paddingBottom: 8,
    gap: 10,
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
  pomodoroDesc: {
    marginBottom: 20,
    lineHeight: 22,
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
});

export default React.memo(Plan);
