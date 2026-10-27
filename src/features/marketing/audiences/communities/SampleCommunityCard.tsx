import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { AccessTierBadge } from "../../../communities/CommunityBadges";
import { CommunityCardShell } from "../../../communities/CommunityCardShell";
import cardStyles from "../../../communities/CommunitiesPage.module.css";
import {
  buildSampleCommunity,
  SAMPLE_COMMUNITY_TIER,
} from "./communitiesSample.data";

/**
 * The sample collective's Discover card: the real card shell in its inert
 * preview form, with the tier badge on the cover photo and the join pill a
 * visitor sees for a community that reviews requests.
 */
export function SampleCommunityCard() {
  const { t } = useTranslation();
  return (
    <CommunityCardShell
      {...buildSampleCommunity(t)}
      badge={<AccessTierBadge tier={SAMPLE_COMMUNITY_TIER} onPhoto />}
      footAction={
        <span className={cardStyles.joinBtn}>
          {t("communities:card.join.request")}
        </span>
      }
    />
  );
}
