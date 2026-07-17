import { useEffect, useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { usePrefersReducedMotion } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioShell } from "./StudioShell";
import {
  AudioInColumn,
  NowPlayingColumn,
  AsideColumn,
} from "./StudioBroadcastConsole";
import s from "./StudioBroadcastPage.module.css";

const START = 42 * 60 + 18; // 00:42:18

function fmt(total: number): string {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  return [h, m, sec].map((n) => String(n).padStart(2, "0")).join(":");
}

function StatusBar({ reduced }: { reduced: boolean }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [elapsed, setElapsed] = useState(START);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <div className={s.head}>
      <span className={`${s.liveDot} ${reduced ? s.staticDot : ""}`} />
      <span className={s.onAir}>
        <Translation
          i18nKey="studio:broadcast.status.onAir"
          components={{ em: <em /> }}
        />
      </span>
      <span className={s.pill}>{t("studio:broadcast.status.livePill")}</span>
      <span className={s.clock}>{fmt(elapsed)}</span>
      <span className={s.headMeta}>
        <Translation
          i18nKey="studio:broadcast.status.meta"
          components={{ em: <em /> }}
          values={{ count: 418, sustainers: 89, cities: 31 }}
        />
      </span>
      <div className={s.headRight}>
        <button
          type="button"
          className={s.pauseBtn}
          onClick={() =>
            showToast(t("studio:broadcast.status.toast.micPaused"), "info")
          }
        >
          {t("studio:broadcast.status.pauseMicCta")}
        </button>
        <button
          type="button"
          className={s.endBtn}
          onClick={() =>
            showToast(t("studio:broadcast.status.toast.ending"), "info")
          }
        >
          {t("studio:broadcast.status.endBroadcastCta")}
        </button>
      </div>
    </div>
  );
}

export function StudioBroadcastPage() {
  const reduced = usePrefersReducedMotion();
  return (
    <StudioShell hidePlayer>
      <div className={s.wrap}>
        <StatusBar reduced={reduced} />
        <div className={s.grid}>
          <AudioInColumn reduced={reduced} />
          <NowPlayingColumn reduced={reduced} />
          <AsideColumn reduced={reduced} />
        </div>
      </div>
    </StudioShell>
  );
}
