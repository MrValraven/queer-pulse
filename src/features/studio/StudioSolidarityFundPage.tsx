import { FiArrowRight } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioFundBalance } from "./StudioFundBalance";
import { StudioFundFlows } from "./StudioFundFlows";
import { StudioFundLog } from "./StudioFundLog";
import { StudioShell } from "./StudioShell";
import { StudioSolidarityFundLive } from "./StudioSolidarityFundLive";
import { useStudioShowcase } from "./useStudioShowcase";
import s from "./funding.module.css";

function StudioSolidarityFundShowcase() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  return (
    <div className={s.wrap}>
      <div className={s.hero}>
        <div className={s.eb}>
          <span className={s.live} /> {t("studio:fund.hero.liveLabel")}
        </div>
        <h1>
          <Translation
            i18nKey="studio:fund.hero.title"
            components={{ em: <em /> }}
          />
        </h1>
        <div className={s.dek}>
          <Translation
            i18nKey="studio:fund.hero.dek"
            components={{ em: <em /> }}
          />
        </div>
      </div>
      <StudioFundBalance />
      <StudioFundFlows />
      <StudioFundLog />
      <div className={s.apply}>
        <div>
          <h2>
            <Translation
              i18nKey="studio:fund.apply.heading"
              components={{ em: <em /> }}
            />
          </h2>
          <p>
            <Translation
              i18nKey="studio:demo.fund.applyBody"
              components={{ em: <em /> }}
            />
          </p>
        </div>
        <div className={s.acts}>
          <Button
            variant="jade"
            size="lg"
            onClick={() =>
              showToast(t("studio:fund.apply.requestToast"), "info")
            }
          >
            {t("studio:fund.apply.requestCta")}
          </Button>
          <Button to={routes.studioCalls} variant="ghost" size="lg">
            {t("studio:fund.apply.seeGrantsCta")} <FiArrowRight aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}

/** /studio/solidarity-fund. Live: a short page that points at music
 *  fundraisers in Funding & Grants. The demo keeps the ledger. */
export function StudioSolidarityFundPage() {
  const isShowcase = useStudioShowcase();
  return (
    <StudioShell>
      {isShowcase ? (
        <StudioSolidarityFundShowcase />
      ) : (
        <StudioSolidarityFundLive />
      )}
    </StudioShell>
  );
}
