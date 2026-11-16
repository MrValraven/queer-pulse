import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import {
  Button,
  Collapse,
  CollapseListItem,
  ConfirmDialog,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ContinueDraftCard, type ContinueDraftItem } from "./ContinueDraftCard";
import page from "./ListBusinessPage.module.css";
import styles from "./ContinueDraftsScreen.module.css";

export type { ContinueDraftItem } from "./ContinueDraftCard";

/** What the footer button does. Live lists another business beside the saved
 *  drafts. Demo keeps a single draft slot, so starting over deletes it first
 *  and says so. */
export type StartOverAction = "startAnother" | "deleteAndStartOver";

export interface ContinueDraftsScreenProps {
  /** Newest first. The first card is the visually primary one. */
  drafts: ContinueDraftItem[];
  /** The draft whose Continue is opening, so its button says so. */
  resumingId: string | null;
  onContinue: (id: string) => void;
  /** Called only after the member confirms the delete. */
  onDelete: (id: string) => void;
  /** "List another business", or (with `deleteAndStartOver`) the confirmed
   *  "Delete and start over". */
  onStartAnother: () => void;
  /** The draft whose delete is in flight; its buttons wait. */
  deletingId?: string | null;
  /** A failed Continue or delete, named by its cause. Null hides the line. */
  errorLine?: string | null;
  /** A polite confirmation such as "Draft deleted". Null hides it. */
  statusLine?: string | null;
  /** Runs once the last card has finished folding away. */
  onAllDraftsGone?: () => void;
  /** Defaults to `startAnother`. */
  startOverAction?: StartOverAction;
}

type PendingConfirm =
  | { kind: "delete"; id: string; name: string }
  | { kind: "startOver"; name: string };

/** The latest non-null value, held while the value goes back to null, so a
 *  line folding away keeps its text until it is gone. */
function useLastNonNull(value: string | null): string | null {
  const [lastValue, setLastValue] = useState(value);
  if (value !== null && value !== lastValue) setLastValue(value);
  return value ?? lastValue;
}

/** Each confirm's copy, by what it confirms: a plain delete, or the demo's
 *  delete and start over. */
const CONFIRM_COPY_KEYS = {
  delete: {
    title: "marketing:listBusiness.drafts.deleteConfirm.title",
    body: "marketing:listBusiness.drafts.deleteConfirm.body",
    confirm: "marketing:listBusiness.drafts.delete",
  },
  startOver: {
    title: "marketing:listBusiness.drafts.startOverConfirm.title",
    body: "marketing:listBusiness.drafts.startOverConfirm.body",
    confirm: "marketing:listBusiness.drafts.deleteAndStartOver",
  },
} as const;

/** "Delete {name}?" with Cancel focused first, since deleting cannot be
 *  undone. A long name is clamped to two lines in the title. */
function DraftDeleteConfirm({
  kind,
  name,
  onConfirm,
  onClose,
}: {
  kind: PendingConfirm["kind"];
  name: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const copyKeys = CONFIRM_COPY_KEYS[kind];
  return (
    <ConfirmDialog
      open
      tone="destructive"
      initialFocus="cancel"
      onClose={onClose}
      onConfirm={onConfirm}
      title={
        <span className={styles.confirmTitle}>
          {t(copyKeys.title, { name })}
        </span>
      }
      description={t(copyKeys.body)}
      confirmLabel={t(copyKeys.confirm)}
      cancelLabel={t("marketing:listBusiness.drafts.deleteConfirm.cancel")}
    />
  );
}

/**
 * Where focus goes after a confirmed delete, so it never drops to the page
 * body when the card it was on folds away: the next card's Continue (the
 * card that slides into the deleted one's place, or the new last card), or
 * the screen title when none remain. A failed delete keeps the card, and
 * focus stays where it is.
 */
function useFocusAfterDelete(
  drafts: ContinueDraftItem[],
  errorLine: string | null,
) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const pendingFocusRef = useRef<{ id: string; index: number } | null>(null);

  useEffect(() => {
    const pendingFocus = pendingFocusRef.current;
    if (!pendingFocus) return;
    const isStillListed = drafts.some((draft) => draft.id === pendingFocus.id);
    if (isStillListed) {
      if (errorLine !== null) pendingFocusRef.current = null;
      return;
    }
    pendingFocusRef.current = null;
    const nextDraft = drafts[Math.min(pendingFocus.index, drafts.length - 1)];
    const nextContinue = nextDraft
      ? sectionRef.current?.querySelector<HTMLElement>(
          `[data-draft-continue="${CSS.escape(nextDraft.id)}"]`,
        )
      : null;
    (nextContinue ?? titleRef.current)?.focus();
  }, [drafts, errorLine]);

  return {
    sectionRef,
    titleRef,
    focusAfterDeleting: (id: string) => {
      pendingFocusRef.current = {
        id,
        index: drafts.findIndex((draft) => draft.id === id),
      };
    },
  };
}

