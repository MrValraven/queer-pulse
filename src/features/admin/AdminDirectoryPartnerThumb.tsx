import { useState } from "react";
import type { DirectoryTint } from "../marketing/api/directoryPartners.api";
import css from "./AdminDirectoryPartners.module.css";

const TINT_CLASS: Record<DirectoryTint, string | undefined> = {
  coral: css.tintCoral,
  jade: css.tintJade,
  plum: css.tintPlum,
};

/**
 * A partner's visual anchor: the card cover, or the business's initials on
 * its own tint when there is no cover or the cover fails to load.
 * Decorative, because the name sits right beside it.
 */
export function AdminDirectoryPartnerThumb({
  coverImage,
  tint,
  initials,
}: {
  coverImage: string | null;
  tint: DirectoryTint;
  initials: string;
}) {
  // Keyed to the URL, so a partner whose cover changes gets a fresh attempt.
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  if (coverImage && coverImage !== failedUrl) {
    return (
      <img
        className={css.thumb}
        src={coverImage}
        alt=""
        aria-hidden="true"
        width={48}
        height={48}
        loading="lazy"
        decoding="async"
        onError={() => setFailedUrl(coverImage)}
      />
    );
  }
  return (
    <span
      className={[css.thumb, TINT_CLASS[tint]].filter(Boolean).join(" ")}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
