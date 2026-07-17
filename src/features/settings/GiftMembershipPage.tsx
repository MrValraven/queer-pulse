import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { GiftMembershipForm } from "./GiftMembershipForm";
import { buildGiftModes, type ModeIcon } from "./giftMembership.data";
import styles from "./GiftMembershipPage.module.css";

const modeIcons: Record<ModeIcon, ReactNode> = {
  gift: (
    <svg viewBox="0 0 24 24">
      <path d="M20 12v10H4V12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 24 24">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
};

export function GiftMembershipPage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const giftModes = useMemo(() => buildGiftModes(t, fmt), [t, fmt]);
  const [mode, setMode] = useState<"gift" | "sponsor">("gift");

  return (
    <PageShell>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>
            {t("settings:giftMembership.hero.eyebrow")}
          </div>
          <h1 className={styles.h1}>
            <Translation
              i18nKey="settings:giftMembership.hero.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.dek}>
            <Translation
              i18nKey="settings:giftMembership.hero.dek"
              components={{ b: <b />, em: <em /> }}
            />
          </p>
        </div>
      </section>

      <section className={styles.modes}>
        <div className={styles.modesH}>
          <h2>
            <Translation
              i18nKey="settings:giftMembership.modes.title"
              components={{ em: <em /> }}
            />
          </h2>
        </div>
        <div className={styles.modeGrid}>
          {giftModes.map((giftMode) => (
            <button
              key={giftMode.id}
              type="button"
              className={`${styles.modeCard} ${giftMode.jade ? styles.jade : ""} ${mode === giftMode.id ? styles.selected : ""}`}
              onClick={() => setMode(giftMode.id)}
            >
              <div className={styles.modeIc}>{modeIcons[giftMode.icon]}</div>
              <h3>{giftMode.title}</h3>
              <p>{giftMode.body}</p>
              <div className={styles.price}>
                {giftMode.price}
                <span className={styles.priceSub}>{giftMode.priceSub}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.formSection}>
        <div className={styles.formInner}>
          <h2 className={styles.formH}>
            <Translation
              i18nKey="settings:giftMembership.form.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.formSub}>
            {t("settings:giftMembership.form.sub")}
          </p>
          <GiftMembershipForm />
        </div>
      </section>

      <section className={styles.sponsorFoot}>
        <h3>
          <Translation
            i18nKey="settings:giftMembership.sponsorFoot.title"
            components={{ em: <em /> }}
          />
        </h3>
        <p>
          <Translation
            i18nKey="settings:giftMembership.sponsorFoot.body"
            components={{
              a: <Link to={routes.solidarity} />,
              em: <em />,
            }}
          />
        </p>
      </section>
    </PageShell>
  );
}
