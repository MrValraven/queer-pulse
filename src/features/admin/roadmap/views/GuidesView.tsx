import type { ReactNode } from "react";
import {
  FiAlertTriangle,
  FiCheck,
  FiCheckCircle,
  FiEyeOff,
  FiShield,
  FiUsers,
} from "react-icons/fi";
import { EmptyState, Tag } from "../../../../shared/components/ui";
import { intlLocale } from "../../../../shared/i18n/locale";
import type { Language, TFunction } from "../../../../shared/i18n/types";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { AdminRoadmapItemDTO } from "../../api/roadmapAdmin.types";
import { useItemDrawer } from "../state/itemDrawerHook";
import {
  GUIDE_STEPS,
  guidePct,
  guideStepsDone,
  isReviewSoon,
  reVerifyDueDays,
} from "../guideProgress";
import styles from "./GuidesView.module.css";

// `category` is admin free text (see `roadmapChrome.data.ts`'s
// `getUniqueCategories` doc), and only these 9 have a translated label, so an
// unrecognized category falls back to the raw string rather than leaking a
// literal "roadmap.categories.xxx" key through `t()`'s missing-key fallback.
const KNOWN_CATEGORIES = new Set([
  "resources",
  "gatherings",
  "members",
  "safety",
  "content",
  "messaging",
  "community",
  "economy",
  "platform",
]);

function categoryLabel(t: TFunction, category: string): string {
  return KNOWN_CATEGORIES.has(category)
    ? t(`admin:roadmap.categories.${category}`)
    : category;
}

/** One flags-lite icon, shown only when its condition is true. Mirrors the
 *  Board card's flag icons (`admin:roadmap.board.flag.*`) at a smaller,
 *  read-only size for this row. The icon is decorative; the label carries
 *  the meaning for screen readers via the global `.visuallyHidden` utility
 *  (`title` alone would not reach touch users; see `StaffBadge`'s doc). */
function GuideFlag({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className={styles.flag}>
      {icon}
      <span className="visuallyHidden">{label}</span>
    </span>
  );
}

