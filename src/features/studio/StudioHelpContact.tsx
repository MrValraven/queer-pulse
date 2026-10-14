import { useId } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiHelpCircle,
  FiMail,
  FiMessageCircle,
} from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { HELP_CONTACT_CARDS, type HelpContactCard } from "./studioHelp.data";
import { useStudioShowcase } from "./useStudioShowcase";
import s from "./StudioHelpPage.module.css";

const CONTACT_ICON = {
  team: FiMessageCircle,
  email: FiMail,
  platform: FiHelpCircle,
} as const;

// Status page domain: a fixed name, kept out of the catalog.
const STATUS_DOMAIN = "status.queerpulse.org";

/** "Still stuck?": the three ways to reach our team, plus the demo's status
 *  line. No reply-time promise in live. */
export function StudioHelpContact() {
  const { t } = useTranslation();
  const isShowcase = useStudioShowcase();
  const headingId = useId();
  return (
    <section className={s.sec} aria-labelledby={headingId}>
      <h2 id={headingId}>
        <Translation
          i18nKey="studio:helpLive.contact.heading"
          components={{ em: <em /> }}
        />
      </h2>
      <div className={s.contact}>
        {HELP_CONTACT_CARDS.map((card) => (
          <ContactCard key={card.id} card={card} />
        ))}
      </div>
      {isShowcase && (
        <div className={s.status}>
          <span className={s.dot} />
          {t("studio:help.statusOperational")}{" "}
          <a
            href={`https://${STATUS_DOMAIN}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {STATUS_DOMAIN}
          </a>
        </div>
      )}
    </section>
  );
}

function ContactCard({ card }: { card: HelpContactCard }) {
  const { t } = useTranslation();
  const Icon = CONTACT_ICON[card.id];
  const label = t(card.actionKey);
  return (
    <div className={[s.cc, card.isJade && s.ccJade].filter(Boolean).join(" ")}>
      <Icon className={s.ccIcon} aria-hidden />
      <h3>
        <Translation i18nKey={card.titleKey} components={{ em: <em /> }} />
      </h3>
      <p>{t(card.bodyKey)}</p>
      {card.to ? (
        <Link to={card.to} className={s.bt}>
          {label} <FiArrowRight aria-hidden />
        </Link>
      ) : (
        <a href={card.href} className={s.bt}>
          {label}
        </a>
      )}
    </div>
  );
}
