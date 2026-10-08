import { useState } from "react";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GatheringDetailsDraft } from "./editDetailsDraft";
import { EditRunByModal } from "./EditRunByModal";
import { EditVenueModal } from "./EditVenueModal";
import {
  GatheringFieldEditor,
  type GatheringEditableField,
} from "./GatheringFieldEditor";
import { LAST_EDITED_AT } from "./manageGathering.data";
import { daysSince } from "./manageGatheringDates";
import { DuplicateGatheringButton } from "./DuplicateGatheringButton";
import {
  OverviewDetailRows,
  OverviewEditButton,
  type GatheringDetail,
} from "./OverviewDetailRows";
import type { VenueSelection } from "./VenuePicker";
import { useAuth } from "../../app/providers/authContext";
import { useManagedListings } from "../marketing/listBusiness/api/useManagedListings";
import {
  RUN_BY_DETAIL_ROW_ID,
  type RunByListingView,
  type RunBySelection,
} from "./runByListing";
import type { RunBySaveOutcome } from "./useGatheringEditSave";
import { GatheringDescriptionText } from "./GatheringDescriptionText";
import styles from "./ManageGatheringPage.module.css";

export type { GatheringDetail } from "./OverviewDetailRows";

/** Live overview counts; when absent the tab shows its static demo trio. */
export interface OverviewCounts {
  going: number;
  waitlist: number;
  spotsLeft: number;
}

/**
 * Which focused editor each details row opens. The date and the time are one
 * schedule (start and end together), so both rows open the same editor. The
 * venue row is absent on purpose: it opens `EditVenueModal`, which keeps the
 * directory listing a plain-text draft would drop. A row named in neither
 * place renders without an Edit.
 */
const DETAIL_ROW_FIELDS: Partial<Record<string, GatheringEditableField>> = {
  date: "schedule",
  time: "schedule",
  capacity: "capacity",
};

type OverviewEditing =
  | {
      kind: "field";
      field: GatheringEditableField;
      initial: GatheringDetailsDraft;
    }
  | { kind: "venue"; selection: VenueSelection }
  | { kind: "runBy" }
  | null;

interface OverviewTabProps {
  /** The gathering's slug, so "Duplicate" knows what to copy. */
  slug: string;
  details: GatheringDetail[];
  description: string;
  /** Live going/waitlist/spots-left; absent → the static demo trio. */
  counts?: OverviewCounts;
  /**
   * When the host last edited this gathering, from the API (PRD-191).
   *
   * `undefined` in demo mode, where the tab falls back to the mock constant
   * that used to drive this line in LIVE too, so every real host read a
   * fabricated edit age that never moved when they edited.
   */
  updatedAt?: Date;
  /** The venue's directory link (or null for a free-text venue). Read
   *  alongside the "venue" row's plain-text `value` above to decide whether
   *  it renders as a link, and to seed the venue edit modal. */
  venueListingId: string | null;
  venueListing: { slug: string; name: string } | null;
  /** The whole edit draft, read off the page's state at the moment an editor
   *  opens, so a second edit starts from what the first one saved. */
  buildEditDraft: () => GatheringDetailsDraft;
  /** Saves a field editor's draft through the page's one edit path, which
   *  sends the PATCH or asks a repeating gathering's scope first. */
  onSaveEdit: (draft: GatheringDetailsDraft) => void;
  /** The venue keeps its own save: the draft holds only the venue text, and
   *  the directory listing id would be lost on the way through it. */
  onUpdateVenue: (value: VenueSelection) => void;
  /** The business that runs this gathering, or null for none. */
  runByListing?: RunByListingView | null;
  /** Saves a "Run by" pick through the page's edit path. Left out, the row
   *  does not show. */
  onUpdateRunBy?: (selection: RunBySelection) => Promise<RunBySaveOutcome>;
  /** The host's member slug, so the "Run by" editor can tell the host from
   *  a co-host. */
  hostSlug?: string;
}

