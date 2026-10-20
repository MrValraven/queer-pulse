import { AnimatePresence } from "motion/react";
import { ReportListingModal } from "../economy/ReportListingModal";

/** "Report track" (spec 8): the shared report modal about one Studio
 *  track. Picking copyright inside it routes to the claim form. */
export function StudioTrackReportDialog({
  isOpen,
  trackId,
  trackTitle,
  onClose,
}: {
  isOpen: boolean;
  trackId: string;
  trackTitle: string;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <ReportListingModal
          key="report-track"
          subjectType="studio_track"
          subjectId={trackId}
          subjectName={trackTitle}
          onClose={onClose}
        />
      )}
    </AnimatePresence>
  );
}
