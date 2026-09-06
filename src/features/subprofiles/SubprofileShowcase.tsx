import { nestedPersonaPath, routes } from "../../app/routeMap";
import { Button } from "../../shared/components/ui";
import { safeHref } from "../../shared/lib/safeHref";
import { useMediaQuery } from "../../shared/hooks/useMediaQuery";
import { breakpoint, mediaMax } from "../../shared/theme/breakpoints";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  PublicSubprofileView,
  SubprofileOwnerMeta,
} from "./api/subprofiles.adapters";
import { personaTitleName } from "./subprofile-kinds";
import { SubprofileEditButton } from "./SubprofileEditButton";
import { SubprofileFeatureCard } from "./SubprofileFeatureCard";
import { SubprofileShowcaseMobile } from "./SubprofileShowcaseMobile";
import { SubprofileSwitchList } from "./SubprofileSwitchList";
import { useShowcaseActivePersona } from "./useShowcaseActivePersona";
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
 *
 * The active-persona/direction/id wiring lives in
 * {@link useShowcaseActivePersona}, kept in its own hook so this component
 * stays under the repo's 200-line-per-component cap.
 */

/** Above this many personas the switch list turns into a filterable index. */
const COLLAPSE_AT = 6;
/** Rows the collapsed index shows before "show all". */
const COLLAPSED_ROWS = 5;

export function SubprofileShowcase({
  personas,
  ownerSlug,
  isSelf = false,
  previewing = false,
  ownerMetaBySlug,
}: {
  personas: PublicSubprofileView[];
  ownerSlug: string;
  /** Self view: renders owner controls (Edit) on the hero, status/visibility
   *  badges, and an "Add another persona" affordance. `false` on the public
   *  path (the default) — this component never fetches or infers ownership
   *  itself, it only renders what the caller tells it to. */
  isSelf?: boolean;
  /** The owner is previewing their own profile as a visitor — suppress every
   *  owner control even on personas whose public `viewerIsMember` is `true`
   *  (which it stays in live mode, since the server can't see the client-only
   *  preview toggle). Without this, Edit survives the preview. */
  previewing?: boolean;
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
  // One pixel below the `lg` (760px) desktop rule so this stacked layout and
  // the min-width: 760px CSS never both apply at the boundary.
  const isNarrow = useMediaQuery(mediaMax(breakpoint.lg - 1));
  const { active, hasList, direction, heroId, tabId, setActiveSlug } =
    useShowcaseActivePersona(personas);

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
        previewing={previewing}
        ownerMetaBySlug={ownerMetaBySlug}
      />
    );
  }

  if (!active) return null;

  const activeMeta = ownerMetaBySlug?.get(active.slug);
  // Owner controls are Edit-only for now: reorder (Move up/down) needs a
  // position-swap mutation, and none of the existing dashboard code
  // (MySubprofilesPage/SideCard) sorts or writes `position` today —
  // there's no established, dual-mode-safe convention to wire against yet.
  // Shipping a Move up/down control against an unproven contract risked a
  // broken control, which the plan explicitly says not to do; Edit is safe
  // and self-contained, so it ships alone.
  //
  // A co-owner sees the same Edit control on THIS persona even when viewing
  // it nested under a co-owner's profile (`isSelf` is false there) — the
  // backend's `viewerIsMember` flag on the public DTO is the signal, so this
  // never needs an extra members fetch per card. When the owner is previewing
  // their own profile as a visitor, every owner control is suppressed even
  // though `viewerIsMember` stays true in live mode (see `previewing`).
  const canEditActive = !previewing && (isSelf || active.viewerIsMember);
  const ownerControls = canEditActive ? (
    <SubprofileEditButton subprofileId={activeMeta?.id ?? active.id} />
  ) : undefined;

  // A lone persona with a real cover reads as sparse in the capped column, its
  // right half empty — lay it out landscape instead (cover as a full-height
  // side panel beside the details), filling the section width. Without a cover
  // there's no visual anchor for the wide layout, so it stays the compact,
  // width-capped card (`.solo`).
  const loneHasCover = !hasList && Boolean(safeHref(active.coverUrl));
  const loneLayoutClass = loneHasCover ? styles.soloWide : styles.solo;

  // The nested route is addressed by the persona's OWN `ownerSlug`, which the
  // server resolves per persona to its CREATOR's profile slug. A co-owned
  // persona shows on every co-owner's profile, and the route resolves
  // `slug` + creator only, so building the link from the slug of whichever
  // profile is being viewed produced a 404, and, where that co-owner had a
  // persona of their own under the same slug, opened the OTHER persona. The
  // `ownerSlug` prop stays as the fallback for the self view, where the owner
  // list carries no per-persona owner of its own.
  const activeHref = nestedPersonaPath(
    active.ownerSlug ?? ownerSlug,
    active.slug,
  );

  return (
    <div
      className={`${styles.showcase} ${hasList ? styles.split : loneLayoutClass}`}
    >
      {/* Announces the swap for screen-reader/switch-control visitors even
          when the hero has scrolled off-screen (e.g. a long switch list on
          mobile). Content is derived from `active` every render, so it
          always reflects the current selection — no separate announce
          state to keep in sync. */}
      <p aria-live="polite" className={styles.visuallyHidden}>
        {/* The announce has no craft field of its own, so it takes the full
            "Owner Name | Poet" title rather than the beside-craft name. */}
        {t("subprofiles:alsoAs.announce", {
          name: personaTitleName({
            displayName: active.displayName,
            kind: active.kind,
            ownerName: active.ownerName,
          }),
        })}
      </p>
      <SubprofileFeatureCard
        persona={active}
        href={activeHref}
        direction={direction}
        variant={loneHasCover ? "wide" : "compact"}
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
        // A lone persona has no switch list to host "Add another persona" next
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
