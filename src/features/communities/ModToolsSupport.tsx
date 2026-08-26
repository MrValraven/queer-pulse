import { FiAlertTriangle, FiLifeBuoy } from "react-icons/fi";
import { EmptyState, SkeletonLine } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import type { CommunitySupportOfferResponse } from "./api/communitySupportOffers.api";
import {
  useCommunitySupportOffers,
  useRespondToCommunitySupportOffer,
} from "./api/useCommunitySupportOffers";
import { SupportOfferRow } from "./ModToolsSupportOffer";
import detail from "./CommunityDetailPage.module.css";
import styles from "./ModToolsPanels.module.css";

/**
 * What platform staff have offered this community, and the two answers its
 * moderators can give.
 *
 * This pane is the reason the admin console's "Offer support" button means
 * anything (OPS-05). It used to write nothing at all: an admin picked from four
 * kinds of help, wrote a note to the moderators, saw "Support sent to <name>'s
 * moderators" with an Undo, and nobody in the community was ever told. The
 * offer now lands here, where the people running the room already look.
 *
 * Answering is one-way on the server, so both controls are final and both are
 * plain: taking help up and saying it is not needed are equally reasonable
 * answers, and neither is buried behind the other.
 */
export function ModToolsSupport({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const { offers, isLoading, isError, refetch } =
    useCommunitySupportOffers(slug);
  const respond = useRespondToCommunitySupportOffer(slug);

  const onRespond = (
    offerId: string,
    response: CommunitySupportOfferResponse,
  ) => {
    respond.mutate(
      { offerId, response },
      {
        onSuccess: () =>
          showToast(
            t(
              response === "acknowledged"
                ? "communities:detail.modtools.support.acceptedToast"
                : "communities:detail.modtools.support.declinedToast",
            ),
            "success",
          ),
        onError: () =>
          showToast(
            t("communities:detail.modtools.support.errorToast"),
            "error",
          ),
      },
    );
  };

  return (
    <div style={{ marginBottom: 32 }}>
      <div className={detail.secLbl}>
        {t("communities:detail.modtools.support.label")}
      </div>
      <p className={styles.intro}>
        {t("communities:detail.modtools.support.intro")}
      </p>

      {isLoading ? (
        <div aria-busy="true">
          <SkeletonLine height={14} style={{ marginBottom: 10 }} />
          <SkeletonLine height={14} width="70%" />
        </div>
      ) : isError ? (
        <EmptyState
          compact
          icon={<FiAlertTriangle />}
          title={t("communities:detail.modtools.queueError.title")}
          description={t("communities:detail.modtools.queueError.description")}
          action={{
            label: t("communities:detail.modtools.queueError.retry"),
            onClick: refetch,
          }}
        />
      ) : offers.length === 0 ? (
        <EmptyState
          compact
          icon={<FiLifeBuoy />}
          title={t("communities:detail.modtools.support.empty.title")}
          description={t(
            "communities:detail.modtools.support.empty.description",
          )}
        />
      ) : (
        <div className={styles.rows}>
          {offers.map((offer) => (
            <SupportOfferRow
              key={offer.id}
              offer={offer}
              isPending={respond.isPending}
              onRespond={onRespond}
              formatDate={(iso) => fmt.date(new Date(iso))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
