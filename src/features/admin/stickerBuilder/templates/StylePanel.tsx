import { useId, type ReactNode } from "react";
import { FiCheck, FiDownload, FiRotateCcw } from "react-icons/fi";
import { Button } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { TemplateStyle } from "../../../stickers/templates/templateDefinition";
import { isSameStyle } from "./useStylePanelState";
import styles from "./StylePanel.module.css";

/**
 * The frame every template's style panel shares: the "Style" heading, the
 * Template defaults and Use this pack's style actions, then the template's
 * own control groups as children. The template itself is named by the
 * picker above, so the heading stands alone.
 */
export function StylePanel({
  style,
  isDefaultStyle,
  onResetDefaults,
  packStyle,
  onLoadPackStyle,
  children,
}: {
  style: TemplateStyle;
  isDefaultStyle: boolean;
  onResetDefaults: () => void;
  /** The selected pack's stored style, or null when there is none to load. */
  packStyle: TemplateStyle | null;
  onLoadPackStyle: () => void;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const headingId = useId();

  return (
    <section className={styles.panel} aria-labelledby={headingId}>
      <h3 id={headingId} className={styles.heading}>
        {t("admin:stickerPacks.controls.heading")}
      </h3>

      <div className={styles.styleActions}>
        {/* aria-disabled keeps focus on the button once the reset lands;
            a real `disabled` would drop a keyboard user to the page. */}
        <Button
          variant="ghost"
          size="sm"
          aria-disabled={isDefaultStyle || undefined}
          onClick={onResetDefaults}
        >
          <FiRotateCcw aria-hidden />
          {t("admin:stickerPacks.controls.templateDefaults")}
        </Button>

        {packStyle !== null && (
          <PackStyleButton
            isApplied={isSameStyle(style, packStyle)}
            onLoad={onLoadPackStyle}
          />
        )}
      </div>

      {children}
    </section>
  );
}

/** A titled group of controls; the title names the group for assistive tech. */
export function ControlSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const titleId = useId();
  return (
    <div className={styles.section} role="group" aria-labelledby={titleId}>
      <h4 id={titleId} className={styles.sectionTitle}>
        {title}
      </h4>
      <div className={styles.sectionBody}>{children}</div>
    </div>
  );
}

function PackStyleButton({
  isApplied,
  onLoad,
}: {
  isApplied: boolean;
  onLoad: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Button
      variant="ghost"
      size="sm"
      aria-disabled={isApplied || undefined}
      onClick={() => {
        if (!isApplied) onLoad();
      }}
    >
      {isApplied ? <FiCheck aria-hidden /> : <FiDownload aria-hidden />}
      {isApplied
        ? t("admin:stickerPacks.controls.packStyleApplied")
        : t("admin:stickerPacks.controls.usePackStyle")}
    </Button>
  );
}
