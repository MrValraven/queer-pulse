import { FiHeart } from "react-icons/fi";
import { Button, IconButton } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReleaseCardView } from "./api/studio.adapters";
import { useStudioSaveToggle } from "./useStudioSaveToggle";
import css from "./StudioLikeButton.module.css";

/** A hero's heart (release, show, playlist and the Studio home hero): it
 *  adds the collection to the member's library, where the rail lists it
 *  beside their playlists, or takes it out. It looks like the track heart:
 *  filled when liked, one fixed name, `label` ("Like {title}"), and
 *  aria-pressed for the state. Labelled, it reads "Like", as the track's
 *  labelled heart does. Icon-only, it is the round button with a tooltip
 *  naming what a press does now: Like, or Remove from your library. */
export function StudioCollectionLikeButton({
  like,
  label,
  isIconOnly,
}: {
  like: ReturnType<typeof useStudioSaveToggle>;
  label: string;
  isIconOnly: boolean;
}) {
  const { t } = useTranslation();
  const heart = (
    <FiHeart fill={like.isSaved ? "currentColor" : "none"} aria-hidden />
  );
  if (isIconOnly)
    return (
      <IconButton
        className={css.button}
        aria-label={label}
        aria-pressed={like.isSaved}
        tooltip={t(
          like.isSaved ? "studio:like.collectionUnlike" : "studio:like.cta",
        )}
        onClick={like.toggle}
      >
        {heart}
      </IconButton>
    );
  return (
    <Button
      variant="quiet"
      className={css.button}
      aria-label={label}
      aria-pressed={like.isSaved}
      onClick={like.toggle}
    >
      {heart}
      {/* A text space keeps the heart off the label, as on the track's
          labelled heart. */}{" "}
      <span>{t("studio:like.cta")}</span>
    </Button>
  );
}

/** A release's or a show's heart. `release` needs only what the saved
 *  snapshot keeps, so the home hero's card view fits as well. `meta` is the
 *  snapshot's line, the artist unless the caller names another (a show's). */
export function StudioReleaseLikeButton({
  release,
  isIconOnly,
  meta,
}: {
  release: Pick<StudioReleaseCardView, "savedId" | "title" | "href"> & {
    artist: { name: string };
  };
  isIconOnly: boolean;
  meta?: string;
}) {
  const { t } = useTranslation();
  const like = useStudioSaveToggle({
    savedId: release.savedId,
    kind: "studio_release",
    title: release.title,
    href: release.href,
    meta: meta ?? release.artist.name,
  });
  return (
    <StudioCollectionLikeButton
      like={like}
      label={t("studio:like.collectionAria", { title: release.title })}
      isIconOnly={isIconOnly}
    />
  );
}
