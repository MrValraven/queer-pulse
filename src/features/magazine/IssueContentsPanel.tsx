import { Link } from "react-router-dom";
import { FadeIn, SkeletonLine } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import type { IssueContentsEntryDto } from "./api/issueContents.api";
import { useIssueContents } from "./api/useIssueContents";
import styles from "./IssuePage.module.css";

/** Rows drawn while the panel loads — enough to hold the page's shape. */
const SKELETON_ROW_COUNT = 4;

/** One run of consecutive entries sharing a desk section. */
interface ContentsGroup {
  section: string;
  entries: IssueContentsEntryDto[];
}

/**
 * Group by section WITHOUT reordering. The desk's array order is the reading
 * order it curated, so this is a run-length grouping: a section that appears
 * twice, split by another, stays split rather than being merged into one block
 * and silently rearranging the issue.
 */
function groupBySection(entries: IssueContentsEntryDto[]): ContentsGroup[] {
  const groups: ContentsGroup[] = [];
  for (const entry of entries) {
    const currentGroup = groups[groups.length - 1];
    if (currentGroup && currentGroup.section === entry.section) {
      currentGroup.entries.push(entry);
    } else {
      groups.push({ section: entry.section, entries: [entry] });
    }
  }
  return groups;
}

function entryHref(entry: IssueContentsEntryDto): string {
  const base = entry.kind === "deck" ? routes.deck : routes.article;
  return `${base}?id=${encodeURIComponent(entry.slug)}`;
}

function ContentsRowSkeleton() {
  return (
    <div className={styles.entry} aria-hidden>
      <div>
        <SkeletonLine width="70%" height={24} style={{ marginBottom: 8 }} />
        <SkeletonLine width="90%" height={15} />
      </div>
    </div>
  );
}

export interface IssueContentsPanelProps {
  /** The issue's display number, or undefined while it is still resolving. */
  issueNumber: string | undefined;
}

/**
 * The reader-facing "In this issue" panel (CON-05).
 *
 * The desk has always curated this: which pieces lead, in what order, each
 * with a blurb written by hand on the issue-production page. Its only
 * destination used to be an EMAIL that QueerPulse will never send, so the
 * curation now lands here, on the issue's own page.
 *
 * Renders NOTHING at all when the issue has no curated entries (an issue that
 * has not shipped, or one the desk never curated) or when the read fails: the
 * cover above it is the page, and an empty "in this issue" heading over a
 * blank space reads as a broken page rather than as an honest absence.
 */
export function IssueContentsPanel({ issueNumber }: IssueContentsPanelProps) {
  const { t } = useTranslation();
  const { contents, isLoading, isError } = useIssueContents(issueNumber);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.tocHead} aria-hidden>
          <SkeletonLine width={260} height={36} />
        </div>
        <div className={styles.entries}>
          {Array.from({ length: SKELETON_ROW_COUNT }).map((_, index) => (
            <ContentsRowSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  const entries = contents?.entries ?? [];
  if (isError || entries.length === 0) {
    return null;
  }

  return (
    <div className={styles.page}>
      <div className={styles.tocHead}>
        <h2>
          <Translation
            i18nKey="magazine:contents.liveHeading"
            components={{ em: <em /> }}
          />
        </h2>
        <div className="meta">
          {t("magazine:contents.liveMeta", { count: entries.length })}
        </div>
      </div>

      <div>
        {groupBySection(entries).map((group, groupIndex) => (
          <div
            key={`${group.section}-${groupIndex}`}
            className={styles.section}
          >
            <div className={styles.sectionH}>{group.section}</div>
            <div className={styles.entries}>
              {group.entries.map((entry, entryIndex) => (
                <FadeIn
                  as={Link}
                  key={`${entry.kind}-${entry.slug}`}
                  to={entryHref(entry)}
                  className={styles.entry}
                  delay={Math.min(entryIndex, 8) * 60}
                >
                  <div>
                    <div className={styles.entryTitle}>{entry.title}</div>
                    {entry.blurb && (
                      <div className={styles.entryDek}>{entry.blurb}</div>
                    )}
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
