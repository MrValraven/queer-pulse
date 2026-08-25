import {
  FiBookOpen,
  FiCalendar,
  FiEdit3,
  FiFileText,
  FiGrid,
  FiList,
  FiPlus,
  FiUser,
} from "react-icons/fi";
import { Button, SegmentedControl, Select } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Editor, Issue, IssueSummary } from "../data/desk.data";
import type { DeskTrack } from "./DeskTrackTabs";
import styles from "./DeskHeader.module.css";

/** The three desk layouts a piece pipeline can render in. */
export type DeskLayout = "list" | "board" | "plan";

/**
 * Desk page header. On the Issue track it shows the issue eyebrow + title,
 * close/publish meta and the slot-progress track. On the Unassigned track it
 * drops the slot progress and the Produce button (unfiled work is not an
 * assembled release) and swaps in pool-oriented copy. Both tracks keep the
 * issue switcher, the "New issue" and "Viewing as" controls, the Write and
 * Commission actions, and the 3-way layout switch.
 *
 * Write is the primary action and Commission the secondary one: an editor
 * writing a piece themselves is the everyday case, and sending a brief out to
 * someone else is the occasional one.
 *
 * The issue switcher is what makes the desk multi-issue: before it, the
 * working issue was whichever had the highest display number, so no earlier
 * issue could be worked on at all.
 */
export function DeskHeader({
  issue,
  issues,
  onSelectIssue,
  onNewIssue,
  track,
  editors,
  me,
  onMe,
  layout,
  onLayout,
  onWrite,
  isWriting,
  onCommission,
  onProduce,
}: {
  issue: Issue;
  /** Every issue, newest number first, for the switcher. */
  issues: IssueSummary[];
  onSelectIssue: (issueNumber: string) => void;
  onNewIssue: () => void;
  track: DeskTrack;
  editors: Editor[];
  me: string;
  onMe: (editorId: string) => void;
  layout: DeskLayout;
  onLayout: (layout: DeskLayout) => void;
  onWrite: () => void;
  /** True while the new draft is being created, to hold Write disabled. */
  isWriting: boolean;
  onCommission: () => void;
  onProduce: () => void;
}) {
  const { t } = useTranslation();
  const isIssueTrack = track === "issue";
  const filledPercent =
    issue.slots > 0 ? (issue.filled / issue.slots) * 100 : 0;
  // The backend doesn't model an editorial calendar yet, so live issues carry
  // a real number/theme/publishes but a blank closes/daysLeft. The two halves
  // of the meta line are gated separately so a live issue still shows its real
  // publish date instead of hiding it behind a "closes" value that will never
  // arrive.
  const hasIssueTheme = Boolean(issue.theme);
  const hasCloseDate = Boolean(issue.closes);
  const hasPublishDate = Boolean(issue.publishes);
  // The Produce button only needs a real issue to link to.
  const hasIssue = issue.number !== "";

  const layoutOptions = [
    {
      value: "list",
      label: t("magazine:desk.header.layout.pipeline"),
      icon: <FiList aria-hidden />,
    },
    {
      value: "board",
      label: t("magazine:desk.header.layout.board"),
      icon: <FiGrid aria-hidden />,
    },
    {
      value: "plan",
      label: t("magazine:desk.header.layout.issuePlan"),
      icon: <FiFileText aria-hidden />,
    },
  ];

  return (
    <>
      <div className={styles.deskHead}>
        <div className={styles.meta}>
          {isIssueTrack ? (
            hasIssueTheme && (
              <span className={styles.eyebrow}>
                {t("magazine:desk.header.eyebrow", {
                  number: issue.number,
                  theme: issue.theme,
                })}
              </span>
            )
          ) : (
            <span className={styles.eyebrow}>
              {t("magazine:desk.header.unassignedEyebrow")}
            </span>
          )}
          <h1 className={styles.title}>{t("magazine:desk.header.title")}</h1>
        </div>
        <div className={styles.metaTight}>
          {isIssueTrack ? (
            <>
              {(hasCloseDate || hasPublishDate) && (
                <span className={styles.tiny}>
                  {hasCloseDate
                    ? t("magazine:desk.header.meta", {
                        closes: issue.closes,
                        publishes: issue.publishes,
                      })
                    : t("magazine:desk.header.metaPublishesOnly", {
                        publishes: issue.publishes,
                      })}
                </span>
              )}
              <span className={styles.muted}>
                {hasCloseDate && (
                  <>
                    <b>{t("magazine:desk.header.daysLeft", { days: issue.daysLeft })}</b>{" "}
                    {t("magazine:desk.header.toClose")} ·{" "}
                  </>
                )}
                {t("magazine:desk.header.slotsFilled", {
                  filled: issue.filled,
                  slots: issue.slots,
                })}
              </span>
            </>
          ) : (
            <span className={styles.muted}>
              {t("magazine:desk.header.unassignedMeta")}
            </span>
          )}
        </div>
      </div>
      <div className={styles.deskBar}>
        <div className={styles.controlBar}>
          <SegmentedControl
            label={t("magazine:desk.header.layoutAria")}
            value={layout}
            onChange={(value) => onLayout(value as DeskLayout)}
            options={layoutOptions}
          />
          <div className={styles.actions}>
            {issues.length > 0 && (
              <span className={styles.picker}>
                <FiBookOpen aria-hidden />
                {t("magazine:desk.header.workingOn")}
                <Select
                  size="sm"
                  className={styles.viewingAsSelect}
                  value={issue.number || null}
                  onChange={(value) => value && onSelectIssue(value)}
                  label={t("magazine:desk.header.workingOnAria")}
                  options={issues.map((option) => ({
                    value: option.number,
                    label: t("magazine:desk.header.issueOption", {
                      number: option.number,
                      title: option.title,
                    }),
                  }))}
                />
              </span>
            )}
            <span className={styles.picker}>
              <FiUser aria-hidden />
              {t("magazine:desk.header.viewingAs")}
              <Select
                size="sm"
                className={styles.viewingAsSelect}
                value={me}
                onChange={(value) => onMe(value ?? "")}
                label={t("magazine:desk.header.viewingAsEditorAria")}
                options={editors.map((editor) => ({
                  value: editor.id,
                  label: editor.name.split(" ")[0],
                }))}
              />
            </span>
            <Button variant="ghost" onClick={onNewIssue}>
              <FiPlus aria-hidden />
              {t("magazine:desk.header.newIssueCta")}
            </Button>
            {isIssueTrack && hasIssue && (
              <Button variant="ghost" onClick={onProduce}>
                <FiCalendar aria-hidden />
                {t("magazine:desk.header.produce")}
              </Button>
            )}
            <Button variant="ghost" onClick={onCommission}>
              <FiPlus aria-hidden />
              {t("magazine:desk.header.commissionCta")}
            </Button>
            <Button variant="primary" onClick={onWrite} disabled={isWriting}>
              <FiEdit3 aria-hidden />
              {t("magazine:desk.header.writeCta")}
            </Button>
          </div>
        </div>
        {isIssueTrack && (
          <div
            className={styles.track}
            role="progressbar"
            aria-valuenow={issue.filled}
            aria-valuemin={0}
            aria-valuemax={issue.slots}
            aria-label={t("magazine:desk.header.slotsFilledAria")}
          >
            <span
              className={styles.trackFill}
              style={{ width: `${filledPercent}%` }}
            />
          </div>
        )}
      </div>
    </>
  );
}
