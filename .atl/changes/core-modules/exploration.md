## Exploration: ico-app Core Modules Implementation

### Current Codebase State Analysis

**Screens (ALL are empty stubs)**
- `src/presentation/screens/protected/tabs/Home.tsx` — 12 lines, placeholder
- `src/presentation/screens/protected/tabs/Tutor.tsx` — 12 lines, placeholder
- `src/presentation/screens/protected/tabs/LearningPath.tsx` — 12 lines, placeholder
- `src/presentation/screens/protected/tabs/Summary.tsx` — 12 lines, placeholder
- `src/presentation/screens/protected/tabs/Plan.tsx` — 12 lines, placeholder
- `src/presentation/screens/auth/sign-in/LoginForm.tsx` — 12 lines, placeholder
- `src/presentation/screens/shared/Maintenance.tsx` — 12 lines, placeholder
- `src/presentation/screens/Welcome.tsx` — minimal welcome with AppText

**Theme System**
- `src/config/theme.config.ts` — light/dark ThemeColors with background, surface, primary, accent, textPrimary, textMuted, border
- `src/presentation/hooks/useThemeColors.ts` — uses `useColorScheme()` to switch between light/dark
- **Issue**: AppText defaults color to `#000000`, completely breaking dark mode
- **Issue**: AppButton and AppInput have NO theme integration; hardcoded colors everywhere

**UI Component Library**
- **AppButton** — basic TouchableOpacity wrapper, supports loading state, no theme variant system
- **AppInput** — TextInput with left/right slots, secureTextEntry toggle, hardcoded placeholderTextColor `#9ca3af`
- **AppContainer** — SafeAreaView with padding 20, StatusBar auto
- **AppText** — 11 variants (bigTitle to verySmall), fontFamily Roboto, but color defaults to `#000000`
- **AppSegmentedPicker** — ALREADY uses react-native-reanimated with spring animation (good pattern to follow)
- **AppCheckbox** — themed check/uncheck with primary color, uses FontAwesome5 check icon
- **AppSelect** — modal-based dropdown, uses theme colors correctly (good reference)
- **AmountModal** — completely empty file

**Navigation**
- Expo Router file-based routing in `src/presentation/navigation/`
- Root layout: Stack with index, (auth), (protected), (shared)
- Auth layout: Stack leads to (sign-in) leads to login-form
- Protected layout: Stack leads to (tabs) with mocked auth (`isAuthenticated = true`)
- Tabs layout: bare `<Tabs>` with 5 screen names, NO icons, NO titles, NO styling
- Shared layout: Stack leads to maintenance

**Dependencies**
- Expo 54, React Native 0.81.5, React 19.1.0
- `react-native-reanimated` ~4.1.1 (installed and working)
- `react-native-worklets` 0.5.1
- `@expo/vector-icons` (implied by FontAwesome5 imports)
- **NO** lucide-react-native, phosphor-react-native, or other icon libraries
- **NO** state management library
- **NO** API/service layer files exist
- **NO** expo-blur for glassmorphism

**Clean Architecture Skeleton**
- Folders exist: application, domain, infrastructure, presentation, shared, types
- But they are mostly empty — no actual business logic, entities, or use cases implemented yet

---

### Design Translation Mapping (autolearner-ai Web to React Native)

