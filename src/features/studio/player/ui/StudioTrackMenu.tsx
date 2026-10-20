import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { AnimatePresence, m } from "motion/react";
import { FiMoreHorizontal } from "react-icons/fi";
import { useAuth } from "../../../../app/providers/authContext";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useShareLink } from "../../../../shared/hooks/useClipboard";
import { useOutsideDismiss } from "../../../../shared/hooks/useOutsideDismiss";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { formatTrackTime } from "../../api/studio.adapters";
import { useStudioAccess } from "../../api/useStudioAccess";
import { StudioShareToChatModal } from "../../share/StudioShareToChatModal";
import { StudioTrackReportDialog } from "../../StudioTrackReportDialog";
import { useIsOwnStudioPersona } from "../../useIsOwnStudioPersona";
import { useStudioPlayer, useStudioPlayerClock } from "../studioPlayerContext";
import { trackLinkAt } from "../studioTimestampLink";
import styles from "./StudioTrackMenu.module.css";

export interface StudioTrackMenuTrack {
  id: string;
  title: string;
  /** The router path, `/studio/track?id=<id>`. */
  href: string;
  hasAudio: boolean;
  /** With the member's "Hide explicit tracks" on, the queue items close. */
  isExplicit: boolean;
  /** Studio safety: the persona behind the track. With it the menu offers
   *  "Report track" to anyone who does not own that persona (spec 8). */
  artistId?: string;
  /** "Report track" shows for a published release only; a row that leaves
   *  this out offers no report. */
  isPublished?: boolean;
  /** A withheld track takes no report: its row reads "Unavailable". */
  isWithheld?: boolean;
}

interface MenuItem {
  id: string;
  label: string;
  isBlocked: boolean;
  run: () => void;
}

const absoluteUrl = (path: string) =>
  new URL(path, window.location.origin).toString();

function nextFocusIndex(
  key: string,
  current: number,
  count: number,
): number | null {
  if (key === "ArrowDown") return (current + 1) % count;
  if (key === "ArrowUp") return (current - 1 + count) % count;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  return null;
}

/** The gap the panel keeps from the viewport's left edge. */
const VIEWPORT_EDGE_GAP = 8;

/** The gap between the trigger and the panel (matches the CSS offset). */
const PANEL_GAP = 6;

/** The height the player bar and the phone tab bar take from the bottom of
 *  the viewport. A probe resolves the published custom properties. */
function measureReservedBottom(): number {
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:fixed;visibility:hidden;pointer-events:none;inline-size:0;" +
    "block-size:calc(var(--studio-player-inset, 0px) + max(var(--bottom-inset, 0px), var(--consent-inset, 0px)))";
  document.body.appendChild(probe);
  const height = probe.offsetHeight;
  probe.remove();
  return height;
}

