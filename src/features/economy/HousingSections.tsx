import { FiAward, FiStar } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Avatar, Reveal, SectionHead } from "../../shared/components/ui";
import { LANDLORDS } from "./landlords";
import { TIPS } from "./housing.data";
import styles from "./HousingPage.module.css";

export function HousingLandlords() {
  return (
    <section className={styles.landlords}>
      <div className="wrap">
        <Reveal>
          <SectionHead
            title={
              <>
                Community-endorsed <em>landlords</em>
              </>
            }
            subtitle="Members have vouched for these landlords as queer-friendly, reliable, and fair. Not a guarantee — always do your own due diligence."
          />
        </Reveal>
        <div className={styles.llGrid}>
          {LANDLORDS.map((ll, i) => (
            <Reveal
              as={Link}
              key={ll.name}
              to={`/work/landlord/${ll.slug}`}
              className={styles.llCard}
              delay={i * 55}
            >
              <span className={styles.llAvatar}>
                <Avatar
                  initials={ll.initials}
                  tint={ll.tint}
                  src={ll.photo}
                  size={52}
                />
                <span className={styles.llBadge} title="Community-endorsed">
                  <FiAward />
                </span>
              </span>
              <div>
                <div className={styles.llName}>{ll.name}</div>
                <div className={styles.llHood}>{ll.hood}</div>
                <div className={styles.llStars}>
                  {Array.from({ length: 5 }, (_, n) => (
                    <FiStar
                      key={n}
                      className={n < ll.stars ? styles.llStarOn : undefined}
                    />
                  ))}
                </div>
                <div className={styles.llNote}>{ll.note}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HousingTips() {
  return (
    <section className={styles.tips}>
      <div className="wrap">
        <Reveal>
          <SectionHead
            title={
              <>
                Housing in Lisbon — <em>what to know</em>
              </>
            }
          />
        </Reveal>
        <div className={styles.tipsGrid}>
          {TIPS.map((tip, i) => (
            <Reveal
              as="div"
              key={tip.num}
              className={styles.tipCard}
              delay={i * 55}
            >
              <div className={styles.tipNum}>{tip.num}</div>
              <div className={styles.tipTitle}>{tip.title}</div>
              <div className={styles.tipText}>{tip.text}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
