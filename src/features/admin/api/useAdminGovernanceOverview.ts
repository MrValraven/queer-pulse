import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import type { MemberRefDTO } from "../../../shared/api/refs";
import { useDemoAwareMutation } from "./demoAwareMutation";
import {
  getAdminOverview,
  updateAdminOverview,
  type AdminOverviewResponseDTO,
  type UpdateAdminOverviewBody,
} from "./adminGovernanceOverview.api";

/** `governance.data.ts`'s `PRINCIPLES.icon` stores a resolved `IconType`
 *  component (e.g. `FiLock`), not a string key — this is the reverse of
 *  `useGovernanceOverview.ts`'s `ICON_BY_KEY` map, needed to recover the
 *  short key the admin DTO expects. */
const ICON_BY_KEY: Record<string, IconType> = {
  lock: FiLock,
  eye: FiEye,
  slash: FiSlash,
  message: FiMessageCircle,
  book: FiBookOpen,
  accessible: MdAccessible,
};
function iconKeyFor(icon: IconType): string {
  const entry = Object.entries(ICON_BY_KEY).find(
    ([, component]) => component === icon,
  );
  return entry?.[0] ?? "lock";
}

/**
 * Pulls the short content key back out of a fully-qualified i18n key. Keys
 * follow `governance:<section>.<KEY>.<field>` (health/principles/steps —
 * three segments after the namespace, key is second-to-last) or
 * `governance:<section>.<KEY>` (health trend/council role — key is last).
 */
function keyBeforeSuffix(fullKey: string): string {
  const segments = fullKey.split(".");
  return segments.length >= 3 ? (segments.at(-2) ?? fullKey) : fullKey;
}
function lastSegment(fullKey: string): string {
  return fullKey.split(".").pop() ?? fullKey;
}

/** Demo mode reshapes the public page's own `governance.data` mock into the
 *  admin response shape — same demo content, no network. Every section
 *  starts unedited (`editor: null`); editing flips that section's meta (see
 *  {@link applyOverviewEdits}). Imported on demand so the mock never ships
 *  in the live bundle. */
async function buildDemoAdminOverview(): Promise<AdminOverviewResponseDTO> {
  const { COUNCIL, DECISIONS, HEALTH, PRINCIPLES, STEPS } =
    await import("../../governance/governance.data");

  const emptyMeta = { editor: null, editedAt: null };

  return {
    // `labelKey` is "governance:health.stat.<KEY>.label" — the key sits
    // second-to-last, NOT last (`.pop()` would return "label").
    health: HEALTH.map((stat) => ({
      key: keyBeforeSuffix(stat.labelKey),
      n: stat.value,
      up: stat.up,
      // `trendKey` is "governance:health.trend.<TRENDKEY>" — no trailing
      // field segment, so the key genuinely is the last one here.
      trendKey: lastSegment(stat.trendKey),
      trendCount: stat.trendValues?.count,
    })),
    moderationSteps: STEPS.map((step) => ({
      key: keyBeforeSuffix(step.titleKey),
    })),
    council: COUNCIL.map((seat) => ({
      name: seat.name,
      initials: seat.initials,
      // `roleKey` is "governance:council.<ROLEKEY>" — split on ".", not ":"
      // (the namespace prefix uses a colon, but the path itself is
      // dot-separated, and "governance:council" itself has no dot in it).
      roleKey: lastSegment(seat.roleKey),
      tint:
        seat.color === "var(--jade)"
          ? "jade"
          : seat.color === "var(--violet)"
            ? "violet"
            : "plum",
    })),
    principles: PRINCIPLES.map((principle) => ({
      key: keyBeforeSuffix(principle.titleKey),
      icon: iconKeyFor(principle.icon),
    })),
    decisions: DECISIONS.map((decision) => ({
      key: keyBeforeSuffix(decision.leadKey),
    })),
    meta: {
      health: emptyMeta,
      moderationSteps: emptyMeta,
      council: emptyMeta,
      principles: emptyMeta,
      decisions: emptyMeta,
    },
  };
}

