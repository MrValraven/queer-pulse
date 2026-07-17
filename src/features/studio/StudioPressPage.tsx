import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button, ImageSlot } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { routes } from "../../app/routeMap";
import { StudioPressBar } from "./StudioPressBar";
import {
  PRESS_PORTRAIT,
  PRESS_COVER,
  PRESS_PHOTOS,
  PREVIEW_WAVE,
  PRESS_FACTS,
  BIO_SHORT,
  BIO_LONG,
  BIO_SHORT_RICH,
  BIO_LONG_RICH,
  PRESS_QUOTES,
  BOILERPLATE,
} from "./studioPress.data";
import styles from "./StudioPressPage.module.css";

/** Auto-generated artist press kit for Mariana Sol. Standalone dark page. */
export function StudioPressPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).then(
      () => showToast(t("studio:press.copiedToast"), "success"),
      () => showToast(t("studio:press.copyFailToast"), "info"),
    );
  };

  return (
    <div className={styles.page}>
      <StudioPressBar />
      <div className={styles.wrap}>
        <Hero />
        <PreviewSection />
        <BioSection onCopyBoth={() => copy(`${BIO_SHORT}\n\n${BIO_LONG}`)} />
        <PhotosSection
          onDownloadAll={() =>
            showToast(t("studio:press.downloadingPhotosToast"), "success")
          }
          onDownloadOne={() =>
            showToast(t("studio:press.downloadingPhotoToast"), "success")
          }
        />
        <ReleaseSection />
        <QuotesSection />
        <BoilerplateSection onCopy={copy} />
        <ContactSection
          onRequest={() =>
            showToast(t("studio:press.accessRequestedToast"), "success")
          }
        />
      </div>
    </div>
  );
}

