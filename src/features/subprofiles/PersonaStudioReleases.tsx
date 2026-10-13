import { Link } from "react-router-dom";
import { ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReleaseCardView } from "../studio/api/studio.adapters";
import styles from "./PersonaStudioReleases.module.css";

/** Studio releases as cards above the section's hand-entered items. Each
 *  card opens the release in Studio. */
export function PersonaStudioReleases({
  releases,
}: {
  releases: StudioReleaseCardView[];
}) {
  const { t } = useTranslation();
  if (releases.length === 0) return null;
  return (
    <ul
      className={styles.grid}
      aria-label={t("subprofiles:studioReleases.label")}
    >
      {releases.map((release) => (
        <li key={release.id}>
          <Link to={release.href} className={styles.card}>
            <span className={styles.cover}>
              <ImageSlot
                src={release.coverUrl ?? undefined}
                tint={release.tint}
                width="100%"
                height="100%"
                radius={8}
                placeholder=""
              />
            </span>
            <span className={styles.title}>{release.title}</span>
            <span className={styles.meta}>
              {[
                t(`subprofiles:studioReleases.type.${release.type}`),
                release.releaseYear,
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
