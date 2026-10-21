import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { StudioHiddenTrackNumber } from "../StudioHiddenTrack";
import hiddenCss from "../StudioHiddenTrack.module.css";
import { STUDIO_EXIT, STUDIO_FADE } from "../studioMotion";
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

/** A row that keeps its place and number and offers nothing to play: a
 *  listener's withheld track (spec 5.3), or a playlist or liked entry whose
 *  track left Studio. Same columns as `StudioTrackRow`, greyed by colour
 *  the way a hidden explicit track is, so the list never jumps. */
export function StudioTrackRowUnavailable({
  number,
  label,
  href,
  actions,
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
      <div className={css.actions}>{actions}</div>
    </m.li>
  );
}
