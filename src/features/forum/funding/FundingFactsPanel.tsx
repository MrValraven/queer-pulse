import { useState } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { Thread } from "../forum.data";
import type { ForumFundingView } from "./funding.types";
import { canEditFundingDetails } from "./fundingPermissions";
import { FundingAskFacts } from "./FundingAskFacts";
import { FundingCallFacts } from "./FundingCallFacts";
import { FundingEditModal } from "./FundingEditModal";

export interface FundingFactsPanelProps {
  thread: Thread;
  bookmarked: boolean;
  onToggleBookmark: () => void;
}

/** The structured facts above an open call's or a fundraiser's opening post,
 *  and the editor for them. Nothing for any other thread. */
export function FundingFactsPanel({
  thread,
  bookmarked,
  onToggleBookmark,
}: FundingFactsPanelProps) {
  const { demoMode } = useDemoMode();
  const [isEditing, setIsEditing] = useState(false);
  // DEMO: no server to refetch from, so a saved edit is shown from here, for
  // this thread only.
  const [savedInDemo, setSavedInDemo] = useState<{
    threadKey: string;
    funding: ForumFundingView;
  } | null>(null);
  const threadKey = String(thread.slug ?? thread.id);
  const demoFunding =
    demoMode && savedInDemo?.threadKey === threadKey
      ? savedInDemo.funding
      : null;
  const funding = demoFunding ?? thread.funding ?? null;
  if (!funding) return null;
  const onEditDetails = canEditFundingDetails(thread, demoMode)
    ? () => setIsEditing(true)
    : undefined;
  return (
    <>
      {thread.kind === "call" && (
        <FundingCallFacts
          thread={thread}
          funding={funding}
          bookmarked={bookmarked}
          onToggleBookmark={onToggleBookmark}
          onEditDetails={onEditDetails}
        />
      )}
      {thread.kind === "ask" && (
        <FundingAskFacts
          thread={thread}
          funding={funding}
          onEditDetails={onEditDetails}
        />
      )}
      {isEditing && (
        <FundingEditModal
          thread={thread}
          funding={funding}
          onClose={() => setIsEditing(false)}
          onSaved={(saved) => setSavedInDemo({ threadKey, funding: saved })}
        />
      )}
    </>
  );
}
