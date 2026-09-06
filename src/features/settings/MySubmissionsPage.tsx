import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiBookOpen, FiInbox, FiRepeat } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import { EmptyState } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMyPartnerApplications } from "../marketing/api/partnerApplicationMine.hooks";
import { useMyPartners } from "../marketing/api/useMyPartners";
import { useMySentBarterProposals } from "../economy/api/useBarter";
import {
  useMyResourceSuggestions,
  type MyResourceSuggestionsResult,
} from "../resources/api/useMyResourceSuggestions";
import {
  BarterProposalRow,
  PartnerApplicationRow,
  ResourceSuggestionRow,
} from "./MySubmissionsRows";
import { SubmissionSection } from "./MySubmissionsSections";
import styles from "./MySubmissionsPage.module.css";

/**
 * Resource suggestions, with a demo fixture behind them.
 *
 * `useMyResourceSuggestions` is deliberately `enabled: !demoMode` and answers
 * an empty list in demo, and it stays that way: a live hook that fabricates
 * rows is how mock data reaches a real member. So the demo rows come from a
 * colocated fixture pulled in by dynamic import, which never executes on the
 * live path and never ships in the live chunk.
 *
 * Both hooks are called unconditionally, and only the result is chosen.
 */
function useSubmittedResourceSuggestions(): MyResourceSuggestionsResult {
  const { demoMode } = useDemoMode();
  const liveResult = useMyResourceSuggestions();
  const demoQuery = useQuery({
    queryKey: ["my-submissions", "demo-resource-suggestions"],
    enabled: demoMode,
    queryFn: async () => {
      const { DEMO_MY_RESOURCE_SUGGESTIONS } =
        await import("./MySubmissions.demo.data");
      return DEMO_MY_RESOURCE_SUGGESTIONS;
    },
  });
  if (!demoMode) return liveResult;
  return {
    suggestions: demoQuery.data ?? [],
    isLoading: demoQuery.isLoading,
    isError: demoQuery.isError,
    refetch: () => void demoQuery.refetch(),
  };
}

/**
 * PRD-48: one page that answers "what did I send in, and what happened to it?"
 * across every vertical that takes a submission.
 *
 * The finding this closes is not any one of the three silent intakes. It is
 * that there was no shared idea of a submission at all: partner applications,
 * barter proposals and resource suggestions each grew their own entity, their
 * own status words and their own decision endpoint, and whether the person who
 * submitted ever heard back was settled case by case. That is why three
 * identical black holes had to be found as three separate findings. This page
 * is the member-facing half of the fix, and it is what a fourth intake gets
 * added to instead of shipping into the same hole.
 *
 * Three sources, three independent queries, three independent states. If the
 * resource-suggestions call fails, the partner applications still render: a
 * single combined error that blanked the page would be the same silent-failure
 * shape the whole audit was about, one level up.
 *
 * Nothing here promises an email. QueerPulse sends none and never will, so the
 * only two channels a decision has are the bell and this page, and the copy
 * says exactly that.
 */
