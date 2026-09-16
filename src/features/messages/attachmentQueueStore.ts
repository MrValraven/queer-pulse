// src/features/messages/attachmentQueueStore.ts
import { createContext, useContext, useEffect, useRef } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  useAttachmentSendQueue,
  type AttachmentSendQueue,
} from "./useAttachmentSendQueue";
import { subscribeAttachmentConversationMigration } from "./attachmentConversationMigration";
import type { StagedAttachmentItem } from "./AttachmentStagingTypes";
import type { TFunction } from "../../shared/i18n/types";
import type { ExplicitSendOptions } from "./useMessageSendActions";
import type { GifAttachment } from "../../shared/api/gifs";
import type { DocumentAttachment } from "../../shared/api/documentAttachment";

export const AttachmentQueueContext = createContext<AttachmentSendQueue | null>(
  null,
);

export interface AttachmentQueueSendFunctions {
  onSendGif?: (
    attachment: GifAttachment,
    options?: ExplicitSendOptions,
  ) => void;
  onSendImage?: (
    attachment: GifAttachment,
    localAttachment?: GifAttachment,
    options?: ExplicitSendOptions,
  ) => void;
  onSendDocument?: (
    attachment: DocumentAttachment,
    localAttachment?: DocumentAttachment,
    options?: ExplicitSendOptions,
  ) => void;
}

/** Copy for an item abandoned because the queue's OWN owner went away (see
 *  `useAttachmentQueueStore`'s teardown effect below) while its upload was
 *  still running. */
function notSentToastMessage(item: StagedAttachmentItem, t: TFunction): string {
  if (item.kind === "document") {
    return t("messages:attachments.notSentDocument", {
      fileName: item.fileName,
    });
  }
  return item.kind === "gif"
    ? t("messages:attachments.notSentGif")
    : t("messages:attachments.notSentPhoto");
}

/**
 * Owns EVERY conversation's staged-and-pending attachments plus the shared
 * upload queue (`useAttachmentSendQueue`, DES-198/DES-199), for as long as
 * THIS hook's caller stays mounted. Called once, at the Messages page level
 * (see `AttachmentQueueProvider` in `AttachmentQueueContext.tsx` and
 * `MessagesPage.tsx`), so the store survives a mobile back-to-list, the
 * active thread going null, and the desktop/mobile breakpoint flipping: an
 * attachment already committed to send while its upload was still running
 * keeps going and lands in its own thread no matter what the member does
 * with the rest of the UI meanwhile. `useAttachmentStaging` reads this per
 * conversation, deferring all of this state's ownership to here.
 *
 * Reports an abandoned upload as "not sent" only on a real unmount of THIS
 * store (the teardown effect below): `t` and `showToast` are read from a ref
 * kept current by a plain effect, so the teardown effect's own dependency
 * array names only the queue's stable `abandonEverything` (see
 * `useAttachmentQueueTeardown`), and its setup/cleanup pair fires exactly
 * once, on mount and on unmount. That keeps a mid-session i18n namespace
 * load, which can give `t` a new identity, from re-triggering it.
 */
export function useAttachmentQueueStore(
  sendFunctions: AttachmentQueueSendFunctions,
): AttachmentSendQueue {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const queue = useAttachmentSendQueue(sendFunctions);

  const latestRef = useRef({ t, showToast });
  useEffect(() => {
    latestRef.current = { t, showToast };
  });

  // A brand-new DM swaps its placeholder id for the server's real id; items
  // staged in that window follow it (see `attachmentConversationMigration`).
  const { migrateConversation } = queue;
  useEffect(
    () => subscribeAttachmentConversationMigration(migrateConversation),
    [migrateConversation],
  );

  const { abandonEverything } = queue;
  useEffect(() => {
    return () => {
      const abandonedItems = abandonEverything();
      for (const item of abandonedItems) {
        latestRef.current.showToast(
          notSentToastMessage(item, latestRef.current.t),
          "error",
        );
      }
    };
  }, [abandonEverything]);

  return queue;
}

/** The ambient store from the nearest `AttachmentQueueProvider`, or `null`
 *  when none is mounted above the caller. */
export function useAttachmentQueue(): AttachmentSendQueue | null {
  return useContext(AttachmentQueueContext);
}

/**
 * Fails loud, in development only, when `queue` is `null`: a missing
 * `AttachmentQueueProvider` would otherwise degrade every staged attachment
 * to a silent no-op, and `AttachmentQueueProvider` is meant to be mounted
 * exactly once, at the Messages page level (see `MessagesPage.tsx`), above
 * every `useAttachmentStaging` caller. `import.meta.env.DEV` inlines to
 * `false` in a production build, so this never runs in a deployed artifact.
 */
export function assertAttachmentQueueMounted(
  queue: AttachmentSendQueue | null,
): void {
  if (queue === null && import.meta.env.DEV) {
    throw new Error(
      "useAttachmentStaging found no AttachmentQueueProvider above it. " +
        "Mount AttachmentQueueProvider once at the Messages page level " +
        "(see MessagesPage.tsx) above every ComposerDockContent.",
    );
  }
}
