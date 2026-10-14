import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useTheme } from "../../app/providers/themeContext";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_CROSSFADE_MAX_SECONDS } from "./api/studio.types";
import { useStudioPlaybackPreferences } from "./api/useStudioPlaybackPreferences";
import { Collapse } from "../../shared/components/ui";
import { StudioLoadError } from "./StudioLoadStates";
import { Toggle } from "./StudioSettingsControls";
import s from "./StudioSettingsPage.module.css";

function SettingsSection({
  labelKey,
  titleKey,
  children,
}: {
  labelKey: string;
  titleKey: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  return (
    <section className={s.sec} aria-labelledby={headingId}>
      <div className={s.secLbl}>{t(labelKey)}</div>
      <h2 id={headingId}>
        <Translation i18nKey={titleKey} components={{ em: <em /> }} />
      </h2>
      {children}
    </section>
  );
}

function ToggleOption({
  headingKey,
  bodyKey,
  isOn,
  isLoading,
  onToggle,
}: {
  headingKey: string;
  bodyKey: string;
  isOn: boolean;
  /** Until the stored row has loaded a switch does nothing. */
  isLoading: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={`${s.opt} ${isLoading ? s.optLoading : ""}`}>
      <div className={s.ot}>
        <h3>{t(headingKey)}</h3>
        <p>{t(bodyKey)}</p>
      </div>
      <Toggle
        on={isOn}
        onToggle={onToggle}
        isDisabled={isLoading}
        label={t(headingKey)}
      />
    </div>
  );
}

/** The crossfade slider. It moves freely and saves once let go, so a drag
 *  across the range sends one write. */
function CrossfadeOption({
  seconds,
  isLoading,
  onCommit,
}: {
  seconds: number;
  isLoading: boolean;
  onCommit: (seconds: number) => void;
}) {
  const { t } = useTranslation();
  const [draftSeconds, setDraftSeconds] = useState<number | null>(null);
  const shownSeconds = draftSeconds ?? seconds;
  const isOff = shownSeconds === 0;
  const isAwaitingStoredValue = useRef(false);
  // After a commit the draft stays on screen until the stored value moves
  // (the optimistic write, then a rollback if the save is refused), so the
  // thumb never falls back to the old value for a frame.
  useEffect(() => {
    if (!isAwaitingStoredValue.current) return;
    isAwaitingStoredValue.current = false;
    setDraftSeconds(null);
  }, [seconds]);
  const commit = () => {
    if (draftSeconds === null) return;
    if (draftSeconds === seconds) {
      setDraftSeconds(null);
      return;
    }
    isAwaitingStoredValue.current = true;
    onCommit(draftSeconds);
  };
  return (
    <div className={`${s.opt} ${s.optBlock}`}>
      <div className={s.ot}>
        <h3>{t("studio:settingsLive.crossfade.heading")}</h3>
        <p>{t("studio:settingsLive.crossfade.body")}</p>
      </div>
      <div className={s.rangeRow}>
        <input
          type="range"
          className={s.range}
          min={0}
          max={STUDIO_CROSSFADE_MAX_SECONDS}
          step={1}
          value={shownSeconds}
          style={
            {
              "--fill": `${(shownSeconds / STUDIO_CROSSFADE_MAX_SECONDS) * 100}%`,
            } as CSSProperties
          }
          aria-disabled={isLoading}
          aria-label={t("studio:settingsLive.crossfade.sliderLabel")}
          aria-valuetext={
            isOff
              ? t("studio:settingsLive.crossfade.off")
              : t("studio:settingsLive.crossfade.valueText", {
                  count: shownSeconds,
                })
          }
          onChange={(event) => {
            if (!isLoading) setDraftSeconds(Number(event.target.value));
          }}
          onPointerUp={commit}
          onKeyUp={commit}
          onBlur={commit}
        />
        <span className={s.rangeValue} aria-hidden>
          {isOff
            ? t("studio:settingsLive.crossfade.off")
            : t("studio:settingsLive.crossfade.seconds", {
                count: shownSeconds,
              })}
        </span>
      </div>
    </div>
  );
}

/**
 * Studio's real player settings, in both modes (spec 6.2): Playback
 * (Autoplay next and Crossfade), Content (Hide explicit tracks) and Theme
 * (the app theme the account menu switches too).
 */
export function StudioPlaybackSettings() {
  const { preferences, isLoading, isError, loadState, savePreferences } =
    useStudioPlaybackPreferences();
  // Until the stored row is on screen the controls only show defaults.
  const isAwaitingRow = isLoading || isError;
  const { theme, toggleTheme } = useTheme();
  return (
    <>
      <Collapse isOpen={isError}>
        <StudioLoadError loadState={loadState} />
      </Collapse>
      <SettingsSection
        labelKey="studio:settingsLive.playback.label"
        titleKey="studio:settingsLive.playback.title"
      >
        <ToggleOption
          headingKey="studio:settingsLive.autoplay.heading"
          bodyKey="studio:settingsLive.autoplay.body"
          isOn={preferences.autoplayNext}
          isLoading={isAwaitingRow}
          onToggle={() =>
            savePreferences({ autoplayNext: !preferences.autoplayNext })
          }
        />
        <CrossfadeOption
          seconds={preferences.crossfadeSeconds}
          isLoading={isAwaitingRow}
          onCommit={(crossfadeSeconds) => savePreferences({ crossfadeSeconds })}
        />
      </SettingsSection>

      <SettingsSection
        labelKey="studio:settingsLive.content.label"
        titleKey="studio:settingsLive.content.title"
      >
        <ToggleOption
          headingKey="studio:settingsLive.hideExplicit.heading"
          bodyKey="studio:settingsLive.hideExplicit.body"
          isOn={preferences.hideExplicit}
          isLoading={isAwaitingRow}
          onToggle={() =>
            savePreferences({ hideExplicit: !preferences.hideExplicit })
          }
        />
      </SettingsSection>

      <SettingsSection
        labelKey="studio:settingsLive.theme.label"
        titleKey="studio:settingsLive.theme.title"
      >
        <ToggleOption
          headingKey="studio:settingsLive.theme.dark.heading"
          bodyKey="studio:settingsLive.theme.dark.body"
          isOn={theme === "dark"}
          isLoading={false}
          onToggle={toggleTheme}
        />
      </SettingsSection>
    </>
  );
}
