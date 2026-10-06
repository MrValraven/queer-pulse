import { useId, useState } from "react";
import { FiShield } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  FUNDING_ERROR_MESSAGE_KEYS,
  FUNDING_ERROR_MESSAGE_VALUES,
  FUNDING_ERROR_TARGET,
} from "../funding/fundingErrors";
import type {
  FundingEligibility,
  FundingErrorCode,
  FundingKind,
} from "../funding/funding.types";
import { findPaymentDetails } from "../funding/fundingLink";
import type { AskEligibility } from "../funding/useAskEligibility";
import type { FundingLinkLookup } from "../funding/useFundingLinkLookup";
import { ComposeAskFields } from "./ComposeAskFields";
import { ComposeAskGate } from "./ComposeAskGate";
import { ComposeCallFields } from "./ComposeCallFields";
import type { ComposeFunding } from "./composeThread.types";
import styles from "./ComposeFundingSection.module.css";

export interface ComposeFundingSectionProps {
  kind: FundingKind;
  funding: ComposeFunding;
  onChange: (patch: Partial<ComposeFunding>) => void;
  onToggleEligibility: (value: FundingEligibility) => void;
  lookup: FundingLinkLookup;
  /** The contract code of the last refused publish, if any. */
  serverErrorCode: FundingErrorCode | null;
  /** The post's title and body, checked for payment details on a fundraiser. */
  title: string;
  body: string;
  /** Whether this member may write a fundraiser. Absent reads as allowed. */
  askEligibility?: AskEligibility;
  /** The member verified their phone from the gate. */
  onAskVerified?: () => void;
}

/** The structured details an open call or a fundraiser carries. */
export function ComposeFundingSection({
  kind,
  funding,
  onChange,
  onToggleEligibility,
  lookup,
  serverErrorCode,
  title,
  body,
  askEligibility,
  onAskVerified,
}: ComposeFundingSectionProps) {
  const { t } = useTranslation();
  const headingId = useId();
  if (kind === "ask") {
    return (
      <section className={styles.section} aria-labelledby={headingId}>
        <h2 id={headingId} className={styles.heading}>
          {t("forum:funding.compose.askHeading")}
        </h2>
        <AskSection
          funding={funding}
          onChange={onChange}
          serverErrorCode={serverErrorCode}
          title={title}
          body={body}
          askEligibility={askEligibility}
          onAskVerified={onAskVerified}
        />
      </section>
    );
  }
  const target = serverErrorCode ? FUNDING_ERROR_TARGET[serverErrorCode] : null;
  const errorKey = serverErrorCode
    ? FUNDING_ERROR_MESSAGE_KEYS[serverErrorCode]
    : null;
  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.heading}>
        {t("forum:funding.compose.heading")}
      </h2>
      {errorKey && target === "section" && (
        <p className={styles.error} role="alert">
          {t(errorKey, FUNDING_ERROR_MESSAGE_VALUES)}
        </p>
      )}
      <ComposeCallFields
        funding={funding}
        onChange={onChange}
        onToggleEligibility={onToggleEligibility}
        lookup={lookup}
        linkErrorKey={target === "link" ? errorKey : null}
      />
    </section>
  );
}

type AskSectionProps = Pick<
  ComposeFundingSectionProps,
  | "funding"
  | "onChange"
  | "serverErrorCode"
  | "title"
  | "body"
  | "askEligibility"
  | "onAskVerified"
>;

/** The fundraiser's half: the verification gate below phone level, a quiet
 *  line while the level loads, and otherwise the review note, the inline
 *  refusals and the fields. */
function AskSection({
  funding,
  onChange,
  serverErrorCode,
  title,
  body,
  askEligibility,
  onAskVerified,
}: AskSectionProps) {
  const { t } = useTranslation();
  // A server refusal for missing verification shows the gate until the member
  // verifies here. A new refusal from the server shows it again.
  const [hasVerifiedHere, setHasVerifiedHere] = useState(false);
  const [verifiedForCode, setVerifiedForCode] = useState(serverErrorCode);
  if (verifiedForCode !== serverErrorCode) {
    setVerifiedForCode(serverErrorCode);
    setHasVerifiedHere(false);
  }
  const isServerGated =
    serverErrorCode === "funding_ask_verification_required" &&
    !(hasVerifiedHere && verifiedForCode === serverErrorCode);
  if (isServerGated || askEligibility?.status === "needsPhone") {
    return (
      <ComposeAskGate
        onVerified={() => {
          setHasVerifiedHere(true);
          askEligibility?.refresh();
          onAskVerified?.();
        }}
      />
    );
  }
  if (askEligibility?.status === "checking") {
    return (
      <p className={styles.checking} role="status">
        {t("forum:funding.gate.checking")}
      </p>
    );
  }
  const target = serverErrorCode ? FUNDING_ERROR_TARGET[serverErrorCode] : null;
  const errorKey = serverErrorCode
    ? FUNDING_ERROR_MESSAGE_KEYS[serverErrorCode]
    : null;
  const hasPaymentDetails = findPaymentDetails(`${title}\n${body}`) !== null;
  // The live notice under the body already says it when the server refused
  // for the same reason.
  const isServerErrorRepeated =
    serverErrorCode === "funding_payment_details_in_body" && hasPaymentDetails;
  return (
    <>
      <p className={styles.guidance}>
        <FiShield aria-hidden />
        {t("forum:funding.compose.askReview")}
      </p>
      {errorKey && target === "section" && !isServerErrorRepeated && (
        <p className={styles.error} role="alert">
          {t(errorKey, FUNDING_ERROR_MESSAGE_VALUES)}
        </p>
      )}
      <ComposeAskFields
        funding={funding}
        onChange={onChange}
        linkErrorKey={target === "link" ? errorKey : null}
      />
    </>
  );
}

/** The fundraiser's payment notice, right under the body it is about: an
 *  IBAN or a phone number has no place in a fundraiser's text. */
export function ComposeAskPaymentNotice({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  const { t } = useTranslation();
  if (findPaymentDetails(`${title}\n${body}`) === null) return null;
  return (
    <p className={styles.error} role="alert">
      {t("forum:composePage.blocker.fundingPaymentDetails")}
    </p>
  );
}
