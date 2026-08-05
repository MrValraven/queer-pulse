import { useQuery } from "@tanstack/react-query";
import type { IconType } from "react-icons";
import {
  FiBookOpen,
  FiEye,
  FiLock,
  FiMessageCircle,
  FiSlash,
} from "react-icons/fi";
import { MdAccessible } from "react-icons/md";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getGovernanceOverview,
  type GovernanceOverviewResponseDTO,
} from "./governance.api";

// ── View model ──────────────────────────────────────────────────────────────
// The section components render this directly. Both demo and live converge on
// it, so the short-key → full-i18n-key reconstruction, the icon-string → icon
// component mapping, and the tint → {bg,color} mapping all live here (the one
// adapter), never in the components.

export interface HealthStatView {
  value: string;
  up: boolean;
  labelKey: string;
  trendKey: string;
  trendValues?: { count: number };
}
export interface ModerationStepView {
  titleKey: string;
  textKey: string;
}
export interface CouncilSeatView {
  name: string;
  initials: string;
  roleKey: string;
  background: string;
  color: string;
}
export interface PrincipleView {
  icon: IconType;
  titleKey: string;
  textKey: string;
}
export interface DecisionView {
  leadKey: string;
  bodyKey: string;
}

export interface GovernanceOverviewResult {
  health: HealthStatView[];
  moderationSteps: ModerationStepView[];
  council: CouncilSeatView[];
  principles: PrincipleView[];
  decisions: DecisionView[];
  /** True while the initial live fetch is in flight (demo resolves instantly). */
  loading: boolean;
  /** True when the live fetch failed — sections render a retry state, not a
   *  silently-empty grid. Always false in demo (mocks never reject). */
  error: boolean;
  /** Refetch the overview after an error (wired to the retry affordance). */
  retry: () => void;
}

// Icon-key → react-icon, mirroring `governance.data.ts`'s `PRINCIPLES` icons.
const ICON_BY_KEY: Record<string, IconType> = {
  lock: FiLock,
  eye: FiEye,
  slash: FiSlash,
  message: FiMessageCircle,
  book: FiBookOpen,
  accessible: MdAccessible,
};

// Tint-key → avatar `{background,color}`, mirroring `COUNCIL`'s inline palette.
const TINT_BY_KEY = {
  jade: { background: "rgba(74,140,111,.15)", color: "var(--jade)" },
  violet: { background: "rgba(122,82,184,.12)", color: "var(--violet)" },
  plum: { background: "rgba(45,27,61,.1)", color: "var(--plum)" },
} satisfies Record<string, { background: string; color: string }>;

// Demo mode reshapes the page's own mocks (which already carry full i18n keys,
// icon components, and inline colours) into the view model — byte-for-byte the
// same demo experience, no network. The `governance.data` mock is imported on
// demand inside the demo queryFn (see below) so it never ships in the live
// bundle.
async function buildDemo(): Promise<Omit<GovernanceOverviewResult, "loading" | "error" | "retry">> {
  const { COUNCIL, DECISIONS, HEALTH, PRINCIPLES, STEPS } = await import(
    "../governance.data"
  );
  return {
    health: HEALTH.map((stat) => ({
      value: stat.value,
      up: stat.up,
      labelKey: stat.labelKey,
      trendKey: stat.trendKey,
      trendValues: stat.trendValues,
    })),
    moderationSteps: STEPS.map((step) => ({
      titleKey: step.titleKey,
      textKey: step.textKey,
    })),
    council: COUNCIL.map((seat) => ({
      name: seat.name,
      initials: seat.initials,
      roleKey: seat.roleKey,
      background: seat.background,
      color: seat.color,
    })),
    principles: PRINCIPLES.map((principle) => ({
      icon: principle.icon,
      titleKey: principle.titleKey,
      textKey: principle.textKey,
    })),
    decisions: DECISIONS.map((decision) => ({
      leadKey: decision.leadKey,
      bodyKey: decision.bodyKey,
    })),
  };
}

const EMPTY: Omit<GovernanceOverviewResult, "loading" | "error" | "retry"> = {
  health: [],
  moderationSteps: [],
  council: [],
  principles: [],
  decisions: [],
};

// Live mode serves SHORT i18n keys; rebuild the full `governance:*` keys the
// components pass to `t()`. Keeping this in one place matches the memory note
// that ``t(`ns:${key}`)`` needs a bare key (no prefix) on the stored side.
function fromDto(
  dto: GovernanceOverviewResponseDTO,
): Omit<GovernanceOverviewResult, "loading" | "error" | "retry"> {
  return {
    health: dto.health.map((stat) => ({
      value: stat.n,
      up: stat.up,
      labelKey: `governance:health.stat.${stat.key}.label`,
      trendKey: `governance:health.trend.${stat.trendKey}`,
      trendValues:
        stat.trendCount === undefined ? undefined : { count: stat.trendCount },
    })),
    moderationSteps: dto.moderationSteps.map((step) => ({
      titleKey: `governance:steps.${step.key}.title`,
      textKey: `governance:steps.${step.key}.text`,
    })),
    council: dto.council.map((seat) => ({
      name: seat.name,
      initials: seat.initials,
      roleKey: `governance:council.${seat.roleKey}`,
      ...(TINT_BY_KEY[seat.tint] ?? TINT_BY_KEY.plum),
    })),
    principles: dto.principles.map((principle) => ({
      icon: ICON_BY_KEY[principle.icon] ?? FiLock,
      titleKey: `governance:principles.${principle.key}.title`,
      textKey: `governance:principles.${principle.key}.text`,
    })),
    decisions: dto.decisions.map((decision) => ({
      leadKey: `governance:decisions.${decision.key}.lead`,
      bodyKey: `governance:decisions.${decision.key}.body`,
    })),
  };
}

/**
 * Data source for the Governance page's non-financial sections (health,
 * moderation, council, principles, decisions). Demo returns the page's own
 * mocks; live calls `GET /governance/overview` once (mirrors
 * `useGovernanceFinances`'s demo/live split).
 */
export function useGovernanceOverview(): GovernanceOverviewResult {
  const { demoMode } = useDemoMode();

  const query = useQuery<Omit<GovernanceOverviewResult, "loading" | "error" | "retry">>({
    queryKey: ["governance-overview", demoMode],
    queryFn: async () =>
      demoMode ? buildDemo() : fromDto(await getGovernanceOverview()),
  });

  const retry = () => {
    void query.refetch();
  };

  if (!query.data) {
    return {
      ...EMPTY,
      loading: query.isPending,
      error: query.isError,
      retry,
    };
  }

  return { ...query.data, loading: false, error: false, retry };
}
