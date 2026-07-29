import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ChatSystemEvent } from "./data";
import styles from "./MessagesPage.module.css";

/** Resolves a system event to its bilingual i18n key + params. `actorIsMe`
 *  swaps to the "You …" phrasing; `target`/`value` fill the templated slots. */
function systemLine(event: ChatSystemEvent): {
  key: string;
  params: Record<string, string>;
} {
  const actor = event.actorName;
  const target = event.targetName ?? "";
  const value = event.value ?? "";
  const me = event.actorIsMe === true;
  switch (event.type) {
    case "group_created":
      return me
        ? { key: "messages:system.groupCreatedYou", params: {} }
        : { key: "messages:system.groupCreated", params: { actor } };
    case "member_added":
      return me
        ? { key: "messages:system.memberAddedYou", params: { target } }
        : { key: "messages:system.memberAdded", params: { actor, target } };
    case "member_removed":
      return me
        ? { key: "messages:system.memberRemovedYou", params: { target } }
        : { key: "messages:system.memberRemoved", params: { actor, target } };
    case "member_left":
      return me
        ? { key: "messages:system.memberLeftYou", params: {} }
        : { key: "messages:system.memberLeft", params: { actor } };
    case "group_renamed":
      return me
        ? { key: "messages:system.groupRenamedYou", params: { value } }
        : { key: "messages:system.groupRenamed", params: { actor, value } };
  }
}

/** A centred event pill for a `kind: "system"` message ("You created the group",
 *  "Ana added Bea", "Cy left"). Bilingual; the pill text is its own accessible
 *  label (`role="status"` so a screen reader hears the change once). */
export function SystemMessagePill({ event }: { event: ChatSystemEvent }) {
  const { t } = useTranslation();
  const { key, params } = systemLine(event);
  const text = t(key, params);
  return (
    <div className={styles.systemRow}>
      <span className={styles.systemPill} role="status">
        {text}
      </span>
    </div>
  );
}
