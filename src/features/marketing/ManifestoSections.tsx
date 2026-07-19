import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  LAST_SIGNED_MINUTES_AGO,
  LAST_SIGNER_NAME,
  SIGNER_EXTRA,
  SIGNER_TOTAL,
  SIGNERS,
} from "./manifesto.data";
import styles from "./ManifestoPage.module.css";

/** The seven numbered stanzas, in order. `p3` only exists on stanza 04. */
const STANZAS = [
  { n: "01", paragraphs: ["p1", "p2"] },
  { n: "02", paragraphs: ["p1", "p2"] },
  { n: "03", paragraphs: ["p1", "p2"] },
  { n: "04", paragraphs: ["p1", "p2", "p3"] },
  { n: "05", paragraphs: ["p1", "p2"] },
  { n: "06", paragraphs: ["p1", "p2"] },
  { n: "07", paragraphs: ["p1", "p2"] },
];

/** Inline runs the manifesto prose uses. `a` only appears in stanza 07. */
const RUNS = {
  em: <em />,
  strong: <strong />,
  // eslint-disable-next-line jsx-a11y/anchor-has-content -- false positive: an element template for <Translation>, which clones it with the translated children at render.
  a: <a href="mailto:manifesto@queerpulse.app" />,
};

function Sep() {
  return (
    <div className={styles.sep}>
      <span className={styles.sepDot} />
    </div>
  );
}

function Stanza({ n, paragraphs }: { n: string; paragraphs: string[] }) {
  return (
    <div className={styles.stanza}>
      <div className={styles.stanzaNum}>
        {n[0]}
        <em>{n[1]}</em>
      </div>
      <h2 className={styles.h2}>
        <Translation
          i18nKey={`marketing:manifesto.stanza${n}.title`}
          components={RUNS}
        />
      </h2>
      {paragraphs.map((p) => (
        <p key={p} className={styles.p}>
          <Translation
            i18nKey={`marketing:manifesto.stanza${n}.${p}`}
            components={RUNS}
          />
        </p>
      ))}
    </div>
  );
}

function Pull({ i18nKey }: { i18nKey: string }) {
  return (
    <p className={styles.pull}>
      <Translation i18nKey={i18nKey} components={RUNS} />
    </p>
  );
}

export function ManifestoBody() {
  return (
    <article className={styles.body}>
      <Stanza n="01" paragraphs={STANZAS[0]!.paragraphs} />
      <Sep />
      <Stanza n="02" paragraphs={STANZAS[1]!.paragraphs} />
      <Pull i18nKey="marketing:manifesto.pull1" />
      <Stanza n="03" paragraphs={STANZAS[2]!.paragraphs} />
      <Sep />
      <Stanza n="04" paragraphs={STANZAS[3]!.paragraphs} />
      <Pull i18nKey="marketing:manifesto.pull2" />
      <Stanza n="05" paragraphs={STANZAS[4]!.paragraphs} />
      <Sep />
      <Stanza n="06" paragraphs={STANZAS[5]!.paragraphs} />
      <Stanza n="07" paragraphs={STANZAS[6]!.paragraphs} />
    </article>
  );
}

export function ManifestoSigners({ onSign }: { onSign: () => void }) {
  const { t } = useTranslation();
  const fmt = useFormat();

  return (
    <section className={styles.sigs}>
      <div className={styles.sigsInner}>
        <h3>
          <Translation
            i18nKey="marketing:manifesto.signers.title"
            components={{ em: <em /> }}
            values={{
              count: SIGNER_TOTAL,
              formatted: fmt.number(SIGNER_TOTAL),
            }}
          />
        </h3>
        <p className={styles.sub}>{t("marketing:manifesto.signers.sub")}</p>
        <div className={styles.sigGrid}>
          {SIGNERS.map((s) => (
            <div className={styles.sigCard} key={s.name}>
              <div
                className={styles.sigAv}
                style={s.bg ? { background: s.bg, color: s.color } : undefined}
              >
                {s.initials}
              </div>
              <span className={styles.sigName}>{s.name}</span>
            </div>
          ))}
          <button
            type="button"
            className={`${styles.sigCard} ${styles.sigAdd}`}
            onClick={onSign}
          >
            +{" "}
            <span className={styles.sigName}>
              {t("marketing:manifesto.signers.addCta")}
            </span>
          </button>
        </div>
        <p className={styles.sigCount}>
          <Translation
            i18nKey="marketing:manifesto.signers.more"
            components={{ b: <b /> }}
            values={{
              formatted: fmt.number(SIGNER_EXTRA),
              name: LAST_SIGNER_NAME,
              time: t("marketing:manifesto.signers.minutesAgo", {
                count: LAST_SIGNED_MINUTES_AGO,
              }),
            }}
          />
        </p>
      </div>
    </section>
  );
}

export function ManifestoActions({ onSign }: { onSign: () => void }) {
  const { t } = useTranslation();
  return (
    <div className={styles.actions}>
      <div className={styles.actionsRow}>
        <Button type="button" variant="primary" onClick={onSign}>
          {t("marketing:manifesto.actions.addName")}
        </Button>
        <Button type="button" variant="ghost" onClick={() => window.print()}>
          {t("marketing:manifesto.actions.print")}
        </Button>
        <Button to={routes.governance} variant="ghost">
          {t("marketing:manifesto.actions.governance")}
        </Button>
      </div>
    </div>
  );
}
