import { useState } from "react";
import { FiCheck, FiClock, FiMessageSquare } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
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
  onSetStage,
  onEdit,
  onWithdraw,
  onAnother,
}: {
  listing: PendingListing;
  onSetStage: (s: ListingStatus) => void;
  onEdit: () => void;
  onWithdraw: () => void;
  onAnother: () => void;
}) {
  const { t } = useTranslation();
  const currentIndex = STAGES.findIndex((s) => s.id === listing.status);
  const title = TITLE_KEYS[listing.status];
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);

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
            <Translation
              i18nKey={NOTE_KEY[listing.status]}
              components={{ b: <b /> }}
            />
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
            {listing.linkToProfile && (
              <Button variant="ghost-dark" to={routes.accountProfile}>
                {t("marketing:listBusiness.success.viewOnProfile")}
              </Button>
            )}
            <Button variant="ghost-dark" onClick={onEdit}>
              {t("marketing:listBusiness.success.editSubmission")}
            </Button>
            <Button variant="ghost-dark" onClick={onAnother}>
              {t("marketing:listBusiness.success.listAnother")}
            </Button>
            <Button
              variant="ghost-dark"
              onClick={() => setConfirmWithdraw(true)}
            >
              {t("marketing:listBusiness.success.withdraw")}
            </Button>
          </div>
        )}

        <div className={styles.statusMeta}>
          <Translation
            i18nKey="marketing:listBusiness.success.reference"
            components={{ b: <b /> }}
            values={{ ref: listing.ref }}
          />
        </div>

        <div className={styles.demoFlip}>
          <span>{t("marketing:listBusiness.success.demoFlip")}</span>
          {STAGES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={
                listing.status === s.id ? styles.demoFlipOn : undefined
              }
              onClick={() => onSetStage(s.id)}
            >
              {t(s.labelKey)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
