# Tasks: ico-app Core Modules Implementation

## Batch 1: Theme Foundation

- [ ] **TASK-01** — Extend `ThemeColors` interface in `src/config/theme.config.ts` with `success`, `danger`, `cardShadow` colors. Add values to both light/dark themes. REQ-17.
- [ ] **TASK-02** — Refactor `AppText.tsx` (`src/presentation/components/ui/typography/AppText.tsx`) to use `useThemeColors`. Default color → `textPrimary`, add `muted` prop → `textMuted`. Preserve all variants. REQ-01.
- [ ] **TASK-03** — Refactor `AppButton.tsx` (`src/presentation/components/ui/buttons/AppButton.tsx`) with `variant` prop (primary/secondary/outline/danger). Use `useThemeColors`. Preserve `backgroundColor` override and `loading` state. REQ-02.
- [ ] **TASK-04** — Refactor `AppInput.tsx` (`src/presentation/components/ui/inputs/AppInput.tsx`) to use `useThemeColors` for background (`surface`), border, text, placeholder colors. Add focus border → `primary`. REQ-03.
- [ ] **TASK-05** — Refactor `AppContainer.tsx` (`src/presentation/components/ui/layout/AppContainer.tsx`) to set `background` color from theme and StatusBar style based on colorScheme. REQ-17.
- [ ] **TASK-06** — Install `lucide-react-native` package. Add to `package.json`. No file changes.

## Batch 2: Shared Components (depends: Batch 1)

- [ ] **TASK-07** — Create `GlassCard.tsx` in `src/presentation/components/ui/layout/GlassCard.tsx`. Props: `elevation`, `bordered`, `onPress`. Uses `surface` bg, `border` color, borderRadius 16. REQ-04.
- [ ] **TASK-08** — Create `ProgressBar.tsx` in `src/presentation/components/ui/feedback/ProgressBar.tsx`. Props: `progress`, `variant`, `size`. Animated fill with reanimated. Track = `border`, fill = `primary`/`accent`. REQ-05.
- [ ] **TASK-09** — Create `ChatBubble.tsx` in `src/presentation/components/ui/chat/ChatBubble.tsx`. Props: `role`, `timestamp`, `message`. User = right/`primary`, model = left/`surface`. Entry animation. REQ-06.
- [ ] **TASK-10** — Create `TypingIndicator.tsx` in `src/presentation/components/ui/chat/TypingIndicator.tsx`. 3-dot bounce animation with reanimated. Colors from `textMuted`. REQ-07.
- [ ] **TASK-11** — Create `IconButton.tsx` in `src/presentation/components/ui/buttons/IconButton.tsx`. Props: `icon`, `variant`, `size`, `onPress`. Circular touchable, theme-aware. REQ-08.
- [ ] **TASK-12** — Update tab layout (`src/presentation/navigation/(protected)/(tabs)/_layout.tsx`) with lucide icons, Spanish labels, theme colors (`surface` bg, `primary` active, `textMuted` inactive), `headerShown: false`. REQ-09.

## Batch 3: Mock Infrastructure (parallel with Batch 2)

- [ ] **TASK-13** — Create `useMockChat.ts` in `src/shared/hooks/useMockChat.ts`. Returns `{ response, isLoading, send }`. Fixture responses, 2000ms delay. REQ-18.
- [ ] **TASK-14** — Create `useMockLearningPath.ts` in `src/shared/hooks/useMockLearningPath.ts`. Returns `{ path, isLoading, generate }`. Topic-relevant fixture (4-6 steps), 2000ms delay. REQ-18.
- [ ] **TASK-15** — Create `useMockSummary.ts` in `src/shared/hooks/useMockSummary.ts`. Returns `{ summary, isLoading, generate }`. Fixture summary text, 1500ms delay. REQ-18.

## Batch 4: Auth & Shared Screens (depends: Batch 2)

- [x] **TASK-16** — Rewrite `LoginForm.tsx` (`src/presentation/screens/auth/sign-in/LoginForm.tsx`). Logo, "Iniciar Sesión" title, Apple button (secondary), Google button (outline), guest text link. All themed. REQ-10.
- [x] **TASK-17** — Rewrite `Maintenance.tsx` (`src/presentation/screens/shared/Maintenance.tsx`). Construction icon, "En Mantenimiento" title, message, estimated time, "Reintentar" primary button. REQ-11.

## Batch 5: Core Screens Part 1 (depends: Batch 2 + 3)

- [ ] **TASK-18** — Rewrite `Home.tsx` (`src/presentation/screens/protected/tabs/Home.tsx`). Welcome card, 3-col stats grid (GlassCards), quick action cards, ongoing paths with ProgressBar, empty state. REQ-12.
- [ ] **TASK-19** — Rewrite `Plan.tsx` (`src/presentation/screens/protected/tabs/Plan.tsx`). Horizontal calendar strip (7 days), task list with check/delete, add IconButton, Pomodoro tip card. REQ-13.

## Batch 6: Core Screens Part 2 (depends: Batch 2 + 3)

- [ ] **TASK-20** — Rewrite `Summary.tsx` (`src/presentation/screens/protected/tabs/Summary.tsx`). Multiline input GlassCard, "Generar Resumen Crítico" button, summary display with accent border, copy-to-clipboard, reflection CTA. Uses `useMockSummary`. REQ-14.
- [ ] **TASK-21** — Rewrite `LearningPath.tsx` (`src/presentation/screens/protected/tabs/LearningPath.tsx`). Topic input, "Trazar" button, path header, vertical step timeline with numbered nodes, step completion toggle. Uses `useMockLearningPath`. REQ-15.
- [ ] **TASK-22** — Rewrite `Tutor.tsx` (`src/presentation/screens/protected/tabs/Tutor.tsx`). Chat header with green accent, ChatBubble list, TypingIndicator, input bar with send IconButton, auto-scroll. Uses `useMockChat`. REQ-16.
