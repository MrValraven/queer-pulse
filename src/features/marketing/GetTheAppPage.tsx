import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import styles from "./GetTheAppPage.module.css";
import { Button } from "../../shared/components/ui";
import { AppNotifyModal, type AppPlatform } from "./AppNotifyModal";

const INVITE = routes.requestInvite;

function QrCode({ size = 21, seed = 7 }: { size?: number; seed?: number }) {
  // Deterministic pseudo-random module pattern with three finder squares.
  const rects: React.ReactNode[] = [];
  let s = seed;
  const finder = (x: number, y: number) => {
    rects.push(
      <rect
        key={`f${x}-${y}`}
        x={x}
        y={y}
        width={7}
        height={7}
        fill="#2D1B3D"
      />,
    );
    rects.push(
      <rect
        key={`fw${x}-${y}`}
        x={x + 1}
        y={y + 1}
        width={5}
        height={5}
        fill="#fff"
      />,
    );
    rects.push(
      <rect
        key={`fc${x}-${y}`}
        x={x + 2}
        y={y + 2}
        width={3}
        height={3}
        fill="#2D1B3D"
      />,
    );
  };
  const isFinder = (x: number, y: number) =>
    (x < 8 && y < 8) || (x >= size - 8 && y < 8) || (x < 8 && y >= size - 8);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (isFinder(x, y)) continue;
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      if ((s & 0xff) > 150) {
        rects.push(
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width={1}
            height={1}
            fill="#2D1B3D"
          />,
        );
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
  {
    cls: "cardJade",
    titleKey: "marketing:getTheApp.features.quickExit.title",
    descKey: "marketing:getTheApp.features.quickExit.desc",
    icon: (
      <>
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <polyline points="10 17 15 12 10 7" />
        <line x1="15" y1="12" x2="3" y2="12" />
      </>
    ),
  },
  {
    cls: "",
    titleKey: "marketing:getTheApp.features.crisisChat.title",
    descKey: "marketing:getTheApp.features.crisisChat.desc",
    icon: (
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    ),
  },
  {
    cls: "cardPlum",
    titleKey: "marketing:getTheApp.features.gatherings.title",
    descKey: "marketing:getTheApp.features.gatherings.desc",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </>
    ),
  },
  {
    cls: "cardPlum",
    titleKey: "marketing:getTheApp.features.safeMap.title",
    descKey: "marketing:getTheApp.features.safeMap.desc",
    icon: (
      <>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
  },
  {
    cls: "",
    titleKey: "marketing:getTheApp.features.quietNotifs.title",
    descKey: "marketing:getTheApp.features.quietNotifs.desc",
    icon: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9 1.65 1.65 0 0 0 4.27 7.18l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.6 1.65 1.65 0 0 0 10 3.09V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </>
    ),
  },
  {
    cls: "cardJade",
    titleKey: "marketing:getTheApp.features.onTheGo.title",
    descKey: "marketing:getTheApp.features.onTheGo.desc",
    icon: (
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    ),
  },
];

