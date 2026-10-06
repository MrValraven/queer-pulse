import { useState } from "react";
import { FiInfo } from "react-icons/fi";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { Button, Modal } from "../../../shared/components/ui";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ComposeAskFields } from "../compose/ComposeAskFields";
import { ComposeCallFields } from "../compose/ComposeCallFields";
import {
  composeFundingFromView,
  fundingBlockers,
  toFundingInput,
} from "../compose/composeFunding";
import type { ComposeFunding } from "../compose/composeThread.types";
import type { Thread } from "../forum.data";
import type {
  ForumFundingView,
  FundingEligibility,
  FundingErrorCode,
  FundingKind,
} from "./funding.types";
import {
  FUNDING_ERROR_MESSAGE_KEYS,
  FUNDING_ERROR_MESSAGE_VALUES,
  FUNDING_ERROR_TARGET,
  fundingErrorCode,
} from "./fundingErrors";
import { isFundingAuthor } from "./fundingPermissions";
import { previewFundingView } from "./fundingPreview";
import { useUpdateThreadFunding } from "./useUpdateThreadFunding";
import styles from "./FundingEditModal.module.css";

export interface FundingEditModalProps {
  thread: Thread;
  funding: ForumFundingView;
  onClose: () => void;
  /** The details as saved, so the panel can show them at once. */
  onSaved: (funding: ForumFundingView) => void;
}

export function FundingEditModal({
  thread,
  funding,
  onClose,
  onSaved,
}: FundingEditModalProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const kind: FundingKind = thread.kind === "ask" ? "ask" : "call";
  // The stored details, kept to tell an unchanged date (which passes even
  // after it has gone by) from a changed one (Plan 1, spec delta 13).
  const [original] = useState<ComposeFunding>(() =>
    composeFundingFromView(funding),
  );
  const [draft, setDraft] = useState<ComposeFunding>(original);
  const [errorCode, setErrorCode] = useState<FundingErrorCode | null>(null);
  const update = useUpdateThreadFunding(thread.slug);
  const { demoMode } = useDemoMode();
  // A moderator's edit keeps an approved fundraiser live; the author's sends
  // it back to review (Plan 1, spec delta 4), so only the author is warned.
  const isAuthorEditingAsk =
    kind === "ask" && isFundingAuthor(thread, demoMode);
  const blockers = fundingBlockers({
    kind,
    funding: draft,
    title: "",
    body: "",
    // The server checks the phone only when the fundraiser is created, so an
    // edit never shows the verification gate.
    isAskVerificationMissing: false,
    originalDeadlineLocal: original.deadlineLocal,
    originalEndsOnLocal: original.endsOnLocal,
  });
  const firstBlocker = blockers[0];
  // A verification refusal has no gate here: it reads as a section alert.
  const rawErrorTarget = errorCode ? FUNDING_ERROR_TARGET[errorCode] : null;
  const errorTarget = rawErrorTarget === "gate" ? "section" : rawErrorTarget;
  const errorKey = errorCode ? FUNDING_ERROR_MESSAGE_KEYS[errorCode] : null;

  const change = (patch: Partial<ComposeFunding>) =>
    setDraft((current) => ({ ...current, ...patch }));
  const toggleEligibility = (value: FundingEligibility) =>
    setDraft((current) => ({
      ...current,
      eligibility: current.eligibility.includes(value)
        ? current.eligibility.filter((entry) => entry !== value)
        : [...current.eligibility, value],
    }));

  const save = () => {
    const converted = toFundingInput(kind, draft);
    // An untouched deadline goes back as stored: the wall-clock round trip
    // moves an instant in the repeated hour of the October clock change.
    const isDeadlineUntouched =
      kind === "call" &&
      draft.deadlineLocal === original.deadlineLocal &&
      draft.isRolling === original.isRolling;
    // The same holds for a fundraiser's last day, stored as an instant.
    const isEndUntouched =
      kind === "ask" && draft.endsOnLocal === original.endsOnLocal;
    let input = converted;
    if (isDeadlineUntouched)
      input = { ...converted, deadline: funding.deadline };
    if (isEndUntouched) input = { ...converted, endsAt: funding.endsAt };
    setErrorCode(null);
    update.mutate(input, {
      onSuccess: (updated) => {
        // DEMO has no server answer: the author's edit sends an approved
        // fundraiser back to review, as the server would; anyone else's
        // keeps its state.
        const reviewOverrides = isAuthorEditingAsk
          ? {}
          : { approvedAt: funding.approvedAt, askState: funding.askState };
        onSaved(
          updated?.funding ??
            previewFundingView(kind, input, Date.now(), reviewOverrides),
        );
        showToast(t("forum:funding.edit.saved"), "success");
        onClose();
      },
      onError: (error) => {
        const code = fundingErrorCode(error);
        setErrorCode(code);
        showToast(
          t(
            code
              ? FUNDING_ERROR_MESSAGE_KEYS[code]
              : "forum:funding.edit.failed",
            FUNDING_ERROR_MESSAGE_VALUES,
          ),
          "error",
        );
      },
    });
  };

  return (
    <Modal
      title={t(
        kind === "ask"
          ? "forum:funding.edit.titleAsk"
          : "forum:funding.edit.title",
      )}
      onClose={onClose}
      footer={
        <div className={styles.footer}>
          <Button variant="ghost" onClick={onClose}>
            {t("forum:funding.edit.cancel")}
          </Button>
          <Button
            variant="primary"
            disabled={blockers.length > 0 || update.isPending}
            onClick={save}
          >
            {t("forum:funding.edit.save")}
          </Button>
        </div>
      }
    >
      {errorKey && errorTarget === "section" && (
        <p className={styles.error} role="alert">
          {t(errorKey, FUNDING_ERROR_MESSAGE_VALUES)}
        </p>
      )}
      {kind === "call" && (
        <ComposeCallFields
          funding={draft}
          onChange={change}
          onToggleEligibility={toggleEligibility}
          linkErrorKey={errorTarget === "link" ? errorKey : null}
        />
      )}
      {kind === "ask" && (
        <>
          {isAuthorEditingAsk && (
            <p className={styles.callout}>
              <FiInfo aria-hidden className={styles.calloutIcon} />
              {t("forum:funding.edit.askReviewNote")}
            </p>
          )}
          <ComposeAskFields
            funding={draft}
            onChange={change}
            linkErrorKey={errorTarget === "link" ? errorKey : null}
            isHostErrorShownElsewhere={
              firstBlocker?.id === "fundingHostNotAllowed"
            }
          />
        </>
      )}
      {firstBlocker && (
        <p className={styles.blocker} role="status">
          {t(firstBlocker.messageKey, firstBlocker.values)}
        </p>
      )}
    </Modal>
  );
}
