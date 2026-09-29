import { useState } from "react";
import {
  FiArrowRight,
  FiCheck,
  FiClock,
  FiMessageSquare,
} from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import { listingCorrectionContactPath } from "../contactPrefill";
import type { ListingStatus, PendingListing } from "./listBusiness.data";
import styles from "./ListBusinessPage.module.css";

const STAGES: { id: ListingStatus; labelKey: string; icon: typeof FiClock }[] =
  [
    {
      id: "review",
      labelKey: "marketing:listBusiness.success.stage.review",
      icon: FiClock,
    },
    {
      id: "question",
      labelKey: "marketing:listBusiness.success.stage.question",
      icon: FiMessageSquare,
    },
    {
      id: "live",
      labelKey: "marketing:listBusiness.success.stage.live",
      icon: FiCheck,
    },
  ];

const NOTE_KEY: Record<ListingStatus, string> = {
  review: "marketing:listBusiness.success.note.review",
  question: "marketing:listBusiness.success.note.question",
  live: "marketing:listBusiness.success.note.live",
};

const TITLE_KEYS: Record<ListingStatus, { text: string; em: string }> = {
  review: {
    text: "marketing:listBusiness.success.title.review.text",
    em: "marketing:listBusiness.success.title.review.em",
  },
  question: {
    text: "marketing:listBusiness.success.title.question.text",
    em: "marketing:listBusiness.success.title.question.em",
  },
  live: {
    text: "marketing:listBusiness.success.title.live.text",
    em: "marketing:listBusiness.success.title.live.em",
  },
};

export function ListBusinessSuccess({
  listing,
  onEdit,
  onWithdraw,
  onAnother,
}: {
  listing: PendingListing;
  onEdit: () => void;
  onWithdraw: () => void;
  onAnother: () => void;
}) {
  const { t } = useTranslation();
  const currentIndex = STAGES.findIndex((s) => s.id === listing.status);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  // The platform holds a suggestion, so its note names the business rather
  // than the submitter, and it collapses the "question" stage into the same
  // "still reviewing" copy `review` gets: a suggester has nothing to answer a
  // moderator's question about, so the wizard never puts them in that stage.
  const isSuggestion = listing.path === "suggest";
  // A live suggestion gets its own title, "It's on the map": the ordinary
  // live title is written to the owner who submitted their own listing.
  const title =
    isSuggestion && listing.status === "live"
      ? {
          text: "marketing:listBusiness.success.title.suggestLive.text",
          em: "marketing:listBusiness.success.title.suggestLive.em",
        }
      : TITLE_KEYS[listing.status];
  const noteKey = isSuggestion
    ? listing.status === "live"
      ? "marketing:listBusiness.success.note.suggestLive"
      : "marketing:listBusiness.success.note.suggestReview"
    : NOTE_KEY[listing.status];

  return (
    <div className={styles.statusPanel}>
      <div className={styles.statusInner}>
        <div className={styles.statusCheck}>
          <FiCheck size={34} />
        </div>
        <h2 className={styles.statusTitle}>
          {t(title.text)} <em>{t(title.em)}</em>
        </h2>
        <div className={styles.bizEcho}>
          {listing.name || t("marketing:listBusiness.success.fallbackName")}
        </div>

        <div className={styles.tracker}>
          {STAGES.map((stage, i) => {
            const Icon = stage.icon;
            const cls =
              i < currentIndex
                ? styles.tkDone
                : i === currentIndex
                  ? styles.tkCurrent
                  : undefined;
            return (
              <div
                key={stage.id}
                className={[styles.tk, cls].filter(Boolean).join(" ")}
              >
                <span className={styles.tkDot}>
                  <Icon size={15} />
                </span>
                <span className={styles.tkL}>{t(stage.labelKey)}</span>
              </div>
            );
          })}
        </div>

        <div className={styles.statusNote}>
          <p>
            <Translation i18nKey={noteKey} components={{ b: <b /> }} />
          </p>
        </div>

        {confirmWithdraw ? (
          <div className={styles.withdrawConfirm} role="alertdialog">
            <p>
              <Translation
                i18nKey="marketing:listBusiness.success.withdrawConfirm"
                components={{ b: <b /> }}
                values={{
                  name:
                    listing.name ||
                    t("marketing:listBusiness.success.withdrawFallbackName"),
                }}
              />
            </p>
            <div className={styles.statusActions}>
              <Button
                variant="ghost-dark"
                onClick={() => setConfirmWithdraw(false)}
              >
                {t("marketing:listBusiness.success.keepIt")}
              </Button>
              <Button variant="primary" onClick={onWithdraw}>
                {t("marketing:listBusiness.success.yesWithdraw")}
              </Button>
            </div>
          </div>
        ) : (
          <div className={styles.statusActions}>
            <Button variant="ghost-dark" to={routes.directory}>
              {t("marketing:listBusiness.success.backToDirectory")}
            </Button>
            {/* A suggester holds none of an owner's rights over the listing:
                no profile to link it from, nothing to edit and nothing to
                withdraw, since the platform holds it now and the API answers
                404 to all three. Only the actions about the SUGGESTER'S own
                next move stay, plus "Send a correction" (PRD-434), which
                opens the contact form with this reference prefilled so a
                typo can be fixed through the product. */}
            {!isSuggestion && listing.linkToProfile && (
              <Button variant="ghost-dark" to={routes.accountProfile}>
                {t("marketing:listBusiness.success.viewOnProfile")}{" "}
                <FiArrowRight aria-hidden />
              </Button>
            )}
            {!isSuggestion && (
              <Button variant="ghost-dark" onClick={onEdit}>
                {t("marketing:listBusiness.success.editSubmission")}
              </Button>
            )}
            <Button variant="ghost-dark" onClick={onAnother}>
              {t("marketing:listBusiness.success.listAnother")}
            </Button>
            {isSuggestion && listing.ref && (
              <Button
                variant="ghost-dark"
                to={listingCorrectionContactPath(listing.ref)}
              >
                {t("marketing:listBusiness.success.sendCorrection")}
              </Button>
            )}
            {!isSuggestion && (
              <Button
                variant="ghost-dark"
                onClick={() => setConfirmWithdraw(true)}
              >
                {t("marketing:listBusiness.success.withdraw")}
              </Button>
            )}
          </div>
        )}

        <div className={styles.statusMeta}>
          <Translation
            i18nKey="marketing:listBusiness.success.reference"
            components={{ b: <b /> }}
            values={{ ref: listing.ref }}
          />
        </div>
      </div>
    </div>
  );
}
