import { useId, useState, type ReactNode } from "react";
import { FiDownload, FiEye, FiGrid, FiMoon, FiSun } from "react-icons/fi";
import { useToast } from "../../../shared/components/feedback/useToast";
import { Button, SegmentedControl } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { renderStickerBlob } from "../../stickers/render/renderStickerBlob";
import type {
  StickerTemplate,
  TemplateStyle,
} from "../../stickers/templates/templateDefinition";
import { StickerCanvas } from "./StickerCanvas";
import type { PreviewBackdrop } from "./stickerBuilder.types";
import { itemName, stickerLabelFor } from "./stickerItems";
import styles from "./StickerHeroPreview.module.css";

const BACKDROPS: readonly PreviewBackdrop[] = ["light", "dark", "checker"];

const BACKDROP_ICON: Record<PreviewBackdrop, ReactNode> = {
  light: <FiSun />,
  dark: <FiMoon />,
  checker: <FiGrid />,
};

const BACKDROP_CLASS: Record<PreviewBackdrop, string | undefined> = {
  light: styles.surfaceLight,
  dark: styles.surfaceDark,
  checker: styles.surfaceChecker,
};

/** Light and dark re-theme the stage's own subtree through the token
 *  overrides in colors.css, so the chat mock shows the real bubble colours
 *  of each theme whatever theme the admin is using. The checkerboard keeps
 *  the admin's theme and only swaps the ground. */
const BACKDROP_THEME: Record<PreviewBackdrop, "light" | "dark" | undefined> = {
  light: "light",
  dark: "dark",
  checker: undefined,
};

/** Long enough for every browser to start the download before the object
 *  URL it reads is released. */
const OBJECT_URL_RELEASE_DELAY_MS = 1000;

function isPreviewBackdrop(value: string): value is PreviewBackdrop {
  return (BACKDROPS as readonly string[]).includes(value);
}

/** Renders the item at its true 512px size and saves it as a PNG. */
function useStickerPngDownload(
  template: StickerTemplate,
  style: TemplateStyle,
  itemId: string | null,
) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  async function download() {
    if (itemId === null || isDownloading) return;
    setIsDownloading(true);
    try {
      const blob = await renderStickerBlob(template.geometry(style, itemId));
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `${template.slugFor(itemId)}.png`;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(
        () => URL.revokeObjectURL(objectUrl),
        OBJECT_URL_RELEASE_DELAY_MS,
      );
    } catch {
      showToast(t("admin:stickerPacks.preview.downloadError"), "error");
    } finally {
      setIsDownloading(false);
    }
  }

  return { download, isDownloading };
}

/**
 * The builder's large preview of one template item: the sticker at hero size
 * on a chosen backdrop, the same sticker at its real size inside a mock chat,
 * and a PNG download of the exact art that would upload.
 */
export function StickerHeroPreview({
  template,
  style,
  itemId,
  backdrop,
  onBackdropChange,
}: {
  template: StickerTemplate;
  style: TemplateStyle;
  itemId: string | null;
  backdrop: PreviewBackdrop;
  onBackdropChange: (backdrop: PreviewBackdrop) => void;
}) {
  const { t, language } = useTranslation();
  const headingId = useId();
  const { download, isDownloading } = useStickerPngDownload(
    template,
    style,
    itemId,
  );
  const title =
    itemId === null
      ? t("admin:stickerPacks.preview.noItemTitle")
      : itemName(template, itemId, language);
  const stickerLabel =
    itemId === null ? "" : stickerLabelFor(template, itemId, t, language);

  return (
    <section className={styles.hero} aria-labelledby={headingId}>
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <p className={styles.eyebrow}>
            {t("admin:stickerPacks.preview.heading")}
          </p>
          <h3 id={headingId} className={styles.title}>
            {title}
          </h3>
        </div>
        <div className={styles.actions}>
          {/* Icon-only segments: each name stays in the button as
              screen-reader text, so the switch fits beside the title. */}
          <SegmentedControl
            label={t("admin:stickerPacks.preview.backdropLabel")}
            options={BACKDROPS.map((backdropOption) => ({
              value: backdropOption,
              label: (
                <span className="visuallyHidden">
                  {t(`admin:stickerPacks.preview.backdrop.${backdropOption}`)}
                </span>
              ),
              icon: BACKDROP_ICON[backdropOption],
            }))}
            value={backdrop}
            onChange={(value) => {
              if (isPreviewBackdrop(value)) onBackdropChange(value);
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            className={styles.download}
            title={t("admin:stickerPacks.preview.download")}
            disabled={itemId === null || isDownloading}
            onClick={() => void download()}
          >
            <FiDownload aria-hidden />
            <span className={styles.downloadLabel}>
              {t("admin:stickerPacks.preview.download")}
            </span>
          </Button>
        </div>
      </div>

      <div
        className={[styles.surface, BACKDROP_CLASS[backdrop]].join(" ")}
        data-theme={BACKDROP_THEME[backdrop]}
      >
        {itemId === null ? (
          <div className={styles.empty}>
            <FiEye className={styles.emptyIcon} aria-hidden />
            <p className={styles.emptyText}>
              {t("admin:stickerPacks.preview.pickItem")}
            </p>
          </div>
        ) : (
          <>
            <div className={styles.stage}>
              <StickerCanvas
                className={styles.heroCanvas}
                template={template}
                style={style}
                itemId={itemId}
                label={stickerLabel}
              />
            </div>
            <figure className={styles.chat}>
              <figcaption className={styles.chatCaption}>
                {t("admin:stickerPacks.preview.inChat")}
              </figcaption>
              <p className={styles.bubble}>
                {t("admin:stickerPacks.preview.chatBubble")}
              </p>
              <StickerCanvas
                className={styles.chatSticker}
                template={template}
                style={style}
                itemId={itemId}
                label={stickerLabel}
              />
            </figure>
          </>
        )}
      </div>
    </section>
  );
}
