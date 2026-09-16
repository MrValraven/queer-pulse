// src/features/messages/ConversationPanelSurfaces.tsx
import {
  ConversationMediaGallery,
  type ConversationMediaGalleryProps,
} from "./ConversationMediaGallery";
import { ConversationPanelOverlays } from "./ConversationPanelOverlays";
import type { ConversationOverlaysProps } from "./ConversationOverlays";
import type { ConversationGroupModalsProps } from "./ConversationGroupModals";

interface ConversationPanelSurfacesProps {
  /** The message action overlay/context-menu + delete-confirm + report-modal
   *  surfaces (`useMessageActionMenu`'s own state/handlers). */
  overlays: Omit<
    ConversationOverlaysProps,
    "active" | "myUserId" | "groupSeenBy"
  >;
  /** The group-info + "Seen by" sheet (groups only). */
  groupModals: ConversationGroupModalsProps;
  /** "Media, links and docs" (PRD-373). */
  media: ConversationMediaGalleryProps;
}

/** Every surface `ConversationPanel` can pop open at once, on top of its
 *  primary header/log/composer layout: the message action overlay + group
 *  modals (via `ConversationPanelOverlays`, whose own doc explains the same
 *  rationale) and the "Media, links and docs" gallery. Grouped into one
 *  wrapper so the panel itself stays under the line cap. */
export function ConversationPanelSurfaces({
  overlays,
  groupModals,
  media,
}: ConversationPanelSurfacesProps) {
  return (
    <>
      <ConversationPanelOverlays
        overlays={overlays}
        groupModals={groupModals}
      />
      <ConversationMediaGallery {...media} />
    </>
  );
}
