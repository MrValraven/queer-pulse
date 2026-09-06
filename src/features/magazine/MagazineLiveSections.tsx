import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import {
  Avatar,
  Button,
  ImageSlot,
  Reveal,
  SkeletonCard,
  SkeletonLine,
  Tag,
} from "../../shared/components/ui";
import { MagazineComingSoon } from "./MagazineComingSoon";
import { MagazineFrontLead } from "./MagazineFrontLead";
import { MagazineLoadError } from "./MagazineLoadError";
import { MagazineSignInWall } from "./MagazineSignInWall";
import { ApiError } from "../../shared/api/client";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useMagazineHome } from "./api/useMagazineHome";
import { useMagazineFront } from "./api/useMagazineFront";
import { useIssues } from "./api/useIssues";
import { initialsFor, tintFor } from "./api/magazine.adapters";
import type { ArticleListItemDTO, DeckListItemDTO } from "./api/magazine.api";
import type {
  MagazineFrontEntryDto,
  MagazineFrontSectionDto,
} from "./api/magazineFront.api";
import styles from "./MagazinePage.module.css";

/**
 * The live-mode magazine front.
 *
 * CNT-3 gave it real data (the public `GET /magazine/articles` / `decks` /
 * `issues` reads) instead of a permanent "coming soon". CON-13 gave it an
 * EDITOR: the front now opens on the lead story the desk put first in the
 * current issue's run order, followed by that run order's own section rails,
 * with reverse-chronological "Latest" as the tail for anything the issue does
 * not place. Before this it was `articles.slice(0, 9)` in `published_at DESC`
 * — a blog roll on a product whose desk can commission, edit, gate and ship a
 * whole issue.
 *
 * Nothing is invented. Before an issue has shipped, or when its run order is
 * empty, `front` comes back null/empty and the page falls back to exactly the
 * reverse-chronological front it had before.
 */
