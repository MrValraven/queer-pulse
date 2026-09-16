// src/features/messages/useAttachmentQueueActions.ts
import { useCallback, type RefObject } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { validateTypeAndSize } from "../members/api/uploadProcessing";
import { validateDocumentTypeAndSize } from "./documentUploadProcessing";
import type {
  ConversationListSetter,
  ItemsByConversation,
} from "./useAttachmentUploadResolution";
import {
  createStagedAttachmentId,
  readImageDimensions,
  resolveUploadErrorMessage,
  type StagedAttachmentItem,
  type StagedDocumentItem,
  type StagedGifItem,
  type StagedImageItem,
} from "./AttachmentStagingTypes";
import type { GifAttachment } from "../../shared/api/gifs";

/**
 * Staging half of `useAttachmentSendQueue`'s mutations: turning a picked
 * file/GIF into a new item (validated, previewed, uploading immediately) and
 * editing its caption. The removal/send half lives in the sibling
 * `useAttachmentQueueLifecycle`, split purely to keep both under the line
 * cap. Owns no state of its own, operates entirely on the refs/setters/queue
 * primitives `useAttachmentSendQueue` already built.
 */
export function useAttachmentQueueActions({
  stagedRef,
  pendingRef,
  setStaged,
  setPending,
  itemConversationRef,
  startImageUpload,
  startDocumentUpload,
}: {
  stagedRef: RefObject<ItemsByConversation>;
  pendingRef: RefObject<ItemsByConversation>;
  setStaged: ConversationListSetter;
  setPending: ConversationListSetter;
  itemConversationRef: RefObject<Map<string, string>>;
  startImageUpload: (id: string, file: File) => void;
  startDocumentUpload: (id: string, file: File) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();

  /** Patches ONE image item's width/height wherever it currently lives, once
   *  `readImageDimensions` resolves. Searches every conversation's staged
   *  AND pending lists rather than trusting the conversation id captured in
   *  `stageImageFiles`'s closure: a fresh DM's placeholder id can migrate to
   *  the server's real id (`migrateConversation`) in the window between
   *  staging and this async read settling, and by then the closed-over id no
   *  longer names any list the item actually lives in. A pure state patch;
   *  the actual attachment sent is rebuilt from the LATEST width/height at
   *  dispatch time (see `withLatestDimensions`), so this never needs to
   *  reach into an already-built `sendAttachment` itself. */
  const patchDimensions = useCallback(
    (id: string, width: number, height: number) => {
      const applyTo = (list: StagedAttachmentItem[]) => {
        const index = list.findIndex((entry) => entry.id === id);
        if (index === -1 || list[index]!.kind !== "image") return null;
        const next = [...list];
        next[index] = {
          ...next[index]!,
          width,
          height,
        } as StagedAttachmentItem;
        return next;
      };
      for (const [conversationId, list] of Object.entries(
        stagedRef.current ?? {},
      )) {
        const next = applyTo(list);
        if (next) {
          setStaged(conversationId, next);
          return;
        }
      }
      for (const [conversationId, list] of Object.entries(
        pendingRef.current ?? {},
      )) {
        const next = applyTo(list);
        if (next) {
          setPending(conversationId, next);
          return;
        }
      }
    },
    [stagedRef, pendingRef, setStaged, setPending],
  );

  const stageImageFiles = useCallback(
    (conversationId: string, files: File[]) => {
      for (const file of files) {
        try {
          validateTypeAndSize(file, "message-image");
        } catch (err) {
          showToast(resolveUploadErrorMessage("image", err, t), "error");
          continue;
        }
        const id = createStagedAttachmentId();
        const previewUrl = URL.createObjectURL(file);
        itemConversationRef.current?.set(id, conversationId);
        const item: StagedImageItem = {
          id,
          kind: "image",
          caption: "",
          previewUrl,
          status: "uploading",
          progress: 0,
          width: 0,
          height: 0,
        };
        setStaged(conversationId, [
          ...(stagedRef.current?.[conversationId] ?? []),
          item,
        ]);
        readImageDimensions(previewUrl)
          .then(({ width, height }) => patchDimensions(id, width, height))
          .catch(() => {
            // A failed decode leaves width/height at 0; the caption screen
            // and the sent attachment already fall back gracefully.
          });
        startImageUpload(id, file);
      }
    },
    [
      showToast,
      t,
      stagedRef,
      setStaged,
      patchDimensions,
      startImageUpload,
      itemConversationRef,
    ],
  );

  const stageDocumentFiles = useCallback(
    (conversationId: string, files: File[]) => {
      for (const file of files) {
        try {
          validateDocumentTypeAndSize(file);
        } catch (err) {
          showToast(resolveUploadErrorMessage("document", err, t), "error");
          continue;
        }
        const id = createStagedAttachmentId();
        itemConversationRef.current?.set(id, conversationId);
        const item: StagedDocumentItem = {
          id,
          kind: "document",
          caption: "",
          // No local blob here: a document's staged preview is never
          // rendered as an image (`AttachmentDocumentPreview` shows its file
          // name/type/size, not `previewUrl`), and `useUploadDocument`'s own
          // upload mints its OWN blob for the real preview. Creating a
          // second one from the same file just to sit unused until it's
          // revoked would be a blob for nothing.
          previewUrl: "",
          status: "uploading",
          progress: 0,
          fileName: file.name,
          byteSize: file.size,
          contentType: file.type,
        };
        setStaged(conversationId, [
          ...(stagedRef.current?.[conversationId] ?? []),
          item,
        ]);
        startDocumentUpload(id, file);
      }
    },
    [
      showToast,
      t,
      stagedRef,
      setStaged,
      startDocumentUpload,
      itemConversationRef,
    ],
  );

  const stageGif = useCallback(
    (conversationId: string, attachment: GifAttachment) => {
      const id = createStagedAttachmentId();
      const item: StagedGifItem = {
        id,
        kind: "gif",
        caption: "",
        previewUrl: attachment.previewUrl,
        status: "uploaded",
        progress: 100,
        width: attachment.width,
        height: attachment.height,
        sendAttachment: attachment,
        localAttachment: attachment,
      };
      setStaged(conversationId, [
        ...(stagedRef.current?.[conversationId] ?? []),
        item,
      ]);
    },
    [stagedRef, setStaged],
  );

  const setCaption = useCallback(
    (conversationId: string, id: string, caption: string) => {
      const list = stagedRef.current?.[conversationId];
      if (!list) return;
      setStaged(
        conversationId,
        list.map((item) => (item.id === id ? { ...item, caption } : item)),
      );
    },
    [stagedRef, setStaged],
  );

  return { stageImageFiles, stageDocumentFiles, stageGif, setCaption };
}
