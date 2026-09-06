import { FiFileText } from "react-icons/fi";
import {
  EmptyState,
  LoadErrorState,
  SkeletonLine,
  type DetailRow,
} from "../../shared/components/ui";
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
      <SkeletonLine width="60%" height={22} style={{ margin: "18px auto 0" }} />
      <SkeletonLine width="80%" height={14} style={{ margin: "10px auto 0" }} />
    </div>
  );
}

/**
 * Format an API timestamp, or null when there is nothing honest to print.
 *
 * `slaDueAt` and `decidedAt` are real columns on the appeal and reach the
 * client through `MemberAppealDTO`, so on the happy path this always returns a
 * date. It still guards, because `new Date("")` and `new Date(undefined)` both
 * produce an Invalid Date, and `Intl.DateTimeFormat` renders that as the
 * literal string "Invalid Date" on the one page a member reads to find out
 * whether their suspension is being reconsidered. A missing row says less than
 * a wrong one.
 */
function formattedDate(
  value: string | null | undefined,
  fmt: ReturnType<typeof useFormat>,
): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : fmt.date(parsed);
}

/**
 * The real reference rows for the member's own appeal — a truncated id (the
 * full UUID is not something a member needs to read in full), the filing date,
 * the deadline or the decision date, and the tone-appropriate outcome value.
 *
 * The deadline row is the point of this (TS-11, PRD-286). The Code of Conduct
 * §05 publishes a decision window, the backend stamps every appeal with the
 * `slaDueAt` it computes from it, and the API sends that field to the MEMBER
 * for exactly this purpose. It was arriving and going unrendered, so the page
 * said "usually within a few days" and the member had no date to hold the
 * platform to. A member locked out by the decision they are appealing has no
 * other surface to read it from.
 *
 * Nothing here is computed. Every date shown is one the server sent.
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
  const dueDate = formattedDate(appeal.slaDueAt, fmt);
  const decidedDate = formattedDate(appeal.decidedAt, fmt);
  if (tone === "pending") {
    if (dueDate) {
      rows.push({
        label: t("safety:appeal.pending.expectedLabel"),
        value: dueDate,
      });
    }
  } else if (tone === "overturned") {
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
  if (tone !== "pending" && decidedDate) {
    rows.push({
      label: t("safety:appeal.decidedOnLabel"),
      value: decidedDate,
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
  const { appeals, isLoading, isError, refetch } = useMyAppeals();

  if (isLoading) return <AppealLoadingSkeleton />;

  // Checked BEFORE the "no appeals filed" branch below, and with a retry: a
  // member asking whether their appeal was heard must never be told they
  // filed none because the request failed (DES-22).
  if (isError) {
    return (
      <LoadErrorState
        onRetry={refetch}
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
