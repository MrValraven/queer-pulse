import { useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import s from "./live.module.css";
import { CHAT, TABS, type Msg } from "./studioLive.data";

export function StudioLiveChat({ onTip }: { onTip: () => void }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const [tab, setTab] = useState("chat");
  // Demo-only room chat: a sent line is appended locally so it actually appears
  // (studio is coming-soon in live). Mirrors cinema's WatchSidePanel.send().
  const [messages, setMessages] = useState<Msg[]>(CHAT);
  const [draft, setDraft] = useState("");

  function send() {
    const body = draft.trim();
    if (!body) return;
    setMessages((prev) => [
      ...prev,
      {
        av: "·",
        name: <Translation i18nKey="studioShowcase:live.chat.you" />,
        text: body,
        time: <Translation i18nKey="studioShowcase:live.chat.justNow" />,
      },
    ]);
    setDraft("");
  }

  return (
    <aside className={s.chat}>
      <div className={s.chatTabs}>
        {TABS.map((tabOption) => (
          <button
            type="button"
            key={tabOption.id}
            className={[s.chatTab, tab === tabOption.id && s.chatTabOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setTab(tabOption.id)}
          >
            {t(tabOption.labelKey)}{" "}
            {tabOption.ct && <span className={s.ct}>{tabOption.ct}</span>}
          </button>
        ))}
      </div>
      <div className={s.chatBody}>
        {messages.map((mAny, i) => {
          if ("systemLine" in mAny) {
            return (
              <div
                key={`sys-${mAny.systemLine.key}`}
                className={`${s.msg} ${s.msgSystem}`}
              >
                <div className={s.text}>
                  {t(mAny.systemLine.key, mAny.systemLine.values)}
                </div>
              </div>
            );
          }
          const m = mAny;
          return (
            <div
              key={`msg-${i}-${m.av}`}
              className={[s.msg, m.tip && s.msgTip].filter(Boolean).join(" ")}
            >
              <span
                className={[
                  s.mAv,
                  m.tone === "jade" && s.jade,
                  m.tone === "plum" && s.plum,
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {m.av}
              </span>
              <div>
                <span
                  className={[s.mName, m.curator && s.curator]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {m.name}
                </span>
                {m.roleKey && (
                  <span
                    className={`${s.mRole} ${m.roleClass === "cu" ? s.cu : m.roleClass === "artist" ? s.artist : ""}`}
                  >
                    {t(m.roleKey)}
                  </span>
                )}
                <div className={s.mText}>{m.text}</div>
                <div className={s.mTime}>{m.time}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className={s.chatFoot}>
        <div className={s.chatInput}>
          <input
            aria-label={t("studio:liveChat.inputPlaceholder")}
            placeholder={t("studio:liveChat.inputPlaceholder")}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                send();
              }
            }}
          />
          <button
            type="button"
            aria-label={t("studio:liveChat.sendAria")}
            title={t("studio:liveChat.sendAria")}
            onClick={send}
            disabled={!draft.trim()}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />
            </svg>
          </button>
        </div>
        <div className={s.chatActions}>
          <button type="button" onClick={onTip}>
            {t("studio:liveChat.tipPresetCta", { amount: fmt.currency(2) })}
          </button>
          <button type="button" onClick={onTip}>
            {t("studio:liveChat.tipPresetCta", { amount: fmt.currency(5) })}
          </button>
          <button type="button" onClick={onTip}>
            {t("studio:liveChat.tipCustomCta")}
          </button>
        </div>
      </div>
    </aside>
  );
}
