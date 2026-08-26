import { useCallback, useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { FiBookOpen, FiExternalLink, FiFileText } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { useAuth } from "../../app/providers/authContext";
import { Button } from "../../shared/components/ui";
import { useDismiss } from "../../shared/components/ui/useDismiss";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { logError } from "../../shared/observability/logger";
import {
  postPolicyAcceptance,
  type PolicyVersions,
} from "../../shared/api/consent.api";
import s from "./PolicyReacceptance.module.css";

/** One document the member is being asked to agree to again. */
interface ChangedDocument {
  key: "terms" | "guidelines";
  nameKey: string;
  to: string;
  accepted: string | null;
  current: string;
}

/**
 * The re-acceptance sheet (ID-14): shown when a member's stored Terms or
 * Community Guidelines revision has fallen behind the one in effect.
 *
 * WHY IT BLOCKS, AND WHAT IT NEVER DOES
 * -------------------------------------
 * Changing the guidelines is a governance act on a platform whose whole premise
 * is a trusted space. If someone is later moderated under a rule added after
 * they joined, there has to be a record that they saw it — so this cannot be a
 * banner they scroll past, and dismissing it must never be read as agreement.
 * It therefore has no close button, no grabber and no Escape handler: the only
 * ways out are the real ones. Read either document (the gate steps aside on
 * those paths), agree, or sign out.
 *
 * `useDismiss` is still used, for everything EXCEPT closing — scroll lock, the
 * Tab focus trap, initial focus and focus restore. Its `onClose` is
 * intentionally inert; see the comment at the call.
 *
 * It names WHICH documents moved and which revision the member is on, rather
 * than a vague "our policies have changed": the member is being asked to agree
 * to something specific, so they get to see what it is and read it first.
 */
export function PolicyReacceptanceSheet({
  policyVersions,
  onAccepted,
}: {
  policyVersions: PolicyVersions;
  onAccepted: () => void;
}) {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const titleId = useId();
  const [isSubmitting, setSubmitting] = useState(false);
  const [hasFailed, setFailed] = useState(false);

  // Inert `onClose`: this dialog cannot be dismissed (see the essay above), but
  // it still needs every OTHER thing useDismiss provides — the page behind must
  // not scroll, Tab must not escape to controls the member is being blocked
  // from, and focus must land inside on open and return to where it was on
  // close. Passing a no-op is what turns Escape off while keeping those.
  const dialogRef = useDismiss(useCallback(() => {}, []));

  const changedDocuments = useMemo<ChangedDocument[]>(() => {
    const documents: ChangedDocument[] = [];
    if (policyVersions.acceptedTerms !== policyVersions.currentTerms) {
      documents.push({
        key: "terms",
        nameKey: "auth:policyReacceptance.documents.terms",
        to: routes.terms,
        accepted: policyVersions.acceptedTerms,
        current: policyVersions.currentTerms,
      });
    }
    if (
      policyVersions.acceptedGuidelines !== policyVersions.currentGuidelines
    ) {
      documents.push({
        key: "guidelines",
        nameKey: "auth:policyReacceptance.documents.guidelines",
        to: routes.guidelines,
        accepted: policyVersions.acceptedGuidelines,
        current: policyVersions.currentGuidelines,
      });
    }
    return documents;
  }, [policyVersions]);

  const handleAgree = useCallback(() => {
    setSubmitting(true);
    setFailed(false);
    void postPolicyAcceptance()
      .then(() => onAccepted())
      .catch((error: unknown) => {
        // Unlike cookie consent, this failure is surfaced: closing the sheet on
        // a write that never landed would leave a member believing they had
        // agreed and us with no record that they did.
        logError(error, { scope: "policyReacceptance.accept" });
        setFailed(true);
      })
      .finally(() => setSubmitting(false));
  }, [onAccepted]);

  return createPortal(
    <div className={s.scrim} role="presentation">
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={s.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className={s.eyebrow}>{t("auth:policyReacceptance.eyebrow")}</div>
        <h2 id={titleId} className={s.title}>
          <Translation
            i18nKey="auth:policyReacceptance.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={s.lede}>{t("auth:policyReacceptance.lede")}</p>

        <ul className={s.documents}>
          {changedDocuments.map((document) => (
            <li key={document.key} className={s.document}>
              <span className={s.documentIcon} aria-hidden>
                {document.key === "terms" ? <FiFileText /> : <FiBookOpen />}
              </span>
              <div className={s.documentBody}>
                <p className={s.documentName}>{t(document.nameKey)}</p>
                <p className={s.documentVersions}>
                  {document.accepted
                    ? t("auth:policyReacceptance.versionChanged", {
                        previous: document.accepted,
                        current: document.current,
                      })
                    : t("auth:policyReacceptance.versionUnrecorded", {
                        current: document.current,
                      })}
                </p>
                <Link className={s.documentLink} to={document.to}>
                  {t("auth:policyReacceptance.read")}
                  <FiExternalLink aria-hidden />
                </Link>
              </div>
            </li>
          ))}
        </ul>

        {hasFailed && (
          <p className={s.error} role="alert">
            {t("auth:policyReacceptance.error")}
          </p>
        )}

        <div className={s.actions}>
          <button type="button" className={s.signOut} onClick={signOut}>
            {t("auth:policyReacceptance.signOut")}
          </button>
          <Button
            variant="primary"
            onClick={handleAgree}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? t("auth:policyReacceptance.agreeing")
              : t("auth:policyReacceptance.agree")}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
