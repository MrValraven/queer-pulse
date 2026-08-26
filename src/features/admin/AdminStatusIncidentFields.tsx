import { useId } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminCheckLine, AdminSeg } from "./ui";
import {
  STATUS_COMPONENT_NAME_KEY,
  STATUS_COMPONENT_ORDER,
} from "../system/statusLive.data";
import type {
  PlatformIncidentSeverity,
  PlatformIncidentState,
  PlatformStatusComponentId,
} from "../system/api/platformStatus.api";
import type { StatusIncidentFormDraft } from "./adminStatusIncidentForm.utils";
import styles from "./AdminStatusIncidentsPage.module.css";

const SEVERITIES: PlatformIncidentSeverity[] = ["minor", "major", "critical"];
const STATES: PlatformIncidentState[] = ["open", "monitoring", "resolved"];

/**
 * The incident editor's fields. Component names are read from the PUBLIC
 * `statusLive.data.ts` maps rather than a second admin-only list, so an
 * operator ticks exactly the labels a member will read.
 */
export function AdminStatusIncidentFields({
  draft,
  onChange,
}: {
  draft: StatusIncidentFormDraft;
  onChange: (patch: Partial<StatusIncidentFormDraft>) => void;
}) {
  const { t } = useTranslation();
  const fieldId = useId();

  function toggleComponent(id: PlatformStatusComponentId) {
    const isOn = draft.affectedComponents.includes(id);
    onChange({
      affectedComponents: isOn
        ? draft.affectedComponents.filter((current) => current !== id)
        : [...draft.affectedComponents, id],
    });
  }

  return (
    <>
      <label className={styles.fieldLabel} htmlFor={`${fieldId}-title`}>
        {t("system:statusAdmin.field.title")}
      </label>
      <input
        id={`${fieldId}-title`}
        className={styles.textInput}
        value={draft.title}
        maxLength={160}
        onChange={(event) => onChange({ title: event.target.value })}
        required
      />
      <p className={styles.fieldHint}>
        {t("system:statusAdmin.field.titleHint")}
      </p>

      <label className={styles.fieldLabel} htmlFor={`${fieldId}-body`}>
        {t("system:statusAdmin.field.body")}
      </label>
      <textarea
        id={`${fieldId}-body`}
        className={styles.textarea}
        rows={6}
        value={draft.body}
        maxLength={4000}
        onChange={(event) => onChange({ body: event.target.value })}
        required
      />
      <p className={styles.fieldHint}>
        {t("system:statusAdmin.field.bodyHint")}
      </p>

      <span className={styles.fieldLabel}>
        {t("system:statusAdmin.field.severity")}
      </span>
      <AdminSeg
        options={SEVERITIES.map((severity) => ({
          value: severity,
          label: t(`system:statusAdmin.severity.${severity}`),
        }))}
        value={draft.severity}
        onChange={(value) =>
          onChange({ severity: value as PlatformIncidentSeverity })
        }
      />

      <span className={styles.fieldLabel}>
        {t("system:statusAdmin.field.status")}
      </span>
      <AdminSeg
        options={STATES.map((state) => ({
          value: state,
          label: t(`system:statusAdmin.status.${state}`),
        }))}
        value={draft.status}
        onChange={(value) =>
          onChange({ status: value as PlatformIncidentState })
        }
      />

      <label className={styles.fieldLabel} htmlFor={`${fieldId}-started`}>
        {t("system:statusAdmin.field.startedAt")}
      </label>
      <input
        id={`${fieldId}-started`}
        type="datetime-local"
        className={styles.textInput}
        value={draft.startedAt}
        onChange={(event) => onChange({ startedAt: event.target.value })}
      />

      <span className={styles.fieldLabel}>
        {t("system:statusAdmin.field.components")}
      </span>
      <div className={styles.componentPicker}>
        {STATUS_COMPONENT_ORDER.map((id) => (
          <AdminCheckLine
            key={id}
            checked={draft.affectedComponents.includes(id)}
            onChange={() => toggleComponent(id)}
            title={t(STATUS_COMPONENT_NAME_KEY[id])}
          />
        ))}
      </div>
      <p className={styles.fieldHint}>
        {t("system:statusAdmin.field.componentsHint")}
      </p>
    </>
  );
}
