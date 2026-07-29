import { Button, ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { CuratorProfile } from "./cinemaCurator.data";
import styles from "./CinemaCuratorPage.module.css";

export function CuratorHero({ curator }: { curator: CuratorProfile }) {
  const { t } = useTranslation();
  return (
    <section className={styles.hero}>
      <div className={`wrap ${styles.heroInner}`}>
        <div className={styles.photoCol}>
          <div className={styles.photo}>
            <ImageSlot
              src={curator.portrait}
              alt={`${curator.namePre}${curator.nameEm}`}
              tint="plum"
              width="100%"
              height="100%"
              radius={20}
              placeholder={t("cinema:slot.curatorPortrait")}
              style={{ position: "absolute", inset: 0 }}
              loading="eager"
              fetchPriority="high"
            />
          </div>
        </div>

        <div>
          <div className={styles.kicker}>
            {curator.kicker.map((k, i) => (
              <span key={k.label} className={styles.kickerGroup}>
                {i > 0 && <span className={styles.dot} />}
                <span className={k.jade ? styles.jade : undefined}>
                  {k.label}
                </span>
              </span>
            ))}
          </div>
          <h1 className={styles.name}>
            {curator.namePre}
            <em>{curator.nameEm}</em>
          </h1>
          <div className={styles.pron}>{curator.pronouns}</div>
          <div className={styles.identity}>
            {curator.identity.map((id) => (
              <span key={id}>{id}</span>
            ))}
          </div>
          <p className={styles.bio}>{curator.bio}</p>
          <div className={styles.pull}>
            <p>{curator.pull}</p>
          </div>
          <div className={styles.stats}>
            {curator.stats.map((s) => (
              <div key={s.k} className={styles.stat}>
                <div className="k">{s.k}</div>
                <div className="v">{s.v}</div>
              </div>
            ))}
          </div>
          <div className={styles.links}>
            {curator.links.map((l) => (
              <Button key={l.label} variant="ghost-dark" to={l.to}>
                {l.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
