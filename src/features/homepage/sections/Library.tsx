import { Fragment } from "react";
import { Link } from "react-router-dom";
import { Button, Reveal, SectionHead } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { linkToPath, routes } from "../../../app/routeMap";
import { libraryItems, libraryMoreCount } from "../data/libraryItems";
import styles from "./Library.module.css";

export function Library() {
  const { t } = useTranslation();

  return (
    <section className={styles.library} id="library">
      <div className="wrap">
        <Reveal>
          <SectionHead
            title={
              <Translation
                i18nKey="homepage:library.title"
                components={{ em: <em /> }}
              />
            }
            subtitle={t("homepage:library.subtitle")}
            action={
              <Button variant="ghost" to={routes.library}>
                {t("homepage:library.browseCta")}
              </Button>
            }
          />
        </Reveal>

        <div className={styles.grid}>
          {libraryItems.map((item, index) => (
            <Reveal key={item.href} delay={index * 50}>
              <Link to={linkToPath(item.href)} className={styles.card}>
                <span className={[styles.type, styles[item.type]].join(" ")}>
                  {t(item.typeLabelKey)}
                </span>
                <div className={styles.title}>{item.title}</div>
                <div className={styles.meta}>
                  {item.meta.map((part, i) => (
                    <Fragment key={part}>
                      {i > 0 && <span className={styles.dot} aria-hidden />}
                      <span>{part}</span>
                    </Fragment>
                  ))}
                </div>
              </Link>
            </Reveal>
          ))}

          <Reveal delay={libraryItems.length * 50}>
            <Link
              to={routes.library}
              className={[styles.card, styles.more].join(" ")}
            >
              <div className={styles.moreCount}>{libraryMoreCount}</div>
              <div className={styles.moreSub}>
                {t("homepage:library.moreLabel")}
              </div>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
