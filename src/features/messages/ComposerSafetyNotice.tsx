// src/features/messages/ComposerSafetyNotice.tsx
import { FiShield } from "react-icons/fi";
import { FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ContactSafetySignal } from "./contactSafetyDetector";
import styles from "./MessagesPage.module.css";

/**
 * Advisory inline note shown above the composer while the draft contains a
 * phone number, email, banking detail, or an external-payment prompt (see
 * `contactSafetyDetector.ts`). Never blocks sending — this is a hint, not a
 * gate (spec P0.7): the exact off-platform, pay-before-you've-seen-it pattern
 * behind the Portugal rental-scam playbook the housing feature is exposed to.
 * One generic message regardless of which signal(s) tripped, so this stays
 * simple to read at a glance rather than enumerating categories.
 */
export function ComposerSafetyNotice({
  signals,
}: {
  signals: ContactSafetySignal[];
}) {
  const { t } = useTranslation();
  if (signals.length === 0) return null;

  return (
    <FadeIn
      as="div"
      className={styles.composerSafetyNotice}
      role="note"
      aria-live="polite"
    >
      <FiShield aria-hidden />
      <span>{t("messages:conversation.contactSafetyNotice")}</span>
    </FadeIn>
  );
}
