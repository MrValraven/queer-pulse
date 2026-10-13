import { useId, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "../../shared/components/ui";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioArtistView } from "./api/studio.adapters";
import { studioReleaseQueryOptions } from "./api/useStudioRelease";
import {
  useDeleteStudioRelease,
  usePublishStudioRelease,
  useUnpublishStudioRelease,
} from "./api/useStudioReleaseMutations";
import { studioErrorMessageKeyOf } from "./studioErrors.data";
import {
  StudioOwnerReleaseRow,
  type OwnerAction,
  type OwnerRow,
} from "./StudioOwnerReleaseRow";
import ownerStyles from "./StudioArtistOwner.module.css";

type ConfirmedAction = Exclude<OwnerAction, "publish">;

function ownerRowsOf(artist: StudioArtistView): OwnerRow[] {
  return [
    ...(artist.ownerReleases ?? []).map((release) => ({
      release,
      status: release.status,
      statusLabelKey: release.statusLabelKey,
      takedownReason: release.takedownReason,
    })),
    ...[...artist.releases, ...artist.singles].map((release) => ({
      release,
      status: "published" as const,
      statusLabelKey: "studio:releaseStatus.published",
      takedownReason: null,
    })),
  ];
}

/** The owner's own releases: drafts and taken-down ones (from ownerReleases)
 *  then published ones. One confirm dialog lives here, outside the rows, so a
 *  row leaving the list after a delete never unmounts its own dialog. After
 *  an action focus lands on the panel heading; a delete that empties the list
 *  removes the panel too, so `onListEmptied` hands focus to the page. */
export function StudioArtistOwnerPanel({
  artist,
  onListEmptied,
}: {
  artist: StudioArtistView;
  onListEmptied: () => void;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const publish = usePublishStudioRelease();
  const unpublish = useUnpublishStudioRelease();
  const remove = useDeleteStudioRelease();
  const [pending, setPending] = useState<{
    action: ConfirmedAction;
    row: OwnerRow;
  } | null>(null);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  // The ref guards against a second press before React re-renders; the state
  // copy drives aria-disabled on the rows and the dialog's loading flag.
  const busyIdsRef = useRef(new Set<string>());
  const [busyIds, setBusyIds] = useState<ReadonlySet<string>>(new Set());
  const rows = ownerRowsOf(artist);

  function markBusy(releaseId: string, isBusy: boolean) {
    if (isBusy) busyIdsRef.current.add(releaseId);
    else busyIdsRef.current.delete(releaseId);
    setBusyIds(new Set(busyIdsRef.current));
  }

  async function run(action: OwnerAction, row: OwnerRow) {
    const releaseId = row.release.id;
    const isLastRowDelete = action === "delete" && rows.length === 1;
    if (busyIdsRef.current.has(releaseId)) return;
    markBusy(releaseId, true);
    setRowErrors((previous) =>
      Object.fromEntries(
        Object.entries(previous).filter(([rowId]) => rowId !== releaseId),
      ),
    );
    try {
      // Demo mutations transform the cached release, so make sure it is there.
      if (demoMode)
        await queryClient.ensureQueryData(
          studioReleaseQueryOptions(demoMode, releaseId),
        );
      if (action === "publish") await publish.mutateAsync({ releaseId });
      if (action === "unpublish") await unpublish.mutateAsync({ releaseId });
      if (action === "delete") await remove.mutateAsync({ releaseId });
      setPending(null);
      if (isLastRowDelete) onListEmptied();
      else headingRef.current?.focus();
    } catch (error) {
      setPending(null);
      setRowErrors((previous) => ({
        ...previous,
        [releaseId]: studioErrorMessageKeyOf(error),
      }));
    } finally {
      markBusy(releaseId, false);
    }
  }

  function handleAction(action: OwnerAction, row: OwnerRow) {
    if (action === "publish") void run(action, row);
    else setPending({ action, row });
  }

  if (rows.length === 0) return null;

  const isDelete = pending?.action === "delete";
  const pendingTitle = pending?.row.release.title ?? "";
  return (
    <section className={ownerStyles.panel} aria-labelledby={headingId}>
      <h2
        id={headingId}
        ref={headingRef}
        tabIndex={-1}
        className={ownerStyles.heading}
      >
        {t("studio:owner.heading")}
      </h2>
      <ul className={ownerStyles.list}>
        {rows.map((row) => (
          <StudioOwnerReleaseRow
            key={row.release.id}
            row={row}
            isBusy={busyIds.has(row.release.id)}
            errorKey={rowErrors[row.release.id] ?? null}
            onAction={handleAction}
          />
        ))}
      </ul>
      <ConfirmDialog
        open={pending !== null}
        onClose={() => setPending(null)}
        onConfirm={() => {
          if (pending) void run(pending.action, pending.row);
        }}
        loading={pending !== null && busyIds.has(pending.row.release.id)}
        tone={isDelete ? "destructive" : "default"}
        title={
          isDelete
            ? t("studio:owner.deleteTitle", { title: pendingTitle })
            : t("studio:owner.unpublishTitle", { title: pendingTitle })
        }
        description={
          isDelete
            ? t("studio:owner.deleteBody")
            : t("studio:owner.unpublishBody")
        }
        confirmLabel={
          isDelete
            ? t("studio:owner.deleteConfirm")
            : t("studio:owner.unpublishConfirm")
        }
      />
    </section>
  );
}
