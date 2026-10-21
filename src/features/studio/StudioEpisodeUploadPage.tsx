import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, m } from "motion/react";
import { FiArrowRight, FiCheck, FiLayers, FiSlash } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Button, EmptyState } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioTrackView } from "./api/studio.adapters";
import { useStudioRelease } from "./api/useStudioRelease";
import { StudioCreatorShell } from "./StudioCreatorShell";
import { StudioEpisodeAudioStep } from "./StudioEpisodeAudioStep";
import { StudioEpisodeForm } from "./StudioEpisodeForm";
import {
  StudioDetailSkeleton,
  StudioLoadError,
  StudioNotFound,
} from "./StudioLoadStates";
import { studioEpisodeUploadPath, studioUploadPath } from "./studioPaths";
import { StudioUploadActivityProvider } from "./upload/StudioUploadActivity";
import { expectDraftParam } from "./upload/useStudioUploadLeaveGuard";
import { useStudioDocumentTitle } from "./useStudioDocumentTitle";
import s from "./creator.module.css";
import css from "./StudioEpisodeUpload.module.css";
import publishStyles from "./StudioUploadPublish.module.css";

/** The episode page's draft lives in both params: dropping either leaves. */
const EPISODE_DRAFT_PARAMS = ["release", "episode"] as const;

/** The plum success panel, with ghost-dark buttons on its dark ground. The
 *  page's h1 carries the success line ("<title> is live") and takes focus. */
function PublishedPanel({ track }: { track: StudioTrackView }) {
  const { t } = useTranslation();
  return (
    <div className={s.submitted}>
      <div className={s.submittedIcon}>
        <FiCheck size={26} aria-hidden />
      </div>
      <div className={publishStyles.submittedActions}>
        <Button variant="ghost-dark" to={track.href}>
          {t("studio:episodeUpload.openEpisodeCta")}{" "}
          <FiArrowRight aria-hidden />
        </Button>
        <Button
          variant="ghost-dark"
          to={studioEpisodeUploadPath(track.releaseId)}
        >
          {t("studio:episodeUpload.anotherCta")}
        </Button>
        <Button variant="ghost-dark" to={track.release.href}>
          {t("studio:episodeUpload.backToShowCta")}
        </Button>
      </div>
    </div>
  );
}

/** The page's h1: New episode, Edit episode, or the success line once the
 *  episode is live, which takes focus so the news is heard. */
