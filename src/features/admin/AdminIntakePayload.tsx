import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./AdminSubmissionList.module.css";

/**
 * Reads one intake submission's `payload` for a human.
 *
 * The payload is schema-less: `POST /intakes/:kind` stores whatever the form
 * sent, and a row written by last year's version of a form can hold anything.
 * So this renders in two passes. First the fields that actually matter for the
 * kind, in a sensible reading order with a real label. Then, so nothing is ever
 * silently hidden, every remaining key as a plain labelled line. A kind with no
 * entry here falls through to the second pass alone.
 *
 * Nothing in here may throw on an unexpected shape — an admin looking at a
 * six-week-old grant application should never meet an error boundary.
 */

/**
 * The fields each form writes, in reading order. Taken from the modals that
 * produce them: `resources/GrantApplicationModal`, `resources/SuggestEditModal`,
 * `resources/SoberHostModal`, `resources/PanelSignupModal`,
 * `economy/IncubatorModals` and `culture/CultureFormModals`.
 *
 * `governance_concern` is deliberately absent: the console never prints a
 * concern's contents (see `AdminIntakeRow`).
 */
const INTAKE_PAYLOAD_FIELDS: Record<string, readonly string[]> = {
  grant: [
    "projectName",
    "projectSummary",
    "applicantName",
    "budgetTotal",
    "budgetItems",
  ],
  suggest_edit: ["context", "term", "change"],
  sober_host: ["mode", "name", "detail"],
  panel_signup: ["name", "email", "why"],
  incubator_cohort: ["name", "email", "pitch"],
  incubator_mentor: ["name", "email", "expertise", "why"],
  incubator_session: ["mentorName", "mentorRole", "when", "message"],
  culture_suggest_pick: ["title", "author", "format", "why"],
  culture_post_project: ["title", "description", "lookingFor"],
  culture_submit_work: ["title", "medium", "link", "about"],
  culture_submit_playlist: ["name", "link", "vibes", "note"],
};

/** Field names with a translated label in `admin:adminIntakes.field.*`. Any key
 *  outside this set is a field no form in this build writes, so its raw name is
 *  turned into words instead of resolving to a missing catalog key. */
const LABELLED_PAYLOAD_FIELDS = new Set<string>([
  "about",
  "applicantName",
  "author",
  "budgetItems",
  "budgetTotal",
  "change",
  "context",
  "description",
  "detail",
  "email",
  "expertise",
  "format",
  "link",
  "lookingFor",
  "medium",
  "mentorName",
  "mentorRole",
  "message",
  "mode",
  "name",
  "note",
  "pitch",
  "projectName",
  "projectSummary",
  "term",
  "title",
  "vibes",
  "when",
  "why",
]);

/** `instagramHandle` → `Instagram handle`. Used only for keys no form in this
 *  build writes, so the words are the submitter's data rather than chrome. */
function humanizeFieldName(key: string): string {
  const spaced = key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .trim();
  if (!spaced) return key;
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

/** One line of a `{ item, amount }` budget row, or "" when it is neither. */
function formatBudgetRow(entry: unknown): string {
  if (!entry || typeof entry !== "object") return formatScalar(entry);
  const row = entry as Record<string, unknown>;
  const item = formatScalar(row.item);
  const amount = formatScalar(row.amount);
  if (item && amount) return `${item}: ${amount}`;
  return item || amount || formatScalar(entry);
}

function formatScalar(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number")
    return Number.isFinite(value) ? String(value) : "";
  if (typeof value === "boolean") return value ? "yes" : "no";
  return "";
}

/**
 * Any payload value as one readable string. Arrays become a comma list (objects
 * inside them become `item: amount` pairs), nested objects become `key: value`
 * pairs, and anything unreadable becomes "" so the caller can skip the line.
 */
function formatPayloadValue(value: unknown): string {
  const scalar = formatScalar(value);
  if (scalar) return scalar;
  if (Array.isArray(value)) {
    return value
      .map((entry) =>
        entry && typeof entry === "object"
          ? formatBudgetRow(entry)
          : formatScalar(entry),
      )
      .filter(Boolean)
      .join(", ");
  }
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, nested]) => {
        const readable = formatScalar(nested);
        return readable ? `${humanizeFieldName(key)}: ${readable}` : "";
      })
      .filter(Boolean)
      .join(" · ");
  }
  return "";
}

/** The keys to print, known ones first in reading order, then the rest. */
function orderedPayloadKeys(
  kind: string,
  payload: Record<string, unknown>,
): string[] {
  const known = INTAKE_PAYLOAD_FIELDS[kind] ?? [];
  const present = Object.keys(payload);
  const leading = known.filter((key) => present.includes(key));
  const trailing = present.filter((key) => !leading.includes(key));
  return [...leading, ...trailing];
}

export function AdminIntakePayload({
  kind,
  payload,
}: {
  kind: string;
  payload: Record<string, unknown>;
}) {
  const { t } = useTranslation();
  const source = payload && typeof payload === "object" ? payload : {};
  const lines = orderedPayloadKeys(kind, source)
    .map((key) => ({ key, value: formatPayloadValue(source[key]) }))
    .filter((line) => line.value.length > 0);

  if (lines.length === 0) {
    return (
      <p className={styles.payloadEmpty}>
        {t("admin:adminIntakes.payload.empty")}
      </p>
    );
  }

  return (
    <dl className={styles.payload}>
      {lines.map((line) => (
        <div key={line.key} className={styles.payloadLine}>
          <dt className={styles.payloadLabel}>
            {LABELLED_PAYLOAD_FIELDS.has(line.key)
              ? t(`admin:adminIntakes.field.${line.key}`)
              : humanizeFieldName(line.key)}
          </dt>
          <dd className={styles.payloadValue}>{line.value}</dd>
        </div>
      ))}
    </dl>
  );
}
