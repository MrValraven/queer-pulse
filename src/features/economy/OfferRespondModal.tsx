import { useEffect, useRef, useState } from "react";
import { FiCheck, FiArrowRight } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ModalShell, Sending, SuccessPanel } from "./ModalKit";
import type { Application } from "./applicationStatus.types";
import {
  acceptedOfferPatch,
  declinedOfferPatch,
  offerRevertPatch,
} from "./applicationStatus.patches";
import styles from "./ApplicationModals.module.css";

/** Respond to an offer: accept or decline — both change card state. */
export function OfferRespondModal({
  app,
  onClose,
  onPatch,
}: {
  app: Application;
  onClose: () => void;
  onPatch: (id: string, patch: Partial<Application>) => void;
}) {
  const { t } = useTranslation();
  const UNDO_SECONDS = 8;
  const o = app.offer;
  const [outcome, setOutcome] = useState<null | "accept" | "decline">(null);
  const [pending, setPending] = useState<null | "accept" | "decline">(null);
  const [left, setLeft] = useState(UNDO_SECONDS);
  const timer = useRef<number | undefined>(undefined);
  const tick = useRef<number | undefined>(undefined);
  // Snapshot the pre-decision card so the action stays reversible.
  const snapshot = useRef(offerRevertPatch(app));
  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      window.clearInterval(tick.current);
    },
    [],
  );

  const choose = (kind: "accept" | "decline") => {
    setPending(kind);
    timer.current = window.setTimeout(() => {
      onPatch(
        app.id,
        kind === "accept" ? acceptedOfferPatch() : declinedOfferPatch(),
      );
      setOutcome(kind);
      setLeft(UNDO_SECONDS);
      tick.current = window.setInterval(() => {
        setLeft((s) => {
          if (s <= 1) window.clearInterval(tick.current);
          return s - 1;
        });
      }, 1000);
    }, 1000);
  };

  const undo = () => {
    window.clearInterval(tick.current);
    onPatch(app.id, snapshot.current);
    setOutcome(null);
    setPending(null);
  };

  if (outcome) {
    const accepted = outcome === "accept";
    const canUndo = left > 0;
    return (
      <ModalShell onClose={onClose} success>
        <SuccessPanel
          title={t("economy:offer.success.title")}
          em={
            accepted
              ? t("economy:offer.success.emAccepted")
              : t("economy:offer.success.emDeclined")
          }
          onClose={onClose}
          footer={
            <div className={styles.undoBar}>
              {canUndo ? (
                <>
                  <span className={styles.undoText}>
                    {t("economy:offer.undo.changedMind", { seconds: left })}
                  </span>
                  <button
                    type="button"
                    className={styles.undoBtn}
                    onClick={undo}
                  >
                    {t("economy:offer.undo.button")}
                  </button>
                </>
              ) : (
                <span className={styles.undoText}>
                  {t("economy:offer.undo.confirmed")}
                </span>
              )}
            </div>
          }
        >
          {accepted
            ? t("economy:offer.success.acceptedBody", {
                company: app.companyName,
              })
            : t("economy:offer.success.declinedBody", {
                company: app.companyName,
              })}
        </SuccessPanel>
      </ModalShell>
    );
  }

  return (
    <ModalShell onClose={onClose}>
      <div className={styles.eyebrow}>
        {t("economy:offer.respondByEyebrow", { date: o?.respondBy })}
      </div>
      <h2 className={styles.title}>
        <Translation
          i18nKey="economy:offer.saidYes"
          values={{ company: app.companyName }}
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.sub}>{t("economy:offer.sub")}</p>
      <div className={styles.panel}>
        <div className={styles.rows}>
          <div className={styles.row}>
            <span className={styles.rowK}>{t("economy:offer.salary")}</span>
            <span className={styles.rowV}>{o?.salary}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowK}>{t("economy:offer.holiday")}</span>
            <span className={styles.rowV}>{o?.holiday}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowK}>{t("economy:offer.start")}</span>
            <span className={styles.rowV}>{o?.start}</span>
          </div>
        </div>
      </div>
      <ul className={styles.list} style={{ marginBottom: 24 }}>
        {o?.terms.map((term) => (
          <li key={term} className={styles.listItem}>
            <FiCheck className={styles.tick} size={16} aria-hidden /> {term}
          </li>
        ))}
      </ul>
      <div className={styles.foot}>
        <button
          type="button"
          className={styles.back}
          disabled={pending !== null}
          onClick={() => choose("decline")}
        >
          {pending === "decline" ? (
            <Sending label={t("economy:offer.decliningLabel")} />
          ) : (
            t("economy:offer.declinePolitely")
          )}
        </button>
        <Button
          size="lg"
          variant="jade"
          disabled={pending !== null}
          onClick={() => choose("accept")}
        >
          {pending === "accept" ? (
            <Sending label={t("economy:offer.acceptingLabel")} />
          ) : (
            <>
              {t("economy:offer.acceptCta")}{" "}
              <FiArrowRight aria-hidden />
            </>
          )}
        </Button>
      </div>
    </ModalShell>
  );
}
