import { FiHeart } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import css from "./StudioLikeButton.module.css";
import { useStudioLike, type StudioLikeSubject } from "./useStudioLike";

/** The heart on every track surface: it adds the track to Liked songs or
 *  takes it out. The accessible name stays "Like {title}" in both states and
 *  aria-pressed carries the state. The labelled variant shows "Like" beside
 *  the heart, a word the accessible name starts with. `isQuiet` skips the
 *  confirming toast, for a surface that shows the change itself. */
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
  return (
    <button
      type="button"
      className={[css.button, !isLabelled && css.icon, className]
        .filter(Boolean)
        .join(" ")}
      aria-pressed={isLiked}
      aria-label={t("studio:like.trackAria", { title: subject.title })}
      onClick={() => {
        const isNowLiked = toggle();
        onToggled?.(isNowLiked);
      }}
    >
      <FiHeart fill={isLiked ? "currentColor" : "none"} aria-hidden />
      {/* A text space keeps the heart off the label, as on the sibling
          hero buttons. */}
      {isLabelled && " "}
      {isLabelled && <span>{t("studio:like.cta")}</span>}
    </button>
  );
}
