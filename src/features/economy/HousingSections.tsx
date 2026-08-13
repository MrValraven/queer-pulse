import { useState } from "react";
import { FiAward, FiStar } from "react-icons/fi";
import { Link } from "react-router-dom";
import {
  Avatar,
  Button,
  EmptyState,
  Reveal,
  SectionHead,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { LandlordCard } from "./api/landlord.adapters";
import { TIPS } from "./housing.data";
import { SuggestLandlordModal } from "./SuggestLandlordModal";
import styles from "./HousingPage.module.css";

/**
 * Header + "Suggest a landlord" CTA render unconditionally so a member can
 * always suggest one — even cold-start, before the live board has any
 * endorsed landlords. Only the card grid is gated on `landlords.length`.
 */
export function HousingLandlords({ landlords }: { landlords: LandlordCard[] }) {
  const { t } = useTranslation();
  const [suggesting, setSuggesting] = useState(false);
  return (
    <section className={styles.landlords}>
      <div className="wrap">
        <Reveal>
          <SectionHead
            title={
              <Translation
                i18nKey="economy:housing.landlords.heading"
                components={{ em: <em /> }}
              />
            }
            subtitle={t("economy:housing.landlords.subtitle")}
            action={
              <Button variant="ghost" onClick={() => setSuggesting(true)}>
                {t("economy:housing.landlords.suggestCta")}
              </Button>
            }
          />
        </Reveal>
        {landlords.length > 0 ? (
          <div className={styles.llGrid}>
            {landlords.map((landlord, index) => (
              <Reveal
                as={Link}
                key={landlord.slug}
                to={`/work/landlord/${landlord.slug}`}
                className={styles.llCard}
                delay={index * 55}
              >
                <span className={styles.llAvatar}>
                  <Avatar
                    initials={landlord.initials}
                    tint={landlord.tint}
                    src={landlord.photo}
                    size={52}
                  />
                  <span
                    className={styles.llBadge}
                    title={t("economy:housing.landlords.endorsedBadge")}
                  >
                    <FiAward />
                  </span>
                </span>
                <div>
                  <div className={styles.llName}>{landlord.name}</div>
                  <div className={styles.llHood}>{landlord.hood}</div>
                  <div className={styles.llStars}>
                    {Array.from({ length: 5 }, (_, starIndex) => (
                      <FiStar
                        key={starIndex}
                        className={
                          starIndex < landlord.stars ? styles.llStarOn : undefined
                        }
                      />
                    ))}
                  </div>
                  <div className={styles.llNote}>{landlord.note}</div>
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal as="div" className={styles.llEmpty}>
            <EmptyState
              compact
              icon={<FiAward />}
              title={t("economy:housing.landlords.emptyTitle")}
              description={t("economy:housing.landlords.emptyBody")}
            />
          </Reveal>
        )}
      </div>

      {suggesting && (
        <SuggestLandlordModal onClose={() => setSuggesting(false)} />
      )}
    </section>
  );
}

export function HousingTips() {
  const { t } = useTranslation();
  return (
    <section className={styles.tips}>
      <div className="wrap">
        <Reveal>
          <SectionHead
            title={
              <Translation
                i18nKey="economy:housing.tipsHeading"
                components={{ em: <em /> }}
              />
            }
          />
        </Reveal>
        <div className={styles.tipsGrid}>
          {TIPS.map((tip, tipIndex) => (
            <Reveal
              as="div"
              key={tip.number}
              className={styles.tipCard}
              delay={tipIndex * 55}
            >
              <div className={styles.tipNum}>{tip.number}</div>
              <div className={styles.tipTitle}>{t(tip.titleKey)}</div>
              <div className={styles.tipText}>{t(tip.textKey)}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
