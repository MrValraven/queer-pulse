import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import styles from "./StoryTomasPage.module.css";
import { memberName } from "../members/data/members";

function QA({ q, a }: { q: string; a: string }) {
  return (
    <div className={styles.qa}>
      <div className={styles.qLine}>
        <span className={styles.qTag}>Q</span>
        <p>{q}</p>
      </div>
      <div className={styles.aLine}>
        <span className={styles.aTag}>TB</span>
        <p>{a}</p>
      </div>
    </div>
  );
}

export function StoryTomasArticle() {
  return (
    <>
      <div className={styles.articleWrap}>
        <div className={styles.articleMeta}>
          <span className={styles.tag}>Food</span>
          <span className={styles.tag}>Community</span>
          <span className={styles.tag}>Mouraria</span>
          <span className={styles.dot} />
          <span>4 min read</span>
          <span className={styles.dot} />
          <span>May 2026</span>
        </div>

        <div className={styles.body}>
          <p>
            Tomás Beto's apartment smells like vinegar and something fermenting
            in a jar he won't tell me about. There are twelve chairs stacked in
            the corner, a whiteboard with a menu written in pencil, and a cat
            asleep on a pile of linen napkins. In three hours, strangers will
            sit down at his dining table and eat whatever he decides to cook.
          </p>
          <p>
            This is Queer Supper Club №12. Tomás has been doing this for just
            over two years — hosting intimate dinners for members of the
            QueerPulse community out of his apartment in Mouraria. No fixed
            menu. No Instagram. Twelve seats, and a waiting list that he mostly
            ignores in favour of people he's heard about through the network.
          </p>
          <p>
            Until 2023, he was a product manager at a fintech startup in Parque
            das Nações, commuting forty minutes each way, managing a team of
            eight, and making a salary that looked good on paper. He left in
            March of that year, with no plan except a fermentation kit and a
            kitchen he'd been under-using for years.
          </p>

          <blockquote className={styles.quote}>
            <p>
              I wasn't unhappy. I was just completely disconnected from anything
              that felt like mine. The job was fine. The money was fine. But I'd
              go to work and come home and go to a bar and nothing felt like it
              had anything to do with who I actually was.
            </p>
            <cite>— {memberName("tomas")}</cite>
          </blockquote>

          <p>
            We talked for two hours on a Tuesday afternoon, between his prep
            work. The conversation ranged from the politics of food to how he
            sources his wine to why he thinks queer hospitality is a
            fundamentally different project from hospitality in general.
          </p>

          <div className={styles.imgInline}>
            <div className={styles.inlineImg}>
              Tomás in his kitchen, February 2026
            </div>
            <div className={styles.imgCaption}>
              Tomás in his kitchen before supper club №11, February 2026.
              Photographed by André Quintela.
            </div>
          </div>

          <h2>
            On leaving the job and <em>what came next</em>
          </h2>
          <QA
            q="Was there a moment when you decided you were going to do this, or did it happen gradually?"
            a="There was a moment, but it wasn't dramatic. I was at a work dinner — one of those dinners where you're meant to network but everyone is tired — and I looked at the food and thought, this is the worst meal I've had in months, and I'm surrounded by people who don't notice. That was it. Not quitting because I was miserable. Quitting because I'd become someone who ate bad food at a networking dinner and thought it was fine."
          />
          <QA
            q="What was the first supper club like?"
            a="Terrifying. Eight people, not twelve — I didn't trust myself for twelve yet. A friend of mine from Graça, Sofia's flatmate at the time, spread the word through the queer community. Everyone who came was a stranger to me. The menu was overambitious. The bread was bad. But the conversation was — it was the best dinner I'd had in years. People talked about things. Real things. I went to bed at 2am and thought, okay, this is what I'm doing."
          />
          <QA
            q="Why specifically a queer supper club? Why not just a supper club?"
            a="Because the room is different. Not every dinner, and not obviously — but there's something about sitting down with a table full of people who have all, in different ways, had to think carefully about who they are. It changes the texture of a conversation. People are less performative. They're less interested in impressing and more interested in connecting. That might be a romantic reading, but it's what I've found to be true."
          />

          <h2>
            On queer hospitality and <em>why it's different</em>
          </h2>
          <p>
            I ask Tomás what he means by queer hospitality. He's quiet for a
            moment, stirring something on the stove.
          </p>
          <QA
            q="You've described what you do as &quot;queer hospitality&quot; in a few conversations I've heard about. What do you mean by that?"
            a="I mean hospitality that isn't interested in performing abundance. A lot of high-end food culture is about showing you how much — how many courses, how rare the ingredients, how impressive the technique. I'm more interested in the feeling of the room. Are people comfortable? Is there space for a difficult conversation if someone needs one? Is the food good enough that it doesn't get in the way of why we're all here? Queer spaces, at their best, do this. They prioritise the feeling of being together over the feeling of being seen."
          />

          <blockquote className={styles.quote}>
            <p>
              Hospitality is the art of making someone feel like they don't have
              to earn their place at the table. That's not a political position.
              It's just what I'm trying to do.
            </p>
            <cite>— {memberName("tomas")}</cite>
          </blockquote>

          <h2>
            On the network and <em>finding the community</em>
          </h2>
          <QA
            q="How did you find QueerPulse?"
            a="Sofia vouched for me. We met at a film screening in Alfama — she was working on a documentary about the neighbourhood and I was there as a guest of someone I barely knew. We ended up talking for three hours. She was the first person in a long time who asked me what I was working on and actually listened to the answer. She told me about QueerPulse a week later. I joined and immediately found four people I wanted to cook for."
          />
          <QA
            q="What has the network given you that you couldn't get elsewhere?"
            a="Access to people without the social overhead. In a regular networking context, I'd have to explain myself — what I do, why I left the job, why the supper club, whether it makes money. Here, I can just say I run a supper club in Mouraria and people understand what that means and why it matters. The shorthand exists. That's rare."
          />

          <p>
            Supper Club №12 is tonight. Tomás won't tell me the menu. "If I tell
            you, you'll be disappointed when I change it at the last minute," he
            says, and goes back to the vinegar and the jar and the cat on the
            napkins. I leave with the feeling that something good is about to
            happen in this apartment, and that the city is lucky to have it.
          </p>

          <div className={styles.authorCard}>
            <div className={styles.authorAv}>SA</div>
            <div>
              <div className={styles.authorName}>{memberName("sofia")}</div>
              <div className={styles.authorRole}>
                Documentary Filmmaker · Alfama
              </div>
              <div className={styles.authorBio}>
                Sofia makes documentaries about people who wouldn't think to be
                documented. She is currently in post-production on a 28-minute
                film about Lisbon's disappearing tascas.
              </div>
              <Link to={routes.members} className={styles.authorLink}>
                View her profile →
              </Link>
            </div>
          </div>

          <div className={styles.more}>
            <h2>
              More from <em>the community</em>
            </h2>
            <div className={styles.moreGrid}>
              <Link to={routes.story} className={styles.moreCard}>
                <div className={styles.moreImg} />
                <div className={styles.mcCat}>Field Notes</div>
                <div className={styles.mcTitle}>
                  How a Príncipe Real studio became a quiet home for queer
                  designers
                </div>
                <div className={styles.mcBy}>
                  {memberName("ines")} · 6 min read
                </div>
              </Link>
              <Link to={routes.storySafety} className={styles.moreCard}>
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
    </>
  );
}
