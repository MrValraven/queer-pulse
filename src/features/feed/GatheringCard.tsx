import { useState } from "react";
import { FiCalendar, FiUser } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import {
  Avatar,
  Button,
  isPosterShaped,
  PosterAwareImageSlot,
} from "../../shared/components/ui";
import { gatheringPath } from "../gatherings/data";
import { tintForSlug } from "../../shared/api/refs";
import { initials, relativeTime } from "./api/feed.adapters";
import type { FeedItem } from "./api/feed.api";
import { FeedReasonLine } from "./FeedPostActions";
import { DEMO_GATHERING as g } from "./feedCards.data";
import { useGatheringWhen } from "./useGatheringWhen";
import styles from "./FeedCard.module.css";
import {
  FeedActionLink,
  FeedActions,
  FeedAvatarLink,
  FeedCardHead,
  FeedCardShell,
  FeedDateBlock,
  FeedIdentity,
  FeedMeter,
  FeedQuote,
  FeedStat,
  FeedTagRow,
} from "./FeedCard";

/** The cover banner's rendered height. Passed to `PosterAwareImageSlot` as a
 *  number so the slot reserves the box before the file arrives and a
 *  landscape cover never moves the card. */
const BANNER_HEIGHT = 160;

/** The banner's height once the cover measures as a poster: tall enough that
 *  a portrait poster shows at a readable size beside its blurred backdrop,
 *  on a phone card as well as a desktop one. */
const POSTER_BANNER_HEIGHT = 280;

/** The widest a feed card's banner is ever rendered, at 2x, for hosts that
 *  can resize on request. */
const BANNER_SRC_WIDTH = 720;

/**
 * The gathering's cover photo, full bleed across the top of the card. A
 * landscape cover fills the 160px banner. A poster (portrait or near-square)
 * shows whole over its blurred backdrop, and once the file measures as one
 * the banner grows from 160px to 280px so the poster stays readable; a poster
 * already in the browser's cache opens at the taller height.
 */
function GatheringBanner({ src }: { src: string }) {
  const [posterSrc, setPosterSrc] = useState<string | null>(null);
  const isPoster = posterSrc === src;
  return (
    <div className={styles.gatheringBanner}>
      <PosterAwareImageSlot
        src={src}
        /* Decorative: the title below names the event, so an alt would
           only repeat it to a screen reader. */
        alt=""
        width="100%"
        height={isPoster ? POSTER_BANNER_HEIGHT : BANNER_HEIGHT}
        srcSize={BANNER_SRC_WIDTH}
        radius={0}
        className={styles.gatheringBannerImage}
        onNaturalSize={({ width, height }) => {
          if (isPosterShaped(width, height)) setPosterSrc(src);
        }}
      />
    </div>
  );
}

/**
 * "Gathering" card for the feed's Gatherings tab. With no `item`, renders the
 * demo prototype's scripted `DEMO_GATHERING` mock UNCHANGED (day/month date
 * block, capacity meter, tags, save-my-spot/maybe actions, all of which the
 * live aggregate lacks). With a live `FeedItem` (`type: "gathering"`),
 * renders straight off its fields: title = event title, summary = truncated
 * description, link = `/gatherings/{slug}`, actor = the event's host (mirrors
 * `GatheringResponse.host`). The capacity meter, date block, and tag row are
 * demo-only enrichment the aggregate doesn't carry, so a live item renders a
 * plainer card (eyebrow + relative time, host avatar, title, blurb, a single
 * "Details" action) rather than guessing at them. Either branch leads with the
 * cover photo as a full-bleed banner when there is one.
 *
 * When the live item carries `startsAt`, the card shows when the event
 * happens (a date row above the host row) and drops the posted time from its
 * head, which members kept reading as the event date. An older backend sends
 * no `startsAt` and keeps the posted time.
 */
export function GatheringCard({ item }: { item?: FeedItem } = {}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const whenLabel = useGatheringWhen(item);

  if (item) {
    const host = item.actor;
    const hostSlug = host?.handle ?? "";
    const hostName =
      host?.displayName ?? t("feed:card.gathering.anonymousHost");
    const hostTint = hostSlug ? tintForSlug(hostSlug) : "plum";
    const timestamp = whenLabel ? undefined : relativeTime(item.createdAt, fmt);
    const hostedBy = t("feed:gathering.hostedBy", { host: hostName });
    return (
      <FeedCardShell accent="ink">
        {item.imageUrl && <GatheringBanner src={item.imageUrl} />}
        <FeedCardHead
          label={t("feed:card.eyebrow.gathering")}
          timestamp={timestamp}
        />
        <FeedIdentity
          lead={
            <FeedAvatarLink slug={hostSlug} name={hostName}>
              <Avatar
                initials={initials(hostName)}
                tint={hostTint}
                size={46}
                src={host?.avatarUrl ?? undefined}
                alt={hostName}
              />
            </FeedAvatarLink>
          }
          name={item.title}
          meta={
            whenLabel ? (
              <div className={styles.metaRows}>
                <FeedStat icon={<FiCalendar aria-hidden />}>
                  <time dateTime={item.startsAt}>{whenLabel}</time>
                </FeedStat>
                <FeedStat icon={<FiUser aria-hidden />}>{hostedBy}</FeedStat>
              </div>
            ) : (
              <FeedStat icon={<FiCalendar aria-hidden />}>{hostedBy}</FeedStat>
            )
          }
        />
        <FeedQuote className={styles.quoteAsTyped}>{item.summary}</FeedQuote>
        <FeedReasonLine reason={item.reason} subject={item.reasonSubject} />
        <FeedActions
          primary={
            <Button variant="primary" size="sm" to={item.link}>
              {t("feed:action.details")}
            </Button>
          }
        />
      </FeedCardShell>
    );
  }

  const spots = Math.max(0, g.capacity - g.going);
  const to = gatheringPath(g.slug);
  return (
    <FeedCardShell accent="ink">
      <GatheringBanner src={g.coverImageUrl} />
      <FeedCardHead label={t("feed:card.eyebrow.gathering")} />
      <FeedIdentity
        lead={<FeedDateBlock day={g.day} month={g.month} />}
        name={g.title}
        meta={`${g.venue} · ${g.host}`}
      />
      <FeedQuote className={styles.quoteAsTyped}>{g.quote}</FeedQuote>
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
