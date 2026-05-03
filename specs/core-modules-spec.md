# Delta Spec: core-modules — ico-app Core UI Components & Screens

**Change**: core-modules  
**Project**: ico-app  
**Created**: 2026-05-02  
**Status**: DRAFT  

---

## Context

ico-app is a React Native (Expo) educational AI companion app. The existing codebase has:
- **Theme system**: `useThemeColors()` hook returning `{ background, surface, primary, accent, textPrimary, textMuted, border }` for light/dark modes
- **Existing UI primitives**: `AppText`, `AppButton`, `AppInput`, `AppContainer` — all lack theme integration (hardcoded colors)
- **Stub screens**: `Home`, `Plan`, `Summary`, `LearningPath`, `Tutor`, `LoginForm`, `Maintenance` — all render placeholder `<View><Text>` only
- **Reference design**: Web components in `autolearner-ai` demonstrate the visual language

This delta spec defines the requirements to implement themed UI components and full screen implementations.

---

## Design Direction

**Aesthetic**: Dark academia meets digital minimalism. Think Notion's clarity with a scholarly warmth — deep navy surfaces, amber accents, subtle glass morphism. Typography uses system fonts with sharp weight contrasts. Spacing is generous but intentional. No purple gradients. No generic rounded-corner cards everywhere.