export function OverviewTab({
  slug,
  details,
  description,
  counts,
  updatedAt,
  venueListingId,
  venueListing,
  buildEditDraft,
  onSaveEdit,
  onUpdateVenue,
  runByListing = null,
  onUpdateRunBy,
  hostSlug,
}: OverviewTabProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const [editing, setEditing] = useState<OverviewEditing>(null);
  const { items: managedListings, isResolving } = useManagedListings();
  const { checking: isAuthChecking, user } = useAuth();
  const isViewerHost = Boolean(hostSlug) && user?.profile.slug === hostSlug;
  // An empty list means "not known yet" while auth or the read is pending,
  // so the editor never decides read-only from it until both settle.
  const isManagedListPending = isAuthChecking || isResolving;
  // The "Run by" row shows for an organiser who runs a business, or while
  // the gathering already names one (read-only when it is not theirs).
  const hasRunByRow =
    onUpdateRunBy !== undefined &&
    (runByListing !== null || managedListings.length > 0);
  const detailRows = hasRunByRow
    ? [
        ...details,
        {
          id: RUN_BY_DETAIL_ROW_ID,
          labelKey: "gatherings:manage.details.runBy",
          value: runByListing?.name ?? t("gatherings:manage.details.runByNone"),
        },
      ]
    : details;

  const openField = (field: GatheringEditableField) =>
    setEditing({ kind: "field", field, initial: buildEditDraft() });

  const editDetail = (detail: GatheringDetail) => {
    if (detail.id === RUN_BY_DETAIL_ROW_ID) {
      setEditing({ kind: "runBy" });
      return;
    }
    if (detail.id === "venue") {
      setEditing({
        kind: "venue",
        selection: {
          text: detail.value,
          listingId: venueListingId,
          venueListing,
        },
      });
      return;
    }
    const field = DETAIL_ROW_FIELDS[detail.id];
    if (field) openField(field);
  };

  const lastEditedDays = daysSince(updatedAt ?? LAST_EDITED_AT);

  // Keyed by a stable id: the labels are translated text, which reads "" for
  // every chip until the catalog loads.
  const stats = [
    {
      id: "going",
      count: counts?.going ?? 14,
      label: t("gatherings:manage.overview.stat.going"),
    },
    {
      id: "waitlist",
      count: counts?.waitlist ?? 3,
      label: t("gatherings:manage.overview.stat.waitlist"),
    },
    {
      id: "spotsLeft",
      count: counts?.spotsLeft ?? 6,
      label: t("gatherings:manage.overview.stat.spotsLeft"),
    },
  ];

  return (
    <div>
      <div className={styles.statsRow}>
        {stats.map(({ id, count, label }) => (
          <div className={styles.statChip} key={id}>
            <div className={styles.scN}>{count}</div>
            <div className={styles.scL}>{label}</div>
          </div>
        ))}
      </div>
      <OverviewDetailRows
        details={detailRows}
        venueListing={venueListing}
        runByListing={runByListing}
        isEditable={(detail) =>
          detail.id === "venue" ||
          detail.id === RUN_BY_DETAIL_ROW_ID ||
          DETAIL_ROW_FIELDS[detail.id] !== undefined
        }
        onEdit={editDetail}
      />
      <div className={styles.descCard}>
        <div className={styles.descLabel}>
          {t("gatherings:manage.overview.descriptionLabel")}
          <OverviewEditButton
            fieldLabel={t(
              "gatherings:manage.overview.descriptionLabel",
            ).toLowerCase()}
            onClick={() => openField("description")}
          />
        </div>
        <div className={styles.descText}>
          <GatheringDescriptionText text={description} />
        </div>
      </div>
      <div className={styles.overviewFooter}>
        <div className={styles.lastEdit}>
          {t("gatherings:manage.overview.lastEdited", {
            time: fmt.relativeTime(lastEditedDays, "day"),
          })}
        </div>
        {/* "Duplicate gathering" (PRD-190). A host with a monthly one-off used to
            retype the entire wizard every time. */}
        <DuplicateGatheringButton slug={slug} />
      </div>

      {editing?.kind === "field" && (
        <GatheringFieldEditor
          field={editing.field}
          initial={editing.initial}
          onClose={() => setEditing(null)}
          onSave={onSaveEdit}
        />
      )}
      {editing?.kind === "venue" && (
        <EditVenueModal
          initial={editing.selection}
          onClose={() => setEditing(null)}
          onSave={onUpdateVenue}
        />
      )}
      {editing?.kind === "runBy" && onUpdateRunBy && (
        <EditRunByModal
          initial={runByListing}
          items={managedListings}
          isResolving={isManagedListPending}
          isHost={isViewerHost}
          onClose={() => setEditing(null)}
          onSave={onUpdateRunBy}
        />
      )}
    </div>
  );
}
