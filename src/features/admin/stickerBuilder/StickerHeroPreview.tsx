import { useId, useState, type ReactNode } from "react";
import { FiDownload, FiEye, FiGrid, FiMoon, FiSun } from "react-icons/fi";
import { useToast } from "../../../shared/components/feedback/useToast";
import { Button, SegmentedControl } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { renderStickerBlob } from "../../stickers/render/renderStickerBlob";
import { unoReverseGeometry } from "../../stickers/templates/unoReverse.geometry";
import type { UnoReverseParams } from "../../stickers/templates/unoReverse.params";
import { StickerCanvas } from "./StickerCanvas";
import type { PreviewBackdrop } from "./stickerBuilder.types";
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

/** Renders the sticker at its true 512px size and saves it as a PNG. */
function useStickerPngDownload(
  flagId: string | null,
  params: UnoReverseParams,
) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  async function download() {
    if (flagId === null || isDownloading) return;
    setIsDownloading(true);
    try {
      const blob = await renderStickerBlob(
        unoReverseGeometry({ ...params, flagId }),
      );
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `${flagId}-reverse.png`;
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
 * The builder's large preview of one flag: the sticker at hero size on a
 * chosen backdrop, the same sticker at its real size inside a mock chat, and
 * a PNG download of the exact art that would upload.
 */
export function StickerHeroPreview({
  flagId,
  params,
  backdrop,
  onBackdropChange,
}: {
  flagId: string | null;
  params: UnoReverseParams;
  backdrop: PreviewBackdrop;
  onBackdropChange: (backdrop: PreviewBackdrop) => void;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const { download, isDownloading } = useStickerPngDownload(flagId, params);
  const flagName = flagId === null ? null : t(`cards:flag.${flagId}`);
  const stickerLabel =
    flagName === null
      ? ""
      : t("admin:stickerPacks.publish.stickerLabel", { flag: flagName });

  return (
    <section className={styles.hero} aria-labelledby={headingId}>
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <p className={styles.eyebrow}>
            {t("admin:stickerPacks.preview.heading")}
          </p>
          <h3 id={headingId} className={styles.title}>
            {flagName ?? t("admin:stickerPacks.preview.noFlagTitle")}
          </h3>
        </div>
        <div className={styles.actions}>
          <SegmentedControl
            label={t("admin:stickerPacks.preview.backdropLabel")}
            options={BACKDROPS.map((backdropOption) => ({
              value: backdropOption,
              label: t(`admin:stickerPacks.preview.backdrop.${backdropOption}`),
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
            disabled={flagId === null || isDownloading}
            onClick={() => void download()}
          >
            <FiDownload aria-hidden />
            {t("admin:stickerPacks.preview.download")}
          </Button>
        </div>
      </div>

      <div
        className={[styles.surface, BACKDROP_CLASS[backdrop]].join(" ")}
        data-theme={BACKDROP_THEME[backdrop]}
      >
        {flagId === null ? (
          <div className={styles.empty}>
            <FiEye className={styles.emptyIcon} aria-hidden />
            <p className={styles.emptyText}>
              {t("admin:stickerPacks.preview.pickFlag")}
            </p>
          </div>
        ) : (
          <>
            <div className={styles.stage}>
              <StickerCanvas
                className={styles.heroCanvas}
                flagId={flagId}
                params={params}
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
                flagId={flagId}
                params={params}
                label={stickerLabel}
              />
            </figure>
          </>
        )}
      </div>
    </section>
  );
}
