import { useState } from "react";
import { StudioShell } from "./StudioShell";
import { StudioTipModal } from "./StudioTipModal";
import { StudioLiveNow } from "./StudioLiveNow";
import { StudioLiveChat } from "./StudioLiveChat";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import s from "./live.module.css";

// Today's mock broadcast schedule: show title, host and the formatted
// date/time stay literal; the duration phrase resolves through
// `studioShowcase:live.ribbon.duration` with the figures below.
const SHOW_TITLE = "Vespertina, vol. iv";
const SHOW_HOST = "Sara Marques";
const SHOW_SCHEDULE_LINE = "Wed 10 Jun · ";
const SHOW_TIME = "21:18 Lisbon";
const SHOW_LENGTH = "1h 42m";
const SHOW_ELAPSED = "22 min";

export function StudioLivePage() {
  const { t } = useTranslation();
  const [tipOpen, setTipOpen] = useState(false);
  const openTip = () => setTipOpen(true);

  return (
    <StudioShell>
      <div className={s.ribbon}>
        <span className={s.live} />
        {t("studio:live.ribbon.onAirNow")}
        <span className={s.show}>
          <Translation
            i18nKey="studio:live.ribbon.showLine"
            values={{ title: SHOW_TITLE, host: SHOW_HOST }}
          />
        </span>
        <span className={s.clock}>
          {SHOW_SCHEDULE_LINE}
          <em>{SHOW_TIME}</em>
          {" · "}
          {t("studioShowcase:live.ribbon.duration", {
            length: SHOW_LENGTH,
            elapsed: SHOW_ELAPSED,
          })}
        </span>
      </div>

      <div className={s.grid}>
        <StudioLiveNow onTip={openTip} />
        <StudioLiveChat onTip={openTip} />
      </div>

      {tipOpen && (
        <StudioTipModal
          recipient="Mariana Sol"
          onClose={() => setTipOpen(false)}
        />
      )}
    </StudioShell>
  );
}
