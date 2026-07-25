import { FiShare2 } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { personaShareUrl } from "./personaLinks.data";
import type { PublicSubprofileView } from "./api/subprofiles.adapters";
import styles from "./SubprofileShare.module.css";

/**
 * Share control for a public persona page: hands off to the native share
 * sheet where available (mobile browsers), falling back to copy-link +
 * toast. Mirrors the clipboard-share pattern in `StudioArtistHero.tsx`.
 */
export function SubprofileShare({ view }: { view: PublicSubprofileView }) {
  const { t } = useTranslation();
  const { showToast } = useToast();

  async function handleShare() {
    const url = personaShareUrl(view);

    if (navigator.share) {
      try {
        await navigator.share({ title: view.displayName, url });
      } catch (error) {
        // A user-cancelled share sheet rejects with AbortError — the native
        // UI already communicated that, so there's nothing more to show.
        if (error instanceof Error && error.name === "AbortError") return;
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      showToast(t("subprofiles:share.copied"), "success");
    } catch {
      // Clipboard permission denied/unavailable — nothing actionable to do.
    }
  }

  return (
    <Button
      variant="ghost"
      size="md"
      className={styles.shareButton}
      aria-label={t("subprofiles:share.ariaLabel")}
      onClick={handleShare}
    >
      <FiShare2 aria-hidden />
      {t("subprofiles:share.cta")}
    </Button>
  );
}
