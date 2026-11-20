import { useId, useState } from "react";
import { Select } from "../../../shared/components/ui/Select";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  CULTURAL_IDEA_STATUSES,
  CULTURAL_TIME_ZONE,
  isCulturalIdeaStatus,
  type CulturalIdeaDTO,
} from "./api/culturalProduction.types";
import {
  useIsCulturalWriteInFlight,
  useUpdateCulturalIdea,
} from "./api/useCulturalIdeaMutations";
import { CulturalEventTypeChip } from "./CulturalEventTypeChip";
import { CulturalRefusalLine } from "./CulturalRefusalLine";
import { CULTURAL_IDEA_STATUS_KEY } from "./culturalProductionLabels.data";
import styles from "./IdeaDrawer.module.css";

/** The day an idea was added, in Lisbon, as the idea card reads it. */
const BYLINE_DATE: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: CULTURAL_TIME_ZONE,
};

/**
 * The idea drawer's head: the title, the event type, the status as a
 * compact select that saves on change, and who added it when. While the
 * change is on its way the select already shows the status picked; a
 * refusal puts the saved one back and names its cause under the controls.
 */
export function IdeaDrawerHeader({ idea }: { idea: CulturalIdeaDTO }) {
  const { t } = useTranslation();
  const format = useFormat();
  const updateIdea = useUpdateCulturalIdea(idea.id);
  const isWriteInFlight = useIsCulturalWriteInFlight();
  const [refusal, setRefusal] = useState<unknown>(null);
  const statusLabelId = useId();
  const refusalId = `${statusLabelId}-refusal`;

  const statusOptions = CULTURAL_IDEA_STATUSES.map((status) => ({
    value: status,
    label: t(CULTURAL_IDEA_STATUS_KEY[status]),
  }));
  const pendingStatus = updateIdea.isPending
    ? updateIdea.variables.status
    : undefined;
  const shownStatus = pendingStatus ?? idea.status;
  // Another write on its way would drop a pick, so the select waits for it.
  const isOtherWriteInFlight = isWriteInFlight && !updateIdea.isPending;

  const changeStatus = (value: string | null) => {
    if (!isCulturalIdeaStatus(value) || value === shownStatus) return;
    if (isWriteInFlight) return;
    setRefusal(null);
    updateIdea.mutate(
      { status: value },
      { onError: (cause) => setRefusal(cause) },
    );
  };

  const createdOn = format.date(new Date(idea.createdAt), BYLINE_DATE);
  const authorName = idea.author?.displayName.trim() ?? "";
  const byline =
    authorName === ""
      ? t("admin:culturalProduction.ideas.bylineUnknown", { date: createdOn })
      : t("admin:culturalProduction.ideas.byline", {
          name: authorName,
          date: createdOn,
        });

  return (
    <div className={styles.head}>
      <h2 className={styles.title}>{idea.title}</h2>
      <div className={styles.headControls}>
        <CulturalEventTypeChip eventType={idea.eventType} />
        <div className={styles.statusField}>
          <span id={statusLabelId} className={styles.statusLabel}>
            {t("admin:culturalProduction.ideas.drawer.statusLabel")}
          </span>
          <Select
            size="sm"
            className={styles.statusSelect}
            labelledBy={statusLabelId}
            searchable={false}
            options={statusOptions}
            value={shownStatus}
            disabled={isOtherWriteInFlight}
            aria-describedby={refusal === null ? undefined : refusalId}
            onChange={changeStatus}
          />
        </div>
      </div>
      <CulturalRefusalLine error={refusal} id={refusalId} />
      <p className={styles.byline}>{byline}</p>
    </div>
  );
}