export function MagazineLiveSections() {
  const home = useMagazineHome();
  const front = useMagazineFront();
  const { t } = useTranslation();

  if (home.isLoading || front.isLoading) {
    return <LiveFrontSkeleton />;
  }

  const articles = home.data?.articles ?? [];
  const decks = home.data?.decks ?? [];
  const lead = front.data?.lead ?? null;
  const frontSections = front.data?.sections ?? [];
  const hasContent = articles.length > 0 || decks.length > 0 || lead !== null;

  // CON-07: an error is NOT an empty catalogue. Every magazine read endpoint
  // sits behind `ActiveMemberGuard`, so a logged-out visitor gets a 401, which
  // used to render as "The magazine is coming soon", permanently telling the
  // public the magazine does not exist. A 401 now gets the members-only wall
  // with a `?next=` sign-in CTA; any other failure gets the real, retry-able
  // error panel; and only a genuinely empty catalogue keeps the coming-soon
  // copy below.
  if (home.isError) {
    const isSignedOut =
      home.error instanceof ApiError && home.error.status === 401;
    return (
      <div className={styles.body}>
        <div className="wrap">
          {isSignedOut ? (
            <MagazineSignInWall />
          ) : (
            <MagazineLoadError onRetry={() => void home.refetch()} />
          )}
        </div>
      </div>
    );
  }

  // Honest empty state — no published articles or decks yet — rather than
  // fake demo content.
  if (!hasContent) {
    return (
      <div className={styles.body}>
        <div className="wrap">
          <MagazineComingSoon />
        </div>
      </div>
    );
  }

  const [featuredDeck] = decks;
  // Everything the issue places is already on the page above the tail, so the
  // tail is what the run order does not carry: web-only pieces, and anything
  // from a past issue. Without this the lead story would appear twice.
  const placedSlugs = new Set([
    ...(lead ? [lead.slug] : []),
    ...frontSections.flatMap((section) =>
      section.entries.map((entry) => entry.slug),
    ),
  ]);
  const tailArticles = articles.filter(
    (article) => !placedSlugs.has(article.slug),
  );
  const rails = toRails(frontSections);
  // The front-of-book lists each section ONCE, pointing at the first rail
  // that carries it. An editor who runs Features, then an essay, then
  // Features again meant that arrangement, and the rails keep it; repeating
  // the same word twice in the nav would only make it harder to read.
  const frontOfBook = rails.filter(
    (rail, index) =>
      rail.section.name !== "" &&
      rails.findIndex((other) => other.section.name === rail.section.name) ===
        index,
  );

  return (
    <>
      {frontOfBook.length > 0 && (
        <div className="wrap">
          <nav
            className={styles.inIssue}
            aria-label={t("magazine:landing.inIssueAriaLabel")}
          >
            <span className={styles.inIssueLabel}>
              {t("magazine:landing.inIssueLabel")}
            </span>
            <span className={styles.inIssueLinks}>
              {frontOfBook.map((rail) => (
                <a
                  key={rail.anchor}
                  className={styles.inIssueLink}
                  href={`#${rail.anchor}`}
                >
                  {rail.section.name}
                </a>
              ))}
            </span>
          </nav>
        </div>
      )}

      {lead && (
        <MagazineFrontLead
          entry={lead}
          issueNumber={front.data?.issue?.number ?? null}
        />
      )}

      <div className={styles.body}>
        <div className="wrap">
          {rails.map((rail) => (
            <LiveSectionRail
              key={rail.anchor}
              section={rail.section}
              anchor={rail.anchor}
            />
          ))}

          {featuredDeck && (
            // PRD-105 — the front shows the NEWEST deck and nothing else, and
            // neither search, the section browse nor an issue's run order
            // carries decks, so every older deck used to leave the magazine
            // the moment a second one published. The heading above the
            // showcase is the way through to the full index. No `.section`
            // wrapper class: `.featuredDeck` already carries the bottom
            // margin, and both would stack it twice.
            <section>
              <div className={styles.asHead}>
                <h2 className={styles.asTitle}>
                  <Translation
                    i18nKey="magazine:decks.frontRailTitle"
                    components={{ em: <em /> }}
                  />
                </h2>
                <Link to={routes.magazineDecks} className={styles.asSeeAll}>
                  {t("magazine:decks.allCta")} <FiArrowRight aria-hidden />
                </Link>
              </div>
              <LiveFeaturedDeck deck={featuredDeck} />
            </section>
          )}

          {tailArticles.length > 0 && (
            <section className={styles.section}>
              <div className={styles.asHead} id="latest">
                <h2 className={styles.asTitle}>
                  <Translation
                    i18nKey="magazine:sections.live.title"
                    components={{ em: <em /> }}
                  />
                </h2>
              </div>
              <div className={styles.grid}>
                {tailArticles.slice(0, 9).map((article) => (
                  <LiveArticleCard key={article.slug} article={article} />
                ))}
              </div>
            </section>
          )}

          <LiveArchiveSection />
          <LiveSubmitBanner />
        </div>
      </div>
    </>
  );
}

/** One section rail plus the unique in-page anchor the front-of-book uses. */
interface FrontRail {
  section: MagazineFrontSectionDto;
  anchor: string;
}

/**
 * Anchors every rail exactly once. Section names come from the desk, so two
 * rails can genuinely share one ("Features", an essay, "Features" again) and a
 * name can be missing altogether; both would otherwise produce a duplicate or
 * an empty `id`, which no browser resolves.
 */
function toRails(sections: MagazineFrontSectionDto[]): FrontRail[] {
  const usedAnchors = new Set<string>();
  return sections.map((section, index) => {
    const base =
      section.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || `part-${index + 1}`;
    let anchor = base;
    let suffix = 2;
    while (usedAnchors.has(anchor)) {
      anchor = `${base}-${suffix}`;
      suffix += 1;
    }
    usedAnchors.add(anchor);
    return { section, anchor };
  });
}

/**
 * One run of consecutive run-order slots the desk ran under the same section.
 * A group the desk left unsectioned keeps the pieces in their arranged order
 * under a heading the front supplies, rather than being dropped or given an
 * invented section name.
 */
