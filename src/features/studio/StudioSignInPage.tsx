import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import styles from "./StudioSignInPage.module.css";

type Tab = "in" | "join";
type Tier = "studio" | "coop";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function SignInPane({ onSwitch }: { onSwitch: () => void }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    showToast("Signed in — welcome back", "success");
    setTimeout(() => navigate(routes.studio), 900);
  }

  function handleGoogle() {
    if (googleLoading) return;
    setGoogleLoading(true);
    setTimeout(() => {
      showToast("Signed in with Google — welcome back", "success");
      navigate(routes.studio);
    }, 1100);
  }

  return (
    <div className={styles.pane}>
      <h1>
        Welcome <em>back.</em>
      </h1>
      <p className={styles.lede}>
        Studio is a tab on your QueerPulse account, not a new login. Sign in
        with the member account you already have.
      </p>

      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="si-email">Email</label>
          <input
            id="si-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className={styles.field} style={{ marginBottom: 8 }}>
          <label htmlFor="si-pw">Password</label>
          <input
            id="si-pw"
            type="password"
            placeholder="Your password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className={styles.btnFull}>
          Sign in →
        </Button>
      </form>

      <div className={styles.divider}>or</div>
      <button
        type="button"
        className={styles.btnGoogle}
        onClick={handleGoogle}
        disabled={googleLoading}
      >
        {googleLoading ? (
          <span className={styles.gSpinner} aria-hidden />
        ) : (
          <svg width={17} height={17} viewBox="0 0 18 18" aria-hidden>
            <path
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
              fill="#4285F4"
            />
            <path
              d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
              fill="#34A853"
            />
            <path
              d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
              fill="#FBBC05"
            />
            <path
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
              fill="#EA4335"
            />
          </svg>
        )}
        {googleLoading ? "Signing in…" : "Continue with Google"}
      </button>

      <div className={styles.foot}>
        New here?{" "}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSwitch();
          }}
        >
          Join the room →
        </a>
        <span className={styles.free}>
          Just want to listen?{" "}
          <Link to={routes.studioLanding}>Stream one set free, no account</Link>
        </span>
      </div>
    </div>
  );
}

function JoinPane({ onSwitch }: { onSwitch: () => void }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tier, setTier] = useState<Tier>("studio");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate(routes.studioCheckout);
  }

  const canSubmit = EMAIL_RE.test(email.trim()) && password.length >= 8;

  return (
    <div className={styles.pane}>
      <h1>
        Join the <em>room.</em>
      </h1>
      <p className={styles.lede}>
        Pick how much of the co-op you want. You can change tiers or cancel any
        month — no lock-in, no winback emails.
      </p>

      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="j-email">Email</label>
          <input
            id="j-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className={styles.field} style={{ marginBottom: 22 }}>
          <label htmlFor="j-pw">Choose a password</label>
          <input
            id="j-pw"
            type="password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className={styles.tierLbl}>Choose your tier</div>

        <div
          className={[styles.tier, tier === "studio" ? styles.tierOn : ""]
            .filter(Boolean)
            .join(" ")}
          role="button"
          tabIndex={0}
          onClick={() => setTier("studio")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setTier("studio");
            }
          }}
        >
          <div className={styles.tierDot} />
          <div className={styles.tierInfo}>
            <div className={styles.tierTop}>
              <h4>
                Studio <em>only</em>
              </h4>
              <div className={styles.tierPrice}>
                €<em>7</em>
                <b>/mo</b>
              </div>
            </div>
            <p>
              Everything in Studio — the council's weekly set, live rooms, the
              full catalogue, lossless audio, direct artist subscriptions.
            </p>
            <div className={styles.tierIncl}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.4}
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              80% of your fee reaches artists by play
            </div>
          </div>
        </div>

        <div
          className={[styles.tier, tier === "coop" ? styles.tierOn : ""]
            .filter(Boolean)
            .join(" ")}
          style={{ position: "relative" }}
          role="button"
          tabIndex={0}
          onClick={() => setTier("coop")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setTier("coop");
            }
          }}
        >
          <div className={styles.tierDot} />
          <div className={styles.tierRec}>Best value</div>
          <div className={styles.tierInfo}>
            <div className={styles.tierTop}>
              <h4>
                The whole <em>co-op</em>
              </h4>
              <div className={styles.tierPrice}>
                €<em>11</em>
                <b>/mo</b>
              </div>
            </div>
            <p>
              Studio <em>plus</em> Cinema, the Magazine, Gatherings, reading
              groups, and a vote at the annual assembly. One membership, the
              entire QueerPulse.
            </p>
            <div className={styles.tierIncl}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.4}
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              One member account across every surface
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className={styles.btnFull}
          style={{ marginTop: 8 }}
          disabled={!canSubmit}
        >
          Continue to payment →
        </Button>
      </form>

      <div className={styles.foot}>
        Already a member?{" "}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSwitch();
          }}
        >
          Sign in →
        </a>
        <span className={styles.free}>
          Not ready?{" "}
          <Link to={routes.studioLanding}>Listen to one free set first</Link>
        </span>
      </div>
    </div>
  );
}

export function StudioSignInPage() {
  const [tab, setTab] = useState<Tab>("in");

  return (
    <div className={styles.root}>
      <aside className={styles.aside}>
        <div className={styles.asideBrand}>
          <span className={styles.pulseDot} />
          <span className={styles.wordmark}>
            Queer<em>Pulse</em>
          </span>
          <span className={styles.product}>Studio</span>
        </div>
        <div className={styles.asideBody}>
          <div className={styles.asideEb}>
            <span className={styles.live} />
            On the air now · 312 in the room
          </div>
          <h2>
            A streaming co-op that <em>pays</em> the people who made the song.
          </h2>
          <p className={styles.asideSub}>
            Eighty cents of every euro reaches the artist. Tips pass through at{" "}
            <em>100%</em>. The ledger is public, updated every Monday at noon.
          </p>
          <div className={styles.nowPlaying}>
            <div className={styles.cover} />
            <div className={styles.nowInfo}>
              <div className={styles.nowTitle}>
                Carta para a <em>santa</em>
              </div>
              <div className={styles.nowArtist}>
                Mariana Sol · Cidade dos santos
              </div>
            </div>
            <div className={styles.bars}>
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
          <div className={styles.asideFoot}>
            Paid to artists this month: <em>€11,940</em> · and counting.
          </div>
        </div>
      </aside>

      <main className={styles.authMain}>
        <div className={styles.authCard}>
          <div className={styles.mobrand}>
            <span className={styles.pulseDot} />
            <span className={styles.wordmark}>
              Queer<em>Pulse</em>
            </span>
            <span className={styles.product}>Studio</span>
          </div>

          <div className={styles.segTabs}>
            <button
              type="button"
              className={tab === "in" ? styles.segOn : ""}
              onClick={() => setTab("in")}
            >
              Sign in
            </button>
            <button
              type="button"
              className={tab === "join" ? styles.segOn : ""}
              onClick={() => setTab("join")}
            >
              Join
            </button>
          </div>

          {tab === "in" ? (
            <SignInPane onSwitch={() => setTab("join")} />
          ) : (
            <JoinPane onSwitch={() => setTab("in")} />
          )}
        </div>
      </main>
    </div>
  );
}
