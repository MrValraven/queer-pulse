import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { COMMITMENTS, OUTCLAUSE_REST, ROLES } from "./coHostInvite.data";
import styles from "./CoHostInvitePage.module.css";

/** The co-host invite's "what you'd do" role list and time-commitment grid. */
export function CoHostInviteDetails({ host }: { host: string }) {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.roleCard}>
        <h3>
          <Translation
            i18nKey="gatherings:cohostInvite.rolesTitle"
            components={{ em: <em /> }}
          />
        </h3>
        <div>
          {ROLES.map((r) => (
            <div className={styles.roleRow} key={r.title}>
              <div className={styles.roleIc}>{r.ic}</div>
              <div className={styles.roleText}>
                <b>{r.title}</b>
                <span>{r.description}</span>
              </div>
              <div className={`${styles.rolePerm} ${styles[r.permCls]}`}>
                {t(r.permKey, { host })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.commitCard}>
        <h3>
          <Translation
            i18nKey="gatherings:cohostInvite.commitTitle"
            components={{ em: <em /> }}
          />
        </h3>
        <p className={styles.commitSub}>{t("gatherings:cohostInvite.commitSub")}</p>
        <div className={styles.commitGrid}>
          {COMMITMENTS.map((c) => (
            <div className={styles.commit} key={c.b}>
              <b>{c.b}</b>
              <span>{c.s}</span>
            </div>
          ))}
        </div>
        <p className={styles.outclause}>
          <b>{t("gatherings:cohostInvite.outclauseBold")}</b>{OUTCLAUSE_REST}
        </p>
      </div>
    </>
  );
}
