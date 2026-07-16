import { useMemo, useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { OpenLetterBody } from "./OpenLetterBody";
import { OpenLetterSidebar } from "./OpenLetterSidebar";
import {
  OPEN_LETTER,
  RECENT_SIGNATURES,
  type Signature,
} from "./openLetter.data";
import s from "./OpenLetterPage.module.css";

const fmt = (n: number) => n.toLocaleString("en-US");

export function OpenLetterPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [count, setCount] = useState(OPEN_LETTER.startCount);
  const [signatures, setSignatures] = useState<Signature[]>(RECENT_SIGNATURES);
  const [signed, setSigned] = useState(false);
  const [last, setLast] = useState(OPEN_LETTER.lastSigned);

  const pct = Math.min(100, Math.round((count / OPEN_LETTER.goal) * 100));

  const handleSign = (entry: Signature) => {
    const next = count + 1;
    setCount(next);
    setSignatures((prev) => [entry, ...prev].slice(0, 6));
    setSigned(true);
    setLast({ at: "just now", by: entry.name });
    showToast(
      t("marketing:openLetter.toast.signatureAdded", { total: fmt(next) }),
      "success",
    );
  };

  const [whole, frac] = useMemo(() => {
    const str = fmt(count);
    const cut = str.length - 3;
    return [str.slice(0, cut), str.slice(cut)];
  }, [count]);

  return (
    <PageShell>
      <section className={s.hero}>
        <div className={s.heroInner}>
          <div className={s.eyebrow}>
            <span>
              {t("marketing:openLetter.hero.eyebrowPrefix", {
                partners: OPEN_LETTER.partners,
              })}
            </span>
            <span className={s.sep}>·</span>
            <span className={s.live}>
              {t("marketing:openLetter.hero.live", {
                count: OPEN_LETTER.daysLeft,
                days: OPEN_LETTER.daysLeft,
              })}
            </span>
          </div>
          <h1 className={s.h1}>{OPEN_LETTER.title}</h1>
          <p className={s.addressed}>
            <Translation
              i18nKey="marketing:openLetter.hero.addressed"
              components={{ b: <b /> }}
              values={{ to: OPEN_LETTER.addressedTo, date: OPEN_LETTER.date }}
            />
          </p>

          <div className={s.counter}>
            <div>
              <div className={s.countNum}>
                {whole}
                <em>{frac}</em>{" "}
                <span className={s.countGoal}>
                  {t("marketing:openLetter.hero.countGoalSuffix", {
                    goal: fmt(OPEN_LETTER.goal),
                  })}
                </span>
              </div>
              <div className={s.countLabel}>
                <Translation
                  i18nKey="marketing:openLetter.hero.countLabel"
                  components={{ b: <b /> }}
                  values={{ at: last.at, by: last.by }}
                />
              </div>
            </div>
            <div className={s.progress}>
              <div className={s.pbar}>
                <span style={{ width: `${pct}%` }} />
              </div>
              <div className={s.pct}>
                <Translation
                  i18nKey="marketing:openLetter.hero.pctLabel"
                  components={{ b: <b /> }}
                  values={{ pct, note: OPEN_LETTER.handoverNote }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className={s.page}>
        <OpenLetterBody />
        <OpenLetterSidebar
          signatures={signatures}
          signed={signed}
          onSign={handleSign}
        />
      </div>
    </PageShell>
  );
}
