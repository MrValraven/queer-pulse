import { useEffect, useMemo, useRef, useState } from "react";
import { FiSend } from "react-icons/fi";
import { Button, IconButton, tabIds } from "../../shared/components/ui";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { StudioEuroAmount } from "./StudioEuroAmount";
import { StudioTablist } from "./StudioTablist";
import s from "./live.module.css";
import chatStyles from "./StudioLiveChat.module.css";
import { CHAT, TABS, type Msg } from "./studioLive.data";

type ChatTabId = "chat" | "tips" | "listeners";
type PersonMsg = Exclude<Msg, { systemLine: unknown }>;

const NEAR_BOTTOM_PX = 80;
const CHAT_TABLIST_ID_PREFIX = "studio-live-chat";

/** One chat line: system notice or a person's message. */
function ChatLine({ message }: { message: Msg }) {
  const { t } = useTranslation();
  if ("systemLine" in message) {
    return (
      <div className={`${s.msg} ${s.msgSystem}`}>
        <div className={s.text}>
          {t(message.systemLine.key, message.systemLine.values)}
        </div>
      </div>
    );
  }
  return (
    <div className={[s.msg, message.tip && s.msgTip].filter(Boolean).join(" ")}>
      <span
        className={[
          s.mAv,
          message.tone === "jade" && s.jade,
          message.tone === "plum" && s.plum,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {message.av}
      </span>
      <div>
        <span
          className={[s.mName, message.curator && s.curator]
            .filter(Boolean)
            .join(" ")}
        >
          {message.name}
        </span>
        {message.roleKey && (
          <span
            className={`${s.mRole} ${message.roleClass === "cu" ? s.cu : message.roleClass === "artist" ? s.artist : ""}`}
          >
            {t(message.roleKey)}
          </span>
        )}
        <div className={s.mText}>{message.text}</div>
        <div className={s.mTime}>{message.time}</div>
      </div>
    </div>
  );
}

export function StudioLiveChat({ onTip }: { onTip: () => void }) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const [activeTab, setActiveTab] = useState<ChatTabId>("chat");
  // Demo-only room chat: a sent line is appended locally so it actually appears
  // (studio is coming-soon in live). Mirrors cinema's WatchSidePanel.send().
  const [messages, setMessages] = useState<Msg[]>(CHAT);
  const [draft, setDraft] = useState("");
  const chatBodyRef = useRef<HTMLDivElement>(null);

  const tabs = useMemo(
    () =>
      TABS.map((tab) => ({
        id: tab.id as ChatTabId,
        labelKey: tab.labelKey,
        badge: tab.ct ? (
          <>
            {" "}
            <span className={s.ct}>{tab.ct}</span>
          </>
        ) : undefined,
      })),
    [],
  );
  const personMessages = messages.filter(
    (message): message is PersonMsg => !("systemLine" in message),
  );
  const tipMessages = personMessages.filter((message) => message.tip);
  const listeners = personMessages.filter(
    (message, index) =>
      personMessages.findIndex((other) => other.av === message.av) === index,
  );

  // Follow the newest line only while the reader sits near the bottom, or
  // right after their own send, so reading older lines is never interrupted.
  const isNearBottomRef = useRef(true);
  const shouldFollowRef = useRef(false);
  function handleBodyScroll() {
    const chatBody = chatBodyRef.current;
    if (!chatBody) return;
    isNearBottomRef.current =
      chatBody.scrollHeight - chatBody.scrollTop - chatBody.clientHeight <
      NEAR_BOTTOM_PX;
  }
  useEffect(() => {
    const chatBody = chatBodyRef.current;
    if (!chatBody || activeTab !== "chat") return;
    if (!isNearBottomRef.current && !shouldFollowRef.current) return;
    shouldFollowRef.current = false;
    chatBody.scrollTo({
      top: chatBody.scrollHeight,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [messages.length, activeTab, reducedMotion]);

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
    shouldFollowRef.current = true;
    setDraft("");
  }

  const panelIds = tabIds(CHAT_TABLIST_ID_PREFIX, activeTab);

  return (
    <aside className={s.chat}>
      <StudioTablist
        tabs={tabs}
        activeId={activeTab}
        onChange={setActiveTab}
        idPrefix={CHAT_TABLIST_ID_PREFIX}
        label={t("studio:liveChat.tabsLabel")}
      />
      <div
        ref={chatBodyRef}
        id={panelIds.panel}
        role="tabpanel"
        aria-labelledby={panelIds.tab}
        className={s.chatBody}
        onScroll={handleBodyScroll}
      >
        {activeTab === "chat" && (
          <div
            role="log"
            aria-live="polite"
            aria-label={t("studio:liveChat.logLabel")}
            className={chatStyles.log}
          >
            {messages.map((message, index) => (
              <ChatLine key={`msg-${index}`} message={message} />
            ))}
          </div>
        )}
        {activeTab === "tips" &&
          (tipMessages.length > 0 ? (
            tipMessages.map((message, index) => (
              <ChatLine key={`tip-${index}`} message={message} />
            ))
          ) : (
            <p className={s.mTime}>{t("studio:liveChat.tips.empty")}</p>
          ))}
        {activeTab === "listeners" &&
          listeners.map((message, index) => (
            <div key={`listener-${index}`} className={s.msg}>
              <span
                className={[
                  s.mAv,
                  message.tone === "jade" && s.jade,
                  message.tone === "plum" && s.plum,
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {message.av}
              </span>
              <span className={s.mName}>{message.name}</span>
            </div>
          ))}
      </div>
      <div className={s.chatFoot}>
        <div className={s.chatInput}>
          <input
            aria-label={t("studio:liveChat.inputPlaceholder")}
            placeholder={t("studio:liveChat.inputPlaceholder")}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              // Enter that confirms an IME candidate (keyCode 229) must not
              // send the half-composed line.
              if (event.nativeEvent.isComposing || event.keyCode === 229)
                return;
              if (event.key === "Enter") {
                event.preventDefault();
                send();
              }
            }}
          />
          <IconButton
            aria-label={t("studio:liveChat.sendAria")}
            tooltip
            onClick={send}
            disabled={!draft.trim()}
          >
            <FiSend aria-hidden />
          </IconButton>
        </div>
        <div className={s.chatActions}>
          <Button variant="quiet" size="sm" onClick={onTip}>
            <Translation
              i18nKey="studio:liveChat.tipPresetCta"
              slots={{ amount: <StudioEuroAmount value={2} /> }}
            />
          </Button>
          <Button variant="quiet" size="sm" onClick={onTip}>
            <Translation
              i18nKey="studio:liveChat.tipPresetCta"
              slots={{ amount: <StudioEuroAmount value={5} /> }}
            />
          </Button>
          <Button variant="quiet" size="sm" onClick={onTip}>
            {t("studio:liveChat.tipCustomCta")}
          </Button>
        </div>
      </div>
    </aside>
  );
}
