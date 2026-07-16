import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Avatar,
  Button,
  FadeIn,
  ImageSlot,
  SkeletonAvatar,
  SkeletonLine,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { minReadText } from "./magazineFormat";
import { PrintOrderModal } from "./PrintOrderModal";
import { useSimulatedLoad } from "../../shared/hooks";
import styles from "./IssuePage.module.css";
import { resolveWriter } from "./authorContent.data";
import { TOC, CONTRIBUTORS, PRINT_EDITION_IMG } from "./issue.data";
import { routes } from "../../app/routeMap";

/** The prototype always renders issue 09 — see `IssuePage`'s comment. */
const ISSUE_NUMBER = 9;
const ISSUE_PAGE_COUNT = 84;
const ISSUE_FEATURE_COUNT = 12;
const ISSUE_LONG_READ_COUNT = 1;

/** Entry counts per TOC section — drives a zero-shift skeleton. */
const TOC_ROW_COUNTS = TOC.map((section) => section.entries.length);

function TocSectionSkeleton({ rows }: { rows: number }) {
  return (
    <div className={styles.section} aria-hidden>
      <SkeletonLine width={80} height={12} style={{ marginTop: 6 }} />
      <div className={styles.entries}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className={styles.entry}>
            <div>
              <SkeletonLine
                width="30%"
                height={11}
                style={{ marginBottom: 6 }}
              />
              <SkeletonLine
                width="80%"
                height={24}
                style={{ marginBottom: 6 }}
              />
              <SkeletonLine
                width="95%"
                height={15}
                style={{ marginBottom: 8 }}
              />
              <SkeletonLine width="40%" height={12.5} />
            </div>
            <SkeletonLine width={40} height={20} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ContribCardSkeleton() {
  return (
    <div className={styles.contribCard} aria-hidden>
      <SkeletonAvatar size={38} />
      <div style={{ flex: 1 }}>
        <SkeletonLine width="70%" height={14} style={{ marginBottom: 4 }} />
        <SkeletonLine width="50%" height={11.5} />
      </div>
    </div>
  );
}

function TocSection() {
  const { t } = useTranslation();
  const loading = useSimulatedLoad();
  return (
    <div className={styles.page}>
      <div className={styles.tocHead}>
        <h2>
          <Translation
            i18nKey="magazine:contents.tocHeading"
            components={{ em: <em /> }}
          />
        </h2>
        <div className="meta">
          {t("magazine:issue.stats.pagesCount", { count: ISSUE_PAGE_COUNT })} ·{" "}
          {t("magazine:issue.stats.featuresCount", {
            count: ISSUE_FEATURE_COUNT,
          })}{" "}
          ·{" "}
          {t("magazine:issue.stats.longReadCount", {
            count: ISSUE_LONG_READ_COUNT,
          })}
        </div>
      </div>

      <div>
        {loading
          ? TOC_ROW_COUNTS.map((rows, i) => (
              <TocSectionSkeleton key={i} rows={rows} />
            ))
          : TOC.map((section) => (
              <div key={section.headingKey} className={styles.section}>
                <div className={styles.sectionH}>{t(section.headingKey)}</div>
                <div className={styles.entries}>
                  {section.entries.map((entry, i) => (
                    <FadeIn
                      as={Link}
                      key={entry.page}
                      to={`${routes.article}?id=${entry.articleId}`}
                      className={styles.entry}
                      delay={Math.min(i, 8) * 60}
                    >
                      <div>
                        <div className={styles.entryKicker}>
                          {entry.category} · {minReadText(entry.minutes, t)}
                        </div>
                        <div className={styles.entryTitle}>{entry.title}</div>
                        <div className={styles.entryDek}>{entry.dek}</div>
                        <div className={styles.entryByline}>
                          {entry.byline}
                        </div>
                      </div>
                      <div className={styles.metaR}>
                        {entry.page}
                        <span className="pg">
                          {t("magazine:contents.pageLabel")}
                        </span>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}

function ContributorsSection() {
  const { t } = useTranslation();
  const loading = useSimulatedLoad();
  return (
    <section className={styles.contrib}>
      <div className={styles.contribInner}>
        <h2>
          <Translation
            i18nKey="magazine:contents.contributorsHeading"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.contribSub}>
          {t("magazine:contents.contributorsSubtitle", {
            count: CONTRIBUTORS.length,
            issue: ISSUE_NUMBER,
          })}
        </p>
        <div className={styles.contribGrid}>
          {loading
            ? Array.from({ length: CONTRIBUTORS.length }).map((_, i) => (
                <ContribCardSkeleton key={i} />
              ))
            : CONTRIBUTORS.map((person, i) => {
                const dest = resolveWriter(person.name);
                const body = (
                  <>
                    <Avatar initials={person.initials} tint="coral" size={38} />
                    <div>
                      <div className={styles.contribName}>{person.name}</div>
                      <div className={styles.contribRole}>{person.role}</div>
                    </div>
                  </>
                );
                return dest ? (
                  <FadeIn
                    as={Link}
                    key={person.name}
                    to={dest}
                    className={styles.contribCard}
                    delay={Math.min(i, 8) * 60}
                  >
                    {body}
                  </FadeIn>
                ) : (
                  <FadeIn
                    key={person.name}
                    className={styles.contribCard}
                    delay={Math.min(i, 8) * 60}
                  >
                    {body}
                  </FadeIn>
                );
              })}
        </div>
      </div>
    </section>
  );
}

function PrintSection({ onOrder }: { onOrder: () => void }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <section className={styles.print}>
      <div className={styles.printInner}>
        <div>
          <div className={styles.poEyebrow}>
            {t("magazine:contents.print.eyebrow")}
          </div>
          <h2 className={styles.poH}>
            <Translation
              i18nKey="magazine:contents.print.heading"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.poD}>
            <Translation
              i18nKey="magazine:contents.print.body"
              components={{ b: <b /> }}
              values={{ issue: ISSUE_NUMBER, pages: ISSUE_PAGE_COUNT }}
            />
          </p>
          <div className={styles.poActions}>
            <Button type="button" onClick={onOrder}>
              {t("magazine:contents.print.orderCta", {
                price: fmt.currency(12),
              })}
            </Button>
            <Button variant="ghost" to={routes.magazine}>
              {t("magazine:contents.print.readOnlineCta")}
            </Button>
          </div>
        </div>
        <ImageSlot
          tint="coral"
          radius={18}
          src={PRINT_EDITION_IMG}
          alt={t("magazine:contents.print.imageAlt", { issue: ISSUE_NUMBER })}
          placeholder={t("magazine:contents.print.imageAlt", {
            issue: ISSUE_NUMBER,
          })}
          style={{ aspectRatio: "4/3", height: "auto" }}
        />
      </div>
    </section>
  );
}

export function IssueContents() {
  const [ordering, setOrdering] = useState(false);

  return (
    <>
      <TocSection />
      <ContributorsSection />
      <PrintSection onOrder={() => setOrdering(true)} />
      {ordering && <PrintOrderModal onClose={() => setOrdering(false)} />}
    </>
  );
}
