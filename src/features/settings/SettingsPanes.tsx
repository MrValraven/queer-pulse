import { useMemo, useState } from "react";
import { FiShield } from "react-icons/fi";
import { Button, FeatureHelp } from "../../shared/components/ui";
import { useAuth } from "../../app/providers/authContext";
import { useProfileEdit } from "../../app/providers/useProfile";
import { useConsent } from "../../app/providers/useConsent";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Language } from "../../shared/i18n/types";
import { TERMS } from "./settings.data";
import { VISIBILITY_OPTIONS } from "./SettingsPanes.data";
import { PushNotificationRow } from "../push/PushNotificationRow";
import { useNotificationDelivery } from "./api/useNotificationDelivery";
import {
  CommunityVolumeSection,
  ConsentToggleRow,
  NotificationCategorySections,
  QuietHoursSection,
} from "./NotificationVolumeSections";
import { useLoginAlerts } from "./api/useLoginAlerts";
import { DestructiveActionFlow } from "./DestructiveActionFlow";
import { buildDestructiveFlow } from "./destructiveFlows.data";
import {
  DataCard,
  Pane,
  Section,
  SelectRow,
  ToggleList,
  ToggleRow,
} from "./SettingsControls";
import styles from "./SettingsPage.module.css";

export function NotificationsPane({ onChange }: { onChange: () => void }) {
  const { t } = useTranslation();
  const { delivery, setDelivery } = useNotificationDelivery();
  return (
    <Pane
      title={
        <>
          <Translation
            i18nKey="settings:notifications.title"
            components={{ em: <em /> }}
          />{" "}
          <FeatureHelp id="settings.privacy" />
        </>
      }
      sub={t("settings:notifications.sub")}
    >
      {/* Every category switch, grouped. All of them are genuinely persisted
          and save on flip, so none participates in the pane's dirty/save flow
          (`onChange`): that stays for the still-cosmetic rows below. */}
      <NotificationCategorySections />
      <Section label={t("settings:notifications.section.phonePush")}>
        <ToggleList>
          <PushNotificationRow />
          {/* No "spots almost full" notification exists yet — still cosmetic. */}
          <ToggleRow
            title={t("settings:notifications.gatherings.lastFewSpots.title")}
            description={t(
              "settings:notifications.gatherings.lastFewSpots.desc",
            )}
            comingSoon
            onChange={onChange}
          />
          {/* No "wave"/"say hello" notification type exists yet — cosmetic. */}
          <ToggleRow
            title={t("settings:notifications.messages.sayHello.title")}
            description={t("settings:notifications.messages.sayHello.desc")}
            comingSoon
            onChange={onChange}
          />
        </ToggleList>
        <div className={styles.dataCards}>
          <DataCard
            title={t("settings:notifications.phonePush.manage.title")}
            description={t("settings:notifications.phonePush.manage.desc")}
            button={t("settings:notifications.phonePush.manage.cta")}
            to={routes.pushDevices}
          />
        </div>
      </Section>
      <CommunityVolumeSection />
      <QuietHoursSection delivery={delivery} onChange={setDelivery} />
    </Pane>
  );
}

