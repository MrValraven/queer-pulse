import type { ReactNode } from "react";
import { FiEdit2 } from "react-icons/fi";
import { Button, ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioPressKitView } from "./api/studio.adapters";
import { studioPressEditPath } from "./studioPaths";
import styles from "./StudioPressLayout.module.css";

/** Portrait, name, kind (and city once the server sends one), pitch, and the
 *  owner's way into the editor. */
export function StudioPressHero({
  pressKit,
  children,
}: {
  pressKit: StudioPressKitView;
  /** The demo's facts row. */
  children?: ReactNode;
}) {
  const { t } = useTranslation();
  const { artist } = pressKit;
  return (
    <header className={styles.hero}>
      <div className={styles.portrait}>
        <ImageSlot
          src={artist.avatarUrl ?? undefined}
          tint={artist.tint}
          shape="circle"
          width="100%"
          height="100%"
          initials={artist.initials}
          placeholder={`${t("studio:media.portraitLabel")} · ${artist.name}`}
          style={{ position: "absolute", inset: 0 }}
          loading="eager"
        />
      </div>
      <div className={styles.heroText}>
        <p className={styles.eyebrow}>{t("studio:pressKit.eyebrow")}</p>
        <h1 className={styles.name}>{artist.name}</h1>
        <p className={styles.kind}>
          {[t(artist.kindLabelKey), artist.city].filter(Boolean).join(" · ")}
        </p>
        {pressKit.pitch && <p className={styles.pitch}>{pressKit.pitch}</p>}
        {children}
        {pressKit.isOwner && (
          <Button
            variant="ghost"
            size="sm"
            to={studioPressEditPath(artist.id)}
            className={styles.edit}
          >
            <FiEdit2 aria-hidden /> {t("studio:pressKit.editCta")}
          </Button>
        )}
      </div>
    </header>
  );
}
