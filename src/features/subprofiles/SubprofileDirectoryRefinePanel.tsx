import { useId } from "react";
import {
  Button,
  ChipSelect,
  RefineGroup,
  RefinePanel,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
import type { SubprofileDirectoryFilters } from "./useSubprofileDirectoryFilters";
import styles from "./SubprofileDirectoryPage.module.css";

/**
 * The directory's Refine drawer: profession chips grouped by page family,
 * the availability toggle, then the tag tray.
 *
 * All three used to stand open above the first card, which put a thirteen-chip
 * row, a note, a search field and a tag row between the headline and the
 * personas. They live down here now for the same reason `/communities` moved
 * its own: these are controls most visitors set once or never, and the chip row
 * above the grid already says which of them are on.
 */
export function SubprofileDirectoryRefinePanel({
  directory,
  panelProps,
}: {
  directory: SubprofileDirectoryFilters;
  panelProps: { isOpen: boolean; isSettled: boolean; panelId: string };
}) {
  const { t } = useTranslation();
  const availabilityLabelId = useId();
  const tagsLabelId = useId();
  const {
    availableTags,
    tagCounts,
    activeTags,
    onToggleTag,
    openToCollabs,
    onToggleOpenToCollabs,
    openToCollabsCount,
  } = directory;

  // Nobody is open to collabs under the drawer's other filters, so picking this
  // could only empty the grid. Disabled like a 0-count chip (`Button` renders
  // that as the same dimming `ChipSelect`'s `.chipEmpty` uses) — but never
  // while it is already on, or a member could not switch it back off.
  const isOpenToCollabsUnavailable = openToCollabsCount === 0 && !openToCollabs;

  return (
    <RefinePanel {...panelProps}>
      <SubprofileProfessionFilter directory={directory} />

      <RefineGroup
        label={t("subprofiles:directory.refine.availabilityLabel")}
        labelId={availabilityLabelId}
        role="group"
        aria-labelledby={availabilityLabelId}
      >
        <div className={styles.toggles}>
          <Button
            variant="ghost"
            size="sm"
            aria-pressed={openToCollabs}
            // The badge is aria-hidden, so the pill has to carry the whole
            // phrase, exactly as the chip rows do.
            aria-label={t("subprofiles:directory.refine.optionWithCount", {
              label: t("subprofiles:directory.openToCollabsChip"),
              count: openToCollabsCount,
            })}
            disabled={isOpenToCollabsUnavailable}
            className={[styles.toggle, openToCollabs && styles.toggleOn]
              .filter(Boolean)
              .join(" ")}
            onClick={onToggleOpenToCollabs}
          >
            <span className={styles.toggleDot} aria-hidden />
            {t("subprofiles:directory.openToCollabsChip")}
            <span className={styles.toggleCount} aria-hidden>
              {openToCollabsCount}
            </span>
          </Button>
        </div>
      </RefineGroup>

      {availableTags.length > 0 && (
        <RefineGroup
          label={t("subprofiles:directory.refine.tagsLabel")}
          labelId={tagsLabelId}
        >
          <ChipSelect
            labelledBy={tagsLabelId}
            options={availableTags.map((tag) => ({
              value: tag,
              label: tag,
              count: tagCounts[tag] ?? 0,
              // The badge is aria-hidden, so the chip has to carry the whole
              // phrase: "React, 4 personas", never "React 4" (which reads as a
              // quantity of Reacts).
              ariaLabel: t("subprofiles:directory.refine.optionWithCount", {
                label: tag,
                count: tagCounts[tag] ?? 0,
              }),
            }))}
            selected={new Set(activeTags)}
            onToggle={onToggleTag}
          />
        </RefineGroup>
      )}
    </RefinePanel>
  );
}

/**
 * Above this many professions the family groups stack instead of standing side
 * by side. Four is where a row of columns stops being cheap: below it the
 * groups are one or two chips each and a column apiece wastes most of the
 * drawer's width, at it and above the columns get narrow enough that the chips
 * inside start wrapping, which reads worse than a plain stack.
 */
const INLINE_PROFESSION_LIMIT = 4;

/**
 * The Profession band: one chip row per page family, each headed by the family
 * name. Multi-select, OR within the facet.
 *
 * A young directory has two families of one profession each, which as a stack
 * is two nearly empty rows. So a small band lays its families out side by side,
 * divided by a hairline, and only falls back to a column once there are enough
 * professions for the columns to crowd (`INLINE_PROFESSION_LIMIT`). Narrow
 * screens always stack: the divider is a desktop-width affordance.
 *
 * Each chip's count is a LIVE facet, taken under the drawer's other filters but
 * not under the profession selection itself, so picking "Poet" leaves the other
 * professions' numbers standing rather than collapsing them all to 0. A chip
 * that does reach 0 dims and goes unpickable (`ChipSelect`): choosing it could
 * only ever empty the grid.
 *
 * Split out of the panel so each file stays well under the 200-line cap.
 */
function SubprofileProfessionFilter({
  directory,
}: {
  directory: SubprofileDirectoryFilters;
}) {
  const { t } = useTranslation();
  const uid = useId();
  const { professionGroups, professionCounts, kinds, onToggleKind } = directory;
  const selectedKinds = new Set<string>(kinds);

  if (professionGroups.length === 0) return null;

  const professionCount = professionGroups.reduce(
    (total, group) => total + group.kinds.length,
    0,
  );
  const isInline =
    professionGroups.length > 1 && professionCount <= INLINE_PROFESSION_LIMIT;

  return (
    <RefineGroup label={t("subprofiles:directory.refine.professionLabel")}>
      <div
        className={[
          styles.professionGroups,
          isInline && styles.professionGroupsInline,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {professionGroups.map((group) => {
          const groupLabelId = `${uid}-${group.family}`;
          return (
            <div className={styles.professionGroup} key={group.family}>
              <p id={groupLabelId} className={styles.professionGroupLabel}>
                {t(group.labelKey)}
              </p>
              <ChipSelect
                labelledBy={groupLabelId}
                options={group.kinds.map((kind) => {
                  const label = t(KIND_LABEL_KEYS[kind]);
                  const count = professionCounts[kind] ?? 0;
                  return {
                    value: kind,
                    label,
                    count,
                    ariaLabel: t(
                      "subprofiles:directory.refine.optionWithCount",
                      { label, count },
                    ),
                  };
                })}
                selected={selectedKinds}
                onToggle={onToggleKind}
              />
            </div>
          );
        })}
      </div>
    </RefineGroup>
  );
}
