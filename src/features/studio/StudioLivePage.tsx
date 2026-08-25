import { useState } from "react";
import { StudioShell } from "./StudioShell";
import { StudioTipModal } from "./StudioTipModal";
import { StudioLiveNow } from "./StudioLiveNow";
import { StudioLiveChat } from "./StudioLiveChat";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import s from "./live.module.css";

// Content: today's mock broadcast schedule (show title, host, date/time,
// duration) — comes from the broadcast record in live mode.
const SHOW_TITLE = "Vespertina, vol. iv";
const SHOW_HOST = "Sara Marques";
const SHOW_SCHEDULE_LINE = "Wed 9 Jun · ";
const SHOW_TIME = "21:18 Lisbon";
const SHOW_DURATION_SUFFIX = " · 1h 42m show, 22 min in";

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
          {SHOW_DURATION_SUFFIX}
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
