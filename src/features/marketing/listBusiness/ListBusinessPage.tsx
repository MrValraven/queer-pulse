import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { PageShell } from "../../../shared/components/layout";
import { EmptyState, SkeletonCard } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ListingWizard } from "./ListingWizard";
import { ListingEditor } from "./editor/ListingEditor";
import { SavedDraftsPanel, type ResumeTarget } from "./SavedDraftsPanel";
import { useOwnedListing } from "./api/useListings";
import { useResumeListingDraft } from "./api/useListingDrafts";
import styles from "./ListBusinessPage.module.css";

export function ListBusinessPage() {
  const { ref } = useParams();
  const { t } = useTranslation();
  const editing = Boolean(ref);

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
          {!editing && (
            <p className={styles.lead}>
              <Translation
                i18nKey="marketing:listBusiness.hero.lead"
                components={{ b: <b /> }}
              />
            </p>
          )}
        </div>
      </header>

      {ref ? <EditListingGate editRef={ref} /> : <CreateListingFlow />}
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

/**
 * The create flow, including cross-device drafts (item #11). A `?draft=<token>`
 * deep link resolves to its draft and seeds the wizard; otherwise the member's
 * saved drafts are offered above a fresh wizard, and resuming one remounts the
 * wizard seeded with it.
 */
function CreateListingFlow() {
  const [searchParams] = useSearchParams();
  const { demoMode } = useDemoMode();
  const token = searchParams.get("draft");
  // Deep-link resume is a live, cross-device mechanism — demo has no server
  // tokens, so a `?draft` in demo just falls through to the normal landing.
  if (token && !demoMode) return <ResumeByToken token={token} />;
  return <FreshListingFlow />;
}

/** Live deep-link resume: load the draft behind a `?draft` token, then seed. */
function ResumeByToken({ token }: { token: string }) {
  const { t } = useTranslation();
  const { record, isLoading, error } = useResumeListingDraft(token);

  if (isLoading) return <WizardLoadingFrame />;

  if (error || !record) {
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

  return (
    <ListingWizard
      initialDraft={record.payload.draft}
      initialStep={record.payload.step}
      initialDraftId={record.id}
    />
  );
}

/** The normal landing: saved-drafts panel above a fresh (or resumed) wizard. */
function FreshListingFlow() {
  const [resumed, setResumed] = useState<ResumeTarget | null>(null);
  const [resumeSeq, setResumeSeq] = useState(0);

  const handleResume = (target: ResumeTarget) => {
    setResumed(target);
    // Bump the wizard's key so it remounts seeded with the resumed draft.
    setResumeSeq((sequence) => sequence + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <SavedDraftsPanel onResume={handleResume} />
      <ListingWizard
        key={resumed ? `resume-${resumeSeq}` : "fresh"}
        initialDraft={resumed?.draft}
        initialStep={resumed?.step}
        initialDraftId={resumed?.id}
      />
    </>
  );
}

/** Loads the owner's listing before mounting the editor: a clean
 *  loading/blocked state instead of a blank or default-create form. Editing is
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
