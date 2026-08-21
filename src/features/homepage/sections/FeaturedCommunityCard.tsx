import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiBook,
  FiCalendar,
  FiCheck,
  FiClock,
  FiGrid,
  FiLock,
  FiLogIn,
  FiMail,
  FiMessageSquare,
  FiUsers,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { Button, ImageSlot, Tag, TagRow } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useHowCommunitiesWorkModal } from "../../marketing/useHowCommunitiesWorkModal";
import type {
  AccessTier,
  CommunityType,
} from "../../communities/api/communities.api";
import {
  CARD_TAG_DISPLAY_CAP,
  COMMUNITY_TAG_LABEL_KEY,
} from "../../communities/communityTags.data";
import { FACE_TINT } from "./communityClasses";
import type {
  CommunitySpotlightFace,
  CommunitySpotlightView,
} from "./communitySpotlightView";
import spot from "./Communities.module.css";
import styles from "./FeaturedCommunityCard.module.css";

const ACCESS: Record<
  AccessTier,
  { labelKey: string; icon: IconType; open?: boolean }
> = {
  public: {
    labelKey: "homepage:communities.access.open",
    icon: FiLogIn,
    open: true,
  },
  request: { labelKey: "homepage:communities.access.request", icon: FiCheck },
  invite: { labelKey: "homepage:communities.access.invite", icon: FiMail },
  private: { labelKey: "homepage:communities.access.private", icon: FiLock },
};

const CATEGORY_LABEL_KEY: Record<CommunityType, string> = {
  social: "homepage:communities.category.social",
  arts: "homepage:communities.category.arts",
  activism: "homepage:communities.category.activism",
  support: "homepage:communities.category.support",
  sports: "homepage:communities.category.sports",
  professional: "homepage:communities.category.professional",
};

// Backend `features` slugs → a "what you get" chip. Feature names stay in
// English as product feature names (same convention as the demo `RoomChips`);
// only surrounding chrome is translated. An unknown slug is skipped.
const FEATURE_META: Record<string, { icon: IconType; label: string }> = {
  discussion: { icon: FiMessageSquare, label: "Discussions" },
  events: { icon: FiCalendar, label: "Events" },
  rooms: { icon: FiGrid, label: "Rooms" },
  roster: { icon: FiUsers, label: "Member list" },
  library: { icon: FiBook, label: "Resources" },
};

function Face({ face }: { face: CommunitySpotlightFace }) {
  return (
    <span
      className={[spot.face, FACE_TINT[face.tint]].filter(Boolean).join(" ")}
      title={face.name}
    >
      {face.avatarUrl ? (
        <img
          className={styles.faceImg}
          src={face.avatarUrl}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        face.initials
      )}
    </span>
  );
}

function FaceStrip({
  faces,
  more,
}: {
  faces: CommunitySpotlightFace[];
  more: number;
}) {
  if (faces.length === 0) return null;
  return (
    <div className={spot.faces}>
      {faces.map((face, index) => (
        <Face key={`${face.name}-${index}`} face={face} />
      ))}
      {more > 0 && (
        <span className={[spot.face, spot.faceMore].join(" ")}>+{more}</span>
      )}
    </div>
  );
}

function FeatureChips({ features }: { features: string[] }) {
  const chips = features.filter((feature) => FEATURE_META[feature]);
  if (chips.length === 0) return null;
  return (
    <div className={spot.rooms}>
      {chips.map((feature) => {
        const meta = FEATURE_META[feature]!;
        const Icon = meta.icon;
        return (
          <span key={feature} className={spot.room}>
            <Icon aria-hidden />
            {meta.label}
          </span>
        );
      })}
    </div>
  );
}

function CommunityCard({
  view,
  onHowItWorksClick,
}: {
  view: CommunitySpotlightView;
  onHowItWorksClick: () => void;
}) {
  const { t } = useTranslation();
  const access = ACCESS[view.accessTier];
  const AccessIcon = access.icon;
  return (
    <article className={[spot.spot, styles.card].join(" ")}>
      <div className={spot.spotMedia}>
        <span className={styles.badge}>{t(CATEGORY_LABEL_KEY[view.category])}</span>
        <ImageSlot
          className={spot.glimpse}
          tint={view.tint}
          src={view.coverUrl}
          alt={view.coverUrl ? view.name : ""}
          placeholder={view.name}
          radius={0}
          height="100%"
        />
      </div>

      <div className={spot.spotBody}>
        <h3 className={spot.spotName}>
          <Link to={view.to} className={styles.nameLink}>
            {view.name}
          </Link>
        </h3>

        {view.blurb && <p className={spot.spotDesc}>{view.blurb}</p>}

        {view.tags && view.tags.length > 0 && (
          <TagRow>
            {view.tags.slice(0, CARD_TAG_DISPLAY_CAP).map((tagId) => (
              <Tag key={tagId}>
                {COMMUNITY_TAG_LABEL_KEY[tagId]
                  ? t(COMMUNITY_TAG_LABEL_KEY[tagId])
                  : tagId}
              </Tag>
            ))}
          </TagRow>
        )}

        <div className={spot.spotCols}>
          <div className={spot.spotMain}>
            {view.features.length > 0 && (
              <>
                <div className={spot.whhLab}>
                  {t("homepage:communities.spotlight.whatYouGet")}
                </div>
                <FeatureChips features={view.features} />
              </>
            )}
          </div>

          <div className={spot.spotSide}>
            {view.owner && (
              <span className={spot.host}>
                <span className={spot.avwrap}>
                  <Face face={view.owner} />
                </span>
                <Translation
                  i18nKey="homepage:communities.spotlight.keptByName"
                  values={{ name: view.owner.name }}
                  components={{ b: <b /> }}
                />
              </span>
            )}

            <div className={spot.cmeta}>
              <span
                className={[spot.mi, access.open && spot.miOpen]
                  .filter(Boolean)
                  .join(" ")}
              >
                <AccessIcon aria-hidden />
                {t(access.labelKey)}
              </span>
              <span className={spot.mi}>
                <FiClock aria-hidden />
                {t("homepage:communities.spotlight.sinceLabel", {
                  year: view.foundedYear,
                })}
              </span>
            </div>
          </div>
        </div>

        <div className={spot.spotFoot}>
          <div className={spot.roster}>
            <FaceStrip faces={view.faces} more={view.facesMore} />
            <span className={styles.memberCount}>
              {t("homepage:liveCommunities.memberCount", {
                count: view.memberCount,
              })}
            </span>
          </div>
          <div className={spot.actions}>
            <Button variant="primary" onClick={onHowItWorksClick}>
              {t("homepage:communities.howCommunitiesWorkCta")}{" "}
              <FiArrowRight aria-hidden />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * The live-mode featured-community card — the community analog of
 * `FeaturedSpotlightCard`. Renders each curated community as a rich standalone
 * card (cover, category, blurb, "what you get" chips, owner, access + founding
 * year, roster faces + count) from real data, degrading gracefully where the
 * live feed has nothing to show. Reuses the demo `.spot*` styling so it reads as
 * the same card family the demo showcase uses.
 */
export function FeaturedCommunityCard({
  items,
  fill,
}: {
  items: CommunitySpotlightView[];
  fill?: boolean;
}) {
  const { openModal, modalElement } = useHowCommunitiesWorkModal();
  if (items.length === 0) return null;
  return (
    <div className={[styles.list, fill && styles.listFill].filter(Boolean).join(" ")}>
      {items.map((view) => (
        <CommunityCard key={view.key} view={view} onHowItWorksClick={openModal} />
      ))}
      {modalElement}
    </div>
  );
}