const overviewQueryKey = (demoMode: boolean) =>
  ["admin-governance-overview", demoMode] as const;

const DEMO_EDITOR: MemberRefDTO = {
  slug: "you",
  firstName: "You",
  lastName: "",
  avatarUrl: null,
};

/** Applies an edit body to the cached response — demo mode's source of
 *  truth (live mode replaces the whole payload from the server). Stamps
 *  `meta` only for the sections actually present in the body. */
export function applyOverviewEdits(
  current: AdminOverviewResponseDTO,
  body: UpdateAdminOverviewBody,
  editor: MemberRefDTO,
  editedAt: string,
): AdminOverviewResponseDTO {
  const next: AdminOverviewResponseDTO = {
    ...current,
    meta: { ...current.meta },
  };
  const sectionMeta = { editor, editedAt };

  if (body.health !== undefined) {
    next.health = body.health;
    next.meta.health = sectionMeta;
  }
  if (body.moderationSteps !== undefined) {
    next.moderationSteps = body.moderationSteps;
    next.meta.moderationSteps = sectionMeta;
  }
  if (body.council !== undefined) {
    next.council = body.council;
    next.meta.council = sectionMeta;
  }
  if (body.principles !== undefined) {
    next.principles = body.principles;
    next.meta.principles = sectionMeta;
  }
  if (body.decisions !== undefined) {
    next.decisions = body.decisions;
    next.meta.decisions = sectionMeta;
  }
  return next;
}

export interface AdminGovernanceOverviewResult {
  overview: AdminOverviewResponseDTO | null;
  /** True while the initial live fetch is in flight (demo resolves instantly). */
  loading: boolean;
  /** True when the fetch failed, so the tab can tell an outage apart from a
   *  section that genuinely has no rows yet (DES-22). */
  isError: boolean;
  /** Re-runs the failed fetch; wire to the error state's retry. */
  refetch: () => void;
}

/**
 * Data source for the admin Policy tab. Demo mode reshapes the public page's
 * mocks into the admin response shape; live mode calls
 * `GET /admin/governance/overview` once (mirrors `useAdminGovernanceFinances`).
 */
export function useAdminGovernanceOverview(): AdminGovernanceOverviewResult {
  const { demoMode } = useDemoMode();

  const query = useQuery<AdminOverviewResponseDTO>({
    queryKey: overviewQueryKey(demoMode),
    queryFn: async () =>
      demoMode ? buildDemoAdminOverview() : getAdminOverview(),
  });

  if (!query.data) {
    return {
      overview: null,
      loading: query.isPending,
      isError: query.isError,
      refetch: () => void query.refetch(),
    };
  }
  return {
    overview: query.data,
    loading: false,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}

/**
 * Replaces any subset of the overview sections. Live mode PATCHes
 * `/admin/governance/overview` and reconciles from the server's response.
 * Demo mode applies the edit to the cached payload via
 * {@link applyOverviewEdits} and keeps it there for the session.
 */
export function useUpdateAdminOverview() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const queryKey = overviewQueryKey(demoMode);

  return useDemoAwareMutation<
    AdminOverviewResponseDTO,
    Error,
    UpdateAdminOverviewBody
  >({
    demoMode,
    demoResult: async (body) => {
      const current =
        queryClient.getQueryData<AdminOverviewResponseDTO>(queryKey) ??
        (await buildDemoAdminOverview());
      return applyOverviewEdits(
        current,
        body,
        DEMO_EDITOR,
        new Date().toISOString(),
      );
    },
    live: (body) => updateAdminOverview(body),
    logLabel: "admin.governance.overview.update",
    logContext: (body) => ({
      sections: Object.keys(body).filter((key) => key !== "note"),
    }),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
    },
    onLiveSettled: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });
}
