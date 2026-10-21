import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiArrowRight } from "react-icons/fi";
import {
  Button,
  Collapse,
  Modal,
  SuccessPanel,
} from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { StudioEuroAmount } from "./StudioEuroAmount";
import styles from "./StudioTipModal.module.css";

const PRESETS = [2, 5, 10];
/** Demo rule: the simulated card issuer declines a tip above this amount, so
 *  the showcase can model a failed payment. */
const DEMO_TIP_LIMIT = 100;
const DEMO_PROCESSING_MS = 1100;

type Phase = "pick" | "sending" | "failed" | "done";

/**
 * Reusable tip modal for the Studio section, on the shared `Modal`. Amount
 * presets (toggle buttons) + custom, a simulated processing beat, a declined
 * state that names its reason, and a thank-you panel. Owns its own presence,
 * so closing plays the dialog's exit before `onClose` runs.
 */
export function StudioTipModal({
  recipient,
  onClose,
}: {
  recipient: string;
  onClose: () => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <AnimatePresence onExitComplete={onClose}>
      {isOpen && (
        <StudioTipDialog
          recipient={recipient}
          onClose={() => setIsOpen(false)}
        />
      )}
    </AnimatePresence>
  );
}

function StudioTipDialog({
  recipient,
  onClose,
}: {
  recipient: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const customInputId = useId();
  // PT writes the euro mark after the amount ("5 €"), EN before ("€5").
  const isEuroMarkAfter = !fmt.currency(0).startsWith("€");
  const [phase, setPhase] = useState<Phase>("pick");
  const [amount, setAmount] = useState(PRESETS[0]!);
  const [custom, setCustom] = useState("");
  const timer = useRef<number | undefined>(undefined);
  // The same euro format StudioEuroAmount prints: whole euros drop the cents.
  const formatTipAmount = (euros: number) =>
    fmt.currency(euros, "EUR", {
      minimumFractionDigits: Number.isInteger(euros) ? 0 : 2,
      maximumFractionDigits: Number.isInteger(euros) ? 0 : 2,
    });

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const value = custom ? Number(custom) : amount;
  const canSend = value > 0 && !Number.isNaN(value);
  const isSending = phase === "sending";
  // The send button's amount rolls as a preset or a custom amount is picked.
  const sendAmount = value || 0;

  function send() {
    if (!canSend || isSending) return;
    setPhase("sending");
    timer.current = window.setTimeout(
      () => setPhase(value > DEMO_TIP_LIMIT ? "failed" : "done"),
      DEMO_PROCESSING_MS,
    );
  }

  if (phase === "done") {
    return (
      <Modal
        title={t("studio:tipModal.success.heading")}
        onClose={onClose}
        isStudioPlayerSurface
      >
        <SuccessPanel
          title={t("studio:tipModal.success.sentTo", { recipient })}
          em={formatTipAmount(value)}
          onClose={onClose}
          closeLabel={t("studio:tipModal.success.backCta")}
        >
          {t("studio:tipModal.success.body", { recipient })}
        </SuccessPanel>
      </Modal>
    );
  }

  return (
    <Modal
      title={
        <Translation
          i18nKey="studio:tipModal.title"
          components={{ em: <em /> }}
          values={{ recipient }}
        />
      }
      eyebrow={t("studio:tipModal.eyebrow")}
      sub={t("studio:tipModal.sub", { recipient })}
      onClose={onClose}
      isStudioPlayerSurface
      footer={
        <Button
          variant="primary"
          size="lg"
          onClick={send}
          disabled={!canSend || isSending}
          aria-busy={isSending}
          style={{ width: "100%" }}
        >
          {isSending ? (
            <>
              <span className={styles.spinner} aria-hidden />{" "}
              {t("studio:tipModal.sendingCta")}
            </>
          ) : (
            <>
              {/* One span keeps the label a single flex item, so the
                  button's gap never opens beside the rolling amount. */}
              <span>
                <Translation
                  i18nKey="studio:tipModal.sendCta"
                  slots={{
                    amount: (
                      <RollingNumber
                        value={formatTipAmount(sendAmount)}
                        numericValue={sendAmount}
                      />
                    ),
                  }}
                />
              </span>{" "}
              <FiArrowRight aria-hidden />
            </>
          )}
        </Button>
      }
    >
      <div className={styles.body}>
        <div
          className={styles.amounts}
          role="group"
          aria-label={t("studio:tipModal.amountsLabel")}
        >
          {PRESETS.map((preset) => {
            const isSelected = !custom && amount === preset;
            return (
              <Button
                key={preset}
                variant={isSelected ? "primary" : "ghost"}
                aria-pressed={isSelected}
                disabled={isSending}
                onClick={() => {
                  setAmount(preset);
                  setCustom("");
                  setPhase("pick");
                }}
              >
                <StudioEuroAmount value={preset} />
              </Button>
            );
          })}
        </div>

        <div className={styles.customRow}>
          {!isEuroMarkAfter && <span aria-hidden>€</span>}
          <input
            id={customInputId}
            type="number"
            min={1}
            inputMode="decimal"
            aria-label={t("studio:tipModal.customPlaceholder")}
            placeholder={t("studio:tipModal.customPlaceholder")}
            value={custom}
            disabled={isSending}
            onChange={(event) => {
              setCustom(event.target.value);
              setPhase("pick");
            }}
          />
          {isEuroMarkAfter && <span aria-hidden>€</span>}
        </div>

        <Collapse isOpen={phase === "failed"}>
          <p className={styles.error} role="alert">
            <Translation
              i18nKey="studio:tipModal.failed"
              values={{ recipient }}
              slots={{
                amount: <StudioEuroAmount value={value} />,
                limit: <StudioEuroAmount value={DEMO_TIP_LIMIT} />,
              }}
            />
          </p>
        </Collapse>

        <div className={styles.note}>
          <Translation
            i18nKey="studio:tipModal.note"
            components={{ em: <em /> }}
            values={{ recipient }}
          />
        </div>
      </div>
    </Modal>
  );
}
