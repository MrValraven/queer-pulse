import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { PageMeta } from "../../shared/seo";
import { routes } from "../../app/routeMap";
import { Avatar, Button, Tag } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MagazineMasthead } from "./MagazineMasthead";
import { AuthorLink } from "./AuthorLink";
import { DeckViewer } from "./DeckViewer";
import { DeckPresentButton } from "./DeckPresentButton";
import { DeckRelatedRail } from "./DeckRelatedRail";
import { useDeck } from "./api/useDeck";
import styles from "./DeckPage.module.css";

export function DeckPage() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const id = params.get("id") ?? "ten-years-mouraria";
  const { data, isLoading } = useDeck(id);
  const deck = data?.deck ?? null;

  const initial = Math.max(0, Number(params.get("slide") ?? 1) - 1);
  const [index, setIndex] = useState(Number.isFinite(initial) ? initial : 0);

  const goToIndex = (next: number) => {
    setIndex(next);
    const query = new URLSearchParams(params);
    query.set("slide", String(next + 1));
    setParams(query, { replace: true });
  };

  if (!deck) {
    return (
      <PageShell>
        <PageMeta title={t("magazine:article.notFoundMetaTitle")} noIndex />
        <div className={`${styles.notFound} wrap`}>
          {isLoading ? null : (
            <>
              <h2>{t("magazine:article.notFoundTitle")}</h2>
              <Button to={routes.magazine}>
                {t("magazine:deck.backToMagazine")}
              </Button>
            </>
          )}
        </div>
      </PageShell>
    );
  }

  const clamped = Math.min(index, deck.slides.length - 1);
  const related = data?.related ?? [];

  return (
    <PageShell>
      <PageMeta
        title={`${deck.section} · QueerPulse`}
        canonical={`${routes.deck}?id=${id}`}
        image={deck.cover}
        type="article"
      />
      <MagazineMasthead />
      <div className={styles.header}>
        <div className="wrap">
          <Link to={routes.magazine} className={styles.back}>
            {t("magazine:deck.backToMagazine")}{" "}
            <span style={{ opacity: 0.5 }}>·</span> {deck.section}
          </Link>
          <div className={styles.kicker}>
            <Tag>{t("magazine:deck.badge")}</Tag> {deck.kicker}
          </div>
          <h1 className={styles.title}>{deck.title}</h1>
          <div className={styles.bylineRow}>
            <Avatar initials={deck.initials} tint={deck.tint} size={36} />
            <div>
              <div className={styles.author}>
                <AuthorLink name={deck.byline} />
              </div>
              {deck.role && <div className={styles.role}>{deck.role}</div>}
            </div>
            <div className={styles.pills}>
              <span className={styles.pill}>{deck.date}</span>
              <span className={styles.pill}>{deck.readTime}</span>
            </div>
            <DeckPresentButton
              title={deck.title}
              label={typeof deck.title === "string" ? deck.title : deck.section}
            >
              <DeckViewer deck={deck} index={clamped} onIndex={goToIndex} />
            </DeckPresentButton>
          </div>
        </div>
      </div>

      <div className={styles.stageWrap}>
        <DeckViewer deck={deck} index={clamped} onIndex={goToIndex} />
      </div>

      {related.length > 0 && <DeckRelatedRail related={related} />}
    </PageShell>
  );
}
