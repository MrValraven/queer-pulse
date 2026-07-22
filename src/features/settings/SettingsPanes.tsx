import { useMemo, useState } from "react";
import { FiShield } from "react-icons/fi";
import { Button, Toggle } from "../../shared/components/ui";
import { useAuth } from "../../app/providers/authContext";
import { useProfile } from "../../app/providers/ProfileProvider";
import { useConsent } from "../../app/providers/ConsentProvider";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Language } from "../../shared/i18n/types";
import type { VisibilityMode } from "../../shared/components/ui/VisibilityBadge";
import type { Member } from "../members/data/members";
import { TERMS } from "./settings.data";
import { SIM_GROUPS, type SimFlow } from "./simulations.data";
import { SimulationPreviewModal } from "./SimulationPreviewModal";
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
import { DataExportModal } from "./SettingsModals";
import styles from "./SettingsPage.module.css";

// Stable ids for the visibility radio options — never the translated label.
const VISIBILITY_OPTIONS: {
  v: VisibilityMode;
  titleKey: string;
  descKey: string;
}[] = [
  {
    v: "open",
    titleKey: "settings:visibility.open.title",
    descKey: "settings:visibility.open.desc",
  },
  {
    v: "network",
    titleKey: "settings:visibility.network.title",
    descKey: "settings:visibility.network.desc",
  },
  {
    v: "private",
    titleKey: "settings:visibility.private.title",
    descKey: "settings:visibility.private.desc",
  },
];

// Stable ids for the (cosmetic, comingSoon) email-delivery select — never the
// translated label. Only "immediately"/"dailyDigest"/"weeklyDigest"/"never"
// are ids here; nothing is persisted since the control is disabled.
const EMAIL_DELIVERY_OPTIONS = [
  {
    value: "immediately",
    key: "settings:notifications.delivery.email.immediately",
  },
  {
    value: "dailyDigest",
    key: "settings:notifications.delivery.email.dailyDigest",
  },
  {
    value: "weeklyDigest",
    key: "settings:notifications.delivery.email.weeklyDigest",
  },
  { value: "never", key: "settings:notifications.delivery.email.never" },
];

// Quiet-hours time ranges are plain numeric data, not translatable chrome —
// only the "none" option carries a label.
const QUIET_HOURS_RANGES = ["22:00 – 08:00", "21:00 – 09:00", "20:00 – 10:00"];

