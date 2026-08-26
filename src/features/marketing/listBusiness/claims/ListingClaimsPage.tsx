import { PageShell } from "../../../../shared/components/layout";
import {
  EmptyState,
  HubBackLink,
  SkeletonLine,
} from "../../../../shared/components/ui";
import { ErrorFallback } from "../../../../shared/components/feedback/ErrorFallback";
import { PageMeta } from "../../../../shared/seo/PageMeta";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { routes } from "../../../../app/routeMap";
import {
  useListingClaimPolicy,
  useMyListingClaims,
} from "../api/useListingClaims";
import { ListingClaimCard } from "./ListingClaimCard";
import styles from "./ListingClaims.module.css";

/**
 * "Claims you've filed": where a business owner tracks an ownership claim
 * after sending it.
 *
 * Claiming an existing listing is the one directory action whose result lands
 * days later and nowhere the claimant can see, which is exactly how the same
 * business ends up filing a second, duplicate listing a week on. This page is
 * the place they come back to: the listing, the status in words, the filing
 * date, how long it has waited, and the date a decision was promised by.
 *
 * It sits under the directory rather than on the account profile because a
 * pending claim is not yet a place the member runs. An APPROVED claim already
 * shows up in "Places you run" as an actual listing, so putting the queue
 * there would either duplicate that or leave a permanent "no claims" panel on
 * every member's profile.
 *
 * Demo mode never reaches the network (both hooks are disabled there), so a
 * demo persona sees the empty state, the same thing a member who has never
 * claimed anything sees.
 */
export function ListingClaimsPage() {
  const { t } = useTranslation();
  const { claims, isLoading, isError, refetch } = useMyListingClaims();
  const { policy } = useListingClaimPolicy();

  return (
    <PageShell>
      <PageMeta
        title={`${t("marketing:directory.myClaims.title")} | QueerPulse`}
        noIndex
      />
      <div className={`wrap ${styles.page}`}>
        <HubBackLink
          to={routes.directory}
          label={t("marketing:directory.myClaims.backLabel")}
        />
        <h1 className={styles.title}>
          {t("marketing:directory.myClaims.title")}
        </h1>
        <p className={styles.sub}>{t("marketing:directory.myClaims.sub")}</p>
        {policy && (
          <p className={styles.policyLine}>
            {t("marketing:directory.myClaims.turnaround", {
              count: policy.reviewTurnaroundDays,
            })}{" "}
            {t("marketing:directory.myClaims.checkBack")}
          </p>
        )}

        {/* One PERSISTENT status region, empty until the read settles.
            Populating a live region at mount announces nothing (there is no
            change for the browser to report), so the loading label below is
            ordinary on-screen text and this line stays blank until it has
            something new to say. Matches `SubprofileShowcase`'s always-mounted
            visually-hidden announcer rather than a region that appears with
            its text already in it. */}
        <p className="visuallyHidden" role="status">
          {isError || isLoading
            ? ""
            : claims.length === 0
              ? t("marketing:directory.myClaims.announceEmpty")
              : t("marketing:directory.myClaims.announceCount", {
                  count: claims.length,
                })}
        </p>

        {isError ? (
          <ErrorFallback onReset={refetch} level="route" />
        ) : isLoading ? (
          <div className={styles.loading} aria-busy="true">
            <span className={styles.loadingLabel}>
              {t("marketing:directory.myClaims.loading")}
            </span>
            <SkeletonLine width="100%" height={92} />
            <SkeletonLine width="100%" height={92} />
          </div>
        ) : claims.length === 0 ? (
          <EmptyState
            title={t("marketing:directory.myClaims.empty.title")}
            description={t("marketing:directory.myClaims.empty.description")}
            action={{
              label: t("marketing:directory.myClaims.empty.action"),
              to: routes.directory,
            }}
          />
        ) : (
          <ul className={styles.list}>
            {claims.map((claim) => (
              <li key={claim.id}>
                <ListingClaimCard claim={claim} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  );
}
