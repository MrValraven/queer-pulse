import { useMemo, useState, type FormEvent } from "react";
import { PageShell } from "../../shared/components/layout";
import { Button, Reveal } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  PageMeta,
  JsonLd,
  buildBreadcrumbSchema,
} from "../../shared/seo";
import { routes } from "../../app/routeMap";
import {
  SUPPORTER_NAME,
  buildAssurances,
  buildLines,
  buildOpening,
  type Message,
} from "./crisisChat.data";
import styles from "./CrisisChatPage.module.css";

export function CrisisChatPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const assurances = useMemo(() => buildAssurances(t), [t]);
  const lines = useMemo(() => buildLines(t), [t]);
  const opening = useMemo(() => buildOpening(t), [t]);
  const [messages, setMessages] = useState<Message[]>(opening);
  const [draft, setDraft] = useState("");
  const pageTitle = t("safety:crisisChat.meta.title");
  const pageDescription = t("safety:crisisChat.meta.description");

  function handleSend(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { from: "me", text }]);
    setDraft("");
    showToast(t("safety:crisisChat.toast.typing", { name: SUPPORTER_NAME }));
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          from: "them",
          name: t("safety:crisisChat.chat.supporterLabel", {
            name: SUPPORTER_NAME,
          }),
          text: t("safety:crisisChat.reply.thankYou"),
        },
      ]);
    }, 1400);
  }

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("nav:resources"), path: routes.resources },
          { name: pageTitle, path: routes.crisisChat },
        ])}
      />
      <section className={styles.page}>
        <div className="wrap">
          <div className={styles.inner}>
            <div>
              <Reveal className={styles.eyebrow}>
                {t("safety:crisisChat.eyebrow")}
              </Reveal>
              <Reveal as="h1" className={styles.title} delay={60}>
                <Translation
                  i18nKey="safety:crisisChat.hero.title"
                  components={{ em: <em /> }}
                />
              </Reveal>
              <Reveal as="p" className={styles.lead} delay={120}>
                {t("safety:crisisChat.hero.lead")}
              </Reveal>

              <Reveal className={styles.assurances} delay={160}>
                {assurances.map((item) => (
                  <div key={item.label}>
                    <div className={styles.assN}>{item.n}</div>
                    <div className={styles.assL}>{item.label}</div>
                  </div>
                ))}
              </Reveal>

              <div className={styles.lines}>
                <div className={styles.linesH}>
                  {t("safety:crisisChat.lines.heading")}
                </div>
                {lines.map((line) => (
                  <div key={line.label} className={styles.line}>
                    <div>
                      <div className={styles.lineLabel}>{line.label}</div>
                      <div className={styles.lineNote}>{line.note}</div>
                    </div>
                    <a
                      href={`tel:${line.num.replace(/\s/g, "")}`}
                      className={styles.lineNum}
                    >
                      {line.num}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <Reveal className={styles.chat} delay={120}>
              <div className={styles.chatHead}>
                <span className={styles.chatDot} />
                <div>
                  <div className={styles.chatHeadName}>{SUPPORTER_NAME}</div>
                  <div className={styles.chatHeadStatus}>
                    {t("safety:crisisChat.chat.status")}
                  </div>
                </div>
              </div>
              <div className={styles.chatBody}>
                {messages.map((message, index) => (
                  <div
                    key={`${index}-${message.from}-${message.text.slice(0, 24)}`}
                    className={`${styles.bubble} ${message.from === "me" ? styles.me : styles.them}`}
                  >
                    {message.name && (
                      <span className={styles.bubbleName}>{message.name}</span>
                    )}
                    {message.text}
                  </div>
                ))}
              </div>
              <form className={styles.composer} onSubmit={handleSend}>
                <input
                  type="text"
                  placeholder={t("safety:crisisChat.composer.placeholder")}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  aria-label={t("safety:crisisChat.composer.ariaLabel")}
                />
                <Button type="submit" variant="primary">
                  {t("safety:crisisChat.composer.sendCta")}
                </Button>
              </form>
              <p className={styles.note}>{t("safety:crisisChat.note")}</p>
            </Reveal>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
