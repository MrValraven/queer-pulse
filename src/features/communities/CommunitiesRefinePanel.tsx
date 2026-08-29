import { useId } from "react";
import {
  Button,
  RefineGroup,
  RefinePanel,
  RefineSplit,
  Select,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CommunitiesCategoryFilter } from "./CommunitiesCategoryFilter";
import { CommunitiesTagsFilter } from "./CommunitiesTagsFilter";
import { SORT_OPTIONS, type DiscoverSort } from "./communitiesDiscover.data";
import type { DiscoverCommunities } from "./useDiscoverCommunities";
import styles from "./CommunitiesPage.module.css";

/**
 * The Refine drawer's contents: category chips, sort, the two pill toggles and
 * the tags tray. Everything that isn't needed on every visit lives down here
 * rather than on the toolbar, for the same reason the Local directory's does:
 * seven category chips, a tags tray and two toggles standing open pushed the
 * first community card most of the way down the fold, for controls most
 * visitors set once or never. What stays on screen is the chip row above,
 * which says what is currently narrowing (and ordering) the list, so a closed
 * drawer hides the controls without hiding their state.
 *
 * Split out of `CommunitiesToolbar` so each stays under the repo's 200-line
 * cap: the toolbar owns the always-visible bar, this owns the drawer.
 */
export function CommunitiesRefinePanel({
  discover,
  panelProps,
}: {
  discover: DiscoverCommunities;
  panelProps: { isOpen: boolean; isSettled: boolean; panelId: string };
}) {
  const { t } = useTranslation();
  const sortLabelId = useId();
  const togglesLabelId = useId();
  const {
    sort,
    setSort,
    filter,
    setFilter,
    isOpenOnly,
    setIsOpenOnly,
    isBusyOnly,
    setIsBusyOnly,
    tagIds,
    setTagIds,
    categoryCounts,
  } = discover;

  return (
    <RefinePanel {...panelProps}>
      <CommunitiesCategoryFilter
        filter={filter}
        setFilter={setFilter}
        categoryCounts={categoryCounts}
      />

      <RefineSplit>
        <RefineGroup
          label={t("communities:discover.sort.label")}
          labelId={sortLabelId}
        >
          <Select
            size="sm"
            labelledBy={sortLabelId}
            value={sort}
            options={SORT_OPTIONS.map((option) => ({
              value: option,
              label: t(`communities:discover.sort.${option}`),
            }))}
            onChange={(next) => setSort((next as DiscoverSort) ?? sort)}
          />
        </RefineGroup>

        <RefineGroup
          label={t("communities:discover.toggle.groupLabel")}
          labelId={togglesLabelId}
          role="group"
          aria-labelledby={togglesLabelId}
        >
          <div className={styles.toggles}>
            <Button
              variant="ghost"
              size="sm"
              aria-pressed={isOpenOnly}
              className={[styles.toggle, isOpenOnly && styles.toggleOn]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setIsOpenOnly((value) => !value)}
            >
              <span className={styles.toggleDot} aria-hidden />
              {t("communities:discover.toggle.openOnly")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-pressed={isBusyOnly}
              className={[styles.toggle, isBusyOnly && styles.toggleOn]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setIsBusyOnly((value) => !value)}
            >
              <span className={styles.toggleDot} aria-hidden />
              {t("communities:discover.toggle.busyOnly")}
            </Button>
          </div>
        </RefineGroup>
      </RefineSplit>

      <CommunitiesTagsFilter selectedTagIds={tagIds} onChange={setTagIds} />
    </RefinePanel>
  );
}
