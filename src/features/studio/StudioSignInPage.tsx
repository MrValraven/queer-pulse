import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { routes } from "../../app/routeMap";
import styles from "./StudioSignInPage.module.css";

type Tab = "in" | "join";
type Tier = "studio" | "coop";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STUDIO_TIER_PRICE = 7;
const COOP_TIER_PRICE = 11;
const STUDIO_SHARE_PERCENT = 0.8;

function SignInPane({ onSwitch }: { onSwitch: () => void }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    showToast(t("studio:signin.in.signedInToast"), "success");
    setTimeout(() => navigate(routes.studio), 900);
  }

  function handleGoogle() {
    if (googleLoading) return;
    setGoogleLoading(true);
    setTimeout(() => {
      showToast(t("studio:signin.in.signedInGoogleToast"), "success");
      navigate(routes.studio);
    }, 1100);
  }

  return (
    <div className={styles.pane}>
      <h1>
        <Translation i18nKey="studio:signin.in.title" components={{ em: <em /> }} />
      </h1>
      <p className={styles.lede}>{t("studio:signin.in.lede")}</p>

      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="si-email">{t("studio:signin.emailLabel")}</label>
          <input
            id="si-email"
            type="email"
            placeholder={t("studio:signin.emailPlaceholder")}
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {/* No password field: QueerPulse accounts are Google OAuth + invite —
            there has never been a password to type here, and this pane's submit
            is still a prototype stub. An inert `type="password"` input would
            have password managers offering to save a credential that doesn't
            exist, on a screen that verifies nothing. */}
        <Button
          type="submit"
          className={styles.btnFull}
          style={{ marginTop: 8 }}
        >
          {t("studio:signin.in.submitCta")} →
        </Button>
      </form>

      <div className={styles.divider}>{t("studio:signin.orDivider")}</div>
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
        {googleLoading ? t("studio:signin.googleLoading") : t("studio:signin.googleContinue")}
      </button>

      <div className={styles.foot}>
        {t("studio:signin.in.newHere")}{" "}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSwitch();
          }}
        >
          {t("studio:signin.in.joinCta")} →
        </a>
        <span className={styles.free}>
          {t("studio:signin.in.freePrompt")}{" "}
          <Link to={routes.studioLanding}>{t("studio:signin.in.freeCta")}</Link>
        </span>
      </div>
    </div>
  );
}

function JoinPane({ onSwitch }: { onSwitch: () => void }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const fmt = useFormat();
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState<Tier>("studio");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate(routes.studioCheckout);
  }

  const canSubmit = EMAIL_RE.test(email.trim());

  return (
    <div className={styles.pane}>
      <h1>
        <Translation i18nKey="studio:signin.join.title" components={{ em: <em /> }} />
      </h1>
      <p className={styles.lede}>{t("studio:signin.join.lede")}</p>

      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="j-email">{t("studio:signin.emailLabel")}</label>
          <input
            id="j-email"
            type="email"
            placeholder={t("studio:signin.emailPlaceholder")}
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {/* No "choose a password": signing up creates a QueerPulse account, and
            those are Google OAuth + invite. A password chosen here would go
            nowhere — see the note in SignInPane. */}
        <div className={styles.tierLbl} style={{ marginTop: 22 }}>
          {t("studio:signin.join.chooseTier")}
        </div>

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
                <Translation i18nKey="studio:signin.join.tier.studio.title" components={{ em: <em /> }} />
              </h4>
              <div className={styles.tierPrice}>
                €<em>{STUDIO_TIER_PRICE}</em>
                <b>{t("studio:signin.perMonth")}</b>
              </div>
            </div>
            <p>{t("studio:signin.join.tier.studio.body")}</p>
            <div className={styles.tierIncl}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.4}
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              {t("studio:signin.join.tier.studio.incl", {
                sharePercent: fmt.number(STUDIO_SHARE_PERCENT, { style: "percent" }),
              })}
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
          <div className={styles.tierRec}>{t("studio:signin.join.tier.coop.badge")}</div>
          <div className={styles.tierInfo}>
            <div className={styles.tierTop}>
              <h4>
                <Translation i18nKey="studio:signin.join.tier.coop.title" components={{ em: <em /> }} />
              </h4>
              <div className={styles.tierPrice}>
                €<em>{COOP_TIER_PRICE}</em>
                <b>{t("studio:signin.perMonth")}</b>
              </div>
            </div>
            <p>
              <Translation i18nKey="studio:signin.join.tier.coop.body" components={{ em: <em /> }} />
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
              {t("studio:signin.join.tier.coop.incl")}
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className={styles.btnFull}
          style={{ marginTop: 8 }}
          disabled={!canSubmit}
        >
          {t("studio:signin.join.submitCta")} →
        </Button>
      </form>

      <div className={styles.foot}>
        {t("studio:signin.join.alreadyMember")}{" "}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSwitch();
          }}
        >
          {t("studio:signin.tabs.signIn")} →
        </a>
        <span className={styles.free}>
          {t("studio:signin.join.notReady")}{" "}
          <Link to={routes.studioLanding}>{t("studio:signin.join.freeCta")}</Link>
        </span>
      </div>
    </div>
  );
}

