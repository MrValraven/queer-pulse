import { Link } from "react-router-dom";
import { FiEdit2, FiExternalLink, FiEye, FiHeart } from "react-icons/fi";
import { Button, IconButton, Tooltip } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ShareMenu } from "../messages/share/ShareMenu";
import type { StudioArtistView } from "./api/studio.adapters";
import { StudioPlayButton } from "./kit/StudioPlayButton";
import { StudioArtistFollowControl } from "./StudioArtistFollowControl";
import { StudioArtistOverflow } from "./StudioArtistOverflow";
import { studioShareTrigger } from "./share/StudioShareMenu";
import { studioIdentityNote } from "./share/studioShareContent";
import { useStudioEditPageOpener } from "./studioEditPageOpener";
import { studioArtistPath } from "./studioPaths";
import { useIsOwnStudioPersona } from "./useIsOwnStudioPersona";
import { useStudioArtistPlay } from "./useStudioArtistPlay";
import { useStudioShowcase } from "./useStudioShowcase";
import { StudioInertFollow } from "./StudioArtistVisitorPreviewControls";
import { useStudioVisitorPreview } from "./studioVisitorPreview";
import styles from "./studio.module.css";
import kit from "./studioKit.module.css";

/** The artist hero's row: Play all (a toggle once one of these releases is
 *  playing), Follow, View profile, Tip (showcase), Share, and the More menu.
 *  The owner gets Play all, View profile, Share and Edit Studio page:
 *  following or tipping their own persona does nothing, and the shorter row
 *  keeps Edit Studio page on the same line. On a phone, Follow keeps its
 *  label and the rest after Play turn to icons. While the owner views the
 *  page as a visitor, Follow and Tip show as disabled look-alikes, so the
 *  row has the visitor's shape and nothing fires for the own persona. */
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
  // The same rule StudioArtistFollowControl applies, so no empty slot is
  // left in the row when there is no Follow.
  const isOwnPersona = useIsOwnStudioPersona(person.id);
  const profileLabel = t("studio:artistPage.viewProfile");
  const tipLabel = t("studio:detail.tipArtistCta", { artist: person.name });
  const editPageLabel = t("studio:artistPage.editPage.button");
  // The page provides the opener to an owner only.
  const openEditPage = useStudioEditPageOpener();
  const visitorLabel = t("studio:artistPage.viewAsVisitor");
  const { isVisitorPreview, enterVisitorPreview, visitorControlRef } =
    useStudioVisitorPreview();
  return (
    <>
      <StudioPlayButton
        state={play.state}
        onToggle={play.toggle}
        label={play.label}
        blockedReason={play.blockedReason}
      />
      {/* Follow keeps its words on a phone: it is the artist's main ask. */}
      {isVisitorPreview ? (
        <span className={styles.heroLabelled}>
          <StudioInertFollow />
        </span>
      ) : (
        !artist.isOwner &&
        !isOwnPersona && (
          <span className={styles.heroLabelled}>
            <StudioArtistFollowControl artist={artist} />
          </span>
        )
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
          <IconButton
            aria-label={tipLabel}
            tooltip
            disabled={isVisitorPreview}
            onClick={onTip}
          >
            <FiHeart aria-hidden />
          </IconButton>
        ) : (
          <Button
            variant="quiet"
            className={styles.tip}
            disabled={isVisitorPreview}
            onClick={onTip}
          >
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
      {/* The artist view carries no persona or page status, so the owner
          always gets the preview. */}
      {artist.isOwner &&
        enterVisitorPreview &&
        (isCompact ? (
          <IconButton
            ref={visitorControlRef}
            aria-label={visitorLabel}
            tooltip
            onClick={enterVisitorPreview}
          >
            <FiEye aria-hidden />
          </IconButton>
        ) : (
          <Button
            ref={visitorControlRef}
            variant="quiet"
            onClick={enterVisitorPreview}
          >
            <FiEye aria-hidden />
            {visitorLabel}
          </Button>
        ))}
    </>
  );
}