function TrackMenuPanel({
  id,
  track,
  onDone,
  onSendInMessage,
  onReport,
}: {
  id: string;
  track: StudioTrackMenuTrack;
  onDone: () => void;
  onSendInMessage: () => void;
  onReport?: () => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const player = useStudioPlayer();
  const { currentTime } = useStudioPlayerClock();
  const { showToast } = useToast();
  const { share } = useShareLink({
    copied: t("studio:trackMenu.linkCopiedToast"),
    failed: t("studio:detail.copyFailedToast"),
  });
  const noteId = useId();
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  // The panel hangs from the trigger's end edge. Near the left of the
  // screen that would push it off, so it hangs from the start edge there.
  // It opens down; with too little room above the player bar and the phone
  // tab bar it opens up when the trigger has more room above.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    if (rect.width > 0 && rect.left < VIEWPORT_EDGE_GAP)
      panel.dataset.align = "start";
    const trigger = panel.parentElement;
    if (!trigger || rect.height <= 0) return;
    const triggerRect = trigger.getBoundingClientRect();
    const reservedBottom = measureReservedBottom();
    const roomBelow =
      window.innerHeight - reservedBottom - triggerRect.bottom - PANEL_GAP;
    const roomAbove = triggerRect.top - PANEL_GAP;
    if (roomBelow < rect.height && roomAbove > roomBelow)
      panel.dataset.placement = "up";
  }, []);
  useEffect(() => {
    itemRefs.current[0]?.focus({ preventScroll: true });
  }, []);
  // Contract F.4: a hidden explicit track gives the hidden reason first.
  const blockedReasonKey =
    player.playbackSettings.hideExplicit && track.isExplicit
      ? "studio:hiddenTrack.label"
      : !track.hasAudio
        ? "studio:release.processing"
        : null;
  const isQueueBlocked = blockedReasonKey !== null;
  const seconds = Math.floor(currentTime);
  // A preview plays through its private link, which a shared time link
  // would hand on: the timestamped copy waits for the published release.
  const isPreviewPlaying = Boolean(player.currentItem?.previewToken);
  const shouldOfferLinkAt =
    player.isCurrentTrack(track.id) && !isPreviewPlaying;
  const { user } = useAuth();
  // A preview plays through its private link: like the timestamped copy,
  // sending waits for the published release.
  const shouldOfferSend =
    Boolean(user) && !(isPreviewPlaying && player.isCurrentTrack(track.id));

  async function queue(action: "playNext" | "addToQueue") {
    onDone();
    const isQueued = await (action === "playNext"
      ? player.playNext(track.id)
      : player.addToQueue(track.id));
    if (!isQueued) {
      showToast(t("studio:trackMenu.queueFailedToast"), "error");
      return;
    }
    showToast(
      t(
        action === "playNext"
          ? "studio:trackMenu.playingNextToast"
          : "studio:trackMenu.addedToast",
      ),
      "success",
    );
  }

  const items: MenuItem[] = [
    {
      id: "playNext",
      label: t("studio:trackMenu.playNext"),
      isBlocked: isQueueBlocked,
      run: () => void queue("playNext"),
    },
    {
      id: "addToQueue",
      label: t("studio:trackMenu.addToQueue"),
      isBlocked: isQueueBlocked,
      run: () => void queue("addToQueue"),
    },
  ];
  if (shouldOfferSend)
    items.push({
      id: "sendInMessage",
      label: t("studio:trackMenu.sendInMessage"),
      isBlocked: false,
      run: () => {
        onDone();
        onSendInMessage();
      },
    });
  items.push({
    id: "copyLink",
    label: t("studio:trackMenu.copyLink"),
    isBlocked: false,
    run: () => {
      onDone();
      void share(absoluteUrl(track.href));
    },
  });
  if (shouldOfferLinkAt)
    items.push({
      id: "copyLinkAt",
      label: t("studio:trackMenu.copyLinkAt", {
        time: formatTrackTime(seconds) ?? "0:00",
      }),
      isBlocked: false,
      run: () => {
        onDone();
        void share(absoluteUrl(trackLinkAt(track.href, seconds)));
      },
    });
  if (onReport)
    items.push({
      id: "report",
      label: t("studio:report.trackCta"),
      isBlocked: false,
      run: () => {
        onDone();
        onReport();
      },
    });

  function moveFocus(event: KeyboardEvent<HTMLDivElement>) {
    const buttons = itemRefs.current.filter(
      (item): item is HTMLButtonElement => item !== null,
    );
    const current = buttons.indexOf(
      document.activeElement as HTMLButtonElement,
    );
    const next = nextFocusIndex(event.key, current, buttons.length);
    if (next === null) return;
    event.preventDefault();
    buttons[next]?.focus();
  }

  return (
    <m.div
      ref={panelRef}
      id={id}
      role="menu"
      className={styles.menu}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: reducedMotion ? 0 : 0.16, ease: "easeOut" }}
      onKeyDown={moveFocus}
    >
      {items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          role="menuitem"
          ref={(element) => {
            itemRefs.current[index] = element;
          }}
          className={styles.item}
          aria-disabled={item.isBlocked || undefined}
          aria-describedby={item.isBlocked ? noteId : undefined}
          onClick={() => {
            if (!item.isBlocked) item.run();
          }}
        >
          {item.label}
        </button>
      ))}
      {blockedReasonKey && (
        <p id={noteId} className={styles.note}>
          {t(blockedReasonKey)}
        </p>
      )}
    </m.div>
  );
}

/** The "..." on every track row and the track hero (spec 7.4): Play next,
 *  Add to queue, Send in a message, Copy link, Copy link at the current
 *  time for the track that is playing, and Report track (someone else's
 *  published track). Only the open panel reads the clock, so closed
 *  triggers stay still while a track plays. */
export function StudioTrackMenu({
  track,
  className,
}: {
  track: StudioTrackMenuTrack;
  className?: string;
}) {
  const { t } = useTranslation();
  const menuId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [isSendPickerOpen, setIsSendPickerOpen] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const { isPending: isAccessPending } = useStudioAccess();
  const isOwnPersona = useIsOwnStudioPersona(track.artistId);
  const isReportable =
    track.artistId !== undefined &&
    track.isPublished === true &&
    track.isWithheld !== true &&
    !isAccessPending &&
    !isOwnPersona;
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const close = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };
  useOutsideDismiss(isOpen, wrapRef, () => setIsOpen(false), {
    onEscape: close,
  });

  return (
    <div
      ref={wrapRef}
      className={[styles.wrap, className].filter(Boolean).join(" ")}
      onBlur={(event) => {
        const nextFocus = event.relatedTarget;
        if (nextFocus && !event.currentTarget.contains(nextFocus))
          setIsOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={t("studio:trackMenu.trigger", { title: track.title })}
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
      >
        <FiMoreHorizontal aria-hidden />
      </button>
      <AnimatePresence>
        {isOpen && (
          <TrackMenuPanel
            key="menu"
            id={menuId}
            track={track}
            onDone={close}
            onSendInMessage={() => setIsSendPickerOpen(true)}
            onReport={isReportable ? () => setIsReporting(true) : undefined}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isSendPickerOpen && (
          <StudioShareToChatModal
            key="send-in-message"
            target={{ kind: "track", id: track.id, startAtSeconds: null }}
            title={track.title}
            onClose={() => setIsSendPickerOpen(false)}
          />
        )}
      </AnimatePresence>
      <StudioTrackReportDialog
        isOpen={isReporting}
        trackId={track.id}
        trackTitle={track.title}
        onClose={() => setIsReporting(false)}
      />
    </div>
  );
}
