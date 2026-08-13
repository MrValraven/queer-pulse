import { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { PageShell } from "../../shared/components/layout";
import { FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useMyHousingViewings } from "./api/useHousingViewings";
import type { HousingViewingDTO } from "./api/housingViewings.api";
import { ViewingCard } from "./HousingViewingsSections";
import { ReviewViewingModal } from "./ReviewViewingModal";
import v from "./housingViewings.module.css";

/** The member's viewings, both as requester and as lister — the small surface
 * that lets both sides act on a viewing (accept/propose/decline/complete) and
 * review after it's done. */
export function HousingViewingsPage() {
  const { t } = useTranslation();
  const { data = [] } = useMyHousingViewings();
  const [reviewing, setReviewing] = useState<HousingViewingDTO | null>(null);

  const needsResponse = data.filter(
    (viewing) =>
      viewing.status === "requested" && !viewing.youProposedLast,
  );
  const upcoming = data.filter(
    (viewing) =>
      viewing.status === "accepted" ||
      (viewing.status === "requested" && viewing.youProposedLast),
  );
  const past = data.filter((viewing) =>
    ["completed", "declined", "cancelled"].includes(viewing.status),
  );

  const groups: { key: string; items: HousingViewingDTO[] }[] = [
    { key: "needsResponse", items: needsResponse },
    { key: "upcoming", items: upcoming },
    { key: "past", items: past },
  ];

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

        {data.length === 0 ? (
          <div className={v.empty}>{t("economy:housingViewing.list.empty")}</div>
        ) : (
          <FadeIn>
            {groups.map(
              (group) =>
                group.items.length > 0 && (
                  <div key={group.key}>
                    <div className={v.groupHead}>
                      {t(`economy:housingViewing.list.group.${group.key}`)}
                    </div>
                    <div className={v.list}>
                      {group.items.map((viewing) => (
                        <ViewingCard
                          key={viewing.id}
                          viewing={viewing}
                          onReview={setReviewing}
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
