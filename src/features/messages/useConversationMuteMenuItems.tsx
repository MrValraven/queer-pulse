import { useMemo, type ReactNode } from "react";
import { FiBell, FiBellOff } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToggleMute } from "./api/useConversationPrefs";
import { resolveMuteState } from "./muteUntilLabel";

export interface ConversationMuteMenuItem {
  key: string;
  label: string;
  icon: ReactNode;
  onSelect: () => void;
}

const MUTE_8_HOURS_MS = 8 * 60 * 60 * 1000;
const MUTE_1_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * PRD-349's mute duration items for the open-conversation menu (`Conversation
 * Menu.tsx`), split out purely to keep that component under the 200-line
 * cap. Mirrors `useThreadRowMenuItems`'s row-menu mute items exactly (same
 * durations, same `useToggleMute()` call shape), but returns them as their
 * own small array rather than splicing into one big memo, since this menu
 * builds its item list imperatively (`items.push(...)`) rather than in a
 * single `useMemo`.
 *
 * An unmuted thread gets three flat items (8 hours / 1 week / always); no
 * nested submenu exists in this menu's flat APG list. A muted thread gets ONE
 * item back, but unlike the row menu it is a genuine status LABEL (not also
 * the unmute action) plus a paired action: the caller (`ConversationMenu`)
 * renders `statusLabel` as a disabled, non-interactive row and `items[0]` as
 * the separate "Unmute" button. This menu owns its own item rendering, so it
 * can afford the extra row the row menu's generic `ThreadRowMenu` renderer
 * cannot.
 */
export function useConversationMuteMenuItems(
  conversationId: string,
  muted: boolean,
  mutedUntil: string | null | undefined,
): { items: ConversationMuteMenuItem[]; statusLabel: string | null } {
  const { t } = useTranslation();
  const { mutate: setMuted } = useToggleMute();
  // PRD-349: the SAME expired-mute resolution the thread row's own bell
  // indicator uses (`muteUntilLabel.ts`, shared with `MessagesThreadRow`), so
  // an already-expired timed mute offers Mute choices here too instead of a
  // stale "Unmute" for a mute that already lifted.
  const { isMuted, mutedUntilTime } = resolveMuteState({ muted, mutedUntil });

  const statusLabel = isMuted
    ? mutedUntilTime
      ? t("messages:thread.mutedUntil", { time: mutedUntilTime })
      : t("messages:thread.mutedAlways")
    : null;

  return useMemo(() => {
    if (isMuted) {
      return {
        statusLabel,
        items: [
          {
            key: "unmute",
            label: t("messages:thread.unmuteChat"),
            icon: <FiBellOff aria-hidden />,
            onSelect: () =>
              setMuted({ conversationId, muted: true, mutedUntil: undefined }),
          },
        ],
      };
    }
    return {
      statusLabel: null,
      items: [
        {
          key: "mute-8h",
          label: t("messages:thread.muteFor8Hours"),
          icon: <FiBell aria-hidden />,
          onSelect: () =>
            setMuted({
              conversationId,
              muted: false,
              mutedUntil: new Date(Date.now() + MUTE_8_HOURS_MS).toISOString(),
            }),
        },
        {
          key: "mute-1w",
          label: t("messages:thread.muteFor1Week"),
          icon: <FiBell aria-hidden />,
          onSelect: () =>
            setMuted({
              conversationId,
              muted: false,
              mutedUntil: new Date(Date.now() + MUTE_1_WEEK_MS).toISOString(),
            }),
        },
        {
          key: "mute-always",
          label: t("messages:thread.muteAlways"),
          icon: <FiBell aria-hidden />,
          onSelect: () =>
            setMuted({ conversationId, muted: false, mutedUntil: null }),
        },
      ],
    };
  }, [isMuted, statusLabel, conversationId, setMuted, t]);
}
