import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { CURATORS, type CuratorProfile } from "./cinemaCurator.data";
import styles from "./CinemaCuratorPage.module.css";

const AV_CLASS = {
  coral: styles.avCoral,
  jade: styles.avJade,
  plum: styles.avPlum,
} as const;

export function CuratorAside({ curator }: { curator: CuratorProfile }) {
  const name = curator.namePre.trim();
  const others = Object.values(CURATORS).filter((c) => c.slug !== curator.slug);

  return (
    <aside className={styles.aside}>
      <div className={styles.ca}>
        <div className={styles.caHead}>Other curators</div>
        <div className={styles.otherCur}>
          {others.map((c) => (
            <Link
              key={c.slug}
              to={`${routes.cinemaCurator}/${c.slug}`}
              className={styles.ocRow}
            >
              <div className={`${styles.ocAv} ${AV_CLASS[c.tone]}`}>
                {c.initials}
              </div>
              <div>
                <div className={styles.ocName}>
                  {c.namePre}
                  {c.nameEm}
                </div>
                <div className={styles.ocFocus}>{c.focus.join(" · ")}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className={styles.ca}>
        <div className={styles.caHead}>Contact</div>
        <div className={styles.caBody}>
          For press enquiries, screening proposals, or collection suggestions —
          reach {name} through the co-op.
        </div>
        <Button variant="ghost" to={routes.contact} style={{ width: "100%" }}>
          Contact {name}
        </Button>
      </div>

      <div className={styles.ca}>
        <div className={styles.caHead}>Propose a collection</div>
        <div className={styles.caBody}>
          Have a thesis? A set of films that argue something together? Write to
          the council.
        </div>
        <Button variant="ghost" to={routes.contact} style={{ width: "100%" }}>
          Propose →
        </Button>
      </div>
    </aside>
  );
}
