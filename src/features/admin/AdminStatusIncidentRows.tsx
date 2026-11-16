import { Button } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  INCIDENT_STATE_ICON,
  INCIDENT_STATE_LABEL_KEY,
  STATUS_COMPONENT_NAME_KEY,
} from "../system/statusLive.data";
import type { PlatformIncidentState } from "../system/api/platformStatus.api";
import type { AdminStatusIncidentDTO } from "./api/adminStatusIncidents.api";
import {
  AdminChip,
  AdminPanel,
  AdminRowActions,
  adminTableClasses,
  type AdminTone,
} from "./ui";
import styles from "./AdminStatusIncidentsPage.module.css";

/** The chip tone for each incident state. */
const STATE_TONE: Record<PlatformIncidentState, AdminTone> = {
  open: "coral",
  monitoring: "amber",
  resolved: "jade",
};

/**
 * One row per incident: its state in words next to an icon (never a bare
 * coloured dot), the parts it affects, when it started, who wrote it up, and
 * the two actions an operator needs during an incident.
 */
export function AdminStatusIncidentRows({
  incidents,
  onEdit,
  onResolve,
  isResolving,
}: {
  incidents: AdminStatusIncidentDTO[];
  onEdit: (incident: AdminStatusIncidentDTO) => void;
  onResolve: (incident: AdminStatusIncidentDTO) => void;
  isResolving: boolean;
}) {
  const { t } = useTranslation();
  const format = useFormat();

  return (
    <AdminPanel padding="flush">
      <ul className={styles.rows}>
        {incidents.map((incident) => {
          const StateIcon = INCIDENT_STATE_ICON[incident.status];
          return (
            <li
              className={[adminTableClasses.row, styles.row].join(" ")}
              key={incident.id}
            >
              <div className={styles.rowMain}>
                <div className={styles.rowTop}>
                  <AdminChip tone={STATE_TONE[incident.status]}>
                    <StateIcon aria-hidden />
                    {t(INCIDENT_STATE_LABEL_KEY[incident.status])}
                  </AdminChip>
                  <span className={styles.rowName}>{incident.title}</span>
                </div>
                <p className={styles.rowMeta}>
                  {t("system:statusAdmin.row.started", {
                    date: format.date(new Date(incident.startedAt)),
                  })}
                  {incident.resolvedAt
                    ? ` · ${t("system:statusAdmin.row.resolved", {
                        date: format.date(new Date(incident.resolvedAt)),
                      })}`
                    : ""}
                  {` · ${t("system:statusAdmin.row.author", {
                    name: incident.authoredByLabel,
                  })}`}
                </p>
                <p className={styles.rowMeta}>
                  {incident.affectedComponents.length > 0
                    ? t("system:statusAdmin.row.affects", {
                        components: incident.affectedComponents
                          .map((id) => t(STATUS_COMPONENT_NAME_KEY[id]))
                          .join(", "),
                      })
                    : t("system:statusAdmin.row.affectsNone")}
                </p>
              </div>
              <AdminRowActions className={styles.rowActions}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(incident)}
                >
                  {t("system:statusAdmin.action.edit")}
                </Button>
                {incident.status !== "resolved" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isResolving}
                    onClick={() => onResolve(incident)}
                  >
                    {t("system:statusAdmin.action.resolve")}
                  </Button>
                )}
              </AdminRowActions>
            </li>
          );
        })}
      </ul>
    </AdminPanel>
  );
}
