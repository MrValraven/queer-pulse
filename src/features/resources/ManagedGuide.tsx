import type { ReactNode } from "react";
import { PageShell } from "../../shared/components/layout";
import { SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import { useManagedGuide } from "./api/useManagedGuide";
import { GuideBody } from "./GuideBody";
import { GuideUnderReview } from "./GuideUnderReview";
import { GuideReviewFooter } from "./GuideReviewFooter";
import { ResourceHero } from "./ResourceHero";
import { SuggestEditTrigger } from "./SuggestEditTrigger";
import styles from "./resources.module.css";

export interface ManagedGuideProps {
  /** The `resources.slug` this route corresponds to. */
  slug: string;
  /** The hardcoded page, rendered whenever the guide has no managed body. */
  fallback: ReactNode;
}

/**
 * The single gate every `/resources/*` guide route renders through (CON-08).
 *
 * A guide whose prose has been backfilled into the database renders from the
 * database, so an editor changing a phone number in a crisis guide is an
 * admin-panel edit instead of an engineer editing two i18n catalogs across
 * two directories and shipping a deploy. Every other guide falls through to
 * its hardcoded page exactly as before — the page is the fallback until
 * somebody takes it over in the editor.
 *
 * Both paths get the review footer (CON-09), which is the point of putting
 * one component in front of all of them: "Reviewed {date}" reaches all ~31
 * guides from here rather than from 31 separate page edits.
 *
 * It is also the single gate for editorial review. A guide the backend will
 * not serve publicly — unpublished, or never read end to end by an editor —
 * renders `GuideUnderReview` instead of its page, and because every guide
 * route in `routes.tsx` goes through here, that is one condition rather than
 * 31. A guide with no visible row is hidden even when a hardcoded page for it
 * still exists in this bundle: the database is the authority on what a reader
 * is allowed to be told. `useManagedGuide` only reports `isGated` when the
 * server said so, so an outage leaves every page exactly as it was.
 *
 * The fallback is passed as an already-created element. React.lazy only
 * imports on render, so creating the element costs nothing and the hardcoded
 * page's chunk is fetched only if it is actually the one that renders.
 */
export function ManagedGuide({ slug, fallback }: ManagedGuideProps) {
  const { guide, hasManagedBody, isGated, isLoading } = useManagedGuide(slug);

  if (isLoading) return <ManagedGuideSkeleton />;
  if (isGated) return <GuideUnderReview />;
  if (guide && hasManagedBody) {
    return <ManagedGuideBody slug={slug} guide={guide} />;
  }
  // The hardcoded page, plus the review line whenever a row exists to supply
  // it. That is what puts "Reviewed {date}" under every guide rather than
  // only the ones an editor has already taken over.
  return (
    <>
      {fallback}
      {guide && (
        <GuideReviewFooter
          lastReviewedOn={guide.lastReviewedOn}
          reviewedBy={guide.reviewedBy}
          reviewDueOn={guide.reviewDueOn}
        />
      )}
    </>
  );
}

/**
 * Shown only in live mode while the "is this guide managed?" lookup is in
 * flight. Rendering the hardcoded page first and swapping would flash one
 * version of a health guide into another, which is worse than a brief
 * skeleton on a page people read carefully.
 */
function ManagedGuideSkeleton() {
  return (
    <PageShell>
      <div className="wrap" style={{ padding: "72px 0" }}>
        <SkeletonLine height={44} style={{ maxWidth: 520, marginBottom: 20 }} />
        <SkeletonLine height={20} style={{ maxWidth: 640, marginBottom: 44 }} />
        {[0, 1, 2].map((lineIndex) => (
          <SkeletonLine
            key={lineIndex}
            height={16}
            style={{ maxWidth: 700, marginBottom: 14 }}
          />
        ))}
      </div>
    </PageShell>
  );
}

type ManagedGuideData = NonNullable<
  ReturnType<typeof useManagedGuide>["guide"]
>;

function ManagedGuideBody({
  slug,
  guide,
}: {
  slug: string;
  guide: ManagedGuideData;
}) {
  const { t, language } = useTranslation();

  // Portuguese copy when it exists, English when it does not. Falling back to
  // the English prose is the honest treatment of a missing translation on a
  // health guide: a half-translated page is worse than a consistent one.
  const isPortuguese = language === "pt";
  const title = (isPortuguese && guide.titlePt) || guide.title;
  const description =
    (isPortuguese && guide.descriptionPt) || guide.description;
  const sections =
    (isPortuguese && guide.sectionsPt?.length ? guide.sectionsPt : null) ??
    guide.sections;

  const path = guide.routePath ?? `/resources/guide/${slug}`;
  const anchors = sections
    .filter((section) => section.heading)
    .map((section) => ({
      label: section.heading,
      href: `#${section.id}`,
    }));

  return (
    <PageShell>
      <PageMeta title={title} description={description} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("nav:resources"), path: "/resources" },
          { name: title, path },
        ])}
      />
      <ResourceHero
        eyebrow={t("resources:guide.managedEyebrow")}
        eyebrowDotColor="var(--jade)"
        title={title}
        lead={description}
        anchors={anchors}
      />

      <GuideBody sections={sections} />

      <section className={`${styles.section} ${styles.sectionPaper}`}>
        <div className="wrap">
          <SuggestEditTrigger subject={title} context="guide" />
        </div>
      </section>

      <GuideReviewFooter
        lastReviewedOn={guide.lastReviewedOn}
        reviewedBy={guide.reviewedBy}
        reviewDueOn={guide.reviewDueOn}
      />
    </PageShell>
  );
}