export function GetTheAppPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [notify, setNotify] = useState<AppPlatform | null>(null);
  const pageTitle = t("marketing:getTheApp.meta.title");
  const pageDescription = t("marketing:getTheApp.meta.description");

  const copyLink = () => {
    if (navigator.clipboard)
      navigator.clipboard.writeText("https://queerpulse.app/get");
    showToast(t("marketing:getTheApp.share.copyToast"), "success");
  };
  const shareNative = () => {
    if (navigator.share)
      navigator.share({
        title: "QueerPulse",
        url: "https://queerpulse.app/get",
      });
    else copyLink();
  };

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("shared:megaNav.about.title"), path: routes.about },
          { name: pageTitle, path: routes.getTheApp },
        ])}
      />
      <section className={styles.heroSection}>
        <div className={styles.heroInner}>
          <div>
            <div className={styles.eyebrow}>
              {t("marketing:getTheApp.hero.eyebrow")}
            </div>
            <h1 className={styles.h1}>
              <Translation
                i18nKey="marketing:getTheApp.hero.title"
                components={{ em: <em /> }}
              />
            </h1>
            <p className={styles.lead}>
              <Translation
                i18nKey="marketing:getTheApp.hero.lead"
                components={{ b: <b /> }}
              />
            </p>

            <div className={styles.storeRow}>
              <button
                type="button"
                className={styles.storeBtn}
                onClick={() => setNotify("iOS")}
              >
                <span className={styles.ic}>
                  <svg viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                </span>
                <span>
                  <span className={styles.l}>
                    {t("marketing:getTheApp.store.ios.line1")}
                  </span>
                  <span className={styles.b}>
                    {t("marketing:getTheApp.store.ios.line2")}
                  </span>
                </span>
              </button>
              <button
                type="button"
                className={styles.storeBtn}
                onClick={() => setNotify("Android")}
              >
                <span className={styles.ic}>
                  <svg viewBox="0 0 24 24">
                    <path d="M3.61 1.81C3.24 2.2 3 2.79 3 3.55v16.9c0 .76.24 1.35.61 1.74l.06.06L13.04 13v-.04L3.67 1.75l-.06.06zm10.96 11.1l3.12 3.12 5.65-3.21c1.61-.91 1.61-2.41 0-3.32l-5.65-3.21-3.12 3.13v3.49zM3.67 22.25c.49.52 1.31.59 2.23.07l11.42-6.49-3.13-3.13L3.67 22.25z" />
                  </svg>
                </span>
                <span>
                  <span className={styles.l}>
                    {t("marketing:getTheApp.store.android.line1")}
                  </span>
                  <span className={styles.b}>
                    {t("marketing:getTheApp.store.android.line2")}
                  </span>
                </span>
              </button>
            </div>

            <div className={styles.sendPhone}>
              <h4>
                <Translation
                  i18nKey="marketing:getTheApp.sendPhone.title"
                  components={{ em: <em /> }}
                />
              </h4>
              <p>{t("marketing:getTheApp.sendPhone.body")}</p>
              <form
                className={styles.sendForm}
                onSubmit={(e) => {
                  e.preventDefault();
                  showToast(
                    t("marketing:getTheApp.sendPhone.toast"),
                    "success",
                  );
                }}
              >
                <input
                  type="tel"
                  placeholder={t("marketing:getTheApp.sendPhone.placeholder")}
                />
                <Button type="submit" variant="primary">
                  {t("marketing:getTheApp.sendPhone.cta")}
                </Button>
              </form>
            </div>
          </div>

          <div className={styles.qrCard}>
            <div className={styles.qrFrame}>
              <QrCode size={21} seed={11} />
            </div>
            <div className={styles.qrLabel}>
              <Translation
                i18nKey="marketing:getTheApp.qr.label"
                components={{ em: <em /> }}
              />
            </div>
            <p className={styles.qrSub}>{t("marketing:getTheApp.qr.sub")}</p>
          </div>
        </div>
      </section>

      <section className={styles.whatSection}>
        <div className={styles.whatInner}>
          <h2 className={styles.whatH}>
            <Translation
              i18nKey="marketing:getTheApp.what.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.whatSub}>{t("marketing:getTheApp.what.sub")}</p>
          <div className={styles.whatGrid}>
            {FEATURES.map((f) => (
              <div
                className={[styles.whatCard, f.cls && styles[f.cls]]
                  .filter(Boolean)
                  .join(" ")}
                key={f.titleKey}
              >
                <div className={styles.ic}>
                  <svg viewBox="0 0 24 24">{f.icon}</svg>
                </div>
                <h3>{t(f.titleKey)}</h3>
                <p>{t(f.descKey)}</p>
              </div>
            ))}
          </div>
          <div className={styles.notIn}>
            <Translation
              i18nKey="marketing:getTheApp.what.notIn"
              components={{ b: <b />, em: <em /> }}
            />
          </div>
        </div>
      </section>

      <section className={styles.shareSection}>
        <div className={styles.shareInner}>
          <div className={styles.shareCard}>
            <div>
              <div className={styles.shareEyebrow}>
                {t("marketing:getTheApp.share.eyebrow")}
              </div>
              <h2>
                <Translation
                  i18nKey="marketing:getTheApp.share.title"
                  components={{ em: <em /> }}
                />
              </h2>
              <p>{t("marketing:getTheApp.share.body")}</p>
              <div className={styles.shareActions}>
                <Button type="button" variant="primary" onClick={copyLink}>
                  {t("marketing:getTheApp.share.copyLinkCta")}
                </Button>
                <Button
                  type="button"
                  variant="ghost-dark"
                  onClick={shareNative}
                >
                  {t("marketing:getTheApp.share.shareAppsCta")}
                </Button>
              </div>
            </div>
            <div className={styles.shareQr}>
              <QrCode size={13} seed={29} />
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Button to={INVITE} variant="ghost">
              {t("marketing:getTheApp.share.notMemberCta")}
            </Button>
          </div>
        </div>
      </section>

      {notify && (
        <AppNotifyModal platform={notify} onClose={() => setNotify(null)} />
      )}
    </PageShell>
  );
}
