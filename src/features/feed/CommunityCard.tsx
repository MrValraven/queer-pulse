import { FiBarChart2 } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Avatar, Button } from "../../shared/components/ui";
import { communities } from "../homepage/data/communities";
import {
  CARD_TAG_DISPLAY_CAP,
  COMMUNITY_TAG_LABEL_KEY,
} from "../communities/communityTags.data";
import { DEMO_COMMUNITY as c } from "./feedCards.data";
import {
  FeedActionLink,
  FeedActions,
  FeedCardHead,
  FeedCardShell,
  FeedIdentity,
  FeedQuote,
  FeedStat,
  FeedTagRow,
} from "./FeedCard";

export function CommunityCard() {
  const { t } = useTranslation();
  const to = `/community/${c.slug}`;
  // This card mirrors the real "trans-hub" record (see feedCards.data.ts's
  // doc comment), so its tag pills are that community's real curated tags —
  // translated via the shared catalog — not invented flavor text.
  const curatedTagIds =
    communities.find((community) => community.slug === c.slug)?.tags ?? [];
  const tags = [
    { label: t("feed:community.newThisWeek", { count: c.newThisWeek }), accent: true },
    ...curatedTagIds.slice(0, CARD_TAG_DISPLAY_CAP).map((tagId) => ({
      label: COMMUNITY_TAG_LABEL_KEY[tagId]
        ? t(COMMUNITY_TAG_LABEL_KEY[tagId])
        : tagId,
    })),
  ];
  return (
    <FeedCardShell accent="jade">
      <FeedCardHead
        label={t("feed:card.eyebrow.community")}
        timestamp={c.activity}
      />
      <FeedIdentity
        lead={<Avatar initials={c.initials} tint={c.tint} size={46} alt={c.name} />}
        name={c.name}
        meta={t("feed:community.meta", {
          count: c.memberCount,
          visibility: c.visibility,
          city: c.city,
        })}
      />
      <FeedQuote>{c.quote}</FeedQuote>
      <FeedTagRow tags={tags} />
      <FeedStat icon={<FiBarChart2 />}>
        {t("feed:community.posts7d", { count: c.posts7d })}
      </FeedStat>
      <FeedActions
        primary={
          <Button variant="primary" size="sm" to={to}>
            {t("feed:action.join")}
          </Button>
        }
        secondary={
          <Button variant="ghost" size="sm" to={to}>
            {t("feed:action.peekInside")}
          </Button>
        }
        link={<FeedActionLink to={to}>{t("feed:action.about")}</FeedActionLink>}
      />
    </FeedCardShell>
  );
}
