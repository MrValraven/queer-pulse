import { useState } from "react";
import { StudioShell } from "./StudioShell";
import { StudioTipModal } from "./StudioTipModal";
import { StudioLiveNow } from "./StudioLiveNow";
import { StudioLiveChat } from "./StudioLiveChat";
import { useTranslation } from "../../shared/i18n/useTranslation";
import s from "./live.module.css";

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
          "Vespertina, vol. iv" · programmed &amp; hosted by Sara Marques
        </span>
        <span className={s.clock}>
          Wed 9 Jun · <em>21:18 Lisbon</em> · 1h 42m show, 22 min in
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
