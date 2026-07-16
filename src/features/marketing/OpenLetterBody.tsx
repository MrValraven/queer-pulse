import { Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ASKS, SIGNATORIES } from "./openLetter.data";
import s from "./OpenLetterPage.module.css";

const SIGNATORY_ROLE_KEYS: Record<string, string> = {
  "Catarina Vaz": "marketing:openLetter.sig.transHub",
  "Filipa Mendes": "marketing:openLetter.sig.ilgaDirector",
};

/** The open letter itself — prose, asks, and the lead signatories. */
export function OpenLetterBody() {
  const { t } = useTranslation();
  return (
    <article className={s.letter}>
      <p>{t("marketing:openLetter.body.addressee")}</p>
      <p className={s.lead}>
        <Translation
          i18nKey="marketing:openLetter.body.lead"
          components={{ em: <em /> }}
        />
      </p>
      <p>
        <Translation
          i18nKey="marketing:openLetter.body.p2"
          components={{ strong: <strong />, em: <em /> }}
        />
      </p>
      <p>{t("marketing:openLetter.body.p3")}</p>

      <h3>
        <Translation
          i18nKey="marketing:openLetter.body.asksTitle"
          components={{ em: <em /> }}
        />
      </h3>
      <p>{t("marketing:openLetter.body.asksLead")}</p>
      <ol>
        {ASKS.map((a) => (
          <li key={a.leadKey}>
            <b>{t(a.leadKey)}</b>
            {t(a.bodyKey)}
          </li>
        ))}
      </ol>

      <h3>
        <Translation
          i18nKey="marketing:openLetter.body.whyNowTitle"
          components={{ em: <em /> }}
        />
      </h3>
      <p>
        <Translation
          i18nKey="marketing:openLetter.body.whyNowP1"
          components={{ em: <em /> }}
        />
      </p>
      <p>
        <Translation
          i18nKey="marketing:openLetter.body.whyNowP2"
          components={{ strong: <strong /> }}
        />
      </p>

      <h3>
        <Translation
          i18nKey="marketing:openLetter.body.whatWeDoTitle"
          components={{ em: <em /> }}
        />
      </h3>
      <p>
        <Translation
          i18nKey="marketing:openLetter.body.whatWeDoP1"
          components={{ em: <em /> }}
        />
      </p>
      <p>{t("marketing:openLetter.body.whatWeDoP2")}</p>

      <p className={s.kicker}>
        <Translation
          i18nKey="marketing:openLetter.body.kicker"
          components={{ strong: <strong /> }}
        />
      </p>

      <Reveal className={s.signBlock}>
        {SIGNATORIES.map((sig) => (
          <div key={sig.name} style={{ display: "flex", gap: 14 }}>
            <div
              className={`${s.signAv} ${sig.tint === "jade" ? s.signAvJade : ""}`}
            >
              {sig.av}
            </div>
            <div className={s.signText}>
              <b>{sig.name}</b>
              <span>
                {SIGNATORY_ROLE_KEYS[sig.name]
                  ? t(SIGNATORY_ROLE_KEYS[sig.name]!)
                  : sig.role}
              </span>
            </div>
          </div>
        ))}
      </Reveal>
    </article>
  );
}
