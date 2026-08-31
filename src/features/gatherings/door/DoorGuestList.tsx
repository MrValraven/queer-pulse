import { useMemo, useState } from "react";
import { FiUsers } from "react-icons/fi";
import { Button, EmptyState } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { AttendeeRow } from "../api/events.adapters";
import { DoorGuestRow } from "./DoorGuestRow";
import styles from "../GatheringDashboardPage.module.css";

type DoorFilter = "all" | "arrived" | "expected";

/**
 * The real guest list at the door (LOC-03): everyone holding a going RSVP,
 * searchable, filterable by whether they have arrived.
 *
 * Every name here came from the server for THIS gathering. Nothing falls back
 * to a fixture: a host with an empty roster is told the roster is empty, which
 * is a fact they can act on, where an invented list is not.
 */
export function DoorGuestList({
  attendees,
  checkedInCount,
  canCheckIn,
  pendingSlug,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onCheckIn,
  onUndo,
}: {
  attendees: AttendeeRow[];
  /** How many have arrived, or `null` when the platform no longer keeps this
   *  gathering's check-ins. Null withdraws the two arrival filters rather than
   *  deriving them from a coerced zero. */
  checkedInCount: number | null;
  /** False once this gathering is past its attendance window, which withdraws
   *  every row's check-in button. Undo is unaffected and stays live. */
  canCheckIn: boolean;
  /** Whose row currently has a request in flight, if any. */
  pendingSlug: string | null;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onCheckIn: (memberSlug: string) => void;
  onUndo: (memberSlug: string) => void;
}) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<DoorFilter>("all");
  const [query, setQuery] = useState("");

  // Once a gathering's check-ins are no longer kept, "arrived" and "expected"
  // have no honest answer: the per-person arrival stamps were cleared along
  // with the count, so both filters would read everyone as still to come.
  // They are withdrawn, and the roster falls back to the whole list. The note
  // under the filter bar says so in its own words; the retention rule itself
  // is stated once, up beside the headline count (see `DoorShell`).
  const isCheckInKept = checkedInCount !== null;
  const activeFilter: DoorFilter = isCheckInKept ? filter : "all";

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return attendees.filter((attendee) => {
      const hasArrived = attendee.checkedInAt != null;
      if (activeFilter === "arrived" && !hasArrived) return false;
      if (activeFilter === "expected" && hasArrived) return false;
      return !needle || attendee.name.toLowerCase().includes(needle);
    });
  }, [attendees, activeFilter, query]);

  const filterTabs: [DoorFilter, string][] = [
    [
      "all",
      t("gatherings:dashboard.guestList.filterAll", {
        count: attendees.length,
      }),
    ],
  ];
  if (checkedInCount !== null) {
    filterTabs.push(
      [
        "arrived",
        t("gatherings:dashboard.guestList.filterCheckedIn", {
          count: checkedInCount,
        }),
      ],
      [
        "expected",
        t("gatherings:dashboard.guestList.filterPending", {
          count: Math.max(0, attendees.length - checkedInCount),
        }),
      ],
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        {t("gatherings:dashboard.guestList.heading")}
      </div>
      <div className={styles.cardBody}>
        <div className={styles.filterBar}>
          {filterTabs.map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={activeFilter === id}
              className={[
                styles.afBtn,
                activeFilter === id && styles.afBtnActive,
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
        {isCheckInKept ? null : (
          <p className={styles.doorRetentionNote}>
            {t("gatherings:door.checkInsNotKeptFilters")}
          </p>
        )}
        <input
          className={styles.attSearch}
          type="search"
          aria-label={t("gatherings:dashboard.guestList.searchPlaceholder")}
          placeholder={t("gatherings:dashboard.guestList.searchPlaceholder")}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div>
          {visible.length === 0 &&
            (attendees.length === 0 ? (
              <EmptyState
                compact
                icon={<FiUsers />}
                title={t("gatherings:door.emptyTitle")}
                description={t("gatherings:door.emptyDescription")}
              />
            ) : (
              <EmptyState
                compact
                icon={<FiUsers />}
                title={t("gatherings:dashboard.guestList.emptyFilterTitle")}
                description={t(
                  "gatherings:dashboard.guestList.emptyFilterDescription",
                )}
                action={{
                  label: t("gatherings:dashboard.guestList.clearFiltersCta"),
                  onClick: () => {
                    setFilter("all");
                    setQuery("");
                  },
                }}
              />
            ))}
          {visible.map((attendee) => (
            <DoorGuestRow
              key={attendee.slug}
              attendee={attendee}
              isPending={pendingSlug === attendee.slug}
              canCheckIn={canCheckIn}
              onCheckIn={onCheckIn}
              onUndo={onUndo}
            />
          ))}
          {hasMore && (
            <div className={styles.moreRow}>
              <Button
                type="button"
                variant="ghost"
                disabled={isLoadingMore}
                onClick={onLoadMore}
              >
                {isLoadingMore
                  ? t("gatherings:manage.attendees.loadingMore")
                  : t("gatherings:manage.attendees.loadMoreCta")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
