import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  Link,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { PageShell } from "../../../shared/components/layout";
import {
  Collapse,
  EmptyState,
  SkeletonCard,
} from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { ApiError } from "../../../shared/api/client";
import {
  causeErrorKey,
  SHARED_CAUSE_KEY,
  type CauseErrorCopy,
} from "../../../shared/api/causeErrorKey";
import { ListingWizard } from "./ListingWizard";
import { ListingEditor } from "./editor/ListingEditor";
import {
  ContinueDraftsScreen,
  DraftsLoadErrorLine,
} from "./ContinueDraftsScreen";
import { clampDraftStep } from "./draftProgress";
import { clearDemoDraft, readDemoDraft } from "./useListingDraft";
import {
  DEMO_CONTINUE_ID,
  demoDraftItem,
  useLiveContinueDrafts,
  useReportContinueScreen,
  useScrollToWizardOnModeSwitch,
  type FlowMode,
  type WizardSeed,
} from "./useContinueDrafts";
import { useOwnedListing } from "./api/useListings";
import {
  useListingDraftRecord,
  useResumeListingDraft,
} from "./api/useListingDrafts";
import type { ListingDraftRecord } from "./api/listingDrafts.api";
import styles from "./ListBusinessPage.module.css";

/** Tells the page the Continue screen came up (see `useReportContinueScreen`).
 *  Optional at every level below the page. */
type ContinueScreenReporter = () => void;

/** Demo decides synchronously, so the page can know before its first paint
 *  that the Continue screen is coming: a plain visit (no `?continue=demo`)
 *  with a saved demo draft. */
function isDemoContinueScreenFirst(
  isDemoMode: boolean,
  continueParam: string | null,
): boolean {
  return (
    isDemoMode && continueParam !== DEMO_CONTINUE_ID && readDemoDraft() !== null
  );
}

export function ListBusinessPage() {
  const { ref } = useParams();
  const { t } = useTranslation();
  const editing = Boolean(ref);
  const { demoMode } = useDemoMode();
  const [searchParams] = useSearchParams();
  // The Continue screen drops the hero lead, so Continue sits above the fold
  // on a phone; the title and the back link stay. Latched for the mount: the
  // lead never comes back above the wizard the screen opens, so the scroll to
  // the wizard's step line is never pushed down by a growing lead.
  const [hasShownContinueScreen, setHasShownContinueScreen] = useState(() =>
    isDemoContinueScreenFirst(demoMode, searchParams.get("continue")),
  );
  const markContinueScreenShown = useCallback(
    () => setHasShownContinueScreen(true),
    [],
  );

  return (
    <PageShell>
      <header className={styles.hero}>
        <div className={`${styles.heroInner} wrap`}>
          <Link to={routes.directory} className={styles.back}>
            <FiArrowLeft size={14} /> {t("marketing:listBusiness.hero.backCta")}
          </Link>
          <div className={styles.eyebrow}>
            {t("marketing:listBusiness.hero.eyebrow")}
          </div>
          <h1 className={styles.h1}>
            {editing ? (
              t("marketing:listBusiness.edit.title")
            ) : (
              <Translation
                i18nKey="marketing:listBusiness.hero.title"
                components={{ em: <em /> }}
              />
            )}
          </h1>
          <Collapse isOpen={!editing && !hasShownContinueScreen}>
            <p className={styles.lead}>
              <Translation
                i18nKey="marketing:listBusiness.hero.lead"
                components={{ b: <b /> }}
              />
            </p>
          </Collapse>
        </div>
      </header>

      {ref ? (
        <EditListingGate editRef={ref} />
      ) : (
        <CreateListingFlow onContinueScreenShown={markContinueScreenShown} />
      )}
    </PageShell>
  );
}

/** A skeleton in the wizard's page frame, reused while a resume link resolves. */
function WizardLoadingFrame() {
  return (
    <div className="wrap">
      <div className={styles.page}>
        <SkeletonCard />
      </div>
    </div>
  );
}

/** Navigation state marking the replace that strips a consumed draft link. */
interface DraftLinkState {
  isDraftLinkConsumed?: boolean;
}

