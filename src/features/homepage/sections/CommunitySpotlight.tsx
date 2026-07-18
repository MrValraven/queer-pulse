import {
  FiArrowRight,
  FiCheck,
  FiClock,
  FiEye,
  FiGlobe,
  FiLock,
  FiLogIn,
  FiMapPin,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import {
  Button,
  ImageSlot,
  type ImageSlotTint,
} from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { linkToPath, routes } from "../../../app/routeMap";
import type {
  CommunityAccess,
  FullCommunity,
  QuietCommunity,
  SpotlightCommunity,
} from "./Communities.data";
import { RoomChips, RosterFaces, Sparkline } from "./CommunitySpotlightParts";
import { CAT_CLASS, FACE_TINT, WD_CLASS } from "./communityClasses";
import styles from "./Communities.module.css";

const ACCESS: Record<CommunityAccess, { labelKey: string; icon: IconType }> = {
  open: { labelKey: "homepage:communities.access.open", icon: FiLogIn },
  request: { labelKey: "homepage:communities.access.request", icon: FiCheck },
  private: { labelKey: "homepage:communities.access.private", icon: FiLock },
};

const communityHref = (anchor: string) =>
  linkToPath(`${routes.communities}#${anchor}`);

const mediaTint = (tint: FullCommunity["tint"]): ImageSlotTint =>
  tint === "violet" ? "plum" : tint;

export function CommunitySpotlight({
  community,
  onClear,
}: {
  community: SpotlightCommunity | null;
  onClear: () => void;
}) {
  if (!community) return <EmptySpotlight onClear={onClear} />;
  if (community.quiet) return <QuietSpotlight community={community} />;
  return <FullSpotlight community={community} />;
}

function EmptySpotlight({ onClear }: { onClear: () => void }) {
  const { t } = useTranslation();
  return (
    <article className={styles.spot}>
      <div className={styles.spotEmpty}>
        <h3>{t("homepage:communities.spotlight.emptyTitle")}</h3>
        <p>{t("homepage:communities.spotlight.emptyBody")}</p>
        <div className={styles.emptyActions}>
          <Button variant="primary" onClick={onClear}>
            {t("homepage:communities.clearFiltersCta")}
          </Button>
          <Button variant="ghost" to={routes.startCommunity}>
            {t("homepage:communities.spotlight.startCommunityCta")}{" "}
            <FiArrowRight aria-hidden />
          </Button>
        </div>
      </div>
    </article>
  );
}

function QuietSpotlight({ community: d }: { community: QuietCommunity }) {
  const { t } = useTranslation();
  return (
    <article
      className={[styles.spot, styles.spotQuiet, styles.spotFade].join(" ")}
    >
      <div className={styles.spotBody}>
        <div className={styles.quietTop}>
          <span className={styles.membersOnly}>
            {t("homepage:communities.spotlight.quiet.membersOnlyPrivate")}
          </span>
          <span className={styles.quietLock}>
            <FiLock aria-hidden />
          </span>
        </div>
        <h3 className={styles.spotName}>{d.name}</h3>
        <p className={styles.spotDesc}>{d.desc}</p>
        <div className={[styles.spotFoot, styles.spotFootQuiet].join(" ")}>
          <span className={styles.membersOnly}>
            {t("homepage:communities.spotlight.quiet.discreetSafe")}
          </span>
          <Button variant="ghost" to={communityHref(d.anchor)}>
            {t("homepage:communities.spotlight.quiet.enterCta")}{" "}
            <FiArrowRight aria-hidden />
          </Button>
        </div>
      </div>
    </article>
  );
}

function FullSpotlight({ community: d }: { community: FullCommunity }) {
  const { t } = useTranslation();
  const access = ACCESS[d.access];
  const AccessIcon = access.icon;
  return (
    <article className={[styles.spot, styles.spotFade].join(" ")}>
      <div className={styles.spotMedia}>
        <span
          className={[styles.cat, CAT_CLASS[d.category]]
            .filter(Boolean)
            .join(" ")}
        >
          {d.categoryLabel}
        </span>
        {d.verified && (
          <span className={styles.veri}>
            <FiCheck aria-hidden />
            {d.verified}
          </span>
        )}
        <ImageSlot
          className={styles.glimpse}
          tint={mediaTint(d.tint)}
          src={d.photoSrc}
          alt={d.photoSrc ? d.photo : ""}
          placeholder={d.photo}
          radius={0}
          height="100%"
        />
      </div>

      <div className={styles.spotBody}>
        <h3 className={styles.spotName}>
          {d.name}
          {d.nameAccent && (
            <>
              {" "}
              <em>{d.nameAccent}</em>
            </>
          )}
        </h3>

        <blockquote className={styles.spotQuote}>
          <p>&ldquo;{d.quote}&rdquo;</p>
          <span className={styles.quoteBy}>
            <span
              className={[styles.face, FACE_TINT[d.by.tint]]
                .filter(Boolean)
                .join(" ")}
            >
              {d.by.initials}
            </span>
            <b>{d.by.name}</b> · {d.by.role}
          </span>
        </blockquote>

        <p className={styles.spotDesc}>{d.desc}</p>

        <div className={styles.spotCols}>
          <div className={styles.spotMain}>
            <div className={styles.whhLab}>
              {t("homepage:communities.spotlight.whatHappensHere")}
            </div>
            <div className={styles.whhList}>
              {d.does.map(([label, cadence]) => (
                <div key={label} className={styles.whhItem}>
                  <span
                    className={[styles.wd, WD_CLASS[d.category]]
                      .filter(Boolean)
                      .join(" ")}
                  />
                  {label} <span className={styles.cadence}>· {cadence}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.spotSide}>
            <span className={styles.host}>
              <span className={styles.avwrap}>
                <span
                  className={[styles.face, FACE_TINT[d.host.tint]]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {d.host.initials}
                </span>
                {d.verified && (
                  <span className={styles.vbadge}>
                    <FiCheck aria-hidden />
                  </span>
                )}
              </span>
              <Translation
                i18nKey="homepage:communities.spotlight.keptBy"
                values={{ name: d.host.name, extra: d.host.extra }}
                components={{ b: <b /> }}
              />
            </span>

            <div className={styles.cmeta}>
              <span
                className={[styles.mi, d.access === "open" && styles.miOpen]
                  .filter(Boolean)
                  .join(" ")}
              >
                <AccessIcon aria-hidden />
                {t(access.labelKey)}
              </span>
              <span className={styles.mi}>
                <FiClock aria-hidden />
                {t("homepage:communities.spotlight.sinceLabel", {
                  year: d.founded,
                })}
              </span>
            </div>
            <div className={styles.cmeta}>
              <span className={styles.mi}>
                <FiGlobe aria-hidden />
                {d.langs}
              </span>
              <span className={styles.mi}>
                <FiMapPin aria-hidden />
                {d.loc}
              </span>
            </div>

            <span
              className={[styles.activity, d.live.isLive && styles.activityLive]
                .filter(Boolean)
                .join(" ")}
            >
              <span className={styles.adot} aria-hidden />
              {d.live.text}
            </span>
          </div>
        </div>

        <div className={styles.spotRooms}>
          <div className={styles.whhLab}>
            {t("homepage:communities.spotlight.whatYouGet")}
          </div>
          <RoomChips rooms={d.rooms} />
        </div>

        <div className={styles.spotFoot}>
          <div className={styles.roster}>
            <RosterFaces faces={d.faces} more={d.facesMore} />
            <span className={styles.count}>
              <b>{d.count}</b>
              <br />
              {d.growth}
            </span>
            <span className={styles.sizeCtx}>
              <Sparkline trend={d.trend} steady={d.steady} />
              <span
                className={[styles.sizeNote, d.steady && styles.sizeNoteSteady]
                  .filter(Boolean)
                  .join(" ")}
              >
                {d.sizeNote}
              </span>
            </span>
          </div>
          <div className={styles.actions}>
            <Button variant="ghost" to={communityHref(d.anchor)}>
              <FiEye aria-hidden />{" "}
              {t("homepage:communities.spotlight.peekInsideCta")}
            </Button>
            <Button variant="primary" to={communityHref(d.anchor)}>
              {t("homepage:communities.spotlight.joinCta")}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
