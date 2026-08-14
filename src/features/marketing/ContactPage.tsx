import { useState } from "react";
import type { IconType } from "react-icons";
import {
  FiArrowRight,
  FiMail,
  FiShield,
  FiFileText,
  FiUsers,
} from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, FormField, Outro, Reveal, Select } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import { useSubmitInquiry } from "./api/useSubmitInquiry";
import s from "./ContactPage.module.css";

const CONTACT_EMAIL = "hello@queerpulse.com";

const ROUTES: {
  icon: IconType;
  background: string;
  titleKey: string;
  descKey: string;
}[] = [
  {
    icon: FiMail,
    background: "rgba(232,119,90,.12)",
    titleKey: "marketing:contact.routes.general.title",
    descKey: "marketing:contact.routes.general.desc",
  },
  {
    icon: FiShield,
    background: "rgba(74,140,111,.12)",
    titleKey: "marketing:contact.routes.safety.title",
    descKey: "marketing:contact.routes.safety.desc",
  },
  {
    icon: FiFileText,
    background: "rgba(45,27,61,.08)",
    titleKey: "marketing:contact.routes.press.title",
    descKey: "marketing:contact.routes.press.desc",
  },
  {
    icon: FiUsers,
    background: "rgba(232,119,90,.1)",
    titleKey: "marketing:contact.routes.partnerships.title",
    descKey: "marketing:contact.routes.partnerships.desc",
  },
];

export function ContactPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const submitInquiry = useSubmitInquiry();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", topic: "", message: "" });
  const valid =
    form.name.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    form.topic &&
    form.message.trim();

  const handleSubmit = () => {
    if (!valid || submitInquiry.isPending) return;
    submitInquiry.mutate(
      {
        kind: "contact",
        name: form.name.trim(),
        email: form.email.trim(),
        subject: t(`marketing:contact.form.topic.${form.topic}`),
        body: form.message.trim(),
      },
      {
        onSuccess: () => setSent(true),
        onError: () => showToast(t("marketing:contact.form.error"), "error"),
      },
    );
  };
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
                <a
                  key={r.titleKey}
                  className={s.route}
                  href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t(r.titleKey))}`}
                  aria-label={t(r.titleKey)}
                >
                  <span className={s.routeIcon} style={{ background: r.background }}>
                    <r.icon />
                  </span>
                  <div>
                    <h3>{t(r.titleKey)}</h3>
                    <p>{t(r.descKey)}</p>
                    <span className={s.rLink}>
                      {t("marketing:contact.routes.cta")}{" "}
                      <FiArrowRight aria-hidden />
                    </span>
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
                  handleSubmit();
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
                  <Select
                    placeholder={t("marketing:contact.form.topicPick")}
                    options={[
                      "general",
                      "safety",
                      "press",
                      "partnership",
                      "other",
                    ].map((topic) => ({
                      value: topic,
                      label: t(`marketing:contact.form.topic.${topic}`),
                    }))}
                    value={form.topic || null}
                    onChange={(value) =>
                      setForm({ ...form, topic: value ?? "" })
                    }
                  />
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
                  disabled={!valid || submitInquiry.isPending}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {submitInquiry.isPending
                    ? t("marketing:contact.form.sendingCta")
                    : t("marketing:contact.form.sendCta")}{" "}
                  <FiArrowRight aria-hidden />
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
