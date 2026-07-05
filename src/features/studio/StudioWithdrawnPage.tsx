import { Link } from "react-router-dom";
import { Button, ImageSlot } from "../../shared/components/ui";
import { StudioShell } from "./StudioShell";
import { routes } from "../../app/routeMap";
import { STILL_AVAILABLE, type WithdrawnCard } from "./studioWithdrawn.data";
import s from "./StudioWithdrawnPage.module.css";

const tagClass: Record<NonNullable<WithdrawnCard["tag"]>, string> = {
  free: s.tagFree!,
  mem: s.tagMem!,
};

function StillCard({ card }: { card: WithdrawnCard }) {
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
        {card.tag && (
          <span className={`${s.tag} ${tagClass[card.tag]}`}>
            {card.tagLabel}
          </span>
        )}
        <span
          role="button"
          tabIndex={0}
          aria-label="Play"
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
          <div className={s.eb}>Withdrawn by the artist</div>
          <h1>
            This work has been <em>taken down</em>.
          </h1>
          <p className={s.sub}>
            The artist removed it from Studio — their right, their call.{" "}
            <em>No reason is owed</em>, and we don't ask for one.
          </p>
        </div>

        <div className={s.card}>
          <h3>
            What this <em>means</em>
          </h3>
          <p>
            A takedown isn't a deletion of the work itself — the masters stay
            with the artist, who can re-publish any time. It just means it's no
            longer served here. If you'd bought or saved it, it stays in your
            library as a record, marked withdrawn.
          </p>
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
              If you tipped or bought this,{" "}
              <em>every cent already reached the artist</em> and stays with
              them. Nothing is clawed back.
            </span>
          </div>
        </div>

        <div className={s.actions}>
          <Button variant="primary" size="lg" to={routes.studioArtist}>
            Visit the artist's page
          </Button>
          <Button variant="ghost-dark" size="lg" to={routes.studio}>
            Back to the player
          </Button>
        </div>

        <div className={s.still}>
          <div className={s.rowH}>
            <h2>
              Still <em>available</em> from this artist
            </h2>
            <div className={s.subLine}>
              What's left up, and what the council programmed instead
            </div>
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
