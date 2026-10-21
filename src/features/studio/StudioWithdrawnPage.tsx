import { Link } from "react-router-dom";
import { FiCheckCircle, FiPlay } from "react-icons/fi";
import { Button, ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { StudioShell } from "./StudioShell";
import { routes } from "../../app/routeMap";
import { STILL_AVAILABLE, type WithdrawnCard } from "./studioWithdrawn.data";
import { StudioWithdrawnView, WithdrawnCoverArt } from "./StudioWithdrawnView";
import { useStudioDocumentTitle } from "./useStudioDocumentTitle";
import { useStudioShowcase } from "./useStudioShowcase";
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
          placeholder={t("studio:media.coverLabel")}
          style={{ position: "absolute", inset: 0 }}
        />
        {card.tag && card.tagLabelKey && (
          <span className={`${s.tag} ${tagClass[card.tag]}`}>
            {t(card.tagLabelKey)}
          </span>
        )}
        {/* Decorative: the whole card is the link, so nothing inside it
            is a second control. */}
        <span className={s.playFab} aria-hidden="true">
          <FiPlay />
        </span>
      </div>
      {(card.byCurKey || card.byCur) && (
        <div className={s.byCur}>
          {card.byCurKey ? t(card.byCurKey) : card.byCur}
        </div>
      )}
      <h3>
        {card.titlePre}
        {card.titleEm && <em>{card.titleEm}</em>}
      </h3>
      <div className={s.meta}>{t(card.metaKey, card.metaValues)}</div>
    </>
  );

  if (card.to) {
    return (
      <Link to={card.to} className={s.tcard}>
        {inner}
      </Link>
    );
  }
  // No destination: an inert card that renders as a plain div. An <a href="#"> here
  // put a focusable element that goes nowhere into the tab order.
  return <div className={s.tcard}>{inner}</div>;
}

export function StudioWithdrawnPage() {
  const { t } = useTranslation();
  useStudioDocumentTitle(t("studio:pageTitle.withdrawn"));
  const isShowcase = useStudioShowcase();
  // Live: the same view an album or track URL shows, with no release named.
  if (!isShowcase)
    return (
      <StudioShell>
        <StudioWithdrawnView />
      </StudioShell>
    );
  return (
    <StudioShell>
      <div className={s.wrap}>
        <div className={s.hero}>
          <WithdrawnCoverArt />
          <div className={s.eb}>{t("studio:withdrawn.hero.eyebrow")}</div>
          <h1>
            <Translation
              i18nKey="studio:withdrawn.hero.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={s.sub}>
            <Translation
              i18nKey="studio:withdrawn.hero.sub"
              components={{ em: <em /> }}
            />
          </p>
        </div>

        <div className={s.card}>
          <h2>
            <Translation
              i18nKey="studio:withdrawn.card.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p>{t("studio:withdrawn.card.body")}</p>
          <div className={s.jadeLine}>
            <FiCheckCircle aria-hidden />
            <span>
              <Translation
                i18nKey="studio:withdrawn.card.jadeLine"
                components={{ em: <em /> }}
              />
            </span>
          </div>
        </div>

        <div className={s.actions}>
          <Button variant="primary" size="lg" to={routes.studioArtist}>
            {t("studio:withdrawn.visitArtistCta")}
          </Button>
          <Button variant="ghost" size="lg" to={routes.studio}>
            {t("studio:withdrawn.backToPlayerCta")}
          </Button>
        </div>

        <div className={s.still}>
          <div className={s.rowH}>
            <h2>
              <Translation
                i18nKey="studio:withdrawn.still.heading"
                components={{ em: <em /> }}
              />
            </h2>
            <div className={s.subLine}>{t("studio:withdrawn.still.sub")}</div>
          </div>
          <div className={s.rowGrid}>
            {STILL_AVAILABLE.map((card) => (
              <StillCard key={card.titlePre + card.metaKey} card={card} />
            ))}
          </div>
        </div>
      </div>
    </StudioShell>
  );
}
