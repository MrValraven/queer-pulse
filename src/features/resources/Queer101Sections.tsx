import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, HubBackLink, Outro } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  FAQ,
  GLOSSARY,
  RESOURCES,
  RES_CLASS,
  RES_TYPE_LABEL_KEY,
  TALK,
} from "./queer101.data";
import { SuggestEditModal } from "./SuggestEditModal";
import styles from "./Queer101Page.module.css";

export function Queer101Hero() {
  const { t } = useTranslation();
  return (
    <div className={styles.hero}>
      <div className="wrap">
        <HubBackLink
          to={routes.resources}
          label={t("resources:queer101.hero.backLink")}
          tone="light"
        />
        <div className={styles.label}>{t("resources:queer101.hero.label")}</div>
        <h1>
          <Translation
            i18nKey="resources:queer101.hero.title"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.lead}>{t("resources:queer101.hero.lead")}</p>
        <div className={styles.reassure}>
          <div className={styles.reassureNote}>
            <span className={styles.dot} />
            {t("resources:queer101.hero.reassure.noAccount")}
          </div>
          <div className={styles.reassureNote}>
            <span className={styles.dot} />
            {t("resources:queer101.hero.reassure.private")}
          </div>
          <div className={styles.reassureNote}>
            <span className={styles.dot} />
            {t("resources:queer101.hero.reassure.leaveReturn")}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Queer101Faq() {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className={styles.sec}>
      <div className="wrap">
        <h2 className={styles.h}>
          <Translation
            i18nKey="resources:queer101.faq.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.sub}>{t("resources:queer101.faq.sub")}</p>
        <div className={styles.faqList}>
          {FAQ.map((f, i) => (
            <div
              key={f.qKey}
              className={[styles.faqItem, openFaq === i && styles.faqItemOpen]
                .filter(Boolean)
                .join(" ")}
            >
              <button
                type="button"
                className={styles.faqQ}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className={styles.faqQText}>{t(f.qKey)}</span>
                <span className={styles.faqArrow}>+</span>
              </button>
              {openFaq === i && <div className={styles.faqA}>{t(f.aKey)}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Queer101Glossary() {
  const { t } = useTranslation();
  const [editOpen, setEditOpen] = useState(false);
  const [query, setQuery] = useState("");
  const q = query.toLowerCase();

  const glossary = GLOSSARY.filter(
    (g) =>
      !q ||
      g.keywords.includes(q) ||
      `${t(g.termKey)} ${t(g.defKey)}`.toLowerCase().includes(q),
  );

  return (
    <div className={`${styles.sec} ${styles.secCream}`}>
      <div className="wrap">
        <div className={styles.glossHeadRow}>
          <div>
            <h2 className={styles.h}>
              <Translation
                i18nKey="resources:queer101.glossary.title"
                components={{ em: <em /> }}
              />
            </h2>
            <p className={styles.sub} style={{ marginBottom: 0 }}>
              {t("resources:queer101.glossary.sub")}
            </p>
          </div>
          <button
            type="button"
            className={styles.glossEditBtn}
            onClick={() => setEditOpen(true)}
          >
            {t("resources:queer101.glossary.suggestEditCta")}
          </button>
        </div>
        <input
          className={styles.glossSearch}
          type="search"
          placeholder={t("resources:queer101.glossary.searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className={styles.glossGrid}>
          {glossary.map((g) => (
            <div className={styles.glossCard} key={g.termKey}>
              <div className={styles.glossTerm}>{t(g.termKey)}</div>
              <div className={styles.glossDef}>{t(g.defKey)}</div>
            </div>
          ))}
        </div>
        <div className={styles.glossNotice}>
          {t("resources:queer101.glossary.notice")}
        </div>
      </div>
      {editOpen && <SuggestEditModal onClose={() => setEditOpen(false)} />}
    </div>
  );
}

export function Queer101Resources() {
  const { t } = useTranslation();
  return (
    <div className={styles.sec}>
      <div className="wrap">
        <h2 className={styles.h}>
          <Translation
            i18nKey="resources:queer101.resources.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.sub}>{t("resources:queer101.resources.sub")}</p>
        <div className={styles.resGrid}>
          {RESOURCES.map((r) => (
            <div className={styles.resCard} key={r.title}>
              <div className={`${styles.resType} ${styles[RES_CLASS[r.type]]}`}>
                {t(RES_TYPE_LABEL_KEY[r.type])}
              </div>
              <div className={styles.resTitle}>{r.title}</div>
              <div className={styles.resBy}>{r.by}</div>
              <div className={styles.resDesc}>{t(r.descKey)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Queer101TalkOptions() {
  const { t } = useTranslation();
  return (
    <div className={`${styles.sec} ${styles.dark}`}>
      <div className="wrap">
        <div className={styles.talkBox}>
          <h3>
            <Translation
              i18nKey="resources:queer101.talk.title"
              components={{ em: <em /> }}
            />
          </h3>
          <p>{t("resources:queer101.talk.body")}</p>
          <div className={styles.talkOptions}>
            {TALK.map((item) => (
              <div className={styles.talkOpt} key={item.titleKey}>
                <div className={styles.talkOptTitle}>{t(item.titleKey)}</div>
                <div className={styles.talkOptDesc}>{t(item.descKey)}</div>
                <Link to={item.link.href} className={styles.talkOptLink}>
                  {t(item.link.labelKey)}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Queer101Outro() {
  const { t } = useTranslation();
  return (
    <Outro
      title={
        <Translation
          i18nKey="resources:queer101.outro.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("resources:queer101.outro.sub")}
    >
      <Button to={routes.requestInvite} variant="primary" size="lg">
        {t("resources:queer101.outro.joinCta")}
      </Button>
      <Button to={routes.communities} variant="ghost-dark" size="lg">
        {t("resources:queer101.outro.exploreCta")}
      </Button>
    </Outro>
  );
}
