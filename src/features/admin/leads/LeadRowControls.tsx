import { FiCalendar, FiChevronDown, FiX } from "react-icons/fi";
import type { TFunction } from "../../../shared/i18n/types";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { formatDate } from "../../../shared/lib/date";
import { LEAD_STAGES, type LeadListItemDTO } from "./api/leads.types";
import { LeadActionMenu, type LeadMenuItem } from "./LeadActionMenu";
import { lisbonLeadDay, shiftLeadDay } from "./leadDates";
import { LEAD_STAGE_LABEL_KEY } from "./leadLabels.data";
import { useLeadQuickActionsContext } from "./leadQuickActions";
import {
  leadRowDay,
  leadRowFollowUpState,
  type LeadRowFollowUpState,
} from "./leadRowDates";
import {
  LEAD_FOLLOW_UP_PRESETS,
  LEAD_FOLLOW_UP_STATE_ICON,
} from "./leadsList.data";
import { LeadStagePill } from "./LeadStagePill";
import styles from "./AdminLeads.module.css";

/** How a preset's day reads beside it in the menu: "Fri 20 Nov". */
const PRESET_HINT_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "short",
  day: "numeric",
  month: "short",
};

/** What a follow-up cell shows, short, and what its menu button says, in
 *  full: "Overdue · Nov 8" reads "Overdue since Nov 8"; a coming day shows
 *  bare and reads "Follow up Nov 16". */
function followUpWords(
  state: LeadRowFollowUpState,
  date: string,
  t: TFunction,
): { shown: string; spoken: string } {
  if (state === "none") {
    const setText = t("admin:leads.quick.setFollowUp");
    return { shown: setText, spoken: setText };
  }
  if (state === "today") {
    const todayText = t("admin:leads.details.followUpDueToday");
    return { shown: todayText, spoken: todayText };
  }
  if (state === "overdue") {
    return {
      shown: t("admin:leads.list.followUpOverdue", { date }),
      spoken: t("admin:leads.details.followUpOverdue", { date }),
    };
  }
  return { shown: date, spoken: t("admin:leads.list.followUpOn", { date }) };
}

/**
 * The row's stage as a menu: the pill shows the stage (the one on its way
 * while a change saves), and the menu moves the lead to any other stage.
 */
export function LeadRowStageMenu({ row }: { row: LeadListItemDTO }) {
  const { t } = useTranslation();
  const actions = useLeadQuickActionsContext();
  const shownStage = actions.pendingFor(row.id)?.stage ?? row.stage;
  const stageLabel = t(LEAD_STAGE_LABEL_KEY[shownStage]);
  const items: LeadMenuItem[] = LEAD_STAGES.map((stage) => ({
    id: stage,
    label: t(LEAD_STAGE_LABEL_KEY[stage]),
    isChecked: stage === shownStage,
    onSelect: () => actions.moveToStage(row, stage),
  }));
  return (
    <LeadActionMenu
      className={styles.stageTrigger}
      triggerLabel={t("admin:leads.quick.stageTriggerAria", {
        name: row.name,
        stage: stageLabel,
      })}
      menuLabel={t("admin:leads.quick.stageMenuLabel", { name: row.name })}
      items={items}
      isBusy={actions.isWriting}
    >
      <LeadStagePill
        stage={shownStage}
        className={styles.stagePill}
        trailing={<FiChevronDown className={styles.stageChevron} aria-hidden />}
      />
    </LeadActionMenu>
  );
}

/**
 * The row's follow-up as a menu. The cell names the day short ("Nov 8",
 * with the year only when it is another one) and carries its state in ink
 * and icon: overdue and due today in the warn ink with a clock, a coming
 * day quiet with a calendar, a closed lead's kept day quieter still with a
 * dimmed calendar, and "Set follow-up" with a plus in the accent ink when
 * there is none. The menu sets a day a fixed span from today in Lisbon, or
 * clears it.
 */
export function LeadRowFollowUpMenu({ row }: { row: LeadListItemDTO }) {
  const { t, language } = useTranslation();
  const actions = useLeadQuickActionsContext();
  const today = lisbonLeadDay();
  const pending = actions.pendingFor(row.id);
  const followUpOn =
    pending?.followUpOn !== undefined ? pending.followUpOn : row.followUpOn;
  const shownStage = pending?.stage ?? row.stage;
  const state = leadRowFollowUpState(shownStage, followUpOn, today);
  const words = followUpWords(
    state,
    followUpOn === null ? "" : leadRowDay(followUpOn, today, language),
    t,
  );
  const StateIcon = LEAD_FOLLOW_UP_STATE_ICON[state];

  const items: LeadMenuItem[] = LEAD_FOLLOW_UP_PRESETS.map((preset) => {
    const day = shiftLeadDay(today, preset.days);
    return {
      id: preset.key,
      label: t(`admin:leads.quick.followUp.${preset.key}`),
      hint: formatDate(day, language, PRESET_HINT_OPTIONS),
      icon: <FiCalendar />,
      onSelect: () => actions.setFollowUp(row, day),
    };
  });
  if (followUpOn !== null) {
    items.push({
      id: "clear",
      label: t("admin:leads.details.clearFollowUp"),
      icon: <FiX />,
      hasDividerBefore: true,
      onSelect: () => actions.setFollowUp(row, null),
    });
  }

  return (
    <LeadActionMenu
      className={styles.followUp}
      triggerLabel={t("admin:leads.quick.followUpTriggerAria", {
        name: row.name,
        followUp: words.spoken,
      })}
      menuLabel={t("admin:leads.quick.followUpMenuLabel", { name: row.name })}
      items={items}
      isBusy={actions.isWriting}
    >
      <span className={styles.followUpValue} data-state={state}>
        <StateIcon className={styles.followUpIcon} aria-hidden />
        <span className={styles.followUpText}>{words.shown}</span>
      </span>
    </LeadActionMenu>
  );
}