/** Mock "now playing" moment shown in the sign-in aside — content, not chrome. */
const ASIDE_NOW_PLAYING = {
  listening: 312,
  titlePre: "Carta para a ",
  titleEm: "santa",
  artist: "Mariana Sol",
  album: "Cidade dos santos",
  paidThisMonth: 11940,
};
const ASIDE_TIP_PERCENT = 1;

export function StudioSignInPage() {
  const [tab, setTab] = useState<Tab>("in");
  const { t } = useTranslation();
  const fmt = useFormat();

  return (
    <div className={styles.root}>
      <aside className={styles.aside}>
        <div className={styles.asideBrand}>
          <span className={styles.pulseDot} />
          <span className={styles.wordmark}>
            <Translation i18nKey="studio:brand.lockup" components={{ em: <em /> }} />
          </span>
          <span className={styles.product}>{t("studio:brand.studioLabel")}</span>
        </div>
        <div className={styles.asideBody}>
          <div className={styles.asideEb}>
            <span className={styles.live} />
            {t("studio:signin.aside.onAirNow", { count: ASIDE_NOW_PLAYING.listening })}
          </div>
          <h2>
            <Translation i18nKey="studio:signin.aside.title" components={{ em: <em /> }} />
          </h2>
          <p className={styles.asideSub}>
            <Translation
              i18nKey="studio:signin.aside.body"
              components={{ em: <em /> }}
              values={{ tipPercent: fmt.number(ASIDE_TIP_PERCENT, { style: "percent" }) }}
            />
          </p>
          <div className={styles.nowPlaying}>
            <div className={styles.cover} />
            <div className={styles.nowInfo}>
              <div className={styles.nowTitle}>
                {ASIDE_NOW_PLAYING.titlePre}
                <em>{ASIDE_NOW_PLAYING.titleEm}</em>
              </div>
              <div className={styles.nowArtist}>
                {ASIDE_NOW_PLAYING.artist} · {ASIDE_NOW_PLAYING.album}
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
            <Translation
              i18nKey="studio:signin.aside.paidThisMonth"
              components={{ em: <em /> }}
              values={{ amount: fmt.currency(ASIDE_NOW_PLAYING.paidThisMonth) }}
            />
          </div>
        </div>
      </aside>

      <main className={styles.authMain}>
        <div className={styles.authCard}>
          <div className={styles.mobrand}>
            <span className={styles.pulseDot} />
            <span className={styles.wordmark}>
              <Translation i18nKey="studio:brand.lockup" components={{ em: <em /> }} />
            </span>
            <span className={styles.product}>{t("studio:brand.studioLabel")}</span>
          </div>

          <div className={styles.segTabs}>
            <button
              type="button"
              className={tab === "in" ? styles.segOn : ""}
              onClick={() => setTab("in")}
            >
              {t("studio:signin.tabs.signIn")}
            </button>
            <button
              type="button"
              className={tab === "join" ? styles.segOn : ""}
              onClick={() => setTab("join")}
            >
              {t("studio:signin.tabs.join")}
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
