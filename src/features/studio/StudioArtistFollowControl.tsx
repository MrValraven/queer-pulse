import { FiCheck, FiPlus } from "react-icons/fi";
import { useSocial } from "../../app/providers/useSocial";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SubprofileFollow } from "../subprofiles/SubprofileFollow";
import type { StudioArtistView } from "./api/studio.adapters";
import { useIsOwnStudioPersona } from "./useIsOwnStudioPersona";
import { useStudioShowcase } from "./useStudioShowcase";

/** Showcase Follow: the demo's local follow, with a toast. */
function ShowcaseFollow({ artist }: { artist: StudioArtistView }) {
  const { t } = useTranslation();
  const { isFollowing, toggleFollow } = useSocial();
  const { showToast } = useToast();
  const person = artist.artist;
  const isFollowed = isFollowing(person.id);
  return (
    <Button
      variant="quiet"
      aria-pressed={isFollowed}
      onClick={() => {
        const isNowFollowing = toggleFollow(person.id);
        showToast(
          t(
            isNowFollowing
              ? "studio:artist.hero.followedToast"
              : "studio:artist.hero.unfollowedToast",
            { artist: person.name },
          ),
          isNowFollowing ? "success" : "info",
        );
      }}
    >
      {isFollowed ? <FiCheck aria-hidden /> : <FiPlus aria-hidden />}
      {t("studio:artist.hero.followCta")}
    </Button>
  );
}

/** Follow for a Studio artist, shared by the artist hero and the Now
 *  playing About card. The member's own persona (owned, co-owned or one
 *  they upload for) gets no Follow at all. The showcase follows locally;
 *  live, `useFollow` patches the cached artist view and refreshes the
 *  library's Artists tab, so the hero and the card stay in step. */
export function StudioArtistFollowControl({
  artist,
}: {
  artist: StudioArtistView;
}) {
  const isShowcase = useStudioShowcase();
  const person = artist.artist;
  const isOwnPersona = useIsOwnStudioPersona(person.id);
  if (artist.isOwner || isOwnPersona) return null;
  if (isShowcase) return <ShowcaseFollow artist={artist} />;
  return (
    <SubprofileFollow
      subprofileId={person.id}
      followerCount={artist.followerCount}
      viewerFollowing={artist.isFollowing}
      isOwnerViewing={artist.isOwner}
    />
  );
}
