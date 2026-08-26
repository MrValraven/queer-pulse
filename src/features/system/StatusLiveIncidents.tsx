import { FiInbox } from "react-icons/fi";
import { EmptyState } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  PlatformIncidentState,
  PlatformStatusIncidentDTO,
} from "./api/platformStatus.api";
import {
  INCIDENT_SEVERITY_LABEL_KEY,
  INCIDENT_STATE_ICON,
  INCIDENT_STATE_LABEL_KEY,
  STATUS_COMPONENT_NAME_KEY,
} from "./statusLive.data";
import styles from "./StatusLive.module.css";

/** Class map keyed by incident state — depends on the CSS module import. */
const INCIDENT_STATE_CLASS: Record<PlatformIncidentState, string | undefined> =
  {
    open: styles.stateDown,
    monitoring: styles.stateDegraded,
    resolved: styles.stateOperational,
  };

/**
 * The operator-authored write-ups, newest first.
 *
 * Titles and bodies are rendered verbatim: they are written by staff, stored in
 * English, and stripped to plain text at the write boundary on the backend, so
 * they are neither translated nor parsed as markup here.
 */
export function StatusLiveIncidents({
  incidents,
  isHistoryUnavailable,
}: {
  incidents: PlatformStatusIncidentDTO[];
  isHistoryUnavailable: boolean;
}) {
  const { t } = useTranslation();
  const format = useFormat();

  return (
    <section className={`wrap ${styles.section}`}>
      <h2 className={styles.sectionHeading}>
        {t("system:status.live.incidentsHeading")}
      </h2>

      {isHistoryUnavailable ? (
        <p className={styles.notice}>
          {t("system:status.live.incidents.unavailable")}
        </p>
      ) : incidents.length === 0 ? (
        <EmptyState
          icon={<FiInbox />}
          title={t("system:status.live.incidents.none.title")}
          description={t("system:status.live.incidents.none.description")}
        />
      ) : (
        <ol className={styles.incidentList}>
          {incidents.map((incident) => {
            const StateIcon = INCIDENT_STATE_ICON[incident.status];
            return (
              <li key={incident.id} className={styles.incidentItem}>
                <div className={styles.incidentTags}>
                  <span
                    className={[
                      styles.statePill,
                      INCIDENT_STATE_CLASS[incident.status],
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <StateIcon aria-hidden />
                    {t(INCIDENT_STATE_LABEL_KEY[incident.status])}
                  </span>
                  <span className={styles.severityTag}>
                    {t(INCIDENT_SEVERITY_LABEL_KEY[incident.severity])}
                  </span>
                </div>
                <h3 className={styles.incidentTitle}>{incident.title}</h3>
                <p className={styles.incidentBody}>{incident.body}</p>
                <p className={styles.incidentMeta}>
                  {t("system:status.live.incidents.started", {
                    date: format.date(new Date(incident.startedAt)),
                    time: format.time(new Date(incident.startedAt)),
                  })}
                  {incident.resolvedAt
                    ? ` · ${t("system:status.live.incidents.resolved", {
                        date: format.date(new Date(incident.resolvedAt)),
                        time: format.time(new Date(incident.resolvedAt)),
                      })}`
                    : ""}
                </p>
                {incident.affectedComponents.length > 0 && (
                  <p className={styles.incidentMeta}>
                    {t("system:status.live.incidents.affects", {
                      components: incident.affectedComponents
                        .map((id) => t(STATUS_COMPONENT_NAME_KEY[id]))
                        .join(", "),
                    })}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
