// src/features/messages/AttachmentCaption.tsx
import { MentionText } from "../../shared/mentions/MentionText";
import { renderWithLinks, type ChatPlaceLinkInfo } from "./linkify";
import styles from "./MessagesPage.module.css";

/** The optional caption riding alongside an image/gif, document, or resolved
 *  place-link attachment (WhatsApp-style: staged with the media in the
 *  composer, typed once, sent as ONE message; see `GifAttachment.caption`/
 *  `DocumentAttachment.caption`; a place share has no dedicated caption
 *  field, so `PlaceShareBubble` passes it the note portion of `message.text`
 *  instead). Rendered exactly the way an ordinary text bubble renders its
 *  body: the same `MentionText`/`renderWithLinks` treatment, never a plain
 *  string, so an @mention or a URL in a caption behaves exactly like one
 *  anywhere else. `placeLink`, when given, is forwarded to `renderWithLinks`
 *  so a place share's caption swaps its URL for the place-name link exactly
 *  like the in-bubble text used to. Renders nothing at all when there is no
 *  caption to show, never an empty panel.
 *
 *  Its own file (rather than living inside `MessageBubbleBody`, where it
 *  used to) so both `MessageBubbleBody` (photo/document captions) and
 *  `PlaceShareBubble` (a resolved place share's note) can import it without
 *  the two ever importing each other. */
export function AttachmentCaption({
  caption,
  isSent,
  id,
  placeLink,
}: {
  caption: string | undefined;
  isSent: boolean;
  id: string;
  placeLink?: ChatPlaceLinkInfo;
}) {
  if (!caption) return null;
  return (
    <div
      id={id}
      className={[
        styles.attachmentCaption,
        isSent
          ? styles.attachmentCaptionSent
          : styles.attachmentCaptionReceived,
      ].join(" ")}
    >
      <MentionText
        text={caption}
        renderText={(value) => renderWithLinks(value, placeLink)}
      />
    </div>
  );
}
