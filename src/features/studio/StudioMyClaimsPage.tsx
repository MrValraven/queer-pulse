import { AnimatePresence, m } from "motion/react";
import { useSearchParams } from "react-router-dom";
import { FiShield } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { routes } from "../../app/routeMap";
import {
  Collapse,
  EmptyState,
  LoadMoreFooter,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioMyClaims } from "./api/useStudioClaims";
import { StudioDetailSkeleton, StudioLoadError } from "./StudioLoadStates";
import { StudioMyClaimCard } from "./StudioMyClaimCard";
import { StudioShell } from "./StudioShell";
import css from "./StudioClaimPages.module.css";

/** `/studio/claims`: the member's copyright claims, newest first (spec 8). */
export function StudioMyClaimsPage() {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const [searchParams] = useSearchParams();
  const focusedClaimId = searchParams.get("claim");
  const list = useStudioMyClaims();
  const isEmpty =
    !list.loadState.isLoading &&
    !list.loadState.isError &&
    list.items.length === 0;
  return (
    <StudioShell>
      <div className={css.page}>
        <p className={css.eyebrow}>{t("studio:claims.form.eyebrow")}</p>
        <h1 className={css.title}>{t("studio:claims.mine.title")}</h1>
        <p className={css.dek}>{t("studio:claims.mine.dek")}</p>
        <Collapse isOpen={list.loadState.isLoading}>
          <StudioDetailSkeleton />
        </Collapse>
        <Collapse isOpen={list.loadState.isError}>
          <StudioLoadError
            loadState={list.loadState}
            title={t("studio:claims.mine.loadError")}
          />
        </Collapse>
        <Collapse isOpen={isEmpty}>
          <EmptyState
            icon={<FiShield />}
            title={t("studio:claims.mine.empty")}
            description={t("studio:claims.mine.emptyBody")}
            action={{
              label: t("studio:claims.mine.emptyCta"),
              to: routes.studioRights,
            }}
            headingLevel={2}
          />
        </Collapse>
        <ul className={css.list}>
          <AnimatePresence initial={false}>
            {list.items.map((claim) => (
              <m.li
                key={claim.id}
                layout="position"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.2 }}
              >
                <StudioMyClaimCard
                  claim={claim}
                  isFocused={claim.id === focusedClaimId}
                />
              </m.li>
            ))}
          </AnimatePresence>
        </ul>
        <Collapse isOpen={list.hasMore || list.isFetchNextPageError}>
          <LoadMoreFooter
            isFetchingNextPage={list.isFetchingNextPage}
            isFetchNextPageError={list.isFetchNextPageError}
            onLoadMore={list.fetchNextPage}
            label={t("studio:claims.mine.loadMore")}
            loadingLabel={t("studio:claims.mine.loadingMore")}
            errorMessage={t("studio:flagReviewLive.loadMoreError")}
          />
        </Collapse>
      </div>
    </StudioShell>
  );
}
