import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioPressKitView } from "./api/studio.adapters";
import { StudioExternalLinkList } from "./StudioExternalLinkList";
import { PressSectionHead } from "./StudioPressSections";
import styles from "./StudioPressSections.module.css";

/** Every persona link, then the support links, each opening in a new tab. */
export function PressLinks({ pressKit }: { pressKit: StudioPressKitView }) {
  const { t } = useTranslation();
  const name = pressKit.artist.name;
  if (pressKit.socialLinks.length + pressKit.supportLinks.length === 0)
    return null;
  return (
    <section className={styles.section}>
      <PressSectionHead titleKey="studio:pressKit.section.links" />
      <div className={styles.linkColumns}>
        {pressKit.socialLinks.length > 0 && (
          <StudioExternalLinkList
            links={pressKit.socialLinks}
            label={t("studio:pressKit.linksLabel", { name })}
          />
        )}
        {pressKit.supportLinks.length > 0 && (
          <StudioExternalLinkList
            links={pressKit.supportLinks}
            label={t("studio:support.listLabel", { name })}
          />
        )}
      </div>
    </section>
  );
}