export function NotificationsPane({ onChange }: { onChange: () => void }) {
  const { t } = useTranslation();
  return (
    <Pane
      title={
        <Translation
          i18nKey="settings:notifications.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("settings:notifications.sub")}
    >
      <Section label={t("settings:notifications.section.gatherings")}>
        <ToggleList>
          <ToggleRow
            title={t("settings:notifications.gatherings.newAnnounced.title")}
            desc={t("settings:notifications.gatherings.newAnnounced.desc")}
            defaultChecked
            comingSoon
            onChange={onChange}
          />
          <ToggleRow
            title={t("settings:notifications.gatherings.rsvpReminder.title")}
            desc={t("settings:notifications.gatherings.rsvpReminder.desc")}
            defaultChecked
            comingSoon
            onChange={onChange}
          />
          <ToggleRow
            title={t("settings:notifications.gatherings.lastFewSpots.title")}
            desc={t("settings:notifications.gatherings.lastFewSpots.desc")}
            comingSoon
            onChange={onChange}
          />
        </ToggleList>
      </Section>
      <Section label={t("settings:notifications.section.messagesConnections")}>
        <ToggleList>
          <ToggleRow
            title={t("settings:notifications.messages.newMessage.title")}
            desc={t("settings:notifications.messages.newMessage.desc")}
            defaultChecked
            comingSoon
            onChange={onChange}
          />
          <ToggleRow
            title={t("settings:notifications.messages.connectionRequest.title")}
            desc={t("settings:notifications.messages.connectionRequest.desc")}
            defaultChecked
            comingSoon
            onChange={onChange}
          />
          <ToggleRow
            title={t("settings:notifications.messages.sayHello.title")}
            desc={t("settings:notifications.messages.sayHello.desc")}
            comingSoon
            onChange={onChange}
          />
        </ToggleList>
      </Section>
      <Section label={t("settings:notifications.section.communitiesBoard")}>
        <ToggleList>
          <ToggleRow
            title={t("settings:notifications.communities.newPost.title")}
            desc={t("settings:notifications.communities.newPost.desc")}
            defaultChecked
            comingSoon
            onChange={onChange}
          />
          <ToggleRow
            title={t("settings:notifications.communities.threadReply.title")}
            desc={t("settings:notifications.communities.threadReply.desc")}
            defaultChecked
            comingSoon
            onChange={onChange}
          />
          <ToggleRow
            title={t("settings:notifications.communities.weeklyDigest.title")}
            desc={t("settings:notifications.communities.weeklyDigest.desc")}
            comingSoon
            onChange={onChange}
          />
        </ToggleList>
      </Section>
      <Section label={t("settings:notifications.section.delivery")}>
        <SelectRow
          title={t("settings:notifications.delivery.email.title")}
          desc={t("settings:notifications.delivery.email.desc")}
          options={EMAIL_DELIVERY_OPTIONS.map((option) => ({
            value: option.value,
            label: t(option.key),
          }))}
          defaultValue="dailyDigest"
          comingSoon
          onChange={onChange}
        />
        <SelectRow
          title={t("settings:notifications.delivery.quietHours.title")}
          desc={t("settings:notifications.delivery.quietHours.desc")}
          options={[
            {
              value: "none",
              label: t("settings:notifications.delivery.quietHours.none"),
            },
            ...QUIET_HOURS_RANGES.map((range) => ({
              value: range,
              label: range,
            })),
          ]}
          defaultValue="22:00 – 08:00"
          comingSoon
          onChange={onChange}
        />
      </Section>
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
          desc={t("settings:language.interfaceLanguage.desc")}
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

type ExportKind = "full" | "messages";

// Pattern B: the export titles/notes are platform chrome (shown in the modal
// and baked into the downloaded JSON's own copy), so they resolve via `t`.
export function buildExports(
  t: (key: string) => string,
  email: string,
  name: string,
  profile: Member,
) {
  return {
    full: {
      title: t("settings:data.export.full.title"),
      filename: "queerpulse-export.json",
      payload: {
        account: { name, email },
        profile: {
          pronouns: profile.pronouns ?? "",
          city: profile.hood,
          interests: profile.tags,
        },
        exportedAt: new Date().toISOString(),
      },
    },
    messages: {
      title: t("settings:data.export.messages.title"),
      filename: "queerpulse-messages.json",
      payload: {
        account: name,
        note: t("settings:data.export.messages.note"),
        exportedAt: new Date().toISOString(),
      },
    },
  } as const;
}

/** Controlled consent row bound to real state (not the cosmetic ToggleRow). */
function ConsentToggleRow({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className={styles.toggleRow}>
      <div className={styles.toggleLabel}>
        <div className={styles.toggleTitle}>{title}</div>
        <div className={styles.toggleDesc}>{desc}</div>
      </div>
      <Toggle
        tone="coral"
        checked={checked}
        onChange={onChange}
        label={title}
      />
    </div>
  );
}

export function DataPane({
  onChange,
  onDeleteClick,
}: {
  onChange: () => void;
  onDeleteClick: () => void;
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { consent, setConsent, openPreferences } = useConsent();
  const [exportKind, setExportKind] = useState<ExportKind | null>(null);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const exports = useMemo(
    () =>
      buildExports(
        t,
        user?.email ?? "—",
        `${profile.first} ${profile.last}`.trim(),
        profile,
      ),
    [t, user?.email, profile],
  );
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
            desc={t("settings:data.download.desc")}
            btn={t("settings:data.download.cta")}
            onClick={() => setExportKind("full")}
          />
          <DataCard
            title={t("settings:data.downloadMessages.title")}
            desc={t("settings:data.downloadMessages.desc")}
            btn={t("settings:data.downloadMessages.cta")}
            onClick={() => setExportKind("messages")}
          />
          <DataCard
            title={t("settings:data.correct.title")}
            desc={t("settings:data.correct.desc")}
            btn={t("settings:data.correct.cta")}
            to={routes.contact}
          />
        </div>
      </Section>
      <Section label={t("settings:data.section.cookiePrivacy")}>
        <ToggleList>
          <ConsentToggleRow
            title={t("settings:data.consent.analytics.title")}
            desc={t("settings:data.consent.analytics.desc")}
            checked={consent.analytics}
            onChange={(next) =>
              setConsent(
                { analytics: next, monitoring: consent.monitoring },
                "settings_pane",
              )
            }
          />
          <ConsentToggleRow
            title={t("settings:data.consent.monitoring.title")}
            desc={t("settings:data.consent.monitoring.desc")}
            checked={consent.monitoring}
            onChange={(next) =>
              setConsent(
                { analytics: consent.analytics, monitoring: next },
                "settings_pane",
              )
            }
          />
        </ToggleList>
        <div className={styles.dataCards}>
          <DataCard
            title={t("settings:data.cookiePrefs.title")}
            desc={t("settings:data.cookiePrefs.desc")}
            btn={t("settings:data.cookiePrefs.cta")}
            onClick={openPreferences}
          />
        </div>
      </Section>
      <Section label={t("settings:data.section.personalisation")}>
        <ToggleList>
          <ToggleRow
            title={t("settings:data.searchPersonalisation.title")}
            desc={t("settings:data.searchPersonalisation.desc")}
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
      {exportKind && (
        <DataExportModal
          title={exports[exportKind].title}
          filename={exports[exportKind].filename}
          payload={exports[exportKind].payload}
          onClose={() => setExportKind(null)}
        />
      )}
      {deactivateOpen && (
        <DestructiveActionFlow
          content={destructiveFlow.deactivate}
          onClose={() => setDeactivateOpen(false)}
        />
      )}
    </Pane>
  );
}

export function SimulationsPane() {
  const { t } = useTranslation();
  const [preview, setPreview] = useState<SimFlow | null>(null);
  return (
    <Pane
      title={
        <Translation
          i18nKey="settings:simulations.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("settings:simulations.sub")}
    >
      {/* NOTE: SIM_GROUPS (simulations.data.ts) group labels and each flow's
          title/desc are still hardcoded English — ~50 flows across 12
          groups, out of this pass's priority order (account/privacy/
          notifications/safety/accessibility first). Flagged for a follow-up
          sweep rather than translated partially. */}
      {SIM_GROUPS.map((g) => (
        <Section key={g.label} label={g.label}>
          <div className={styles.dataCards}>
            {g.flows.map((f) =>
              f.preview ? (
                <DataCard
                  key={f.title}
                  title={f.title}
                  desc={f.desc}
                  btn={t("settings:simulations.preview")}
                  onClick={() => setPreview(f)}
                />
              ) : (
                <DataCard
                  key={f.title}
                  title={f.title}
                  desc={f.desc}
                  btn={t("settings:simulations.start")}
                  to={f.to}
                />
              ),
            )}
          </div>
        </Section>
      ))}
      {preview && (
        <SimulationPreviewModal
          flow={preview}
          onClose={() => setPreview(null)}
        />
      )}
    </Pane>
  );
}

export function VisibilityPane({ onChange }: { onChange: () => void }) {
  const { t } = useTranslation();
  const { draft, updateDraft } = useProfile();
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
                  updateDraft({ visibility: o.v });
                  onChange();
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
          <ToggleRow
            title={t("settings:visibility.newArrivals.title")}
            desc={t("settings:visibility.newArrivals.desc")}
            comingSoon
            onChange={onChange}
          />
          <ToggleRow
            title={t("settings:visibility.suggestedConnections.title")}
            desc={t("settings:visibility.suggestedConnections.desc")}
            comingSoon
            onChange={onChange}
          />
          <ToggleRow
            title={t("settings:visibility.activityStatus.title")}
            desc={t("settings:visibility.activityStatus.desc")}
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
  return (
    <Pane
      title={
        <Translation
          i18nKey="settings:account.title"
          components={{ em: <em /> }}
        />
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
            <div className={styles.accountEmail}>{user?.email ?? "—"}</div>
          </div>
        </div>
      </Section>
      <Section label={t("settings:account.section.security")}>
        <ToggleList>
          <ToggleRow
            title={t("settings:account.twoFactor.title")}
            desc={t("settings:account.twoFactor.desc")}
            comingSoon
            onChange={onChange}
          />
          <ToggleRow
            title={t("settings:account.loginAlerts.title")}
            desc={t("settings:account.loginAlerts.desc")}
            comingSoon
            onChange={onChange}
          />
        </ToggleList>
        <div className={styles.dataCards}>
          <DataCard
            title={t("settings:account.disclosure.title")}
            desc={t("settings:account.disclosure.desc")}
            btn={t("settings:account.disclosure.cta")}
            to={routes.security}
          />
        </div>
      </Section>
    </Pane>
  );
}
