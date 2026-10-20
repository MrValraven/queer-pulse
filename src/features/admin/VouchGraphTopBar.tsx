import { useId, useRef, useState, type JSX, type RefObject } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiChevronRight, FiSliders, FiX } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { cx } from "../../shared/lib/cx";
import { VouchGraphFiltersPanel } from "./VouchGraphFiltersPanel";
import { VouchGraphFiltersSlot } from "./VouchGraphFiltersSlot";
import { VouchGraphCountPill, VouchGraphModeTabs } from "./VouchGraphModeTabs";
import { VouchGraphSearch } from "./VouchGraphSearchBox";
import { VouchGraphViewActions } from "./VouchGraphViewActions";
import { formatPronouns } from "./trustGraph/pronouns";
import { useTrustGraph } from "./trustGraph/useTrustGraph";
import type { VouchPerson } from "./trustGraph/trustGraphModel";
import type { VouchGraphFilters, VouchMode } from "./vouchGraph.types";
import styles from "./vouchGraphShell.module.css";

export interface VouchGraphTopBarProps {
  focusPerson: VouchPerson;
  crumbs: string[];
  mode: VouchMode;
  openCaseCount: number;
  isScenesAvailable: boolean;
  search: string;
  filters: VouchGraphFilters;
  activeFilterCount: number;
  isListView: boolean;
  /** The downloads wait while the list or the invite tree is shown. */
  isDownloadDisabled: boolean;
  /** Id of the stage the mode tabs switch. */
  stageId: string;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  onGotoCrumb: (index: number) => void;
  onChangeMode: (mode: VouchMode) => void;
  onSearchChange: (value: string) => void;
  onSelectInGraph: (id: string) => void;
  onJumpToMember: (slug: string) => void;
  onFiltersChange: (next: VouchGraphFilters) => void;
  onClearFilters: () => void;
  onToggleListView: () => void;
  onCopyLink: () => void;
  onDownload: (format: "png" | "svg") => void;
  onClose: () => void;
}

const CRUMB_EASE = [0.22, 0.68, 0.16, 1] as const;
const CRUMB_SECONDS = 0.22;

/** A6: the crumb trail lists earlier focuses only; the current focus is
 *  already named in the title. The trail and each crumb grow in and fold
 *  away when the admin walks forward or jumps back. */
function VouchGraphCrumbs({
  crumbs,
  onGotoCrumb,
}: {
  crumbs: string[];
  onGotoCrumb: (index: number) => void;
}) {
  const graph = useTrustGraph();
  const { reducedMotion } = useMotionPrefs();
  const duration = reducedMotion ? 0 : CRUMB_SECONDS;
  // Clips only while moving, so focus rings show at rest.
  const foldMotion = {
    initial: { opacity: 0, width: 0, overflow: "hidden" },
    animate: { opacity: 1, width: "auto", overflow: "visible" },
    exit: {
      opacity: 0,
      width: 0,
      overflow: "hidden",
      transition: { duration, ease: CRUMB_EASE, overflow: { duration: 0 } },
    },
    transition: {
      duration,
      ease: CRUMB_EASE,
      overflow: { duration: 0, delay: duration },
    },
  } as const;
  return (
    <AnimatePresence initial={false}>
      {crumbs.length > 0 && (
        <m.ol key="crumbs" className={styles.topCrumbs} {...foldMotion}>
          <AnimatePresence initial={false}>
            {crumbs.map((personId, crumbIndex) => {
              const person = graph.peopleById[personId];
              return (
                <m.li
                  key={`${personId}-${crumbIndex}`}
                  className={styles.crumbItem}
                  {...foldMotion}
                >
                  <button
                    type="button"
                    className={styles.crumb}
                    title={person?.name}
                    aria-label={person?.name ?? personId}
                    onClick={() => onGotoCrumb(crumbIndex)}
                  >
                    {person?.initials ?? personId.slice(0, 2)}
                  </button>
                  <span className={styles.crumbSep} aria-hidden>
                    <FiChevronRight />
                  </span>
                </m.li>
              );
            })}
          </AnimatePresence>
        </m.ol>
      )}
    </AnimatePresence>
  );
}

/**
 * The trust network's top bar: title with pronouns, crumb trail, the one
 * search box (A4), mode tabs, the filters button and panel (B7), view
 * actions (E1, B9) and Close. Under 920px the shell goes full-bleed and the
 * bar packs into three rows: title with Close at the top right, the mode
 * tabs, then search, filters and the view actions.
 */
export function VouchGraphTopBar(props: VouchGraphTopBarProps): JSX.Element {
  const { focusPerson, activeFilterCount, closeButtonRef } = props;
  const { t } = useTranslation();
  const filtersPanelId = useId();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const filtersButtonRef = useRef<HTMLButtonElement>(null);
  const pronouns = formatPronouns(focusPerson.pronoun);
  const closeFilters = () => {
    setIsFiltersOpen(false);
    filtersButtonRef.current?.focus();
  };

  return (
    <div className={styles.topBarWrap}>
      <header className={styles.topBar}>
        <div className={styles.topTitle}>
          <span className={styles.eyebrow}>
            {t("admin:vouchGraph.modal.eyebrow")}
          </span>
          <div className={styles.h}>
            {focusPerson.name}
            {pronouns && <span className={styles.pron}> {pronouns}</span>}
          </div>
        </div>
        <VouchGraphCrumbs
          crumbs={props.crumbs}
          onGotoCrumb={props.onGotoCrumb}
        />
        <VouchGraphSearch
          className={styles.topSearch}
          search={props.search}
          onSearchChange={props.onSearchChange}
          onSelectInGraph={props.onSelectInGraph}
          onJumpToMember={props.onJumpToMember}
        />
        <div className={styles.topControls}>
          <VouchGraphModeTabs
            mode={props.mode}
            openCaseCount={props.openCaseCount}
            isScenesAvailable={props.isScenesAvailable}
            stageId={props.stageId}
            onChangeMode={props.onChangeMode}
          />
          <button
            ref={filtersButtonRef}
            type="button"
            className={cx(
              styles.filtersButton,
              isFiltersOpen && styles.filtersButtonOn,
            )}
            aria-expanded={isFiltersOpen}
            aria-controls={filtersPanelId}
            onClick={() => setIsFiltersOpen((isOpen) => !isOpen)}
          >
            <FiSliders aria-hidden />
            <span className={styles.filtersButtonLabel}>
              {t("admin:vouchGraph.filters.openCta")}
            </span>
            <VouchGraphCountPill
              count={activeFilterCount}
              tone="accent"
              label={t("admin:vouchGraph.filters.activeCount", {
                count: activeFilterCount,
              })}
            />
          </button>
          <VouchGraphViewActions
            isListView={props.isListView}
            isDownloadDisabled={props.isDownloadDisabled}
            onToggleListView={props.onToggleListView}
            onCopyLink={props.onCopyLink}
            onDownload={props.onDownload}
          />
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.close}
            onClick={props.onClose}
            aria-label={t("admin:common.close")}
          >
            <FiX aria-hidden />
          </button>
        </div>
      </header>
      <VouchGraphFiltersSlot
        isOpen={isFiltersOpen}
        onClose={closeFilters}
        onFocusLeave={() => setIsFiltersOpen(false)}
      >
        <VouchGraphFiltersPanel
          panelId={filtersPanelId}
          filters={props.filters}
          activeFilterCount={activeFilterCount}
          onFiltersChange={props.onFiltersChange}
          onClearFilters={props.onClearFilters}
          onClose={closeFilters}
        />
      </VouchGraphFiltersSlot>
    </div>
  );
}
