import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiChevronRight } from "react-icons/fi";
import { linkToPath } from "../../../app/routeMap";
import { NavBuildBadge } from "./NavBuildBadge";
import { useTranslation } from "../../i18n/useTranslation";
import type {
  MoreSheetLayoutProps,
  VisibleMobileNavSection,
  VisibleMobileNavTile,
} from "./useMobileNavSections";
import styles from "./MoreSheetRows.module.css";

/** How many tiles the first section lifts out of its list as shortcut cards. */
const SHORTCUT_COUNT = 2;

/**
 * The brand fill a shortcut card wears. The pair always reads coral then
 * plum, so the variant follows the card's position in the pair.
 */
type ShortcutVariant = "coral" | "plum";

interface RowsSectionProps {
  section: VisibleMobileNavSection;
  sectionIndex: number;
  onNavigate: () => void;
}

/**
 * A stable DOM id for a tile's description, derived from its href so it stays
 * the same across renders and unique across the sheet (every href is listed
 * once). Anything outside the id-safe set becomes a hyphen.
 */
function descriptionIdFor(href: string): string {
  return `more-sheet-description-${href.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

interface TileLinkProps {
  tile: VisibleMobileNavTile;
  onNavigate: () => void;
}

interface ShortcutLinkProps extends TileLinkProps {
  variant: ShortcutVariant;
}

/**
 * The phone "More" sheet layout: grouped inset lists in the iOS Settings
 * pattern, each section one rounded card of rows with a quiet plum-tinted
 * chip, label over description and a chevron. The first section lifts its
 * first two tiles into a coral and a plum shortcut card above its list.
 */
export function MoreSheetRows({ sections, onNavigate }: MoreSheetLayoutProps) {
  return (
    <div className={styles.root}>
      {sections.map((section, sectionIndex) => (
        <RowsSection
          key={section.headKey}
          section={section}
          sectionIndex={sectionIndex}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}

function RowsSection({ section, sectionIndex, onNavigate }: RowsSectionProps) {
  const { t } = useTranslation();
  const headingId = `mobile-nav-rows-${section.headKey}`;
  const subtitleKey =
    section.subtitleKey ?? section.headKey.replace(".title", ".subtitle");
  // Only the opening section promotes shortcuts, and only when it still has
  // rows of its own left beneath them after the visibility filter.
  const hasShortcuts =
    sectionIndex === 0 && section.tiles.length > SHORTCUT_COUNT + 1;
  const shortcutTiles = hasShortcuts
    ? section.tiles.slice(0, SHORTCUT_COUNT)
    : [];
  const rowTiles = hasShortcuts
    ? section.tiles.slice(SHORTCUT_COUNT)
    : section.tiles;
  const entranceStyle = { "--i": sectionIndex } as CSSProperties;
  return (
    <section
      className={styles.section}
      style={entranceStyle}
      aria-labelledby={headingId}
    >
      <header className={styles.sectionHead}>
        <h2 id={headingId} className={styles.sectionTitle}>
          {t(section.headKey)}
        </h2>
        <p className={styles.sectionSubtitle}>{t(subtitleKey)}</p>
      </header>
      {shortcutTiles.length > 0 && (
        <ul className={styles.shortcuts}>
          {shortcutTiles.map((tile, shortcutIndex) => (
            <li key={tile.href} className={styles.shortcutItem}>
              <ShortcutLink
                tile={tile}
                variant={shortcutIndex === 0 ? "coral" : "plum"}
                onNavigate={onNavigate}
              />
            </li>
          ))}
        </ul>
      )}
      <ul className={styles.card}>
        {rowTiles.map((tile) => (
          <li key={tile.href} className={styles.item}>
            <RowLink tile={tile} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function RowLink({ tile, onNavigate }: TileLinkProps) {
  const { t } = useTranslation();
  const Icon = tile.icon;
  const descriptionId = descriptionIdFor(tile.href);
  return (
    <Link
      to={linkToPath(tile.href)}
      // Overwrites the history entry MobileNavDrawer's provider pushed for the
      // Back gesture instead of stacking on it. Only ever rendered inside that
      // drawer, so this is always the right call.
      replace
      className={styles.row}
      aria-describedby={descriptionId}
      onClick={onNavigate}
    >
      <span className={styles.chip} aria-hidden>
        <Icon />
      </span>
      <span className={styles.text}>
        <span className={styles.labelLine}>
          <span className={styles.label}>{t(tile.labelKey)}</span>
          {tile.isBeingBuilt && (
            <span className={styles.badge}>
              <NavBuildBadge />
            </span>
          )}
        </span>
        {/* Hidden from the link's name so it reads as the label alone; the
            aria-describedby above still announces it as the description. */}
        <span id={descriptionId} className={styles.description} aria-hidden>
          {t(tile.descriptionKey)}
        </span>
      </span>
      <span className={styles.chevron} aria-hidden>
        <FiChevronRight />
      </span>
    </Link>
  );
}

function ShortcutLink({ tile, variant, onNavigate }: ShortcutLinkProps) {
  const { t } = useTranslation();
  const Icon = tile.icon;
  const descriptionId = descriptionIdFor(tile.href);
  return (
    <Link
      to={linkToPath(tile.href)}
      // Same history contract as RowLink above.
      replace
      className={styles.shortcut}
      data-variant={variant}
      aria-describedby={descriptionId}
      onClick={onNavigate}
    >
      <span className={styles.shortcutTop} aria-hidden>
        <span className={styles.shortcutIcon}>
          <Icon />
        </span>
        <span className={styles.shortcutArrow}>
          <FiArrowRight />
        </span>
      </span>
      <span className={styles.shortcutLabel}>
        <span>{t(tile.labelKey)}</span>
        {tile.isBeingBuilt && (
          <span className={styles.shortcutBadge}>
            <NavBuildBadge />
          </span>
        )}
      </span>
      <span
        id={descriptionId}
        className={styles.shortcutDescription}
        aria-hidden
      >
        {t(tile.descriptionKey)}
      </span>
    </Link>
  );
}