/**
 * The `?draft` and `?continue` values the flow acts on. Latched, so stripping
 * them from the URL once the draft is open (`useStripDraftLinkParams`) keeps
 * the open wizard mounted. Any other navigation is followed as written: a new
 * link opens its draft, and a plain visit to the page goes back to the
 * landing.
 */
function useDraftLinkParams() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const token = searchParams.get("draft");
  const continueId = searchParams.get("continue");
  const [linkParams, setLinkParams] = useState({ token, continueId });
  const isConsumedLink =
    (location.state as DraftLinkState | null)?.isDraftLinkConsumed === true;
  const hasChanged =
    token !== linkParams.token || continueId !== linkParams.continueId;
  if (hasChanged && !isConsumedLink) setLinkParams({ token, continueId });
  return hasChanged && !isConsumedLink ? { token, continueId } : linkParams;
}

/** Once a link's draft is open, drop `?continue` and `?draft` from the URL in
 *  place, so a reload or a shared URL does not reopen a finished draft. */
function useStripDraftLinkParams(isDraftOpen: boolean) {
  const [searchParams, setSearchParams] = useSearchParams();
  const hasLinkParams =
    searchParams.has("continue") || searchParams.has("draft");
  useEffect(() => {
    if (!isDraftOpen || !hasLinkParams) return;
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete("continue");
        next.delete("draft");
        return next;
      },
      { replace: true, state: { isDraftLinkConsumed: true } },
    );
  }, [isDraftOpen, hasLinkParams, setSearchParams]);
}

/**
 * The create flow, including cross-device drafts (item #11).
 *
 * - `?draft=<token>` (live): the token's draft opens in the wizard.
 * - `?continue=<id>` (live): that owned draft opens in the wizard. The
 *   directory CTA links here when it names a single draft, so the member lands
 *   in it with no second tap. Demo uses `?continue=demo` for its one
 *   localStorage draft.
 * - Otherwise the landing decides between the Continue screen and the wizard.
 */
function CreateListingFlow({
  onContinueScreenShown,
}: {
  onContinueScreenShown?: ContinueScreenReporter;
}) {
  const { demoMode } = useDemoMode();
  const { token, continueId } = useDraftLinkParams();
  const landing = (
    <FreshListingFlow onContinueScreenShown={onContinueScreenShown} />
  );
  // Demo has no server tokens or rows: a `?draft` falls through to the
  // landing, and only `?continue=demo` names its single localStorage draft.
  if (demoMode) {
    return continueId === DEMO_CONTINUE_ID ? (
      <DemoContinue landing={landing} />
    ) : (
      landing
    );
  }
  // Keyed by the link, so a new link in the same mount opens its own draft.
  if (token) return <ResumeByToken key={token} token={token} />;
  if (continueId) return <ResumeById key={continueId} draftId={continueId} />;
  return landing;
}

/** A draft link that no longer opens anything: submitted, deleted, expired,
 *  or someone else's. Offers a fresh start. */
function InvalidDraftLink() {
  const { t } = useTranslation();
  return (
    <div className="wrap">
      <div className={styles.page}>
        <EmptyState
          title={t("marketing:listBusiness.resume.invalidTitle")}
          description={t("marketing:listBusiness.resume.invalidBody")}
          action={{
            label: t("marketing:listBusiness.resume.startFresh"),
            to: routes.listBusiness,
          }}
        />
      </div>
    </div>
  );
}

/** The fetch failed in a way that may pass (offline, timeout, a server
 *  fault, a lapsed session): says so with the cause, offers a retry when one
 *  can help, and a way to the landing. */
function DraftOpenError({
  cause,
  onRetry,
}: {
  cause: CauseErrorCopy;
  onRetry?: () => void;
}) {
  const { t } = useTranslation();
  const toLanding = {
    label: t("marketing:listBusiness.resume.startFresh"),
    to: routes.listBusiness,
  };
  return (
    <div className="wrap">
      <div className={styles.page}>
        <EmptyState
          title={t("marketing:listBusiness.drafts.openError")}
          description={t(cause.key, cause.values)}
          action={
            onRetry
              ? { label: t("common:error.retry"), onClick: onRetry }
              : toLanding
          }
          secondaryAction={onRetry ? toLanding : undefined}
        />
      </div>
    </div>
  );
}

