import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import s from "./live.module.css";
import { CHAT, TABS } from "./studioLive.data";

export function StudioLiveChat({ onTip }: { onTip: () => void }) {
  const { showToast } = useToast();
  const [tab, setTab] = useState("Chat");

  return (
    <aside className={s.chat}>
      <div className={s.chatTabs}>
        {TABS.map((tb) => (
          <button
            type="button"
            key={tb.label}
            className={[s.chatTab, tab === tb.label && s.chatTabOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setTab(tb.label)}
          >
            {tb.label} {tb.ct && <span className={s.ct}>{tb.ct}</span>}
          </button>
        ))}
      </div>
      <div className={s.chatBody}>
        {CHAT.map((mAny, i) => {
          if ("system" in mAny) {
            return (
              <div
                key={`sys-${mAny.system}`}
                className={`${s.msg} ${s.msgSystem}`}
              >
                <div className={s.text}>— {mAny.system} —</div>
              </div>
            );
          }
          const m = mAny;
          return (
            <div
              key={`msg-${i}-${m.name}`}
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
                {m.role && (
                  <span
                    className={`${s.mRole} ${m.roleClass === "cu" ? s.cu : m.roleClass === "artist" ? s.artist : ""}`}
                  >
                    {m.role}
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
          <input placeholder="say something to the room…" />
          <button
            type="button"
            title="Send"
            onClick={() => showToast("Sent to the room", "success")}
          >
            <svg
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
            Tip €2
          </button>
          <button type="button" onClick={onTip}>
            Tip €5
          </button>
          <button type="button" onClick={onTip}>
            Tip €__
          </button>
        </div>
      </div>
    </aside>
  );
}
