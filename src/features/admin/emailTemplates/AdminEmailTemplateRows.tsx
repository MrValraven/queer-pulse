import { FiEdit2, FiEye, FiTrash2 } from "react-icons/fi";
import { Link } from "react-router-dom";
import { routes } from "../../../app/routeMap";
import { IconButton } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminChip, AdminToggle } from "../ui";
import type { EmailTemplateAdminDTO } from "./emailTemplate.types";
import styles from "./AdminEmailTemplates.module.css";

interface AdminEmailTemplateRowsProps {
  templates: EmailTemplateAdminDTO[];
  onToggleActive: (template: EmailTemplateAdminDTO) => void;
  onDelete: (template: EmailTemplateAdminDTO) => void;
  onPreview: (template: EmailTemplateAdminDTO) => void;
}

export function AdminEmailTemplateRows({
  templates,
  onToggleActive,
  onDelete,
  onPreview,
}: AdminEmailTemplateRowsProps) {
  const { t } = useTranslation();
  return (
    <ul className={styles.rows}>
      {templates.map((template) => (
        <li key={template.id} className={styles.row}>
          <div className={styles.rowMain}>
            <span className={styles.rowLabel}>{template.label}</span>
            <div className={styles.rowChips}>
              <AdminChip tone="violet">
                {t(`admin:emailTemplates.purpose.${template.purpose}`)}
              </AdminChip>
              <AdminChip tone="ghost">EN</AdminChip>
              {template.locales.pt && <AdminChip tone="ghost">PT</AdminChip>}
              {!template.isActive && (
                <AdminChip tone="amber">
                  {t("admin:emailTemplates.list.inactive")}
                </AdminChip>
              )}
            </div>
          </div>
          <div className={styles.rowActions}>
            <AdminToggle
              checked={template.isActive}
              onChange={() => onToggleActive(template)}
              label={t("admin:emailTemplates.list.activeToggleLabel", {
                label: template.label,
              })}
            />
            <button
              type="button"
              className={styles.previewButton}
              onClick={() => onPreview(template)}
            >
              <FiEye aria-hidden /> {t("admin:emailTemplates.list.previewCta")}
            </button>
            <Link
              className={styles.editLink}
              to={`${routes.adminEmailTemplateEdit}/${template.id}`}
            >
              <FiEdit2 aria-hidden /> {t("admin:emailTemplates.list.editCta")}
            </Link>
            <IconButton
              size="sm"
              onClick={() => onDelete(template)}
              aria-label={t("admin:emailTemplates.list.deleteLabel", {
                label: template.label,
              })}
            >
              <FiTrash2 aria-hidden />
            </IconButton>
          </div>
        </li>
      ))}
    </ul>
  );
}
