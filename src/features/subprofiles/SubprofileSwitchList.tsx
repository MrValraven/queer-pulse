import { useMemo, useState, type KeyboardEvent } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SubprofileFilterChips } from "./SubprofileFilterChips";
import { SubprofileSwitchHeader } from "./SubprofileSwitchHeader";
import { SubprofileSwitchRow } from "./SubprofileSwitchRow";
import { useNewlyVisibleSlugs } from "./useNewlyVisibleSlugs";
import type { SubprofileKind } from "./api/subprofiles.api";
import type {
  PublicSubprofileView,
  SubprofileOwnerMeta,
} from "./api/subprofiles.adapters";
import styles from "./SubprofileShowcase.module.css";

/** A row genuinely appearing for the first time (never rendered by this list
 *  before, per `useNewlyVisibleSlugs`) gets a small staggered reveal (capped
 *  so a long list doesn't crawl in) when it's newly shown by a filter pick
 *  or "show all". Rows already on screen never re-animate, and first paint
 *  never uses this at all — `SubprofileShowcase` already sits inside the
 *  profile page's section-level `Reveal`, so animating rows again on mount
 *  would be a double entrance. */
const STAGGER_STEP_MS = 60;
const STAGGER_CAP = 8;

/**
 * The list beside the featured hero — a vertical `tablist`: each row is a
 * `tab` that previews its persona into the hero `tabpanel` (it does not
 * navigate — the hero is the one opener), so this reads as a Slack/Figma-
 * style identity switcher, not a wall of links. Roving tabindex: only the
 * selected row is in the Tab order; Arrow/Home/End move both focus and
 * selection among the currently visible rows.
 *
 * When `asIndex` is set (the owner has many personas), the list gains a
 * craft filter (a separate `group`, not part of the tablist) and collapses
 * to `collapsedRows` with a "show all" toggle — the research-backed way to
 * scale past ~6 without resorting to tabs or a carousel.
 */
export function SubprofileSwitchList({
  personas,
  activeSlug,
  onSelect,
  asIndex,
  collapsedRows,
  heroId,
  tabId,
  isSelf = false,
  ownerMetaBySlug,
}: {
  personas: PublicSubprofileView[];
  activeSlug: string;
  onSelect: (slug: string) => void;
  asIndex: boolean;
  collapsedRows: number;
  /** Id of the hero panel every tab controls (`aria-controls`). */
  heroId: string;
  /** Derives a row's tab id from its persona slug — shared with the hero's
   *  `aria-labelledby` so the two stay in lockstep. */
  tabId: (slug: string) => string;
  /** Self view: the header shows a count ("4 sides") instead of the generic
   *  "More sides" label, gains an "Add another side" link, and each row
   *  shows its status/visibility. `false` on the public path (the default). */
  isSelf?: boolean;
  /** Per-persona owner-only metadata (status/visibility), keyed by slug —
   *  only ever passed in self view. */
  ownerMetaBySlug?: Map<string, SubprofileOwnerMeta>;
}) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<SubprofileKind | "all">("all");
  const [expanded, setExpanded] = useState(false);

  // Kinds present, in first-appearance order — the filter chips.
  const kinds = useMemo(() => {
    const seen: SubprofileKind[] = [];
    for (const persona of personas) {
      if (!seen.includes(persona.kind)) seen.push(persona.kind);
    }
    return seen;
  }, [personas]);

  const filtered =
    asIndex && filter !== "all"
      ? personas.filter((persona) => persona.kind === filter)
      : personas;

  // Only the unfiltered "all" view collapses; a craft filter shows all matches.
  const isCollapsed = asIndex && !expanded && filter === "all";
  const visible = isCollapsed ? filtered.slice(0, collapsedRows) : filtered;
  const hiddenCount = filtered.length - visible.length;
  const showToggle =
    asIndex && filter === "all" && personas.length > collapsedRows;

  // Tells a row that's genuinely new to `visible` (never rendered by this
  // list before) apart from one already on screen — see the hook doc for
  // why that distinction matters for the stagger below.
  const isNewRow = useNewlyVisibleSlugs(visible);

  function selectFilter(nextFilter: SubprofileKind | "all") {
    setFilter(nextFilter);
    if (nextFilter !== "all") setExpanded(true);
  }

  function toggleExpanded() {
    setExpanded((value) => !value);
  }

  // Roving-tabindex keyboard model: only the selected tab is reachable by
  // Tab; Arrow/Home/End move both the DOM focus and the selection among the
  // rows currently visible (matches the WAI-ARIA APG tablist "automatic
  // activation" pattern — there's no separate activate step here, picking a
  // row always previews it).
  function handleTablistKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const currentIndex = visible.findIndex((persona) => persona.slug === activeSlug);
    if (currentIndex === -1) return;

    let nextIndex: number;
    switch (event.key) {
      case "ArrowDown":
        nextIndex = Math.min(currentIndex + 1, visible.length - 1);
        break;
      case "ArrowUp":
        nextIndex = Math.max(currentIndex - 1, 0);
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = visible.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const nextPersona = visible[nextIndex];
    if (!nextPersona || nextPersona.slug === activeSlug) return;
    onSelect(nextPersona.slug);
    document.getElementById(tabId(nextPersona.slug))?.focus();
  }

  return (
    <div className={styles.switcher}>
      <SubprofileSwitchHeader count={personas.length} isSelf={isSelf} />

      {asIndex && kinds.length > 1 && (
        <SubprofileFilterChips
          kinds={kinds}
          filter={filter}
          onSelect={selectFilter}
        />
      )}

      <div
        className={styles.switchList}
        role="tablist"
        aria-orientation="vertical"
        aria-label={t("subprofiles:alsoAs.previewLabel")}
        onKeyDown={handleTablistKeyDown}
      >
        {visible.map((persona, index) => (
          <SubprofileSwitchRow
            key={persona.slug}
            persona={persona}
            isSelected={persona.slug === activeSlug}
            heroId={heroId}
            tabId={tabId}
            onSelect={onSelect}
            status={ownerMetaBySlug?.get(persona.slug)?.status}
            visibility={ownerMetaBySlug?.get(persona.slug)?.visibility}
            staggerDelay={
              isNewRow(persona.slug)
                ? Math.min(index, STAGGER_CAP) * STAGGER_STEP_MS
                : undefined
            }
          />
        ))}
      </div>

      {showToggle && (
        <button
          type="button"
          className={styles.more}
          aria-expanded={expanded}
          onClick={toggleExpanded}
        >
          {expanded
            ? t("subprofiles:alsoAs.showFewer")
            : t("subprofiles:alsoAs.showAll", { count: hiddenCount })}
        </button>
      )}
    </div>
  );
}
