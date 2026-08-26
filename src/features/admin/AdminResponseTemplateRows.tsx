import { FiArrowDown, FiArrowUp } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminChip, AdminToggle } from "./ui";
import { AUDIT_ACTION_LABEL_KEY } from "./moderationActionLabels";
import { REASON_LABEL_KEYS } from "../safety/reportReasons";
import type { ModResponseTemplateAdminDTO } from "./api/adminModResponseTemplates.api";
import styles from "./AdminResponseTemplates.module.css";

/** How much of the body a row shows before it is cut. Long enough to tell two
 *  templates apart, short enough that twenty rows stay scannable. */
const BODY_PREVIEW_LENGTH = 180;

/**
 * One row per saved response: its label, what it is keyed to, a preview of the
 * member-facing body, an active toggle, move up/down, and edit/delete.
 *
 * Reordering is up/down buttons rather than drag: they are keyboard-reachable
 * for free, they name their own target, and the list is short. Each press
 * sends the whole new order (see `useReorderModResponseTemplates`).
 */
export function AdminResponseTemplateRows({
  templates,
  onToggleActive,
  onMove,
  onEdit,
  onDelete,
}: {
  templates: ModResponseTemplateAdminDTO[];
  onToggleActive: (template: ModResponseTemplateAdminDTO) => void;
  onMove: (template: ModResponseTemplateAdminDTO, delta: -1 | 1) => void;
  onEdit: (template: ModResponseTemplateAdminDTO) => void;
  onDelete: (template: ModResponseTemplateAdminDTO) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.rows}>
      {templates.map((template, index) => {
        const reasonLabelKey = template.reasonCode
          ? REASON_LABEL_KEYS[template.reasonCode]
          : undefined;
        const actionLabelKey = template.actionCode
          ? AUDIT_ACTION_LABEL_KEY[template.actionCode]
          : undefined;
        const preview =
          template.body.length > BODY_PREVIEW_LENGTH
            ? `${template.body.slice(0, BODY_PREVIEW_LENGTH).trimEnd()}…`
            : template.body;
        return (
          <div
            key={template.id}
            className={[styles.row, !template.isActive && styles.rowInactive]
              .filter(Boolean)
              .join(" ")}
          >
            <div className={styles.rowMain}>
              <div className={styles.rowTop}>
                <span className={styles.rowName}>{template.label}</span>
                <span className={styles.keyTag}>
                  {reasonLabelKey
                    ? t(reasonLabelKey)
                    : t("admin:moderation.templates.anyReason")}
                </span>
                <AdminChip tone="plum">
                  {actionLabelKey
                    ? t(actionLabelKey)
                    : t("admin:moderation.templates.anyAction")}
                </AdminChip>
              </div>
              <p className={styles.rowBody}>{preview}</p>
            </div>

            <div className={styles.rowActions}>
              <button
                type="button"
                className={styles.moveCta}
                disabled={index === 0}
                onClick={() => onMove(template, -1)}
                aria-label={t("admin:moderation.templates.moveUpAriaLabel", {
                  label: template.label,
                })}
              >
                <FiArrowUp aria-hidden />
              </button>
              <button
                type="button"
                className={styles.moveCta}
                disabled={index === templates.length - 1}
                onClick={() => onMove(template, 1)}
                aria-label={t("admin:moderation.templates.moveDownAriaLabel", {
                  label: template.label,
                })}
              >
                <FiArrowDown aria-hidden />
              </button>
              <AdminToggle
                checked={template.isActive}
                onChange={() => onToggleActive(template)}
                label={t("admin:moderation.templates.activeToggleLabel", {
                  label: template.label,
                })}
              />
              <Button
                variant="ghost"
                size="md"
                onClick={() => onEdit(template)}
              >
                {t("admin:common.edit")}
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={() => onDelete(template)}
              >
                {t("admin:common.delete")}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
