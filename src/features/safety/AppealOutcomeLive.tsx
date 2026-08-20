import { FiAlertCircle, FiFileText } from "react-icons/fi";
import { EmptyState, SkeletonLine, type DetailRow } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { routes } from "../../app/routeMap";
import { useMyAppeals } from "./api/useMyAppeals";
import type { MemberAppealDTO } from "./api/appeals.api";
import { AppealResultPanel } from "./AppealPanels";
import { buildAppealResultConfigs, type AppealTone } from "./appealPanels.data";
import s from "./flows.module.css";

/** Backend `AppealStatus` → the tone the shared result panel renders. */
const STATUS_TO_TONE: Record<MemberAppealDTO["status"], AppealTone> = {
  awaiting: "pending",
  overturned: "overturned",
  upheld: "upheld",
};

/** Mirrors the panel's card shape while the real fetch is in flight, so
 *  there's no layout shift once it resolves. */
function AppealLoadingSkeleton() {
  return (
    <div className={`${s.card} ${s.center}`} aria-busy="true">
      <SkeletonLine
        width={52}
        height={52}
        style={{ borderRadius: "50%", margin: "0 auto" }}
      />
      <SkeletonLine
        width="60%"
        height={22}
        style={{ margin: "18px auto 0" }}
      />
      <SkeletonLine width="80%" height={14} style={{ margin: "10px auto 0" }} />
    </div>
  );
}

/**
 * The real reference rows for the member's own appeal — a truncated id (the
 * full UUID is not something a member needs to read in full) and the actual
 * filing date, plus the tone-appropriate outcome value once decided. No
 * invented "expected response" or "decided on" date: the appeal entity has no
 * SLA/decided-at column, so this only ever shows facts that actually exist.
 */
function buildLiveRefRows(
  appeal: MemberAppealDTO,
  tone: AppealTone,
  t: ReturnType<typeof useTranslation>["t"],
  fmt: ReturnType<typeof useFormat>,
): DetailRow[] {
  const rows: DetailRow[] = [
    {
      label: t("safety:appeal.ref.label"),
      value: appeal.id.slice(0, 8).toUpperCase(),
    },
    {
      label: t("safety:appeal.pending.submittedLabel"),
      value: fmt.date(new Date(appeal.createdAt)),
    },
  ];
  if (tone === "overturned") {
    rows.push({
      label: t("safety:appeal.decisionLabel"),
      value: t("safety:appeal.overturned.decisionValue"),
    });
  } else if (tone === "upheld") {
    rows.push({
      label: t("safety:appeal.upheld.outcomeLabel"),
      value: t("safety:appeal.upheld.outcomeValue"),
    });
  }
  // `decision` degrades to the literal 'uphold'/'overturn' when the reviewing
  // moderator left no free-text note (`ModerationService.reviewAppeal`:
  // `dto.note ?? dto.decision`) — that's redundant with the outcome row
  // above, so only surface it when it reads like an actual note.
  if (
    appeal.decision &&
    appeal.decision !== "uphold" &&
    appeal.decision !== "overturn"
  ) {
    rows.push({
      label: t("safety:appeal.live.decisionNoteLabel"),
      value: appeal.decision,
    });
  }
  return rows;
}

/**
 * Live-mode appeal outcome: the member's most recent real appeal from
 * `GET /appeals/me`, rendered through the same `AppealResultPanel` +
 * `buildAppealResultConfigs` machinery the demo toggle uses — only the
 * reference rows are swapped for the appeal's real id/date/outcome, so the
 * panel never shows the mock reference or invented dates. Handles loading,
 * a failed fetch, and "no appeals filed" as its own honest states.
 */
export function AppealOutcomeLive() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { appeals, isLoading, isError } = useMyAppeals();

  if (isLoading) return <AppealLoadingSkeleton />;

  if (isError) {
    return (
      <EmptyState
        icon={<FiAlertCircle />}
        title={t("safety:appeal.live.error.title")}
        description={t("safety:appeal.live.error.desc")}
      />
    );
  }

  const latest = appeals[0];
  if (!latest) {
    return (
      <EmptyState
        icon={<FiFileText />}
        title={t("safety:appeal.live.empty.title")}
        description={t("safety:appeal.live.empty.desc")}
        action={{
          label: t("safety:appeal.live.empty.cta"),
          to: routes.appealSubmit,
        }}
      />
    );
  }

  const tone = STATUS_TO_TONE[latest.status];
  const config = buildAppealResultConfigs(t, fmt)[tone];
  const liveConfig = {
    ...config,
    refRows: buildLiveRefRows(latest, tone, t, fmt),
  };

  return <AppealResultPanel config={liveConfig} />;
}
