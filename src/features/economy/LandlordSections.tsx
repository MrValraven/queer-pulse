import { FiStar } from "react-icons/fi";
import { Button, ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Landlord, Tint } from "./landlords";
import { LandlordActions } from "./LandlordActions";
import s from "./LandlordPage.module.css";

const TINT: Record<Tint, string | undefined> = {
  coral: s.tCoral,
  jade: s.tJade,
  plum: s.tPlum,
};

function Stars({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: 5 }, (_, starIndex) => (
        <FiStar
          key={starIndex}
          className={starIndex < count ? s.starOn : undefined}
        />
      ))}
    </>
  );
}

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
            <Stars count={Math.round(landlord.stars)} />
          </span>
          <span>{landlord.hood}</span>
        </div>
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

export function LandlordRecommendations({ landlord }: { landlord: Landlord }) {
  const { t } = useTranslation();
  return (
    <section className={s.sec}>
      <h2>{t("economy:landlordPage.section.recommendations")}</h2>
      <div className={s.recs}>
        {landlord.recommendations.map((recommendation, index) => (
          <div key={`${recommendation.name}-${index}`} className={s.rec}>
            <div className={s.recHead}>
              <div className={[s.recAv, TINT[recommendation.tint]].join(" ")}>
                {recommendation.initials}
              </div>
              <div>
                <div className={s.recName}>{recommendation.name}</div>
                <div className={s.recWhen}>{recommendation.when}</div>
              </div>
              <span className={s.recStars}>
                <Stars count={recommendation.stars} />
              </span>
            </div>
            <div className={s.recText}>{recommendation.text}</div>
          </div>
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
          {t("economy:landlordPage.sidebar.requestIntro")}
        </Button>
      </div>
    </aside>
  );
}
