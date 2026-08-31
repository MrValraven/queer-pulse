import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import { usePlatformSettingChanges } from "./api/usePlatformSettings";
import type { PlatformSettingChangeDTO } from "./api/platformSettings.api";
import { SETTING_LABEL_KEYS } from "./adminSettings.data";
import styles from "./AdminSettingsPage.module.css";

/**
 * A `settingKey` the frontend doesn't recognize yet — the backend can ship a
 * new kill switch before `SETTING_LABEL_KEYS` is updated for it — falls back to
 * a humanized version of the raw camelCase name (`lockdownEnabled` →
 * `Lockdown Enabled`) rather than crashing or printing the machine key as-is.
 */
function fallbackLabel(key: string): string {
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function settingLabel(key: string, t: TFunction): string {
  const labelKey = SETTING_LABEL_KEYS[key];
  return labelKey ? t(labelKey) : fallbackLabel(key);
}

/**
 * Values arrive as raw strings — booleans as the literal `"true"`/`"false"`,
 * a cleared field as `null`, anything else as free text. Never hand a human
 * `"true"` or `"null"` verbatim.
 */
function formatValue(value: string | null, t: TFunction): string {
  if (value === null) return t("admin:settings.history.cleared");
  if (value === "true") return t("admin:settings.history.on");
  if (value === "false") return t("admin:settings.history.off");
  return value;
}

function HistoryRow({ change }: { change: PlatformSettingChangeDTO }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const setting = settingLabel(change.settingKey, t);
  const from = formatValue(change.oldValue, t);
  const to = formatValue(change.newValue, t);
  // The backend resolves the acting admin to a name before it ships the row
  // (ENG-43); this tab used to print the raw `actorId` uuid, so the meta line
  // read "by 6f2c1a94-..." and answered nobody's question.
  //
  // `actor` is null in the two cases that leave no name to give: the admin
  // erased their account (the audit FK is ON DELETE SET NULL precisely so the
  // trail outlives the person) and an admin with no profile row. One fallback
  // label covers both, because to a reader they are the same fact.
  const actorName = change.actor
    ? `${change.actor.firstName} ${change.actor.lastName}`.trim()
    : "";
  const actor = actorName || t("admin:settings.history.unknownActor");
  const created = new Date(change.createdAt);

  return (
    <li className={styles.historyRow}>
      <div className={styles.historyMain}>
        <strong>
          {t("admin:settings.history.changed", { setting, from, to })}
        </strong>
        {change.note && <p className={styles.historyNote}>{change.note}</p>}
      </div>
      <div className={styles.historyMeta}>
        <span>{t("admin:settings.history.by", { actor })}</span>
        <time dateTime={change.createdAt}>
          {fmt.date(created)} · {fmt.time(created)}
        </time>
      </div>
    </li>
  );
}

/**
 * The audit trail: every save writes one row per changed field, so a save
 * that flips two switches produces two rows here. Rendered newest-first
 * regardless of what order the API happens to return, since "recent changes"
 * is the entire point of the tab.
 *
 * Loading and failure are kept distinct from genuinely empty. `data` is
 * `undefined` in all three cases, and falling through to "No changes yet."
 * would tell an admin mid-incident that this platform has never been changed —
 * the single most misleading thing an audit trail can say.
 */
export function AdminSettingsHistory() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = usePlatformSettingChanges();
  const changes = [...(data?.items ?? [])].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
  // `total` is the whole row count, not this window's (ENG-50). Without it a
  // truncated first page and a complete history look identical, and an admin
  // asking "who turned lockdown on" would conclude nobody had.
  const total = data?.total ?? changes.length;
  const isTruncated = total > changes.length;

  if (isLoading) return <div className={styles.loading} aria-busy="true" />;
  if (isError)
    return <p className={styles.error}>{t("admin:settings.history.error")}</p>;

  if (changes.length === 0) {
    return (
      <p className={styles.historyEmpty}>{t("admin:settings.history.empty")}</p>
    );
  }

  return (
    <>
      {isTruncated && (
        <p className={styles.historyTruncated}>
          {t("admin:settings.history.truncatedNotice", {
            shown: String(changes.length),
            total: String(total),
          })}
        </p>
      )}
      <ul className={styles.historyList}>
        {changes.map((change) => (
          <HistoryRow key={change.id} change={change} />
        ))}
      </ul>
    </>
  );
}
