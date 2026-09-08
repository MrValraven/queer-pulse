import { useId } from "react";
import {
  Button,
  ChipSelect,
  RefineGroup,
  RefinePanel,
  RefineSplit,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
import type { SubprofileDirectoryFilters } from "./useSubprofileDirectoryFilters";
import styles from "./SubprofileDirectoryPage.module.css";

/**
 * The directory's Refine drawer: profession chips grouped by page family, then
 * the availability toggle and the tag tray sharing one band below them.
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

      {/* Availability and tags share one band rather than taking one each: both
          are a single short row, so a band apiece spent a hairline and a band's
          worth of height to say very little. `RefineSplit` caps the first
          column, so the lone pill cannot stretch across the drawer, and stacks
          the two on narrow screens. */}
      <RefineSplit>
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
                // phrase: "React, 4 personas", never "React 4" (which reads as
                // a quantity of Reacts).
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
      </RefineSplit>
    </RefinePanel>
  );
}

/**
 * The Profession band: one chip row per page family, each headed by the family
 * name. Multi-select, OR within the facet.
 *
 * The families lay out as an auto-fill grid (`.professionGroups`), so however
 * many there are they fill the drawer's width in columns and fold to fewer as
 * it narrows. A stack was one short chip row per family down the left edge,
 * which left most of the drawer empty; there is no profession-count threshold
 * here any more, because the grid answers the question at every width.
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

  return (
    <RefineGroup label={t("subprofiles:directory.refine.professionLabel")}>
      <div className={styles.professionGroups}>
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
