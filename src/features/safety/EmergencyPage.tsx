import { Link } from "react-router-dom";
import { FiZap, FiPhone } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./EmergencyPage.module.css";
import { CRISIS_NUMS, ONLINE, SECTIONS } from "./emergency.data";

export function EmergencyPage() {
  const { t } = useTranslation();
  const leaveSite = () => {
    window.location.replace("https://www.google.com");
  };

  return (
    <PageShell>
      <div className={styles.exitBar}>
        <p>{t("safety:emergency.exitBar.text")}</p>
        <button type="button" className={styles.exitBtn} onClick={leaveSite}>
          <FiZap /> {t("safety:emergency.exitBar.cta")}
        </button>
      </div>

      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>{t("safety:emergency.hero.category")}</div>
          <h1>
            <Translation
              i18nKey="safety:emergency.hero.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p>{t("safety:emergency.hero.lead")}</p>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.note}>
            <Translation
              i18nKey="safety:emergency.note"
              components={{ b: <b /> }}
            />
          </div>

          <div className={styles.crisisNow}>
            <h2>
              <FiPhone /> {t("safety:emergency.crisisNow.title")}
            </h2>
            <div className={styles.crisisNums}>
              {CRISIS_NUMS.map((c) => (
                <div className={styles.crisisNum} key={c.labelKey}>
                  <div className={styles.cnLabel}>{t(c.labelKey)}</div>
                  <div className={styles.cnNum}>{c.num}</div>
                  <div className={styles.cnNote}>{t(c.noteKey)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.sections}>
            {SECTIONS.map((section) => (
              <div className={styles.sec} key={section.titleKey}>
                <div className={styles.esHead}>
                  <div
                    className={styles.esIcon}
                    style={{ background: section.iconBg }}
                  >
                    <section.icon />
                  </div>
                  <div className={styles.esTitle}>{t(section.titleKey)}</div>
                </div>
                <p className={styles.esIntro}>{t(section.introKey)}</p>
                <div className={styles.esItems}>
                  {section.items.map((item) => (
                    <div className={styles.esItem} key={item.name}>
                      <div className={styles.esiName}>{item.name}</div>
                      <div className={styles.esiDetail}>
                        {t(item.detailKey)}
                      </div>
                      {item.link &&
                        (item.link.external ? (
                          <a
                            href={item.link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.esiLink}
                          >
                            {item.link.label}
                          </a>
                        ) : (
                          <Link to={item.link.href} className={styles.esiLink}>
                            {item.link.labelKey
                              ? t(item.link.labelKey)
                              : item.link.label}
                          </Link>
                        ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.onlineStrip}>
            <div className={styles.osTitle}>
              {t("safety:emergency.online.title")}
            </div>
            <div className={styles.osChips}>
              {ONLINE.map((o) => (
                <a
                  key={o.name}
                  className={styles.osChip}
                  href={o.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className={styles.osChipIcon}>
                    <o.icon />
                  </span>
                  <div>
                    <div className={styles.osChipName}>{o.name}</div>
                    <div className={styles.osChipSub}>{t(o.subKey)}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
