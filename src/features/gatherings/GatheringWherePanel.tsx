import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowUpRight,
  FiCompass,
  FiGift,
  FiGlobe,
  FiLock,
  FiMapPin,
  FiTag,
  FiVideo,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { businessPath } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GatheringDetail } from "./data";
import { GatheringWhereLayout } from "./GatheringWhereLayout";
import styles from "./GatheringDetailPanels.module.css";

/** One labelled fact about getting there. `withheld` draws the dashed
 *  treatment used for something the viewer has not earned yet. */
function WhereRow({
  icon: Icon,
  label,
  children,
  withheld = false,
}: {
  icon: IconType;
  label: string;
  children: ReactNode;
  withheld?: boolean;
}) {
  return (
    <div
      className={[styles.row, withheld && styles.rowWithheld]
        .filter(Boolean)
        .join(" ")}
    >
      <span className={styles.rowIcon} aria-hidden>
        <Icon />
      </span>
      <span className={styles.rowText}>
        <span className={styles.rowLabel}>{label}</span>
        <span className={styles.rowValue}>{children}</span>
      </span>
    </div>
  );
}

/** The panel's lead row: the venue, which is what most readers come here for.
 *  The name is set large in the serif on its own line with the neighbourhood
 *  beneath it, on a faintly accent-tinted card. When the host linked a
 *  directory listing, the name opens that listing. */
function WhereVenueRow({
  label,
  venueName,
  neighbourhood,
  listingSlug,
}: {
  label: string;
  venueName: string;
  neighbourhood: string;
  listingSlug: string | null;
}) {
  // Whichever of the two exists leads; the neighbourhood only drops to the
  // second line when there is a venue name above it.
  const hasVenueName = venueName !== "";
  const leadText = hasVenueName ? venueName : neighbourhood;
  const secondaryText = hasVenueName ? neighbourhood : "";
  const listingPath =
    hasVenueName && listingSlug ? businessPath(listingSlug) : null;

  return (
    <div className={[styles.row, styles.rowFeatured].join(" ")}>
      <span className={styles.rowIcon} aria-hidden>
        <FiMapPin />
      </span>
      <span className={styles.rowText}>
        <span className={styles.rowLabel}>{label}</span>
        <span className={styles.venueName}>
          {listingPath ? (
            <Link className={styles.venueLink} to={listingPath}>
              {leadText}
              <FiArrowUpRight className={styles.venueLinkIcon} aria-hidden />
            </Link>
          ) : (
            leadText
          )}
        </span>
        {secondaryText && (
          <span className={styles.venueHood}>{secondaryText}</span>
        )}
      </span>
    </div>
  );
}

/**
 * Where the gathering is, what it costs, and what language it runs in. The
 * venue is drawn as the panel's lead row, larger and accent-tinted, since it
 * is the fact most readers open this panel for.
 *
 * ADDRESS PRIVACY. The venue name and the neighbourhood are for everybody:
 * they are what makes a gathering findable at all. The exact door is disclosed
 * by the server only to organisers and to people holding a confirmed "going"
 * RSVP, so `address` simply arrives as `null` for everyone else. That absence
 * is stated in words here. Rendering a blank line where a street should be
 * would read as a gathering with no address, which is a different and wrong
 * fact, and a house party would be unlistable without this rule.
 *
 * A gathering at a listed public venue (`venueListing`) shows that venue's
 * public directory address to everyone, since its directory page already
 * does. The host's own address, which may add detail like a floor, still goes
 * only to people going, and it wins whenever the viewer holds it.
 *
 * COST is free text the host wrote, rendered and nothing more (LOC-18). There
 * is no payment integration on this platform, so no button, link or sentence
 * on this panel may imply one.
 *
 * ONLINE GATHERINGS have no door, so they answer a different question: the
 * join link, gated by the server on exactly the same rule as the address
 * (PRD-182). This panel used to render the locked "the exact address is shared
 * with the people going" row for an online gathering too, which promised a
 * confirmed attendee a street that was never going to exist.
 *
 * THE MAP AND "TAKE ME THERE" live in `GatheringWhereLayout`, and the address
 * rule above holds there too: the pin marks a linked listing or the
 * neighbourhood, never the street (`gatheringLocation.ts`).
 */
