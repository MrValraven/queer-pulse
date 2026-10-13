import type { ImageSlotTint } from "../../shared/components/ui";
import { useStaffStudioRelease } from "./api/useAdminStudio";
import studioStyles from "./AdminStudio.module.css";

const TINT_CLASS: Record<ImageSlotTint, string | undefined> = {
  default: studioStyles.tintDefault,
  coral: studioStyles.tintCoral,
  jade: studioStyles.tintJade,
  plum: studioStyles.tintPlum,
};

/** The release cover on a `studio_release` queue row (the row's title and
 *  artist already come from the moderation resolver). Decorative: the row
 *  button is named by its text. Spans and an <img> only, since it sits
 *  inside the row's <button>, which takes phrasing content. A failed read
 *  stays quiet and shows the tinted frame. */
export function AdminStudioReleaseThumb({ releaseId }: { releaseId: string }) {
  const { data: release } = useStaffStudioRelease(releaseId, {
    isSilent: true,
  });
  const tintClass = TINT_CLASS[release?.tint ?? "plum"];
  return (
    <span
      className={[studioStyles.thumb, tintClass].filter(Boolean).join(" ")}
      aria-hidden
    >
      {release?.coverUrl && (
        <img
          className={studioStyles.thumbImage}
          src={release.coverUrl}
          alt=""
          width={40}
          height={40}
          loading="lazy"
          decoding="async"
        />
      )}
    </span>
  );
}
