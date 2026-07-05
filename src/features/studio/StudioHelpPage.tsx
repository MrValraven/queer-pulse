import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiFileText,
  FiUser,
  FiDollarSign,
  FiMail,
  FiMessageCircle,
  FiCheckCircle,
} from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { StudioShell } from "./StudioShell";
import { StudioHelpFaq } from "./StudioHelpFaq";
import {
  HELP_CATS,
  HELP_SECTIONS,
  CONTACT_CARDS,
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
      <h4>
        {cat.pre}
        <em>{cat.em}</em>
        {cat.post}
      </h4>
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
          {card.action}
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
  const { showToast } = useToast();
  const [query, setQuery] = useState("");

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    showToast("Searching the help centre…", "info");
  }

  return (
    <StudioShell hidePlayer>
      <div className={s.wrap}>
        <div className={s.pageH}>
          <div className={s.eb}>Help · real people, real answers</div>
          <h1>
            How can we <em>help</em>?
          </h1>
          <div className={s.dek}>
            Most answers are below. If they&apos;re not, a human reads every
            message — we don&apos;t run a bot maze, and there&apos;s no tier of
            support you have to pay for.
          </div>
        </div>

        <div className={s.hpWrap}>
          <form className={s.search} onSubmit={onSearch}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search help — tipping, payouts, audio quality…"
              aria-label="Search help"
            />
            <Button type="submit" variant="primary">
              Search
            </Button>
          </form>

          <div className={s.cats}>
            {HELP_CATS.map((cat) => (
              <CategoryCard key={cat.target} cat={cat} />
            ))}
          </div>

          {HELP_SECTIONS.map((sec) => (
            <section key={sec.id} id={sec.id} className={s.sec}>
              <h2>
                {sec.pre}
                <em>{sec.em}</em>
                {sec.post}
              </h2>
              <StudioHelpFaq items={sec.items} />
            </section>
          ))}

          <section className={s.sec}>
            <h2>
              Still <em>stuck</em>?
            </h2>
            <div className={s.contact}>
              {CONTACT_CARDS.map((card, i) => (
                <ContactCardItem key={i} card={card} />
              ))}
            </div>
            <div className={s.status}>
              <span className={s.dot} />
              All systems operational ·{" "}
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
