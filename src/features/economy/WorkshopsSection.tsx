import { useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import { Avatar, Button, FadeIn } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useWorkshops } from "../../app/providers/WorkshopsProvider";
import type { Workshop } from "./workshops.data";
import { AddWorkshopModal } from "./AddWorkshopModal";
import styles from "./WorkshopsSection.module.css";

function WorkshopCard({ workshop }: { workshop: Workshop }) {
  const seatsLeft = workshop.spotsTotal - workshop.spotsFilled;
  return (
    <Link to={`${routes.skills}/${workshop.id}`} className={styles.card}>
      <div className={styles.cardTop}>
        <span
          className={[styles.mode, workshop.added && styles.newBadge]
            .filter(Boolean)
            .join(" ")}
        >
          {workshop.added ? "New · yours" : workshop.mode}
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
          with <b>{workshop.tutor.name}</b>
        </span>
      </div>
      <div className={styles.foot}>
        <span className={styles.spots}>
          {seatsLeft > 0 ? (
            <>
              <b>{seatsLeft}</b> {seatsLeft === 1 ? "seat" : "seats"} left
            </>
          ) : (
            "Cohort full"
          )}
        </span>
        <span className={styles.view}>View workshop →</span>
      </div>
    </Link>
  );
}

export function WorkshopsSection({ active = "all" }: { active?: string }) {
  const { workshops } = useWorkshops();
  const [adding, setAdding] = useState(false);
  const filtered =
    active === "all" ? workshops : workshops.filter((w) => w.cat === active);

  // When a category filter hides every workshop, step out of the way entirely.
  if (filtered.length === 0 && active !== "all") return null;

  return (
    <div>
      <div className={styles.head}>
        <div className={styles.headText}>
          <h2>
            <span className={styles.dot} />
            Advanced <em>workshops</em>
          </h2>
        </div>
        <Button variant="ghost" onClick={() => setAdding(true)}>
          <FiPlus aria-hidden /> List a workshop
        </Button>
      </div>
      <p className={styles.blurb}>
        Structured, multi-week courses led by members who go deep on one craft.
        Small cohorts, sliding-scale pricing, and you make something real by the
        end. Running a course yourself? List it here.
      </p>

      <div className={styles.grid}>
        {filtered.map((workshop, i) => (
          <FadeIn key={workshop.id} delay={Math.min(i, 8) * 60}>
            <WorkshopCard workshop={workshop} />
          </FadeIn>
        ))}
      </div>

      {adding && <AddWorkshopModal onClose={() => setAdding(false)} />}
    </div>
  );
}
