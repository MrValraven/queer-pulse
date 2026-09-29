import { DetailRows } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminMediaReferenceList } from "./AdminMediaReferences";
import type { AdminMediaObject } from "./api/adminMedia.api";
import styles from "./AdminMediaPage.module.css";

/** The inspection drawer's body: key/uploader/content-type rows (with the
 *  spoof warning when the on-demand check disagrees with the declared type)
 *  plus the "referenced in" list. */
export function AdminMediaDrawerMeta({
  object,
  degraded,
  declaredContentType,
  realContentType,
  contentTypeMismatch,
}: {
  object: AdminMediaObject;
  degraded: boolean;
  declaredContentType: string;
  realContentType: string | null;
  contentTypeMismatch: boolean;
}) {
  const { t } = useTranslation();

  return (
    <>
      <DetailRows
        rows={[
          { label: t("admin:media.field.key"), value: object.key },
          {
            label: t("admin:media.field.uploader"),
            value: object.uploader
              ? `${object.uploader.displayName} · @${object.uploader.handle}`
              : t("admin:media.unowned"),
          },
          {
            label: t("admin:media.field.declaredType"),
            value: declaredContentType,
          },
          ...(realContentType !== null
            ? [
                {
                  label: t("admin:media.field.realType"),
                  value: (
                    <span
                      className={
                        contentTypeMismatch ? styles.mismatch : undefined
                      }
                    >
                      {realContentType}
                      {contentTypeMismatch
                        ? ` · ${t("admin:media.spoofWarning")}`
                        : ""}
                    </span>
                  ),
                },
              ]
            : []),
        ]}
      />
      <section className={styles.referencesSection}>
        <h3 className={styles.referencesHeading}>
          {t("admin:media.references.heading")}
        </h3>
        <AdminMediaReferenceList
          references={object.references}
          degraded={degraded}
        />
      </section>
    </>
  );
}
