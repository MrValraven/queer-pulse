import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiBookmark, FiCheck, FiLock } from "react-icons/fi";
import { Avatar, FadeIn, ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { activateOnKey } from "../../shared/lib/activateOnKey";
import { routes } from "../../app/routeMap";
import { DirectoryCardMeta } from "./DirectoryCardMeta";
import { DirectoryCardRating } from "./DirectoryCardRating";
import { DirectoryCardStatus } from "./DirectoryCardStatus";
import { DirectoryCardVisit } from "./DirectoryCardVisit";
import { SafeSpaceCardMark } from "./SafeSpaceCardMark";
import { OWNED_BY_TAG_KEYS } from "./listBusiness/listingOwnedBy.data";
import {
  ownershipBadgeOf,
  OWNERSHIP_BADGE_KEYS,
  type DirectoryPlace,
} from "./directoryPlaces";
import { onlineAddressOf } from "./onlineConstellation";
import { useListingSaveToggle } from "./useListingSaveToggle";
import card from "./DirectoryPage.module.css";
import s from "./DirectoryOnline.module.css";

/** The ways an online business can be reached, in the order the card lists
 *  them. Labels reuse the listing wizard's own words for the same fields. */
const CHANNELS: {
  key: "website" | "instagram" | "email" | "phone";
  labelKey: string;
}[] = [
  { key: "website", labelKey: "marketing:listBusiness.step5.online.website" },
  {
    key: "instagram",
    labelKey: "marketing:listBusiness.step5.online.instagram",
  },
  { key: "email", labelKey: "marketing:listBusiness.step5.online.email" },
  { key: "phone", labelKey: "marketing:listBusiness.step5.online.phone" },
];

/**
 * The card's cover, framed as a small browser window: three dots and the
 * business's own address in the bar, so "this lives online" reads before a
 * word of the card does. With no cover photo, the window shows the business's
 * tagline set like a homepage instead of an empty "photo coming" slot.
 */
function OnlineCardWindow({
  place,
  corner,
}: {
  place: DirectoryPlace;
  corner: ReactNode;
}) {
  const { t } = useTranslation();
  // The main link leads the bar when the listing has one, since it is where
  // people buy.
  const address = onlineAddressOf({
    website: place.onlineSummary?.mainLink?.url ?? place.social.website,
    instagram: place.social.instagram,
  });
  const ownership = ownershipBadgeOf(place);
  const photo = place.photos?.wide ?? null;

  return (
    <div className={s.window} data-tint={place.tint}>
      <div className={s.windowBar} aria-hidden>
        <span className={s.windowDots}>
          <span />
          <span />
          <span />
        </span>
        <span className={s.windowAddress}>
          <FiLock />
          <span>{address ?? t("marketing:directory.card.online")}</span>
        </span>
      </div>
      <div className={s.windowView}>
        {photo ? (
          <ImageSlot
            src={photo}
            alt={place.alt?.wide ?? place.name}
            height={150}
            focus={place.photoFocus}
          />
        ) : (
          <div className={s.sitePreview}>
            <p className={s.siteTagline}>{place.tagline}</p>
          </div>
        )}
        <span className={card.photoBadges}>
          <span className={card.photoBadgeDark}>
            {ownership === "verified" && (
              <FiCheck className={card.photoBadgeCheck} aria-hidden />
            )}
            <span className={card.photoBadgeText}>
              {t(OWNERSHIP_BADGE_KEYS[ownership])}
            </span>
          </span>
          <SafeSpaceCardMark place={place} />
        </span>
        {corner}
      </div>
    </div>
  );
}

/**
 * One business on the Online tab: an online-only one, or a place that also
 * sells online. Shares the grid card's surface, type and footer so the tabs
 * read as one directory. Its window, meta line and status slot read the
 * listing's kind (`DirectoryCardMeta`, `DirectoryCardStatus`), and it adds
 * the channels that matter online: where to find them. No walking time: the
 * Online tab never orders by distance.
 */
export function DirectoryOnlineCard({
  place,
  index,
  isActive,
  onActivate,
}: {
  place: DirectoryPlace;
  index: number;
  /** True while this business's node in the constellation is hovered or
   *  focused, so the pair light up together. */
  isActive: boolean;
  onActivate: (slug: string | null) => void;
}) {
  const { t } = useTranslation();
  const save = useListingSaveToggle(place);
  const channels = CHANNELS.filter((channel) => place.social[channel.key]);

  const corner = (
    <span
      role="button"
      tabIndex={0}
      aria-pressed={save.saved}
      aria-label={t(
        save.saved
          ? "marketing:directory.card.unsaveAriaLabel"
          : "marketing:directory.card.saveAriaLabel",
        { name: place.name },
      )}
      className={`${card.saveBtn} ${save.saved ? card.saveBtnOn : ""}`}
      onClick={save.onSave}
      onKeyDown={(event) => activateOnKey(event, () => save.onSave(event))}
    >
      <FiBookmark aria-hidden fill={save.saved ? "currentColor" : "none"} />
    </span>
  );

  return (
    <FadeIn
      as={Link}
      delay={Math.min(index, 8) * 60}
      to={`${routes.directory}/${place.slug}`}
      className={`${card.card} ${s.onlineCard}`}
      data-active={isActive ? "true" : undefined}
      onMouseEnter={() => onActivate(place.slug)}
      onMouseLeave={() => onActivate(null)}
      onFocus={() => onActivate(place.slug)}
      onBlur={() => onActivate(null)}
    >
      <OnlineCardWindow place={place} corner={corner} />

      <div className={card.nameRow}>
        <div className={card.name} title={place.name}>
          {place.name}
        </div>
        <DirectoryCardRating place={place} />
      </div>
      <DirectoryCardMeta place={place} isOnOnlineTab />
      <div className={card.desc}>{place.desc}</div>

      {(place.ownedBy ?? []).length > 0 && (
        <div className={card.pillsRow}>
          {(place.ownedBy ?? []).map((value) => (
            <span key={value} className={`${card.pill} ${card.pillOwnedBy}`}>
              {t(OWNED_BY_TAG_KEYS[value])}
            </span>
          ))}
        </div>
      )}

      {channels.length > 0 && (
        <div className={s.channels}>
          <span className={s.channelsLabel}>
            {t("marketing:directory.online.reach")}
          </span>
          <ul className={s.channelList}>
            {channels.map((channel) => (
              <li key={channel.key} className={s.channel}>
                {t(channel.labelKey)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={`${card.foot} ${s.foot}`}>
        <DirectoryCardStatus place={place} />
        {place.owner.first !== "" ? (
          <span className={card.host} title={place.owner.first}>
            <Avatar
              initials={place.owner.initials}
              tint={place.owner.tint}
              src={place.owner.avatarUrl ?? undefined}
              size={20}
            />
            <span className={`${card.hostName} ${s.hostName}`}>
              {place.owner.first}
            </span>
          </span>
        ) : (
          <span />
        )}
        <DirectoryCardVisit place={place} />
      </div>
    </FadeIn>
  );
}
