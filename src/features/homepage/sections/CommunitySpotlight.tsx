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

const ACCESS: Record<CommunityAccess, { label: string; icon: IconType }> = {
  open: { label: "Open to join", icon: FiLogIn },
  request: { label: "Request to join", icon: FiCheck },
  private: { label: "Private", icon: FiLock },
};

const communityHref = (anchor: string) =>
  linkToPath(`${routes.communities}#${anchor}`);

const mediaTint = (tint: FullCommunity["tint"]): ImageSlotTint =>
  tint === "violet" ? "plum" : tint;

export function CommunitySpotlight({
  community,
  loading,
  onClear,
}: {
  community: SpotlightCommunity | null;
  loading: boolean;
  onClear: () => void;
}) {
  if (loading) return <SpotlightSkeleton />;
  if (!community) return <EmptySpotlight onClear={onClear} />;
  if (community.quiet) return <QuietSpotlight community={community} />;
  return <FullSpotlight community={community} />;
}

function SpotlightSkeleton() {
  return (
    <article className={styles.spot} aria-busy>
      <div className={[styles.sk, styles.skMedia].join(" ")} />
      <div className={styles.spotBody}>
        <div
          className={[styles.sk, styles.skLine].join(" ")}
          style={{ width: "55%", height: 30 }}
        />
        <div
          className={[styles.sk, styles.skLine].join(" ")}
          style={{ width: "90%" }}
        />
        <div
          className={[styles.sk, styles.skLine].join(" ")}
          style={{ width: "80%" }}
        />
        <div
          className={[styles.sk, styles.skLine].join(" ")}
          style={{ width: "40%", marginTop: 24 }}
        />
      </div>
    </article>
  );
}

function EmptySpotlight({ onClear }: { onClear: () => void }) {
  return (
    <article className={styles.spot}>
      <div className={styles.spotEmpty}>
        <h3>Nothing here — yet.</h3>
        <p>
          No community matches those filters. Widen your search, or start the
          one that&apos;s missing.
        </p>
        <div className={styles.emptyActions}>
          <Button variant="primary" onClick={onClear}>
            Clear filters
          </Button>
          <Button variant="ghost" to={routes.startCommunity}>
            Start a community <FiArrowRight aria-hidden />
          </Button>
        </div>
      </div>
    </article>
  );
}

function QuietSpotlight({ community: d }: { community: QuietCommunity }) {
  return (
    <article
      className={[styles.spot, styles.spotQuiet, styles.spotFade].join(" ")}
    >
      <div className={styles.spotBody}>
        <div className={styles.quietTop}>
          <span className={styles.membersOnly}>Members only · private</span>
          <span className={styles.quietLock}>
            <FiLock aria-hidden />
          </span>
        </div>
        <h3 className={styles.spotName}>{d.name}</h3>
        <p className={styles.spotDesc}>{d.desc}</p>
        <div className={[styles.spotFoot, styles.spotFootQuiet].join(" ")}>
          <span className={styles.membersOnly}>
            Discreet &amp; safe · no headcount
          </span>
          <Button variant="ghost" to={communityHref(d.anchor)}>
            Enter <FiArrowRight aria-hidden />
          </Button>
        </div>
      </div>
    </article>
  );
}

function FullSpotlight({ community: d }: { community: FullCommunity }) {
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
            <div className={styles.whhLab}>What happens here</div>
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
              Kept by <b>{d.host.name}</b> &amp; {d.host.extra}
            </span>

            <div className={styles.cmeta}>
              <span
                className={[styles.mi, d.access === "open" && styles.miOpen]
                  .filter(Boolean)
                  .join(" ")}
              >
                <AccessIcon aria-hidden />
                {access.label}
              </span>
              <span className={styles.mi}>
                <FiClock aria-hidden />
                Since {d.founded}
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
          <div className={styles.whhLab}>What you get when you join</div>
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
              <FiEye aria-hidden /> Peek inside
            </Button>
            <Button variant="primary" to={communityHref(d.anchor)}>
              Join
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
