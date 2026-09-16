// src/features/messages/ConversationMenuModals.tsx
import { BlockMemberModal } from "../members/BlockMemberModal";
import type { BlockOptions } from "../social/api/social.api";
import { BlockReportMessagesStep } from "./BlockReportMessagesStep";
import { ConversationReportModal } from "./ConversationReportModal";
import { WallpaperModal } from "./WallpaperModal";
import type { ReportableMessageOption } from "./useBlockReportableMessages";
import type { ConversationSafetyTarget } from "./ConversationMenu";

interface ConversationMenuModalsProps {
  conversationId: string;
  name: string;
  isGroup: boolean;
  safety?: ConversationSafetyTarget;
  isPickingWallpaper: boolean;
  onCloseWallpaper: () => void;
  reportingMessagesBeforeBlock: boolean;
  reportableMessages: ReportableMessageOption[];
  onSkipReportMessagesStep: () => void;
  onFinishReportMessagesStep: () => void;
  confirmingBlock: boolean;
  onCancelBlock: () => void;
  onConfirmBlock: (options: BlockOptions) => void;
  isReporting: boolean;
  onCloseReporting: () => void;
}

/**
 * The `ConversationMenu`'s modal stack: the wallpaper picker, the block/
 * report-messages flow, and the member/group report modal. Split out purely
 * to keep that orchestrator under the size cap; no behaviour changed from the
 * inline version, every prop mirrors the state `ConversationMenu` already
 * owned.
 */
export function ConversationMenuModals({
  conversationId,
  name,
  isGroup,
  safety,
  isPickingWallpaper,
  onCloseWallpaper,
  reportingMessagesBeforeBlock,
  reportableMessages,
  onSkipReportMessagesStep,
  onFinishReportMessagesStep,
  confirmingBlock,
  onCancelBlock,
  onConfirmBlock,
  isReporting,
  onCloseReporting,
}: ConversationMenuModalsProps) {
  return (
    <>
      {isPickingWallpaper && (
        <WallpaperModal
          conversationId={conversationId}
          chatName={name}
          onClose={onCloseWallpaper}
        />
      )}
      {safety && reportingMessagesBeforeBlock && (
        <BlockReportMessagesStep
          name={name}
          messages={reportableMessages}
          onSkip={onSkipReportMessagesStep}
          onDone={onFinishReportMessagesStep}
          onClose={onCancelBlock}
        />
      )}
      {safety && confirmingBlock && (
        <BlockMemberModal
          firstName={name}
          onCancel={onCancelBlock}
          onConfirm={onConfirmBlock}
          // PRD-362: this modal is the SECOND step here (the report-messages
          // step above already offered), so its own guidance line about
          // reporting specific messages would be redundant.
          showReportMessagesGuidance={false}
        />
      )}
      {safety && isReporting && (
        <ConversationReportModal
          kind="member"
          subjectId={safety.reportSubjectId ?? safety.slug}
          name={name}
          onClose={onCloseReporting}
        />
      )}
      {isGroup && isReporting && (
        <ConversationReportModal
          kind="group"
          conversationId={conversationId}
          groupTitle={name}
          onClose={onCloseReporting}
        />
      )}
    </>
  );
}