export function LanguagePane() {
  const { language, setLanguage, t } = useTranslation();
  const [termQuery, setTermQuery] = useState("");
  const terms = useMemo(() => {
    const q = termQuery.trim().toLowerCase();
    if (!q) return TERMS;
    return TERMS.filter(
      (term) =>
        t(term.nameKey).toLowerCase().includes(q) ||
        t(term.defKey).toLowerCase().includes(q),
    );
  }, [termQuery, t]);

  return (
    <Pane
      title={
        <Translation
          i18nKey="settings:language.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("settings:language.sub")}
    >
      <Section label={t("settings:language.section.platformPreference")}>
        <SelectRow
          title={t("settings:language.interfaceLanguage.title")}
          description={t("settings:language.interfaceLanguage.desc")}
          options={[
            { value: "en", label: t("common:language.en") },
            { value: "pt", label: t("common:language.pt") },
          ]}
          value={language}
          onChange={(v) => setLanguage(v as Language)}
        />
      </Section>
      <Section label={t("settings:language.section.terminologyGuide")}>
        <input
          className={styles.termSearch}
          type="search"
          placeholder={t("settings:language.searchPlaceholder")}
          aria-label={t("settings:language.searchPlaceholder")}
          value={termQuery}
          onChange={(e) => setTermQuery(e.target.value)}
        />
        <div className={styles.termList}>
          {terms.map((term) => (
            <div key={term.nameKey} className={styles.termRow}>
              <div className={styles.termName}>{t(term.nameKey)}</div>
              <div className={styles.termDef}>{t(term.defKey)}</div>
            </div>
          ))}
        </div>
      </Section>
    </Pane>
  );
}

/** Controlled consent row bound to real state (not the cosmetic ToggleRow). */
export function DataPane({
  onChange,
  onDeleteClick,
}: {
  onChange: () => void;
  onDeleteClick: () => void;
}) {
  const { t } = useTranslation();
  const { consent, setConsent, openPreferences } = useConsent();
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const destructiveFlow = useMemo(() => buildDestructiveFlow(t), [t]);
  return (
    <Pane
      title={
        <Translation
          i18nKey="settings:data.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("settings:data.sub")}
    >
      <div className={styles.gdprBox}>
        <span className={styles.gIcon}>
          <FiShield />
        </span>
        <p>
          <Translation
            i18nKey="settings:data.gdprBox"
            components={{ strong: <strong /> }}
          />
        </p>
      </div>
      <Section label={t("settings:data.section.yourData")}>
        <div className={styles.dataCards}>
          <DataCard
            title={t("settings:data.download.title")}
            description={t("settings:data.download.desc")}
            button={t("settings:data.download.cta")}
            to={routes.dataExport}
          />
          <DataCard
            title={t("settings:data.downloadMessages.title")}
            description={t("settings:data.downloadMessages.desc")}
            button={t("settings:data.downloadMessages.cta")}
            // Same page as the full export, preselected to messages only, so
            // the card delivers the scoped archive it advertises.
            to={`${routes.dataExport}?categories=messages`}
          />
          <DataCard
            title={t("settings:data.correct.title")}
            description={t("settings:data.correct.desc")}
            button={t("settings:data.correct.cta")}
            to={routes.contact}
          />
        </div>
      </Section>
      <Section label={t("settings:data.section.cookiePrivacy")}>
        <ToggleList>
          <ConsentToggleRow
            title={t("settings:data.consent.monitoring.title")}
            description={t("settings:data.consent.monitoring.desc")}
            checked={consent.monitoring}
            onChange={(next) =>
              setConsent({ monitoring: next }, "settings_pane")
            }
          />
        </ToggleList>
        <div className={styles.dataCards}>
          <DataCard
            title={t("settings:data.cookiePrefs.title")}
            description={t("settings:data.cookiePrefs.desc")}
            button={t("settings:data.cookiePrefs.cta")}
            onClick={openPreferences}
          />
        </div>
      </Section>
      <Section label={t("settings:data.section.personalisation")}>
        <ToggleList>
          {/* No search-personalisation preference exists on the backend (the
              profile PATCH DTO and notification categories carry no such
              field), and the Data pane opens no profile edit session — so a
              live flip would mark the pane dirty and fire a "Saved!" toast
              while `save()` is never called. Badge it coming-soon (inert) like
              its siblings so it stops claiming a save it can't perform. */}
          <ToggleRow
            title={t("settings:data.searchPersonalisation.title")}
            description={t("settings:data.searchPersonalisation.desc")}
            comingSoon
            onChange={onChange}
          />
        </ToggleList>
      </Section>
      <Section label={t("settings:data.section.dangerZone")}>
        <div className={styles.dataCards}>
          <div className={`${styles.dataCard} ${styles.dangerCard}`}>
            <div className={styles.dcText}>
              <div className={`${styles.dcTitle} ${styles.dangerTitle}`}>
                {t("settings:data.deactivate.title")}
              </div>
              <div className={styles.dcDesc}>
                {t("settings:data.deactivate.desc")}
              </div>
            </div>
            <Button
              variant="ghost"
              className={`${styles.dcBtn} ${styles.danger}`}
              onClick={() => setDeactivateOpen(true)}
            >
              {t("settings:data.deactivate.cta")}
            </Button>
          </div>
          <div className={`${styles.dataCard} ${styles.dangerCard}`}>
            <div className={styles.dcText}>
              <div className={`${styles.dcTitle} ${styles.dangerTitle}`}>
                {t("settings:data.deletePermanently.title")}
              </div>
              <div className={styles.dcDesc}>
                {t("settings:data.deletePermanently.desc")}
              </div>
            </div>
            <Button
              variant="primary"
              className={`${styles.dcBtn} ${styles.danger}`}
              onClick={onDeleteClick}
            >
              {t("settings:data.deletePermanently.cta")}
            </Button>
          </div>
        </div>
        <div className={styles.fineprint}>{t("settings:data.fineprint")}</div>
      </Section>
      {deactivateOpen && (
        <DestructiveActionFlow
          content={destructiveFlow.deactivate}
          onClose={() => setDeactivateOpen(false)}
        />
      )}
    </Pane>
  );
}

export function VisibilityPane({
  onChange,
}: {
  onChange: (key?: string) => void;
}) {
  const { t } = useTranslation();
  const { draft, updateDraft } = useProfileEdit();
  return (
    <Pane
      title={
        <Translation
          i18nKey="settings:visibility.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("settings:visibility.sub")}
    >
      <Section label={t("settings:visibility.section.whoCanSee")}>
        <div className={styles.toggleList}>
          {VISIBILITY_OPTIONS.map((o) => (
            <label key={o.v} className={styles.radioRow}>
              <input
                type="radio"
                name="vis"
                aria-label={t(o.titleKey)}
                value={o.v}
                checked={draft.visibility === o.v}
                onChange={() => {
                  // Leaving "open" withdraws homepage-feature consent with it.
                  // Keeping a stored yes on a profile that is no longer public
                  // means a later switch back re-arms it without a fresh
                  // decision, and consent does not survive its own condition.
                  updateDraft(
                    o.v === "open"
                      ? { visibility: o.v }
                      : { visibility: o.v, featuredConsent: false },
                  );
                  onChange("visibility.audience");
                }}
              />
              <div>
                <div className={styles.toggleTitle}>{t(o.titleKey)}</div>
                <div className={styles.toggleDesc}>{t(o.descKey)}</div>
              </div>
            </label>
          ))}
        </div>
      </Section>
      <Section label={t("settings:visibility.section.additionalControls")}>
        <ToggleList>
          <ConsentToggleRow
            title={t("settings:visibility.privateNetwork.label")}
            description={t("settings:visibility.privateNetwork.help")}
            checked={draft.privateNetwork}
            onChange={(next) => {
              updateDraft({ privateNetwork: next });
              onChange("visibility.privateNetwork");
            }}
          />
          <ConsentToggleRow
            title={t("settings:visibility.featuredConsent.label")}
            description={t("settings:visibility.featuredConsent.description")}
            checked={draft.featuredConsent}
            disabled={draft.visibility !== "open"}
            disabledHint={t("settings:visibility.featuredConsent.disabledHint")}
            onChange={(next) => {
              updateDraft({ featuredConsent: next });
              onChange("visibility.featuredConsent");
            }}
          />
          <ToggleRow
            title={t("settings:visibility.newArrivals.title")}
            description={t("settings:visibility.newArrivals.desc")}
            comingSoon
            onChange={onChange}
          />
          <ToggleRow
            title={t("settings:visibility.suggestedConnections.title")}
            description={t("settings:visibility.suggestedConnections.desc")}
            comingSoon
            onChange={onChange}
          />
          <ToggleRow
            title={t("settings:visibility.activityStatus.title")}
            description={t("settings:visibility.activityStatus.desc")}
            comingSoon
            onChange={onChange}
          />
        </ToggleList>
      </Section>
    </Pane>
  );
}

export function AccountPane({ onChange }: { onChange: () => void }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isEnabled: isLoginAlertsEnabled, setEnabled: setLoginAlertsEnabled } =
    useLoginAlerts();
  return (
    <Pane
      title={
        <>
          <Translation
            i18nKey="settings:account.title"
            components={{ em: <em /> }}
          />{" "}
          <FeatureHelp id="settings.hub" />
        </>
      }
      sub={t("settings:account.sub")}
    >
      <Section label={t("settings:account.section.account")}>
        <div className={styles.toggleList}>
          <div className={styles.toggleRow}>
            <div className={styles.toggleLabel}>
              <div className={styles.toggleTitle}>
                {t("settings:account.emailAddress.title")}
              </div>
              <div className={styles.toggleDesc}>
                {t("settings:account.emailAddress.desc")}
              </div>
            </div>
            <div className={styles.accountEmail}>
              {user?.email ?? t("settings:account.emailAddress.notSet")}
            </div>
          </div>
        </div>
      </Section>
      <Section label={t("settings:account.section.security")}>
        <ToggleList>
          <ToggleRow
            title={t("settings:account.twoFactor.title")}
            description={t("settings:account.twoFactor.desc")}
            comingSoon
            onChange={onChange}
          />
          {/* Genuinely wired since ID-06: `GET|PUT /me/login-alerts` backs it,
              and `AuthService.issueTokens` reads it before emitting the
              `security_new_sign_in` notification. It saves on flip, so it does
              NOT take part in this pane's dirty/save flow (`onChange`) — the
              same rule the Notifications pane's real toggles follow. */}
          <ConsentToggleRow
            title={t("settings:account.loginAlerts.title")}
            description={t("settings:account.loginAlerts.desc")}
            checked={isLoginAlertsEnabled}
            onChange={setLoginAlertsEnabled}
          />
        </ToggleList>
        <div className={styles.dataCards}>
          <DataCard
            title={t("settings:account.sessions.title")}
            description={t("settings:account.sessions.desc")}
            button={t("settings:account.sessions.cta")}
            to={routes.sessions}
          />
          {/* The member's own hub: devices, sign-in alerts, export, erasure. */}
          <DataCard
            title={t("settings:account.securityHub.title")}
            description={t("settings:account.securityHub.desc")}
            button={t("settings:account.securityHub.cta")}
            to={routes.security}
          />
          {/* The public responsible-disclosure policy, which used to hold the
              `routes.security` path this card pointed at. ID-15. */}
          <DataCard
            title={t("settings:account.disclosure.title")}
            description={t("settings:account.disclosure.desc")}
            button={t("settings:account.disclosure.cta")}
            to={routes.policiesSecurity}
          />
        </div>
      </Section>
    </Pane>
  );
}
