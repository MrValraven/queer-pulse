import { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { Link, Navigate, useParams } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { useSaved } from "../../app/providers/useSaved";
import { PageShell } from "../../shared/components/layout";
import { FadeIn } from "../../shared/components/ui";
import { ApiError } from "../../shared/api/client";
import { useSimulatedLoad } from "../../shared/hooks";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useLandlord } from "./api/useLandlord";
import { useRequestIntro } from "./api/useRequestIntro";
import { WithdrawRecommendationDialog } from "./WithdrawRecommendationDialog";
import { RecommendModal } from "./HousingModals";
import { ContactRequestModal } from "./ContactRequestModal";
import { LandlordSkeleton } from "./LandlordSkeleton";
import { ReportListingModal } from "./ReportListingModal";
import {
  LandlordHero,
  LandlordAbout,
  LandlordAreas,
  LandlordError,
  LandlordRecommendations,
  LandlordSidebar,
} from "./LandlordSections";
import s from "./LandlordPage.module.css";

export function LandlordPage() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const { showToast } = useToast();
  const { user } = useAuth();
  const { isSaved, toggleSave } = useSaved();
  const [recommending, setRecommending] = useState(false);
  const [introducing, setIntroducing] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [isConfirmingWithdraw, setIsConfirmingWithdraw] = useState(false);
  const { demoMode } = useDemoMode();
  // `useSimulatedLoad` is a DEMO device (ENG-172). Demo mode hands
  // `useLandlord` its fixture as `initialData`, so the query is never pending
  // there and the short fake beat is the only loading state the prototype has.
  // Live mode has a real `isLoading`, and the fake 600ms sat on top of it,
  // painting a skeleton over a profile that had already arrived.
  const isSimulatedLoading = useSimulatedLoad();
  const simulatedLoad = demoMode && isSimulatedLoading;
  const {
    data: landlord,
    isLoading,
    isError,
    error,
    refetch,
  } = useLandlord(slug);
  const requestIntro = useRequestIntro(slug ?? "");
  const memberName = user
    ? `${user.profile.firstName} ${user.profile.lastName}`.trim() ||
      t("economy:landlordPage.intro.fallbackName")
    : t("economy:landlordPage.intro.fallbackName");

  if (isLoading || simulatedLoad) {
    return (
      <PageShell>
        <div className={s.page}>
          <Link to={routes.housing} className={s.back}>
            <FiArrowLeft aria-hidden /> {t("economy:housingListing.back")}
          </Link>
          <LandlordSkeleton />
        </div>
      </PageShell>
    );
  }

  // Only a genuine 404 (or a demo slug that simply doesn't exist, where
  // `initialData` is null with no error) means "not found" and earns the
  // redirect. Any OTHER failure, a network drop, a timeout, a 5xx, keeps the
  // member here with a retry instead of silently bouncing them to the board
  // (PRD-248).
  const isNotFound =
    (error instanceof ApiError && error.status === 404) ||
    (!isError && !landlord);
  if (isNotFound) return <Navigate to={routes.housing} replace />;

  if (isError || !landlord) {
    return (
      <PageShell>
        <div className={s.page}>
          <Link to={routes.housing} className={s.back}>
            <FiArrowLeft aria-hidden /> {t("economy:housingListing.back")}
          </Link>
          <LandlordError onRetry={() => void refetch()} />
        </div>
      </PageShell>
    );
  }

  const firstName = landlord.name.split(" ")[0];
  const savedId = `landlord:${landlord.slug}`;
  const saved = isSaved(savedId);
  const savedTitle = landlord.name;
  const savedHref = `/work/landlord/${landlord.slug}`;
  const savedMeta = landlord.hood;

  function handleToggleSave() {
    const now = toggleSave({
      id: savedId,
      kind: "landlord",
      title: savedTitle,
      href: savedHref,
      meta: savedMeta,
    });
    showToast(
      t(
        now
          ? "economy:landlordPage.savedToast"
          : "economy:landlordPage.unsavedToast",
        { name: savedTitle },
      ),
      now ? "success" : "info",
    );
  }

  return (
    <PageShell>
      <div className={s.page}>
        <Link to={routes.housing} className={s.back}>
          <FiArrowLeft aria-hidden /> {t("economy:housingListing.back")}
        </Link>

        <FadeIn>
          <LandlordHero
            landlord={landlord}
            saved={saved}
            onToggleSave={handleToggleSave}
            onReport={() => setReporting(true)}
            onRecommend={() => setRecommending(true)}
          />

          <div className={s.grid}>
            <div>
              <LandlordAbout landlord={landlord} />
              <LandlordAreas landlord={landlord} />
              <LandlordRecommendations
                landlord={landlord}
                onWithdrawMine={() => setIsConfirmingWithdraw(true)}
              />
            </div>

            <LandlordSidebar
              landlord={landlord}
              onRecommend={() => setRecommending(true)}
              onRequestIntro={() => setIntroducing(true)}
            />
          </div>
        </FadeIn>
      </div>

      {recommending && (
        <RecommendModal
          slug={landlord.slug}
          landlordName={landlord.name}
          onClose={() => setRecommending(false)}
          onSubmitted={(stars) =>
            showToast(
              t("economy:landlordPage.toast.recommended", { count: stars }),
              "success",
            )
          }
        />
      )}

      {introducing && (
        <ContactRequestModal
          toName={landlord.name}
          eyebrow={t("economy:landlordPage.intro.eyebrow")}
          title={t("economy:landlordPage.intro.title")}
          em={t("economy:landlordPage.intro.em")}
          subtitle={t("economy:landlordPage.intro.sub", {
            name: landlord.name,
          })}
          preset={t("economy:landlordPage.intro.preset", { firstName })}
          successTitle={t("economy:landlordPage.intro.successTitle")}
          successEm={t("economy:landlordPage.intro.successEm")}
          successBody={
            <Translation
              i18nKey="economy:landlordPage.intro.successBody"
              values={{ firstName }}
              components={{ strong: <strong /> }}
            />
          }
          sendLabel={t("economy:landlordPage.intro.sendLabel")}
          onSend={async (message) => {
            await requestIntro.mutateAsync({ name: memberName, note: message });
          }}
          onClose={() => setIntroducing(false)}
        />
      )}

      <WithdrawRecommendationDialog
        slug={landlord.slug}
        landlordName={landlord.name}
        isOpen={isConfirmingWithdraw}
        onClose={() => setIsConfirmingWithdraw(false)}
      />

      {reporting && (
        <ReportListingModal
          subjectType="landlord"
          subjectId={landlord.slug}
          subjectName={landlord.name}
          onClose={() => setReporting(false)}
        />
      )}
    </PageShell>
  );
}
