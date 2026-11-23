import { authorDisplayName } from "../../shared/api/refs";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { usePostHistory } from "./api/usePostHistory";
import { EditHistoryModal, type PostRevisionEntry } from "./EditHistoryModal";

/** Forum-side wrapper: fetches the forum post's revisions and feeds the shared
 *  presentational `EditHistoryModal`. */
export function ForumEditHistoryModal({
  postId,
  onClose,
}: {
  postId: string | undefined;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { revisions, isLoading, isError, refetch } = usePostHistory(
    postId,
    true,
  );
  const entries: PostRevisionEntry[] = revisions.map((revision) => ({
    id: revision.id,
    authorName: authorDisplayName(revision.author, t),
    createdAt: revision.createdAt,
    previousBody: revision.previousBody,
    previousTitle: revision.previousTitle,
  }));
  return (
    <EditHistoryModal
      revisions={entries}
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
      onClose={onClose}
    />
  );
}
