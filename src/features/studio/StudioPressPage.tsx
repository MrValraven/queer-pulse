import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Button, ImageSlot } from "../../shared/components/ui";
import { useShareLink } from "../../shared/hooks";
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
  BIO_SHORT_KEY,
  BIO_LONG_KEYS,
  buildBioCopy,
  PRESS_QUOTES,
  buildBoilerplate,
} from "./studioPress.data";
import { ALBUM } from "./studioAlbum.data";
import styles from "./StudioPressPage.module.css";

// Proper nouns stay literal: the artist's name, the preview track title and
// the press contact address. The phrases around them live in the
// `studioShowcase` catalog.
const ARTIST_NAME = "Mariana Sol";
const ARTIST_FIRST_NAME = "Mariana";
const ARTIST_LAST_NAME = "Sol";
const PREVIEW_TRACK_TITLE_PRE = "Carta para a ";
const PREVIEW_TRACK_TITLE_EM = "santa";
const CONTACT_EMAIL = "press@marianasol.pt";

/** Auto-generated artist press kit for Mariana Sol. Standalone dark page. */
export function StudioPressPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { share: copy } = useShareLink({
    copied: t("studio:press.copiedToast"),
    failed: t("studio:press.copyFailToast"),
  });

  return (
    <div className={styles.page}>
      <StudioPressBar />
      <div className={styles.wrap}>
        <Hero />
        <PreviewSection />
        <BioSection onCopyBoth={() => void copy(buildBioCopy(t))} />
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
        <BoilerplateSection onCopy={(text) => void copy(text)} />
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
          placeholder={`${t("studio:media.portraitLabel")} · ${ARTIST_NAME}`}
          style={{ position: "absolute", inset: 0 }}
        />
      </div>
      <div className={styles.hi}>
        <div className={styles.eb}>{t("studio:press.eyebrow")}</div>
        <h1>
          {ARTIST_FIRST_NAME} <em>{ARTIST_LAST_NAME}</em>
        </h1>
        <div className={styles.tagline}>
          <Translation
            i18nKey="studioShowcase:press.hero.tagline"
            components={{ em: <em /> }}
          />
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
            {t("studio:press.requestFullPromoCta")} <FiArrowRight aria-hidden />
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
            {PREVIEW_TRACK_TITLE_PRE}
            <em>{PREVIEW_TRACK_TITLE_EM}</em>
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
            {t("studio:press.copyBothCta")} <FiArrowRight aria-hidden />
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
          <p>
            <Translation i18nKey={BIO_SHORT_KEY} components={{ em: <em /> }} />
          </p>
        </div>
        <div className={styles.col}>
          <div className={styles.bl}>{t("studio:press.bio.longLabel")}</div>
          {BIO_LONG_KEYS.map((key) => (
            <p key={key}>
              <Translation i18nKey={key} components={{ em: <em /> }} />
            </p>
          ))}
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
            {t("studio:press.downloadAllCta")} <FiArrowRight aria-hidden />
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
            key={p.captionKey}
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
              placeholder={t(p.captionKey)}
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
            placeholder={`${t("studio:media.coverLabel")} · ${ALBUM.title}`}
            style={{ position: "absolute", inset: 0 }}
          />
        </div>
        <div className={styles.ptInfo}>
          <h4>
            {ALBUM.titlePre}
            <em>{ALBUM.titleEm}</em>
          </h4>
          <div className={styles.relMeta}>
            {t("studioShowcase:press.release.meta")}
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
  const { t } = useTranslation();
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
          <div key={q.quoteKey} className={styles.quote}>
            <p>"{t(q.quoteKey)}"</p>
            <div className={styles.src}>{q.source}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function BoilerplateSection({ onCopy }: { onCopy: (text: string) => void }) {
  const { t } = useTranslation();
  const boilerplateRows = useMemo(() => buildBoilerplate(t), [t]);
  return (
    <section className={styles.sec}>
      <SectionHead>
        <Translation
          i18nKey="studio:press.section.boilerplate"
          components={{ em: <em /> }}
        />
      </SectionHead>
      <div className={styles.boiler}>
        {boilerplateRows.map((row) => (
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
            <Translation
              i18nKey="studioShowcase:press.contact.body"
              values={{ email: CONTACT_EMAIL }}
              components={{ em: <em /> }}
            />
          </p>
        </div>
        <Button variant="ghost-dark" size="lg" to={routes.studioArtist}>
          {t("studio:press.viewArtistCta")} <FiArrowRight aria-hidden />
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