| Web Pattern | RN Equivalent | Notes |
|-------------|---------------|-------|
| `glass-card` (bg-white/80 backdrop-blur-md) | Surface card: `bg: colors.surface`, `borderWidth: 1`, `borderColor: colors.border`, `borderRadius: 16`, `elevation: 2` | True backdrop-blur requires `expo-blur`. Without it, use solid surface with border. |
| `brand-green` (#059669) | `colors.primary` (#3C57A9 light / #5E79D4 dark) | Already mapped. Use primary for all brand-green references. |
| `brand-silver` (#e2e8f0) | `colors.border` | Already mapped. |
| `bg-brand-green/10` | `` `${colors.primary}1A` `` (10% alpha hex) | Use hex alpha notation. |
| `shadow-xl shadow-emerald-100` | `elevation: 4-8`, `shadowColor: colors.primary`, `shadowOpacity: 0.15` | RN shadows are limited but workable. |
| `rounded-2xl` | `borderRadius: 16` | Standard mapping. |
| `font-display` (Outfit) | Roboto (already configured) | AppText uses Roboto. For display text, use `variant: "title"` or `"bigTitle"`. |
| `animate-in fade-in slide-in-from-bottom-4` | `react-native-reanimated` entering animation | Use `FadeInUp` or custom `useAnimatedStyle` with `translateY`. |
| `motion.div` width animation | `Animated.View` with `useSharedValue` + `useAnimatedStyle` | Already used in AppSegmentedPicker. |
| `animate-bounce` typing dots | `react-native-reanimated` looped spring/sequence | 3 dots with staggered delays. |
| `grid-cols-2` / `grid-cols-3` | `flexDirection: "row"`, `flexWrap: "wrap"` or explicit rows | RN has no CSS Grid. Use flex row with `gap`. |
| `scrollbar-hide` | `showsHorizontalScrollIndicator: false` | On ScrollView/FlatList. |
| `prose` typography | `AppText` variants with lineHeight | No Tailwind prose equivalent. |
| `hover:bg-white` | `activeOpacity` or `Pressable` | RN has no hover on mobile. Use active/touch feedback. |
| `group-hover:opacity-100` | Not directly translatable | Use `onPressIn/onPressOut` state or skip hover effects. |
| `lucide-react` icons | `@expo/vector-icons` FontAwesome5 or add `lucide-react-native` | Mapping needed for each icon. |

---

### New Component Inventory Needed

**Shared / UI Components**
1. **GlassCard** — themed surface card with border, radius, optional shadow. Replaces all `glass-card` usage.
2. **ProgressBar** — animated horizontal bar using reanimated. Props: `progress` (0-100), `color`, `height`, `animated`.
3. **ChatBubble** — user/model variants with tail styling. Props: `role`, `text`, `animated`.
4. **TypingIndicator** — 3 bouncing dots with staggered reanimated loops.
5. **IconButton** — circular button with icon, supports primary/secondary/surface variants. Props: `icon`, `variant`, `size`, `onPress`.
6. **QuickActionCard** — large colored card with icon, title, subtitle. Props: `icon`, `title`, `subtitle`, `color`, `onPress`.
7. **StatCard** — vertical stat display: icon circle, label, value. Props: `icon`, `label`, `value`, `color`.
8. **PathStepNode** — timeline node with completion state, connector line support. Props: `step`, `index`, `isCompleted`, `isLast`, `onToggle`.
9. **CalendarDay** — day pill for horizontal calendar strip. Props: `day`, `weekday`, `isSelected`, `onPress`.
10. **TaskItem** — task row with checkbox, title, time, delete action. Props: `task`, `onToggle`, `onDelete`.
11. **SectionHeader** — consistent section title + optional action link. Props: `title`, `actionLabel`, `onAction`.

---

### Theme Extension Strategy

**Immediate Fixes**
1. **AppText default color**: Change from `#000000` to `colors.textPrimary`. Without this, dark mode is broken.
2. **AppButton variants**: Add `variant: 'primary' | 'secondary' | 'ghost'` prop. Primary = bg primary, text white. Secondary = bg surface, text primary, border. Ghost = transparent.
3. **AppInput theming**: Accept `placeholderTextColor` from theme `textMuted`. Apply `backgroundColor: colors.surface` and `borderColor: colors.border` to container.

**Extended Colors (add to ThemeColors)**
- `success: "#10B981"` (emerald-500)
- `error: "#EF4444"` (red-500)
- `warning: "#F59E0B"` (already accent, but could be renamed)
- `overlay: "rgba(0,0,0,0.5)"` — for modals

**Alpha Helper**
Create a small util: `hexAlpha(hex, opacity)` to generate hex+alpha strings for overlays like `primary/10`.

---

### Navigation Enhancement Plan

**Tabs Layout** (`src/presentation/navigation/(protected)/(tabs)/_layout.tsx`)
Current: bare `<Tabs>` with no config.

Needed:
- Add `tabBarIcon` to each `<Tabs.Screen>` using FontAwesome5 icons:
  - home: "home"
  - tutor: "comments" or "robot"
  - learning-path: "route" or "map-signs"
  - summary: "file-alt"
  - plan: "calendar-alt"
- Add `tabBarActiveTintColor: colors.primary`
- Add `tabBarInactiveTintColor: colors.textMuted`
- Add `tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border }`
- Add `tabBarLabel` for each screen
- Consider `tabBarShowLabel: true` for clarity

**Auth Layout**
- LoginForm screen needs to be the entry point. Currently routes to `(auth)/login` in protected layout redirect, but actual file is `login-form.tsx`.
- Need to verify route naming consistency: `login-form` vs `login`.

---

### Risk Assessment and Technical Constraints

| Risk | Severity | Mitigation |
|------|----------|------------|
| All screens are empty stubs — greenfield implementation | Low | Clean slate, no migration needed. |
| No API/service layer for AI features | Medium | Implement UI with mock data/hooks. Wire to real API later. |
| No state management | Medium | Local `useState` + `useCallback` sufficient for MVP. Add Zustand later if complexity grows. |
| AppText/AppButton/AppInput not theme-aware | High | MUST fix before implementing screens, otherwise dark mode is broken everywhere. |
| Only FontAwesome5 icons available | Low | Map lucide icons to FA5 equivalents, or install `lucide-react-native`. Recommend adding lucide-react-native for 1:1 design fidelity. |
| No expo-blur for true glassmorphism | Low | Use solid surface cards with borders. Acceptable visual tradeoff. |
| React Native Reanimated v4 is new | Low | Already working in AppSegmentedPicker. Stick to stable APIs (`useSharedValue`, `useAnimatedStyle`, `withSpring`, `withTiming`). |
| No hover states on mobile | Low | Replace hover effects with active/touch feedback. Omit `group-hover` patterns. |
| `react-native` 0.81.5 + React 19.1.0 | Medium | This is bleeding edge. Some third-party libs may have compatibility issues. Test thoroughly. |

---

### Recommended Approach for Each Module

**1. Dashboard (Home)**
- Use `ScrollView` with `showsVerticalScrollIndicator: false`
- Welcome section: `AppText variant="title"` greeting + `AppText variant="smallParagraph" color={textMuted}` subtitle
- Stats row: 3 `StatCard`s in a `View` with `flexDirection: "row"`, `gap: 12`
- Quick Actions: 2 `QuickActionCard`s in a row (primary + dark/surface variant)
- Ongoing Paths: `FlatList` or `ScrollView` with `GlassCard` rows containing `ProgressBar`
- Animate progress bars on mount using reanimated

**2. ChatTutor (Tutor)**
- Layout: `View` flex column, header fixed, messages `ScrollView` flex:1, input fixed bottom
- Messages: `FlatList` inverted or standard with `scrollToEnd`. Use `ChatBubble` component.
- Typing indicator: `TypingIndicator` component shown conditionally
- Input bar: `AppInput` with send `IconButton`
- Auto-scroll: `useEffect` on messages array
- Mock AI responses with setTimeout for now

**3. LearningPath**
- Two states: `!path` (input) vs `path` (timeline)
- Input state: `GlassCard` with info banner (icon + text), `AppInput`, `AppButton`
- Timeline: `ScrollView` with absolute positioned vertical line
- Steps: `PathStepNode` components arranged vertically with `gap: 16`
- Staggered entrance animation using reanimated `FadeInUp` with delay based on index

**4. Summarizer**
- `ScrollView` with input section and conditional output section
- Input: multiline `TextInput` (not AppInput — needs height and multiline) inside `GlassCard`
- Action button: `AppButton` full width with Wand icon
- Output: `GlassCard` with border tinted primary, copy `IconButton`
- Reflection CTA: `GlassCard` with dashed border and help icon
- Copy: `expo-clipboard` or `@react-native-clipboard/clipboard` (not installed yet)

**5. StudyPlanner**
- Header with month navigator (ChevronLeft/Right `IconButton`s + month label)
- Calendar strip: `ScrollView` horizontal with `showsHorizontalScrollIndicator: false`, `CalendarDay` pills
- Task list: `FlatList` with `TaskItem` rows. Swipe-to-delete is nice-to-have; start with visible delete on press.
- Pomodoro card: `View` with dark background, decorative blurred circle, `Clock` icon

**6. LoginForm Redesign**
- Welcome illustration/logo at top
- App title + subtitle
- Apple/Google auth buttons: `AppButton` with left icon, full width, branded colors
- Divider "o" line
- Guest section: secondary `AppButton`
- Keep it minimal, no form fields for MVP (social auth only)

**7. Maintenance Redesign**
- Centered layout with large construction/tool icon
- Title: "En mantenimiento"
- Subtitle explaining status
- Decorative animated element (spinning gear or pulsing dot) using reanimated
- Optional: "Reintentar" button

---

### Dependencies to Potentially Add
- `lucide-react-native` — for 1:1 icon parity with autolearner-ai (otherwise map to FontAwesome5)
- `expo-clipboard` — for copy functionality in Summarizer
- `expo-blur` — if true glassmorphism is desired
- `zustand` — if global state becomes needed

---

### FontAwesome5 to Lucide Icon Mapping (if not adding lucide)

| Lucide | FontAwesome5 Alternative |
|--------|--------------------------|
| Home | home |
| BookOpen | book-open |
| Plus | plus |
| Target | bullseye |
| Send | paper-plane |
| Bot | robot |
| Sparkles | magic |
| User | user |
| CheckCircle2 | check-circle |
| Clock | clock |
| TrendingUp | chart-line |
| ChevronRight | chevron-right |
| ChevronLeft | chevron-left |
| Route | route |
| FileText | file-alt |
| Wand2 | magic |
| Copy | copy |
| Check | check |
| HelpCircle | question-circle |
| Lightbulb | lightbulb |
| Trash2 | trash-alt |
| Calendar | calendar-alt |
| AlertCircle | exclamation-circle |

---

### Next Steps Recommendation
1. Fix theme integration in AppText, AppButton, AppInput FIRST.
2. Create the shared component library (GlassCard, ProgressBar, ChatBubble, TypingIndicator, IconButton, etc.).
3. Implement screens one by one in order: LoginForm → Maintenance → Dashboard → StudyPlanner → Summarizer → LearningPath → ChatTutor.
4. Enhance tab navigation with icons and titles.
5. Add mock AI hooks for Tutor, LearningPath, Summarizer.