function LiveSectionRail({
  section,
  anchor,
}: {
  section: MagazineFrontSectionDto;
  anchor: string;
}) {
  return (
    <section className={styles.section} id={anchor}>
      <div className={styles.asHead}>
        <h2 className={styles.asTitle}>
          {section.name || (
            <Translation
              i18nKey="magazine:front.moreInIssue"
              components={{ em: <em /> }}
            />
          )}
        </h2>
      </div>
      <div className={styles.grid}>
        {section.entries.map((entry) => (
          <LiveFrontCard key={entry.slug} entry={entry} />
        ))}
      </div>
    </section>
  );
}

/**
 * A card for a run-order slot. Same shape as `LiveArticleCard` below, with the
 * two things the run order adds: the desk's own blurb for this slot (which
 * beats the article's dek, because an editor wrote it for this position), and
 * the section it runs under as the kicker when the piece carries none.
 */
function LiveFrontCard({ entry }: { entry: MagazineFrontEntryDto }) {
  const { t } = useTranslation();
  const tint = tintFor(entry.author.handle);
  const imageTint = tint === "default" || tint === "auth" ? "plum" : tint;
  return (
    <Reveal
      as={Link}
      to={`${routes.article}?id=${entry.slug}`}
      className={styles.ac}
    >
      <div className={styles.acImg}>
        <ImageSlot
          tint={imageTint}
          height="100%"
          radius={14}
          src={entry.imageUrl ?? undefined}
          alt={entry.title}
          placeholder={entry.title}
          // CON-04 — `focus`, never `crop`: the card's cover strip is a fixed
          // band whose aspect never matches an arbitrary saved rect, and the
          // exact-frame prop would distort the art.
          focus={entry.imageCrop}
        />
      </div>
      <div className={styles.acKicker}>{entry.kicker || entry.section}</div>
      <div className={styles.acTitle}>{entry.title}</div>
      <div className={styles.acExcerpt}>{entry.blurb || entry.dek}</div>
      <div className={styles.acMeta}>
        <Avatar
          initials={initialsFor(entry.author.displayName)}
          tint={tint}
          size={22}
        />
        {entry.author.displayName}
        {" · "}
        {t("magazine:format.minRead", { count: entry.readMinutes })}
      </div>
    </Reveal>
  );
}

function LiveArticleCard({ article }: { article: ArticleListItemDTO }) {
  const { t } = useTranslation();
  const tint = tintFor(article.author.handle);
  // `tintFor` returns the broader `AvatarTint` (for the byline `<Avatar>`
  // below); `ImageSlot` only accepts the narrower `ImageSlotTint` (no
  // "auth"/"default") — `tintFor` never actually returns those two, but the
  // declared return type does, so narrow explicitly rather than widening
  // `ImageSlotTint` itself just for this one call site.
  const imageTint = tint === "default" || tint === "auth" ? "plum" : tint;
  return (
    <Reveal
      as={Link}
      to={`${routes.article}?id=${article.slug}`}
      className={styles.ac}
    >
      <div className={styles.acImg}>
        <ImageSlot
          tint={imageTint}
          height="100%"
          radius={14}
          // CON-04 — the piece's own lead art. Absent, the tinted placeholder
          // below is what the card has always shown.
          src={article.heroImageUrl ?? undefined}
          alt={article.title}
          placeholder={article.title}
        />
      </div>
      <div className={styles.acKicker}>
        {article.issueNumber
          ? t("magazine:format.issueLabel", { number: article.issueNumber })
          : t("magazine:front.fromTheMagazine")}
      </div>
      <div className={styles.acTitle}>{article.title}</div>
      <div className={styles.acExcerpt}>{article.dek}</div>
      <div className={styles.acMeta}>
        <Avatar
          initials={initialsFor(article.author.displayName)}
          tint={tint}
          size={22}
        />
        {article.author.displayName}
        {" · "}
        {t("magazine:format.minRead", { count: article.readMinutes })}
      </div>
    </Reveal>
  );
}

