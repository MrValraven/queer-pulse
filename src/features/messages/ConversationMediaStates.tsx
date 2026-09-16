// src/features/messages/ConversationMediaStates.tsx
import { FiFile, FiImage, FiLink } from "react-icons/fi";
import {
  Button,
  EmptyState,
  SkeletonAvatar,
  SkeletonLine,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ConversationMediaKind } from "./api/conversationMedia.api";
import styles from "./ConversationMediaGallery.module.css";

const SKELETON_TILE_COUNT = 9;
const SKELETON_ROW_COUNT = 4;

/** Placeholder shapes matching the shelf about to load: square tiles for
 *  Media, icon-and-two-lines rows for Links and Docs. */
export function ConversationMediaSkeleton({
  kind,
}: {
  kind: ConversationMediaKind;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.skeleton} aria-busy="true">
      <span className="visuallyHidden" role="status">
        {t("messages:mediaGallery.loading")}
      </span>
      {kind === "media" ? (
        <div className={styles.grid} aria-hidden="true">
          {Array.from({ length: SKELETON_TILE_COUNT }, (_, index) => (
            <div key={index} className={styles.skeletonTile}>
              <SkeletonLine width="100%" height="100%" />
            </div>
          ))}
        </div>
      ) : (
        <div aria-hidden="true">
          {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
            <div key={index} className={styles.skeletonRow}>
              <SkeletonAvatar size={40} />
              <div className={styles.rowText}>
                <SkeletonLine width="70%" height={14} />
                <SkeletonLine width="40%" height={12} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ConversationMediaError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <div className={styles.errorState}>
      <p className={styles.statusText} role="alert">
        {t("messages:mediaGallery.error")}
      </p>
      <Button variant="ghost" size="sm" onClick={onRetry}>
        {t("common:error.retry")}
      </Button>
    </div>
  );
}

const EMPTY_ICON: Record<ConversationMediaKind, typeof FiImage> = {
  media: FiImage,
  links: FiLink,
  documents: FiFile,
};

export function ConversationMediaEmpty({
  kind,
}: {
  kind: ConversationMediaKind;
}) {
  const { t } = useTranslation();
  const Icon = EMPTY_ICON[kind];
  const copy = {
    media: {
      title: t("messages:mediaGallery.emptyMediaTitle"),
      description: t("messages:mediaGallery.emptyMediaBody"),
    },
    links: {
      title: t("messages:mediaGallery.emptyLinksTitle"),
      description: t("messages:mediaGallery.emptyLinksBody"),
    },
    documents: {
      title: t("messages:mediaGallery.emptyDocumentsTitle"),
      description: t("messages:mediaGallery.emptyDocumentsBody"),
    },
  }[kind];
  return (
    <EmptyState
      compact
      icon={<Icon aria-hidden="true" />}
      title={copy.title}
      description={copy.description}
    />
  );
}
