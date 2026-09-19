import { useCallback, useRef } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from "react-native";
import { Check, Crown, Sparkles, Zap } from "lucide-react-native";
import type { SubscriptionPlan } from "../../../../domain/entities/catalog.entity";
import {
  annualDiscountLabel,
  buildPlanBenefits,
  formatPlanPrice,
  monthlyEquivalentLabel,
  planHighlightLabel,
} from "../../../utils/subscription-plan.utils";
import { useThemeColors } from "../../../hooks/useThemeColors";
import AppText from "../typography/AppText";
import GlassCard from "../cards/GlassCard";
import QuotaRenewalChip from "./QuotaRenewalChip";

interface PlanCarouselProps {
  plans: SubscriptionPlan[];
  selectedPlanCode: string | null;
  onSelectPlan: (code: string) => void;
  billing: "monthly" | "annual";
  activePlanCode?: string | null;
  quotaRenewsAt?: string | null;
}

const CARD_GAP = 12;

function PlanIcon({ plan, color }: { plan: SubscriptionPlan; color: string }) {
  if (plan.isUnlimited) return <Crown size={22} color={color} />;
  if (plan.code === "pro") return <Zap size={22} color={color} />;
  return <Sparkles size={22} color={color} />;
}

export default function PlanCarousel({
  plans,
  selectedPlanCode,
  onSelectPlan,
  billing,
  activePlanCode = null,
  quotaRenewsAt = null,
}: PlanCarouselProps) {
  const theme = useThemeColors();
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = screenWidth - 40;
  const listRef = useRef<FlatList<SubscriptionPlan>>(null);

  const selectedIndex = Math.max(
    0,
    plans.findIndex((p) => p.code === selectedPlanCode),
  );

  const scrollToIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= plans.length) return;
      listRef.current?.scrollToIndex({ index, animated: true });
      const plan = plans[index];
      if (plan) onSelectPlan(plan.code);
    },
    [onSelectPlan, plans],
  );

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / (cardWidth + CARD_GAP));
    const plan = plans[index];
    if (plan && plan.code !== selectedPlanCode) {
      onSelectPlan(plan.code);
    }
  };

  const renderPlanCard = ({ item: plan }: { item: SubscriptionPlan }) => {
    const benefits = buildPlanBenefits(plan).slice(0, 5);
    const highlight = planHighlightLabel(plan);
    const price =
      billing === "annual"
        ? formatPlanPrice(plan.priceAnnual)
        : formatPlanPrice(plan.priceMonthly);
    const priceCaption =
      billing === "annual"
        ? monthlyEquivalentLabel(plan.priceAnnual) ?? "facturado al año"
        : "por mes";
    const discount = annualDiscountLabel(plan.priceMonthly, plan.priceAnnual);
    const isSelected = plan.code === selectedPlanCode;

    return (
      <Pressable
        onPress={() => onSelectPlan(plan.code)}
        style={({ pressed }) => [
          s.cardWrap,
          { width: cardWidth, opacity: pressed ? 0.96 : 1 },
        ]}
      >
        <GlassCard
          padding={0}
          style={[
            s.card,
            {
              borderColor: isSelected ? theme.primary : theme.border,
              borderWidth: isSelected ? 2 : StyleSheet.hairlineWidth,
            },
          ]}
        >
          <View style={[s.cardHeader, { backgroundColor: `${theme.primary}12` }]}>
            <View style={[s.iconWrap, { backgroundColor: `${theme.primary}20` }]}>
              <PlanIcon plan={plan} color={theme.primary} />
            </View>
            <View style={s.headerText}>
              <AppText variant="smallTitle" weight="700">
                {plan.label}
              </AppText>
              <AppText variant="verySmall" muted>
                {plan.isUnlimited ? "Acceso total sin límites" : "Plan con cupos ampliados"}
              </AppText>
            </View>
            {highlight ? (
              <View style={[s.badge, { backgroundColor: theme.primary }]}>
                <AppText variant="verySmall" color="#FFFFFF" weight="700">
                  {highlight}
                </AppText>
              </View>
            ) : null}
          </View>

          <View style={s.priceBlock}>
            <AppText variant="title" weight="700" color={theme.primary}>
              {price}
            </AppText>
            <AppText variant="verySmall" muted>
              {priceCaption}
            </AppText>
            {billing === "annual" && discount ? (
              <AppText variant="verySmall" color={theme.success} weight="700">
                Ahorra {discount} vs mensual
              </AppText>
            ) : null}
          </View>

          <View style={s.chipWrap}>
            <QuotaRenewalChip
              plan={plan}
              isActivePlan={activePlanCode === plan.code}
              quotaRenewsAt={quotaRenewsAt}
              nested
            />
          </View>

          <View style={s.benefits}>
            {benefits.map((benefit) => (
              <View key={benefit} style={s.benefitRow}>
                <View style={[s.check, { backgroundColor: theme.primaryLight }]}>
                  <Check size={12} color={theme.primary} strokeWidth={3} />
                </View>
                <AppText variant="smallParagraph" style={s.benefitText}>
                  {benefit}
                </AppText>
              </View>
            ))}
          </View>
        </GlassCard>
      </Pressable>
    );
  };

  if (plans.length === 0) return null;

  return (
    <View style={s.wrap}>
      <FlatList
        ref={listRef}
        data={plans}
        keyExtractor={(item) => item.code}
        renderItem={renderPlanCard}
        horizontal
        pagingEnabled={false}
        snapToInterval={cardWidth + CARD_GAP}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.listContent}
        ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: cardWidth + CARD_GAP,
          offset: (cardWidth + CARD_GAP) * index,
          index,
        })}
        initialScrollIndex={selectedIndex > 0 ? selectedIndex : undefined}
        onScrollToIndexFailed={() => {
          setTimeout(() => scrollToIndex(selectedIndex), 100);
        }}
      />

      {plans.length > 1 ? (
        <View style={s.dots}>
          {plans.map((plan, index) => {
            const active = plan.code === selectedPlanCode;
            return (
              <Pressable
                key={plan.code}
                onPress={() => scrollToIndex(index)}
                style={[
                  s.dot,
                  {
                    backgroundColor: active ? theme.primary : theme.border,
                    width: active ? 18 : 7,
                  },
                ]}
                accessibilityLabel={`Plan ${plan.label}`}
              />
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 12 },
  listContent: {
    paddingHorizontal: 20,
  },
  cardWrap: {},
  card: {
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: { flex: 1, gap: 2 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  priceBlock: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
    gap: 2,
  },
  chipWrap: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  benefits: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  benefitText: { flex: 1 },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    height: 7,
    borderRadius: 999,
  },
});
