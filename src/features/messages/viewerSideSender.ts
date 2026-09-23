import type { TFunction } from "../../shared/i18n/types";
import type { ChatMessage } from "./data";

/**
 * Whether the member typed this message themselves. `from: "me"` is the
 * viewer's side as `isFromViewerSide` decided it, which on a business thread
 * holds every staff member's reply; the server's `isSentByViewer: false`
 * names a colleague as the writer. Absent (a personal message, an optimistic
 * send) keeps the viewer's-side reading, as the message runs do.
 */
export function isTypedByViewer(
  message: Pick<ChatMessage, "from" | "isSentByViewer">,
): boolean {
  return message.from === "me" && message.isSentByViewer !== false;
}

/**
 * The name a colleague's business reply goes by on a surface that labels one
 * message on its own (the photo viewer, a reply quote, a search hit): the
 * business with the colleague's first name, worded as the attribution line
 * over a business run ("Rui from Café Lisboa"). When attribution withholds
 * the first name, the business alone speaks.
 */
export function colleagueSenderLabel(
  message: Pick<ChatMessage, "senderName" | "senderStaffFirstName">,
  t: TFunction,
): string {
  const business = message.senderName ?? t("messages:mailbox.untitled");
  const firstName = message.senderStaffFirstName;
  return firstName
    ? t("messages:mailbox.attribution.customerLine", {
        name: firstName,
        business,
      })
    : business;
}
