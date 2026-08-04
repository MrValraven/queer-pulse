import { useRoadmapModals } from "../state/useRoadmapModals";
import { SlipReasonModal } from "./SlipReasonModal";
import { SafetyGateModal } from "./SafetyGateModal";
import { MergeIdeaModal } from "./MergeIdeaModal";
import { DeclineModal } from "./DeclineModal";
import { NotifyVotersModal } from "./NotifyVotersModal";
import { DigestModal } from "./DigestModal";
import { AuditLogModal } from "./AuditLogModal";
import { ShortcutsModal } from "./ShortcutsModal";

/**
 * The 8 roadmap admin modals (slip reason / safety gate / merge idea /
 * decline / notify voters / monthly digest / audit log / keyboard
 * shortcuts), addressed by `useRoadmapModals()`'s `RoadmapModalName`.
 * `AdminRoadmapPage` mounts this once, unconditionally — every opener just
 * calls `modals.open("slip", { itemId, from, to })` etc. without knowing
 * which modal is currently active. Only the matching one ever renders; each
 * modal is itself only mounted while open (so `AdminModal`'s
 * `useScrollLock()` runs unconditionally per repo convention), and each
 * double-checks its own payload before rendering — defensive against a
 * caller opening the wrong modal name for the data it has.
 */
export function RoadmapModalsHost() {
  const { modal } = useRoadmapModals();

  switch (modal) {
    case "slip":
      return <SlipReasonModal />;
    case "safety":
      return <SafetyGateModal />;
    case "merge":
      return <MergeIdeaModal />;
    case "decline":
      return <DeclineModal />;
    case "notify":
      return <NotifyVotersModal />;
    case "digest":
      return <DigestModal />;
    case "audit":
      return <AuditLogModal />;
    case "shortcuts":
      return <ShortcutsModal />;
    case null:
      return null;
  }
}
