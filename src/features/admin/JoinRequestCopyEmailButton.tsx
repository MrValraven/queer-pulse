import { FiCheck, FiCopy } from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import { IconButton } from "../../shared/components/ui";
import { useClipboard } from "../../shared/hooks/useClipboard";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./AdminVerifyDecided.module.css";

/**
 * Copies the applicant's email in one click, so reaching them never starts
 * with selecting the address by hand. The check mark stands in for the
 * copy icon for a moment after a copy, and a toast says how it went either way.
 */
export function JoinRequestCopyEmailButton({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { copy, copied: isCopied } = useClipboard();

  async function copyEmail() {
    const didCopy = await copy(email);
    showToast(
      t(
        didCopy
          ? "admin:members.verify.decided.emailCopied"
          : "admin:members.verify.decided.emailCopyFailed",
      ),
      didCopy ? "success" : "error",
    );
  }

  return (
    <IconButton
      size="sm"
      className={styles.copyEmail}
      aria-label={t("admin:members.verify.decided.copyEmail", { name })}
      onClick={() => void copyEmail()}
    >
      {isCopied ? <FiCheck aria-hidden /> : <FiCopy aria-hidden />}
    </IconButton>
  );
}
