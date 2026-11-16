import { FiUser, FiX } from "react-icons/fi";
import { useId } from "react";
import {
  FadeIn,
  FilterChips,
  IconButton,
  Select,
} from "../../shared/components/ui";
import { AdminToolbar, adminToolbarClasses } from "./ui";
import { AdminMediaUploaderPicker } from "./AdminMediaUploaderPicker";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  ADMIN_MEDIA_KINDS,
  type AdminMediaKind,
  type AdminMediaUploader,
} from "./api/adminMedia.api";
import type { AdminMediaUsage } from "./adminMediaUsage";
import styles from "./AdminMediaPage.module.css";

/**
 * The media console's three stacked filters: upload kind, whether the file is
 * still referenced anywhere, and one member's uploads. Kind and uploader are
 * query inputs; usage narrows the pages already fetched (see
 * `adminMediaUsage.ts`).
 */
export function AdminMediaFilters({
  kind,
  onKindChange,
  usage,
  onUsageChange,
  uploaderFilter,
  onUploaderFilterChange,
}: {
  kind: AdminMediaKind;
  onKindChange: (kind: AdminMediaKind) => void;
  usage: AdminMediaUsage;
  onUsageChange: (usage: AdminMediaUsage) => void;
  uploaderFilter: AdminMediaUploader | null;
  onUploaderFilterChange: (uploader: AdminMediaUploader | null) => void;
}) {
  const { t } = useTranslation();
  const kindLabelId = useId();

  return (
    <FadeIn delay={60} className={styles.filtersFade}>
      <AdminToolbar label={t("shared:filterPage.filtersCta")}>
        <div className={styles.kindFilter}>
          <span className={styles.kindFilterLabel} id={kindLabelId}>
            {t("admin:media.kindFilterLabel")}
          </span>
          <Select
            size="sm"
            labelledBy={kindLabelId}
            className={adminToolbarClasses.select}
            value={kind}
            onChange={(next) => onKindChange((next ?? "all") as AdminMediaKind)}
            options={ADMIN_MEDIA_KINDS.map((kindValue) => ({
              value: kindValue,
              label: t(`admin:media.kinds.${kindValue}`),
            }))}
            // While filtering by uploader, the kind choice is inert: the
            // uploader view spans every kind (the backend ignores `prefix`).
            disabled={uploaderFilter !== null}
          />
        </div>
        <FilterChips
          className={adminToolbarClasses.chips}
          label={t("admin:media.usage.filterAriaLabel")}
          value={usage}
          onChange={(next) => onUsageChange(next as AdminMediaUsage)}
          options={[
            { value: "all", label: t("admin:media.usage.all") },
            { value: "in-use", label: t("admin:media.usage.inUse") },
            { value: "unused", label: t("admin:media.usage.unused") },
          ]}
        />
        {uploaderFilter ? (
          <div className={styles.activeFilter}>
            <span className={styles.activeFilterLabel}>
              <FiUser aria-hidden />
              <Translation
                i18nKey="admin:media.filterByUploader.activePill"
                values={{ name: uploaderFilter.displayName }}
                components={{ strong: <strong /> }}
              />
            </span>
            <IconButton
              size="sm"
              aria-label={t("admin:media.filterByUploader.clearAria")}
              onClick={() => onUploaderFilterChange(null)}
            >
              <FiX aria-hidden />
            </IconButton>
          </div>
        ) : (
          <AdminMediaUploaderPicker onPick={onUploaderFilterChange} />
        )}
      </AdminToolbar>
    </FadeIn>
  );
}
