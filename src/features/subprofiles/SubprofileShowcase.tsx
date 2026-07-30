import { useEffect, useId, useRef, useState } from "react";
import { nestedPersonaPath, routes } from "../../app/routeMap";
import { Button } from "../../shared/components/ui";
import { useMediaQuery } from "../../shared/hooks/useMediaQuery";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  PublicSubprofileView,
  SubprofileOwnerMeta,
} from "./api/subprofiles.adapters";
import { SubprofileEditButton } from "./SubprofileEditButton";
import { SubprofileFeatureCard } from "./SubprofileFeatureCard";
import { SubprofileShowcaseMobile } from "./SubprofileShowcaseMobile";
import { SubprofileSwitchList } from "./SubprofileSwitchList";
import styles from "./SubprofileShowcase.module.css";

/**
 * The main profile's "Also working as" body: one featured persona (the hero)
 * beside a switch list of all the personas. Selecting a persona previews it into
 * the hero; the hero is the single link that opens the persona page.
 *
 * One responsive component covers the whole range: with 2–6 personas the list
 * shows everyone; past {@link COLLAPSE_AT} it becomes a filterable, collapsed
 * index (the hero stays put) — so it never falls back to tabs or a carousel,
 * both of which hide options as the count grows.
 */

/** Above this many personas the switch list turns into a filterable index. */
const COLLAPSE_AT = 6;
/** Rows the collapsed index shows before "show all". */
const COLLAPSED_ROWS = 5;

