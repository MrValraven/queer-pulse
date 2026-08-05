import { FiBarChart2 } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Avatar, Button } from "../../shared/components/ui";
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
  const tags = [
    { label: t("feed:community.newThisWeek", { count: c.newThisWeek }), accent: true },
    ...c.tags.map((label) => ({ label })),
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
