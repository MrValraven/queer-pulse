import { FiHeart } from "react-icons/fi";
import { Button, IconButton } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import css from "./StudioLikeButton.module.css";
import { useStudioLike, type StudioLikeSubject } from "./useStudioLike";

/** The heart on every track surface: it adds the track to Liked songs or
 *  takes it out. The accessible name stays "Like {title}" in both states and
 *  aria-pressed carries the state. The labelled variant shows "Like" beside
 *  the heart, a word the accessible name starts with. `isQuiet` skips the
 *  confirming toast, for a surface that shows the change itself. The icon
 *  variant is an IconButton with no tooltip of its own, as its sibling
 *  StudioAddToPlaylistButton: the heroes wrap it in a Tooltip already. */
export function StudioLikeButton({
  subject,
  variant = "icon",
  className,
  isQuiet,
  onToggled,
}: {
  subject: StudioLikeSubject;
  variant?: "icon" | "labelled";
  className?: string;
  isQuiet?: boolean;
  onToggled?: (isNowLiked: boolean) => void;
}) {
  const { t } = useTranslation();
  const { isLiked, toggle } = useStudioLike(subject, { isQuiet });
  const isLabelled = variant === "labelled";
  const onClick = () => {
    const isNowLiked = toggle();
    onToggled?.(isNowLiked);
  };
  const label = t("studio:like.trackAria", { title: subject.title });
  const heart = (
    <FiHeart fill={isLiked ? "currentColor" : "none"} aria-hidden />
  );
  if (!isLabelled) {
    return (
      <IconButton
        className={[css.button, css.icon, className].filter(Boolean).join(" ")}
        aria-pressed={isLiked}
        aria-label={label}
        onClick={onClick}
      >
        {heart}
      </IconButton>
    );
  }
  return (
    <Button
      variant="quiet"
      className={[css.button, className].filter(Boolean).join(" ")}
      aria-pressed={isLiked}
      aria-label={label}
      onClick={onClick}
    >
      {heart}
      {/* A text space keeps the heart off the label, as on the sibling
          hero buttons. */}{" "}
      <span>{t("studio:like.cta")}</span>
    </Button>
  );
}