function LiveFeaturedDeck({ deck }: { deck: DeckListItemDTO }) {
  const { t } = useTranslation();
  return (
    <Reveal className={styles.featuredDeck}>
      <div className={styles.fdMedia}>
        <ImageSlot
          src={deck.cover}
          alt={deck.coverDesc}
          tint="jade"
          height={220}
          radius={16}
          placeholder={deck.coverDesc}
        />
      </div>
      <div>
        <Tag>{t("magazine:deck.badge")}</Tag>
        <h2 className={styles.fdTitle}>{deck.title}</h2>
        <div className={styles.feByline}>{deck.byline}</div>
        <p className={styles.feExcerpt}>{deck.kicker}</p>
        <Link className={styles.feRead} to={`${routes.deck}?id=${deck.slug}`}>
          {t("magazine:deck.start")} <FiArrowRight aria-hidden />
        </Link>
      </div>
    </Reveal>
  );
}

/** Real past issues (`GET /magazine/issues`) — renders nothing until at
 *  least one issue has actually shipped. */
function LiveArchiveSection() {
  const { data: issues } = useIssues();
  if (!issues || issues.length === 0) return null;

  return (
    <section className={styles.section} id="archive">
      <div className={styles.asHead} id="archive-head">
        <h2 className={styles.asTitle}>
          <Translation
            i18nKey="magazine:sections.archive.title"
            components={{ em: <em /> }}
          />
        </h2>
      </div>
      <div className={styles.archiveRow}>
        {issues.slice(0, 4).map((issue) => (
          <Link
            key={issue.number}
            to={`${routes.issue}/${issue.number}`}
            className={styles.archiveIssue}
          >
            {/* PRD-104 — the desk's uploaded cover, the same art the issue
                page and the archive tiles now show. Absent (every demo issue,
                and any live issue the desk never gave a file), the tinted
                caption tile below is what this row has always shown. */}
            {issue.coverUrl ? (
              <ImageSlot
                className={styles.aiCover}
                src={issue.coverUrl}
                focus={issue.coverCrop}
                alt={issue.cover}
                placeholder={issue.cover}
                radius={10}
                width="100%"
                height="auto"
                style={{ aspectRatio: "3 / 4" }}
              />
            ) : (
              <div className={styles.aiCover}>
                <div className={styles.aiCoverTitle}>{issue.numberLabel}</div>
              </div>
            )}
            <div className={styles.aiMonth}>{issue.date}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function LiveSubmitBanner() {
  const { t } = useTranslation();
  return (
    <div className={styles.submit}>
      <div className={styles.ssBody}>
        <h3>
          <Translation
            i18nKey="magazine:sections.submit.title"
            components={{ em: <em /> }}
          />
        </h3>
        <p>{t("magazine:sections.submit.body")}</p>
      </div>
      <Button to={routes.submitStory} variant="primary" size="lg">
        {t("magazine:sections.submit.cta")}
      </Button>
    </div>
  );
}

/**
 * Mirrors the shape that actually arrives: the full-bleed lead, then a rail of
 * three cards. The old skeleton showed three cards only, so the lead landing
 * above them shifted the whole page down on every load.
 */
function LiveFrontSkeleton() {
  return (
    <>
      <div className={styles.coverRebalanced} aria-busy>
        <div className={styles.csImage} />
        <div className={styles.csText}>
          <div className={styles.csTextInner}>
            <SkeletonLine width="35%" height={12} />
            <SkeletonLine width="90%" height={40} style={{ marginTop: 18 }} />
            <SkeletonLine width="60%" height={40} style={{ marginTop: 8 }} />
            <SkeletonLine width="40%" height={13} style={{ marginTop: 20 }} />
            <SkeletonLine width="100%" height={13} style={{ marginTop: 18 }} />
            <SkeletonLine width="85%" height={13} style={{ marginTop: 8 }} />
          </div>
        </div>
      </div>
      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.grid}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    </>
  );
}
