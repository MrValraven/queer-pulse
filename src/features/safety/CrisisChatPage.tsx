import { useState, type FormEvent } from "react";
import { PageShell } from "../../shared/components/layout";
import { Button, Reveal } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { ASSURANCES, LINES, OPENING } from "./crisisChat.data";
import styles from "./CrisisChatPage.module.css";

interface Message {
  from: "them" | "me";
  name?: string;
  text: string;
}

export function CrisisChatPage() {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<Message[]>(OPENING);
  const [draft, setDraft] = useState("");

  function handleSend(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { from: "me", text }]);
    setDraft("");
    showToast("Rui is typing — a peer supporter will reply shortly.");
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          from: "them",
          name: "Rui · peer supporter",
          text: "Thank you for telling me that. I'm here, and we'll stay with it together for as long as you need.",
        },
      ]);
    }, 1400);
  }

  return (
    <PageShell>
      <section className={styles.page}>
        <div className="wrap">
          <div className={styles.inner}>
            <div>
              <Reveal className={styles.eyebrow}>
                Crisis chat · A supporter is online
              </Reveal>
              <Reveal as="h1" className={styles.title} delay={60}>
                You don't have to <em>hold this alone.</em>
              </Reveal>
              <Reveal as="p" className={styles.lead} delay={120}>
                A confidential chat with a trained queer peer supporter. No
                appointment, no referral, no judgement — just someone who will
                stay with you for as long as you need.
              </Reveal>

              <Reveal className={styles.assurances} delay={160}>
                {ASSURANCES.map((item) => (
                  <div key={item.label}>
                    <div className={styles.assN}>{item.n}</div>
                    <div className={styles.assL}>{item.label}</div>
                  </div>
                ))}
              </Reveal>

              <div className={styles.lines}>
                <div className={styles.linesH}>
                  If you're in immediate danger, call
                </div>
                {LINES.map((line) => (
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
                  <div className={styles.chatHeadName}>Rui</div>
                  <div className={styles.chatHeadStatus}>
                    Peer supporter · online now
                  </div>
                </div>
              </div>
              <div className={styles.chatBody}>
                {messages.map((message, index) => (
                  <div
                    key={index}
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
                  placeholder="Type whatever you can…"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  aria-label="Message"
                />
                <Button type="submit" variant="primary">
                  Send
                </Button>
              </form>
              <p className={styles.note}>
                This is a prototype — messages aren't sent to a real person. In
                the live platform, nothing here is stored or shown on your
                profile.
              </p>
            </Reveal>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