/** A link that will never open: the draft is gone or someone else's (404,
 *  403), or the id is malformed (400). */
function isDeadDraftLink(error: unknown): boolean {
  return error instanceof ApiError && [400, 403, 404].includes(error.status);
}

interface DraftLinkFetch {
  record: ListingDraftRecord | undefined;
  isLoading: boolean;
  /** Waiting for the connection to come back. */
  isPaused: boolean;
  /** The query is off because nobody is signed in. */
  isSignedOut: boolean;
  error: unknown;
  retry: () => void;
}

/**
 * Seeds the wizard with a draft fetched for a link. The first record that
 * arrives once the fetch settles is kept for the rest of the mount: submitting
 * deletes the row and refreshes every drafts query, and that refetch failing
 * must not swap the success panel for the "no longer valid" state. Once the
 * draft is open, the link's params leave the URL. Only a dead link shows "no
 * longer valid"; any other failure names its cause.
 */
function ResumedDraftWizard({
  record,
  isLoading,
  isPaused,
  isSignedOut,
  error,
  retry,
}: DraftLinkFetch) {
  const [openedRecord, setOpenedRecord] = useState<ListingDraftRecord | null>(
    null,
  );
  const readyRecord = !isLoading && !error ? record : undefined;
  if (openedRecord === null && readyRecord) setOpenedRecord(readyRecord);
  const recordToOpen = openedRecord ?? readyRecord;
  useStripDraftLinkParams(openedRecord !== null);

  if (recordToOpen) {
    return (
      <ListingWizard
        initialDraft={recordToOpen.payload.draft}
        initialStep={clampDraftStep(recordToOpen.payload.step)}
        initialDraftId={recordToOpen.id}
      />
    );
  }
  if (isLoading) return <WizardLoadingFrame />;
  if (isDeadDraftLink(error)) return <InvalidDraftLink />;
  if (error)
    return <DraftOpenError cause={causeErrorKey(error)} onRetry={retry} />;
  if (isPaused) {
    return (
      <DraftOpenError
        cause={{ key: SHARED_CAUSE_KEY.noConnection }}
        onRetry={retry}
      />
    );
  }
  if (isSignedOut)
    return <DraftOpenError cause={{ key: SHARED_CAUSE_KEY.signedOut }} />;
  return <InvalidDraftLink />;
}

/** Live deep-link resume: load the draft behind a `?draft` token, then seed. */
function ResumeByToken({ token }: { token: string }) {
  const { checking, loggedIn } = useAuth();
  const linkFetch = useResumeListingDraft(token);
  return (
    <ResumedDraftWizard
      {...linkFetch}
      isLoading={checking || linkFetch.isFetching}
      isSignedOut={!checking && !loggedIn}
    />
  );
}

/** Live `?continue=<id>`: open that owned draft straight in the wizard. */
function ResumeById({ draftId }: { draftId: string }) {
  const { checking, loggedIn } = useAuth();
  const linkFetch = useListingDraftRecord(draftId);
  return (
    <ResumedDraftWizard
      {...linkFetch}
      isLoading={checking || linkFetch.isFetching}
      isSignedOut={!checking && !loggedIn}
    />
  );
}

/** Demo `?continue=demo`: the localStorage draft in the wizard, or the normal
 *  landing when there is none. */
function DemoContinue({ landing }: { landing: ReactNode }) {
  const [snapshot] = useState(readDemoDraft);
  useStripDraftLinkParams(snapshot !== null);
  if (!snapshot) return landing;
  return (
    <ListingWizard
      initialDraft={snapshot.draft}
      initialStep={clampDraftStep(snapshot.step)}
    />
  );
}

/** The normal landing: the Continue screen when drafts exist, else the
 *  wizard. Each mode keeps its own source of drafts. */
