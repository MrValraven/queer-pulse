import { useId } from "react";
import {
  ImageSlot,
  type AvatarTint,
  type ImageSlotTint,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { isPastableImageUrl } from "../marketing/listBusiness/listBusiness.data";
import styles from "./ImageUrlField.module.css";

interface ImageUrlFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  alt?: string;
  tint?: AvatarTint;
  id?: string;
}

/**
 * Reusable "paste an image URL" field: an `ImageSlot` live preview above a
 * labelled `type="url"` input, with inline validation against
 * `isPastableImageUrl` (the same guard the listing wizard's photo field
 * persists — `https://` only, matching the backend's `@IsImageReference`).
 */
export function ImageUrlField({
  label,
  value,
  onChange,
  alt,
  tint,
  id,
}: ImageUrlFieldProps) {
  const { t } = useTranslation();
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const trimmed = value.trim();
  const invalid = trimmed.length > 0 && !isPastableImageUrl(trimmed);
  // ImageSlot's tint vocabulary omits Avatar's "auth" (an auth-screen-only
  // tint) — fall back to "default" rather than widening ImageSlot's prop type.
  const slotTint: ImageSlotTint | undefined =
    tint === "auth" ? "default" : tint;

  return (
    <div className={styles.field}>
      <ImageSlot
        src={value || undefined}
        alt={alt}
        tint={slotTint}
        height={140}
        placeholder={label}
      />
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        type="url"
        className={styles.input}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={invalid || undefined}
      />
      {invalid && (
        <p className={styles.error} role="alert">
          {t("magazine:deck.editor.imageUrlInvalid")}
        </p>
      )}
    </div>
  );
}