export function GatheringWherePanel({
  gathering,
}: {
  gathering: GatheringDetail;
}) {
  const { t } = useTranslation();
  const isOnline = gathering.isOnline === true;
  const joinLink = gathering.onlineUrl?.trim() ?? "";
  // The host's own address when the viewer holds it, else the linked public
  // venue's directory address, which every reader may see.
  const displayedAddress =
    gathering.address?.trim() || gathering.venueListing?.address?.trim() || "";
  const arrivalNotes = gathering.arrivalNotes?.trim() ?? "";
  const cost = gathering.cost?.trim() ?? "";
  const neighbourhood = gathering.neighbourhood?.trim() ?? gathering.hood;
  // The venue and the neighbourhood are for everybody: they are what makes a
  // gathering findable at all. Prefer the linked listing's own name when the
  // host attached one, and fall back to whatever they typed.
  const venueName = (
    gathering.venueListing?.name ??
    gathering.venue ??
    ""
  ).trim();
  // `hood` can fall back to the venue name in the demo registry, so a
  // neighbourhood that only repeats the venue is dropped from the second line.
  const venueHood =
    neighbourhood && neighbourhood !== venueName ? neighbourhood : "";
  const hasPlace = venueName !== "" || venueHood !== "";

  return (
    <section className={styles.panel}>
      <h2 className={styles.heading}>
        {t("gatherings:gathering.where.heading")}
      </h2>
      <GatheringWhereLayout gathering={gathering}>
        <div className={styles.rows}>
          {hasPlace && (
            <WhereVenueRow
              label={t("gatherings:gathering.where.placeLabel")}
              venueName={venueName}
              neighbourhood={venueHood}
              listingSlug={gathering.venueListing?.slug ?? null}
            />
          )}

          {isOnline ? (
            joinLink ? (
              <WhereRow
                icon={FiVideo}
                label={t("gatherings:gathering.where.joinLinkLabel")}
              >
                {/* An external video room, so it opens in a new tab and carries
                  `noreferrer`: the host's meeting URL should not learn which
                  QueerPulse page an attendee came from. */}
                <a
                  className={styles.joinLink}
                  href={joinLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {joinLink}
                </a>
              </WhereRow>
            ) : (
              <WhereRow
                icon={FiLock}
                withheld
                label={t("gatherings:gathering.where.joinLinkLabel")}
              >
                {/* Two different absences, said differently. An organiser reading
                  this knows there is no link because they never added one; a
                  passer-by knows there is one and that it comes with a seat. */}
                {t(
                  gathering.viewerIsOrganizer
                    ? "gatherings:gathering.where.joinLinkMissing"
                    : "gatherings:gathering.where.joinLinkWithheld",
                )}
              </WhereRow>
            )
          ) : displayedAddress ? (
            <WhereRow
              icon={FiMapPin}
              label={t("gatherings:gathering.where.addressLabel")}
            >
              {displayedAddress}
            </WhereRow>
          ) : gathering.viewerIsOrganizer ? (
            // The same two absences as the join link. An organiser always
            // receives the address, so an empty one here means nobody added it:
            // a fact about their own gathering, drawn as an ordinary row. The
            // locked, dashed treatment is for a reader who has not earned it.
            <WhereRow
              icon={FiMapPin}
              label={t("gatherings:gathering.where.addressLabel")}
            >
              {t("gatherings:gathering.where.addressMissing")}
            </WhereRow>
          ) : (
            <WhereRow
              icon={FiLock}
              withheld
              label={t("gatherings:gathering.where.addressLabel")}
            >
              {t("gatherings:gathering.where.addressWithheld")}
            </WhereRow>
          )}

          {!isOnline && arrivalNotes && (
            <WhereRow
              icon={FiCompass}
              label={t("gatherings:gathering.where.arrivalLabel")}
            >
              {arrivalNotes}
            </WhereRow>
          )}

          {gathering.language && (
            <WhereRow
              icon={FiGlobe}
              label={t("gatherings:gathering.where.languageLabel")}
            >
              {gathering.language}
            </WhereRow>
          )}

          <WhereRow
            icon={cost ? FiTag : FiGift}
            label={t("gatherings:gathering.where.costLabel")}
          >
            {cost ? (
              cost
            ) : (
              <span className={styles.freeChip}>
                <FiGift aria-hidden />
                {t("gatherings:gathering.where.costFree")}
              </span>
            )}
            <span className={styles.costNote}>
              {t("gatherings:gathering.where.costNote")}
            </span>
          </WhereRow>
        </div>
      </GatheringWhereLayout>
    </section>
  );
}