/** Above a fresh wizard when the drafts list failed to load: says so, with
 *  the cause, so a member with drafts knows they were not lost. */
export function DraftsLoadErrorLine({ line }: { line: string }) {
  return (
    <div className="wrap">
      <p className={styles.loadError} role="alert">
        {line}
      </p>
    </div>
  );
}

/**
 * The Continue screen: shown where the wizard would be when a member comes back
 * with unfinished drafts, so carrying on is the obvious move and a second
 * draft is never started by accident. Presentational, apart from the delete
 * confirmation: the page owns the drafts, the resume and the delete.
 */
export function ContinueDraftsScreen({
  drafts,
  resumingId,
  onContinue,
  onDelete,
  onStartAnother,
  deletingId = null,
  errorLine = null,
  statusLine = null,
  onAllDraftsGone,
  startOverAction = "startAnother",
}: ContinueDraftsScreenProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(
    null,
  );
  const shownErrorLine = useLastNonNull(errorLine);
  const shownStatusLine = useLastNonNull(statusLine);
  const isAnyBusy = resumingId !== null || deletingId !== null;
  const nameOf = (draft: ContinueDraftItem) =>
    draft.name.trim() || t("marketing:listBusiness.drafts.untitled");
  const isDeleteAndStartOver = startOverAction === "deleteAndStartOver";
  const [firstDraft] = drafts;
  const { sectionRef, titleRef, focusAfterDeleting } = useFocusAfterDelete(
    drafts,
    errorLine,
  );

  const confirmPending = () => {
    if (pendingConfirm?.kind === "delete") {
      focusAfterDeleting(pendingConfirm.id);
      onDelete(pendingConfirm.id);
    } else if (pendingConfirm?.kind === "startOver") onStartAnother();
    setPendingConfirm(null);
  };

  return (
    <div className="wrap">
      <div className={page.page}>
        <section
          ref={sectionRef}
          className={styles.screen}
          aria-labelledby={titleId}
        >
          <h2
            ref={titleRef}
            id={titleId}
            className={styles.title}
            tabIndex={-1}
          >
            {t("marketing:listBusiness.drafts.title")}
          </h2>
          <Collapse isOpen={errorLine !== null}>
            <p className={styles.error} role="alert">
              {shownErrorLine}
            </p>
          </Collapse>
          <div role="status" aria-live="polite">
            <Collapse isOpen={statusLine !== null}>
              <p className={styles.notice}>{shownStatusLine}</p>
            </Collapse>
          </div>
          <ul className={styles.list}>
            <AnimatePresence
              initial={false}
              onExitComplete={drafts.length === 0 ? onAllDraftsGone : undefined}
            >
              {drafts.map((draft, index) => (
                <CollapseListItem key={draft.id}>
                  <ContinueDraftCard
                    draft={draft}
                    isPrimary={index === 0}
                    isResuming={resumingId === draft.id}
                    isBusy={isAnyBusy}
                    onContinue={() => onContinue(draft.id)}
                    onDelete={() =>
                      setPendingConfirm({
                        kind: "delete",
                        id: draft.id,
                        name: nameOf(draft),
                      })
                    }
                  />
                </CollapseListItem>
              ))}
            </AnimatePresence>
          </ul>
          <div className={styles.after}>
            <Button
              variant="ghost"
              // Off while the last card folds away, just before the wizard.
              disabled={isAnyBusy || drafts.length === 0}
              onClick={() => {
                if (!isDeleteAndStartOver) onStartAnother();
                else if (firstDraft)
                  setPendingConfirm({
                    kind: "startOver",
                    name: nameOf(firstDraft),
                  });
              }}
            >
              {isDeleteAndStartOver ? (
                <FiTrash2 aria-hidden />
              ) : (
                <FiPlus aria-hidden />
              )}{" "}
              {t(
                isDeleteAndStartOver
                  ? "marketing:listBusiness.drafts.deleteAndStartOver"
                  : "marketing:listBusiness.drafts.startAnother",
              )}
            </Button>
            <p className={styles.teamNote}>
              {t("marketing:listBusiness.drafts.teamNote")}
            </p>
          </div>
        </section>
      </div>
      {pendingConfirm && (
        <DraftDeleteConfirm
          kind={pendingConfirm.kind}
          name={pendingConfirm.name}
          onConfirm={confirmPending}
          onClose={() => setPendingConfirm(null)}
        />
      )}
    </div>
  );
}
