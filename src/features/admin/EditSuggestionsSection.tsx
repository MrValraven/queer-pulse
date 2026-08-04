import { useMemo, useState } from "react";
import { FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminTabs } from "./ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useEditSuggestions } from "./api/useEditSuggestions";
import { EditSuggestionRows } from "./EditSuggestionRows";
import type { EditSuggestionStatus } from "./api/editSuggestions.api";
import styles from "./EditSuggestions.module.css";

type StatusFilter = EditSuggestionStatus | "all";
const FILTERS: StatusFilter[] = ["pending", "accepted", "dismissed", "all"];

/**
 * Moderator triage of member-submitted "suggest an edit" corrections to
 * directory listings (a tab inside `AdminListingsPage`). Uses its own
 * status-filter + optimistic-override shape: `useResolveEditSuggestion`'s
 * demo mutation never touches the fixture, so a just-resolved suggestion is
 * reflected immediately via a local override map. (The listings queue itself
 * has since moved this pattern into the react-query cache directly — see
 * `patchListingInCache` in `api/useAdminListings.ts` — but this tab wasn't in
 * scope for that refactor.)
 */
export function EditSuggestionsSection() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const { rows, isLoading } = useEditSuggestions();
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, EditSuggestionStatus>
  >({});

  const visibleRows = useMemo(() => {
    const withOverrides = rows.map((row) => {
      const override = statusOverrides[row.id];
      return override ? { ...row, status: override } : row;
    });
    return filter === "all"
      ? withOverrides
      : withOverrides.filter((row) => row.status === filter);
  }, [rows, statusOverrides, filter]);

  function handleResolved(id: string, status: EditSuggestionStatus) {
    setStatusOverrides((current) => ({ ...current, [id]: status }));
  }

  return (
    <>
      <FadeIn delay={80}>
        <AdminTabs
          tabs={FILTERS.map((value) => ({
            id: value,
            label: t(`admin:editSuggestions.filter.${value}`),
          }))}
          active={filter}
          onChange={(value) => setFilter(value as StatusFilter)}
        />
      </FadeIn>

      <FadeIn delay={100}>
        {isLoading ? (
          <SuggestionRowsSkeleton />
        ) : (
          <EditSuggestionRows
            suggestions={visibleRows}
            onResolved={handleResolved}
          />
        )}
      </FadeIn>
    </>
  );
}

function SuggestionRowsSkeleton() {
  return (
    <div className={styles.rows}>
      {[0, 1, 2].map((skeletonIndex) => (
        <SkeletonLine
          key={skeletonIndex}
          height={104}
          style={{ borderRadius: 14 }}
        />
      ))}
    </div>
  );
}
