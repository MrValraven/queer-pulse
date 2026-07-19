import { useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../../shared/components/layout";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import styles from "./NewsletterPage.module.css";

const SETTINGS = routes.settings;

interface Pref {
  id: string;
  titleKey: string;
  subKey: string;
  freqKey: string;
  checked: boolean;
  disabled?: boolean;
}
interface Section {
  id: string;
  titleKey: string;
  prefs: Pref[];
}

const INITIAL: Section[] = [
  {
    id: "magazine",
    titleKey: "marketing:newsletter.sections.magazine.title",
    prefs: [
      {
        id: "mag-issue",
        titleKey: "marketing:newsletter.prefs.magIssue.title",
        subKey: "marketing:newsletter.prefs.magIssue.sub",
        freqKey: "marketing:newsletter.prefs.magIssue.freq",
        checked: true,
      },
      {
        id: "mag-picks",
        titleKey: "marketing:newsletter.prefs.magPicks.title",
        subKey: "marketing:newsletter.prefs.magPicks.sub",
        freqKey: "marketing:newsletter.prefs.magPicks.freq",
        checked: true,
      },
    ],
  },
  {
    id: "events",
    titleKey: "marketing:newsletter.sections.events.title",
    prefs: [
      {
        id: "ev-confirm",
        titleKey: "marketing:newsletter.prefs.evConfirm.title",
        subKey: "marketing:newsletter.prefs.evConfirm.sub",
        freqKey: "marketing:newsletter.prefs.evConfirm.freq",
        checked: true,
      },
      {
        id: "ev-near",
        titleKey: "marketing:newsletter.prefs.evNear.title",
        subKey: "marketing:newsletter.prefs.evNear.sub",
        freqKey: "marketing:newsletter.prefs.evNear.freq",
        checked: false,
      },
      {
        id: "ev-reading",
        titleKey: "marketing:newsletter.prefs.evReading.title",
        subKey: "marketing:newsletter.prefs.evReading.sub",
        freqKey: "marketing:newsletter.prefs.evReading.freq",
        checked: true,
      },
    ],
  },
  {
    id: "community",
    titleKey: "marketing:newsletter.sections.community.title",
    prefs: [
      {
        id: "com-announce",
        titleKey: "marketing:newsletter.prefs.comAnnounce.title",
        subKey: "marketing:newsletter.prefs.comAnnounce.sub",
        freqKey: "marketing:newsletter.prefs.comAnnounce.freq",
        checked: true,
      },
      {
        id: "com-connect",
        titleKey: "marketing:newsletter.prefs.comConnect.title",
        subKey: "marketing:newsletter.prefs.comConnect.sub",
        freqKey: "marketing:newsletter.prefs.comConnect.freq",
        checked: true,
      },
      {
        id: "com-forum",
        titleKey: "marketing:newsletter.prefs.comForum.title",
        subKey: "marketing:newsletter.prefs.comForum.sub",
        freqKey: "marketing:newsletter.prefs.comForum.freq",
        checked: false,
      },
    ],
  },
  {
    id: "safety",
    titleKey: "marketing:newsletter.sections.safety.title",
    prefs: [
      {
        id: "safe-alerts",
        titleKey: "marketing:newsletter.prefs.safeAlerts.title",
        subKey: "marketing:newsletter.prefs.safeAlerts.sub",
        freqKey: "marketing:newsletter.prefs.safeAlerts.freq",
        checked: true,
        disabled: true,
      },
      {
        id: "safe-report",
        titleKey: "marketing:newsletter.prefs.safeReport.title",
        subKey: "marketing:newsletter.prefs.safeReport.sub",
        freqKey: "marketing:newsletter.prefs.safeReport.freq",
        checked: true,
      },
    ],
  },
];

export function NewsletterPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [sections, setSections] = useState<Section[]>(INITIAL);

  const toggle = (sectionIndex: number, prefIndex: number) => {
    setSections((prev) =>
      prev.map((section, currentSectionIndex) =>
        currentSectionIndex === sectionIndex
          ? {
              ...section,
              prefs: section.prefs.map((pref, currentPrefIndex) =>
                currentPrefIndex === prefIndex
                  ? { ...pref, checked: !pref.checked }
                  : pref,
              ),
            }
          : section,
      ),
    );
  };

  const unsubAll = () => {
    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        prefs: section.prefs.map((pref) =>
          pref.disabled ? pref : { ...pref, checked: false },
        ),
      })),
    );
    showToast(t("marketing:newsletter.unsub.toast"), "success");
  };

  return (
    <AppShell>
      <div className={styles.page}>
        <div className={`wrap ${styles.wrap}`}>
          <Link to={SETTINGS} className={styles.back}>
            {t("marketing:newsletter.backToSettings")}
          </Link>
          <div className={styles.header}>
            <div className={styles.eye}>
              {t("marketing:newsletter.header.eyebrow")}
            </div>
            <h1 className={styles.title}>
              <Translation
                i18nKey="marketing:newsletter.header.title"
                components={{ em: <em /> }}
              />
            </h1>
            <p className={styles.sub}>{t("marketing:newsletter.header.sub")}</p>
          </div>

          <div className={styles.account}>
            <div>
              <div className={styles.accountLabel}>
                {t("marketing:newsletter.account.sendingTo")}
              </div>
              <div className={styles.email}>member@email.pt</div>
            </div>
            <Link to={SETTINGS} className={styles.edit}>
              {t("marketing:newsletter.account.changeEmail")}
            </Link>
          </div>

          {sections.map((section, sectionIndex) => (
            <div className={styles.section} key={section.id}>
              <div className={styles.sectionTitle}>{t(section.titleKey)}</div>
              {section.prefs.map((pref, prefIndex) => (
                <div className={styles.toggleRow} key={pref.id}>
                  <div className={styles.trBody}>
                    <div className={styles.trTitle}>{t(pref.titleKey)}</div>
                    <div className={styles.trSub}>{t(pref.subKey)}</div>
                    <div className={styles.trFreq}>{t(pref.freqKey)}</div>
                  </div>
                  <label className={styles.switch}>
                    {/* The visible name lives in .trTitle, which is not tied to
                        the control — the label carries it for assistive tech. */}
                    <span className="visuallyHidden">{t(pref.titleKey)}</span>
                    <input
                      type="checkbox"
                      checked={pref.checked}
                      disabled={pref.disabled}
                      onChange={() =>
                        !pref.disabled && toggle(sectionIndex, prefIndex)
                      }
                    />
                    <div className={styles.track}>
                      <div className={styles.thumb} />
                    </div>
                  </label>
                </div>
              ))}
            </div>
          ))}

          <div className={styles.save}>
            <Button
              variant="primary"
              onClick={() =>
                showToast(t("marketing:newsletter.save.toast"), "success")
              }
            >
              {t("marketing:newsletter.save.cta")}
            </Button>
            <div className={styles.saveNote}>
              {t("marketing:newsletter.save.note")}
            </div>
          </div>

          <div className={styles.unsubStrip}>
            <div className={styles.unsubTitle}>
              {t("marketing:newsletter.unsub.title")}
            </div>
            <div className={styles.unsubText}>
              {t("marketing:newsletter.unsub.text")}
            </div>
            <Button variant="ghost" onClick={unsubAll}>
              {t("marketing:newsletter.unsub.cta")}
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
