import { FaWhatsapp } from "react-icons/fa6";
import { FiCalendar, FiImage, FiLink } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { GatheringForm } from "../useGatheringForm";
import { useShareKitActions } from "./useShareKitActions";
import styles from "./ShareKitRow.module.css";

/**
 * The share row on the published screen: copy the link, share on WhatsApp,
 * download a story image, add every date to a calendar. Rendered only once
 * the backend has returned the gathering's slug.
 */
export function ShareKitRow({
  form,
  slug,
  occurrenceSlugs,
}: {
  form: GatheringForm;
  /** The first date's slug: the link, WhatsApp and the story image. */
  slug: string;
  /** Every saved date's slug in series order, for the calendar file. */
  occurrenceSlugs: readonly string[];
}) {
  const { t } = useTranslation();
  const actions = useShareKitActions(form, slug, occurrenceSlugs);
  return (
    <div
      role="group"
      aria-label={t("gatherings:create.v2.success.shareLabel")}
      className={styles.share}
    >
      <Button
        variant="ghost-dark"
        size="sm"
        onClick={() => void actions.copyLink()}
      >
        <FiLink aria-hidden /> {t("gatherings:create.v2.success.copyLink")}
      </Button>
      <Button
        variant="ghost-dark"
        size="sm"
        href={actions.whatsAppHref}
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaWhatsapp aria-hidden /> {t("gatherings:create.v2.success.whatsApp")}
        <span className="visuallyHidden">
          {" "}
          {t("gatherings:create.v2.success.opensInNewTab")}
        </span>
      </Button>
      <Button
        variant="ghost-dark"
        size="sm"
        onClick={() => void actions.downloadStoryImage()}
        aria-disabled={actions.isStoryImageBusy}
        aria-busy={actions.isStoryImageBusy}
      >
        <FiImage aria-hidden />{" "}
        {actions.isStoryImageBusy
          ? t("gatherings:create.v2.success.storyImageBusy")
          : t("gatherings:create.v2.success.storyImage")}
      </Button>
      <Button variant="ghost-dark" size="sm" onClick={actions.downloadCalendar}>
        <FiCalendar aria-hidden />{" "}
        {t("gatherings:create.v2.success.addToCalendar")}
      </Button>
    </div>
  );
}
