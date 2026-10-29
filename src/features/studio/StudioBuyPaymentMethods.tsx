import { useId, useState } from "react";
import { Button, Collapse } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { GivingCopyRow } from "../communities/giving/GivingCopyRow";
import { GivingLinkRow } from "../communities/giving/GivingLinkRow";
import type { StudioPaymentMethodView } from "./api/studioPurchases.adapters";
import type { useStudioPurchaseReference } from "./api/useStudioPurchaseReference";
import { StudioCopyValueRow } from "./StudioCopyValueRow";
import { StudioEuroAmount } from "./StudioEuroAmount";
import { studioErrorMessageKeyOf } from "./studioErrors.data";
import styles from "./StudioBuySheet.module.css";

/** The reference slot: the code with its copy row and line, a loading line, or the failure with "Get a new payment code". */
export type StudioBuyReferenceSlot =
  | { status: "ready"; referenceCode: string }
  | { status: "loading" }
  | { status: "failed"; error: unknown; onRequestNew: () => void };

type FailedSlot = Extract<StudioBuyReferenceSlot, { status: "failed" }>;

/** "Pay the artist": the persona's ways to get paid in the artist's order
 *  (links open in a new tab, MB WAY and IBAN copy in one tap), each note
 *  under its row, then the payment code to add to the payment note.
 *  `reference` null leaves the slot out (the pending state shows its code
 *  above the disclosure). */
export function StudioBuyPaymentMethods({
  artistName,
  amountCents,
  methods,
  reference,
}: {
  artistName: string;
  amountCents: number;
  methods: StudioPaymentMethodView[];
  reference: StudioBuyReferenceSlot | null;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h3 id={headingId} className={styles.sectionHeading}>
        {t("studio:purchase.sheet.payHeading", { artist: artistName })}
      </h3>
      <p className={styles.payIntro}>
        <Translation
          i18nKey="studio:purchase.sheet.payIntro"
          slots={{ amount: <StudioEuroAmount value={amountCents / 100} /> }}
        />
      </p>
      <ul
        className={styles.methods}
        aria-label={t("studio:purchase.sheet.methodsLabel", {
          artist: artistName,
        })}
      >
        {methods.map((method) => {
          const note = method.note?.trim() ?? "";
          return (
            <li key={method.id} className={styles.method}>
              {method.kind === "link" ? (
                <GivingLinkRow method={method} />
              ) : (
                <GivingCopyRow method={method} />
              )}
              {note && <p className={styles.methodNote}>{note}</p>}
            </li>
          );
        })}
      </ul>
      <Collapse isOpen={reference !== null}>
        <StudioBuyReferenceStates
          artistName={artistName}
          reference={reference ?? { status: "loading" }}
        />
      </Collapse>
    </section>
  );
}

/** The sheet's pay step: the methods with the slot built from the payment
 *  code request (ready with its code, loading, or failed with its retry). */
export function StudioBuyPaymentStep({
  paymentReference,
  ...props
}: Omit<Parameters<typeof StudioBuyPaymentMethods>[0], "reference"> & {
  paymentReference: ReturnType<typeof useStudioPurchaseReference>;
}) {
  const { reference, status, error, requestNew } = paymentReference;
  let slot: StudioBuyReferenceSlot = { status: "loading" };
  if (status === "ready" && reference !== null) {
    slot = { status: "ready", referenceCode: reference.referenceCode };
  } else if (status === "failed") {
    slot = { status: "failed", error, onRequestNew: requestNew };
  }
  return <StudioBuyPaymentMethods {...props} reference={slot} />;
}

/** Each state of the payment code in its own Collapse. The code and the
 *  failure keep their last words while they fold away. */
function StudioBuyReferenceStates({
  artistName,
  reference,
}: {
  artistName: string;
  reference: StudioBuyReferenceSlot;
}) {
  const { t } = useTranslation();
  const lineId = useId();
  const [shownCode, setShownCode] = useState<string | null>(null);
  const [shownFailure, setShownFailure] = useState<FailedSlot | null>(null);
  if (reference.status === "ready" && reference.referenceCode !== shownCode)
    setShownCode(reference.referenceCode);
  // The parent builds the slot each render, so the error is the identity.
  if (reference.status === "failed" && reference.error !== shownFailure?.error)
    setShownFailure(reference);
  const failure = reference.status === "failed" ? reference : shownFailure;
  return (
    <div className={styles.referenceSlot}>
      <Collapse isOpen={reference.status === "ready"}>
        {shownCode !== null && (
          <div className={styles.referenceReady}>
            <StudioCopyValueRow
              label={t("studio:purchase.reference.label")}
              value={shownCode}
              copyLabel={t("studio:purchase.reference.copyCta")}
              copyAriaLabel={t("studio:purchase.reference.copyAria")}
              copiedToast={t("studio:purchase.reference.copied")}
              copyFailedToast={t("studio:purchase.reference.copyFailed")}
              describedBy={lineId}
            />
            <p id={lineId} className={styles.referenceLine}>
              {t("studio:purchase.reference.line", { artist: artistName })}
            </p>
          </div>
        )}
      </Collapse>
      <Collapse isOpen={reference.status === "loading"}>
        <p className={styles.referenceLine}>
          {t("studio:purchase.reference.loading")}
        </p>
      </Collapse>
      <Collapse isOpen={reference.status === "failed"}>
        {failure !== null && (
          <div className={styles.referenceFailed}>
            <p role="alert" className={styles.referenceError}>
              {`${t("studio:purchase.reference.loadFailed")}. ${t(studioErrorMessageKeyOf(failure.error, "load"))}`}
            </p>
            <Button
              variant="quiet"
              size="sm"
              className={styles.retryButton}
              onClick={failure.onRequestNew}
            >
              {t("studio:purchase.reference.retryCta")}
            </Button>
          </div>
        )}
      </Collapse>
      {/* The code arriving reaches assistive tech here; the copy row itself
       *  is no live region. */}
      <p role="status" className="visuallyHidden">
        {reference.status === "ready"
          ? `${t("studio:purchase.reference.label")} ${reference.referenceCode}`
          : ""}
      </p>
    </div>
  );
}
