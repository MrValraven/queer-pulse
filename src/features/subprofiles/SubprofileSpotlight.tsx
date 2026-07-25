import { FiExternalLink } from "react-icons/fi";
import {
  Button,
  Eyebrow,
  ImageSlot,
  Reveal,
  Tag,
  TagRow,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AccentKey } from "./api/subprofiles.api";
import type { SubprofileItemView } from "./api/subprofiles.adapters";
import { ACCENT_TOKENS } from "./subprofilePresence.data";
import styles from "./SubprofileSpotlight.module.css";

/**
 * The persona's single featured item, shown prominently between the hero and
 * the regular sections. Accent-tinted (matches the hero) so it reads as this
 * persona's spotlight, not just another section card. Renders nothing when
 * there is no featured item — callers gate on `data.featured`.
 */
export function SubprofileSpotlight({
  item,
  accent,
}: {
  item: SubprofileItemView;
  accent: AccentKey;
}) {
  const { t } = useTranslation();
  const { tint, on } = ACCENT_TOKENS[accent];
  const hasImage = Boolean(item.imageUrl);

  return (
    <div className={`wrap ${styles.wrap}`}>
      <Reveal
        as="section"
        className={styles.spotlight}
        style={{
          ["--accent-tint" as string]: tint,
          ["--accent-on" as string]: on,
        }}
        aria-label={t("subprofiles:spotlight.eyebrow")}
      >
        {hasImage && (
          <ImageSlot
            src={item.imageUrl}
            alt={item.title}
            tint="plum"
            radius={0}
            height="100%"
            className={styles.image}
          />
        )}
        <div className={styles.body}>
          <Eyebrow className={styles.eyebrow}>
            {t("subprofiles:spotlight.eyebrow")}
          </Eyebrow>
          <h2 className={styles.title}>{item.title}</h2>
          {item.subtitle && <p className={styles.subtitle}>{item.subtitle}</p>}
          {item.description && (
            <p className={styles.description}>{item.description}</p>
          )}
          {item.tags.length > 0 && (
            <TagRow className={styles.tags}>
              {item.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </TagRow>
          )}
          {item.url && (
            <Button
              variant="primary"
              size="md"
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.cta}
            >
              {t("subprofiles:spotlight.visit")} <FiExternalLink aria-hidden />
            </Button>
          )}
        </div>
      </Reveal>
    </div>
  );
}
