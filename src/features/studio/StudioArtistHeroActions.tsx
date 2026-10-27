import { Link } from "react-router-dom";
import {
  FiCheck,
  FiEdit2,
  FiExternalLink,
  FiHeart,
  FiPlus,
} from "react-icons/fi";
import { Button, IconButton, Tooltip } from "../../shared/components/ui";
import { useSocial } from "../../app/providers/useSocial";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ShareMenu } from "../messages/share/ShareMenu";
import { SubprofileFollow } from "../subprofiles/SubprofileFollow";
import type { StudioArtistView } from "./api/studio.adapters";
import { StudioPlayButton } from "./kit/StudioPlayButton";
import { StudioArtistOverflow } from "./StudioArtistOverflow";
import { studioShareTrigger } from "./share/StudioShareMenu";
import { studioIdentityNote } from "./share/studioShareContent";
import { useStudioEditPageOpener } from "./studioEditPageOpener";
import { studioArtistPath } from "./studioPaths";
import { useStudioArtistPlay } from "./useStudioArtistPlay";
import { useStudioShowcase } from "./useStudioShowcase";
import styles from "./studio.module.css";
import kit from "./studioKit.module.css";

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

/** The artist hero's row: Play all (a toggle once one of these releases is
 *  playing), Follow, View profile, Tip (showcase), Share, and the More menu.
 *  The owner gets Play all, View profile, Share and Edit Studio page:
 *  following or tipping their own persona does nothing, and the shorter row
 *  keeps Edit Studio page on the same line. On a phone, Follow keeps its
 *  label and the rest after Play turn to icons. */
export function StudioArtistHeroActions({
  artist,
  onTip,
  isCompact,
}: {
  artist: StudioArtistView;
  onTip: () => void;
  isCompact: boolean;
}) {
  const { t } = useTranslation();
  const isShowcase = useStudioShowcase();
  const play = useStudioArtistPlay(artist);
  const person = artist.artist;
  const profileLabel = t("studio:artistPage.viewProfile");
  const tipLabel = t("studio:detail.tipArtistCta", { artist: person.name });
  const editPageLabel = t("studio:artistPage.editPage.button");
  // The page provides the opener to an owner only.
  const openEditPage = useStudioEditPageOpener();
  return (
    <>
      <StudioPlayButton
        state={play.state}
        onToggle={play.toggle}
        label={play.label}
        blockedReason={play.blockedReason}
      />
      {/* Follow keeps its words on a phone: it is the artist's main ask. */}
      {!artist.isOwner && (
        <span className={styles.heroLabelled}>
          {isShowcase ? (
            <ShowcaseFollow artist={artist} />
          ) : (
            // useFollow patches the artist view and refreshes the library's
            // Artists tab itself.
            <SubprofileFollow
              subprofileId={person.id}
              followerCount={artist.followerCount}
              viewerFollowing={artist.isFollowing}
              isOwnerViewing={artist.isOwner}
            />
          )}
        </span>
      )}
      {person.personaHref &&
        (isCompact ? (
          <Tooltip label={profileLabel} placement="top">
            <Link
              to={person.personaHref}
              className={styles.heroIconLink}
              aria-label={profileLabel}
            >
              <FiExternalLink aria-hidden />
            </Link>
          </Tooltip>
        ) : (
          <Link to={person.personaHref} className={kit.pillLink}>
            {profileLabel} <FiExternalLink aria-hidden />
          </Link>
        ))}
      {isShowcase &&
        !artist.isOwner &&
        (isCompact ? (
          <IconButton aria-label={tipLabel} tooltip onClick={onTip}>
            <FiHeart aria-hidden />
          </IconButton>
        ) : (
          <Button variant="quiet" className={styles.tip} onClick={onTip}>
            <FiHeart aria-hidden />
            {tipLabel}
          </Button>
        ))}
      {/* Artist links stay plain links with no card; the owner sees the
          identity note because the link pairs their account with the
          persona. */}
      <ShareMenu
        content={{
          path: studioArtistPath(person.id),
          title: person.name,
          kind: "studio",
          text: person.name,
        }}
        identityNote={studioIdentityNote(
          t,
          artist.isOwner ? person.name : null,
        )}
        triggerLabel={t("studio:detail.shareCta")}
        triggerAriaLabel={t("studio:hero.shareAria", { title: person.name })}
        tooltipPlacement="top"
        renderTrigger={
          isCompact
            ? undefined
            : studioShareTrigger(t("studio:detail.shareCta"))
        }
      />
      {!artist.isOwner && (
        <StudioArtistOverflow subprofileId={person.id} name={person.name} />
      )}
      {artist.isOwner &&
        openEditPage &&
        (isCompact ? (
          <IconButton aria-label={editPageLabel} tooltip onClick={openEditPage}>
            <FiEdit2 aria-hidden />
          </IconButton>
        ) : (
          <Button variant="quiet" onClick={openEditPage}>
            <FiEdit2 aria-hidden />
            {editPageLabel}
          </Button>
        ))}
    </>
  );
}
