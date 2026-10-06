import { useEffect, useRef, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { PageShell } from "../../shared/components/layout";
import { FadeIn, LoadErrorState } from "../../shared/components/ui";
import { prefersReducedMotionNow } from "../../shared/hooks/usePrefersReducedMotion";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useMyHousingViewings } from "./api/useHousingViewings";
import type { HousingViewingDTO } from "./api/housingViewings.api";
import { ViewingCard } from "./HousingViewingsSections";
import { ReviewViewingModal } from "./ReviewViewingModal";
import v from "./housingViewings.module.css";

type ViewingGroupKey = "needsResponse" | "upcoming" | "past";

const VIEWING_GROUP_ORDER: ViewingGroupKey[] = [
  "needsResponse",
  "upcoming",
  "past",
];

/** The page group a viewing belongs in: your turn to answer, booked or
 * waiting on the other side, or finished one way or another. */
function groupKeyFor(viewing: HousingViewingDTO): ViewingGroupKey {
  if (viewing.status === "requested") {
    return viewing.youProposedLast ? "upcoming" : "needsResponse";
  }
  if (viewing.status === "accepted") return "upcoming";
  return "past";
}

/** The member's viewings, both as requester and as lister: the small surface
 * that lets both sides act on a viewing (accept/propose/decline/complete) and
 * review after it's done. */
export function HousingViewingsPage() {
  const { t } = useTranslation();
  const { data = [], isError, refetch } = useMyHousingViewings();
  const [reviewing, setReviewing] = useState<HousingViewingDTO | null>(null);
  // An action moves its card to another group, which remounts it and takes
  // the focused button (and any open confirm) with it. The group the card
  // lands in is remembered here, and that group's heading takes focus once
  // the moved card has committed, so keyboard and screen-reader users stay
  // next to the card.
  const pendingFocusGroupRef = useRef<ViewingGroupKey | null>(null);
  const groupHeadingsRef = useRef<
    Partial<Record<ViewingGroupKey, HTMLHeadingElement | null>>
  >({});

  const groups = VIEWING_GROUP_ORDER.map((key) => ({
    key,
    items: data.filter((viewing) => groupKeyFor(viewing) === key),
  }));

  const handleActionSucceeded = (updated: HousingViewingDTO) => {
    pendingFocusGroupRef.current = groupKeyFor(updated);
  };

  // Runs after the commit that moves the card. React runs every passive
  // cleanup of that commit first, including the closing confirm's scroll-lock
  // release and focus return, so the body is scrollable again and this focus
  // is the last word. The pending group is cleared before the move so a
  // later commit cannot repeat it. Under reduced motion the scroll jumps.
  useEffect(() => {
    const pendingGroup = pendingFocusGroupRef.current;
    if (!pendingGroup) return;
    const heading = groupHeadingsRef.current[pendingGroup];
    if (!heading) return;
    pendingFocusGroupRef.current = null;
    heading.scrollIntoView({
      block: "nearest",
      behavior: prefersReducedMotionNow() ? "instant" : "smooth",
    });
    heading.focus({ preventScroll: true });
  }, [data]);

  return (
    <PageShell>
      <div className={v.page}>
        <Link to={routes.housing} className={v.back}>
          <FiArrowLeft aria-hidden /> {t("economy:housingViewing.list.back")}
        </Link>
        <h1 className={v.pageTitle}>
          <Translation
            i18nKey="economy:housingViewing.list.title"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={v.pageSub}>{t("economy:housingViewing.list.sub")}</p>

        {isError ? (
          // Someone checking whether a viewing was accepted must never be told
          // they have none because the request failed (DES-22).
          <LoadErrorState
            title={t("economy:housingViewing.list.loadError.title")}
            description={t("economy:housingViewing.list.loadError.description")}
            onRetry={() => void refetch()}
          />
        ) : data.length === 0 ? (
          <div className={v.empty}>
            {t("economy:housingViewing.list.empty")}
          </div>
        ) : (
          <FadeIn>
            {groups.map(
              (group) =>
                group.items.length > 0 && (
                  <div key={group.key}>
                    <h2
                      className={v.groupHead}
                      tabIndex={-1}
                      ref={(heading) => {
                        groupHeadingsRef.current[group.key] = heading;
                      }}
                    >
                      {t(`economy:housingViewing.list.group.${group.key}`)}
                    </h2>
                    <div className={v.list}>
                      {group.items.map((viewing) => (
                        <ViewingCard
                          key={viewing.id}
                          viewing={viewing}
                          onReview={setReviewing}
                          onActionSucceeded={handleActionSucceeded}
                        />
                      ))}
                    </div>
                  </div>
                ),
            )}
          </FadeIn>
        )}
      </div>

      {reviewing && (
        <ReviewViewingModal
          viewingId={reviewing.id}
          counterpartyName={
            reviewing.counterparty
              ? `${reviewing.counterparty.firstName} ${reviewing.counterparty.lastName}`.trim()
              : t("economy:housingViewing.list.someone")
          }
          onClose={() => setReviewing(null)}
        />
      )}
    </PageShell>
  );
}
