import { useState, type ReactNode } from "react";
import { FiCalendar, FiShare2 } from "react-icons/fi";
import { IconButton, Tooltip } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AddToCalendarSheet } from "../../shared/components/calendar/AddToCalendarSheet";
import { GatheringBookmarkButton } from "./GatheringBookmarkButton";
import {
  gatheringCalendarSubtitle,
  toCalendarInput,
} from "./gatheringCalendarInput";
import { shareGathering } from "./shareGathering";
import type { GatheringDetail } from "./data";
import styles from "./GatheringHeaderToolbar.module.css";

/**
 * The quiet icon row at the top-right of the gathering header: Save, "Add to
 * calendar", Share, and then whatever host controls the page hands in.
 *
 * WHY ICONS. These used to be full-size buttons in the hero beside the RSVP,
 * and four buttons of equal weight made the one action that matters (taking a
 * seat) compete with three that are conveniences. Moving the conveniences up
 * here, on the same line as the type label, leaves the RSVP alone as the hero
 * action. Each icon keeps its words through an aria-label and a tooltip, so
 * nothing is lost for a screen reader or a member unsure what a glyph means.
 *
 * It is a `role="group"` with plain tab order. A `toolbar` promises arrow-key
 * roving focus, and three or four buttons do not need it.
 *
 * `isCalendarAvailable` comes from the page's RSVP state: once the evening is
 * over or cancelled, offering to diarise it makes no sense, so the icon goes.
 */
export function GatheringHeaderToolbar({
  gathering,
  routeParam,
  isCalendarAvailable,
  hostMenu,
}: {
  gathering: GatheringDetail;
  /** The raw `:slug` route param. The bookmark toggle keys its cache on it. */
  routeParam: string | undefined;
  isCalendarAvailable: boolean;
  /** Host-only controls, rendered last so the member actions keep their place. */
  hostMenu?: ReactNode;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const { showToast } = useToast();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarLabel = t("shared:addToCalendar.title");
  const shareLabel = t("gatherings:headerToolbar.shareCta");

  return (
    <>
      <div
        role="group"
        aria-label={t("gatherings:headerToolbar.aria")}
        className={styles.toolbar}
      >
        <GatheringBookmarkButton
          slug={gathering.slug}
          param={routeParam}
          bookmarked={gathering.bookmarked ?? false}
          isCompact
          className={styles.saveButton}
        />
        {isCalendarAvailable && (
          <Tooltip label={calendarLabel} placement="bottom">
            <IconButton
              aria-label={calendarLabel}
              onClick={() => setIsCalendarOpen(true)}
            >
              <FiCalendar aria-hidden />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip label={shareLabel} placement="bottom">
          <IconButton
            aria-label={shareLabel}
            onClick={() => void shareGathering(gathering, t, showToast)}
          >
            <FiShare2 aria-hidden />
          </IconButton>
        </Tooltip>
        {hostMenu}
      </div>
      {isCalendarOpen && (
        <AddToCalendarSheet
          input={toCalendarInput(gathering)}
          subtitle={gatheringCalendarSubtitle(gathering, formatters)}
          filename={`${gathering.title.replace(/\s+/g, "-")}.ics`}
          onToast={(message) => showToast(message, "success")}
          onClose={() => setIsCalendarOpen(false)}
        />
      )}
    </>
  );
}
