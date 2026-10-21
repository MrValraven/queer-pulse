import { useMemo, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiUserCheck, FiUserPlus } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useSocial } from "../../app/providers/useSocial";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button, ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFollow } from "../subprofiles/api/useFollow";
import type { StudioArtistRefView } from "./api/studio.adapters";
import { useStudioAccess } from "./api/useStudioAccess";
import { useStudioFollowedArtists } from "./api/useStudioFollowedArtists";
import { useStudioReleases } from "./api/useStudioReleases";
import { StudioLoadError } from "./StudioLoadStates";
import { StudioTracklistSkeleton } from "./StudioSkeletons";
import { studioErrorMessageKeyOf } from "./studioErrors.data";
import {
  suggestedArtistsOf,
  type StudioFirstRunArtist,
} from "./studioFirstRun.data";
import type { StudioTaste } from "./studioFirstRunTaste";
import {
  STUDIO_EXIT,
  STUDIO_FADE,
  STUDIO_SPRING_SOFT,
  studioStaggerDelay,
} from "./studioMotion";
import { useStudioShowcase } from "./useStudioShowcase";
import css from "./StudioFirstRun.module.css";

/** The persona follow everywhere else in Studio uses: the server's follow
 *  in live, the demo's local follow in the showcase (as on the artist
 *  page). The label names the artist, so a list of them reads clearly. */
function StudioFirstRunFollowButton({
  artist,
  isFollowed,
  onFollowChange,
}: {
  artist: StudioArtistRefView;
  isFollowed: boolean;
  onFollowChange: (artistId: string, isNowFollowing: boolean) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const isShowcase = useStudioShowcase();
  const { toggleFollow } = useSocial();
  const { follow, unfollow } = useFollow(artist.id);
  const isPending = follow.isPending || unfollow.isPending;

  const toggle = async () => {
    if (isPending) return;
    if (isShowcase) {
      onFollowChange(artist.id, toggleFollow(artist.id));
      return;
    }
    try {
      const mutation = isFollowed ? unfollow : follow;
      // The live follow reads the count from the server's answer.
      const result = await mutation.mutateAsync({ currentFollowerCount: 0 });
      onFollowChange(artist.id, result.viewerFollowing);
    } catch (error) {
      showToast(t(studioErrorMessageKeyOf(error)), "error");
    }
  };

  return (
    <Button
      variant={isFollowed ? "jade" : "ghost"}
      size="sm"
      aria-pressed={isFollowed}
      // One name in both states; aria-pressed carries Following.
      aria-label={t("studio:firstRun.follow.followLabel", {
        artist: artist.name,
      })}
      aria-disabled={isPending || undefined}
      onClick={() => void toggle()}
    >
      {isFollowed ? <FiUserCheck aria-hidden /> : <FiUserPlus aria-hidden />}
      {t(
        isFollowed
          ? "subprofiles:hero.follow.following"
          : "subprofiles:hero.follow.cta",
      )}
    </Button>
  );
}

/** Followed in live from the Library's own list, with this step's taps on
 *  top until that list refreshes; from the demo's local follow otherwise. */
function useFirstRunFollowState() {
  const isShowcase = useStudioShowcase();
  const { isFollowing } = useSocial();
  const { artists: followedArtists } = useStudioFollowedArtists();
  const [tapped, setTapped] = useState<ReadonlyMap<string, boolean>>(
    () => new Map(),
  );
  const followedIds = useMemo(
    () => new Set(followedArtists.map((artist) => artist.id)),
    [followedArtists],
  );
  const isFollowed = (artistId: string) =>
    isShowcase
      ? isFollowing(artistId)
      : (tapped.get(artistId) ?? followedIds.has(artistId));
  const setFollowed = (artistId: string, isNowFollowing: boolean) =>
    setTapped((previous) => new Map(previous).set(artistId, isNowFollowing));
  return { isFollowed, setFollowed };
}

function StudioFirstRunArtistList({
  suggestions,
}: {
  suggestions: readonly StudioFirstRunArtist[];
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const { isFollowed, setFollowed } = useFirstRunFollowState();
  return (
    <ul className={css.artists}>
      {suggestions.map(({ artist, sceneName }, index) => (
        <m.li
          key={artist.id}
          className={css.artist}
          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            ...STUDIO_SPRING_SOFT,
            delay: studioStaggerDelay(index),
          }}
        >
          <ImageSlot
            src={artist.avatarUrl ?? undefined}
            tint={artist.tint}
            radius={8}
            width={44}
            height={44}
            initials={artist.initials}
            placeholder={artist.name}
          />
          <span className={css.artistText}>
            <span className={css.artistName}>{artist.name}</span>
            <span className={css.artistMeta}>
              {sceneName ?? t(artist.kindLabelKey)}
            </span>
          </span>
          <StudioFirstRunFollowButton
            artist={artist}
            isFollowed={isFollowed(artist.id)}
            onFollowChange={setFollowed}
          />
        </m.li>
      ))}
    </ul>
  );
}

/** Step 3: artists from the scenes on Studio to follow, the ones matching
 *  step 2's picks first. Loading, a failed read, an empty list and the list
 *  crossfade into one another. */
export function StudioFirstRunFollowStep({ taste }: { taste: StudioTaste }) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const { releases, loadState } = useStudioReleases();
  const { uploadablePersonas } = useStudioAccess();
  const suggestions = useMemo(
    () =>
      suggestedArtistsOf(
        releases,
        taste,
        new Set(uploadablePersonas.map((persona) => persona.id)),
      ),
    [releases, taste, uploadablePersonas],
  );
  const view = loadState.isLoading
    ? "loading"
    : loadState.isError
      ? "error"
      : suggestions.length === 0
        ? "empty"
        : "list";
  const fade = reducedMotion ? { duration: 0.12 } : STUDIO_FADE;
  return (
    <>
      <p className={css.dek}>{t("studio:firstRun.follow.dek")}</p>
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={view}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: fade }}
          exit={{ opacity: 0, transition: reducedMotion ? fade : STUDIO_EXIT }}
        >
          {view === "loading" && (
            <StudioTracklistSkeleton
              rows={3}
              label={t("studio:firstRun.follow.loadingLabel")}
            />
          )}
          {view === "error" && (
            <StudioLoadError
              loadState={loadState}
              what="studio:errors.what.suggestedArtists"
            />
          )}
          {view === "empty" && (
            <p className={css.note}>{t("studio:firstRun.follow.empty")}</p>
          )}
          {view === "list" && (
            <StudioFirstRunArtistList suggestions={suggestions} />
          )}
        </m.div>
      </AnimatePresence>
    </>
  );
}
