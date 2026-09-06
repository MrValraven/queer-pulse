import {
  FiAlertCircle,
  FiArrowRight,
  FiStar,
  FiTrash2,
  FiUser,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { Badge, Button, ImageSlot, Stars } from "../../shared/components/ui";
import { ReportSubjectControl } from "../safety/ReportSubjectControl";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { landlordReplyRequestHref } from "./landlordReplyRequest";
import type { Landlord, Recommendation, Tint } from "./landlords";
import { LandlordActions } from "./LandlordActions";
import s from "./LandlordPage.module.css";

const TINT: Record<Tint, string | undefined> = {
  coral: s.tCoral,
  jade: s.tJade,
  plum: s.tPlum,
};

interface LandlordHeroProps {
  landlord: Landlord;
  saved: boolean;
  onToggleSave: () => void;
  onReport: () => void;
  onRecommend: () => void;
}

export function LandlordHero({
  landlord,
  saved,
  onToggleSave,
  onReport,
  onRecommend,
}: LandlordHeroProps) {
  const { t } = useTranslation();
  // Live mode carries the server-side aggregate, which counts EVERY
  // recommendation; the list under it is capped. The demo fixtures carry no
  // aggregate, so they count what they have, which for a fixture is all of it.
  const ratingCount = landlord.ratingCount ?? landlord.recommendations.length;
  const attestedCount =
    landlord.ratingAttestedCount ??
    landlord.recommendations.filter(
      (recommendation) => recommendation.attestation,
    ).length;
  return (
    <header className={s.hero}>
      <ImageSlot
        className={s.photo}
        src={landlord.photo}
        alt={landlord.name}
        tint={landlord.tint}
        initials={landlord.initials}
        radius={16}
        width={160}
        height={160}
      />
      <div>
        <div className={s.eyebrow}>{t("economy:landlordPage.eyebrow")}</div>
        <h1 className={s.name}>{landlord.name}</h1>
        <div className={s.metaLine}>
          <span className={s.stars}>
            <Stars value={landlord.stars} />
          </span>
          <span>{landlord.hood}</span>
        </div>
        {/* PRD-249. The star row above is a mean of self-reported ratings of a
            real person who has no account here and never agreed to be rated.
            It is never shown alone: this line says who reported it and how many
            of them said, in their own words, that they actually rented here. */}
        <p className={s.ratingSource}>
          {t("economy:landlordPage.rating.selfReported", {
            count: ratingCount,
          })}{" "}
          {t("economy:landlordPage.rating.attestedOf", {
            count: attestedCount,
            total: ratingCount,
          })}
        </p>
        <p className={s.tagline}>{landlord.tagline}</p>
      </div>
      <div className={s.heroAction}>
        <LandlordActions
          landlordName={landlord.name}
          saved={saved}
          onToggleSave={onToggleSave}
          onReport={onReport}
        />
        <Button variant="primary" onClick={onRecommend}>
          {t("economy:landlordPage.recommendCta", { name: landlord.name })}
        </Button>
        <span className={s.recCount}>
          {t("economy:landlordPage.recommendCount", {
            count: landlord.recommendations.length,
          })}
        </span>
      </div>
    </header>
  );
}

export function LandlordAbout({ landlord }: { landlord: Landlord }) {
  const { t } = useTranslation();
  return (
    <section className={s.sec}>
      <h2>
        {t("economy:landlordPage.section.about", { name: landlord.name })}
      </h2>
      {landlord.about.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </section>
  );
}

export function LandlordAreas({ landlord }: { landlord: Landlord }) {
  const { t } = useTranslation();
  return (
    <section className={s.sec}>
      <h2>{t("economy:landlordPage.section.whereTheyRent")}</h2>
      <div className={s.areas}>
        {landlord.areas.map((area) => (
          <div key={area} className={s.area}>
            <div className={s.areaDot} />
            {area}
          </div>
        ))}
      </div>
    </section>
  );
}

/** One published recommendation. The author's own entry carries a quiet
 *  "Yours" marker plus the withdraw control, since these are public ratings of
 *  named real people and the writer should be able to take theirs back down
 *  without asking a moderator.
 *
 *  Everyone else gets a report control addressed at THIS recommendation
 *  (`landlord_recommendation`, keyed by its uuid). The entry-level control in
 *  the hero stays for complaints genuinely about the directory entry: acting on
 *  one of those withholds the whole entry, and with it every other tenant's
 *  warning about the same landlord, which is the wrong answer to "this one
 *  sentence outed me".
 *
 *  A recommendation whose author erased their account keeps its stars and its
 *  text and loses its byline, so the name line becomes a placeholder rather
 *  than an empty space.
 *
 *  PRD-249. EVERY card is labelled self-attested and unverified, without
 *  exception and regardless of what the row carries. The badge is not a quality
 *  signal that some recommendations earn and others miss: nothing on this
 *  platform can check any of it. A landlord is not a member, there is no lease
 *  on file, and no interaction gate was possible, because almost every tenancy
 *  worth writing about began off-platform. What the row can add underneath is
 *  the window the author attested to. A row with none says so plainly rather
 *  than leaving a gap a reader would fill with an assumption.
 *
 *  The named landlord's reply, where there is one, renders under the words it
 *  answers and says that the team published it: the landlord has no account to
 *  post from, so a reader must not read it as them typing here. */
function RecommendationCard({
  recommendation,
  onWithdraw,
  landlordName,
  replyRequestHref,
}: {
  recommendation: Recommendation;
  onWithdraw: () => void;
  landlordName: string;
  /** The public "Is this you? Ask to reply" page, with this recommendation
   *  pre-filled. Absent on a demo fixture, which has no row to answer. */
  replyRequestHref: string | null;
}) {
  const { t } = useTranslation();
  const authorName = recommendation.isAuthorRemoved
    ? t("economy:landlordPage.recommendation.formerMember")
    : recommendation.name;
  return (
    <div
      className={[s.rec, recommendation.isMine && s.recMine]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={s.recHead}>
        <div className={[s.recAv, TINT[recommendation.tint]].join(" ")}>
          {recommendation.isAuthorRemoved ? (
            <FiUser aria-hidden />
          ) : (
            recommendation.initials
          )}
        </div>
        <div>
          <div
            className={[
              s.recName,
              recommendation.isAuthorRemoved && s.recNameGone,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {authorName}
          </div>
          <div className={s.recWhen}>{recommendation.when}</div>
        </div>
        <span className={s.recStars}>
          <Stars value={recommendation.stars} />
        </span>
      </div>
      {/* PRD-249. On every card, always. Never conditional on the row. */}
      <div className={s.recAttest}>
        <Badge tone="ghost">
          <FiAlertCircle aria-hidden />
          {t("economy:landlordPage.recommendation.selfAttestedBadge")}
        </Badge>
        <span className={s.recAttestLine}>
          {recommendation.attestation
            ? recommendation.attestation.tenancyLabel
            : t("economy:landlordPage.recommendation.noTenancyGiven")}
        </span>
      </div>
      <div className={s.recText}>{recommendation.text}</div>
      {recommendation.landlordReply && (
        <div className={s.recReply}>
          <div className={s.recReplyHead}>
            {t("economy:landlordPage.recommendation.reply.heading", {
              name: landlordName,
            })}
          </div>
          <div className={s.recReplyText}>
            {recommendation.landlordReply.text}
          </div>
          <div className={s.recReplyMeta}>
            {recommendation.landlordReply.publishedLabel}
          </div>
        </div>
      )}
      {/* The landlord's way in. They cannot read this page (the directory is
          member-only) and hold no account, so the link is a PUBLIC form they
          can be sent, and staff publish what they say. Hidden once a reply
          stands, since the standing one is replaced through the same form. */}
      {replyRequestHref && !recommendation.landlordReply && (
        <div className={s.recReplyAsk}>
          <Link to={replyRequestHref} className={s.recReplyAskLink}>
            {t("economy:landlordPage.recommendation.reply.askCta", {
              name: landlordName,
            })}
          </Link>
        </div>
      )}
      {recommendation.isMine ? (
        <div className={s.recMineFoot}>
          <Badge tone="jade">
            {t("economy:landlordPage.recommendation.yoursBadge")}
          </Badge>
          <Button
            variant="ghost"
            size="md"
            className={s.recWithdraw}
            onClick={onWithdraw}
          >
            <FiTrash2 aria-hidden />
            {t("economy:landlordPage.recommendation.withdrawCta")}
          </Button>
        </div>
      ) : (
        // No id means a demo fixture, which has no row behind it to report.
        recommendation.id && (
          <div className={s.recReport}>
            <ReportSubjectControl
              subjectType="landlord_recommendation"
              subjectId={recommendation.id}
              subjectName={authorName}
              label={t("economy:landlordPage.recommendation.report.cta")}
              ariaLabel={t(
                "economy:landlordPage.recommendation.report.ariaLabel",
                { name: authorName },
              )}
            />
          </div>
        )
      )}
    </div>
  );
}

export function LandlordRecommendations({
  landlord,
  onWithdrawMine,
}: {
  landlord: Landlord;
  onWithdrawMine: () => void;
}) {
  const { t } = useTranslation();
  return (
    <section className={s.sec}>
      <h2>{t("economy:landlordPage.section.recommendations")}</h2>
      {/* PRD-249. Said once at the top of the list as well as on every card,
          because the standing of the whole block is what a reader needs before
          they read a word of it: these are members' own accounts of their own
          tenancies, and this platform has checked none of them. */}
      <p className={s.recsNote}>
        {t("economy:landlordPage.section.recommendationsNote", {
          name: landlord.name,
        })}
      </p>
      <div className={s.recs}>
        {landlord.recommendations.map((recommendation, index) => (
          <RecommendationCard
            // The uuid where there is one. The name/index fallback is for the
            // demo fixtures, whose entries have neither an id nor a stable
            // order to key by.
            key={recommendation.id ?? `${recommendation.name}-${index}`}
            recommendation={recommendation}
            onWithdraw={onWithdrawMine}
            landlordName={landlord.name}
            // A demo fixture has no row for a landlord to answer, so it gets no
            // link. Same rule the report control above follows.
            replyRequestHref={
              recommendation.id
                ? landlordReplyRequestHref(landlord.slug, recommendation.id)
                : null
            }
          />
        ))}
      </div>
    </section>
  );
}

interface LandlordSidebarProps {
  landlord: Landlord;
  onRecommend: () => void;
  onRequestIntro: () => void;
}

export function LandlordSidebar({
  landlord,
  onRecommend,
  onRequestIntro,
}: LandlordSidebarProps) {
  const { t } = useTranslation();
  return (
    <aside className={s.side}>
      <div className={s.sideCard}>
        <h4>{t("economy:landlordPage.sidebar.atAGlance")}</h4>
        {landlord.stats.map((stat) => (
          <div key={stat.label} className={s.statRow}>
            <span>{stat.label}</span>
            <b>
              {stat.label === "Community rating" && (
                <FiStar className={s.statStar} />
              )}
              {stat.value}
            </b>
          </div>
        ))}
      </div>

      <div className={s.recCard}>
        <h4>
          {t("economy:landlordPage.sidebar.rentedFrom", {
            name: landlord.name,
          })}
        </h4>
        <p>{t("economy:landlordPage.sidebar.rentedFromBody")}</p>
        <Button
          variant="ghost-dark"
          className={s.sideFull}
          onClick={onRecommend}
        >
          {t("economy:landlordPage.sidebar.recommendCta")}
        </Button>
      </div>

      <div className={s.sideCard}>
        <h4>{t("economy:landlordPage.sidebar.howToRent")}</h4>
        <p className={s.note}>{landlord.rentingNote}</p>
        <Button
          variant="ghost"
          className={s.sideFull}
          style={{ marginTop: 14 }}
          onClick={onRequestIntro}
        >
          {t("economy:landlordPage.sidebar.requestIntro")}{" "}
          <FiArrowRight aria-hidden />
        </Button>
      </div>
    </aside>
  );
}

/** Fetch-error state for a landlord profile (PRD-248): shown when the read
 * failed for a reason other than a genuine 404, so the member gets a retry
 * instead of a silent redirect to the housing board. Mirrors
 * `HousingListingError` beside it, with copy about a person rather than a
 * place. */
export function LandlordError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <div className={s.errorState} role="alert">
      <h1 className={s.errorTitle}>{t("economy:landlordPage.error.title")}</h1>
      <p className={s.errorBody}>{t("economy:landlordPage.error.body")}</p>
      <Button variant="primary" onClick={onRetry}>
        {t("economy:landlordPage.error.retry")}
      </Button>
    </div>
  );
}
