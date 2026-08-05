import { FiCalendar } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { Avatar, Button } from "../../shared/components/ui";
import { gatheringPath } from "../gatherings/data";
import { tintForSlug } from "../../shared/api/refs";
import { initials, relativeTime } from "./api/feed.adapters";
import type { FeedItem } from "../../shared/contracts/contracts";
import { DEMO_GATHERING as g } from "./feedCards.data";
import {
  FeedActionLink,
  FeedActions,
  FeedCardHead,
  FeedCardShell,
  FeedDateBlock,
  FeedIdentity,
  FeedMeter,
  FeedQuote,
  FeedStat,
  FeedTagRow,
} from "./FeedCard";

/**
 * "Gathering" card for the feed's Gatherings tab. With no `item`, renders the
 * demo prototype's scripted `DEMO_GATHERING` mock UNCHANGED (day/month date
 * block, capacity meter, tags, save-my-spot/maybe actions — none of which
 * the live aggregate carries). With a live `FeedItem` (`type: "gathering"`),
 * renders straight off its fields: title = event title, summary = truncated
 * description, link = `/gatherings/{slug}`, actor = the event's host (mirrors
 * `GatheringResponse.host`). The capacity meter, date block, and tag row are
 * demo-only enrichment the aggregate doesn't carry, so a live item renders a
 * plainer card (eyebrow + relative time, host avatar, title, blurb, a single
 * "Details" action) rather than guessing at them.
 */
export function GatheringCard({ item }: { item?: FeedItem } = {}) {
  const { t } = useTranslation();
  const fmt = useFormat();

  if (item) {
    const host = item.actor;
    const hostSlug = host?.handle ?? "";
    const hostName =
      host?.displayName ?? t("feed:card.gathering.anonymousHost");
    const hostTint = hostSlug ? tintForSlug(hostSlug) : "plum";
    const timestamp = relativeTime(item.createdAt, fmt);
    return (
      <FeedCardShell accent="ink">
        <FeedCardHead
          label={t("feed:card.eyebrow.gathering")}
          timestamp={timestamp}
        />
        <FeedIdentity
          lead={
            <Avatar
              initials={initials(hostName)}
              tint={hostTint}
              size={46}
              src={host?.avatarUrl ?? undefined}
              alt={hostName}
            />
          }
          name={item.title}
          meta={
            <FeedStat icon={<FiCalendar aria-hidden />}>
              {t("feed:gathering.hostedBy", { host: hostName })}
            </FeedStat>
          }
        />
        <FeedQuote>{item.summary}</FeedQuote>
        <FeedActions
          primary={
            <Button variant="primary" size="sm" to={item.link}>
              {t("feed:action.details")}
            </Button>
          }
          link={
            <FeedActionLink to={item.link}>
              {t("feed:action.details")}
            </FeedActionLink>
          }
        />
      </FeedCardShell>
    );
  }

  const spots = Math.max(0, g.capacity - g.going);
  const to = gatheringPath(g.slug);
  return (
    <FeedCardShell accent="ink">
      <FeedCardHead label={t("feed:card.eyebrow.gathering")} />
      <FeedIdentity
        lead={<FeedDateBlock day={g.day} month={g.month} />}
        name={g.title}
        meta={`${g.venue} · ${g.host}`}
      />
      <FeedQuote>{g.quote}</FeedQuote>
      <FeedMeter
        ratio={g.going / g.capacity}
        label={
          spots > 0
            ? t("feed:gathering.spots", { going: g.going, spots })
            : t("feed:gathering.full", { going: g.going })
        }
        trailing={g.price}
      />
      <FeedTagRow tags={g.tags} />
      <FeedActions
        primary={
          <Button variant="primary" size="sm" to={to}>
            {t("feed:action.saveSpot")}
          </Button>
        }
        secondary={
          <Button variant="ghost" size="sm" to={to}>
            {t("feed:action.maybe")}
          </Button>
        }
        link={
          <FeedActionLink to={to}>{t("feed:action.details")}</FeedActionLink>
        }
      />
    </FeedCardShell>
  );
}
