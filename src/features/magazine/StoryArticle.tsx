import { Link } from "react-router-dom";
import { Button, Outro } from "../../shared/components/ui";
import { memberName } from "../members/data/members";
import styles from "./StoryPage.module.css";

interface Props {
  profilePath: string;
  storyPath: string;
  invitePath: string;
}

export function StoryArticle({ profilePath, storyPath, invitePath }: Props) {
  return (
    <>
      <div className={styles.articleWrap}>
        <div className={styles.articleMeta}>
          <span className={styles.tag}>Design</span>
          <span className={styles.tag}>Community</span>
          <span className={styles.tag}>Príncipe Real</span>
          <span className={styles.dot} />
          <span>6 min read</span>
          <span className={styles.dot} />
          <span>June 2026</span>
        </div>

        <div className={styles.body}>
          <p>
            Six years ago it was a dusty first-floor flat with bad wiring, a
            view of someone else's laundry, and a landlord who answered exactly
            half of our emails. Today it's where half of Lisbon's queer design
            scene passes through — and nobody there is performing for an
            algorithm.
          </p>
          <p>
            I moved the studio into Príncipe Real in 2020, just before
            everything closed. The timing was accidental and probably lucky: the
            neighbourhood emptied out, rents dropped briefly to something almost
            survivable, and I signed a lease I couldn't really afford on a space
            I couldn't really see the point of yet.
          </p>

          <blockquote className={styles.quote}>
            <p>
              The studio didn't become a community because I planned it that
              way. It became one because there was nowhere else to go, and then
              because people kept coming back.
            </p>
            <cite>— {memberName("ines")}</cite>
          </blockquote>

          <p>
            The first person who wasn't me to work there was André — a
            photographer who needed a corner to edit in and was between flats.
            Then came a week when two designers from Porto were in the city and
            needed desks. Then a sound designer who said she'd stay for a month
            and left after a year to open her own place two streets away.
          </p>

          <div className={styles.imgInline}>
            <div className={styles.inlineImg}>Studio at Rua de São Marçal</div>
            <div className={styles.imgCaption}>
              The studio at Rua de São Marçal, photographed by{" "}
              {memberName("andre")}. The plants are mostly alive.
            </div>
          </div>

          <h2>
            What "community" actually <em>means</em>
          </h2>
          <p>
            I'm suspicious of the word community when it comes from a brand. But
            I don't have a better word for what the studio became. It wasn't a
            collective — nobody had a stake in the space or shared the costs
            except me. It wasn't a co-working space — there were no memberships,
            no hot desks, no branded mugs. It was just a room where queer
            creative people worked, ate lunch, complained about clients, and
            occasionally fell asleep on the sofa.
          </p>
          <p>
            What made it feel different from other studios I'd been in was the
            absence of the things studios usually have: hierarchy, competition,
            the quiet performance of being-busy-enough. Nobody was there to
            network. Most people were there because they needed somewhere to be,
            and the somewhere happened to be warm and not hostile to who they
            were.
          </p>

          <blockquote className={styles.quote}>
            <p>
              Nobody was performing productivity. Nobody was networking. They
              were just people who needed a room, and happened to be queer, and
              happened to end up in mine.
            </p>
            <cite>— {memberName("ines")}</cite>
          </blockquote>

          <h2>
            The thing about <em>safety</em>
          </h2>
          <p>
            I think about this a lot: what makes a creative space feel safe for
            queer people? It's not rainbow flags. It's not a policy on the wall.
            It's something harder to name — a quality of attention, maybe. The
            sense that you don't have to explain yourself before you're allowed
            to work. That you won't have to perform normalcy to earn the right
            to use the printer.
          </p>
          <p>
            The studio never had a policy. What it had was: everyone who came
            was brought by someone who already knew the room. That's it. Not a
            vetting process — just the slow accumulation of people who vouched
            for each other, who said "this person is good, you should meet
            them," and meant it.
          </p>
          <p>
            Which is, I think, also what QueerPulse is trying to do. Not a
            platform, not a network in the LinkedIn sense, but a room — one that
            keeps its shape because people take care of it.
          </p>

          <h2>
            What the studio is <em>now</em>
          </h2>
          <p>
            It's louder than it was. There are more plants. Someone hung a print
            of a Lotte Reiniger silhouette animation that I didn't choose but
            have grown to love. On Fridays there's usually something going on
            that I didn't organise — a critique session, a long lunch, sometimes
            someone playing music quietly on a laptop while they work on
            something they're not ready to show anyone.
          </p>
          <p>
            I still work there every day. I still sign the lease. But the studio
            stopped feeling like mine a long time ago, and that's the best thing
            that ever happened to it.
          </p>

          <div className={styles.authorCard}>
            <div className={styles.authorAv}>IT</div>
            <div>
              <div className={styles.authorName}>{memberName("ines")}</div>
              <div className={styles.authorRole}>
                Graphic Designer · Founder, Atelier Pulso · Príncipe Real
              </div>
              <div className={styles.authorBio}>
                Inês designs identities and editorial systems for cultural
                institutions and small presses. She has run her studio in
                Príncipe Real since 2020.
              </div>
              <Link to={profilePath} className={styles.authorLink}>
                View her profile →
              </Link>
            </div>
          </div>

          <div className={styles.more}>
            <h2>
              More from <em>the community</em>
            </h2>
            <div className={styles.moreGrid}>
              <Link to={storyPath} className={styles.moreCard}>
                <div className={styles.moreImg} />
                <div className={styles.mcCat}>Profiles</div>
                <div className={styles.mcTitle}>
                  Leaving the startup grind for a supper club in Mouraria
                </div>
                <div className={styles.mcBy}>
                  {memberName("sofia")} · 4 min read
                </div>
              </Link>
              <Link to={storyPath} className={styles.moreCard}>
                <div className={styles.moreImg} />
                <div className={styles.mcCat}>On Building</div>
                <div className={styles.mcTitle}>
                  Why we stayed invite-only: safety as a feature, not a gate
                </div>
                <div className={styles.mcBy}>
                  The QueerPulse team · 3 min read
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Outro
        title={
          <>
            Want to be part of what <em>gets written about next?</em>
          </>
        }
        sub="The stories are about the people in the room. Join us."
      >
        <Button to={invitePath} variant="primary" size="lg">
          Request an invite
        </Button>
      </Outro>
    </>
  );
}
