import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button, ImageSlot } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { films } from "./data";
import {
  CONTENT_NOTES,
  FACTS,
  LOBBY,
  NEXT_UP_STILL_BY_ID,
  TABS,
  type WatchTab,
} from "./watchPage.data";
import styles from "./WatchPage.module.css";
import { routes } from "../../app/routeMap";

const nextUp = films.filter((f) => f.id !== "cascais").slice(0, 3);

/** Maps FACTS's plain-English keys (data.ts tuple labels) to catalog keys —
 * chrome field labels, resolved via t() in WatchSidePanel. */
const FACTS_LABEL_KEYS: Record<string, string> = {
  Director: "cinema:watch.facts.director",
  Runtime: "cinema:watch.facts.runtime",
  Year: "cinema:watch.facts.year",
  Captions: "cinema:film.facts.captions",
};

// Focusable-descendant selector for the Tab focus-trap (mirrors Modal.tsx).
const WATCH_OVERLAY_FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function WatchOverlay({ onDismiss }: { onDismiss: () => void }) {
  const { t } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  // Latest-callback ref so the focus-setup effect runs once on mount (deps `[]`)
  // without an inline `onDismiss` re-running the initial focus + trap on every
  // parent render, which would yank focus back mid-interaction.
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  });
  useScrollLock();

  // Content-advisory dialog contract: Escape-to-dismiss, an initial focus into
  // the card, a Tab focus-trap so keyboard/screen-reader users can't tab out to
  // the inert page behind, and focus restore on close. (Mirrors Modal.tsx.)
  useEffect(() => {
    const card = cardRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusables = (): HTMLElement[] =>
      card
        ? Array.from(
            card.querySelectorAll<HTMLElement>(WATCH_OVERLAY_FOCUSABLE),
          ).filter((element) => element.offsetParent !== null)
        : [];

    const firstFocusable = focusables()[0];
    if (firstFocusable) firstFocusable.focus();
    else card?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onDismissRef.current();
        return;
      }
      if (event.key !== "Tab" || !card) return;
      const items = focusables();
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (!firstItem || !lastItem) {
        event.preventDefault();
        card.focus();
        return;
      }
      const activeElement = document.activeElement;
      if (event.shiftKey && (activeElement === firstItem || activeElement === card)) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, []);

  return (
    <div className={styles.overlay}>
      <div
        ref={cardRef}
        tabIndex={-1}
        className={styles.overlayCard}
        role="dialog"
        aria-modal="true"
        aria-label={t("cinema:watch.overlay.ariaLabel")}
      >
        <div className={styles.overlayIcon}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
          >
            <circle cx={12} cy={12} r={10} />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
        </div>
        <div className={styles.overlayHead}>
          <Translation
            i18nKey="cinema:watch.overlay.heading"
            components={{ em: <em /> }}
          />
        </div>
        <div className={styles.overlaySub}>
          {t("cinema:watch.overlay.sub", { count: CONTENT_NOTES.length })}
        </div>
        <div className={styles.overlayNotes}>
          {CONTENT_NOTES.map((n) => (
            <div key={n.k} className={styles.overlayRow}>
              <span className="k">{n.k}</span>
              <span>{n.detail}</span>
              <span className="t">{n.tc}</span>
            </div>
          ))}
        </div>
        <div className={styles.overlayActions}>
          <Button size="lg" onClick={onDismiss}>
            {t("cinema:watch.overlay.readyCta")}
          </Button>
          <Button variant="ghost-dark" to={routes.film}>
            {t("cinema:watch.overlay.backCta")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function WatchPlayState() {
  return (
    <div className={styles.playState}>
      <div className={styles.playBtn}>
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7L8 5z" />
        </svg>
      </div>
      <div className={styles.psTitle}>
        The light <em>between</em> rooms
      </div>
      <div className={styles.psMeta}>Paused at 31:44 · 60 min remaining</div>
    </div>
  );
}

export function WatchControls({
  cc,
  ad,
  onCcToggle,
  onAdToggle,
}: {
  cc: boolean;
  ad: boolean;
  onCcToggle: () => void;
  onAdToggle: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.controls}>
      <div className={styles.progress}>
        <div className={styles.progressFill} />
        <div className={styles.cnMarker} style={{ left: "31.1%" }} />
        <div
          className={styles.cnMarker}
          style={{ left: "46.5%", background: "rgba(247,243,238,.3)" }}
        />
        <div
          className={styles.cnMarker}
          style={{ left: "55.2%", background: "rgba(247,243,238,.3)" }}
        />
      </div>
      <div className={styles.controlsRow}>
        <span className={styles.ctrlBtn}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
          >
            <polygon points="19 20 9 12 19 4 19 20" />
            <line x1={5} y1={19} x2={5} y2={5} />
          </svg>
        </span>
        <span className={`${styles.ctrlBtn} ${styles.primary}`}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7L8 5z" />
          </svg>
        </span>
        <span className={styles.ctrlBtn}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
          >
            <polygon points="5 4 15 12 5 20 5 4" />
            <line x1={19} y1={5} x2={19} y2={19} />
          </svg>
        </span>
        <span className={styles.ctrlTime}>
          <span className="cur">31:44</span> / 1:32:18
        </span>
        <div className={styles.ctrlSpace} />
        <button
          type="button"
          className={[styles.ctrlPill, cc && styles.ctrlPillOn]
            .filter(Boolean)
            .join(" ")}
          aria-pressed={cc}
          aria-label={t("cinema:watch.controls.ccAria")}
          onClick={onCcToggle}
        >
          CC EN
        </button>
        <button
          type="button"
          className={[styles.ctrlPill, ad && styles.ctrlPillOn]
            .filter(Boolean)
            .join(" ")}
          aria-pressed={ad}
          aria-label={t("cinema:watch.controls.adAria")}
          onClick={onAdToggle}
        >
          AD
        </button>
        <select className={styles.ctrlLang} defaultValue="en">
          <option value="pt">
            {t("cinema:watch.controls.subtitleLang.pt")}
          </option>
          <option value="en">
            {t("cinema:watch.controls.subtitleLang.en")}
          </option>
          <option value="es">
            {t("cinema:watch.controls.subtitleLang.es")}
          </option>
          <option value="none">
            {t("cinema:watch.controls.subtitleLang.none")}
          </option>
        </select>
      </div>
    </div>
  );
}

interface ChatLine {
  id: string;
  name: string;
  badge: string;
  when: string;
  body: string;
  mine?: boolean;
}

const SEED_CHAT: ChatLine[] = LOBBY.map((m, i) => ({ id: `seed-${i}`, ...m }));

export function WatchSidePanel() {
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

  const { t } = useTranslation();
  return (
    <aside className={styles.sidePanel}>
      <div className={styles.spTabs}>
        {TABS.map((tabDef) => (
          <button
            type="button"
            key={tabDef.id}
            className={[styles.spTab, tab === tabDef.id && styles.spTabActive]
              .filter(Boolean)
              .join(" ")}
            aria-current={tab === tabDef.id}
            onClick={() => setTab(tabDef.id)}
          >
            {t(tabDef.labelKey)}
            {tabDef.id === "live-qna" && <span className={styles.spDot} />}
          </button>
        ))}
      </div>

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
            {FACTS.map(([k, v]) => (
              <div key={k} className={styles.spFact}>
                <span className="k">{t(FACTS_LABEL_KEYS[k] ?? k)}</span>
                <span className="v">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {(tab === "lobby" || tab === "live-qna") && (
        <>
          <div className={styles.spBody}>
            {messages.map((m) => (
              <div key={m.id} className={styles.lobbyMsg}>
                <div className={styles.lobbyHead}>
                  <span className="name">{m.name}</span>
                  {m.badge && <span className="badge">{m.badge}</span>}
                  <span className="when">{m.when}</span>
                </div>
                <div className={styles.lobbyBody}>{m.body}</div>
              </div>
            ))}
          </div>
          <div className={styles.spInput}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={
                tab === "live-qna"
                  ? t("cinema:watch.sidePanel.qnaPlaceholder", {
                      name: "Maria",
                    })
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

export function WatchBelow() {
  const { t } = useTranslation();
  return (
    <section className={styles.below}>
      <div className={`wrap ${styles.belowGrid}`}>
        <div>
          <h2>
            <Translation
              i18nKey="cinema:watch.below.nextUpTitle"
              components={{ em: <em /> }}
            />
          </h2>
          <div className={styles.nextGrid}>
            {nextUp.map((film) => (
              <Link key={film.id} to={routes.film} className={styles.nf}>
                <div className={styles.nfPoster}>
                  <ImageSlot
                    src={NEXT_UP_STILL_BY_ID[film.id] ?? film.image}
                    tint={film.tint}
                    width="100%"
                    height="100%"
                    radius={10}
                    placeholder={t("cinema:slot.poster")}
                    style={{ position: "absolute", inset: 0 }}
                  />
                </div>
                <div className={styles.nfTitle}>
                  {film.titlePre}
                  {film.titleEm && <em>{film.titleEm}</em>}
                  {film.titlePost}
                </div>
                <div className={styles.nfMeta}>{film.meta}</div>
              </Link>
            ))}
          </div>
        </div>

        <div className={styles.split}>
          <div className={styles.splitHead}>
            {t("cinema:watch.below.splitHeading")}
          </div>
          <div className={styles.splitBar}>
            <div className={`${styles.splitSeg} ${styles.fm}`} />
            <div className={`${styles.splitSeg} ${styles.py}`} />
            <div className={`${styles.splitSeg} ${styles.hs}`} />
          </div>
          <div className={styles.splitLegend}>
            <div>
              <span className="v">
                <em>80%</em>
              </span>
              {t("cinema:watch.below.splitLegend.filmmaker")}
            </div>
            <div>
              <span className="v">12%</span>
              {t("cinema:watch.below.splitLegend.payments")}
            </div>
            <div>
              <span className="v">8%</span>
              {t("cinema:watch.below.splitLegend.hosting")}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
