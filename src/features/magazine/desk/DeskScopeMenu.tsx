import { FiCalendar, FiChevronDown, FiPlus } from "react-icons/fi";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Issue, IssueSummary } from "../data/desk.data";
import { formattedCountValues } from "./deskHeaderCopy";
import { DeskMenu, type DeskMenuItem } from "./DeskMenu";
import type { DeskTrack } from "./deskTrack";
import styles from "./DeskScopeMenu.module.css";

export interface DeskScopeMenuProps {
  /** The selected issue. `number` is `""` when the magazine has none. */
  issue: Issue;
  /** Every issue, newest number first (the order the backend returns). */
  issues: IssueSummary[];
  /** Selects the issue AND switches to the issue scope. Must be ONE URL
   *  write (`issue` and `track=issue` together): two separate
   *  `setSearchParams` calls in one tick overwrite each other. */
  onSelectIssueScope: (issueNumber: string) => void;
  track: DeskTrack;
  onTrack: (track: DeskTrack) => void;
  hasCurrentIssue: boolean;
  unassignedCount: number;
  everythingCount: number;
  /** In-flight pieces per issue id, for each issue's second line. An issue
   *  missing from the map shows its title alone. */
  pieceCountByIssueId?: Readonly<Record<string, number>>;
  onNewIssue: () => void;
  /** Opens the selected issue's production page. The item shows only while
   *  a real issue is selected. */
  onProduce?: () => void;
}

/**
 * The desk's scope switcher, drawn as the header eyebrow ("Issue 12 · Lisbon
 * summer" with a chevron). Issue, unfiled work and everything in flight are
 * three answers to one question, "what am I looking at", so they share one
 * control: this replaces the old track tabs AND the "Working on" issue picker,
 * which used to answer that question in two places.
 *
 * Choosing an issue selects it and switches to the issue scope in one step
 * (`onSelectIssueScope`), so an editor always lands on the issue they picked.
 * Issue production lives here too, beside "Start a new issue": both are about
 * the issue itself, and the header row keeps room for the New menu alone.
 */
export function DeskScopeMenu({
  issue,
  issues,
  onSelectIssueScope,
  track,
  onTrack,
  hasCurrentIssue,
  unassignedCount,
  everythingCount,
  pieceCountByIssueId,
  onNewIssue,
  onProduce,
}: DeskScopeMenuProps) {
  const { t } = useTranslation();
  const format = useFormat();

  const triggerLabel = scopeTriggerLabel();

  function scopeTriggerLabel(): string {
    if (track === "unassigned") return t("magazine:desk.scope.unfiled");
    if (track === "everything") return t("magazine:desk.scope.everything");
    if (!hasCurrentIssue || !issue.number) {
      return t("magazine:desk.trackTabs.issueNoNumber");
    }
    return issue.theme
      ? t("magazine:desk.header.eyebrow", {
          number: issue.number,
          theme: issue.theme,
        })
      : t("magazine:desk.trackTabs.issue", { number: issue.number });
  }

  function describeIssue(option: IssueSummary): string | undefined {
    const pieceCount = pieceCountByIssueId?.[option.id];
    if (pieceCount === undefined) return undefined;
    return t(
      "magazine:desk.scope.issuePieces",
      formattedCountValues(pieceCount, format.number),
    );
  }

  const issueItems: DeskMenuItem[] = issues.map((option) => ({
    kind: "radio",
    id: `issue:${option.id}`,
    label: t("magazine:desk.header.issueOption", {
      number: option.number,
      title: option.title,
    }),
    description: describeIssue(option),
    isChecked: track === "issue" && option.number === issue.number,
    onSelect: () => onSelectIssueScope(option.number),
  }));

  // A magazine with no issues yet skips the Issues group entirely; "Start a
  // new issue" at the bottom is then the way in.
  const issueGroup: DeskMenuItem[] =
    issueItems.length > 0
      ? [
          {
            kind: "heading",
            id: "issues-heading",
            label: t("magazine:desk.scope.issuesHeading"),
          },
          ...issueItems,
          { kind: "separator", id: "issues-rule" },
        ]
      : [];

  // Named by its issue ("Issue 14"), since the scope on screen may be
  // Unfiled or Everything while an issue is still the selected one.
  const hasIssue = hasCurrentIssue && issue.number !== "";
  const produceItems: DeskMenuItem[] =
    onProduce && hasIssue
      ? [
          {
            kind: "action",
            id: "produce",
            label: t("magazine:desk.header.produce"),
            description: t("magazine:desk.trackTabs.issue", {
              number: issue.number,
            }),
            icon: <FiCalendar aria-hidden />,
            onSelect: onProduce,
          },
        ]
      : [];

  const items: DeskMenuItem[] = [
    ...issueGroup,
    {
      kind: "radio",
      id: "unfiled",
      label: t("magazine:desk.scope.unfiled"),
      description: t(
        "magazine:desk.scope.unfiledDescription",
        formattedCountValues(unassignedCount, format.number),
      ),
      isChecked: track === "unassigned",
      onSelect: () => onTrack("unassigned"),
    },
    {
      kind: "radio",
      id: "everything",
      label: t("magazine:desk.scope.everything"),
      description: t(
        "magazine:desk.scope.everythingDescription",
        formattedCountValues(everythingCount, format.number),
      ),
      isChecked: track === "everything",
      onSelect: () => onTrack("everything"),
    },
    { kind: "separator", id: "new-rule" },
    ...produceItems,
    {
      kind: "action",
      id: "new-issue",
      label: t("magazine:desk.scope.newIssue"),
      icon: <FiPlus aria-hidden />,
      onSelect: onNewIssue,
    },
  ];

  return (
    <DeskMenu
      label={t("magazine:desk.scope.menuLabel")}
      items={items}
      minWidth="md"
      renderTrigger={(triggerProps, isOpen) => (
        <button
          {...triggerProps}
          className={styles.trigger}
          data-open={isOpen || undefined}
        >
          {/* The visible label names the scope; this prefix adds what the
              button does, so a screen reader hears "Change what the desk
              shows: Issue 14 · Aftercare". */}
          <span className="visuallyHidden">
            {`${t("magazine:desk.scope.triggerPrefix")} `}
          </span>
          <span className={styles.label}>{triggerLabel}</span>
          <FiChevronDown className={styles.chevron} aria-hidden />
        </button>
      )}
    />
  );
}
