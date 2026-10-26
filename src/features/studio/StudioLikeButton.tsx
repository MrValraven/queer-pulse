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
 *  variant has no tooltip of its own unless `hasTooltip` asks for one (the
 *  player bar, Now playing), which names what a press does now: Like or
 *  Unlike. The heroes wrap it in their own Tooltip instead. */
export function StudioLikeButton({
  subject,
  variant = "icon",
  className,
  isQuiet,
  hasTooltip = false,
  onToggled,
}: {
  subject: StudioLikeSubject;
  variant?: "icon" | "labelled";
  className?: string;
  isQuiet?: boolean;
  /** Icon variant only: a tooltip from the heart's own state. */
  hasTooltip?: boolean;
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
        tooltip={
          hasTooltip
            ? t(isLiked ? "studio:trackMenu.unlike" : "studio:like.cta")
            : undefined
        }
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
