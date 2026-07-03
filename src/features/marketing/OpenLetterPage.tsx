import { useMemo, useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
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
    showToast(`Signature added · ${fmt(next)} total`, "success");
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
            <span>Open letter · {OPEN_LETTER.partners}</span>
            <span className={s.sep}>·</span>
            <span className={s.live}>
              Live · {OPEN_LETTER.daysLeft} days left
            </span>
          </div>
          <h1 className={s.h1}>{OPEN_LETTER.title}</h1>
          <p className={s.addressed}>
            Addressed to <b>{OPEN_LETTER.addressedTo}</b> · {OPEN_LETTER.date}
          </p>

          <div className={s.counter}>
            <div>
              <div className={s.countNum}>
                {whole}
                <em>{frac}</em>{" "}
                <span className={s.countGoal}>
                  / {fmt(OPEN_LETTER.goal)} signatures
                </span>
              </div>
              <div className={s.countLabel}>
                Members of QP &amp; partner orgs · last signed <b>{last.at}</b>{" "}
                by {last.by}
              </div>
            </div>
            <div className={s.progress}>
              <div className={s.pbar}>
                <span style={{ width: `${pct}%` }} />
              </div>
              <div className={s.pct}>
                <b>{pct}%</b> · {OPEN_LETTER.handoverNote}
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
