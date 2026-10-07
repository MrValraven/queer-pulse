import { FiAlertCircle, FiCheck, FiDownload } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { Translation } from "../../../shared/i18n/Translation";
import { useFormat } from "../../../shared/i18n/format";
import type { FilmFormatId } from "./marketingVideos.data";
import type { RenderState } from "./useFilmRender";
import styles from "./MarketingVideos.module.css";

/** The studio bar once a render has finished: the file to download. */
export function RenderDone({
  state,
  onReset,
  onClose,
}: {
  state: Extract<RenderState, { status: "done" }>;
  onReset: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const { film, url } = state;
  const megabytes = format.number(film.blob.size / 1_000_000, {
    maximumFractionDigits: 1,
  });
  return (
    <div className={styles.barBody}>
      <p className={styles.doneTitle} role="status">
        <span className={styles.doneIcon}>
          <FiCheck aria-hidden />
        </span>
        <Translation
          i18nKey="admin:marketingVideos.studio.done.title"
          components={{ em: <em /> }}
        />
      </p>
      <p className={styles.barMeta}>
        {t("admin:marketingVideos.studio.done.meta", {
          size: `${megabytes} MB`,
          width: film.capturedWidth,
          height: film.capturedHeight,
        })}
      </p>
      {film.fileName.endsWith(".webm") && (
        <p className={styles.barHint}>
          {t("admin:marketingVideos.studio.done.notMp4")}
        </p>
      )}
      <div className={styles.barActions}>
        <Button href={url} download={film.fileName}>
          <FiDownload aria-hidden />
          {t("admin:marketingVideos.studio.done.download", {
            fileName: film.fileName,
          })}
        </Button>
        <Button variant="ghost-dark" onClick={onReset}>
          {t("admin:marketingVideos.studio.again")}
        </Button>
        <Button variant="ghost-dark" onClick={onClose}>
          {t("admin:marketingVideos.studio.close")}
        </Button>
      </div>
    </div>
  );
}

/**
 * The studio bar after a failed render: why, and how to try again. Without
 * `onReset` (a film that can't be recorded at all) only Close is offered.
 */
export function RenderFailed({
  state,
  format,
  onReset,
  onClose,
}: {
  state: Extract<RenderState, { status: "failed" }>;
  /** The shape being rendered, named by the "format" message. */
  format: FilmFormatId;
  onReset?: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.barBody}>
      <p className={styles.barError} role="alert">
        <FiAlertCircle aria-hidden />
        {t(`admin:marketingVideos.studio.error.${state.reason}`, {
          format: t(`admin:marketingVideos.format.${format}.output`),
        })}
      </p>
      <div className={styles.barActions}>
        {onReset && (
          <Button onClick={onReset}>
            {t("admin:marketingVideos.studio.again")}
          </Button>
        )}
        <Button variant="ghost-dark" onClick={onClose}>
          {t("admin:marketingVideos.studio.close")}
        </Button>
      </div>
    </div>
  );
}
