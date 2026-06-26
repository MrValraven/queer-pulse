import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import styles from "./GetTheAppPage.module.css";
import { Button } from '../../shared/components/ui'
import { AppNotifyModal, type AppPlatform } from "./AppNotifyModal";

const INVITE = routes.invite;

function QrCode({ size = 21, seed = 7 }: { size?: number; seed?: number }) {
  // Deterministic pseudo-random module pattern with three finder squares.
  const rects: React.ReactNode[] = [];
  let s = seed;
  const finder = (x: number, y: number) => {
    rects.push(<rect key={`f${x}-${y}`} x={x} y={y} width={7} height={7} fill="#2D1B3D" />);
    rects.push(<rect key={`fw${x}-${y}`} x={x + 1} y={y + 1} width={5} height={5} fill="#fff" />);
    rects.push(<rect key={`fc${x}-${y}`} x={x + 2} y={y + 2} width={3} height={3} fill="#2D1B3D" />);
  };
  const isFinder = (x: number, y: number) =>
    (x < 8 && y < 8) || (x >= size - 8 && y < 8) || (x < 8 && y >= size - 8);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (isFinder(x, y)) continue;
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      if ((s & 0xff) > 150) {
        rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#2D1B3D" />);
      }
    }
  }
  finder(0, 0);
  finder(size - 7, 0);
  finder(0, size - 7);
  return (
    <svg viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges">
      <rect width={size} height={size} fill="#fff" />
      {rects}
    </svg>
  );
}

const FEATURES = [
  { cls: "cardJade", title: "Quick exit", desc: "Lives in the nav. One tap closes the app and switches to a neutral home screen. Always available.", icon: <><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></> },
  { cls: "", title: "Crisis chat", desc: "One tap from anywhere. Trained peer operators reply in < 90 seconds, 24/7. Works on patchy signal.", icon: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /> },
  { cls: "cardPlum", title: "Gatherings & RSVPs", desc: "RSVP in two taps. Tickets show as QR codes at the door. Calendar export to whatever you use.", icon: <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
  { cls: "cardPlum", title: "Safe-spaces map · offline", desc: "Map of vetted venues across Lisbon, cached so it works without signal. Verified within 90 days, every pin.", icon: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></> },
  { cls: "", title: "Quiet notifications", desc: "Replies, RSVPs, messages. No engagement bait, no streaks. Granular quiet hours by category.", icon: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9 1.65 1.65 0 0 0 4.27 7.18l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.6 1.65 1.65 0 0 0 10 3.09V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></> },
  { cls: "cardJade", title: "Member-on-the-go", desc: "Your DMs, your saves, your profile. Light theme + a true black for night use.", icon: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /> },
];

export function GetTheAppPage() {
  const { showToast } = useToast();
  const [notify, setNotify] = useState<AppPlatform | null>(null);

  const copyLink = () => {
    if (navigator.clipboard) navigator.clipboard.writeText("https://queerpulse.app/get");
    showToast("Link copied", "success");
  };
  const shareNative = () => {
    if (navigator.share) navigator.share({ title: "QueerPulse", url: "https://queerpulse.app/get" });
    else copyLink();
  };

  return (
    <PageShell>
      <section className={styles.heroSection}>
        <div className={styles.heroInner}>
          <div>
            <div className={styles.eyebrow}>Mobile · iOS &amp; Android</div>
            <h1 className={styles.h1}>
              Take it with you <em>anyway.</em>
            </h1>
            <p className={styles.lead}>
              The app does the things you actually need on a phone:{" "}
              <b>quick exit, crisis chat, RSVPs, your safe-spaces map, and the QR ticket
              at the door.</b> Everything else stays better on the web.
            </p>

            <div className={styles.storeRow}>
              <button type="button" className={styles.storeBtn} onClick={() => setNotify("iOS")}>
                <span className={styles.ic}>
                  <svg viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                </span>
                <span>
                  <span className={styles.l}>Download on the</span>
                  <span className={styles.b}>App Store</span>
                </span>
              </button>
              <button type="button" className={styles.storeBtn} onClick={() => setNotify("Android")}>
                <span className={styles.ic}>
                  <svg viewBox="0 0 24 24">
                    <path d="M3.61 1.81C3.24 2.2 3 2.79 3 3.55v16.9c0 .76.24 1.35.61 1.74l.06.06L13.04 13v-.04L3.67 1.75l-.06.06zm10.96 11.1l3.12 3.12 5.65-3.21c1.61-.91 1.61-2.41 0-3.32l-5.65-3.21-3.12 3.13v3.49zM3.67 22.25c.49.52 1.31.59 2.23.07l11.42-6.49-3.13-3.13L3.67 22.25z" />
                  </svg>
                </span>
                <span>
                  <span className={styles.l}>Get it on</span>
                  <span className={styles.b}>Google Play</span>
                </span>
              </button>
            </div>

            <div className={styles.sendPhone}>
              <h4>
                Don't want the <em>app stores?</em>
              </h4>
              <p>
                Pop your number in and we'll text you a one-time install link. Doesn't add
                you to anything.
              </p>
              <form
                className={styles.sendForm}
                onSubmit={(e) => {
                  e.preventDefault();
                  showToast("Link sent — check your messages", "success");
                }}
              >
                <input type="tel" placeholder="+351 91·••··••··" />
                <Button type="submit" variant="primary">
                  Text me the link
                </Button>
              </form>
            </div>
          </div>

          <div className={styles.qrCard}>
            <div className={styles.qrFrame}>
              <QrCode size={21} seed={11} />
            </div>
            <div className={styles.qrLabel}>
              Scan with <em>your phone</em>
            </div>
            <p className={styles.qrSub}>Camera app should detect it · routes to the right store</p>
          </div>
        </div>
      </section>

      <section className={styles.whatSection}>
        <div className={styles.whatInner}>
          <h2 className={styles.whatH}>
            What the app is <em>for</em>
          </h2>
          <p className={styles.whatSub}>A short list. We won't put everything on a small screen.</p>
          <div className={styles.whatGrid}>
            {FEATURES.map((f) => (
              <div className={[styles.whatCard, f.cls && styles[f.cls]].filter(Boolean).join(" ")} key={f.title}>
                <div className={styles.ic}>
                  <svg viewBox="0 0 24 24">{f.icon}</svg>
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
          <div className={styles.notIn}>
            <b>Not in the app, on purpose:</b> the full Magazine, the article archive, the
            Forum, the long-form profiles, governance documents, hosting tools.{" "}
            <em>These are better at a desk.</em> Web stays the canonical home for
            everything that takes time.
          </div>
        </div>
      </section>

      <section className={styles.shareSection}>
        <div className={styles.shareInner}>
          <div className={styles.shareCard}>
            <div>
              <div className={styles.shareEyebrow}>Pass it along</div>
              <h2>
                Got a friend who'd <em>use this?</em>
              </h2>
              <p>
                Show them this QR — it's the same install page, just yours. If they
                install, you'll both see each other in the "we've met in person" recap
                when you're next at a gathering together.
              </p>
              <div className={styles.shareActions}>
                <Button type="button" variant="primary" onClick={copyLink}>
                  Copy link
                </Button>
                <Button type="button" variant="ghost-dark" onClick={shareNative}>
                  Share to apps
                </Button>
              </div>
            </div>
            <div className={styles.shareQr}>
              <QrCode size={13} seed={29} />
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Button to={INVITE} variant="ghost">
              Not a member yet? Request an invite →
            </Button>
          </div>
        </div>
      </section>

      {notify && <AppNotifyModal platform={notify} onClose={() => setNotify(null)} />}
    </PageShell>
  );
}
