import { useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { ApiError } from "../../shared/api/client";
import { Button, Sending } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import { useProposeBarterSwap } from "./api/useBarter";
import { BarterQuestionModal } from "./BarterQuestionModal";
import styles from "./BarterDetailPage.module.css";

/**
 * Turns the API's refusal into the sentence that explains it. Every branch is a
 * real server answer: 403 for your own listing or a blocked pair, 404 for a
 * listing that is gone, 409 for a closed listing or a proposal you already sent.
 */
function refusalMessage(error: unknown, t: TFunction): string {
  if (!(error instanceof ApiError)) {
    return t("economy:barterDetail.propose.errorFailed");
  }
  if (error.status === 403) {
    return t("economy:barterDetail.propose.errorNotAllowed");
  }
  if (error.status === 404) {
    return t("economy:barterDetail.propose.errorGone");
  }
  if (error.status === 409) {
    return t("economy:barterDetail.propose.errorAlreadySent");
  }
  return t("economy:barterDetail.propose.errorFailed");
}

export function BarterProposeCard({
  listingId,
  name,
  firstName,
  isOwner = false,
  hasProposed = false,
}: {
  /** The listing the proposal is written against. */
  listingId?: string;
  name: string;
  firstName: string;
  /** True when the reader posted this listing, so proposing is not on offer. */
  isOwner?: boolean;
  /** True when the reader already has a proposal on this listing. */
  hasProposed?: boolean;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const [message, setMessage] = useState("");
  const [asking, setAsking] = useState(false);
  const [sentThisVisit, setSentThisVisit] = useState(false);
  const propose = useProposeBarterSwap(listingId);
  // Derived rather than seeded from `hasProposed`, so a refetch that learns a
  // proposal already exists is reflected instead of being stuck at mount-time
  // state.
  const sent = hasProposed || sentThisVisit;

  async function send() {
    if (!message.trim()) {
      showToast(t("economy:barterDetail.propose.errorEmpty"), "error");
      return;
    }
    if (propose.isPending) return;
    try {
      await propose.mutateAsync(message.trim());
      // Confirmation comes from the resolved mutation, never from the click.
      setMessage("");
      setSentThisVisit(true);
      showToast(
        t("economy:barterDetail.propose.toastSent", { name }),
        "success",
      );
    } catch (error) {
      showToast(refusalMessage(error, t), "error");
    }
  }

  if (isOwner) {
    return (
      <div className={`${styles.sideCard} ${styles.proposeCard}`}>
        <div className={styles.proposeHead}>
          <h4>{t("economy:barterDetail.propose.yoursTitle")}</h4>
          <div className={styles.lead}>
            {t("economy:barterDetail.propose.yoursLead")}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.sideCard} ${styles.proposeCard}`}>
      <div className={styles.proposeHead}>
        <h4>{t("economy:barterDetail.propose.title")}</h4>
        <div className={styles.lead}>
          <Translation
            i18nKey="economy:barterDetail.propose.lead"
            components={{ em: <em /> }}
          />
        </div>
      </div>
      <div className={styles.proposeBody}>
        {sent && (
          <p className={styles.proposeSent} role="status">
            {t("economy:barterDetail.propose.alreadySent", { firstName })}
          </p>
        )}
        <textarea
          className={styles.proposeTextarea}
          aria-label={t("economy:barterDetail.propose.placeholder", {
            firstName,
          })}
          placeholder={t("economy:barterDetail.propose.placeholder", {
            firstName,
          })}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className={styles.proposeActions}>
          <Button
            variant="primary"
            onClick={() => void send()}
            disabled={propose.isPending}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {propose.isPending ? (
              <Sending label={t("economy:barterDetail.propose.sending")} />
            ) : (
              <>
                {t("economy:barterDetail.propose.sendCta")}{" "}
                <FiArrowRight aria-hidden />
              </>
            )}
          </Button>
          {/* Demo-only. Live has one write here, `POST /barter/:id/proposals`,
              and a question is written straight into the box above — it lands
              in the poster's inbox either way. A second button that quietly
              did nothing is exactly what this rebuild removes. */}
          {demoMode && (
            <Button
              variant="ghost"
              onClick={() => setAsking(true)}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {t("economy:barterDetail.propose.askFirst")}
            </Button>
          )}
        </div>
        <p className={styles.proposeFoot}>
          {demoMode
            ? t("economy:barterDetail.propose.footNote")
            : t("economy:barterDetail.propose.footNoteLive")}
        </p>
      </div>

      {asking && (
        <BarterQuestionModal
          name={name}
          firstName={firstName}
          onClose={() => setAsking(false)}
        />
      )}
    </div>
  );
}
