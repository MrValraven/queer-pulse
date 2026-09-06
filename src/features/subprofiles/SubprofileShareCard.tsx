import { FiCopy, FiDownload } from "react-icons/fi";
import { Button, Modal } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { downloadVCard } from "./vcard";
import { personaAddressName } from "./subprofile-kinds";
import { SubprofileQR } from "./SubprofileQR";
import type { PublicSubprofileView } from "./api/subprofiles.adapters";
import styles from "./SubprofileShareCard.module.css";

/**
 * Share-card modal: a scannable QR to the persona's public page, a one-click
 * `.vcf` contact-card download, and a copy-link fallback. Everything a person
 * would want to hand someone in person or drop in a bio, in one place. Fully
 * client-side (no API round-trip), so it works identically in demo and live.
 * Self-contained: only mounted while `open`, so `Modal` owns the scroll-lock.
 *
 * `shareUrl` is a REQUIRED prop rather than something derived here from `view`.
 * All three affordances hand out the same address, and a QR code is the one
 * that survives being printed and scanned by a stranger weeks later, so the
 * address is resolved once by the caller (`personaOwnerAddress`) and this
 * modal cannot be mounted for a persona that has none.
 */
export function SubprofileShareCard({
  view,
  shareUrl,
  onClose,
}: {
  view: PublicSubprofileView;
  /** The persona's resolved absolute public URL. */
  shareUrl: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  // Both strings below read "{name}'s page", so they take the ADDRESS name
  // (the owner's first name for a persona still called "Poet") rather than the
  // composed "Owner Name | Poet" title, which would not survive a possessive.
  const addressName = personaAddressName({
    displayName: view.displayName,
    kind: view.kind,
    ownerName: view.ownerName,
  });

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast(t("subprofiles:share.copied"), "success");
    } catch {
      // Denied permission, a non-secure context or an embedded webview: the
      // button did nothing and used to say nothing either, so it read as
      // broken. Point at the link text on the card, which is selectable.
      showToast(t("subprofiles:share.copyFailed"), "error");
    }
  }

  return (
    <Modal
      title={t("subprofiles:shareCard.title")}
      sub={t("subprofiles:shareCard.subtitle", { name: addressName })}
      onClose={onClose}
      className={styles.modal}
    >
      <div className={styles.body}>
        <SubprofileQR
          url={shareUrl}
          ariaLabel={t("subprofiles:shareCard.qrAria", {
            name: addressName,
          })}
        />

        <Button
          variant="primary"
          className={styles.downloadButton}
          onClick={() => downloadVCard(view, shareUrl)}
        >
          <FiDownload aria-hidden /> {t("subprofiles:shareCard.download")}
        </Button>

        <div className={styles.linkRow}>
          <span className={styles.linkText}>{shareUrl}</span>
          <Button
            variant="ghost"
            size="md"
            onClick={() => void handleCopyLink()}
          >
            <FiCopy aria-hidden /> {t("subprofiles:shareCard.copyLink")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// Default export so `MySubprofilesPage` can `lazy(() => import("./SubprofileShareCard"))`,
// splitting this component's `qrcode` dependency into its own on-demand chunk.
export default SubprofileShareCard;
