import {
  useDeferredValue,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { intlLocale } from "../../../../shared/i18n/locale";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { AdminSeg } from "../../ui";
import { EmailClientDesktop } from "./EmailClientDesktop";
import type { EmailClientMessage } from "./EmailClientMessageHead";
import { EmailClientPhone } from "./EmailClientPhone";
import styles from "./emailTemplateEditor.module.css";
import clientStyles from "./emailClient.module.css";

interface EmailPreviewFrameProps {
  html: string;
  subject: string;
  /** The inbox snippet after the subject, placeholders filled. Empty shows
   *  no snippet line. */
  preheader?: string;
  recipientName: string;
  /** Fill the parent's height (the editor's sticky column). Without it the
   *  mock client takes a fixed height, which suits the library modal. */
  shouldFillHeight?: boolean;
  /** Extra controls placed in the preview head, just before the Desktop and
   *  Mobile switch. The editor puts the temporary design switch here. */
  headerAside?: ReactNode;
}

/**
 * The live preview. `sandbox=""` (no allow-scripts, no allow-same-origin) is
 * the security boundary for admin-written HTML: nothing inside can run script
 * or reach the admin session. `useDeferredValue` keeps typing responsive.
 * The email sits inside a mock mail app (a desktop window or a phone) so it
 * reads the way a recipient will see it.
 */
export function EmailPreviewFrame({
  html,
  subject,
  preheader = "",
  recipientName,
  shouldFillHeight = false,
  headerAside,
}: EmailPreviewFrameProps) {
  const { t, language } = useTranslation();
  const headingId = useId();
  const [width, setWidth] = useState<"desktop" | "mobile">("desktop");
  const deferredHtml = useDeferredValue(html);
  const timeLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(intlLocale(language), {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date()),
    [language],
  );
  const message: EmailClientMessage = {
    subject,
    preheader,
    recipientName,
    timeLabel,
  };
  const frame = (
    <iframe
      title={t("admin:emailTemplates.preview.frameTitle")}
      sandbox=""
      srcDoc={deferredHtml}
      className={clientStyles.frame}
    />
  );
  return (
    <section
      className={[styles.preview, shouldFillHeight && styles.previewFill]
        .filter(Boolean)
        .join(" ")}
      aria-labelledby={headingId}
    >
      <div className={styles.previewHead}>
        <h3 id={headingId} className={styles.previewTitle}>
          {t("admin:emailTemplates.preview.label")}
        </h3>
        <div className={styles.previewControls}>
          {headerAside}
          <AdminSeg
            ariaLabelledby={headingId}
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
      <div className={styles.previewClient}>
        {width === "mobile" ? (
          <EmailClientPhone message={message} frame={frame} />
        ) : (
          <EmailClientDesktop message={message} frame={frame} />
        )}
      </div>
    </section>
  );
}
