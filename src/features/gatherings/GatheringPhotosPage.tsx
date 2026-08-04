import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiPlay } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { DownloadAlbumModal } from "./DownloadAlbumModal";
import { PhotoViewer } from "./PhotoViewer";
import {
  ALL_CHIP_KEY,
  CHIPS,
  CONTRIBUTORS,
  PHOTOS_CONSENTED_COUNT,
  PHOTOS_DEK,
  PHOTOS_DEK_EMPHASIS,
  PHOTOS_DEK_SUFFIX,
  PHOTOS_EVENT_DATE,
  PHOTOS_EVENT_TITLE,
  PHOTOS_EXTRA_ATTENDEE_COUNT,
  PHOTOS_HOST_MEMBER,
  PHOTOS_HOST_ORG,
  PHOTOS_NEXT_EVENT_DATE,
  PHOTOS_PHOTOGRAPHER,
  PHOTOS_TOTAL_COUNT,
  PHOTOS_VENUE,
  PICS,
} from "./gatheringPhotos.data";
import {
  DEMO_GATHERING_SLUGS,
  gatheringPath,
  gatheringRecapPath,
} from "./data";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useEvent } from "./api/useEvent";
import { GatheringPhotosLive } from "./GatheringPhotosLive";
import styles from "./GatheringPhotosPage.module.css";

function PhotoSkeleton({ span }: { span?: string }) {
  // Mirror each .pic tile (incl. wide/tall spans) so the grid does not shift on swap.
  return (
    <div
      className={[styles.pic, span && styles[span]].filter(Boolean).join(" ")}
      aria-hidden
    >
      <SkeletonLine width="100%" height="100%" style={{ borderRadius: 8 }} />
    </div>
  );
}

const RECAP = gatheringRecapPath(DEMO_GATHERING_SLUGS.photos);
const MEMBER = routes.members;
const CALENDAR = routes.calendar;
const REPORT = routes.report;

/**
 * The hero eyebrow/title/dek. "Open clinic night", "Café Beirão", the two
 * attendee names, and the dek's descriptive sentences are this specific
 * album's own content — in live mode they'd come straight off the album
 * record, so they stay in English. The surrounding labels ("Hosted by",
 * "Photos by") and every count are chrome + real data through `t()`/`fmt`.
 */
function GatheringPhotosHero() {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <Link to={RECAP} className={styles.back}>
          ← {t("gatherings:photos.backToRecap")}
        </Link>
        <div className={styles.eyebrow}>
          <span>
            {t("gatherings:photos.albumLabel", { count: PHOTOS_TOTAL_COUNT })}
          </span>
          <span className={styles.sep}>·</span>
          <span>{PHOTOS_EVENT_TITLE}</span>
          <span className={styles.sep}>·</span>
          <span>{PHOTOS_VENUE}</span>
        </div>
        <h1 className={styles.h1}>
          {PHOTOS_EVENT_TITLE} ·{" "}
          <em>
            {fmt.date(PHOTOS_EVENT_DATE, { day: "numeric", month: "short" })}
          </em>
        </h1>
        <p className={styles.dek}>
          {PHOTOS_DEK} <em>{PHOTOS_DEK_EMPHASIS}</em> {PHOTOS_DEK_SUFFIX}
        </p>
        <div className={styles.meta}>
          <span>
            {t("gatherings:photos.hostedBy")} <b>{PHOTOS_HOST_MEMBER}</b> &amp;{" "}
            <b>{PHOTOS_HOST_ORG}</b>
          </span>
          <span>
            {t("gatherings:photos.photosByLabel")}{" "}
            <Link to={MEMBER}>{PHOTOS_PHOTOGRAPHER}</Link>{" "}
            {t("gatherings:photos.plusAttendees", {
              count: PHOTOS_EXTRA_ATTENDEE_COUNT,
            })}
          </span>
          <span>
            <b>{PHOTOS_TOTAL_COUNT}</b>{" "}
            {t("gatherings:photos.photosLabel", { count: PHOTOS_TOTAL_COUNT })}{" "}
            · <b>{PHOTOS_CONSENTED_COUNT}</b>{" "}
            {t("gatherings:photos.consentToPublish")}
          </span>
        </div>
      </div>
    </section>
  );
}

function GatheringPhotosControls({
  chip,
  setChip,
  onDownload,
  onSlideshow,
}: {
  chip: number;
  setChip: (index: number) => void;
  onDownload: () => void;
  onSlideshow: () => void;
}) {
  const { t } = useTranslation();
  const chipLabels = [t(ALL_CHIP_KEY), ...CHIPS];
  return (
    <div className={styles.controls}>
      <div className={styles.controlsInner}>
        {chipLabels.map((label, i) => (
          <button
            key={label}
            type="button"
            className={[styles.chip, chip === i && styles.chipActive]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setChip(i)}
          >
            {label}
            {i === 0 && <span> {PHOTOS_TOTAL_COUNT}</span>}
          </button>
        ))}
        <div className={styles.right}>
          <button type="button" className={styles.action} onClick={onDownload}>
            {t("gatherings:photos.downloadAllCta")}
          </button>
          <button type="button" className={styles.action} onClick={onSlideshow}>
            <FiPlay style={{ verticalAlign: "-2px", marginRight: 4 }} />{" "}
            {t("gatherings:photos.slideshowCta")}
          </button>
        </div>
      </div>
    </div>
  );
}

