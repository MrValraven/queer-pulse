import { useState, type FormEvent } from "react";
import { FiStar } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { DirectoryReviewPhotoField } from "./DirectoryReviewPhotoField";
import s from "./DirectorySpacePage.module.css";

const STAR_VALUES = [1, 2, 3, 4, 5];

/** What the composer hands back on submit. `photo` follows the endpoint's own
 *  contract: absent leaves any existing photo alone, `""` clears it, and a
 *  `listing-photo` presign key attaches a new one. */
export interface ReviewComposerValues {
  stars: number;
  text: string;
  photo?: string;
}

interface Props {
  title: string;
  initialStars?: number;
  initialText?: string;
  /** The photo already on the review, when editing one. */
  initialPhotoUrl?: string | null;
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
  onSubmit: (values: ReviewComposerValues) => void;
  /** Present in edit mode: the escape hatch back to the read-only review. */
  onCancel?: () => void;
}

/**
 * The star picker, the words and the optional photo, shared by writing a new
 * review (`DirectoryReviewForm`) and rewriting your own (`DirectoryReviewCard`),
 * so both offer exactly the same tools and the edit form opens already holding
 * what the member wrote the first time.
 */
export function DirectoryReviewComposer({
  title,
  initialStars = 0,
  initialText = "",
  initialPhotoUrl = null,
  submitLabel,
  pendingLabel,
  isPending,
  onSubmit,
  onCancel,
}: Props) {
  const { t } = useTranslation();
  const [stars, setStars] = useState(initialStars);
  const [hoveredStars, setHoveredStars] = useState(0);
  const [text, setText] = useState(initialText);
  // `undefined` = the photo was never touched in this session, so the endpoint
  // is not told about it at all.
  const [photoValue, setPhotoValue] = useState<string | undefined>(undefined);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(
    initialPhotoUrl,
  );

  const shownStars = hoveredStars || stars;
  const canSubmit = stars >= 1 && text.trim().length > 0 && !isPending;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      stars,
      text: text.trim(),
      ...(photoValue === undefined ? {} : { photo: photoValue }),
    });
  };

  return (
    <form className={s.reviewForm} onSubmit={handleSubmit}>
      <div className={s.reviewFormTitle}>{title}</div>
      <div
        className={s.starPick}
        role="radiogroup"
        aria-label={t("marketing:directory.detail.review.starsAria")}
      >
        {STAR_VALUES.map((value) => (
          <button
            key={value}
            type="button"
            className={s.starBtn}
            aria-label={t("marketing:directory.detail.review.starAria", {
              count: value,
            })}
            aria-pressed={value <= stars}
            onMouseEnter={() => setHoveredStars(value)}
            onMouseLeave={() => setHoveredStars(0)}
            onFocus={() => setHoveredStars(value)}
            onBlur={() => setHoveredStars(0)}
            onClick={() => setStars(value)}
          >
            <FiStar className={value <= shownStars ? s.starPicked : undefined} />
          </button>
        ))}
      </div>
      <textarea
        className={s.reviewInput}
        value={text}
        onChange={(event) => setText(event.target.value)}
        aria-label={t("marketing:directory.detail.review.placeholder")}
        placeholder={t("marketing:directory.detail.review.placeholder")}
        rows={3}
        maxLength={2000}
      />
      <DirectoryReviewPhotoField
        previewUrl={photoPreviewUrl}
        isDisabled={isPending}
        onUploaded={(key, previewUrl) => {
          setPhotoValue(key);
          setPhotoPreviewUrl(previewUrl);
        }}
        onRemove={() => {
          setPhotoValue("");
          setPhotoPreviewUrl(null);
        }}
      />
      <div className={s.reviewFormActions}>
        {onCancel && (
          <Button variant="ghost" type="button" onClick={onCancel}>
            {t("marketing:directory.detail.review.cancel")}
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={!canSubmit}>
          {isPending ? pendingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
