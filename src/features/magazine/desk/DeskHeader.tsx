import { FiCalendar, FiFileText, FiGrid, FiList, FiPlus, FiUser } from "react-icons/fi";
import { Button, SegmentedControl, Select } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Editor, Issue } from "../data/desk.data";
import type { DeskTrack } from "./DeskTrackTabs";
import styles from "./DeskHeader.module.css";

/** The three desk layouts a piece pipeline can render in. */
export type DeskLayout = "list" | "board" | "plan";

/**
 * Desk page header. On the Issue track it shows the issue eyebrow + title,
 * close/publish meta and the slot-progress track. On the Highlights track it
 * drops the slot progress and the Produce button (highlights aren't an
 * assembled release) and swaps in highlight-oriented copy. Both tracks keep
 * the "Viewing as" picker, the Commission action, and the 3-way layout switch.
 */
export function DeskHeader({
  issue,
  track,
  editors,
  me,
  onMe,
  layout,
  onLayout,
  onCommission,
  onProduce,
}: {
  issue: Issue;
  track: DeskTrack;
  editors: Editor[];
  me: string;
  onMe: (editorId: string) => void;
  layout: DeskLayout;
  onLayout: (layout: DeskLayout) => void;
  onCommission: () => void;
  onProduce: () => void;
}) {
  const { t } = useTranslation();
  const isIssueTrack = track === "issue";
  const filledPercent =
    issue.slots > 0 ? (issue.filled / issue.slots) * 100 : 0;
  // The backend doesn't model an editorial calendar yet, so live issues carry
  // a real number/theme/filled/slots but blanked-out closes/publishes/
  // daysLeft. Only render the eyebrow + close/publish meta line when there's
  // real calendar data (i.e. demo mode) to show.
  const hasIssueCalendar = Boolean(issue.theme && issue.closes && issue.publishes);
  // The Produce button only needs a real issue to link to — gate it on the
  // issue existing at all, not on the (live-mode-absent) calendar fields.
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
            hasIssueCalendar && (
              <span className={styles.eyebrow}>
                {t("magazine:desk.header.eyebrow", {
                  number: issue.number,
                  theme: issue.theme,
                })}
              </span>
            )
          ) : (
            <span className={styles.eyebrow}>
              {t("magazine:desk.header.highlightsEyebrow")}
            </span>
          )}
          <h1 className={styles.title}>{t("magazine:desk.header.title")}</h1>
        </div>
        <div className={styles.metaTight}>
          {isIssueTrack ? (
            <>
              {hasIssueCalendar && (
                <span className={styles.tiny}>
                  {t("magazine:desk.header.meta", {
                    closes: issue.closes,
                    publishes: issue.publishes,
                  })}
                </span>
              )}
              <span className={styles.muted}>
                {hasIssueCalendar && (
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
              {t("magazine:desk.header.highlightsMeta")}
            </span>
          )}
        </div>
        <div className={styles.actions}>
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
          {isIssueTrack && hasIssue && (
            <Button variant="ghost" onClick={onProduce}>
              <FiCalendar aria-hidden />
              {t("magazine:desk.header.produce")}
            </Button>
          )}
          <Button variant="primary" onClick={onCommission}>
            <FiPlus aria-hidden />
            {t("magazine:desk.header.commissionCta")}
          </Button>
        </div>
      </div>
      <div className={styles.issueBar}>
        {isIssueTrack ? (
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
        ) : (
          <div className={styles.spacer} />
        )}
        <SegmentedControl
          label={t("magazine:desk.header.layoutAria")}
          value={layout}
          onChange={(value) => onLayout(value as DeskLayout)}
          options={layoutOptions}
        />
      </div>
    </>
  );
}