function Hero() {
  const { t } = useTranslation();
  const facts = PRESS_FACTS;
  return (
    <div className={styles.hero}>
      <div className={styles.portrait}>
        <ImageSlot
          src={PRESS_PORTRAIT}
          tint="coral"
          shape="circle"
          width="100%"
          height="100%"
          placeholder="portrait · Mariana Sol"
          style={{ position: "absolute", inset: 0 }}
        />
      </div>
      <div className={styles.hi}>
        <div className={styles.eb}>{t("studio:press.eyebrow")}</div>
        <h1>
          Mariana <em>Sol</em>
        </h1>
        <div className={styles.tagline}>
          Fado that refuses church.{" "}
          <em>A hymn for the ones who left and the ones who stayed.</em>
        </div>
        <div className={styles.facts}>
          {facts.map((f) => (
            <div key={f.labelKey} className={styles.pf}>
              <span className={styles.l}>{t(f.labelKey)}</span>
              <span>{f.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionHead({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className={styles.sh}>
      <h2>{children}</h2>
      {action}
    </div>
  );
}

function PreviewSection() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [playing, setPlaying] = useState(false);

  return (
    <section className={styles.sec}>
      <SectionHead
        action={
          <button
            type="button"
            className={styles.dl}
            onClick={() =>
              showToast(t("studio:press.fullPromoRequestedToast"), "success")
            }
          >
            {t("studio:press.requestFullPromoCta")}
          </button>
        }
      >
        <Translation
          i18nKey="studio:press.section.preview"
          components={{ em: <em /> }}
        />
      </SectionHead>
      <div className={styles.track}>
        <button
          type="button"
          className={styles.playBig}
          aria-label={t(
            playing ? "studio:press.pauseAria" : "studio:press.playAria",
          )}
          aria-pressed={playing}
          onClick={() => setPlaying((p) => !p)}
        >
          {playing ? (
            <svg viewBox="0 0 12 14" fill="currentColor">
              <rect x="1" y="1" width="3.5" height="12" rx="1" />
              <rect x="7.5" y="1" width="3.5" height="12" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 12 14" fill="currentColor">
              <path d="M1 1l10 6-10 6z" />
            </svg>
          )}
        </button>
        <div className={styles.ptInfo}>
          <h4>
            Carta para a <em>santa</em>
          </h4>
          <div
            className={`${styles.ptWave} ${playing ? styles.wavePlaying : ""}`}
            aria-hidden
          >
            {PREVIEW_WAVE.map((h, i) => (
              <span key={i} style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <span className={styles.wmBadge}>
          {t("studio:press.watermarkedBadge")}
        </span>
      </div>
      <div className={styles.trackNote}>
        <Translation
          i18nKey="studio:press.previewNote"
          components={{ em: <em /> }}
        />
      </div>
    </section>
  );
}

function BioSection({ onCopyBoth }: { onCopyBoth: () => void }) {
  const { t } = useTranslation();
  return (
    <section className={styles.sec}>
      <SectionHead
        action={
          <button type="button" className={styles.dl} onClick={onCopyBoth}>
            {t("studio:press.copyBothCta")}
          </button>
        }
      >
        <Translation
          i18nKey="studio:press.section.bio"
          components={{ em: <em /> }}
        />
      </SectionHead>
      <div className={styles.bio}>
        <div className={`${styles.col} ${styles.short}`}>
          <div className={styles.bl}>{t("studio:press.bio.shortLabel")}</div>
          <p>{BIO_SHORT_RICH}</p>
        </div>
        <div className={styles.col}>
          <div className={styles.bl}>{t("studio:press.bio.longLabel")}</div>
          {BIO_LONG_RICH}
        </div>
      </div>
    </section>
  );
}

function PhotosSection({
  onDownloadAll,
  onDownloadOne,
}: {
  onDownloadAll: () => void;
  onDownloadOne: () => void;
}) {
  const { t } = useTranslation();
  return (
    <section className={styles.sec}>
      <SectionHead
        action={
          <button type="button" className={styles.dl} onClick={onDownloadAll}>
            {t("studio:press.downloadAllCta")}
          </button>
        }
      >
        <Translation
          i18nKey="studio:press.section.photos"
          components={{ em: <em /> }}
        />
      </SectionHead>
      <div className={styles.photos}>
        {PRESS_PHOTOS.map((p) => (
          <button
            key={p.caption}
            type="button"
            className={styles.photo}
            onClick={onDownloadOne}
          >
            <ImageSlot
              src={p.src}
              tint="plum"
              width="100%"
              height="100%"
              radius={14}
              placeholder={p.caption}
              style={{ position: "absolute", inset: 0 }}
            />
            <span className={styles.photoHint}>
              {t("studio:press.downloadOneHint")}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function ReleaseSection() {
  const { t } = useTranslation();
  return (
    <section className={styles.sec}>
      <SectionHead>
        <Translation
          i18nKey="studio:press.section.release"
          components={{ em: <em /> }}
        />
      </SectionHead>
      <Link to={routes.studioAlbum} className={styles.track}>
        <div className={styles.cv}>
          <ImageSlot
            src={PRESS_COVER}
            tint="coral"
            width="100%"
            height="100%"
            radius={12}
            placeholder="cover · Cidade dos santos"
            style={{ position: "absolute", inset: 0 }}
          />
        </div>
        <div className={styles.ptInfo}>
          <h4>
            Cidade dos <em>santos</em>
          </h4>
          <div className={styles.relMeta}>
            Album · 11 tracks · released 14 Mar 2026 · CC-BY-NC
          </div>
        </div>
        <span className={`${styles.wmBadge} ${styles.jade}`}>
          {t("studio:press.outNowBadge")}
        </span>
      </Link>
    </section>
  );
}

function QuotesSection() {
  return (
    <section className={styles.sec}>
      <SectionHead>
        <Translation
          i18nKey="studio:press.section.press"
          components={{ em: <em /> }}
        />
      </SectionHead>
      <div className={styles.quotes}>
        {PRESS_QUOTES.map((q) => (
          <div key={q.quote} className={styles.quote}>
            <p>"{q.quote}"</p>
            <div className={styles.src}>{q.source}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function BoilerplateSection({ onCopy }: { onCopy: (text: string) => void }) {
  const { t } = useTranslation();
  return (
    <section className={styles.sec}>
      <SectionHead>
        <Translation
          i18nKey="studio:press.section.boilerplate"
          components={{ em: <em /> }}
        />
      </SectionHead>
      <div className={styles.boiler}>
        {BOILERPLATE.map((row) => (
          <div key={row.labelKey} className={styles.copyRow}>
            <span className={styles.k}>{t(row.labelKey)}</span>
            <span className={styles.v}>{row.value}</span>
            <button
              type="button"
              className={styles.cp}
              onClick={() => onCopy(row.copy)}
            >
              {t("studio:press.copyCta")}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function ContactSection({ onRequest }: { onRequest: () => void }) {
  const { t } = useTranslation();
  return (
    <section className={styles.sec}>
      <div className={styles.contact}>
        <div className={styles.ci}>
          <h3>
            <Translation
              i18nKey="studio:press.section.contactHeading"
              components={{ em: <em /> }}
            />
          </h3>
          <p>
            Mariana handles her own press — no gatekeepers.{" "}
            <em>press@marianasol.pt</em> · usually replies within a day.
          </p>
        </div>
        <Button variant="ghost-dark" size="lg" to={routes.studioArtist}>
          {t("studio:press.viewArtistCta")}
        </Button>
        <Button variant="primary" size="lg" onClick={onRequest}>
          {t("studio:press.requestAccessCta")}
        </Button>
      </div>
      <div className={styles.gen}>
        {t("studio:press.generatedFooter", { name: "Mariana" })}
      </div>
    </section>
  );
}
