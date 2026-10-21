import { useRef, useState, type ReactNode, type RefObject } from "react";
import { AnimatePresence } from "motion/react";
import { FiAward } from "react-icons/fi";
import {
  Collapse,
  ConfirmDialog,
  EmptyState,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { isSettledCreditError } from "./api/studioCreditCache";
import type { StudioCreditInboxRowView } from "./api/studioDiscovery.adapters";
import { useStudioCreditInbox } from "./api/useStudioCreditInbox";
import {
  useAcceptStudioCredit,
  useDeclineStudioCredit,
  useRemoveAcceptedStudioCredit,
} from "./api/useStudioCreditInboxMutations";
import { StudioCreatorShell } from "./StudioCreatorShell";
import { StudioCreditInboxSection } from "./StudioCreditInboxSection";
import { StudioDetailSkeleton, StudioLoadError } from "./StudioLoadStates";
import { studioErrorMessageKeyOf } from "./studioErrors.data";
import creatorStyles from "./creator.module.css";
import css from "./StudioCredits.module.css";

/** /studio/credits: credit requests and accepted credits for every persona
 *  the member owns or co-owns. Accept, decline and remove settle in place;
 *  a section heading that is still on screen takes focus when a row
 *  leaves. */
export function StudioCreditsPage() {
  const { t } = useTranslation();
  const { inbox, loadState } = useStudioCreditInbox();
  const accept = useAcceptStudioCredit();
  const decline = useDeclineStudioCredit();
  const removeAccepted = useRemoveAcceptedStudioCredit();
  const requestsHeadingRef = useRef<HTMLHeadingElement>(null);
  const acceptedHeadingRef = useRef<HTMLHeadingElement>(null);
  const [statusMessage, setStatusMessage] = useState("");
  // The last error stays through the alert's exit so the box never empties
  // as it folds; `sequence` remounts the alert so a repeat is read again.
  const [error, setError] = useState<{
    key: string;
    sequence: number;
    isShown: boolean;
  } | null>(null);
  const [removeTarget, setRemoveTarget] =
    useState<StudioCreditInboxRowView | null>(null);
  const isBusy =
    accept.isPending || decline.isPending || removeAccepted.isPending;

  /** Runs one inbox action. A settled error (someone else answered first)
   *  drops the row as well, so focus goes where a heading still is; any
   *  other error leaves the row and focus in place when `focusAfter`
   *  answers null. The
   *  remove confirmation stays up until the request settles, then closes
   *  as focus moves to the heading, so its focus hand back never reaches a
   *  row that is fading out. */
  async function settle({
    action,
    successKey,
    goneKey,
    focusAfter,
  }: {
    action: () => Promise<unknown>;
    successKey: string;
    /** The line for a credit another co-owner already settled. */
    goneKey: string;
    focusAfter: (
      isRowGone: boolean,
    ) => RefObject<HTMLHeadingElement | null> | null;
  }) {
    if (isBusy) return;
    setError((current) => current && { ...current, isShown: false });
    // Emptied first, so a repeat of the same success is announced again.
    setStatusMessage("");
    let isRowGone: boolean;
    try {
      await action();
      isRowGone = true;
      setStatusMessage(t(successKey));
    } catch (caught) {
      isRowGone = isSettledCreditError(caught);
      const key = isRowGone ? goneKey : studioErrorMessageKeyOf(caught);
      setError((current) => ({
        key,
        sequence: (current?.sequence ?? 0) + 1,
        isShown: true,
      }));
    }
    setRemoveTarget(null);
    focusAfter(isRowGone)?.current?.focus();
  }

  function confirmRemove() {
    const row = removeTarget;
    if (!row || !inbox) return;
    const isLastAccepted = inbox.accepted.length === 1;
    void settle({
      action: () => removeAccepted.mutateAsync({ row }),
      successKey: "studio:credits.inbox.toast.removed",
      // A 404 or `studio_credit_not_accepted` on remove: already removed.
      goneKey: "studio:credits.inbox.removeGone",
      // Leaving with the last accepted credit folds Accepted away, so
      // focus goes up to Requests; a row that stays keeps it in Accepted.
      focusAfter: (isRowGone) =>
        isRowGone && isLastAccepted ? requestsHeadingRef : acceptedHeadingRef,
    });
  }

  let body: ReactNode;
  if (loadState.isError)
    body = (
      <StudioLoadError
        loadState={loadState}
        what="studio:errors.what.creditsInbox"
      />
    );
  else if (!inbox) body = <StudioDetailSkeleton />;
  else
    body = (
      <>
        <StudioCreditInboxSection
          titleKey="studio:credits.inbox.requests.title"
          rows={inbox.requests}
          headingRef={requestsHeadingRef}
          isBusy={isBusy}
          emptyState={
            <Collapse isOpen={inbox.requests.length === 0}>
              <EmptyState
                icon={<FiAward />}
                title={t("studio:credits.inbox.empty.title")}
                description={t("studio:credits.inbox.empty.body")}
                headingLevel={3}
              />
            </Collapse>
          }
          onAccept={(row) =>
            void settle({
              action: () => accept.mutateAsync({ row }),
              successKey: "studio:credits.inbox.toast.accepted",
              goneKey: "studio:credits.inbox.gone",
              focusAfter: (isRowGone) =>
                isRowGone ? requestsHeadingRef : null,
            })
          }
          onDecline={(row) =>
            void settle({
              action: () => decline.mutateAsync({ row }),
              successKey: "studio:credits.inbox.toast.declined",
              goneKey: "studio:credits.inbox.gone",
              focusAfter: (isRowGone) =>
                isRowGone ? requestsHeadingRef : null,
            })
          }
        />
        <Collapse isOpen={inbox.accepted.length > 0}>
          <StudioCreditInboxSection
            titleKey="studio:credits.inbox.accepted.title"
            rows={inbox.accepted}
            headingRef={acceptedHeadingRef}
            isBusy={isBusy}
            onRemove={setRemoveTarget}
          />
        </Collapse>
      </>
    );

  return (
    <StudioCreatorShell>
      <div className={creatorStyles.hero}>
        <div className={creatorStyles.heroInner}>
          <div className={creatorStyles.eb}>
            {t("studio:credits.page.eyebrow")}
          </div>
          <h1>
            <Translation
              i18nKey="studio:credits.page.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={creatorStyles.sub}>{t("studio:credits.page.sub")}</p>
        </div>
      </div>
      <div className={css.body}>
        <Collapse isOpen={error?.isShown ?? false}>
          <p key={error?.sequence} className={css.error} role="alert">
            {error ? t(error.key) : null}
          </p>
        </Collapse>
        {body}
      </div>
      <p className="visuallyHidden" role="status">
        {statusMessage}
      </p>
      <AnimatePresence>
        {removeTarget && (
          <ConfirmDialog
            open
            onClose={() => {
              if (!removeAccepted.isPending) setRemoveTarget(null);
            }}
            onConfirm={confirmRemove}
            loading={isBusy}
            title={t("studio:credits.inbox.confirmRemove.title")}
            description={t("studio:credits.inbox.confirmRemove.body", {
              persona: removeTarget.creditedPersona.name,
              track: removeTarget.track.title,
            })}
            confirmLabel={t("studio:credits.removeCta")}
            tone="destructive"
          />
        )}
      </AnimatePresence>
    </StudioCreatorShell>
  );
}
