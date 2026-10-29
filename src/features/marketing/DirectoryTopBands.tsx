import { Collapse } from "../../shared/components/ui/Collapse";
import type { DirectoryPlace } from "./directoryPlaces";
import { DirectoryStaffBand } from "./DirectoryStaffBand";
import { DirectoryVisitorViewBar } from "./DirectoryVisitorViewBar";
import styles from "./DirectoryTopBands.module.css";

/**
 * The plum region above a listing page: the moderator band normally, and the
 * slim visitor-view strip while a moderator or owner previews the page as a
 * visitor. The two swap with a fold, and this
 * wrapper owns the plum stripe behind the floating nav pill so it stays put
 * while either band is mid-animation and its own overflow is clipped.
 */
export function DirectoryTopBands({
  place,
  isDirectoryModerator,
  isVisitorView,
  onEnterVisitorView,
  onExitVisitorView,
}: {
  place: DirectoryPlace;
  isDirectoryModerator: boolean;
  isVisitorView: boolean;
  onEnterVisitorView: () => void;
  onExitVisitorView: () => void;
}) {
  const isPlumGround = isDirectoryModerator || isVisitorView;
  return (
    <div
      className={`${styles.ground} ${isPlumGround ? styles.groundPlum : ""}`}
    >
      <Collapse isOpen={isDirectoryModerator && !isVisitorView}>
        <DirectoryStaffBand
          place={place}
          onEnterVisitorView={onEnterVisitorView}
        />
      </Collapse>
      <Collapse isOpen={isVisitorView}>
        <DirectoryVisitorViewBar onExitVisitorView={onExitVisitorView} />
      </Collapse>
    </div>
  );
}
