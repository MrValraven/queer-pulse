import {
  Button,
  CheckLine,
  DetailRows,
  Modal,
  type DetailRow,
} from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./ComposeFirstPostReview.module.css";

export interface ComposeFirstPostReviewProps {
  /** The draft's title, exactly as it will appear on the thread. */
  title: string;
  /** The chosen category's own name, already translated. */
  categoryName: string;
  /** Who can read it: the community's name, or "Everyone on QueerPulse". */
  audienceName: string;
  /** The byline: the member's name, "QueerPulse Official", or anonymous. */
  postingAs: string;
  /** Content warnings on the post, already translated. Omit when there are none. */
  contentWarningLabels?: readonly string[];
  /** How many photos ride on the opening post. Omit or 0 when there are none. */
  photoCount?: number;
  /** State of the "don't show this again" preference. */
  shouldSkipNextTime: boolean;
  onShouldSkipNextTimeChange: (shouldSkip: boolean) => void;
  /** Back to the composer. Also what the scrim, the X and Escape do. */
  onBack: () => void;
  /** Go ahead and publish in whichever mode the member chose. */
  onConfirm: () => void;
}

/**
 * The one-time look at a member's first ever post, before it goes out.
 *
 * Reassurance rather than a warning: nothing here is wrong, and nothing needs
 * fixing. It exists so the first time is the time you learn where a post lands
 * and whose name is on it, and so it can be turned off in one tick.
 */
export function ComposeFirstPostReview({
  title,
  categoryName,
  audienceName,
  postingAs,
  contentWarningLabels,
  photoCount = 0,
  shouldSkipNextTime,
  onShouldSkipNextTimeChange,
  onBack,
  onConfirm,
}: ComposeFirstPostReviewProps) {
  const { t } = useTranslation();

  const rows: DetailRow[] = [
    {
      label: t("forum:composePage.firstPost.rowTitle"),
      value: title,
    },
    {
      label: t("forum:composePage.firstPost.rowCategory"),
      value: categoryName,
    },
    {
      label: t("forum:composePage.firstPost.rowAudience"),
      value: audienceName,
    },
    {
      label: t("forum:composePage.firstPost.rowPostingAs"),
      value: postingAs,
    },
  ];

  if (contentWarningLabels && contentWarningLabels.length > 0) {
    rows.push({
      label: t("forum:composePage.firstPost.rowWarnings"),
      value: contentWarningLabels.join(", "),
    });
  }
  if (photoCount > 0) {
    rows.push({
      label: t("forum:composePage.firstPost.rowPhotos"),
      value: t("forum:composePage.firstPost.photoCount", {
        count: photoCount,
      }),
    });
  }

  return (
    <Modal
      wide
      title={
        <Translation
          i18nKey="forum:composePage.firstPost.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("forum:composePage.firstPost.sub")}
      onClose={onBack}
      footer={
        <>
          <span className={styles.footSpacer} />
          <Button variant="ghost" onClick={onBack}>
            {t("forum:composePage.overlay.back")}
          </Button>
          <Button onClick={onConfirm}>
            {t("forum:composePage.firstPost.confirm")}
          </Button>
        </>
      }
    >
      <div className={styles.summary}>
        <DetailRows rows={rows} />
      </div>
      <div className={styles.skip}>
        <CheckLine
          checked={shouldSkipNextTime}
          onChange={onShouldSkipNextTimeChange}
          title={t("forum:composePage.firstPost.skip")}
        />
      </div>
    </Modal>
  );
}
