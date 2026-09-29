import { useId, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { Collapse, SkeletonLine } from "../../../../shared/components/ui";
import { useFormat } from "../../../../shared/i18n/format";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { cx } from "../../../../shared/lib/cx";
import type { DeskActivityView } from "../../api/useDeskSummary";
import { stripEm } from "../../data/desk.copy";
import type { Editor } from "../../data/desk.data";
import { formattedCountValues } from "../deskHeaderCopy";
import { RailAvatar } from "./RailAvatar";
import { avatarIdentity } from "./railIdentity";
import styles from "./rail.module.css";
import { RailCard } from "./RailCard";

/** How many entries show before "See all" opens the rest. */
const LATEST_ENTRY_COUNT = 5;

export interface ActivityCardProps {
  /** Newest first, as `useDeskSummary` returns it; `undefined` while the
   *  summary is still loading. */
  activity: DeskActivityView[] | undefined;
  editors: Editor[];
}

/**
 * What changed lately on the desk. The five newest entries always show; "See
 * all" unfolds the rest in place, so the rail keeps its shape and nothing
 * navigates away. Entries arrive resolved to a name and a phrase naming the
 * piece by its title, the same rendering rules as the old sidebar feed.
 */
export function ActivityCard({ activity, editors }: ActivityCardProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const [isExpanded, setIsExpanded] = useState(false);
  const moreListId = useId();
  const entries = activity ?? [];
  const latestEntries = entries.slice(0, LATEST_ENTRY_COUNT);
  const olderEntries = entries.slice(LATEST_ENTRY_COUNT);

  function renderEntry(entry: DeskActivityView) {
    const editor = editors.find((candidate) => candidate.id === entry.actorId);
    const who = entry.who || t("magazine:desk.sidebar.someone");
    const identity = avatarIdentity(editor, who);
    return (
      <li className={styles.feedRow} key={entry.id}>
        <RailAvatar initials={identity.initials} tint={identity.tint} />
        <span>
          <b className={styles.actor}>{who}</b> {stripEm(entry.what)}{" "}
          <time className={styles.feedTime}>{entry.when}</time>
        </span>
      </li>
    );
  }

  return (
    <RailCard kind="activity" title={t("magazine:desk.sidebar.activity")}>
      {activity === undefined ? (
        <div className={styles.feed} aria-hidden="true">
          <SkeletonLine height={14} />
          <SkeletonLine height={14} width="80%" />
          <SkeletonLine height={14} width="60%" />
        </div>
      ) : entries.length === 0 ? (
        <p className={styles.emptyNote}>
          {t("magazine:desk.sidebar.nothingHereYet")}
        </p>
      ) : (
        <>
          <ul className={styles.feed}>{latestEntries.map(renderEntry)}</ul>
          {olderEntries.length > 0 ? (
            <>
              <div id={moreListId}>
                <Collapse isOpen={isExpanded}>
                  <ul className={cx(styles.feed, styles.feedMore)}>
                    {olderEntries.map(renderEntry)}
                  </ul>
                </Collapse>
              </div>
              <button
                type="button"
                className={styles.textButton}
                aria-expanded={isExpanded}
                aria-controls={moreListId}
                onClick={() => setIsExpanded((wasExpanded) => !wasExpanded)}
              >
                <FiChevronDown
                  aria-hidden="true"
                  className={styles.disclosureIcon}
                />
                {isExpanded
                  ? t("magazine:desk.rail.activity.showLess")
                  : t(
                      "magazine:desk.rail.activity.seeAll",
                      formattedCountValues(entries.length, format.number),
                    )}
              </button>
            </>
          ) : null}
        </>
      )}
    </RailCard>
  );
}
