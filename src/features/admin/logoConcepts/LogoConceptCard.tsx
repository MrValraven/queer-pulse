import { useState } from "react";
import { FiAlertCircle, FiDownload, FiImage } from "react-icons/fi";
import { Button, SegmentedControl } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  LOGO_COLORWAYS,
  logoAssetPath,
  type LogoColorway,
  type LogoConcept,
} from "./logoConcepts.data";
import { downloadLogoPng, downloadLogoSvg } from "./logoDownload";
import { LogoSizeLadder } from "./LogoSizeLadder";
import styles from "./LogoConcepts.module.css";

type DownloadFormat = "svg" | "png";

/** Edge of the hero image in pixels; CSS shrinks it on a narrow card. */
const HERO_SIZE = 220;

/** Literal keys, so catalog checks can find every one. */
const COLORWAY_LABEL_KEY: Record<LogoColorway, string> = {
  plum: "admin:logoConcepts.colorways.plum",
  cream: "admin:logoConcepts.colorways.cream",
  mono: "admin:logoConcepts.colorways.mono",
};

function isLogoColorway(value: string): value is LogoColorway {
  return (LOGO_COLORWAYS as readonly string[]).includes(value);
}

/**
 * One logo concept: the mark large in the picked colourway, the colourway
 * switch, the avatar size ladder, what the concept is, and the SVG and PNG
 * downloads of the picked colourway (always the full cut). A failed download
 * shows an inline error in the card until the next attempt or colourway
 * change. `headingLevel` keeps the heading order right where the card sits
 * under a section heading.
 */
export function LogoConceptCard({
  concept,
  headingLevel = 2,
}: {
  concept: LogoConcept;
  headingLevel?: 2 | 3;
}) {
  const { t } = useTranslation();
  const [colorway, setColorway] = useState<LogoColorway>("plum");
  const [pendingFormat, setPendingFormat] = useState<DownloadFormat | null>(
    null,
  );
  /** The failed download, with the colourway it was for, so a download that
   *  fails after a colourway change shows no error under the new one. */
  const [failure, setFailure] = useState<{
    format: DownloadFormat;
    colorway: LogoColorway;
  } | null>(null);
  const failedFormat = failure?.colorway === colorway ? failure.format : null;
  const title = t(concept.titleKey);
  const colorwayLabel = t(COLORWAY_LABEL_KEY[colorway]);
  const headingId = `logo-concept-${concept.id}`;
  const Heading = headingLevel === 3 ? "h3" : "h2";

  function changeColorway(value: string) {
    if (!isLogoColorway(value)) return;
    setColorway(value);
    setFailure(null);
  }

  async function download(format: DownloadFormat) {
    if (pendingFormat) return;
    const requestedColorway = colorway;
    setPendingFormat(format);
    setFailure(null);
    try {
      if (format === "svg") {
        await downloadLogoSvg(concept.id, requestedColorway);
      } else {
        await downloadLogoPng(concept.id, requestedColorway);
      }
    } catch {
      setFailure({ format, colorway: requestedColorway });
    } finally {
      setPendingFormat(null);
    }
  }

  return (
    <article className={styles.card} aria-labelledby={headingId}>
      <div className={styles.heroStage}>
        <div className={styles.heroFrame} data-colorway={colorway}>
          <img
            className={styles.heroImage}
            src={logoAssetPath(concept.id, colorway)}
            width={HERO_SIZE}
            height={HERO_SIZE}
            alt={t("admin:logoConcepts.card.heroAlt", {
              title,
              colorway: colorwayLabel,
            })}
            decoding="async"
          />
        </div>
      </div>
      <div className={styles.cardBody}>
        <Heading id={headingId} className={styles.cardTitle}>
          {title}
        </Heading>
        <p className={styles.cardSummary}>{t(concept.summaryKey)}</p>
        <SegmentedControl
          className={styles.colorwaySwitch}
          fullWidth
          label={t("admin:logoConcepts.card.colorwayLabel", { title })}
          options={LOGO_COLORWAYS.map((option) => ({
            value: option,
            label: t(COLORWAY_LABEL_KEY[option]),
          }))}
          value={colorway}
          onChange={changeColorway}
        />
        <LogoSizeLadder
          conceptId={concept.id}
          colorway={colorway}
          hasSmallCut={concept.hasSmallCut}
        />
        <div className={styles.cardFoot}>
          <div className={styles.cardActions}>
            <Button
              variant="ghost"
              size="sm"
              aria-busy={pendingFormat === "svg" || undefined}
              onClick={() => void download("svg")}
            >
              <FiDownload aria-hidden />
              {t("admin:logoConcepts.card.downloadSvg")}
            </Button>
            <Button
              size="sm"
              aria-busy={pendingFormat === "png" || undefined}
              onClick={() => void download("png")}
            >
              <FiImage aria-hidden />
              {t("admin:logoConcepts.card.downloadPng")}
            </Button>
          </div>
          {failedFormat && (
            <p className={styles.error} role="alert">
              <FiAlertCircle aria-hidden />
              {t(
                failedFormat === "png"
                  ? "admin:logoConcepts.card.pngError"
                  : "admin:logoConcepts.card.svgError",
              )}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
