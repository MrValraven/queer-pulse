import { Link } from "react-router-dom";
import { Button, ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { StudioShell } from "./StudioShell";
import { routes } from "../../app/routeMap";
import { STILL_AVAILABLE, type WithdrawnCard } from "./studioWithdrawn.data";
import s from "./StudioWithdrawnPage.module.css";

const tagClass: Record<NonNullable<WithdrawnCard["tag"]>, string> = {
  free: s.tagFree!,
  mem: s.tagMem!,
};

function StillCard({ card }: { card: WithdrawnCard }) {
  const { t } = useTranslation();
  const inner = (
    <>
      <div className={s.cardCov}>
        <ImageSlot
          src={card.image}
          tint={card.cvTint}
          width="100%"
          height="100%"
          radius={10}
          placeholder="cover"
          style={{ position: "absolute", inset: 0 }}
        />
        {card.tag && card.tagLabelKey && (
          <span className={`${s.tag} ${tagClass[card.tag]}`}>
            {t(card.tagLabelKey)}
          </span>
        )}
        <span
          role="button"
          tabIndex={0}
          aria-label={t("studio:player.play")}
          className={s.playFab}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          <svg viewBox="0 0 12 14" fill="currentColor">
            <path d="M1 1l10 6-10 6z" />
          </svg>
        </span>
      </div>
      {card.byCur && <div className={s.byCur}>{card.byCur}</div>}
      <h4>
        {card.titlePre}
        {card.titleEm && <em>{card.titleEm}</em>}
      </h4>
      <div className={s.meta}>{card.meta}</div>
    </>
  );

  if (card.to) {
    return (
      <Link to={card.to} className={s.tcard}>
        {inner}
      </Link>
    );
  }
  return (
    <a href="#" className={s.tcard} onClick={(e) => e.preventDefault()}>
      {inner}
    </a>
  );
}

export function StudioWithdrawnPage() {
  const { t } = useTranslation();
  return (
    <StudioShell hidePlayer>
      <div className={s.wrap}>
        <div className={s.hero}>
          <div className={s.cover} aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18V5l12-2v13" />
              <circle cx={6} cy={18} r={3} />
              <circle cx={18} cy={16} r={3} />
              <line x1={2} y1={2} x2={22} y2={22} />
            </svg>
          </div>
          <div className={s.eb}>{t("studio:withdrawn.hero.eyebrow")}</div>
          <h1>
            <Translation i18nKey="studio:withdrawn.hero.title" components={{ em: <em /> }} />
          </h1>
          <p className={s.sub}>
            <Translation i18nKey="studio:withdrawn.hero.sub" components={{ em: <em /> }} />
          </p>
        </div>

        <div className={s.card}>
          <h3>
            <Translation i18nKey="studio:withdrawn.card.title" components={{ em: <em /> }} />
          </h3>
          <p>{t("studio:withdrawn.card.body")}</p>
          <div className={s.jadeLine}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <path d="M22 4 12 14.01l-3-3" />
            </svg>
            <span>
              <Translation i18nKey="studio:withdrawn.card.jadeLine" components={{ em: <em /> }} />
            </span>
          </div>
        </div>

        <div className={s.actions}>
          <Button variant="primary" size="lg" to={routes.studioArtist}>
            {t("studio:withdrawn.visitArtistCta")}
          </Button>
          <Button variant="ghost-dark" size="lg" to={routes.studio}>
            {t("studio:withdrawn.backToPlayerCta")}
          </Button>
        </div>

        <div className={s.still}>
          <div className={s.rowH}>
            <h2>
              <Translation i18nKey="studio:withdrawn.still.heading" components={{ em: <em /> }} />
            </h2>
            <div className={s.subLine}>{t("studio:withdrawn.still.sub")}</div>
          </div>
          <div className={s.rowGrid}>
            {STILL_AVAILABLE.map((card) => (
              <StillCard key={card.titlePre + card.meta} card={card} />
            ))}
          </div>
        </div>
      </div>
    </StudioShell>
  );
}
