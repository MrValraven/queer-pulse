import { useState } from "react";
import type { IconType } from "react-icons";
import { FiMail, FiShield, FiFileText, FiUsers } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, FormField, Outro, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import s from "./ContactPage.module.css";

const ROUTES: {
  icon: IconType;
  background: string;
  titleKey: string;
  descKey: string;
  email: string;
}[] = [
  {
    icon: FiMail,
    background: "rgba(232,119,90,.12)",
    titleKey: "marketing:contact.routes.general.title",
    descKey: "marketing:contact.routes.general.desc",
    email: "hello@queerpulse.pt",
  },
  {
    icon: FiShield,
    background: "rgba(74,140,111,.12)",
    titleKey: "marketing:contact.routes.safety.title",
    descKey: "marketing:contact.routes.safety.desc",
    email: "safe@queerpulse.pt",
  },
  {
    icon: FiFileText,
    background: "rgba(45,27,61,.08)",
    titleKey: "marketing:contact.routes.press.title",
    descKey: "marketing:contact.routes.press.desc",
    email: "press@queerpulse.pt",
  },
  {
    icon: FiUsers,
    background: "rgba(232,119,90,.1)",
    titleKey: "marketing:contact.routes.partnerships.title",
    descKey: "marketing:contact.routes.partnerships.desc",
    email: "partners@queerpulse.pt",
  },
];

export function ContactPage() {
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", topic: "", message: "" });
  const valid =
    form.name.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    form.topic &&
    form.message.trim();
  const pageTitle = t("marketing:contact.meta.title");
  const pageDescription = t("marketing:contact.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("shared:megaNav.about.title"), path: routes.about },
          { name: pageTitle, path: routes.contact },
        ])}
      />
      <div className="wrap">
        <div className={s.grid}>
          <Reveal className={s.intro}>
            <div className={s.eyebrow}>
              <span className={s.live} /> {t("marketing:contact.eyebrow")}
            </div>
            <h1>
              <Translation
                i18nKey="marketing:contact.hero.title"
                components={{ em: <em /> }}
              />
            </h1>
            <p>{t("marketing:contact.hero.body")}</p>
            <div className={s.routes}>
              {ROUTES.map((r) => (
                <a key={r.email} className={s.route} href={`mailto:${r.email}`}>
                  <span className={s.routeIcon} style={{ background: r.background }}>
                    <r.icon />
                  </span>
                  <div>
                    <h3>{t(r.titleKey)}</h3>
                    <p>{t(r.descKey)}</p>
                    <span className={s.rLink}>{r.email} →</span>
                  </div>
                </a>
              ))}
            </div>
          </Reveal>

          <Reveal className={s.form} delay={90}>
            {sent ? (
              <div className={s.sent}>
                <div className={s.tyIcon}>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12.5l4 4L19 7"
                      stroke="var(--jade)"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h2>
                  <Translation
                    i18nKey="marketing:contact.sent.title"
                    components={{ em: <em /> }}
                  />
                </h2>
                <p>{t("marketing:contact.sent.body")}</p>
                <Button variant="ghost" to={routes.homepage}>
                  {t("marketing:contact.sent.backCta")}
                </Button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (valid) setSent(true);
                }}
              >
                <h2>
                  <Translation
                    i18nKey="marketing:contact.form.title"
                    components={{ em: <em /> }}
                  />
                </h2>
                <p className={s.sub}>{t("marketing:contact.form.sub")}</p>
                <FormField label={t("marketing:contact.form.nameLabel")}>
                  <input
                    type="text"
                    placeholder={t("marketing:contact.form.namePlaceholder")}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </FormField>
                <FormField label={t("marketing:contact.form.emailLabel")}>
                  <input
                    type="email"
                    placeholder={t("marketing:contact.form.emailPlaceholder")}
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </FormField>
                <FormField label={t("marketing:contact.form.topicLabel")}>
                  <select
                    value={form.topic}
                    onChange={(e) =>
                      setForm({ ...form, topic: e.target.value })
                    }
                  >
                    <option value="">
                      {t("marketing:contact.form.topicPick")}
                    </option>
                    <option value="general">
                      {t("marketing:contact.form.topic.general")}
                    </option>
                    <option value="safety">
                      {t("marketing:contact.form.topic.safety")}
                    </option>
                    <option value="press">
                      {t("marketing:contact.form.topic.press")}
                    </option>
                    <option value="partnership">
                      {t("marketing:contact.form.topic.partnership")}
                    </option>
                    <option value="other">
                      {t("marketing:contact.form.topic.other")}
                    </option>
                  </select>
                </FormField>
                <FormField label={t("marketing:contact.form.messageLabel")}>
                  <textarea
                    placeholder={t("marketing:contact.form.messagePlaceholder")}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </FormField>
                <Button
                  type="submit"
                  size="lg"
                  disabled={!valid}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {t("marketing:contact.form.sendCta")}
                </Button>
              </form>
            )}
          </Reveal>
        </div>
      </div>

      <Outro
        title={
          <Translation
            i18nKey="marketing:contact.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:contact.outro.sub")}
      >
        <Button to={routes.homepage} size="lg">
          {t("marketing:contact.outro.backCta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
