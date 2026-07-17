import { Link } from "react-router-dom";
import { StudioShell } from "./StudioShell";
import { StudioFundBalance } from "./StudioFundBalance";
import { StudioFundFlows } from "./StudioFundFlows";
import { StudioFundLog } from "./StudioFundLog";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import s from "./funding.module.css";

export function StudioSolidarityFundPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();

  return (
    <StudioShell>
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
            {/* Not swept — eligibility/commitment copy (§6 of the i18n sweep
                brief): the no-means-test promise below needs a native pt-PT
                reviewer's precision, not a guess. Renders in English via the
                fallback chain. Flagged in the sweep report. */}
            <p>
              If you're a member having a hard month, the emergency strand is a
              short form and a fast yes —{" "}
              <em>no portfolio, no means test, no shame</em>. Transcribers and
              translators are paid per accepted piece; grants open each quarter.
            </p>
          </div>
          <div className={s.acts}>
            <button
              type="button"
              className={`${s.bt} ${s.btJade} ${s.btLg}`}
              onClick={() =>
                showToast(t("studio:fund.apply.requestToast"), "info")
              }
            >
              {t("studio:fund.apply.requestCta")}
            </button>
            <Link to={routes.studioCalls} className={`${s.bt} ${s.btLg}`}>
              {t("studio:fund.apply.seeGrantsCta")}
            </Link>
          </div>
        </div>
      </div>
    </StudioShell>
  );
}
