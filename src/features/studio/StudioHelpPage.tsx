import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiFileText,
  FiUser,
  FiDollarSign,
  FiMail,
  FiMessageCircle,
  FiCheckCircle,
  FiArrowRight,
} from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { StudioShell } from "./StudioShell";
import { StudioHelpFaq } from "./StudioHelpFaq";
import {
  buildHelpCats,
  buildHelpSections,
  buildContactCards,
  type HelpCat,
  type ContactCard,
} from "./studioHelp.data";
import s from "./StudioHelpPage.module.css";

const CAT_ICON = {
  note: FiFileText,
  user: FiUser,
  coin: FiDollarSign,
} as const;

const CONTACT_ICON = {
  mail: FiMail,
  chat: FiMessageCircle,
  check: FiCheckCircle,
} as const;

function jump(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function CategoryCard({ cat }: { cat: HelpCat }) {
  const Icon = CAT_ICON[cat.icon];
  return (
    <button type="button" className={s.cat} onClick={() => jump(cat.target)}>
      <Icon className={s.catIcon} aria-hidden />
      <h4>{cat.heading}</h4>
      <p>{cat.blurb}</p>
    </button>
  );
}

function ContactCardItem({ card }: { card: ContactCard }) {
  const { showToast } = useToast();
  const Icon = CONTACT_ICON[card.icon];
  return (
    <div className={`${s.cc} ${card.jade ? s.ccJade : ""}`}>
      <Icon className={s.ccIcon} aria-hidden />
      <h4>{card.title}</h4>
      <p>{card.body}</p>
      {card.to ? (
        <Link to={card.to} className={s.bt}>
          {card.action} <FiArrowRight aria-hidden />
        </Link>
      ) : (
        <button
          type="button"
          className={s.bt}
          onClick={() => showToast(card.toast!, "info")}
        >
          {card.action}
        </button>
      )}
    </div>
  );
}

export function StudioHelpPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const helpCats = useMemo(() => buildHelpCats(t), [t]);
  const helpSections = useMemo(() => buildHelpSections(t), [t]);
  const contactCards = useMemo(() => buildContactCards(t), [t]);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    showToast(t("studio:help.searchingToast"), "info");
  }

  return (
    <StudioShell hidePlayer>
      <div className={s.wrap}>
        <div className={s.pageH}>
          <div className={s.eb}>{t("studio:help.hero.eyebrow")}</div>
          <h1>
            <Translation
              i18nKey="studio:help.hero.title"
              components={{ em: <em /> }}
            />
          </h1>
          <div className={s.dek}>{t("studio:help.hero.dek")}</div>
        </div>

        <div className={s.hpWrap}>
          <form className={s.search} onSubmit={onSearch}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("studio:help.searchPlaceholder")}
              aria-label={t("studio:help.searchAria")}
            />
            <Button type="submit" variant="primary">
              {t("studio:help.searchCta")}
            </Button>
          </form>

          <div className={s.cats}>
            {helpCats.map((cat) => (
              <CategoryCard key={cat.target} cat={cat} />
            ))}
          </div>

          {helpSections.map((sec) => (
            <section key={sec.id} id={sec.id} className={s.sec}>
              <h2>{sec.heading}</h2>
              <StudioHelpFaq items={sec.items} />
            </section>
          ))}

          <section className={s.sec}>
            <h2>
              <Translation
                i18nKey="studio:help.stillStuck.title"
                components={{ em: <em /> }}
              />
            </h2>
            <div className={s.contact}>
              {contactCards.map((card, i) => (
                <ContactCardItem key={i} card={card} />
              ))}
            </div>
            <div className={s.status}>
              <span className={s.dot} />
              {t("studio:help.statusOperational")}{" "}
              <a
                href="https://status.queerpulse.org"
                target="_blank"
                rel="noreferrer"
              >
                status.queerpulse.org
              </a>
            </div>
          </section>
        </div>
      </div>
    </StudioShell>
  );
}
