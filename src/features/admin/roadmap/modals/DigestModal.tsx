import { useState } from "react";
import { Button } from "../../../../shared/components/ui";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { Translation } from "../../../../shared/i18n/Translation";
import { useAdminRoadmap } from "../../api/useAdminRoadmap";
import { AdminModal } from "../../ui";
import { useRoadmapModals } from "../state/useRoadmapModals";
import { buildDigestMarkdown } from "./digestMarkdown";
import styles from "./roadmapModals.module.css";

/**
 * Drafts the "You asked, we built" monthly member digest client-side from
 * the current board (shipped-and-public items, every slipped date with its
 * published reason, and what got declined this month) into an editable
 * textarea. No payload, no backend round-trip — it's a starting draft, not a
 * send: "Copy for the email" just puts it on the clipboard.
 */
export function DigestModal() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { modal, close } = useRoadmapModals();
  const { items, ideas } = useAdminRoadmap();
  const [draft, setDraft] = useState(() => buildDigestMarkdown(items, ideas, t));

  if (modal !== "digest") return null;

  async function copyForEmail() {
    try {
      await navigator.clipboard.writeText(draft);
      showToast(t("admin:roadmap.toasts.digestCopied"), "success");
    } catch {
      // NOTE: no dedicated catalog key for a clipboard failure on this
      // modal — plain literal fallback, matching the house "no blame,
      // plainly recoverable" error tone.
      showToast("Couldn't copy — select and copy the text instead.", "error");
    }
  }

  return (
    <AdminModal
      wide
      eyebrow={t("admin:roadmap.modals.digest.eyebrow")}
      title={
        <Translation
          i18nKey="admin:roadmap.modals.digest.title"
          components={{ em: <em /> }}
        />
      }
      onClose={close}
      footer={
        <>
          <Button variant="ghost" onClick={close}>
            {t("admin:common.close")}
          </Button>
          <Button variant="primary" onClick={() => void copyForEmail()}>
            {t("admin:roadmap.modals.digest.confirmCta")}
          </Button>
        </>
      }
    >
      <p className={styles.body}>{t("admin:roadmap.modals.digest.body")}</p>
      <textarea
        className={styles.digestTextarea}
        value={draft}
        rows={16}
        onChange={(event) => setDraft(event.target.value)}
        aria-label={t("admin:roadmap.modals.digest.eyebrow")}
      />
    </AdminModal>
  );
}