function StudioEpisodeHeading({
  trackId,
  publishedTitle,
}: {
  trackId: string | null;
  publishedTitle: string | null;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isPublished = publishedTitle !== null;
  useEffect(() => {
    if (isPublished) headingRef.current?.focus();
  }, [isPublished]);
  return (
    <h1 ref={headingRef} tabIndex={isPublished ? -1 : undefined}>
      {isPublished ? (
        <Translation
          i18nKey="studio:episodeUpload.publishedTitle"
          components={{ em: <em /> }}
          values={{ title: publishedTitle }}
        />
      ) : (
        <Translation
          i18nKey={
            trackId === null
              ? "studio:episodeUpload.newTitle"
              : "studio:episodeUpload.editTitle"
          }
          components={{ em: <em /> }}
        />
      )}
    </h1>
  );
}

/** /studio/upload?release=<show>&episode=new|<trackId> (spec 6.2). */
export function StudioEpisodeUploadPage() {
  const { t } = useTranslation();
  const formatters = useFormat();
  const [searchParams, setSearchParams] = useSearchParams();
  const releaseId = searchParams.get("release");
  const episodeParam = searchParams.get("episode");
  const trackId = episodeParam && episodeParam !== "new" ? episodeParam : null;
  const { release, loadState } = useStudioRelease(releaseId, {
    shouldUseDemoDefault: false,
  });
  // The panel belongs to the episode it published: Add another episode
  // moves to `episode=new`, which shows the drop zone again.
  const [publishedTrack, setPublishedTrack] = useState<StudioTrackView | null>(
    null,
  );
  // The episode the drop zone just made: its form focuses the title.
  const [arrivedTrackId, setArrivedTrackId] = useState<string | null>(null);
  const { reducedMotion } = useMotionPrefs();
  const openEpisode = useCallback(
    (readyTrackId: string) => {
      setArrivedTrackId(readyTrackId);
      // The leave guard lets `episode=new` become this id, and only this.
      expectDraftParam("episode", readyTrackId);
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          next.set("episode", readyTrackId);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );
  // The owner's release read lists every episode, drafts included.
  const isEpisodeOfShow =
    trackId === null || release?.tracks.some((track) => track.id === trackId);

  const isPublished = publishedTrack !== null && publishedTrack.id === trackId;
  useStudioDocumentTitle(
    t(
      trackId === null
        ? "studio:episodeUpload.pageTitleNew"
        : "studio:episodeUpload.pageTitleEdit",
    ),
  );

  // `bodyKey` names the state, so each swap fades through the shared motion.
  let body: ReactNode;
  let bodyKey: string;
  if (loadState.isNotFound || loadState.isWithdrawn) {
    bodyKey = "notFound";
    body = <StudioNotFound />;
  } else if (loadState.isError) {
    bodyKey = "error";
    body = (
      <StudioLoadError loadState={loadState} what="studio:errors.what.show" />
    );
  } else if (!release) {
    bodyKey = "loading";
    body = <StudioDetailSkeleton />;
  } else if (!release.isOwner || !release.isShow || !isEpisodeOfShow) {
    bodyKey = "notFound";
    body = <StudioNotFound />;
  } else if (release.status === "taken_down") {
    bodyKey = "takenDown";
    body = (
      <EmptyState
        icon={<FiSlash />}
        title={t("studio:uploadFlow.locked.takenDownTitle")}
        description={
          // With no reason on record, the line points to the notice
          // instead of printing an empty reason.
          release.takedownReason
            ? t("studio:uploadFlow.locked.takenDownBody", {
                reason: release.takedownReason,
              })
            : t("studio:uploadFlow.locked.takenDownBodyNoReason")
        }
        action={{
          label: t("studio:uploadFlow.locked.backCta"),
          to: release.artist.href,
        }}
        headingLevel={2}
      />
    );
  } else if (isPublished && publishedTrack) {
    bodyKey = "published";
    body = <PublishedPanel track={publishedTrack} />;
  } else if (
    trackId === null &&
    release.status === "scheduled" &&
    release.publishAt
  ) {
    bodyKey = "scheduledShow";
    body = (
      <>
        <p className={css.hint}>
          <strong>
            {t("studio:episodeUpload.scheduledShowTitle", {
              date: formatters.date(new Date(release.publishAt)),
            })}
          </strong>{" "}
          {t("studio:episodeUpload.scheduledShowBody")}
        </p>
        <StudioEpisodeAudioStep release={release} onReady={openEpisode} />
      </>
    );
  } else if (trackId === null && release.status !== "published") {
    bodyKey = "draftShow";
    body = (
      <EmptyState
        icon={<FiLayers />}
        title={t("studio:episodeUpload.draftShowTitle")}
        description={t("studio:episodeUpload.draftShowBody")}
        action={{
          label: t("studio:episodeUpload.draftShowCta"),
          to: studioUploadPath(release.id),
        }}
        headingLevel={2}
      />
    );
  } else if (trackId === null) {
    bodyKey = "audio";
    body = <StudioEpisodeAudioStep release={release} onReady={openEpisode} />;
  } else {
    bodyKey = `form-${trackId}`;
    body = (
      <StudioEpisodeForm
        release={release}
        trackId={trackId}
        shouldFocusTitle={arrivedTrackId === trackId}
        onPublished={setPublishedTrack}
      />
    );
  }

  return (
    <StudioUploadActivityProvider keptParams={EPISODE_DRAFT_PARAMS}>
      <StudioCreatorShell persona={release?.artist ?? null} isEditingRelease>
        <section className={s.hero}>
          <div className={`${s.heroInner} ${css.heroColumn}`}>
            <div className={s.eb}>{t("studio:episodeUpload.eyebrow")}</div>
            <StudioEpisodeHeading
              trackId={trackId}
              publishedTitle={
                isPublished && publishedTrack ? publishedTrack.title : null
              }
            />
            {release && (
              <div className={s.sub}>
                {t("studio:episodeUpload.forShow", { show: release.title })}
              </div>
            )}
          </div>
        </section>
        <section className={s.body}>
          <AnimatePresence mode="wait" initial={false}>
            <m.div
              key={bodyKey}
              className={css.main}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
            >
              {body}
            </m.div>
          </AnimatePresence>
        </section>
      </StudioCreatorShell>
    </StudioUploadActivityProvider>
  );
}