function FreshListingFlow({
  onContinueScreenShown,
}: {
  onContinueScreenShown?: ContinueScreenReporter;
}) {
  const { demoMode } = useDemoMode();
  return demoMode ? (
    <DemoFreshListingFlow onContinueScreenShown={onContinueScreenShown} />
  ) : (
    <LiveFreshListingFlow onContinueScreenShown={onContinueScreenShown} />
  );
}

/** The wizard, seeded by a Continue or blank for a fresh start. */
function SeededWizard({ seed }: { seed: WizardSeed | null }) {
  return (
    <ListingWizard
      initialDraft={seed?.draft}
      initialStep={seed?.step}
      initialDraftId={seed?.id}
    />
  );
}

/** Demo landing: decided at once from the single localStorage draft. The demo
 *  keeps one draft slot, so starting over deletes it first, after a confirm. */
function DemoFreshListingFlow({
  onContinueScreenShown,
}: {
  onContinueScreenShown?: ContinueScreenReporter;
}) {
  const [snapshot, setSnapshot] = useState(readDemoDraft);
  const [mode, setMode] = useState<FlowMode>(() =>
    snapshot ? "choosing" : "wizard",
  );
  const [seed, setSeed] = useState<WizardSeed | null>(null);
  useScrollToWizardOnModeSwitch(mode);
  useReportContinueScreen(mode, onContinueScreenShown);

  if (mode === "choosing") {
    return (
      <ContinueDraftsScreen
        drafts={snapshot ? [demoDraftItem(snapshot)] : []}
        resumingId={null}
        startOverAction="deleteAndStartOver"
        onContinue={() => {
          if (!snapshot) return;
          setSeed({
            draft: snapshot.draft,
            step: clampDraftStep(snapshot.step),
          });
          setMode("wizard");
        }}
        onDelete={() => {
          clearDemoDraft();
          setSnapshot(null);
        }}
        onAllDraftsGone={() => setMode("wizard")}
        onStartAnother={() => {
          clearDemoDraft();
          setSnapshot(null);
          setMode("wizard");
        }}
      />
    );
  }
  return <SeededWizard seed={seed} />;
}

/** Live landing: a skeleton while the drafts list settles, then the Continue
 *  screen or the wizard, latched for the mount (see `useLiveContinueDrafts`). */
function LiveFreshListingFlow({
  onContinueScreenShown,
}: {
  onContinueScreenShown?: ContinueScreenReporter;
}) {
  const flow = useLiveContinueDrafts();
  useScrollToWizardOnModeSwitch(flow.mode);
  useReportContinueScreen(flow.mode, onContinueScreenShown);

  if (flow.mode === "deciding") return <WizardLoadingFrame />;
  if (flow.mode === "choosing") {
    return (
      <ContinueDraftsScreen
        drafts={flow.items}
        resumingId={flow.resumingId}
        deletingId={flow.deletingId}
        errorLine={flow.errorLine}
        statusLine={flow.statusLine}
        onContinue={flow.continueDraft}
        onDelete={flow.deleteDraft}
        onAllDraftsGone={flow.finishWhenAllGone}
        onStartAnother={flow.startAnother}
      />
    );
  }
  return (
    <>
      {flow.wizardLine !== null && (
        <DraftsLoadErrorLine line={flow.wizardLine} />
      )}
      <SeededWizard seed={flow.seed} />
    </>
  );
}

/** Loads the owner's listing before mounting the editor: a clean
 *  loading/blocked state, so the page never shows a blank or default-create
 *  form while the listing loads. Editing is
 *  a single scrollable page: an owner usually arrives to change one line, and
 *  a guided six-step sequence makes that a walk. */
function EditListingGate({ editRef }: { editRef: string }) {
  const { t } = useTranslation();
  const { listing, isLoading, error } = useOwnedListing(editRef);

  if (isLoading) {
    return (
      <div className="wrap">
        <div className={styles.page}>
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="wrap">
        <div className={styles.page}>
          <EmptyState
            title={t("marketing:listBusiness.edit.notAllowed")}
            action={{
              label: t("marketing:listBusiness.hero.backCta"),
              to: routes.directory,
            }}
          />
        </div>
      </div>
    );
  }

  return <ListingEditor listing={listing} />;
}
