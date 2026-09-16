// src/features/messages/ConversationComposerDock.tsx
import {
  ComposerDockContent,
  type ComposerDockContentProps,
} from "./ComposerDockContent";

/**
 * A thin pass-through to `ComposerDockContent` (composer, jump pill,
 * attachment staging via `useAttachmentStaging`), kept as its own
 * component/file so `ConversationPanel` has a stable name to render and a
 * future change here never has to touch every call site. The attachment
 * queue itself is owned once, at the Messages page level, by
 * `AttachmentQueueProvider` (see `AttachmentQueueContext.tsx` and
 * `MessagesPage.tsx`), so this component has no provider logic of its own to
 * decide.
 */
export function ConversationComposerDock(props: ComposerDockContentProps) {
  return <ComposerDockContent {...props} />;
}
