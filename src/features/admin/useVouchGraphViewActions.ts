import { useCallback, type RefObject } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { VouchGraphUrlView } from "./vouchGraph.types";
import { buildTrustNetworkViewUrl } from "./vouchGraphViewUrl";
import {
  copyVouchViewLink,
  downloadVouchSnapshot,
  snapshotFileBaseName,
} from "./vouchSnapshotExport";

export interface VouchGraphViewActions {
  copyLink: () => void;
  download: (format: "png" | "svg") => void;
}

/**
 * B9: "Copy view link" and the PNG and SVG downloads, each with its toast.
 * The link is built from `urlView`, the view on screen, so it carries a
 * change the debounced URL sync has yet to write.
 * The download reads the canvas SVG, so it does nothing while the list or
 * the invite tree is on screen (the top bar disables the buttons then).
 */
export function useVouchGraphViewActions({
  svgRef,
  urlView,
  isDownloadDisabled,
}: {
  svgRef: RefObject<SVGSVGElement | null>;
  urlView: VouchGraphUrlView;
  isDownloadDisabled: boolean;
}): VouchGraphViewActions {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const copyLink = useCallback(() => {
    const viewUrl = buildTrustNetworkViewUrl(urlView);
    void copyVouchViewLink(viewUrl).then((isCopied) => {
      if (isCopied) {
        showToast(t("admin:vouchGraph.actions.copyLinkToast"), "success");
      } else {
        showToast(t("admin:vouchGraph.actions.copyLinkFailedToast"), "error");
      }
    });
  }, [showToast, t, urlView]);

  const download = useCallback(
    (format: "png" | "svg") => {
      if (isDownloadDisabled) return;
      const svg = svgRef.current;
      if (!svg) {
        showToast(t("admin:vouchGraph.actions.exportFailedToast"), "error");
        return;
      }
      const fileBaseName = snapshotFileBaseName(urlView.focus, new Date());
      downloadVouchSnapshot(svg, format, fileBaseName).catch(() => {
        showToast(t("admin:vouchGraph.actions.exportFailedToast"), "error");
      });
    },
    [urlView.focus, isDownloadDisabled, showToast, t, svgRef],
  );

  return { copyLink, download };
}
