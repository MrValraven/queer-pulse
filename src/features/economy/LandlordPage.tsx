import { useState } from "react";
import { FiStar } from "react-icons/fi";
import { Link, Navigate, useParams } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { PageShell } from "../../shared/components/layout";
import { Button, FadeIn, ImageSlot } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { getLandlord, type Tint } from "./landlords";
import { RecommendModal } from "./HousingModals";
import { ContactRequestModal } from "./ContactRequestModal";
import { LandlordSkeleton } from "./LandlordSkeleton";
import s from "./LandlordPage.module.css";

const TINT: Record<Tint, string | undefined> = {
  coral: s.tCoral,
  jade: s.tJade,
  plum: s.tPlum,
};
const Stars = ({ count }: { count: number }) => (
  <>
    {Array.from({ length: 5 }, (_, starIndex) => (
      <FiStar
        key={starIndex}
        className={starIndex < count ? s.starOn : undefined}
      />
    ))}
  </>
);

export function LandlordPage() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const { showToast } = useToast();
  const [recommending, setRecommending] = useState(false);
  const [introducing, setIntroducing] = useState(false);
  const loading = useSimulatedLoad();

  const landlord = getLandlord(slug);
  if (!landlord) return <Navigate to={routes.housing} replace />;

  if (loading) {
    return (
      <PageShell>
        <div className={s.page}>
          <Link to={routes.housing} className={s.back}>
            {t("economy:housingListing.back")}
          </Link>
          <LandlordSkeleton />
        </div>
      </PageShell>
    );
  }

  const firstName = landlord.name.split(" ")[0];

  return (
    <PageShell>
      <div className={s.page}>
        <Link to={routes.housing} className={s.back}>
          {t("economy:housingListing.back")}
        </Link>

        <FadeIn>
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
              <div className={s.eyebrow}>
                {t("economy:landlordPage.eyebrow")}
              </div>
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
              <Button variant="primary" onClick={() => setRecommending(true)}>
                {t("economy:landlordPage.recommendCta", {
                  name: landlord.name,
                })}
              </Button>
              <span className={s.recCount}>
                {t("economy:landlordPage.recommendCount", {
                  count: landlord.recommendations.length,
                })}
              </span>
            </div>
          </header>

          <div className={s.grid}>
            <div>
              <section className={s.sec}>
                <h2>
                  {t("economy:landlordPage.section.about", {
                    name: landlord.name,
                  })}
                </h2>
                {landlord.about.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </section>

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

              <section className={s.sec}>
                <h2>{t("economy:landlordPage.section.recommendations")}</h2>
                <div className={s.recs}>
                  {landlord.recommendations.map((recommendation) => (
                    <div
                      key={recommendation.name + recommendation.when}
                      className={s.rec}
                    >
                      <div className={s.recHead}>
                        <div
                          className={[s.recAv, TINT[recommendation.tint]].join(
                            " ",
                          )}
                        >
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
            </div>

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
                  onClick={() => setRecommending(true)}
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
                  onClick={() => setIntroducing(true)}
                >
                  {t("economy:landlordPage.sidebar.requestIntro")}
                </Button>
              </div>
            </aside>
          </div>
        </FadeIn>
      </div>

      {recommending && (
        <RecommendModal
          landlordName={landlord.name}
          onClose={() => setRecommending(false)}
          onSubmitted={(stars) =>
            showToast(
              t("economy:landlordPage.toast.recommended", { count: stars }),
              "success",
            )
          }
        />
      )}

      {introducing && (
        <ContactRequestModal
          toName={landlord.name}
          eyebrow={t("economy:landlordPage.intro.eyebrow")}
          title={t("economy:landlordPage.intro.title")}
          em={t("economy:landlordPage.intro.em")}
          sub={t("economy:landlordPage.intro.sub", { name: landlord.name })}
          preset={t("economy:landlordPage.intro.preset", { firstName })}
          successTitle={t("economy:landlordPage.intro.successTitle")}
          successEm={t("economy:landlordPage.intro.successEm")}
          successBody={
            <Translation
              i18nKey="economy:landlordPage.intro.successBody"
              values={{ firstName }}
              components={{ strong: <strong /> }}
            />
          }
          sendLabel={t("economy:landlordPage.intro.sendLabel")}
          onClose={() => setIntroducing(false)}
        />
      )}
    </PageShell>
  );
}
