import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useSocial } from "../../app/providers/useSocial";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CREW } from "./filmPage.data";
import styles from "./FilmPage.module.css";
import { routes } from "../../app/routeMap";

const FILMMAKER_SLUG = "maria-vasconcelos";
const FILMMAKER_NAME = "Maria";

export function FilmBody() {
  const { showToast } = useToast();
  const { isFollowing, toggleFollow } = useSocial();
  const { t } = useTranslation();
  const following = isFollowing(FILMMAKER_SLUG);
  return (
    <section className={styles.body}>
      <div className={`wrap ${styles.bodyGrid}`}>
        <div>
          <div className={`${styles.block} ${styles.noteFull}`}>
            <div className={styles.nfHead}>
              <div className={styles.nfAv}>JR</div>
              <div>
                <div className={styles.nfName}>
                  <Link to={`${routes.cinemaCurator}/joao-ribeiro`}>
                    João Ribeiro
                  </Link>
                </div>
                <div className={styles.nfRole}>
                  Programming lead · curated for week 23
                </div>
              </div>
            </div>
            <div className={styles.nfBody}>
              <p>
                I first met Maria's footage three years before this film
                existed. She'd been recording the kitchens of her grandmother's
                friends — eleven older lesbian and gay women in Marvila and
                Beato — without a project, without funding, without knowing what
                she was looking for.
              </p>
              <p>
                The film that came out of those three years is patient in a way
                most queer documentary can't afford to be. There are{" "}
                <em>two whole minutes</em>, near minute 67, where the camera
                just stays on Dona Ilda's hands shelling broad beans.
              </p>
              <p>
                I'm programming this for week 23 because the cinema's first job
                is to make space for films that treat queer elders as{" "}
                <em>teachers</em>, not subjects. Stay for the second hour.
              </p>
            </div>
          </div>

          <div className={styles.block}>
            <h2>
              <Translation
                i18nKey="cinema:film.body.filmWords.title"
                components={{ em: <em /> }}
              />
            </h2>
            <div className={styles.syn}>
              <p>
                For three years, between 2022 and 2025, the filmmaker followed
                eleven queer elders across two Lisbon neighbourhoods — Marvila
                and Beato — into the kitchens that had hosted their lives.{" "}
                <em>The light between rooms</em> is not a film about coming out.
                It is a film about what was already there, before anyone had the
                word for it.
              </p>
              <p className="source">
                — Director's statement, Cinemateca Portuguesa programme, March
                2025.
              </p>
            </div>
          </div>

          <div className={styles.block}>
            <h2>
              <Translation
                i18nKey="cinema:film.body.cast.title"
                components={{ em: <em /> }}
              />
            </h2>
            <div className={styles.ccGrid}>
              {CREW.map((person) => (
                <div key={person.name} className={styles.ccRow}>
                  <div
                    className={[
                      styles.ccAv,
                      person.tone === "coral"
                        ? styles.coral
                        : person.tone === "jade"
                          ? styles.jade
                          : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {person.initials}
                  </div>
                  <div>
                    <div className={styles.ccName}>{person.name}</div>
                    <div className={styles.ccRole}>{person.role}</div>
                    <div className={styles.ccTags}>
                      {person.tags.map((tag) => (
                        <span
                          key={tag}
                          className={
                            tag === "member" ? styles.member : undefined
                          }
                        >
                          {tag === "member"
                            ? t("cinema:film.body.tag.member")
                            : tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.fmCard}>
            <div className={styles.fmHead}>
              <div className={styles.fmAv}>MV</div>
              <div>
                <Link
                  to={`${routes.cinemaFilmmaker}/${FILMMAKER_SLUG}`}
                  className={styles.fmName}
                >
                  Maria <em>Vasconcelos</em>
                </Link>
                <div className={styles.fmRole}>Director · Lisbon</div>
              </div>
            </div>
            <div className={styles.fmBio}>
              Documentary filmmaker working in Marvila. Three years on this
              film; a decade on the relationships that made it possible. Shoots
              slow, listens slower.
            </div>
            <div className={styles.fmStats}>
              <div className={styles.fmStat}>
                <Translation
                  i18nKey="cinema:film.body.filmmaker.stat.films"
                  values={{ count: 3 }}
                  components={{ em: <em /> }}
                />
              </div>
              <div className={styles.fmStat}>
                <span className="n">
                  €<em>4.2k</em>
                </span>
                {t("cinema:film.body.filmmaker.stat.earned")}
              </div>
            </div>
            <div className={styles.fmActions}>
              <Button to={`${routes.cinemaFilmmaker}/${FILMMAKER_SLUG}`}>
                {t("cinema:film.body.filmmaker.viewProfileCta")}
              </Button>
              <Button
                variant={following ? "jade" : "ghost"}
                onClick={() => {
                  const now = toggleFollow(FILMMAKER_SLUG);
                  showToast(
                    t(
                      now
                        ? "cinema:film.body.filmmaker.followedToast"
                        : "cinema:film.body.filmmaker.unfollowedToast",
                      { name: FILMMAKER_NAME },
                    ),
                    now ? "success" : "info",
                  );
                }}
              >
                {t(
                  following
                    ? "cinema:film.body.filmmaker.followingCta"
                    : "cinema:film.body.filmmaker.followCta",
                )}
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
