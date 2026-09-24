import { useDeferredValue, useState } from "react";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { AdminSeg } from "../../ui";
import { EmailDesignSwitch } from "./EmailDesignSwitch";
import styles from "./emailTemplateEditor.module.css";

/**
 * The live preview. `sandbox=""` (no allow-scripts, no allow-same-origin) is
 * the security boundary for admin-written HTML: nothing inside can run script
 * or reach the admin session. `useDeferredValue` keeps typing responsive.
 */
export function EmailPreviewFrame({ html }: { html: string }) {
  const { t } = useTranslation();
  const [width, setWidth] = useState<"desktop" | "mobile">("desktop");
  const deferredHtml = useDeferredValue(html);
  return (
    <section className={styles.preview} aria-labelledby="email-preview-heading">
      <div className={styles.previewHead}>
        <h3 id="email-preview-heading" className={styles.previewTitle}>
          {t("admin:emailTemplates.preview.label")}
        </h3>
        <div className={styles.previewControls}>
          <EmailDesignSwitch />
          <AdminSeg
            ariaLabelledby="email-preview-heading"
            value={width}
            onChange={(value) =>
              setWidth(value === "mobile" ? "mobile" : "desktop")
            }
            options={[
              {
                value: "desktop",
                label: t("admin:emailTemplates.preview.desktop"),
              },
              {
                value: "mobile",
                label: t("admin:emailTemplates.preview.mobile"),
              },
            ]}
          />
        </div>
      </div>
      <div className={styles.previewStage}>
        <iframe
          title={t("admin:emailTemplates.preview.frameTitle")}
          sandbox=""
          srcDoc={deferredHtml}
          className={
            width === "mobile" ? styles.frameMobile : styles.frameDesktop
          }
        />
      </div>
    </section>
  );
}
