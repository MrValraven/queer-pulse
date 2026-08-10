import { FiChevronRight } from "react-icons/fi";
import { MemberIdentity } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
import { ACCENT_TOKENS, DEFAULT_ACCENT } from "./subprofilePresence.data";
import { SubprofileOwnerBadges } from "./SubprofileOwnerBadges";
import type { PublicSubprofileView } from "./api/subprofiles.adapters";
import type { SubprofileStatus, Visibility } from "./api/subprofiles.api";
import styles from "./SubprofileShowcase.module.css";

/**
 * One tab in {@link SubprofileSwitchList}'s vertical tablist. Extracted so
 * the list stays under the 200-line cap; owns nothing beyond its own markup
 * — selection, filtering, and the roving-tabindex keyboard model all live in
 * the parent list.
 *
 * `staggerDelay` is only ever set once the visitor has filtered/expanded the
 * list (never on first paint — the section already sits inside the page's
 * `Reveal`, so animating rows again on mount would double the entrance).
 * `undefined` renders the row with no entrance motion.
 *
 * The row is ALWAYS the same `<button>` element — entrance is applied purely
 * via a CSS class + `--row-fade-delay` custom property, never by swapping to
 * a different wrapper element (e.g. `FadeIn`). Two different element types at
 * the same React key remount on the render where `isNewRow` flips (typically
 * the very render caused by clicking/arrowing onto this row), which drops
 * DOM focus off the just-activated tab — a real keyboard-tablist regression.
 * Keeping the element type stable means the class simply gets removed next
 * render, with no remount and no focus loss.
 */
export function SubprofileSwitchRow({
  persona,
  isSelected,
  heroId,
  tabId,
  onSelect,
  status,
  visibility,
  staggerDelay,
}: {
  persona: PublicSubprofileView;
  isSelected: boolean;
  heroId: string;
  tabId: (slug: string) => string;
  onSelect: (slug: string) => void;
  /** Self view only: draft/published, rendered `compact` (draft-only) via
   *  `SubprofileOwnerBadges`. */
  status?: SubprofileStatus;
  /** Self view only: shows a `VisibilityBadge` for this persona's visibility. */
  visibility?: Visibility;
  staggerDelay?: number;
}) {
  const { t } = useTranslation();
  const accent = persona.accent ?? DEFAULT_ACCENT;
  const { tint, on } = ACCENT_TOKENS[accent];
  // "kind · tagline" — the aka-card secondary line. Falls back to the kind
  // alone when the persona has no tagline set.
  const kindLabel = t(KIND_LABEL_KEYS[persona.kind]);
  const secondary = persona.tagline ? `${kindLabel} · ${persona.tagline}` : kindLabel;

  const rowContent = (
    <>
      {/* Avatar + display name + "kind · tagline" line reuse the shared
          identity block (fixed persona plum tint). No `to` — this row is
          itself a `<button role="tab">`, so a nested link is disallowed. The
          owner badges and the trailing active-state/chevron indicators stay
          row-local siblings around it. */}
      <MemberIdentity
        person={{ name: persona.displayName, avatarUrl: persona.avatarUrl ?? undefined }}
        tint="plum"
        size={38}
        secondary={secondary}
      />
      <SubprofileOwnerBadges
        status={status}
        visibility={visibility}
        compact
        className={styles.rowBadges}
      />
      <span className={styles.rowTrailing}>
        <span className={styles.rowActive} data-active={isSelected} aria-hidden />
        <FiChevronRight className={styles.rowChevron} aria-hidden />
      </span>
    </>
  );

  const isEntering = staggerDelay !== undefined;

  return (
    <button
      type="button"
      role="tab"
      id={tabId(persona.slug)}
      className={isEntering ? `${styles.row} ${styles.rowEntering}` : styles.row}
      aria-selected={isSelected}
      aria-controls={heroId}
      tabIndex={isSelected ? 0 : -1}
      style={{
        ["--accent-tint" as string]: tint,
        ["--accent-on" as string]: on,
        ...(isEntering ? { ["--row-fade-delay" as string]: `${staggerDelay}ms` } : {}),
      }}
      onClick={() => onSelect(persona.slug)}
    >
      {rowContent}
    </button>
  );
}