**Color semantics** (from theme.config.ts):
- `primary` (#3C57A9 light / #5E79D4 dark): Actions, links, focus states
- `accent` (#F59E0B / #FBBF24): Highlights, success, progress
- `surface`: Card backgrounds, elevated surfaces
- `textPrimary` / `textMuted`: Text hierarchy

---

## Phase 1: Foundation Components

### REQ-01: AppText Theme Integration

**ID**: REQ-01  
**Requirement**: AppText must integrate `useThemeColors` to automatically apply theme-aware text colors while preserving all existing variants, props, and backward compatibility.  
**Priority**: P0  

**Scenarios**:

**Scenario 1.1 — Default theme color**  
Given: AppText is rendered without an explicit `color` prop  
When: The component mounts in light mode  
Then: Text color is `textPrimary` from the light theme (#263047)

**Scenario 1.2 — Explicit color override**  
Given: AppText receives `color="#FF0000"`  
When: The component renders  
Then: Text color is exactly `#FF0000`, ignoring theme

**Scenario 1.3 — Dark mode automatic switch**  
Given: System color scheme is "dark"  
When: AppText renders without explicit `color`  
Then: Text color is `textPrimary` from dark theme (#F1F5F9)

**Scenario 1.4 — All variants preserved**  
Given: AppText receives `variant="bigTitle"`  
When: The component renders  
Then: Font size is 36, lineHeight 42, weight bold — same as current behavior

**Scenario 1.5 — Muted variant**  
Given: AppText receives a new `muted` boolean prop  
When: `muted={true}` and no explicit `color`  
Then: Text color is `textMuted` from current theme

---

### REQ-02: AppButton Theme Variants

**ID**: REQ-02  
**Requirement**: AppButton must support theme-aware style variants (primary, secondary, outline, danger) using colors from `useThemeColors`, extending the existing interface.  
**Priority**: P0  

**Scenarios**:

**Scenario 2.1 — Primary variant**  
Given: AppButton receives `variant="primary"` and no explicit `backgroundColor`  
When: Button renders in light mode  
Then: Background is `primary` (#3C57A9), text is white, borderRadius 20 (existing default)

**Scenario 2.2 — Secondary variant**  
Given: AppButton receives `variant="secondary"`  
When: Button renders  
Then: Background is `surface`, text is `textPrimary`, border is `border` color

**Scenario 2.3 — Outline variant**  
Given: AppButton receives `variant="outline"`  
When: Button renders  
Then: Background is transparent, border is `primary` (2px), text is `primary`

**Scenario 2.4 — Danger variant**  
Given: AppButton receives `variant="danger"`  
When: Button renders  
Then: Background is a semantic red (#DC2626), text is white

**Scenario 2.5 — Backward compatibility**  
Given: AppButton receives `backgroundColor="#00FF00"` without `variant`  
When: Button renders  
Then: Background is exactly `#00FF00`, existing behavior preserved

**Scenario 2.6 — Loading state preserved**  
Given: AppButton receives `loading={true}`  
When: Button renders  
Then: ActivityIndicator is shown, touch is disabled — same as current behavior

---

### REQ-03: AppInput Theme Integration

**ID**: REQ-03  
**Requirement**: AppInput must use `useThemeColors` for background, border, placeholder, and text colors.  
**Priority**: P0  

**Scenarios**:

**Scenario 3.1 — Light mode colors**  
Given: AppInput renders in light mode  
When: No explicit styles provided  
Then: Background is `surface`, border is `border` color, text is `textPrimary`, placeholder is `textMuted`

**Scenario 3.2 — Dark mode colors**  
Given: AppInput renders in dark mode  
When: No explicit styles provided  
Then: Background is `surface` (#263047), border is `border` (#374667), text is `textPrimary` (#F1F5F9)

**Scenario 3.3 — Focus state**  
Given: AppInput receives focus  
When: User taps the input  
Then: Border color changes to `primary` (2px ring effect)

**Scenario 3.4 — Disabled state**  
Given: AppInput receives `editable={false}`  
When: Component renders  
Then: Opacity is 0.6 (existing behavior), colors remain theme-aware

**Scenario 3.5 — Custom style override**  
Given: AppInput receives `stylesContainer={{ backgroundColor: '#FF0000' }}`  
When: Component renders  
Then: Custom style overrides theme background

---

### REQ-04: GlassCard Component

**ID**: REQ-04  
**Requirement**: New `GlassCard` component — a themed card with surface-colored background, subtle border, rounded corners (16px), and optional elevation.  
**Priority**: P0  

**Scenarios**:

**Scenario 4.1 — Default rendering**  
Given: GlassCard wraps children  
When: Rendered in light mode  
Then: Background is `surface`, border is `border` color (1px), borderRadius 16, padding 16

**Scenario 4.2 — Dark mode**  
Given: GlassCard renders in dark mode  
When: No explicit props  
Then: Background is `surface` (#263047), border is `border` (#374667)

**Scenario 4.3 — Elevation prop**  
Given: GlassCard receives `elevation={2}`  
When: Component renders on iOS  
Then: Shadow is applied (shadowColor, shadowOffset, shadowOpacity, shadowRadius)

**Scenario 4.4 — No border variant**  
Given: GlassCard receives `bordered={false}`  
When: Component renders  
Then: No border is rendered, only surface background and optional shadow

**Scenario 4.5 — Pressable variant**  
Given: GlassCard receives `onPress` handler  
When: User taps the card  
Then: Card acts as TouchableOpacity with activeOpacity 0.7, onPress fires

---

### REQ-05: ProgressBar Component

**ID**: REQ-05  
**Requirement**: New `ProgressBar` component — animated fill bar using `react-native-reanimated`, with theme colors and configurable progress value (0-100).  
**Priority**: P0  

**Scenarios**:

**Scenario 5.1 — Animated fill**  
Given: ProgressBar receives `progress={65}`  
When: Component mounts  
Then: Fill animates from 0% to 65% width over 600ms (ease-out curve)

**Scenario 5.2 — Theme colors**  
Given: ProgressBar renders in light mode  
When: No explicit colors provided  
Then: Track background is `border`, fill color is `primary`

**Scenario 5.3 — Accent fill variant**  
Given: ProgressBar receives `variant="accent"`  
When: Component renders  
Then: Fill color is `accent` (amber) instead of `primary`

**Scenario 5.4 — Size variants**  
Given: ProgressBar receives `size="small"`  
When: Component renders  
Then: Height is 4px. Default is 8px. `size="large"` is 12px

**Scenario 5.5 — Progress update animation**  
Given: ProgressBar is mounted with `progress={30}`  
When: Props change to `progress={80}`  
Then: Fill animates from 30% to 80% smoothly

---

### REQ-06: ChatBubble Component

**ID**: REQ-06  
**Requirement**: New `ChatBubble` component — themed message bubble with user/model variants, timestamps, and optional avatar.  
**Priority**: P0  

**Scenarios**:

**Scenario 6.1 — User bubble**  
Given: ChatBubble receives `role="user"`  
When: Component renders  
Then: Bubble aligns right, background is `primary`, text is white, borderRadius 16 with top-right corner at 4px

**Scenario 6.2 — Model bubble**  
Given: ChatBubble receives `role="model"`  
When: Component renders  
Then: Bubble aligns left, background is `surface`, text is `textPrimary`, border is `border`, top-left corner at 4px

**Scenario 6.3 — Timestamp display**  
Given: ChatBubble receives `timestamp="10:30 AM"`  
When: Component renders  
Then: Timestamp appears below message text in `textMuted`, fontSize 10

**Scenario 6.4 — Long text wrapping**  
Given: ChatBubble receives a 500-character message  
When: Component renders  
Then: Text wraps within maxWidth 85% of container, preserves whitespace and line breaks

**Scenario 6.5 — Entry animation**  
Given: ChatBubble mounts  
When: First render  
Then: Opacity animates from 0 to 1, horizontal slide (user: from right 20px, model: from left 20px) over 200ms

---

### REQ-07: TypingIndicator Component

**ID**: REQ-07  
**Requirement**: New `TypingIndicator` component — 3-dot bouncing animation indicating AI is processing.  
**Priority**: P0  

**Scenarios**:

**Scenario 7.1 — Default rendering**  
Given: TypingIndicator is mounted  
When: Component renders  
Then: Three dots (8px each) are visible in a row with 4px gap, using `textMuted` color

**Scenario 7.2 — Bounce animation**  
Given: TypingIndicator is visible  
When: Animation plays  
Then: Dots bounce sequentially (0ms, 200ms, 400ms delay) using reanimated loop, translateY -8px

**Scenario 7.3 — Container styling**  
Given: TypingIndicator is placed in a chat context  
When: Rendered  
Then: Appears inside a `surface`-colored bubble with `border`, matching ChatBubble model variant shape

**Scenario 7.4 — Unmount cleanup**  
Given: TypingIndicator is unmounted  
When: Component removes from tree  
Then: Animation stops cleanly, no memory leaks

---

### REQ-08: IconButton Component

**ID**: REQ-08  
**Requirement**: New `IconButton` component — circular touchable button with icon, theme variants, and size options.  
**Priority**: P1  

**Scenarios**:

**Scenario 8.1 — Default rendering**  
Given: IconButton receives an icon component  
When: Rendered in light mode  
Then: 44x44 circle, background is `surface`, icon color is `textPrimary`, border is `border`

**Scenario 8.2 — Primary variant**  
Given: IconButton receives `variant="primary"`  
When: Component renders  
Then: Background is `primary`, icon color is white, no border

**Scenario 8.3 — Size variants**  
Given: IconButton receives `size="small"`  
When: Component renders  
Then: Container is 32x32, icon size is 16. Default is 44x44/20. Large is 56x56/24

**Scenario 8.4 — Disabled state**  
Given: IconButton receives `disabled={true}`  
When: Component renders  
Then: Opacity is 0.4, touch is disabled

**Scenario 8.5 — Active press feedback**  
Given: IconButton is pressed  
When: User holds touch  
Then: activeOpacity 0.6, or scale transform to 0.92

---

### REQ-09: Tab Navigation Config

**ID**: REQ-09  
**Requirement**: Tab navigation must display icons, labels, and active tint colors from the theme, replacing the current minimal config.  
**Priority**: P0  

**Scenarios**:

**Scenario 9.1 — Tab bar theme colors**  
Given: Tab navigator renders in light mode  
When: Tab bar is visible  
Then: Background is `surface`, inactive tint is `textMuted`, active tint is `primary`

**Scenario 9.2 — Dark mode tab bar**  
Given: System is in dark mode  
When: Tab bar renders  
Then: Background is `surface` (#263047), inactive tint is `textMuted` (#94A3B8), active tint is `primary` (#5E79D4)

**Scenario 9.3 — Tab icons**  
Given: Five tabs exist (Home, Tutor, Path, Summary, Plan)  
When: Each tab renders  
Then: Each has a relevant Ionicons icon (home, chatbubbles, git-network, document-text, calendar)

**Scenario 9.4 — Tab labels**  
Given: Each tab has a name  
When: Tab bar renders  
Then: Labels are "Inicio", "Tutor", "Ruta", "Resumen", "Plan" in small font

**Scenario 9.5 — Header hidden**  
Given: Tab screens render  
When: Navigation header would appear  
Then: `headerShown: false` is set for all tab screens

---

## Phase 2: Screen Implementations

### REQ-10: LoginForm Redesign

**ID**: REQ-10  
**Requirement**: LoginForm must display Apple/Google auth buttons, guest access section, and the app logo, all theme-aware.  
**Priority**: P0  

**Scenarios**:

**Scenario 10.1 — Layout structure**  
Given: LoginForm screen loads  
When: User sees the screen  
Then: Centered layout with logo at top, "Iniciar Sesión" title, two auth buttons, divider, guest section

**Scenario 10.2 — Apple auth button**  
Given: LoginForm renders  
When: Apple button is visible  
Then: Full-width AppButton (secondary variant), Apple icon, text "Continuar con Apple"

**Scenario 10.3 — Google auth button**  
Given: LoginForm renders  
When: Google button is visible  
Then: Full-width AppButton (outline variant), Google icon, text "Continuar con Google"

**Scenario 10.4 — Guest section**  
Given: LoginForm renders  
When: User scrolls to bottom  
Then: "Explorar como invitado" text link, onPress navigates to main tabs

**Scenario 10.5 — Theme support**  
Given: System is in dark mode  
When: LoginForm renders  
Then: Background is `background`, all text/buttons use dark theme colors

---

### REQ-11: Maintenance Screen Redesign

**ID**: REQ-11  
**Requirement**: Maintenance screen must show informative status with maintenance icon, message, estimated time, and retry button.  
**Priority**: P0  

**Scenarios**:

**Scenario 11.1 — Maintenance state**  
Given: Maintenance screen loads  
When: User sees the screen  
Then: Centered layout with construction icon, "En Mantenimiento" title, descriptive message

**Scenario 11.2 — Estimated time**  
Given: Maintenance screen renders  
When: Info is displayed  
Then: "Tiempo estimado: 2 horas" text in `textMuted` is shown below the message

**Scenario 11.3 — Retry button**  
Given: Maintenance screen renders  
When: User taps "Reintentar" button  
Then: AppButton (primary variant) triggers a connectivity check or navigation retry

**Scenario 11.4 — Theme support**  
Given: Dark mode is active  
When: Maintenance screen renders  
Then: All elements respect dark theme colors

---

### REQ-12: Dashboard (Home) Screen

**ID**: REQ-12  
**Requirement**: Home screen must display welcome card, stats grid, quick actions, and ongoing learning paths with progress.  
**Priority**: P0  

**Scenarios**:

**Scenario 12.1 — Welcome card**  
Given: Home screen loads  
When: Top section renders  
Then: "Hola, Estudiante 👋" title in AppText (bigTitle variant), subtitle "¿Qué vamos a aprender hoy?" in `textMuted`

**Scenario 12.2 — Stats grid**  
Given: Home screen renders  
When: Stats section is visible  
Then: 3-column grid with GlassCard items: Study Time (12h), Tasks Complete (18), Autonomy Level (85%), each with icon and colored indicator

**Scenario 12.3 — Quick actions**  
Given: Home screen renders  
When: Quick actions section is visible  
Then: Two large action cards — "Nueva Ruta" (primary bg, navigates to LearningPath) and "Tutor AI" (dark bg, navigates to Tutor)

**Scenario 12.4 — Ongoing paths**  
Given: User has active learning paths  
When: Paths section renders  
Then: List of GlassCard items with path title, remaining tasks count, percentage, and ProgressBar (REQ-05)

**Scenario 12.5 — Empty state**  
Given: User has no active paths  
When: Paths section renders  
Then: "No tienes rutas activas" message with "Crear ruta" CTA button

**Scenario 12.6 — Scrollable layout**  
Given: Home screen has multiple sections  
When: Content exceeds viewport  
Then: ScrollView wraps all content with 20px horizontal padding

---

### REQ-13: StudyPlanner (Plan) Screen

**ID**: REQ-13  
**Requirement**: Plan screen must display horizontal calendar strip, task list with check/delete actions, and a Pomodoro tip card.  
**Priority**: P0  

**Scenarios**:

**Scenario 13.1 — Calendar strip**  
Given: Plan screen loads  
When: Calendar section renders  
Then: Horizontally scrollable row of 7 day items, each showing day abbreviation and number, selected day has `primary` background

**Scenario 13.2 — Task list**  
Given: Tasks exist for selected day  
When: Task list renders  
Then: GlassCard with divider-separated task rows, each with checkbox (toggle complete), title, time, and swipe-to-delete

**Scenario 13.3 — Task completion toggle**  
Given: User taps a task's checkbox  
When: Toggle fires  
Then: Checkbox fills with `accent` color, title gets strikethrough style, animation plays

**Scenario 13.4 — Task deletion**  
Given: User taps delete icon on a task  
When: Delete action fires  
Then: Task row slides out with animation, removed from state

**Scenario 13.5 — Add task button**  
Given: Task list header renders  
When: "+" icon button is visible  
Then: IconButton (REQ-08) at top-right, onPress would open add-task flow (future scope, button present but no-op)

**Scenario 13.6 — Pomodoro tip card**  
Given: Plan screen renders  
When: Bottom section is visible  
Then: Dark-themed card (bg `textPrimary` or equivalent dark surface) with "Tip de Autonomía" label, "Técnica Pomodoro Adaptativa" title, description, and "Iniciar Timer" CTA

**Scenario 13.7 — Month navigation**  
Given: Calendar strip header renders  
When: User sees month label  
Then: "Mayo 2026" with left/right Chevron icons for month navigation (display only, no-op for now)

---

### REQ-14: Summarizer (Summary) Screen

**ID**: REQ-14  
**Requirement**: Summary screen must have text input area, AI summary display, copy-to-clipboard, and reflection CTA.  
**Priority**: P0  

**Scenarios**:

**Scenario 14.1 — Text input area**  
Given: Summary screen loads  
When: Input section renders  
Then: Multiline TextInput inside GlassCard, placeholder "Pega aquí el contenido de tus lecturas...", theme-aware colors, minHeight 120

**Scenario 14.2 — Generate button**  
Given: User has entered text  
When: "Generar Resumen Crítico" button is visible  
Then: Full-width AppButton (primary variant) with Wand2 icon, disabled when input is empty

**Scenario 14.3 — Loading state**  
Given: User taps generate  
When: AI processes (mock delay)  
Then: Button shows ActivityIndicator, input is disabled

**Scenario 14.4 — Summary display**  
Given: AI returns summary  
When: Summary section renders  
Then: GlassCard with accent border, "Resumen Generado" header with Lightbulb icon, summary text in paragraphs, entry animation (fade + slide up)

**Scenario 14.5 — Copy to clipboard**  
Given: Summary is displayed  
When: User taps copy icon  
Then: Summary text copies to clipboard, icon changes to Check for 2 seconds

**Scenario 14.6 — Reflection CTA**  
Given: Summary is displayed  
When: Bottom of summary card  
Then: Dashed-border card with "Para tu reflexión" label and a thought-provoking question

**Scenario 14.7 — Mock AI hook**  
Given: Generate action triggers  
When: `useMockSummary(text)` hook is called  
Then: Returns fixture summary after 1500ms delay, no real API call

---

### REQ-15: LearningPath (Learning Path) Screen

**ID**: REQ-15  
**Requirement**: LearningPath screen must have topic input, AI path generation, step timeline with completion tracking.  
**Priority**: P0  

**Scenarios**:

**Scenario 15.1 — Topic input**  
Given: No path is generated yet  
When: Screen renders  
Then: GlassCard with TextInput and "Trazar" button, info callout about AI path generation

**Scenario 15.2 — Generate path**  
Given: User enters topic and taps "Trazar"  
When: `useMockLearningPath(topic)` is called  
Then: Loading spinner on button, then path data appears after 2000ms mock delay

**Scenario 15.3 — Path header**  
Given: Path is generated  
When: Header renders  
Then: Path title (AppText smallTitle), description, "Nueva" button to reset

**Scenario 15.4 — Step timeline**  
Given: Path has steps  
When: Timeline renders  
Then: Vertical line connecting numbered step nodes (48x48 rounded squares), each with GlassCard containing title, description, and practical activity

**Scenario 15.5 — Step completion toggle**  
Given: User taps a step's number node  
When: Toggle fires  
Then: Node fills with `primary` color, shows CheckCircle2 icon, card opacity reduces to 0.6, strikethrough on title

**Scenario 15.6 — Entry animations**  
Given: Path renders with multiple steps  
When: Steps appear  
Then: Each step animates in with staggered delay (index * 100ms), opacity + translateX

**Scenario 15.7 — Mock AI hook**  
Given: Generate action triggers  
When: `useMockLearningPath(topic)` is called  
Then: Returns fixture data with 4-6 steps specific to the topic, delayed 2000ms

---

### REQ-16: ChatTutor (Tutor) Screen

**ID**: REQ-16  
**Requirement**: Tutor screen must provide chat interface with message bubbles, typing indicator, and input bar.  
**Priority**: P0  

**Scenarios**:

**Scenario 16.1 — Chat header**  
Given: Tutor screen loads  
When: Header renders  
Then: Green-accented header with Bot icon, "Tutor Socrático" title, green pulse dot with "Activo" label, Sparkles icon

**Scenario 16.2 — Initial message**  
Given: Chat initializes  
When: First render  
Then: Model bubble with welcome message: "¡Hola! Soy tu tutor personal..."

**Scenario 16.3 — Message list**  
Given: Chat has messages  
When: Messages render  
Then: Scrollable list of ChatBubble components (REQ-06), user messages right-aligned, model messages left-aligned

**Scenario 16.4 — Send message**  
Given: User types and taps send  
When: Message sends  
Then: User bubble appears immediately, input clears, TypingIndicator (REQ-07) shows

**Scenario 16.5 — Mock AI response**  
Given: User message is sent  
When: 2000ms passes  
Then: TypingIndicator disappears, model ChatBubble appears with fixture response

**Scenario 16.6 — Input bar**  
Given: Chat renders  
When: Bottom input section  
Then: TextInput with theme colors, send IconButton (primary variant), disabled when input empty or loading

**Scenario 16.7 — Auto-scroll**  
Given: New message appears  
When: Message list updates  
Then: ScrollView auto-scrolls to bottom with animation

**Scenario 16.8 — Mock chat hook**  
Given: User sends message  
When: `useMockChat(message, history)` is called  
Then: Returns fixture response after 2000ms delay, maintains conversation context

---

## Cross-Cutting Requirements

### REQ-17: Light/Dark Mode Support

**ID**: REQ-17  
**Requirement**: All screens and components must support light/dark mode via `useThemeColors`. No hardcoded colors except semantic reds/greens for danger/success.  
**Priority**: P0  

**Scenarios**:

**Scenario 17.1 — System theme following**  
Given: System color scheme changes from light to dark  
When: All screens are visible  
Then: Colors update reactively — backgrounds, text, borders all switch to dark theme values

**Scenario 17.2 — StatusBar adaptation**  
Given: Screen renders in light mode  
When: StatusBar is visible  
Then: StatusBar style is "dark" (dark content on light bg). In dark mode: "light"

**Scenario 17.3 — AppContainer integration**  
Given: AppContainer wraps each screen  
When: Screen renders  
Then: SafeAreaView background is `background` color from theme

**Scenario 17.4 — No hardcoded grays**  
Given: Any component uses a gray color  
When: Code is inspected  
Then: Gray is derived from `textMuted` or `border` theme tokens, never `#gray` literals (except semantic colors)

---

### REQ-18: Mock AI Hooks

**ID**: REQ-18  
**Requirement**: AI features must use mock hooks returning fixture data. No real API calls in this phase.  
**Priority**: P0  

**Scenarios**:

**Scenario 18.1 — useMockSummary hook**  
Given: `useMockSummary(inputText)` is called  
When: Hook executes  
Then: Returns `{ summary: string, isLoading: boolean, generate: () => void }` with fixture summary after 1500ms

**Scenario 18.2 — useMockLearningPath hook**  
Given: `useMockLearningPath(topic)` is called  
When: Hook executes  
Then: Returns `{ path: PathData | null, isLoading: boolean, generate: () => void }` with topic-relevant fixture after 2000ms

**Scenario 18.3 — useMockChat hook**  
Given: `useMockChat(message, history)` is called  
When: Hook executes  
Then: Returns `{ response: string, isLoading: boolean, send: () => void }` with contextual fixture after 2000ms

**Scenario 18.4 — Hook location**  
Given: Mock hooks are created  
When: File structure is organized  
Then: All hooks live in `src/shared/hooks/` with filenames `useMockSummary.ts`, `useMockLearningPath.ts`, `useMockChat.ts`

**Scenario 18.5 — Hook interface stability**  
Given: Mock hooks have defined interfaces  
When: Real AI integration is implemented later  
Then: Hook signatures are identical — only internal implementation changes

---

### REQ-19: Consistent Spacing & Padding

**ID**: REQ-19  
**Requirement**: All screens and components must use consistent spacing values from a defined scale.  
**Priority**: P1  

**Spacing Scale**:
- `xs`: 4px
- `sm`: 8px
- `md`: 12px
- `lg`: 16px
- `xl`: 20px
- `2xl`: 24px
- `3xl`: 32px
- `4xl`: 40px

**Scenarios**:

**Scenario 19.1 — Screen padding**  
Given: Any screen renders  
When: Content area is measured  
Then: Horizontal padding is 20px (xl), vertical padding from SafeAreaView is 20px

**Scenario 19.2 — Section spacing**  
Given: Screen has multiple sections  
When: Sections stack vertically  
Then: Gap between sections is 24px (2xl)

**Scenario 19.3 — Card internal padding**  
Given: GlassCard or similar container renders  
When: Internal content is measured  
Then: Padding is 16px (lg) on all sides

**Scenario 19.4 — Component gaps**  
Given: Elements within a component have gaps (icon + text, etc.)  
When: Layout is measured  
Then: Gap is 8px (sm) or 12px (md) depending on context

---

## File Structure

```
ico-app/src/
├── config/
│   └── theme.config.ts                    [existing — no changes]
├── presentation/
│   ├── components/
│   │   └── ui/
│   │       ├── typography/
│   │       │   └── AppText.tsx            [modify — add useThemeColors, muted prop]
│   │       ├── buttons/
│   │       │   ├── AppButton.tsx          [modify — add variant prop, useThemeColors]
│   │       │   └── IconButton.tsx         [new — REQ-08]
│   │       ├── inputs/
│   │       │   └── AppInput.tsx           [modify — useThemeColors]
│   │       ├── layout/
│   │       │   ├── AppContainer.tsx        [modify — theme background]
│   │       │   └── GlassCard.tsx           [new — REQ-04]
│   │       ├── chat/
│   │       │   ├── ChatBubble.tsx          [new — REQ-06]
│   │       │   └── TypingIndicator.tsx     [new — REQ-07]
│   │       └── feedback/
│   │           └── ProgressBar.tsx         [new — REQ-05]
│   ├── hooks/
│   │   └── useThemeColors.ts              [existing — no changes]
│   ├── navigation/
│   │   └── (protected)/(tabs)/
│   │       └── _layout.tsx                [modify — REQ-09 tab config]
│   └── screens/
│       ├── auth/sign-in/
│       │   └── LoginForm.tsx              [rewrite — REQ-10]
│       ├── shared/
│       │   └── Maintenance.tsx            [rewrite — REQ-11]
│       └── protected/tabs/
│           ├── Home.tsx                   [rewrite — REQ-12]
│           ├── Plan.tsx                   [rewrite — REQ-13]
│           ├── Summary.tsx                [rewrite — REQ-14]
│           ├── LearningPath.tsx           [rewrite — REQ-15]
│           └── Tutor.tsx                  [rewrite — REQ-16]
└── shared/
    └── hooks/
        ├── useMockSummary.ts              [new — REQ-18]
        ├── useMockLearningPath.ts         [new — REQ-18]
        └── useMockChat.ts                 [new — REQ-18]
```

---

## Requirement Traceability Matrix

| Requirement | Component/Screen | Phase | Priority | Dependencies |
|-------------|-----------------|-------|----------|--------------|
| REQ-01 | AppText | 1 | P0 | useThemeColors |
| REQ-02 | AppButton | 1 | P0 | useThemeColors |
| REQ-03 | AppInput | 1 | P0 | useThemeColors |
| REQ-04 | GlassCard | 1 | P0 | useThemeColors |
| REQ-05 | ProgressBar | 1 | P0 | useThemeColors, reanimated |
| REQ-06 | ChatBubble | 1 | P0 | useThemeColors, reanimated |
| REQ-07 | TypingIndicator | 1 | P0 | useThemeColors, reanimated |
| REQ-08 | IconButton | 1 | P1 | useThemeColors |
| REQ-09 | Tab Layout | 1 | P0 | theme colors, Ionicons |
| REQ-10 | LoginForm | 2 | P0 | REQ-02, REQ-04 |
| REQ-11 | Maintenance | 2 | P0 | REQ-01, REQ-02 |
| REQ-12 | Home | 2 | P0 | REQ-01, REQ-04, REQ-05, REQ-08 |
| REQ-13 | Plan | 2 | P0 | REQ-01, REQ-04, REQ-08 |
| REQ-14 | Summary | 2 | P0 | REQ-01, REQ-02, REQ-03, REQ-04, REQ-18 |
| REQ-15 | LearningPath | 2 | P0 | REQ-01, REQ-02, REQ-04, REQ-18 |
| REQ-16 | Tutor | 2 | P0 | REQ-01, REQ-03, REQ-06, REQ-07, REQ-08, REQ-18 |
| REQ-17 | All | Cross | P0 | useThemeColors |
| REQ-18 | Hooks | Cross | P0 | — |
| REQ-19 | All | Cross | P1 | — |

---

## Open Questions

1. **Font family**: Current AppText uses "Roboto". Do we want a distinctive font for this app? (Recommend: Inter for body, Space Grotesk for headings)
2. **Reanimated dependency**: Is `react-native-reanimated` already installed? Required for REQ-05, REQ-06, REQ-07
3. **Icon library**: Current project uses `@expo/vector-icons/FontAwesome5`. Tabs need Ionicons. Are both installed?
4. **Auth providers**: Apple/Google auth buttons are UI-only in this phase. Actual auth integration is separate scope.
5. **Pomodoro timer**: The "Iniciar Timer" CTA in Plan screen — should it navigate to a timer screen or is it a future feature?

---

## Dependencies & Assumptions

**Required packages** (verify installed):
- `react-native-reanimated` — for animations (REQ-05, REQ-06, REQ-07)
- `@expo/vector-icons` — for Ionicons in tabs (REQ-09)
- `react-native-safe-area-context` — already used by AppContainer

**Assumptions**:
- Expo Router v2+ with file-based routing
- `useThemeColors` hook remains unchanged
- `theme.config.ts` structure remains unchanged
- Existing `AppText`, `AppButton`, `AppInput` interfaces are extended, not replaced