export function MySubmissionsPage() {
  const { t } = useTranslation();
  const { loggedIn, checking } = useAuth();

  // `GET /partner-applications/mine` sits behind `ActiveMemberGuard`, so it is
  // parked until the session is settled rather than 401ing on the way in.
  const partnerApplicationsQuery = useMyPartnerApplications({
    enabled: loggedIn && !checking,
  });
  const barterProposalsQuery = useMySentBarterProposals();
  const resourceSuggestionsResult = useSubmittedResourceSuggestions();

  const partnerApplications = partnerApplicationsQuery.data ?? [];
  // PRD-263. Gates the "manage your partner profile" link below. Same
  // `enabled` guard as the applications query: `GET /my-partners` sits behind
  // `ActiveMemberGuard` and 401s before the session settles.
  const ownedPartnersQuery = useMyPartners({ enabled: !checking });
  const ownedPartners = ownedPartnersQuery.data ?? [];
  const barterProposals = barterProposalsQuery.data ?? [];
  const resourceSuggestions = resourceSuggestionsResult.suggestions;

  // A parked query reports `isLoading: false` with no data, which reads exactly
  // like "you have never applied". While the session is still being determined
  // the section keeps its skeleton instead, so a slow `/auth/me` can never be
  // rendered as an empty history.
  const isPartnerApplicationsLoading =
    checking || partnerApplicationsQuery.isLoading;

  const isAnyLoading =
    isPartnerApplicationsLoading ||
    barterProposalsQuery.isLoading ||
    resourceSuggestionsResult.isLoading;
  const isAnyError =
    partnerApplicationsQuery.isError ||
    barterProposalsQuery.isError ||
    resourceSuggestionsResult.isError;
  // One honest empty state for a member who has never submitted anything, in
  // place of three stacked "nothing here" panels. It is only shown once every
  // source has answered AND every source succeeded, so a page that failed to
  // load is never mistaken for a page with nothing on it.
  const isEverythingEmpty =
    !isAnyLoading &&
    !isAnyError &&
    partnerApplications.length === 0 &&
    barterProposals.length === 0 &&
    resourceSuggestions.length === 0;

  return (
    <AppShell>
      <div className={styles.page}>
        <Link to={`${routes.settings}?pane=account`} className={styles.back}>
          <FiArrowLeft aria-hidden />{" "}
          {t("settings:mySubmissions.backToAccount")}
        </Link>

        <header className={styles.head}>
          <div className={styles.eyebrow}>
            {t("settings:mySubmissions.eyebrow")}
          </div>
          <h1 className={styles.title}>
            <Translation
              i18nKey="settings:mySubmissions.h1"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.sub}>{t("settings:mySubmissions.lead")}</p>
        </header>

        {isEverythingEmpty ? (
          <EmptyState
            icon={<FiInbox />}
            title={t("settings:mySubmissions.emptyAll.title")}
            description={t("settings:mySubmissions.emptyAll.description")}
          />
        ) : (
          <>
            <SubmissionSection
              heading={t("settings:mySubmissions.partner.heading")}
              isLoading={isPartnerApplicationsLoading}
              isError={partnerApplicationsQuery.isError}
              isEmpty={partnerApplications.length === 0}
              onRetry={() => void partnerApplicationsQuery.refetch()}
              errorTitle={t("settings:mySubmissions.partner.error.title")}
              errorDescription={t(
                "settings:mySubmissions.partner.error.description",
              )}
              emptyIcon={<FiInbox />}
              emptyTitle={t("settings:mySubmissions.partner.empty.title")}
              emptyDescription={t(
                "settings:mySubmissions.partner.empty.description",
              )}
            >
              {partnerApplications.map((application) => (
                <PartnerApplicationRow
                  key={application.id}
                  application={application}
                />
              ))}
              {/* PRD-263. The way in to the partner's own profile editor. It
                  belongs here because this is where an approved application
                  already ends up, and "approved" is exactly the moment the
                  organisation stops waiting on staff and starts owning a
                  public page. Rendered only when the member actually
                  maintains one, so it never advertises a door that would
                  open on an empty room. */}
              {ownedPartners.length > 0 && (
                <p className={styles.sectionAside}>
                  <Link to={routes.partnerProfileEdit}>
                    {t("settings:mySubmissions.partner.manageProfileCta")}
                  </Link>
                </p>
              )}
            </SubmissionSection>

            <SubmissionSection
              heading={t("settings:mySubmissions.barter.heading")}
              isLoading={barterProposalsQuery.isLoading}
              isError={barterProposalsQuery.isError}
              isEmpty={barterProposals.length === 0}
              onRetry={() => void barterProposalsQuery.refetch()}
              errorTitle={t("settings:mySubmissions.barter.error.title")}
              errorDescription={t(
                "settings:mySubmissions.barter.error.description",
              )}
              emptyIcon={<FiRepeat />}
              emptyTitle={t("settings:mySubmissions.barter.empty.title")}
              emptyDescription={t(
                "settings:mySubmissions.barter.empty.description",
              )}
            >
              {barterProposals.map((proposal) => (
                <BarterProposalRow key={proposal.id} proposal={proposal} />
              ))}
            </SubmissionSection>

            <SubmissionSection
              heading={t("settings:mySubmissions.resource.heading")}
              isLoading={resourceSuggestionsResult.isLoading}
              isError={resourceSuggestionsResult.isError}
              isEmpty={resourceSuggestions.length === 0}
              onRetry={resourceSuggestionsResult.refetch}
              errorTitle={t("settings:mySubmissions.resource.error.title")}
              errorDescription={t(
                "settings:mySubmissions.resource.error.description",
              )}
              emptyIcon={<FiBookOpen />}
              emptyTitle={t("settings:mySubmissions.resource.empty.title")}
              emptyDescription={t(
                "settings:mySubmissions.resource.empty.description",
              )}
            >
              {resourceSuggestions.map((suggestion) => (
                <ResourceSuggestionRow
                  key={suggestion.id}
                  suggestion={suggestion}
                />
              ))}
            </SubmissionSection>
          </>
        )}

        <p className={styles.footNote}>
          {t("settings:mySubmissions.footNote")}
        </p>
      </div>
    </AppShell>
  );
}
