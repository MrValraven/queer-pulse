import { useState, type ReactNode } from "react";
import { AnimatePresence } from "motion/react";
import type { StudioMenuItem } from "../../kit/StudioMenu";
import { StudioShareToChatModal } from "../../share/StudioShareToChatModal";
import { StudioAddToPlaylistPicker } from "../../StudioAddToPlaylistPicker";
import { StudioTrackReportDialog } from "../../StudioTrackReportDialog";
import { StudioTrackMenuItemsSource } from "./StudioTrackMenuItemsSource";
import type { StudioTrackMenuTrack } from "./studioTrackMenuTrack";

/** The track menu's items and the dialogs they open (Send in a message, Add
 *  to playlist, Report track). Shared by the "..." trigger menu and the
 *  context menu; the dialogs outlive the menu that opened them. The items
 *  are built only while `isOpen`; `items` keeps the last set so the menu
 *  can animate out, and is empty until the first open. */
export function useStudioTrackMenu(
  track: StudioTrackMenuTrack,
  {
    isOpen,
    onRequestAddToPlaylist,
  }: { isOpen: boolean; onRequestAddToPlaylist?: () => void },
): { items: StudioMenuItem[]; dialogs: ReactNode } {
  const [items, setItems] = useState<StudioMenuItem[]>([]);
  const [isSendPickerOpen, setIsSendPickerOpen] = useState(false);
  const [isAddingToPlaylist, setIsAddingToPlaylist] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  const dialogs = (
    <>
      {isOpen && (
        <StudioTrackMenuItemsSource
          track={track}
          onItems={setItems}
          onSendInMessage={() => setIsSendPickerOpen(true)}
          onAddToPlaylist={() => {
            if (onRequestAddToPlaylist) onRequestAddToPlaylist();
            else setIsAddingToPlaylist(true);
          }}
          onReport={() => setIsReporting(true)}
        />
      )}
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
      <AnimatePresence>
        {isAddingToPlaylist && (
          <StudioAddToPlaylistPicker
            key="add-to-playlist"
            trackIds={[track.id]}
            subjectTitle={track.title}
            likeSubject={{
              trackId: track.id,
              title: track.title,
              href: track.href,
              artistName: track.artistName ?? "",
            }}
            onClose={() => setIsAddingToPlaylist(false)}
          />
        )}
      </AnimatePresence>
      <StudioTrackReportDialog
        isOpen={isReporting}
        trackId={track.id}
        trackTitle={track.title}
        onClose={() => setIsReporting(false)}
      />
    </>
  );
  return { items, dialogs };
}
