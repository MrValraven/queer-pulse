import { useId } from "react";
import { ChipSelect, Collapse } from "../../shared/components/ui";
import {
  FilterSection,
  FilterSidebarPanel,
  filterPageClassNames,
} from "../../shared/components/filterPage";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { QuestTableRefineGroup } from "./QuestTableRefineGroup";
import { SubprofileDirectoryAvailabilitySection } from "./SubprofileDirectoryAvailabilitySection";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
import type { SubprofileFilterSectionKey } from "./subprofileDirectoryFilterSections";
import type { SubprofileDirectoryFilters } from "./useSubprofileDirectoryFilters";
import styles from "./SubprofileDirectoryPage.module.css";

interface SubprofileDirectoryFilterSidebarProps {
  directory: SubprofileDirectoryFilters;
  /** False while the fetch is in flight or failed: every count is then left
   *  off and every option stays pickable, since "not counted yet" is a
   *  different answer from "nobody". */
  isCountKnown: boolean;
  appliedCount: number;
  sectionsOpen: Record<SubprofileFilterSectionKey, boolean>;
  onToggleSection: (key: SubprofileFilterSectionKey) => void;
  /** Rendered inside the mobile filters sheet. */
  isInSheet?: boolean;
}

/**
 * The persona directory's filters, as the members directory's sidebar:
 * Profession, At the table, Availability and Tags, each a collapsible
 * section on one paper panel closed by the clear-all row.
 *
 * Profession, At the table and Tags are built from the loaded personas and
 * the server's facet block, so each folds in once there is something to pick
 * (a Collapse slot that draws the section divider itself, because the section
 * inside it is that slot's first child). From then on each stays: the hook
 * keeps every option it has seen (`useSeenVocabulary`), so a search that
 * matches nobody leaves the sections and their chips in place at 0 and
 * dimmed, as on /members and /communities. Availability is always there; its
 * radio group lives in `SubprofileDirectoryAvailabilitySection`.
 *
 * Every count is the server's facet count (`useSubprofileDirectoryFilters`).
 * A known 0 dims its option; an unknown count draws no number and leaves the
 * option pickable.
 */
export function SubprofileDirectoryFilterSidebar({
  directory,
  isCountKnown,
  appliedCount,
  sectionsOpen,
  onToggleSection,
  isInSheet = false,
}: SubprofileDirectoryFilterSidebarProps) {
  const { t } = useTranslation();
  const tagsHeadingId = useId();
  const {
    kinds,
    professionGroups,
    hasTableData,
    tableFormats,
    tableVibes,
    availableTags,
    tagCounts,
    activeTags,
    onToggleTag,
    isShowingPreviousResults,
    onClearFilters,
  } = directory;

  return (
    <FilterSidebarPanel
      isInSheet={isInSheet}
      appliedCount={appliedCount}
      onClearAll={onClearFilters}
    >
      <Collapse
        isOpen={professionGroups.length > 0}
        className={styles.sectionSlot}
      >
        <FilterSection
          title={t("subprofiles:directory.refine.professionLabel")}
          open={sectionsOpen.profession}
          onToggle={() => onToggleSection("profession")}
          activeCount={kinds.length}
        >
          <SubprofileProfessionFilter
            directory={directory}
            isCountKnown={isCountKnown}
          />
        </FilterSection>
      </Collapse>

      <Collapse isOpen={hasTableData} className={styles.sectionSlot}>
        <FilterSection
          title={t("subprofiles:directory.refine.tableLabel")}
          open={sectionsOpen.table}
          onToggle={() => onToggleSection("table")}
          activeCount={tableFormats.length + tableVibes.length}
        >
          <QuestTableRefineGroup
            directory={directory}
            isCountKnown={isCountKnown}
          />
        </FilterSection>
      </Collapse>

      <SubprofileDirectoryAvailabilitySection
        directory={directory}
        isCountKnown={isCountKnown}
        isOpen={sectionsOpen.availability}
        onToggle={() => onToggleSection("availability")}
      />

      <Collapse
        isOpen={availableTags.length > 0}
        className={styles.sectionSlot}
      >
        <FilterSection
          title={t("subprofiles:directory.refine.tagsLabel")}
          headingId={tagsHeadingId}
          open={sectionsOpen.tags}
          onToggle={() => onToggleSection("tags")}
          activeCount={activeTags.length}
        >
          <ChipSelect
            labelledBy={tagsHeadingId}
            className={
              isShowingPreviousResults
                ? filterPageClassNames.chipsStale
                : undefined
            }
            options={availableTags.map((tag) => {
              const count = isCountKnown ? tagCounts?.[tag] : undefined;
              return {
                value: tag,
                label: tag,
                count,
                // "React, 4 personas": the bare "React 4" would read as a
                // quantity of Reacts.
                ariaLabel:
                  count === undefined
                    ? tag
                    : t("subprofiles:directory.refine.optionWithCount", {
                        label: tag,
                        count,
                      }),
              };
            })}
            selected={new Set(activeTags)}
            onToggle={onToggleTag}
          />
        </FilterSection>
      </Collapse>
    </FilterSidebarPanel>
  );
}

/**
 * The Profession section's body: one chip row per work field, each headed
 * by the professional area members pick in onboarding, stacked down the
 * 280px column. Multi-select, OR within the facet.
 *
 * Each chip's count is a LIVE facet, taken under the other filters but not
 * under the profession selection itself, so picking "Poet" leaves the other
 * professions' numbers standing. A chip that reaches 0 dims and goes
 * unpickable (`ChipSelect`): choosing it could only ever empty the grid. An
 * uncounted chip draws no number and stays pickable.
 */
function SubprofileProfessionFilter({
  directory,
  isCountKnown,
}: {
  directory: SubprofileDirectoryFilters;
  isCountKnown: boolean;
}) {
  const { t } = useTranslation();
  const groupIdPrefix = useId();
  const {
    professionGroups,
    professionCounts,
    kinds,
    onToggleKind,
    isShowingPreviousResults,
  } = directory;
  const selectedKinds = new Set<string>(kinds);

  return (
    <div className={styles.professionGroups}>
      {professionGroups.map((group) => {
        const groupLabelId = `${groupIdPrefix}-${group.field}`;
        return (
          <div className={styles.professionGroup} key={group.field}>
            <p id={groupLabelId} className={styles.professionGroupLabel}>
              {t(group.labelKey)}
            </p>
            <ChipSelect
              labelledBy={groupLabelId}
              className={
                isShowingPreviousResults
                  ? filterPageClassNames.chipsStale
                  : undefined
              }
              options={group.kinds.map((kind) => {
                const label = t(KIND_LABEL_KEYS[kind]);
                const count = isCountKnown
                  ? professionCounts?.[kind]
                  : undefined;
                return {
                  value: kind,
                  label,
                  count,
                  ariaLabel:
                    count === undefined
                      ? label
                      : t("subprofiles:directory.refine.optionWithCount", {
                          label,
                          count,
                        }),
                };
              })}
              selected={selectedKinds}
              onToggle={onToggleKind}
            />
          </div>
        );
      })}
    </div>
  );
}
