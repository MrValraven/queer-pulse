import { FiDownload, FiLink, FiList } from "react-icons/fi";
import { Tooltip } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { cx } from "../../shared/lib/cx";
import { VouchGraphShareMenu } from "./VouchGraphShareMenu";
import styles from "./vouchGraphShell.module.css";

const DOWNLOAD_FORMATS = ["png", "svg"] as const;

export interface VouchGraphViewActionsProps {
  isListView: boolean;
  /** True while the list or the invite tree is shown: the downloads read
   *  the graph canvas, so they wait until the graph is back. */
  isDownloadDisabled?: boolean;
  onToggleListView: () => void;
  onCopyLink: () => void;
  onDownload: (format: "png" | "svg") => void;
}

/**
 * The top bar's view controls (E1, B9): the list view toggle, Copy view
 * link, and the PNG and SVG downloads. Icon buttons carry their full action
 * as the accessible name; the download buttons also show the format. Under
 * 920px the link and the downloads fold into one overflow menu, so the
 * phone top bar keeps a single row of controls.
 */
export function VouchGraphViewActions({
  isListView,
  isDownloadDisabled = false,
  onToggleListView,
  onCopyLink,
  onDownload,
}: VouchGraphViewActionsProps) {
  const { t } = useTranslation();
  const listViewLabel = t("admin:vouchGraph.actions.listViewCta");
  const copyLinkLabel = t("admin:vouchGraph.actions.copyLinkCta");
  const downloadPngLabel = t("admin:vouchGraph.actions.downloadPngCta");
  const downloadSvgLabel = t("admin:vouchGraph.actions.downloadSvgCta");

  return (
    <div
      role="group"
      aria-label={t("admin:vouchGraph.actions.menuAriaLabel")}
      className={styles.viewActions}
    >
      <Tooltip label={listViewLabel} placement="bottom">
        <button
          type="button"
          className={cx(styles.viewAction, isListView && styles.viewActionOn)}
          aria-pressed={isListView}
          aria-label={listViewLabel}
          onClick={onToggleListView}
        >
          <FiList aria-hidden />
        </button>
      </Tooltip>
      <span className={styles.viewActionsWide}>
        <Tooltip label={copyLinkLabel} placement="bottom">
          <button
            type="button"
            className={styles.viewAction}
            aria-label={copyLinkLabel}
            onClick={onCopyLink}
          >
            <FiLink aria-hidden />
          </button>
        </Tooltip>
        {DOWNLOAD_FORMATS.map((format, formatIndex) => {
          const downloadLabel =
            format === "png" ? downloadPngLabel : downloadSvgLabel;
          const isLast = formatIndex === DOWNLOAD_FORMATS.length - 1;
          return (
            <Tooltip
              key={format}
              label={downloadLabel}
              placement="bottom"
              align={isLast ? "end" : "center"}
            >
              <button
                type="button"
                className={cx(styles.viewAction, styles.viewActionWide)}
                aria-label={downloadLabel}
                disabled={isDownloadDisabled}
                onClick={() => onDownload(format)}
              >
                <FiDownload aria-hidden />
                <span aria-hidden>{format.toUpperCase()}</span>
              </button>
            </Tooltip>
          );
        })}
      </span>
      <span className={styles.viewActionsMenu}>
        <VouchGraphShareMenu
          items={[
            { key: "link", label: copyLinkLabel, onSelect: onCopyLink },
            ...DOWNLOAD_FORMATS.map((format) => ({
              key: format,
              label: format === "png" ? downloadPngLabel : downloadSvgLabel,
              disabled: isDownloadDisabled,
              onSelect: () => onDownload(format),
            })),
          ]}
        />
      </span>
    </div>
  );
}
