import { FiCalendar, FiChevronDown, FiClock, FiX } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { formatDate } from "../../../shared/lib/date";
import { LEAD_STAGES, type LeadListItemDTO } from "./api/leads.types";
import { LeadActionMenu, type LeadMenuItem } from "./LeadActionMenu";
import { lisbonLeadDay, shiftLeadDay } from "./leadDates";
import { LEAD_STAGE_LABEL_KEY } from "./leadLabels.data";
import { useLeadQuickActionsContext } from "./leadQuickActions";
import {
  LEAD_FOLLOW_UP_DATE_OPTIONS,
  LEAD_FOLLOW_UP_PRESETS,
} from "./leadsList.data";
import { LeadStagePill } from "./LeadStagePill";
import styles from "./AdminLeads.module.css";

/** How a preset's day reads beside it in the menu: "Fri 20 Nov". */
const PRESET_HINT_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "short",
  day: "numeric",
  month: "short",
};

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
      <LeadStagePill stage={shownStage} />
      <FiChevronDown className={styles.triggerChevron} aria-hidden />
    </LeadActionMenu>
  );
}

/**
 * The row's follow-up as a menu: the date (in the warn tone when due, quiet
 * and italic when a closed lead keeps an old one), or "Set follow-up" when
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
  const dateOf = (day: string, options = LEAD_FOLLOW_UP_DATE_OPTIONS) =>
    formatDate(day, language, options);
  const isDue = row.isFollowUpDue && followUpOn === row.followUpOn;
  // A closed lead (On board, Not now) can keep an old date that no longer
  // counts as due; it reads muted, as history.
  const isPast = !isDue && followUpOn !== null && followUpOn < today;

  const items: LeadMenuItem[] = LEAD_FOLLOW_UP_PRESETS.map((preset) => {
    const day = shiftLeadDay(today, preset.days);
    return {
      id: preset.key,
      label: t(`admin:leads.quick.followUp.${preset.key}`),
      hint: dateOf(day, PRESET_HINT_OPTIONS),
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

  const shownText =
    followUpOn === null
      ? t("admin:leads.quick.setFollowUp")
      : isDue
        ? t("admin:leads.list.followUpDue", { date: dateOf(followUpOn) })
        : t("admin:leads.list.followUpOn", { date: dateOf(followUpOn) });

  return (
    <LeadActionMenu
      className={styles.followUp}
      triggerLabel={t("admin:leads.quick.followUpTriggerAria", {
        name: row.name,
        followUp: shownText,
      })}
      menuLabel={t("admin:leads.quick.followUpMenuLabel", { name: row.name })}
      items={items}
      isBusy={actions.isWriting}
    >
      <span
        className={styles.followUpValue}
        data-due={isDue || undefined}
        data-past={isPast || undefined}
        data-empty={followUpOn === null || undefined}
      >
        {isPast ? null : <FiClock className={styles.rowMetaIcon} aria-hidden />}
        <span>{shownText}</span>
      </span>
    </LeadActionMenu>
  );
}
