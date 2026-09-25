import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { copyPlainText, copyRichEmail } from "./copyEmail";
import type { RenderedEmail } from "./renderEmail";

/**
 * The one copy path for a welcome email: the approved card and its preview
 * modal both copy through here, so the clipboard contents and the toasts
 * match wherever the reviewer clicks. The toast names the address to paste
 * to, since QueerPulse sends no email itself.
 *
 * The handlers take the rendered email as an argument so the card can call
 * this hook before its early return (rules of hooks) and render afterwards.
 */
export function useWelcomeEmailCopy(recipientEmail: string) {
  const { t } = useTranslation();
  const { showToast } = useToast();

  async function copyBody(rendered: RenderedEmail) {
    const outcome = await copyRichEmail(rendered);
    if (outcome === "failed") {
      showToast(t("admin:emailTemplates.copy.failedToast"), "error");
      return;
    }
    const key = outcome === "rich" ? "copiedToast" : "copiedPlainToast";
    showToast(
      t(`admin:emailTemplates.copy.${key}`, { email: recipientEmail }),
      "success",
    );
  }

  async function copySubject(rendered: RenderedEmail) {
    const isCopied = await copyPlainText(rendered.subject);
    showToast(
      t(
        isCopied
          ? "admin:emailTemplates.copy.subjectCopiedToast"
          : "admin:emailTemplates.copy.failedToast",
      ),
      isCopied ? "success" : "error",
    );
  }

  return { copyBody, copySubject };
}
