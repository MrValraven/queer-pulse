import type { ReactNode } from "react";
import { Collapse, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReleaseView } from "./api/studio.adapters";
import type { StudioLoadState } from "./api/studioLoadState";
import { useStudioRelease } from "./api/useStudioRelease";
import { StudioLoadError } from "./StudioLoadStates";
import {
  StudioPreviewLinkPanel,
  canShowPreviewLink,
} from "./StudioPreviewLinkPanel";
import { StudioLine } from "./StudioSkeletons";
import styles from "./StudioPreviewLink.module.css";

/** Mirrors the panel's off state: heading, two body lines, the button. */
function PreviewLinkSkeleton() {
  const { t } = useTranslation();
  return (
    <div
      className={styles.skeleton}
      role="status"
      aria-label={t("studio:states.loadingLabel")}
    >
      <StudioLine width="45%" height={18} />
      <StudioLine width="95%" height={13} />
      <StudioLine width="70%" height={13} />
      <StudioLine width="40%" height={36} />
    </div>
  );
}

/** What the dialog shows once the read has settled, one way or the other. */
function PreviewLinkDialogBody({
  release,
  loadState,
}: {
  release: StudioReleaseView | null;
  loadState: StudioLoadState;
}): ReactNode {
  const { t } = useTranslation();
  if (release && canShowPreviewLink(release))
    return <StudioPreviewLinkPanel release={release} isHeadingHidden />;
  if (loadState.isError) return <StudioLoadError loadState={loadState} />;
  // A release that went live, was withdrawn (410) or is gone (404) has no
  // link to offer: one plain line, so the dialog never waits forever.
  let lineKey = "studio:states.notFoundTitle";
  if (release) lineKey = "studio:errors.previewNotAvailable";
  else if (loadState.isWithdrawn) lineKey = "studio:errors.releaseWithdrawn";
  return <p className={styles.unavailable}>{t(lineKey)}</p>;
}

/** The preview link panel for one release, opened from the owner's release
 *  row. Mount inside AnimatePresence so the shared Modal plays its exit. */
export function StudioPreviewLinkDialog({
  releaseId,
  releaseTitle,
  onClose,
}: {
  releaseId: string;
  releaseTitle: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { release, loadState } = useStudioRelease(releaseId, {
    shouldUseDemoDefault: false,
  });
  const isLoading =
    release === null &&
    !loadState.isError &&
    !loadState.isNotFound &&
    !loadState.isWithdrawn;
  return (
    <Modal
      title={t("studio:previewLink.dialogTitle", { title: releaseTitle })}
      onClose={onClose}
    >
      <Collapse isOpen={isLoading}>
        <PreviewLinkSkeleton />
      </Collapse>
      <Collapse isOpen={!isLoading}>
        <PreviewLinkDialogBody release={release} loadState={loadState} />
      </Collapse>
    </Modal>
  );
}
