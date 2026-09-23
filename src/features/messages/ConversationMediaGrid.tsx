// src/features/messages/ConversationMediaGrid.tsx
import { useMemo } from "react";
import { activeLocale } from "../../shared/i18n/locale";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  entryDateLabel,
  entrySenderName,
  groupEntriesByMonth,
  photoAttachmentOf,
  type ConversationMediaEntry,
} from "./conversationMediaFilters";
import type { ChatMessage } from "./data";
import { isTypedByViewer } from "./viewerSideSender";
import styles from "./ConversationMediaGallery.module.css";

interface ConversationMediaGridProps {
  entries: ConversationMediaEntry[];
  counterpartName: string;
  onOpenPhoto: (message: ChatMessage) => void;
}

/**
 * The Media shelf: square thumbnails under month headings, newest first. Each
 * tile is a button named for who sent the photo and when, so a screen reader
 * hears "Photo from Ana, 3 March" where a sighted member sees the picture.
 */
export function ConversationMediaGrid({
  entries,
  counterpartName,
  onOpenPhoto,
}: ConversationMediaGridProps) {
  const { t } = useTranslation();
  const locale = activeLocale();
  const sections = useMemo(
    () => groupEntriesByMonth(entries, locale),
    [entries, locale],
  );
  const youLabel = t("messages:viewer.you");

  const photoLabel = (entry: ConversationMediaEntry) => {
    const date = entryDateLabel(entry.at, locale);
    if (isTypedByViewer(entry.message)) {
      return date
        ? t("messages:mediaGallery.photoLabelOwn", { date })
        : t("messages:mediaGallery.photoLabelOwnUndated");
    }
    const name = entrySenderName(entry.message, counterpartName, youLabel, t);
    return date
      ? t("messages:mediaGallery.photoLabel", { name, date })
      : t("messages:mediaGallery.photoLabelUndated", { name });
  };

  return (
    <div className={styles.sections}>
      {sections.map((section) => (
        <section key={section.key} className={styles.section}>
          <h4 className={styles.sectionHeading}>
            {section.heading ?? t("messages:mediaGallery.undatedHeading")}
          </h4>
          <ul className={styles.grid}>
            {section.entries.map((entry, index) => {
              const attachment = photoAttachmentOf(entry.message);
              if (!attachment) return null;
              return (
                <li
                  key={
                    entry.message.id ??
                    entry.message.localId ??
                    `${section.key}-${index}-${attachment.url}`
                  }
                >
                  <button
                    type="button"
                    className={styles.tile}
                    aria-label={photoLabel(entry)}
                    onClick={() => onOpenPhoto(entry.message)}
                  >
                    <img
                      className={styles.tileImage}
                      src={attachment.previewUrl || attachment.url}
                      alt=""
                      width={attachment.width || undefined}
                      height={attachment.height || undefined}
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
