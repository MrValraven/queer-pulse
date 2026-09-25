import { useMemo } from "react";
import { FiPlus, FiRotateCw } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AffiliationInputDTO } from "./api/subprofiles.api";
import type { SubprofileView } from "./api/subprofiles.adapters";
import {
  affiliationTargetKey,
  mergeSavedAffiliationOptions,
  useAffiliationOptions,
} from "./api/useAffiliationOptions";
import {
  useSubprofileEditorContext,
  withAffiliationUid,
} from "./subprofileEditorContext";
import { useEditorRowList } from "./useEditorRowList";
import { useReorderableRows } from "./useReorderableRows";
import { MAX_AFFILIATIONS, rolesForTargetType } from "./affiliations.data";
import { ReorderRow } from "./ReorderRow";
import { SubprofileAffiliationRow } from "./SubprofileAffiliationRow";
import sharedStyles from "./SubprofileEditor.module.css";
import reorderStyles from "./ReorderRow.module.css";
import styles from "./SubprofileAffiliationsEditor.module.css";

const emptyRow = (): AffiliationInputDTO => ({
  targetType: "event",
  targetSlug: "",
  role: rolesForTargetType("event")[0] ?? "",
});

/**
 * Owner editor for a persona's event/community links ("Part of"): add, remove
 * and reorder rows (a grip drag, or the grip's move menu, which also takes Alt
 * with an arrow key), each a type toggle + a role scoped to that type + a
 * picker of eligible targets (`SubprofileAffiliationRow`), capped at
 * `MAX_AFFILIATIONS`. The eligible targets load once here
 * (`useAffiliationOptions`): communities the
 * signed-in owner is a member of and events they're going to, plus the
 * persona's saved links (a co-owner's or one past the options cap), so every
 * saved link shows selected in both modes. If they fail to load, one alert
 * above the rows says so and offers a retry, while each row's picker stays
 * disabled. Each row hides
 * targets another row already links (the unique key is persona + type + slug).
 * The server validates existence, visibility, block-filtering and that same
 * membership rule on save. Rows are CONTROLLED by `SubprofileEditorContext`
 * (`affiliationRows`/`setAffiliationRows`): no local state and no Save button;
 * the global savebar's `saveAll()` PUTs the whole list in row order (stored as
 * each link's `position`, which the page lists them by) and surfaces any
 * rejection (which names the offending entry) as an error toast. Mirrors
 * `SubprofileSocialLinksEditor`'s add/remove UX. It has no outer card or title
 * of its own: the editor's pane router (`EditorPaneRouter`) already renders the
 * "Part of" h2 + lede above whichever pane is active, reusing this component's
 * own `affiliationsEditor.title`/`.note` copy.
 */
export function SubprofileAffiliationsEditor({
  subprofile,
}: {
  subprofile: SubprofileView;
}) {
  const { t } = useTranslation();
  const { affiliationRows: rows, setAffiliationRows } =
    useSubprofileEditorContext();
  const optionsQuery = useAffiliationOptions(subprofile.id);
  const options = useMemo(
    () =>
      mergeSavedAffiliationOptions(
        optionsQuery.data ?? [],
        subprofile.affiliations,
      ),
    [optionsQuery.data, subprofile.affiliations],
  );
  // react-query v5 keeps `isError` set after a failed background refetch even
  // with cached data, so only block the pickers when there is nothing to show.
  const isOptionsLoading = optionsQuery.isPending;
  const hasOptionsError = optionsQuery.isError && !optionsQuery.data;

  const { patch, remove, add, move, atMax, isAddedRow } = useEditorRowList(
    rows,
    setAffiliationRows,
    {
      max: MAX_AFFILIATIONS,
      makeEmpty: () => withAffiliationUid(emptyRow()),
    },
  );
  const { containerRef, draggingIndex, gripHandlers, moveCount, moveRow } =
    useReorderableRows(move);

  /** The targets every OTHER row already links, so a row can't pick them. */
  function takenKeysExcept(rowUid: string): Set<string> {
    return new Set(
      rows
        .filter((row) => row._uid !== rowUid && row.targetSlug !== "")
        .map((row) => affiliationTargetKey(row.targetType, row.targetSlug)),
    );
  }

  return (
    <div className="ed-grid">
      {rows.length === 0 && (
        <p className={sharedStyles.emptySection}>
          {t("subprofiles:affiliationsEditor.empty")}
        </p>
      )}

      {hasOptionsError && (
        <p className={styles.optionsAlert} role="alert">
          {t("subprofiles:affiliationsEditor.optionsError")}
          <button
            type="button"
            className={sharedStyles.smallBtn}
            // Stays enabled so focus never drops to the page; a click while a
            // retry is in flight joins it instead of starting another.
            onClick={() => void optionsQuery.refetch({ cancelRefetch: false })}
          >
            <FiRotateCw size={14} aria-hidden />{" "}
            {t("subprofiles:affiliationsEditor.retry")}
          </button>
        </p>
      )}

      <div
        className={`${sharedStyles.itemsWrap} ${styles.itemsWrapFit}`}
        ref={containerRef}
      >
        {rows.map((row, index) => (
          <ReorderRow
            key={row._uid}
            className={
              draggingIndex === index ? reorderStyles.cardDragging : undefined
            }
            isDragging={draggingIndex === index}
            isEntering={isAddedRow(row._uid)}
            moveCount={moveCount}
          >
            <SubprofileAffiliationRow
              row={row}
              index={index}
              rowCount={rows.length}
              options={options}
              isOptionsLoading={isOptionsLoading}
              hasOptionsError={hasOptionsError}
              takenKeys={takenKeysExcept(row._uid)}
              gripHandlers={gripHandlers(index)}
              onMove={(to) => moveRow(index, to)}
              onChange={(patchValue) => patch(row._uid, patchValue)}
              onRemove={() => remove(row._uid)}
            />
          </ReorderRow>
        ))}
      </div>

      <div className={sharedStyles.sectionFoot}>
        <div>
          <button
            type="button"
            className={sharedStyles.addBtn}
            onClick={add}
            disabled={atMax}
          >
            <FiPlus size={18} aria-hidden />{" "}
            {t("subprofiles:affiliationsEditor.add")}
          </button>
          {atMax && (
            <p className={sharedStyles.capHint}>
              {t("subprofiles:affiliationsEditor.capHint")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
