import { FiArrowRight, FiHeart } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { Button, SuccessPanel } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import type { CreatedCommunity } from "./startCommunity.data";

/** "Opening the doors" — the plum-panel celebration after a community is created. */
export function StartCommunitySuccess({
  community,
  onAnother,
}: {
  community: CreatedCommunity;
  onAnother: () => void;
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const invited = community.invites.length;

  return (
    <SuccessPanel
      icon={<FiHeart size={26} color="var(--jade)" aria-hidden />}
      title={t("communities:start.success.title")}
      em={t("communities:start.success.em")}
      closeLabel={
        <>
          {t("communities:start.success.closeLabel")} <FiArrowRight aria-hidden />
        </>
      }
      onClose={() => void navigate(`/community/${community.slug}`)}
      steps={[
        <Translation
          key="live"
          i18nKey="communities:start.success.liveYours"
          components={{ strong: <b /> }}
          values={{ name: community.name }}
        />,
        invited > 0 ? (
          <span key="invites">
            {t("communities:start.success.invitesOnWay", { count: invited })}
          </span>
        ) : (
          <span key="invites">
            {t("communities:start.success.inviteWheneverReady")}
          </span>
        ),
        <span key="hello">
          {t("communities:start.success.postFirstHello")}
        </span>,
      ]}
      footer={
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button variant="ghost-dark" to={routes.communitiesHome}>
            {t("communities:start.success.backToHub")}
          </Button>
          <Button variant="ghost-dark" onClick={onAnother}>
            {t("communities:start.success.startAnother")}
          </Button>
        </div>
      }
    >
      {t("communities:start.success.body", { name: community.name })}
    </SuccessPanel>
  );
}
