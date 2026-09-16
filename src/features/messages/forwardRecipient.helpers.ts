import type { ConnectionView } from "../connect/connections.data";
import type { Conversation } from "./data";

/** A connection, mapped to a pickable forward recipient. Mirrors the
 *  superseded `NewMessageModal`'s own `connectionToRecipient`: only identity
 *  fields matter here, the real history is irrelevant to a forward target.
 *  Extracted into its own file purely to keep `ForwardPickerModal` under the
 *  line cap. */
export function connectionToRecipient(view: ConnectionView): Conversation {
  return {
    id: view.slug,
    slug: view.slug,
    initials: view.initials,
    tint: view.tint,
    avatarUrl: view.photo,
    name: view.name,
    pronouns: view.pron ?? "",
    connectedSince: view.meta.since ?? "",
    time: "",
    preview: "",
    unread: false,
    messages: [],
  };
}
