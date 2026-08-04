import { useState } from "react";
import { Button, Tabs } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { FACTS, LOBBY, TABS, type WatchTab } from "./watchPage.data";
import styles from "./WatchPage.module.css";

/** Maps FACTS's plain-English keys (data.ts tuple labels) to catalog keys —
 * chrome field labels, resolved via t(). */
const FACTS_LABEL_KEYS: Record<string, string> = {
  Director: "cinema:watch.facts.director",
  Runtime: "cinema:watch.facts.runtime",
  Year: "cinema:watch.facts.year",
  Captions: "cinema:film.facts.captions",
};

interface ChatLine {
  id: string;
  name: string;
  badge: string;
  when: string;
  body: string;
  mine?: boolean;
}

const SEED_CHAT: ChatLine[] = LOBBY.map((message, index) => ({
  id: `seed-${index}`,
  ...message,
}));

/** The right-hand companion panel: film info, watch-party lobby and live Q&A,
 * switched via the shared underline `Tabs`. */
export function WatchSidePanel() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<WatchTab>("film-info");
  const [messages, setMessages] = useState<ChatLine[]>(SEED_CHAT);
  const [draft, setDraft] = useState("");

  function send() {
    const body = draft.trim();
    if (!body) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `me-${Date.now()}`,
        name: "You",
        badge: "",
        when: "now",
        body,
        mine: true,
      },
    ]);
    setDraft("");
  }

  const tabs = TABS.map((tabDef) => ({
    id: tabDef.id,
    label: t(tabDef.labelKey),
  }));

  return (
    <aside className={styles.sidePanel}>
      <Tabs
        className={styles.watchTabs}
        variant="underline"
        tint="dark"
        tabs={tabs}
        active={tab}
        onChange={(id) => setTab(id as WatchTab)}
      />

      {tab === "film-info" && (
        <div className={styles.spBody}>
          <div className={styles.spTitle}>
            The light <em>between</em> rooms
          </div>
          <div className={styles.spMeta}>
            Maria Vasconcelos · Portugal, 2025 · 92 min
          </div>
          <div className={styles.spNote}>
            "A patient, generous film about Lisbon's working-class queer elders.{" "}
            <em>Stay for the second hour.</em>"
            <span className="who">— João Ribeiro, programmer</span>
          </div>
          <div className={styles.spFacts}>
            {FACTS.map(([factKey, factValue]) => (
              <div key={factKey} className={styles.spFact}>
                <span className="k">{t(FACTS_LABEL_KEYS[factKey] ?? factKey)}</span>
                <span className="v">{factValue}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {(tab === "lobby" || tab === "live-qna") && (
        <>
          <div className={styles.spBody}>
            {messages.map((message) => (
              <div key={message.id} className={styles.lobbyMsg}>
                <div className={styles.lobbyHead}>
                  <span className="name">{message.name}</span>
                  {message.badge && <span className="badge">{message.badge}</span>}
                  <span className="when">{message.when}</span>
                </div>
                <div className={styles.lobbyBody}>{message.body}</div>
              </div>
            ))}
          </div>
          <div className={styles.spInput}>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  send();
                }
              }}
              aria-label={
                tab === "live-qna"
                  ? t("cinema:watch.sidePanel.qnaPlaceholder", { name: "Maria" })
                  : t("cinema:watch.sidePanel.lobbyPlaceholder")
              }
              placeholder={
                tab === "live-qna"
                  ? t("cinema:watch.sidePanel.qnaPlaceholder", { name: "Maria" })
                  : t("cinema:watch.sidePanel.lobbyPlaceholder")
              }
            />
            <Button
              style={{ padding: "8px 14px", fontSize: 12.5 }}
              onClick={send}
              disabled={!draft.trim()}
            >
              {t("cinema:watch.sidePanel.sendCta")}
            </Button>
          </div>
        </>
      )}
    </aside>
  );
}