/** The reusable "how we handle gathering photos" policy block + credits +
 *  footer actions. The policy copy is platform boilerplate (chrome); the
 *  photographer names are content. */
function GatheringPhotosFooter() {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <section className={styles.foot}>
      <div className={styles.footInner}>
        <h3>
          <Translation
            i18nKey="gatherings:photos.policyTitle"
            components={{ em: <em /> }}
          />
        </h3>
        <p>
          <Translation
            i18nKey="gatherings:photos.policyBody1"
            components={{ b: <b /> }}
          />
        </p>
        <p>
          <Translation
            i18nKey="gatherings:photos.policyBody2"
            components={{
              em: <em />,
              // eslint-disable-next-line jsx-a11y/anchor-has-content -- element template; <Translation> clones it with the link text at render time.
              mailLink: <a href="mailto:photos@queerpulse.pt" />,
              privLink: <Link to={routes.privacy} />,
            }}
          />
        </p>

        <h3 style={{ marginTop: 24 }}>
          <Translation
            i18nKey="gatherings:photos.photographersTitle"
            components={{ em: <em /> }}
          />
        </h3>
        <div className={styles.contrib}>
          {CONTRIBUTORS.map((c) => (
            <Link to={MEMBER} className={styles.pill} key={c.name}>
              <span
                className={styles.pillAv}
                style={{ background: c.background, color: c.color }}
              >
                {c.initials}
              </span>
              <b>{c.name}</b>
              <span className={styles.ct}>
                {c.count}{" "}
                {t("gatherings:photos.photosLabel", { count: c.count })}
              </span>
            </Link>
          ))}
        </div>

        <div className={styles.footActions}>
          <Button variant="primary" to={RECAP}>
            ← {t("gatherings:photos.readRecapCta")}
          </Button>
          <Button variant="ghost" to={CALENDAR}>
            {t("gatherings:photos.nextClinicCta", {
              date: fmt.date(PHOTOS_NEXT_EVENT_DATE, {
                day: "numeric",
                month: "short",
              }),
            })}
          </Button>
          <Button variant="ghost" to={REPORT}>
            {t("gatherings:photos.flagCta")}
          </Button>
        </div>
      </div>
    </section>
  );
}

export function GatheringPhotosPage() {
  // All hooks run every render (Rules of Hooks) — the demo-only view state
  // below is simply unused in the live branch.
  const { slug: routeParam } = useParams();
  const { demoMode } = useDemoMode();
  const { data: eventData } = useEvent(routeParam);
  const [chip, setChip] = useState(0);
  const [viewer, setViewer] = useState<{
    index: number;
    slideshow: boolean;
  } | null>(null);
  const [downloading, setDownloading] = useState(false);
  const loading = useSimulatedLoad();

  // Live mode: real photos for this event, gated by the backend to
  // participants. The prototype hero/controls/footer are demo-only chrome, so
  // live renders a minimal header (real event title) + the live mosaic; the
  // upload control is shown to organizers (host or cohost) via the detail's
  // server-decided `viewerIsOrganizer`.
  if (!demoMode) {
    const gathering = eventData?.gathering;
    // Organizer = host or cohost, decided server-side (`EventDetail.isOrganizer`).
    const canUpload = Boolean(gathering?.viewerIsOrganizer);
    return (
      <PageShell>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            {gathering && (
              <Link
                to={gatheringPath(gathering.slug)}
                className={styles.back}
              >
                ← {gathering.title}
              </Link>
            )}
            <h1 className={styles.h1}>{gathering?.title ?? ""}</h1>
          </div>
        </section>
        <GatheringPhotosLive
          slug={gathering?.slug ?? ""}
          canUpload={canUpload}
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <GatheringPhotosHero />
      <GatheringPhotosControls
        chip={chip}
        setChip={setChip}
        onDownload={() => setDownloading(true)}
        onSlideshow={() => setViewer({ index: 0, slideshow: true })}
      />

      <div className={styles.mosaic}>
        {loading
          ? PICS.map((p, i) => <PhotoSkeleton key={i} span={p.span} />)
          : PICS.map((p, i) => (
              <FadeIn
                key={i}
                as="button"
                type="button"
                delay={Math.min(i, 8) * 60}
                className={[
                  styles.pic,
                  p.span && styles[p.span],
                  styles[p.tint],
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setViewer({ index: i, slideshow: false })}
              >
                {p.tag && (
                  <span
                    className={[styles.tag, p.tagAccent && styles.tagAccent]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {p.tag}
                  </span>
                )}
                {p.label}
              </FadeIn>
            ))}
      </div>

      <GatheringPhotosFooter />

      {viewer && (
        <PhotoViewer
          pics={PICS}
          startIndex={viewer.index}
          slideshow={viewer.slideshow}
          onClose={() => setViewer(null)}
        />
      )}

      {downloading && (
        <DownloadAlbumModal
          photoCount={PHOTOS_TOTAL_COUNT}
          onClose={() => setDownloading(false)}
        />
      )}
    </PageShell>
  );
}
