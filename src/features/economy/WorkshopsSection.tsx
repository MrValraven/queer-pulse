import { useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import { Avatar, Button, FadeIn } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useWorkshops } from "../../app/providers/useWorkshops";
import type { Workshop } from "./workshops.data";
import { AddWorkshopModal } from "./AddWorkshopModal";
import styles from "./WorkshopsSection.module.css";

function WorkshopCard({ workshop }: { workshop: Workshop }) {
  const { t } = useTranslation();
  const seatsLeft = workshop.spotsTotal - workshop.spotsFilled;
  return (
    <Link to={`${routes.skills}/${workshop.id}`} className={styles.card}>
      <div className={styles.cardTop}>
        <span
          className={[styles.mode, workshop.added && styles.newBadge]
            .filter(Boolean)
            .join(" ")}
        >
          {workshop.added
            ? t("economy:workshopsSection.newBadge")
            : workshop.mode}
        </span>
        <span className={styles.price}>{workshop.price}</span>
      </div>
      <div>
        <div className={styles.title}>
          {workshop.title} <em>{workshop.titleEm}</em>
        </div>
        <div className={styles.format}>{workshop.format}</div>
      </div>
      <div className={styles.desc}>{workshop.blurb}</div>
      <div className={styles.tutor}>
        <Avatar
          initials={workshop.tutor.initials}
          tint={workshop.tutor.tint}
          size={26}
        />
        <span>
          <Translation
            i18nKey="economy:workshopsSection.withTutor"
            values={{ name: workshop.tutor.name }}
            components={{ b: <b /> }}
          />
        </span>
      </div>
      <div className={styles.foot}>
        <span className={styles.spots}>
          {seatsLeft > 0 ? (
            <Translation
              i18nKey="economy:workshopsSection.seatsLeft"
              values={{ count: seatsLeft }}
              components={{ b: <b /> }}
            />
          ) : (
            t("economy:workshopsSection.cohortFull")
          )}
        </span>
        <span className={styles.view}>
          {t("economy:workshopsSection.viewCta")}
        </span>
      </div>
    </Link>
  );
}

export function WorkshopsSection({ active = "all" }: { active?: string }) {
  const { t } = useTranslation();
  const { workshops, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useWorkshops();
  const [adding, setAdding] = useState(false);
  // Category filtering is client-side over the pages loaded so far, as before —
  // demo has a single synthetic page, live appends real ones.
  const filtered =
    active === "all" ? workshops : workshops.filter((w) => w.category === active);

  // With no workshops to show — none listed at all, or a category filter that
  // hides them all — the section has nothing to say, so step out of the way.
  if (filtered.length === 0) return null;

  return (
    <div>
      <div className={styles.head}>
        <div className={styles.headText}>
          <h2>
            <span className={styles.dot} />
            <Translation
              i18nKey="economy:workshopsSection.heading"
              components={{ em: <em /> }}
            />
          </h2>
        </div>
        <Button variant="ghost" onClick={() => setAdding(true)}>
          <FiPlus aria-hidden /> {t("economy:workshopsSection.listCta")}
        </Button>
      </div>
      <p className={styles.blurb}>{t("economy:workshopsSection.blurb")}</p>

      <div className={styles.grid}>
        {filtered.map((workshop, index) => (
          <FadeIn
            key={workshop.id}
            className={styles.cardWrap}
            delay={Math.min(index, 8) * 60}
          >
            <WorkshopCard workshop={workshop} />
          </FadeIn>
        ))}
      </div>

      {hasNextPage && (
        <div className={styles.loadMore}>
          <Button
            type="button"
            variant="ghost"
            disabled={isFetchingNextPage}
            onClick={fetchNextPage}
          >
            {isFetchingNextPage
              ? t("economy:workshopsSection.loadingMore")
              : t("economy:workshopsSection.loadMoreCta")}
          </Button>
        </div>
      )}

      {adding && <AddWorkshopModal onClose={() => setAdding(false)} />}
    </div>
  );
}
