import { useState, type ReactNode } from "react";
import { FiTrash2 } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { formatDate } from "../../../shared/lib/date";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { readDemoDraft, clearDemoDraft } from "./useListingDraft";
import { getListingDraft } from "./api/listingDrafts.api";
import {
  useListingDrafts,
  useDeleteListingDraft,
} from "./api/useListingDrafts";
import type { ListingDraft } from "./listBusiness.data";
import styles from "./SavedDraftsPanel.module.css";

/** What a resume click hands back to the wizard: the draft, the step to land
 *  on, and (live only) the server row id so autosave keeps upserting it. */
export interface ResumeTarget {
  draft: ListingDraft;
  step: number;
  id?: string;
}

const UPDATED_AT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
};

/** Panel shell — a titled card wrapping the mode-specific rows. Renders nothing
 *  when there are no drafts, so the landing stays clean for first-time authors. */
function PanelShell({
  count,
  children,
}: {
  count: number;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className={`${styles.panel} wrap`}>
      <div className={styles.head}>
        <span className={styles.title}>
          {t("marketing:listBusiness.drafts.title")}
        </span>
        <span className={styles.count}>
          {t("marketing:listBusiness.drafts.count", { count })}
        </span>
      </div>
      <div className={styles.list}>{children}</div>
    </div>
  );
}

/** One draft row: name + updated-at, with resume + delete. */
function DraftRow({
  name,
  updatedLabel,
  busy,
  onResume,
  onDelete,
}: {
  name: string;
  updatedLabel: string;
  busy: boolean;
  onResume: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const displayName =
    name.trim() || t("marketing:listBusiness.drafts.untitled");
  return (
    <div className={styles.row}>
      <div className={styles.rowBody}>
        <div className={styles.rowName}>{displayName}</div>
        <div className={styles.rowMeta}>
          {t("marketing:listBusiness.drafts.updated", { when: updatedLabel })}
        </div>
      </div>
      <div className={styles.rowActions}>
        <Button variant="ghost" onClick={onDelete} disabled={busy}>
          <FiTrash2 size={15} aria-hidden />
          <span className="visuallyHidden">
            {t("marketing:listBusiness.drafts.delete")}
          </span>
        </Button>
        <Button variant="primary" onClick={onResume} disabled={busy}>
          {busy
            ? t("marketing:listBusiness.drafts.resuming")
            : t("marketing:listBusiness.drafts.resume")}
        </Button>
      </div>
    </div>
  );
}

/** Demo: the single localStorage draft, if any. */
function DemoDraftPanel({
  onResume,
}: {
  onResume: (target: ResumeTarget) => void;
}) {
  const [snapshot, setSnapshot] = useState(() => readDemoDraft());
  if (!snapshot) return null;
  return (
    <PanelShell count={1}>
      <DraftRow
        name={snapshot.draft.name}
        updatedLabel={formatDate(
          snapshot.savedAt,
          undefined,
          UPDATED_AT_OPTIONS,
        )}
        busy={false}
        onResume={() =>
          onResume({ draft: snapshot.draft, step: snapshot.step })
        }
        onDelete={() => {
          clearDemoDraft();
          setSnapshot(null);
        }}
      />
    </PanelShell>
  );
}

/** Live: the member's cross-device drafts. */
function LiveDraftsPanel({
  onResume,
}: {
  onResume: (target: ResumeTarget) => void;
}) {
  const { t } = useTranslation();
  const { data: drafts, error } = useListingDrafts();
  const removeDraft = useDeleteListingDraft();
  const [resumingId, setResumingId] = useState<string | null>(null);

  if (error)
    return (
      <PanelShell count={0}>
        <p className={styles.error}>
          {t("marketing:listBusiness.drafts.loadError")}
        </p>
      </PanelShell>
    );
  if (!drafts?.length) return null;

  const resume = async (id: string) => {
    setResumingId(id);
    try {
      const record = await getListingDraft(id);
      onResume({ draft: record.payload.draft, step: record.payload.step, id });
    } catch {
      setResumingId(null);
    }
  };

  return (
    <PanelShell count={drafts.length}>
      {drafts.map((draftSummary) => (
        <DraftRow
          key={draftSummary.id}
          name={draftSummary.name}
          updatedLabel={formatDate(
            draftSummary.updatedAt,
            undefined,
            UPDATED_AT_OPTIONS,
          )}
          busy={resumingId === draftSummary.id || removeDraft.isPending}
          onResume={() => void resume(draftSummary.id)}
          onDelete={() => removeDraft.mutate(draftSummary.id)}
        />
      ))}
    </PanelShell>
  );
}

/**
 * "Pick up a saved draft" panel for the wizard landing. Dual-mode: demo shows
 * the single localStorage draft; live shows the member's cross-device server
 * drafts. Resuming hands the full draft + step (+ live id) back to the page,
 * which remounts the wizard seeded with it.
 */
export function SavedDraftsPanel({
  onResume,
}: {
  onResume: (target: ResumeTarget) => void;
}) {
  const { demoMode } = useDemoMode();
  return demoMode ? (
    <DemoDraftPanel onResume={onResume} />
  ) : (
    <LiveDraftsPanel onResume={onResume} />
  );
}
