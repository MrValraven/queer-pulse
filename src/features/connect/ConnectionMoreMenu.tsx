import { useCallback, useRef, useState, type ReactNode } from "react";
import {
  FiFlag,
  FiMessageCircle,
  FiMoreVertical,
  FiSlash,
  FiUserMinus,
  FiVolumeX,
} from "react-icons/fi";
import { ConfirmDialog } from "../../shared/components/ui";
import { useSocial } from "../../app/providers/useSocial";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useConnectionActions } from "./api/useConnectionActions";
import { ConnectionReportModal } from "./ConnectionReportModal";
import { useMenuNavigation } from "./useMenuNavigation";
import styles from "./ConnectionsPage.module.css";

interface MenuItem {
  label: string;
  icon: ReactNode;
  danger?: boolean;
  run: () => void;
}

/**
 * Keyboard-accessible per-connection menu: Message / Mute / Block / Report.
 *
 * "Remove connection" is only offered on an accepted connection (`isAccepted`),
 * which is the only state the backend's `DELETE /connections/:id` applies to.
 * It is deliberately the quiet neighbour of Block: it ends the edge and nothing
 * else, so it keeps the ordinary menu-item styling while Block keeps the danger
 * one.
 *
 * "Message" is only offered when the caller hands over an `onMessage` that
 * actually opens the conversation. It used to call `openConnect(slug)` for
 * every card, which reopened the reach-out form for someone the member was
 * already connected to: writing a note there POSTs /connections and comes back
 * 409 "you're already connected", with no message sent. Cards where messaging
 * isn't the right move (a pending incoming or sent request) simply omit it and
 * keep the safety actions.
 */
export function ConnectionMoreMenu({
  slug,
  id,
  name,
  isAccepted = false,
  onMessage,
}: {
  slug: string;
  /** Backend connection id (live mode); absent in demo. */
  id?: string;
  name: string;
  /** True on an accepted, unblocked connection: shows "Remove connection". */
  isAccepted?: boolean;
  /** Opens the conversation with this member. Omit to hide the Message item. */
  onMessage?: () => void;
}) {
  const { isBlocked, isMuted, toggleMute } = useSocial();
  const { block, unblock, remove } = useConnectionActions();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [isConfirmingBlock, setIsConfirmingBlock] = useState(false);
  const [isConfirmingRemove, setIsConfirmingRemove] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const first = name.split(" ")[0]!;

  const close = useCallback(() => setIsOpen(false), []);
  useMenuNavigation({ isOpen, close, wrapRef, menuRef, triggerRef });

  const blocked = isBlocked(slug);

  // Blocking severs connections server-side, so the confirmation has to mean
  // the server did it. The store rolls the optimistic flip back and raises its
  // own specific error toast on failure, so only the success case is ours.
  function runBlock() {
    unblock({ slug, id }, (didSucceed) => {
      if (didSucceed) {
        showToast(
          t("connect:moreMenu.toastUnblocked", { name: first }),
          "success",
        );
      }
    });
  }

  function confirmBlock() {
    setIsConfirmingBlock(false);
    block({ slug, id }, (didSucceed) => {
      if (didSucceed) {
        showToast(
          t("connect:moreMenu.toastBlocked", { name: first }),
          "success",
        );
      }
    });
    triggerRef.current?.focus();
  }

  // Wait for the server before claiming success, the same contract Block uses:
  // the store rolls its optimistic drop back and raises its own error toast on
  // failure, so only the success case is ours to announce.
  async function confirmRemove() {
    setIsConfirmingRemove(false);
    triggerRef.current?.focus();
    const didSucceed = await remove({ slug, id });
    if (didSucceed) {
      showToast(t("connect:moreMenu.toastRemoved", { name: first }), "success");
    }
  }

  const items: MenuItem[] = [
    ...(onMessage
      ? [
          {
            label: t("connect:moreMenu.message"),
            icon: <FiMessageCircle />,
            run: onMessage,
          },
        ]
      : []),
    {
      label: isMuted(slug)
        ? t("connect:moreMenu.unmute", { name: first })
        : t("connect:moreMenu.mute", { name: first }),
      icon: <FiVolumeX />,
      run: () =>
        showToast(
          toggleMute(slug)
            ? t("connect:moreMenu.toastMuted", { name: first })
            : t("connect:moreMenu.toastUnmuted", { name: first }),
          "success",
        ),
    },
    ...(isAccepted && !blocked
      ? [
          {
            label: t("connect:moreMenu.removeConnection", { name: first }),
            icon: <FiUserMinus />,
            // Ending a connection cannot be undone by this member alone (the
            // other party has to accept a fresh request), so it asks first.
            run: () => setIsConfirmingRemove(true),
          },
        ]
      : []),
    {
      label: blocked
        ? t("connect:moreMenu.unblock", { name: first })
        : t("connect:moreMenu.block", { name: first }),
      icon: <FiSlash />,
      danger: true,
      // Blocking severs the connection server-side and hides the DM thread, so
      // it asks first. Unblocking is reversible and goes straight through.
      run: () => (blocked ? runBlock() : setIsConfirmingBlock(true)),
    },
    {
      label: t("connect:moreMenu.report"),
      icon: <FiFlag />,
      danger: true,
      run: () => setIsReporting(true),
    },
  ];

  return (
    <div className={styles.moreWrap} ref={wrapRef}>
      <button
        type="button"
        ref={triggerRef}
        className={styles.more}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={t("connect:moreMenu.ariaMore", { name })}
        onClick={() => setIsOpen((open) => !open)}
      >
        <FiMoreVertical size={16} aria-hidden />
      </button>
      {isOpen && (
        <div className={styles.menu} role="menu" ref={menuRef}>
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className={[styles.menuItem, item.danger && styles.menuDanger]
                .filter(Boolean)
                .join(" ")}
              onClick={() => {
                setIsOpen(false);
                item.run();
              }}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}
      <ConfirmDialog
        open={isConfirmingBlock}
        tone="destructive"
        title={t("connect:moreMenu.blockConfirm.title", { name })}
        description={t("connect:moreMenu.blockConfirm.body", { name: first })}
        confirmLabel={t("connect:moreMenu.blockConfirm.action")}
        onConfirm={confirmBlock}
        onClose={() => {
          setIsConfirmingBlock(false);
          triggerRef.current?.focus();
        }}
      />
      <ConfirmDialog
        open={isConfirmingRemove}
        title={t("connect:moreMenu.removeConfirm.title", { name })}
        description={t("connect:moreMenu.removeConfirm.body", { name: first })}
        confirmLabel={t("connect:moreMenu.removeConfirm.action")}
        onConfirm={() => void confirmRemove()}
        onClose={() => {
          setIsConfirmingRemove(false);
          triggerRef.current?.focus();
        }}
      />
      {isReporting && (
        <ConnectionReportModal
          subjectId={slug}
          name={name}
          onClose={() => setIsReporting(false)}
        />
      )}
    </div>
  );
}
