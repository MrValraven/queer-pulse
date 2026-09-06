import { useId, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiCheck, FiShield } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { submitIntake } from "../../shared/api/intakes";
import { LANDLORD_REPLY_QUERY } from "./landlordReplyRequest";
import s from "./LandlordReplyRequestPage.module.css";

/**
 * PRD-249. "Is this you? Ask to reply" — the public page a landlord named in
 * the community directory uses to answer what was written about them.
 *
 * PUBLIC AND UNAUTHENTICATED BY DESIGN, and the only page in the economy
 * feature that is. The person this serves has no account, no invite and no way
 * to get one: a `Landlord` row is a community-maintained entry ABOUT a third
 * party, and the directory it lives in is member-only, so they cannot read the
 * recommendation they are answering. A member sends them this link. The path
 * sits outside `/work` and `/local/housing`, both of which `authGate` gates.
 *
 * WHAT IT DOES NOT DO. It publishes nothing. It writes one
 * `landlord_reply_request` intake row for staff, who establish that the person
 * writing is the person named before a word reaches the page, and then publish
 * it through `POST /admin/landlords/recommendations/:id/reply`. That human step
 * is the whole safeguard: nothing here authenticates a landlord, because
 * nothing on this platform can.
 *
 * The copy promises no message back. QueerPulse sends no email, and a page that
 * implied one would be lying to somebody already unhappy.
 */
export function LandlordReplyRequestPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const fieldId = useId();
  const [searchParams] = useSearchParams();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [reply, setReply] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Both arrive in the link the landlord was sent. Neither is trusted for
  // anything: they are what a staff member uses to find the row being answered,
  // and the recommendation id is already the public report handle.
  const landlordSlug = searchParams.get(LANDLORD_REPLY_QUERY.landlord) ?? "";
  const recommendationId =
    searchParams.get(LANDLORD_REPLY_QUERY.recommendation) ?? "";

  const canSend = name.trim().length >= 2 && reply.trim().length >= 20;

  async function handleSend() {
    if (!canSend || isSending) return;
    setIsSending(true);
    try {
      if (demoMode) {
        // No live row to answer in the prototype, so the flow runs to the same
        // confirmation without a network call, exactly like every other demo
        // form.
        await new Promise((resolve) => setTimeout(resolve, 600));
      } else {
        await submitIntake("landlord_reply_request", {
          landlordSlug,
          recommendationId,
          name: name.trim(),
          contact: contact.trim(),
          reply: reply.trim(),
        });
      }
      setIsDone(true);
    } catch {
      showToast(t("economy:landlordReply.error"), "error");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <PageShell>
      <div className={s.page}>
        {isDone ? (
          <div className={s.done}>
            <div className={s.doneIcon}>
              <FiCheck aria-hidden />
            </div>
            <h1 className={s.doneTitle}>
              {t("economy:landlordReply.doneTitle")}
            </h1>
            <p className={s.doneBody}>{t("economy:landlordReply.doneBody")}</p>
          </div>
        ) : (
          <div className={s.card}>
            <div className={s.eyebrow}>
              {t("economy:landlordReply.eyebrow")}
            </div>
            <h1 className={s.title}>{t("economy:landlordReply.title")}</h1>
            <p className={s.intro}>{t("economy:landlordReply.intro")}</p>

            <div className={s.notice}>
              <FiShield aria-hidden className={s.noticeIcon} />
              <p>{t("economy:landlordReply.checkNotice")}</p>
            </div>

            <label className={s.label} htmlFor={`${fieldId}-name`}>
              {t("economy:landlordReply.nameLabel")}
            </label>
            <input
              id={`${fieldId}-name`}
              className={s.input}
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
            />

            <label className={s.label} htmlFor={`${fieldId}-contact`}>
              {t("economy:landlordReply.contactLabel")}
            </label>
            <input
              id={`${fieldId}-contact`}
              className={s.input}
              value={contact}
              onChange={(event) => setContact(event.target.value)}
            />
            <p className={s.hint}>{t("economy:landlordReply.contactHint")}</p>

            <label className={s.label} htmlFor={`${fieldId}-reply`}>
              {t("economy:landlordReply.replyLabel")}
            </label>
            <textarea
              id={`${fieldId}-reply`}
              className={s.textarea}
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              placeholder={t("economy:landlordReply.replyPlaceholder")}
            />
            <p className={s.hint}>{t("economy:landlordReply.replyHint")}</p>

            <div className={s.actions}>
              <Button
                variant="primary"
                onClick={() => void handleSend()}
                disabled={!canSend || isSending}
              >
                {t("economy:landlordReply.send")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
