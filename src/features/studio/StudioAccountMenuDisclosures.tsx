import { useEffect, useId, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import type { IconType } from "react-icons";
import { FiChevronDown, FiLifeBuoy } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { routes } from "../../app/routeMap";
import { Avatar, Button, Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioArtistRefView } from "./api/studio.adapters";
import { useStudioAccess } from "./api/useStudioAccess";
import {
  STUDIO_MENU_ARTIST_PAGES_SHOWN,
  type StudioAccountMenuItem,
} from "./studioAccountMenu.data";
import { useStudioMenuShouldReplace } from "./studioAccountMenuNavigation";
import { StudioAccountMenuLink } from "./StudioAccountMenuRows";
import styles from "./StudioAccountMenu.module.css";

/** Collapse grows over 280ms; the Help rows scroll into view a beat after,
 *  once they have their full height. With reduced motion Collapse opens at
 *  once, so a frame or two is enough. */
const HELP_REVEAL_DELAY_MS = 300;
const HELP_REVEAL_REDUCED_DELAY_MS = 40;

/** The member's artist pages: the first few, then the rest behind a
 *  "Show all" toggle. The artist page in view reads as the current page;
 *  the persona acting now reads as the current item. */
export function StudioAccountMenuArtistPages({
  persona,
  onNavigate,
}: {
  persona: StudioArtistRefView | null;
  onNavigate: () => void;
}) {
  const { t } = useTranslation();
  const shouldReplace = useStudioMenuShouldReplace();
  const { uploadablePersonas } = useStudioAccess();
  const location = useLocation();
  const headingId = useId();
  const restId = useId();
  const viewedArtistId =
    location.pathname === routes.studioArtist
      ? new URLSearchParams(location.search).get("id")
      : null;
  const isArtistViewed = (artist: StudioArtistRefView) =>
    viewedArtistId === artist.id;
  const isArtistActive = (artist: StudioArtistRefView) =>
    persona?.id === artist.id || isArtistViewed(artist);
  const shownArtists = uploadablePersonas.slice(
    0,
    STUDIO_MENU_ARTIST_PAGES_SHOWN,
  );
  const restArtists = uploadablePersonas.slice(STUDIO_MENU_ARTIST_PAGES_SHOWN);
  // Opens already when the current artist page sits in the folded rest.
  const [isShowingAll, setIsShowingAll] = useState(() =>
    restArtists.some(isArtistActive),
  );
  if (uploadablePersonas.length === 0) return null;

  const renderArtist = (artist: StudioArtistRefView) => {
    const isActive = isArtistActive(artist);
    // "page" only for the artist page in view; the acting persona on any
    // other page reads as the current item of the list.
    const currentState = isArtistViewed(artist)
      ? "page"
      : isActive
        ? "true"
        : undefined;
    return (
      <Link
        key={artist.id}
        to={artist.href}
        replace={shouldReplace}
        className={[styles.item, isActive && styles.itemActive]
          .filter(Boolean)
          .join(" ")}
        aria-current={currentState}
        onClick={onNavigate}
      >
        <Avatar
          initials={artist.initials}
          src={artist.avatarUrl ?? undefined}
          size={22}
          alt=""
        />
        <span className={styles.itemLabel}>{artist.name}</span>
      </Link>
    );
  };

  return (
    <>
      <div className={styles.divider} />
      <div className={styles.groupLabel} id={headingId}>
        {t("studio:shell.menu.artistPages")}
      </div>
      <div role="group" aria-labelledby={headingId}>
        {shownArtists.map(renderArtist)}
        {restArtists.length > 0 && (
          <>
            <div id={restId}>
              <Collapse isOpen={isShowingAll}>
                {restArtists.map(renderArtist)}
              </Collapse>
            </div>
            <StudioAccountMenuToggle
              isOpen={isShowingAll}
              controlsId={restId}
              label={
                isShowingAll
                  ? t("studio:shell.menu.showFewer")
                  : t("studio:shell.menu.showAll", {
                      count: uploadablePersonas.length,
                    })
              }
              onToggle={() => setIsShowingAll((isShowing) => !isShowing)}
            />
          </>
        )}
      </div>
    </>
  );
}

/** "Help and info": a toggle that reveals the help and policy pages,
 *  indented under it. It opens already on one of those pages. Opening it
 *  by hand scrolls the revealed rows into view once Collapse has grown,
 *  since they sit at the foot of the menu's scroll region. */
export function StudioAccountMenuHelp({
  items,
  onNavigate,
}: {
  items: StudioAccountMenuItem[];
  onNavigate: () => void;
}) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { reducedMotion } = useMotionPrefs();
  const panelId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const shouldRevealRef = useRef(false);
  const [isOpen, setIsOpen] = useState(() =>
    items.some((item) => item.to === pathname),
  );
  useEffect(() => {
    if (!isOpen || !shouldRevealRef.current) return;
    shouldRevealRef.current = false;
    const timer = window.setTimeout(
      () => {
        const lastRow = listRef.current?.querySelector("a:last-of-type");
        // jsdom leaves scrollIntoView undefined.
        if (!lastRow || typeof lastRow.scrollIntoView !== "function") return;
        lastRow.scrollIntoView({
          block: "nearest",
          behavior: reducedMotion ? "auto" : "smooth",
        });
      },
      reducedMotion ? HELP_REVEAL_REDUCED_DELAY_MS : HELP_REVEAL_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [isOpen, reducedMotion]);
  return (
    <>
      <StudioAccountMenuToggle
        isOpen={isOpen}
        controlsId={panelId}
        icon={FiLifeBuoy}
        label={t("studio:rail.live.utilityLabel")}
        onToggle={() => {
          shouldRevealRef.current = !isOpen;
          setIsOpen((isShowing) => !isShowing);
        }}
      />
      <div id={panelId} ref={listRef}>
        <Collapse isOpen={isOpen}>
          {items.map((item) => (
            <StudioAccountMenuLink
              key={`${item.labelKey}-${item.to}`}
              item={item}
              onNavigate={onNavigate}
              isNested
            />
          ))}
        </Collapse>
      </div>
    </>
  );
}

/** A disclosure row: an optional icon, the label, and a chevron that turns
 *  over while the rows it controls are open. */
function StudioAccountMenuToggle({
  isOpen,
  controlsId,
  icon: Icon,
  label,
  onToggle,
}: {
  isOpen: boolean;
  controlsId: string;
  icon?: IconType;
  label: string;
  onToggle: () => void;
}) {
  return (
    <Button
      variant="quiet"
      className={`${styles.item} ${styles.itemButton}`}
      aria-expanded={isOpen}
      aria-controls={controlsId}
      onClick={onToggle}
    >
      {Icon && <Icon aria-hidden className={styles.itemIcon} />}
      <span className={styles.itemLabel}>{label}</span>
      <FiChevronDown
        aria-hidden
        className={[
          styles.itemIcon,
          styles.chevron,
          isOpen && styles.chevronOpen,
        ]
          .filter(Boolean)
          .join(" ")}
      />
    </Button>
  );
}
