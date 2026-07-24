import { EditHistoryModal } from "../forum/EditHistoryModal";
import {
  useCommunityPostHistory,
  useCommunityReplyHistory,
} from "./api/useCommunityPostHistory";

/** History target: the OP post (`replyId` undefined) or a specific reply. */
export function CommunityHistoryModal({
  slug,
  postId,
  replyId,
  onClose,
}: {
  slug: string;
  postId: string | undefined;
  replyId: string | undefined;
  onClose: () => void;
}) {
  const postHistory = useCommunityPostHistory(slug, postId, !replyId);
  const replyHistory = useCommunityReplyHistory(slug, postId, replyId, !!replyId);
  const { revisions, isLoading } = replyId ? replyHistory : postHistory;
  return (
    <EditHistoryModal revisions={revisions} isLoading={isLoading} onClose={onClose} />
  );
}