function GuideRow({
  item,
  today,
  language,
  t,
  onOpen,
}: {
  item: AdminRoadmapItemDTO;
  today: Date;
  language: Language;
  t: TFunction;
  onOpen: (id: string) => void;
}) {
  const guide = item.guide;
  if (!guide) return null;

  const done = guideStepsDone(item);
  const pct = guidePct(item);
  const dueDays = reVerifyDueDays(item, today);
  const danger = isReviewSoon(item, today);
  // `reVerifyDueDays` already guards an unparseable `reVerifyBy` (returns
  // `null`), so reuse that guard here too: a bad date never reaches
  // `toLocaleDateString` and renders "Invalid Date" instead of the
  // no-value label.
  const reVerifyLabel =
    guide.reVerifyBy && dueDays !== null
      ? new Date(guide.reVerifyBy).toLocaleDateString(intlLocale(language), {
          month: "short",
          year: "numeric",
        })
      : t("admin:common.notSet");

  return (
    <li>
      <button
        type="button"
        className={styles.row}
        onClick={() => onOpen(item.id)}
      >
        <div className={styles.rowTop}>
          <Tag>{categoryLabel(t, item.category)}</Tag>
          <div className={styles.flags}>
            {item.requested && (
              <GuideFlag
                icon={<FiUsers aria-hidden />}
                label={t("admin:roadmap.board.flag.requested")}
              />
            )}
            {item.committed && (
              <GuideFlag
                icon={<FiCheckCircle aria-hidden />}
                label={t("admin:roadmap.board.flag.committed")}
              />
            )}
            {!item.isPublic && (
              <GuideFlag
                icon={<FiEyeOff aria-hidden />}
                label={t("admin:roadmap.board.flag.hidden")}
              />
            )}
            {item.safetyStatus === 1 && (
              <GuideFlag
                icon={<FiShield aria-hidden />}
                label={t("admin:roadmap.board.flag.safetyGated")}
              />
            )}
          </div>
          <h3 className={styles.rowTitle}>{item.name}</h3>
        </div>

        <ol className={styles.checklist}>
          {GUIDE_STEPS.map((step) => {
            const stepDone = guide.steps[step];
            return (
              <li key={step} className={styles.checklistItem}>
                <span
                  className={[styles.dot, stepDone && styles.dotOn]
                    .filter(Boolean)
                    .join(" ")}
                  aria-hidden
                >
                  {stepDone && <FiCheck />}
                </span>
                <span className={styles.checklistLabel}>
                  {t(`admin:roadmap.drawer.guide.step.${step}`)}
                </span>
              </li>
            );
          })}
        </ol>

        <div className={styles.cells}>
          <div className={styles.cell}>
            <p className={styles.cellLabel}>
              {t("admin:roadmap.guidesView.progressLabel")}
            </p>
            <p className={styles.cellValue}>
              {done}/{GUIDE_STEPS.length}
            </p>
            <div className={styles.meterTrack}>
              <div className={styles.meterFill} style={{ width: `${pct}%` }} />
            </div>
          </div>

          <div className={styles.cell}>
            <p className={styles.cellLabel}>
              {t("admin:roadmap.guidesView.reviewerLabel")}
            </p>
            {guide.reviewer ? (
              <>
                <p className={styles.cellValue}>{guide.reviewer}</p>
                <p className={styles.cellSub}>
                  {guide.credential ||
                    t("admin:roadmap.guidesView.credentialNeeded")}
                </p>
              </>
            ) : (
              <p className={styles.cellMuted}>
                {t("admin:roadmap.guidesView.notAssigned")}
              </p>
            )}
          </div>

          <div className={styles.cell}>
            <p className={styles.cellLabel}>
              {t("admin:roadmap.guidesView.reVerifyByLabel")}
            </p>
            <p className={danger ? styles.cellValueDanger : styles.cellValue}>
              {danger && <FiAlertTriangle aria-hidden />} {reVerifyLabel}
            </p>
            {dueDays !== null && (
              <p className={danger ? styles.cellSubDanger : styles.cellSub}>
                {dueDays < 0
                  ? t("admin:roadmap.guidesView.overdueLabel", {
                      days: Math.abs(dueDays),
                    })
                  : t("admin:roadmap.guidesView.dueInLabel", {
                      days: dueDays,
                    })}
              </p>
            )}
          </div>

          <div className={styles.cell}>
            <p className={styles.cellLabel}>
              {t("admin:roadmap.drawer.guide.languagesLabel")}
            </p>
            <div className={styles.languages}>
              {(["en", "pt", "br"] as const).map((lang) => (
                <span
                  key={lang}
                  className={[
                    styles.langPill,
                    guide.languages[lang] && styles.langPillOn,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {lang.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        </div>
      </button>
    </li>
  );
}

/**
 * Guides view (`admin:roadmap.tabs.guides`): every non-archived roadmap
 * item tagged as a resource guide (`item.guide !== null`), each row a
 * 6-step review checklist, reviewer/credential, re-verify-by date and
 * language coverage. Health/legal content rots, so a guide whose
 * `reVerifyBy` is within 90 days (or already past) surfaces both on its own
 * row (danger tone) and in a page-level banner, the prototype's editorial
 * point that this list needs regular, not one-time, attention.
 */
export function GuidesView({ items }: { items: AdminRoadmapItemDTO[] }) {
  const { t, language } = useTranslation();
  const itemDrawer = useItemDrawer();
  const today = new Date();

  const guideItems = items.filter(
    (item) => item.guide !== null && !item.archived,
  );
  const dueSoonItems = guideItems.filter((item) => isReviewSoon(item, today));

  return (
    <div className={styles.view}>
      <header className={styles.header}>
        <h2 className={styles.title}>{t("admin:roadmap.tabs.guides")}</h2>
        <p className={styles.subtitle}>
          {t("admin:roadmap.guidesView.subtitle")}
        </p>
      </header>

      {dueSoonItems.length > 0 && (
        <div className={styles.reVerifyBanner} role="status">
          <FiAlertTriangle aria-hidden className={styles.reVerifyIcon} />
          <p>
            {t("admin:roadmap.guidesView.reVerifyWarning", {
              count: dueSoonItems.length,
              names: dueSoonItems.map((item) => item.name).join(", "),
            })}
          </p>
        </div>
      )}

      {guideItems.length === 0 ? (
        <EmptyState
          title={t("admin:roadmap.guidesView.emptyTitle")}
          description={t("admin:roadmap.guidesView.emptyBody")}
        />
      ) : (
        <ul className={styles.list}>
          {guideItems.map((item) => (
            <GuideRow
              key={item.id}
              item={item}
              today={today}
              language={language}
              t={t}
              onOpen={itemDrawer.open}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
