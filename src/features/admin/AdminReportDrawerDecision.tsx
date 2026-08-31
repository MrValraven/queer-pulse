import { useId } from "react";
import { FiInfo } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useRovingRadioGroup } from "../../shared/hooks";
import { AdminSeg, type AdminSegOption } from "./ui";
import {
  MOD_REASONS,
  modActionsFor,
  type ModReport,
} from "./adminModeration.data";
import { AdminResponseTemplatePicker } from "./AdminResponseTemplatePicker";
import { RESTRICT_DURATIONS, modActionCodeFor } from "./reportDrawerOptions";
import type { ReasonCode } from "../safety/reportReasons";
import styles from "./AdminModerationPage.module.css";

/**
 * The decision half of the report drawer: what the moderator is about to do,
 * why, and the words the member will read. Split out of
 * `AdminReportDrawer.tsx` alongside the read-only evidence sections.
 *
 * The grid derives its tiles from `subjectType` itself rather than taking them
 * as a second prop that has to agree with it, so the tiles and the note
 * underneath them cannot describe two different subjects.
 *
 * Be careful reading `modActionsFor`: since TS-03 it returns every action for
 * every subject type, because `restrict` and `ban` resolve a content report to
 * its AUTHOR server-side (`AccountEnforcementService`). Every tile therefore
 * renders on every subject type, and the note under the grid tells a moderator
 * who a sanction lands on and when it can refuse. It used to say restrict and
 * ban were not shown at all, beside the very tiles it denied.
 */

/** The action-grid + restrict-duration picker (lines used to live inline in
 *  `AdminReportDrawer`, extracted to keep that component under 200 lines). */
export function ReportDrawerActionGrid({
  action,
  onSelectAction,
  subjectType,
  restrictDuration,
  onRestrictDurationChange,
}: {
  action: string | null;
  onSelectAction: (id: string) => void;
  /** The ONE value this section is derived from. The tiles and the note below
   *  them used to arrive as two independent props that had to agree, which on
   *  a surface that issues restrictions and bans is a mismatch waiting to
   *  happen. Deriving the tiles here makes that mismatch unrepresentable. */
  subjectType: ModReport["subjectType"];
  restrictDuration: string;
  onRestrictDurationChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  const actions = modActionsFor(subjectType);
  const decisionTitleId = useId();
  // One decision, so the tiles are radios. They used to be `aria-pressed`
  // toggles in a plain div: nothing announced them as a single choice, every
  // tile was its own tab stop, and the arrow keys did nothing. Each tile also
  // carries its own `dAction_<kind>` class, which is why this group runs on the
  // shared keyboard hook directly rather than through `RadioCardGroup`'s single
  // `optionClassName`. The existing section heading is the group's name.
  const { getRadioProps } = useRovingRadioGroup({
    optionCount: actions.length,
    checkedIndex: actions.findIndex((modAction) => modAction.id === action),
    onSelect: (index) => {
      const nextAction = actions[index];
      if (nextAction) onSelectAction(nextAction.id);
    },
  });
  return (
    <section className={styles.dSec}>
      <h3 className={styles.dSecLabel} id={decisionTitleId}>
        {t("admin:moderation.reportDrawer.decisionTitle")}
      </h3>
      <div
        className={styles.dActions}
        role="radiogroup"
        aria-labelledby={decisionTitleId}
      >
        {actions.map((modAction, index) => (
          <button
            key={modAction.id}
            {...getRadioProps(index)}
            type="button"
            role="radio"
            aria-checked={action === modAction.id}
            className={[
              styles.dAction,
              styles[`dAction_${modAction.kind}`],
              action === modAction.id && styles.dActionOn,
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onSelectAction(modAction.id)}
          >
            <span className={styles.dActionLabel}>{t(modAction.labelKey)}</span>
            <span className={styles.dActionDesc}>
              {t(modAction.descriptionKey)}
            </span>
          </button>
        ))}
      </div>
      {subjectType !== "member" && (
        <p className={styles.dTransparency}>
          <FiInfo aria-hidden />{" "}
          {t("admin:moderation.reportDrawer.accountActionsTarget")}
        </p>
      )}
      {action === "restrict" && (
        <>
          <h3 className={styles.dSecLabel}>
            {t("admin:moderation.reportDrawer.restrictDurationLabel")}
          </h3>
          <AdminSeg
            options={
              RESTRICT_DURATIONS.map((id) => ({
                value: id,
                label: t(
                  `admin:moderation.reportDrawer.restrictDuration.${id}`,
                ),
              })) satisfies AdminSegOption[]
            }
            value={restrictDuration}
            onChange={onRestrictDurationChange}
          />
        </>
      )}
    </section>
  );
}

/** Reason picker + free-text note (extracted for the same reason as
 *  `ReportDrawerActionGrid` above). */
export function ReportDrawerReasonNote({
  reason,
  onReasonChange,
  note,
  onNoteChange,
  reportedName,
  actionCode,
  communityName,
}: {
  reason: ReasonCode | null;
  onReasonChange: (id: ReasonCode) => void;
  note: string;
  onNoteChange: (value: string) => void;
  reportedName: string;
  /** The server action code for the tile selected above, for narrowing the
   *  saved-response picker. Null until an action is chosen. */
  actionCode: ReturnType<typeof modActionCodeFor>;
  communityName: string | null;
}) {
  const { t } = useTranslation();
  return (
    <section className={styles.dSec}>
      <h3 className={styles.dSecLabel}>
        {t("admin:moderation.reportDrawer.reasonTitle")}
      </h3>
      <div
        className={styles.dReasons}
        role="radiogroup"
        aria-label={t("admin:moderation.reportDrawer.reasonAriaLabel")}
      >
        {MOD_REASONS.map((r) => (
          <label key={r.id} className={styles.dReason}>
            <input
              type="radio"
              name="mod-reason"
              value={r.id}
              checked={reason === r.id}
              onChange={() => onReasonChange(r.id as ReasonCode)}
            />
            <span>{t(r.labelKey)}</span>
          </label>
        ))}
      </div>

      <AdminResponseTemplatePicker
        reasonCode={reason}
        actionCode={actionCode}
        note={note}
        onNoteChange={onNoteChange}
        memberName={reportedName}
        communityName={communityName}
      />

      <textarea
        aria-label={t("admin:moderation.reportDrawer.noteAriaLabel")}
        className={styles.dNote}
        rows={3}
        placeholder={t("admin:moderation.reportDrawer.notePlaceholder")}
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
      />
      <p className={styles.dTransparency}>
        <FiInfo aria-hidden />{" "}
        {t("admin:moderation.reportDrawer.transparency", {
          name: reportedName,
        })}
      </p>
    </section>
  );
}