export function SubprofileShowcase({
  personas,
  ownerSlug,
  isSelf = false,
  ownerMetaBySlug,
}: {
  personas: PublicSubprofileView[];
  ownerSlug: string;
  /** Self view: renders owner controls (Edit) on the hero, status/visibility
   *  badges, and an "Add another side" affordance. `false` on the public
   *  path (the default) — this component never fetches or infers ownership
   *  itself, it only renders what the caller tells it to. */
  isSelf?: boolean;
  /** Per-persona owner-only metadata (status/visibility/id), keyed by slug —
   *  only ever passed in self view. `PublicSubprofileView` has no room for
   *  these fields, so they travel alongside instead of being merged in (see
   *  `SubprofileOwnerMeta`). */
  ownerMetaBySlug?: Map<string, SubprofileOwnerMeta>;
}) {
  const { t } = useTranslation();
  // Below 760px the hero-beside-switch-list split falls apart stacked (the
  // hero scrolls off-screen once a lower row is picked) — the mobile
  // accordion (`SubprofileShowcaseMobile`) replaces it entirely. Called
  // unconditionally alongside the other hooks, above every early return, so
  // this component's hook order never changes between renders.
  const isNarrow = useMediaQuery("(max-width: 759px)");
  const [activeSlug, setActiveSlug] = useState(personas[0]?.slug ?? "");
  // Tracks the previously active persona's index so we can derive which way
  // the hero should slide in when the visitor picks a different row — down
  // when moving to a later persona, up when moving to an earlier one.
  const previousIndexRef = useRef(0);

  // A stable base id (React 19 `useId`) this render tree can derive matching
  // ids from: the hero panel itself (`heroId`, targeted by every tab's
  // `aria-controls`) and one id per persona's tab row (`tabId`, targeted by
  // the hero's `aria-labelledby`). Kept here — not inside the switch list —
  // so both the hero and the list agree on the same ids without either
  // owning the other's DOM.
  const heroId = useId();
  const tabIdBase = useId();
  const tabId = (slug: string) => `${tabIdBase}-tab-${slug}`;

  // Fall back to the first persona if the selected slug ever drops out (e.g. the
  // list changed underneath us). Never render an empty hero.
  const active =
    personas.find((persona) => persona.slug === activeSlug) ?? personas[0];

  const hasList = personas.length > 1;

  // -1 when `active` is undefined (empty `personas`) — kept as a hook-order-
  // stable computation (no early return above this point) so the effect
  // below is always called in the same order every render.
  const nextIndex = active
    ? personas.findIndex((persona) => persona.slug === active.slug)
    : -1;
  // Reading the previous committed index during render is deliberate: the slide
  // direction must be COMMITTED to the DOM to trigger the CSS animation, so the
  // ref is updated in the effect below (after commit), never during render. A
  // during-render setState would discard the direction-bearing render and
  // collapse every transition to "none". Read once into a local here so the
  // direction expression itself stays ref-free.
  // eslint-disable-next-line react-hooks/refs -- holds the last committed index; see above
  const previousIndex = previousIndexRef.current;
  const direction: "up" | "down" | "none" =
    nextIndex > previousIndex
      ? "down"
      : nextIndex < previousIndex
        ? "up"
        : "none";
  // Written in an effect, not during render: StrictMode double-invokes the
  // render body, and a raw ref write during render would be overwritten by
  // the second pass before it could be read — collapsing every direction to
  // "none". An update effect runs once per committed render, after both
  // passes, so it always reads/writes a stable previous index.
  useEffect(() => {
    if (nextIndex >= 0) {
      previousIndexRef.current = nextIndex;
    }
  }, [nextIndex]);

  if (isNarrow) {
    // Owner mode threads through the mobile path too — same `isSelf`/
    // `ownerMetaBySlug` the split path uses below — so a signed-in owner
    // gets the same Follow/Endorse-disabled, Edit/badges/add-another
    // self view on a phone as on desktop.
    return (
      <SubprofileShowcaseMobile
        personas={personas}
        ownerSlug={ownerSlug}
        isSelf={isSelf}
        ownerMetaBySlug={ownerMetaBySlug}
      />
    );
  }

  if (!active) return null;

  const activeMeta = ownerMetaBySlug?.get(active.slug);
  // Owner controls are Edit-only for now: reorder (Move up/down) needs a
  // position-swap mutation, and none of the existing dashboard code
  // (MySubprofilesPage/MySubprofileRow) sorts or writes `position` today —
  // there's no established, dual-mode-safe convention to wire against yet.
  // Shipping a Move up/down control against an unproven contract risked a
  // broken control, which the plan explicitly says not to do; Edit is safe
  // and self-contained, so it ships alone.
  const ownerControls =
    isSelf && activeMeta ? (
      <SubprofileEditButton subprofileId={activeMeta.id} />
    ) : undefined;

  return (
    <div
      className={`${styles.showcase} ${hasList ? styles.split : styles.solo}`}
    >
      {/* Announces the swap for screen-reader/switch-control visitors even
          when the hero has scrolled off-screen (e.g. a long switch list on
          mobile). Content is derived from `active` every render, so it
          always reflects the current selection — no separate announce
          state to keep in sync. */}
      <p aria-live="polite" className={styles.visuallyHidden}>
        {t("subprofiles:alsoAs.announce", { name: active.displayName })}
      </p>
      <SubprofileFeatureCard
        persona={active}
        href={nestedPersonaPath(ownerSlug, active.slug)}
        direction={direction}
        id={hasList ? heroId : undefined}
        role={hasList ? "tabpanel" : undefined}
        ariaLabelledby={hasList ? tabId(active.slug) : undefined}
        ownerControls={ownerControls}
        status={activeMeta?.status}
        visibility={activeMeta?.visibility}
        isOwnerViewing={isSelf}
      />
      {hasList ? (
        <SubprofileSwitchList
          personas={personas}
          activeSlug={active.slug}
          onSelect={setActiveSlug}
          asIndex={personas.length > COLLAPSE_AT}
          collapsedRows={COLLAPSED_ROWS}
          heroId={heroId}
          tabId={tabId}
          isSelf={isSelf}
          ownerMetaBySlug={ownerMetaBySlug}
        />
      ) : (
        // A lone persona has no switch list to host "Add another side" next
        // to — render it directly under the capped-width hero instead.
        isSelf && (
          <Button
            variant="ghost"
            size="md"
            to={routes.subprofilesDashboard}
            className={styles.soloAddAnother}
          >
            {t("subprofiles:alsoAs.addAnother")}
          </Button>
        )
      )}
    </div>
  );
}
