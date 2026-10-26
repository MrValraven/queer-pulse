import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { m } from "motion/react";
import { FiMoreHorizontal } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { IconButton } from "../../../shared/components/ui/IconButton";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import menuCss from "../player/ui/StudioTrackMenu.module.css";
import { StudioHiddenTrackNumber } from "../StudioHiddenTrack";
import hiddenCss from "../StudioHiddenTrack.module.css";
import { STUDIO_EXIT, STUDIO_FADE } from "../studioMotion";
import { StudioMenu, type StudioMenuItem } from "./StudioMenu";
import { ROW_LAYOUT_TRANSITION } from "./studioTrackRow.types";
import type { StudioTrackRowHeadingLevel } from "./StudioTrackRowParts";
import css from "./StudioTrackRow.module.css";

interface StudioTrackRowUnavailableProps {
  number: number;
  /** What the row reads; defaults to "Unavailable" (a withheld track). */
  label?: string;
  /** Opens the page that explains it (a withdrawn release). */
  href?: string;
  /** The playlist's Remove, a liked entry's heart. */
  actions?: ReactNode;
  /** Items for a "..." menu after `actions` (a playlist editor's Move up,
   *  Move down, Remove); the row shows no menu without them. */
  menuExtraItems?: StudioMenuItem[];
  showCover?: boolean;
  headingLevel?: StudioTrackRowHeadingLevel;
  /** A line under the label: why it left ("Withdrawn by our team"). */
  details?: ReactNode;
  /** Keeps the list's leading column (an empty drag-handle cell). */
  leading?: ReactNode;
  /** Glide on a reorder or removal, as `StudioTrackRow` does. */
  isLayoutAnimated?: boolean;
}

const HEADING_TAGS = { 3: "h3", 4: "h4", 5: "h5" } as const;

/** The row's "..." with the caller's items alone: an unavailable track has
 *  nothing of its own to offer. Unavailable rows often share one label, so
 *  the trigger's name carries the row's position too. */
function UnavailableRowMenu({
  title,
  number,
  items,
}: {
  title: string;
  number: number;
  items: StudioMenuItem[];
}) {
  const { t } = useTranslation();
  return (
    <span className={css.menuSlot}>
      <span className={menuCss.wrap}>
        <StudioMenu
          trigger={
            <IconButton
              className={menuCss.trigger}
              aria-label={t("studio:trackMenu.triggerUnavailable", {
                title,
                number,
              })}
            >
              <FiMoreHorizontal aria-hidden />
            </IconButton>
          }
          label={t("studio:trackMenu.menuLabel", { title })}
          items={items}
        />
      </span>
    </span>
  );
}

/** A row that keeps its place and number and offers nothing to play: a
 *  listener's withheld track (spec 5.3), or a playlist or liked entry whose
 *  track left Studio. Same columns as `StudioTrackRow`, greyed by colour
 *  the way a hidden explicit track is, so the list never jumps. */
export function StudioTrackRowUnavailable({
  number,
  label,
  href,
  actions,
  menuExtraItems,
  showCover = true,
  headingLevel = 3,
  details,
  leading,
  isLayoutAnimated = false,
}: StudioTrackRowUnavailableProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const Heading = HEADING_TAGS[headingLevel];
  const text = label ?? t("studio:album.trackUnavailable");
  return (
    <m.li
      layout={isLayoutAnimated && !reducedMotion ? "position" : false}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: STUDIO_EXIT }}
      transition={
        reducedMotion
          ? { duration: 0.12 }
          : { ...STUDIO_FADE, layout: ROW_LAYOUT_TRANSITION }
      }
      data-hidden=""
      className={[
        css.row,
        css.rowUnavailable,
        leading !== undefined && css.hasLeading,
        showCover && css.hasCover,
        hiddenCss.hidden,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {leading !== undefined && <div className={css.leading}>{leading}</div>}
      <div className={css.lead}>
        <StudioHiddenTrackNumber position={number} />
      </div>
      {showCover && <div className={css.cover} aria-hidden="true" />}
      <div className={css.main}>
        <Heading
          className={css.title}
          aria-label={
            label
              ? undefined
              : t("studio:album.trackUnavailableAria", { number })
          }
        >
          {href ? (
            <Link to={href} className={css.titleLink}>
              {text}
            </Link>
          ) : (
            text
          )}
        </Heading>
        {details !== undefined && <div className={css.subline}>{details}</div>}
      </div>
      <div className={css.actions}>
        {actions}
        {menuExtraItems && menuExtraItems.length > 0 && (
          <UnavailableRowMenu
            title={text}
            number={number}
            items={menuExtraItems}
          />
        )}
      </div>
    </m.li>
  );
}
