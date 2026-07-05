import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, ImageSlot } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import {
  WELCOME_ARTISTS,
  TIP_CHIPS,
  DEFAULT_TIP,
  TOGGLE_ROWS,
} from "./studioWelcome.data";
import s from "./StudioWelcomePage.module.css";

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Step 1 — follow a few artists (multi-select). */
function StepFollow({
  followed,
  onToggle,
  onNext,
}: {
  followed: Set<string>;
  onToggle: (id: string) => void;
  onNext: () => void;
}) {
  return (
    <div className={s.stepCard}>
      <h2>
        Follow a few <em>artists</em>
      </h2>
      <div className={s.scDek}>
        We&apos;ll surface their new releases first. Pick three or more —{" "}
        <em>the council picks the rest</em>.
      </div>
      <div className={s.artGrid}>
        {WELCOME_ARTISTS.map((a) => {
          const on = followed.has(a.id);
          return (
            <button
              key={a.id}
              type="button"
              className={`${s.artPick} ${on ? s.on : ""}`}
              aria-pressed={on}
              onClick={() => onToggle(a.id)}
            >
              {on && (
                <span className={s.artCheck} aria-hidden="true">
                  <CheckIcon />
                </span>
              )}
              <ImageSlot
                className={s.artAvatar}
                src={a.avatar}
                shape="circle"
                width={56}
                height={56}
                alt={a.name}
              />
              <span className={s.artName}>{a.name}</span>
              <span className={s.artPlace}>{a.place}</span>
            </button>
          );
        })}
      </div>
      <div className={s.nav}>
        <span className={s.count}>
          <em>{followed.size}</em> followed
        </span>
        <Button variant="primary" onClick={onNext}>
          Next →
        </Button>
      </div>
    </div>
  );
}

/** Step 2 — set a default tip (single-select). */
function StepTip({
  tip,
  onPick,
  onSkip,
  onNext,
}: {
  tip: number;
  onPick: (amount: number) => void;
  onSkip: () => void;
  onNext: () => void;
}) {
  return (
    <div className={s.stepCard}>
      <h2>
        Set your default <em>tip</em>
      </h2>
      <div className={s.scDek}>
        One tap from the player sends this straight to the artist —{" "}
        <em>100%, no cut</em>. Change it any time.
      </div>
      <div className={s.tipChips}>
        {TIP_CHIPS.map((c) => (
          <button
            key={c.amount}
            type="button"
            className={`${s.tipChip} ${tip === c.amount ? s.on : ""}`}
            aria-pressed={tip === c.amount}
            onClick={() => onPick(c.amount)}
          >
            €{c.amount}
            <small>{c.note}</small>
          </button>
        ))}
      </div>
      <div className={s.nav}>
        <button type="button" className={s.skip} onClick={onSkip}>
          Skip
        </button>
        <Button variant="primary" onClick={onNext}>
          Next →
        </Button>
      </div>
    </div>
  );
}

/** Step 3 — privacy toggle rows + finish. */
function StepPrivacy({
  toggles,
  onToggle,
  onSkip,
  onFinish,
}: {
  toggles: Record<string, boolean>;
  onToggle: (id: string) => void;
  onSkip: () => void;
  onFinish: () => void;
}) {
  return (
    <div className={s.stepCard}>
      <h2>
        How private do you want the <em>room</em>?
      </h2>
      <div className={s.scDek}>
        Our defaults are the careful ones.{" "}
        <em>Nothing here is on unless you turn it on.</em>
      </div>
      {TOGGLE_ROWS.map((r) => {
        const on = toggles[r.id];
        return (
          <div key={r.id} className={s.opt}>
            <div className={s.optText}>
              <h4>{r.title}</h4>
              <p>{r.body}</p>
            </div>
            <button
              type="button"
              className={`${s.tgSw} ${on ? s.on : ""}`}
              role="switch"
              aria-checked={on}
              aria-label={r.title}
              onClick={() => onToggle(r.id)}
            />
          </div>
        );
      })}
      <div className={s.nav}>
        <button type="button" className={s.skip} onClick={onSkip}>
          Skip
        </button>
        <Button variant="jade" onClick={onFinish}>
          Enter the room →
        </Button>
      </div>
    </div>
  );
}

export function StudioWelcomePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [followed, setFollowed] = useState<Set<string>>(
    () =>
      new Set(WELCOME_ARTISTS.filter((a) => a.preselected).map((a) => a.id)),
  );
  const [tip, setTip] = useState(DEFAULT_TIP);
  const [toggles, setToggles] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(TOGGLE_ROWS.map((r) => [r.id, r.defaultOn])),
  );

  function toggleArtist(id: string) {
    setFollowed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleRow(id: string) {
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function finish() {
    showToast("Your room is ready", "success");
    navigate(routes.studio);
  }

  return (
    <div className={s.page}>
      <div className={s.brand}>
        <span className={s.pulseDot} />
        <span className={s.wordmark}>
          Queer<span className={s.q}>Pulse</span>
        </span>
        <span className={s.product}>Studio</span>
      </div>

      <div className={s.inner}>
        <div className={s.eyebrow}>
          You&apos;re in · let&apos;s set your room
        </div>
        <h1>
          Welcome to the <em>room</em>, Rita.
        </h1>
        <p className={s.sub}>
          Three quick things and the first set is yours. <em>Skip any of it</em>{" "}
          — none of this is locked in.
        </p>

        <div className={s.steps}>
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={`${s.stepDot} ${step === n ? s.on : ""}`}
            />
          ))}
        </div>

        {step === 1 && (
          <StepFollow
            followed={followed}
            onToggle={toggleArtist}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <StepTip
            tip={tip}
            onPick={setTip}
            onSkip={() => setStep(3)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <StepPrivacy
            toggles={toggles}
            onToggle={toggleRow}
            onSkip={finish}
            onFinish={finish}
          />
        )}
      </div>
    </div>
  );
}
