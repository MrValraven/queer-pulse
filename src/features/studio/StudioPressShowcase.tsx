import { useMemo, useState } from "react";
import { FiArrowRight, FiPause, FiPlay } from "react-icons/fi";
import { Button, IconButton, ImageSlot } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useShareLink } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  PRESS_CONTACT_EMAIL,
  PRESS_FACTS,
  PRESS_PHOTOS,
  PREVIEW_TRACK_TITLE,
  PREVIEW_WAVE,
  buildBoilerplate,
} from "./studioPress.data";
import { PressSectionHead } from "./StudioPressSections";
import sections from "./StudioPressSections.module.css";
import styles from "./StudioPressShowcase.module.css";

// The demo's mock pieces, shown only on Mariana Sol's kit (the mock they
// describe). Downloads and requests answer with a toast.

export function PressShowcaseFacts() {
  const { t } = useTranslation();
  return (
    <div className={styles.facts}>
      {PRESS_FACTS.map((fact) => (
        <div key={fact.labelKey} className={styles.fact}>
          <span className={styles.factLabel}>{t(fact.labelKey)}</span>
          <span className={styles.factValue}>{fact.value}</span>
        </div>
      ))}
    </div>
  );
}

export function PressShowcasePreview() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  return (
    <section className={sections.section}>
      <PressSectionHead
        titleKey="studio:press.section.preview"
        action={
          <Button
            variant="quiet"
            size="sm"
            onClick={() =>
              showToast(t("studio:press.fullPromoRequestedToast"), "success")
            }
          >
            {t("studio:press.requestFullPromoCta")} <FiArrowRight aria-hidden />
          </Button>
        }
      />
      <div className={styles.preview}>
        <IconButton
          className={styles.previewPlay}
          aria-label={t(
            isPlaying ? "studio:press.pauseAria" : "studio:press.playAria",
          )}
          tooltip
          aria-pressed={isPlaying}
          onClick={() => setIsPlaying((wasPlaying) => !wasPlaying)}
        >
          {isPlaying ? <FiPause aria-hidden /> : <FiPlay aria-hidden />}
        </IconButton>
        <div className={styles.previewInfo}>
          <h3 className={styles.previewTitle}>
            {PREVIEW_TRACK_TITLE.pre}
            <em>{PREVIEW_TRACK_TITLE.em}</em>
          </h3>
          <div
            className={`${styles.wave} ${isPlaying ? styles.waveOn : ""}`}
            aria-hidden
          >
            {PREVIEW_WAVE.map((height, index) => (
              <span key={index} style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
        <span className={styles.badge}>
          {t("studio:press.watermarkedBadge")}
        </span>
      </div>
      <p className={styles.previewNote}>
        <Translation
          i18nKey="studio:press.previewNote"
          components={{ em: <em /> }}
        />
      </p>
    </section>
  );
}

export function PressShowcasePhotos() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  return (
    <section className={sections.section}>
      <PressSectionHead
        titleKey="studio:press.section.photos"
        action={
          <Button
            variant="quiet"
            size="sm"
            onClick={() =>
              showToast(t("studio:press.downloadingPhotosToast"), "success")
            }
          >
            {t("studio:press.downloadAllCta")} <FiArrowRight aria-hidden />
          </Button>
        }
      />
      <div className={styles.photos}>
        {PRESS_PHOTOS.map((photo) => (
          // raw <button>: whole-card hit target that holds other content
          <button
            key={photo.captionKey}
            type="button"
            className={styles.photo}
            onClick={() =>
              showToast(t("studio:press.downloadingPhotoToast"), "success")
            }
          >
            <ImageSlot
              src={photo.src}
              tint="plum"
              width="100%"
              height="100%"
              radius={14}
              placeholder={t(photo.captionKey)}
              style={{ position: "absolute", inset: 0 }}
            />
            <span className={styles.photoHint}>
              {t("studio:press.downloadOneHint")} <FiArrowRight aria-hidden />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function PressShowcaseBoilerplate() {
  const { t } = useTranslation();
  const { share: copy } = useShareLink({
    copied: t("studio:press.copiedToast"),
    failed: t("studio:press.copyFailToast"),
  });
  const rows = useMemo(() => buildBoilerplate(t), [t]);
  return (
    <section className={sections.section}>
      <PressSectionHead titleKey="studio:press.section.boilerplate" />
      <div className={styles.boiler}>
        {rows.map((row) => (
          <div key={row.labelKey} className={styles.copyRow}>
            <span className={styles.copyLabel}>{t(row.labelKey)}</span>
            <span className={styles.copyValue}>{row.value}</span>
            <Button
              variant="quiet"
              size="sm"
              onClick={() => void copy(row.copy)}
            >
              {t("studio:press.copyCta")}
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PressShowcaseRequest() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  return (
    <div className={styles.request}>
      <p className={styles.requestBody}>
        <Translation
          i18nKey="studioShowcase:press.contact.body"
          values={{ email: PRESS_CONTACT_EMAIL }}
          components={{ em: <em /> }}
        />
      </p>
      <Button
        variant="ghost"
        onClick={() =>
          showToast(t("studio:press.accessRequestedToast"), "success")
        }
      >
        {t("studio:press.requestAccessCta")}
      </Button>
    </div>
  );
}
