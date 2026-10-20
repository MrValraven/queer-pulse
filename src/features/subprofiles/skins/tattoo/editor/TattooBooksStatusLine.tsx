import { useEffect, useRef } from "react";
import { FiArrowRight } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import { Button } from "../../../../../shared/components/ui";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import { CHAPTER_PARAM, PANE_PARAM } from "../../../editorFieldDeepLink.data";
import { skinFieldAnchorId } from "../../../skinFieldAnchor";
import { useSubprofileEditorContext } from "../../../subprofileEditorContext";
import { useSubprofileEditorNav } from "../../../subprofileEditorNav";
import { useEditorFieldJump } from "../../../useEditorFieldJump";
import {
  resolveTattooBooksStatus,
  tattooStatusLabelKey,
} from "../tattooBooksStatus";
import { isTattooBooksStatus } from "../tattooVocab.data";
import styles from "./TattooBooksStatusLine.module.css";

const STATUS_PATH = "tattoo.status";
const BOOKING_CHAPTER_KEY = "booking";

/**
 * The Presence pane's availability for a tattoo artist: the books status sets
 * it, so the field reads that status and offers the Booking chapter where it
 * changes. The status is the draft one, so a switch made in Page blocks shows
 * here before the save.
 *
 * The button swaps the pane and chapter in one history replace, then jumps to
 * the status field once the Page blocks pane is the active one. Jumping in the
 * same tick would switch panes again from the old address and lose the
 * chapter.
 */
export function TattooBooksStatusLine() {
  const { t } = useTranslation();
  const { subprofile, meta, skinBlocks } = useSubprofileEditorContext();
  const { activePane } = useSubprofileEditorNav();
  const [, setSearchParams] = useSearchParams();
  const jumpToField = useEditorFieldJump();
  const isJumpPendingRef = useRef(false);

  const draftStatus = skinBlocks.getValue(STATUS_PATH);
  const status = isTattooBooksStatus(draftStatus)
    ? draftStatus
    : resolveTattooBooksStatus(
        subprofile.skinData,
        meta.metaSnapshot().availability,
      );
  const statusLabel = status
    ? t(tattooStatusLabelKey(status))
    : t("subprofiles:tattoo.presence.notSet");

  useEffect(() => {
    if (!isJumpPendingRef.current || activePane !== "skinBlocks") return;
    isJumpPendingRef.current = false;
    jumpToField({
      pane: "skinBlocks",
      anchors: [skinFieldAnchorId(STATUS_PATH)],
    });
  }, [activePane, jumpToField]);

  // A jump still pending when the line unmounts is dropped, so it never fires
  // on a later pane switch.
  useEffect(
    () => () => {
      isJumpPendingRef.current = false;
    },
    [],
  );

  const openBookingChapter = () => {
    isJumpPendingRef.current = true;
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.set(PANE_PARAM, "skinBlocks");
        next.set(CHAPTER_PARAM, BOOKING_CHAPTER_KEY);
        return next;
      },
      { replace: true },
    );
  };

  return (
    <div className={styles.line}>
      <p className={styles.status}>
        {t("subprofiles:tattoo.presence.setByStatus", { status: statusLabel })}
      </p>
      <Button variant="soft" size="sm" onClick={openBookingChapter}>
        {t("subprofiles:tattoo.presence.change")}
        <FiArrowRight size={16} aria-hidden />
      </Button>
    </div>
  );
}
