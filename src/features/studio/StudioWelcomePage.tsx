import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Button, ImageSlot } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { routes } from "../../app/routeMap";
import {
  WELCOME_ARTISTS,
  TIP_CHIPS,
  DEFAULT_TIP,
  TOGGLE_ROWS,
} from "./studioWelcome.data";
import s from "./StudioWelcomePage.module.css";

/** Mock signed-in member's first name — content, not chrome. */
const CURRENT_MEMBER_NAME = "Rita";

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
  const { t } = useTranslation();
  return (
    <div className={s.stepCard}>
      <h2>
        <Translation
          i18nKey="studio:welcome.step1.title"
          components={{ em: <em /> }}
        />
      </h2>
      <div className={s.scDek}>
        <Translation
          i18nKey="studio:welcome.step1.dek"
          components={{ em: <em /> }}
        />
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
          <Translation
            i18nKey="studio:welcome.step1.followedCount"
            components={{ em: <em /> }}
            values={{ count: followed.size }}
          />
        </span>
        <Button variant="primary" onClick={onNext}>
          {t("studio:welcome.nextCta")}{" "}
          <FiArrowRight aria-hidden />
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
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={s.stepCard}>
      <h2>
        <Translation
          i18nKey="studio:welcome.step2.title"
          components={{ em: <em /> }}
        />
      </h2>
      <div className={s.scDek}>
        <Translation
          i18nKey="studio:welcome.step2.dek"
          components={{ em: <em /> }}
        />
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
            {fmt.currency(c.amount)}
            <small>{t(c.noteKey)}</small>
          </button>
        ))}
      </div>
      <div className={s.nav}>
        <button type="button" className={s.skip} onClick={onSkip}>
          {t("studio:welcome.skipCta")}
        </button>
        <Button variant="primary" onClick={onNext}>
          {t("studio:welcome.nextCta")}{" "}
          <FiArrowRight aria-hidden />
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
  const { t } = useTranslation();
  return (
    <div className={s.stepCard}>
      <h2>
        <Translation
          i18nKey="studio:welcome.step3.title"
          components={{ em: <em /> }}
        />
      </h2>
      <div className={s.scDek}>
        <Translation
          i18nKey="studio:welcome.step3.dek"
          components={{ em: <em /> }}
        />
      </div>
      {TOGGLE_ROWS.map((r) => {
        const on = toggles[r.id];
        const title = t(r.titleKey);
        return (
          <div key={r.id} className={s.opt}>
            <div className={s.optText}>
              <h4>{title}</h4>
              <p>{t(r.bodyKey)}</p>
            </div>
            <button
              type="button"
              className={`${s.tgSw} ${on ? s.on : ""}`}
              role="switch"
              aria-checked={on}
              aria-label={title}
              onClick={() => onToggle(r.id)}
            />
          </div>
        );
      })}
      <div className={s.nav}>
        <button type="button" className={s.skip} onClick={onSkip}>
          {t("studio:welcome.skipCta")}
        </button>
        <Button variant="jade" onClick={onFinish}>
          {t("studio:welcome.enterRoomCta")}{" "}
          <FiArrowRight aria-hidden />
        </Button>
      </div>
    </div>
  );
}

export function StudioWelcomePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useTranslation();

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
    showToast(t("studio:welcome.readyToast"), "success");
    void navigate(routes.studio);
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
          <Translation
            i18nKey="studio:welcome.eyebrow"
            components={{ em: <em /> }}
          />
        </div>
        <h1>
          <Translation
            i18nKey="studio:welcome.title"
            components={{ em: <em /> }}
            values={{ name: CURRENT_MEMBER_NAME }}
          />
        </h1>
        <p className={s.sub}>
          <Translation
            i18nKey="studio:welcome.sub"
            components={{ em: <em /> }}
          />
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
