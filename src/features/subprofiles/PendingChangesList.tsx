import { useTranslation } from "../../shared/i18n/useTranslation";
import type { PendingChange } from "./subprofileEditorDiff";

/** How many change lines the savebar shows before collapsing the rest into a
 *  "+N more" line — keeps the sticky pill from growing unbounded. */
const MAX_VISIBLE = 5;

type Translate = ReturnType<typeof useTranslation>["t"];

/** Resolve one `PendingChange` (all i18n KEYS + raw params) into the single
 *  human line the savebar renders. Row-summary changes compose their sentence
 *  from the non-zero add/remove/edit/reorder counts; meta changes resolve the
 *  field label (itself a key) before interpolating. */
function changeLine(change: PendingChange, t: Translate): string {
  const params = change.params ?? {};
  if (change.summaryKey === "subprofiles:pending.rowSummary") {
    const area = t(change.areaLabelKey);
    const parts: string[] = [];
    const added = Number(params.added ?? 0);
    const removed = Number(params.removed ?? 0);
    const edited = Number(params.edited ?? 0);
    const reordered = Number(params.reordered ?? 0);
    if (added > 0)
      parts.push(t("subprofiles:pending.count.added", { count: added }));
    if (removed > 0)
      parts.push(t("subprofiles:pending.count.removed", { count: removed }));
    if (edited > 0)
      parts.push(t("subprofiles:pending.count.edited", { count: edited }));
    if (reordered) parts.push(t("subprofiles:pending.count.reordered"));
    return t("subprofiles:pending.rowSummary", {
      area,
      summary: parts.join(", "),
    });
  }
  const field = params.field ? t(String(params.field)) : "";
  const value = params.value !== undefined ? String(params.value) : "";
  return t(change.summaryKey, { field, value });
}

/** The itemized list of unsaved changes shown in the savebar when the editor is
 *  dirty. Pure presentational — the diff itself comes from the editor context. */
export function PendingChangesList({ pending }: { pending: PendingChange[] }) {
  const { t } = useTranslation();
  const visible = pending.slice(0, MAX_VISIBLE);
  const overflow = pending.length - visible.length;

  return (
    <ul className="savebar-list">
      {visible.map((change, index) => (
        <li key={`${change.summaryKey}-${index}`}>{changeLine(change, t)}</li>
      ))}
      {overflow > 0 && (
        <li>{t("subprofiles:pending.more", { count: overflow })}</li>
      )}
    </ul>
  );
}
