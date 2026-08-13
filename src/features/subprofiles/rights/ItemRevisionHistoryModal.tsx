import { useState } from "react";
import { FiClock, FiRotateCcw } from "react-icons/fi";
import { Button, Modal } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useToast } from "../../../shared/components/feedback/useToast";
import { formatDate } from "../../../shared/lib/date";
import type { SubprofileSection } from "../api/subprofiles.api";
import type { SubprofileView } from "../api/subprofiles.adapters";
import { PoemBlocksView } from "../poem/PoemBlocksView";
import { normalizePoemBlocks } from "../poem/poemModel";
import {
  useItemRevisionDetail,
  useItemRevisions,
  useRestoreItemRevision,
} from "../api/useItemRevisions";
import styles from "./ItemRevisionHistoryModal.module.css";

export interface ItemRevisionHistoryModalProps {
  subprofileId: string;
  itemId: string;
  section: SubprofileSection;
  onClose: () => void;
  /** Called after a successful restore, instead of `onClose`, if given.
   *  A restore rewrites the item's saved content server-side, which the
   *  caller (`SubprofileItemDrawer`) holds a now-stale local copy of, so the
   *  drawer wires this to close BOTH this modal and itself, rather than
   *  leaving the stale draft on screen after a plain dismiss. Receives the
   *  freshly-refetched persona (`null` in demo mode, see
   *  `useRestoreItemRevision`) so the caller can reseed the open editor's row
   *  state with the restored content before closing. Falls back to `onClose`
   *  for callers with nothing extra to do on restore. */
  onRestored?: (subprofile: SubprofileView | null) => void;
}

/** `snapshot` is a raw `Record<string, unknown>` (whatever shape the item had
 *  at save time), so every read here is guarded: a missing/mistyped field
 *  renders as absent rather than throwing. */
function readSnapshotString(
  snapshot: Record<string, unknown>,
  key: string,
): string {
  const value = snapshot[key];
  return typeof value === "string" ? value : "";
}

function readSnapshotStructured(
  snapshot: Record<string, unknown>,
): Record<string, unknown> | null {
  const structured = snapshot.structured;
  return structured && typeof structured === "object"
    ? (structured as Record<string, unknown>)
    : null;
}

/** True when the snapshot carries a poem body, regardless of `section`: a
 *  belt-and-suspenders check alongside `section === "poems"` per the plan,
 *  since older revisions could in principle predate a section rename. */
function hasPoemStructure(snapshot: Record<string, unknown>): boolean {
  const structured = readSnapshotStructured(snapshot);
  return Array.isArray(structured?.poem);
}

/**
 * "Version history" (Task 10): lists every saved revision of one portfolio
 * item, newest first (Task 9's `useItemRevisions`), lets the owner view any
 * earlier snapshot read-only inline, and restore it. Mounted from
 * `SubprofileItemDrawer` only once the item is saved (`!isNew`, the same
 * guard `ProtectWorkSection` uses).
 *
 * A restore rewrites content the drawer's local `draft` state has no way to
 * know about, so `onRestored` is wired by the drawer to close BOTH this
 * modal and the drawer itself (see `SubprofileItemDrawer`'s
 * `closeHistoryAndDrawer`), and to reseed that section's editor rows: the
 * drawer's stale draft would otherwise sit on screen, and the section list
 * and docked preview would otherwise keep showing the pre-restore content,
 * after a restore that already changed the saved item underneath them.
 * A plain dismiss (X/scrim/Escape) only closes this modal via `onClose`,
 * returning the owner to the still-open drawer.
 */
export function ItemRevisionHistoryModal({
  subprofileId,
  itemId,
  section,
  onClose,
  onRestored,
}: ItemRevisionHistoryModalProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { data: revisions = [], isLoading } = useItemRevisions(
    subprofileId,
    itemId,
  );
  const restoreItemRevision = useRestoreItemRevision();
  const [expandedRevisionId, setExpandedRevisionId] = useState<string | null>(
    null,
  );

  async function restore(revisionId: string) {
    let result: { subprofile: SubprofileView | null };
    try {
      result = await restoreItemRevision.mutateAsync({
        subprofileId,
        itemId,
        revisionId,
      });
    } catch {
      // Ownership lapsed (403), the revision no longer exists (404), or the
      // network dropped: tell the owner and leave the modal open so they can
      // retry, same shape as `ProtectWorkSection`'s clipboard/record try/catch.
      // Deliberately does NOT call onRestored/onClose here.
      showToast(t("subprofiles:history.restoreFailed"), "error");
      return;
    }
    showToast(t("subprofiles:history.restored"));
    if (onRestored) {
      onRestored(result.subprofile);
    } else {
      onClose();
    }
  }

  return (
    <Modal title={t("subprofiles:history.heading")} onClose={onClose} wide>
      {!isLoading && revisions.length === 0 && (
        <p className={styles.empty}>{t("subprofiles:history.empty")}</p>
      )}
      <div className={styles.list}>
        {revisions.map((revision) => (
          <div key={revision.id} className={styles.row}>
            <div className={styles.rowHead}>
              <div className={styles.rowMeta}>
                <FiClock aria-hidden />
                <span>{formatDate(revision.createdAt)}</span>
                {revision.title && (
                  <span className={styles.rowTitle}>{revision.title}</span>
                )}
              </div>
              <div className={styles.rowActions}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setExpandedRevisionId((current) =>
                      current === revision.id ? null : revision.id,
                    )
                  }
                >
                  {t("subprofiles:history.view")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={restoreItemRevision.isPending}
                  onClick={() => void restore(revision.id)}
                >
                  <FiRotateCcw aria-hidden /> {t("subprofiles:history.restore")}
                </Button>
              </div>
            </div>
            {expandedRevisionId === revision.id && (
              <RevisionSnapshotPreview
                subprofileId={subprofileId}
                itemId={itemId}
                revisionId={revision.id}
                section={section}
              />
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
}

interface RevisionSnapshotPreviewProps {
  subprofileId: string;
  itemId: string;
  revisionId: string;
  section: SubprofileSection;
}

/** Fetches and renders one revision's full snapshot, read-only. Mounted only
 *  while its row is expanded, so the detail fetch (`useItemRevisionDetail`)
 *  only runs for a revision the owner actually asked to see. */
function RevisionSnapshotPreview({
  subprofileId,
  itemId,
  revisionId,
  section,
}: RevisionSnapshotPreviewProps) {
  const { data: detail, isLoading } = useItemRevisionDetail(
    subprofileId,
    itemId,
    revisionId,
  );

  if (isLoading || !detail) return null;

  const snapshot = detail.snapshot;
  const title = readSnapshotString(snapshot, "title");
  const description = readSnapshotString(snapshot, "description");
  const isPoem = section === "poems" || hasPoemStructure(snapshot);

  if (isPoem) {
    const structured = readSnapshotStructured(snapshot);
    return (
      <div className={styles.preview}>
        <PoemBlocksView
          blocks={normalizePoemBlocks(structured?.poem)}
          description={description}
        />
      </div>
    );
  }

  return (
    <div className={styles.preview}>
      {title && <p className={styles.previewTitle}>{title}</p>}
      {description && <p className={styles.previewDescription}>{description}</p>}
    </div>
  );
}
