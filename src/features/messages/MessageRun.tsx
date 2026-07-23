// src/features/messages/MessageRun.tsx
import { Avatar } from "../../shared/components/ui";
import type { AvatarTint } from "../../shared/components/ui/Avatar";
import { isEmojiOnly, type MessageRun } from "./messageRuns";
import styles from "./MessagesPage.module.css";

/** Avatar identity for one side of the conversation. */
export interface RunParticipant {
  initials: string;
  tint: AvatarTint;
  /** Optional profile photo; Avatar falls back to initials when absent. */
  src?: string;
}

/** Renders one sender run: a single avatar plus a vertical stack of bubbles. */
export function MessageRunView({
  run,
  counterpart,
  self,
}: {
  run: MessageRun;
  counterpart: RunParticipant;
  self: RunParticipant;
}) {
  const isSent = run.from === "me";
  const who = isSent ? self : counterpart;
  const lastIndex = run.items.length - 1;
  const runTime = run.items[lastIndex]?.time;

  return (
    <div className={[styles.run, isSent && styles.runSent].filter(Boolean).join(" ")}>
      <div className={styles.runAvatar}>
        <Avatar initials={who.initials} tint={who.tint} src={who.src} size={28} />
      </div>
      <div className={styles.runBubbles}>
        {run.items.map((message, index) => {
          const isLast = index === lastIndex;
          const key = message.id ?? `pos-${index}`;
          if (isEmojiOnly(message.text)) {
            return (
              <div key={key} className={styles.emojiOnly}>
                {message.text}
              </div>
            );
          }
          return (
            <div
              key={key}
              className={[
                styles.bubble,
                isSent ? styles.sent : styles.received,
                isLast && (isSent ? styles.tailSent : styles.tailReceived),
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {message.text}
            </div>
          );
        })}
        {runTime && <div className={styles.bubbleTime}>{runTime}</div>}
      </div>
    </div>
  );
}
