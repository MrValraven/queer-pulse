import { PageShell } from "../../shared/components/layout";
import { HubBackLink } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { ARTICLES } from "./constitution.data";
import styles from "./ConstitutionPage.module.css";

const N = ({ n }: { n: string }) => <span className={styles.num}>{n}</span>;

export function ConstitutionPage() {
  return (
    <PageShell>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <HubBackLink to={routes.governance} label="Governance" />
          <div className={styles.eyebrow}>
            Constitution · v1.4 · ratified 14 Nov 2025
          </div>
          <h1 className={styles.h1}>
            The <em>rulebook,</em> in plain Portuguese-flavoured English.
          </h1>
          <p className={styles.dek}>
            The formal organising document of <b>Associação QueerPulse</b>, the
            not-for-profit that operates the platform. Written by the founding
            eight. Ratified at the first assembly.{" "}
            <em>Amended four times since.</em>
          </p>
          <p className={styles.dek}>
            It is intentionally short. Twelve articles, plain language, no
            nested sub-clauses. Anything more elaborate lives in the Code of
            Conduct, the bylaws, or the resolutions of the Annual Assembly.
          </p>
          <p className={styles.meta}>
            <b>Registered:</b> Associação QueerPulse · NIPC 517 426 884 · Lisbon
            · <b>Original:</b> Portuguese (legally binding) · this is the
            English translation.
          </p>
        </div>
      </section>

      <nav className={styles.toc}>
        <div className={styles.tocInner}>
          {ARTICLES.map((a) => (
            <a key={a.id} href={`#${a.id}`}>
              {a.toc}
            </a>
          ))}
        </div>
      </nav>

      <article className={styles.body}>
        {ARTICLES.map((a) => (
          <section className={styles.art} id={a.id} key={a.id}>
            <div className={styles.artNum}>
              Article <em>{a.roman}</em>
            </div>
            <h2>{a.title}</h2>
            {a.clauses.map((c) => (
              <p className={styles.clause} key={c.n}>
                <N n={c.n} />
                {c.body}
              </p>
            ))}
            {a.quote && <p className={styles.quote}>{a.quote}</p>}
          </section>
        ))}
      </article>

      <div className={styles.version}>
        <b>Constitution v1.4</b> · ratified 14 Nov 2025 · in force since 1 Jan
        2026 · <a>Download PDF</a> · See the Assembly · Read the Code of Conduct
      </div>
    </PageShell>
  );
}
