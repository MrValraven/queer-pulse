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
    tagCounts,
    openToAllCount,
    busyCount,
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
            <QuickFilterToggle
              label={t("communities:discover.toggle.openOnly")}
              count={openToAllCount}
              isOn={isOpenOnly}
              onToggle={() => setIsOpenOnly((value) => !value)}
            />
            <QuickFilterToggle
              label={t("communities:discover.toggle.busyOnly")}
              count={busyCount}
              isOn={isBusyOnly}
              onToggle={() => setIsBusyOnly((value) => !value)}
            />
          </div>
        </RefineGroup>
      </RefineSplit>

      <CommunitiesTagsFilter
        selectedTagIds={tagIds}
        onChange={setTagIds}
        tagCounts={tagCounts}
      />
    </RefinePanel>
  );
}

/**
 * One of the drawer's two pill toggles, with the live availability count the
 * chip rows beside it already carry (`ChipSelect`'s badge, same treatment).
 *
 * `count` is `undefined` while the first page is still in flight, and on a
 * server that predates the facet. That renders as NO badge and never as a
 * disabled pill: "not counted" and "nobody is here" are different answers, and
 * only the second one may take a filter away from a member.
 */
function QuickFilterToggle({
  label,
  count,
  isOn,
  onToggle,
}: {
  label: string;
  count: number | undefined;
  isOn: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  // Nothing left to find under this toggle, so picking it could only empty the
  // grid. Never while it is already on, or it could not be switched back off.
  const isUnavailable = count === 0 && !isOn;
  return (
    <Button
      variant="ghost"
      size="sm"
      aria-pressed={isOn}
      // The badge is aria-hidden, so the pill carries the whole phrase as its
      // name: "Busy this week, 4 communities", never "Busy this week 4".
      aria-label={
        count === undefined
          ? undefined
          : t("communities:discover.toggle.withCount", { label, count })
      }
      disabled={isUnavailable}
      className={[styles.toggle, isOn && styles.toggleOn]
        .filter(Boolean)
        .join(" ")}
      onClick={onToggle}
    >
      <span className={styles.toggleDot} aria-hidden />
      {label}
      {count !== undefined && (
        <span className={styles.toggleCount} aria-hidden>
          {count}
        </span>
      )}
    </Button>
  );
}
