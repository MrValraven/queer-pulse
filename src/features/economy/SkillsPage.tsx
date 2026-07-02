import { useMemo, useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { FiHeart } from "react-icons/fi";
import {
  Avatar,
  Button,
  EmptyState,
  FadeIn,
  Outro,
  SkeletonAvatar,
  SkeletonLine,
  Tag,
  TagRow,
} from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { routes } from "../../app/routeMap";
import { useConnect } from "../../app/providers/ConnectProvider";
import { memberProfiles } from "../members/data/memberProfiles";
import styles from "./SkillsPage.module.css";

interface Skill {
  type: "offering" | "looking";
  member: string;
  skill: string;
  desc: string;
  tags: string[];
  cat: string;
}

const SKILLS: Skill[] = [
  {
    type: "offering",
    member: "ines",
    skill: "Visual identity & branding",
    desc: "How to build a brand identity that lasts — from strategy to type to colour. One-to-one, monthly, in the studio.",
    tags: ["Branding", "Typography", "Strategy"],
    cat: "design",
  },
  {
    type: "offering",
    member: "ines",
    skill: "Portfolio review — designers",
    desc: "Works in progress, honest feedback. Junior and mid-level designers welcome. One Friday a month in Príncipe Real.",
    tags: ["Portfolio", "Feedback", "Editorial"],
    cat: "design",
  },
  {
    type: "offering",
    member: "rui",
    skill: "Backend engineering mentoring",
    desc: "One hour a month, no structure. Career, architecture, surviving a bad sprint. Backend-focused but open.",
    tags: ["Rust", "Backend", "Career"],
    cat: "tech",
  },
  {
    type: "offering",
    member: "beatriz",
    skill: "Wheel-throwing basics",
    desc: "Monthly workshop in the Graça studio. Beginners welcome. You'll make something, you'll get it wrong, you'll learn.",
    tags: ["Ceramics", "Making", "Hands-on"],
    cat: "craft",
  },
  {
    type: "offering",
    member: "andre",
    skill: "Film photography — getting started",
    desc: "Practical session: choosing a camera, loading film, developing your first roll. In the darkroom in Cais do Sodré.",
    tags: ["Analog", "Darkroom", "Photography"],
    cat: "creative",
  },
  {
    type: "offering",
    member: "diogo",
    skill: "Music production — starting out",
    desc: "Introduction to production: what DAW, what workflow, how to finish a track. For complete beginners.",
    tags: ["Ableton", "Production", "Electronic"],
    cat: "creative",
  },
  {
    type: "looking",
    member: "carla",
    skill: "Fundraising for community projects",
    desc: "Looking to understand how to secure funding for a community-focused initiative — grants, community shares, sponsorship.",
    tags: ["Fundraising", "Community", "Finance"],
    cat: "business",
  },
  {
    type: "looking",
    member: "sofia",
    skill: "Music composition for film",
    desc: "Specifically: how to brief a composer, how to communicate emotional intent, how to work with music you didn't make.",
    tags: ["Film", "Composition", "Collaboration"],
    cat: "creative",
  },
  {
    type: "looking",
    member: "tomas",
    skill: "Food cost & menu pricing",
    desc: "I cook well but I price badly. Looking for someone with hospitality business experience to help me work it out.",
    tags: ["Hospitality", "Finance", "Pricing"],
    cat: "business",
  },
];

const FILTERS = [
  { value: "all", label: "All skills" },
  { value: "design", label: "Design" },
  { value: "tech", label: "Tech" },
  { value: "business", label: "Business" },
  { value: "craft", label: "Craft" },
  { value: "care", label: "Care" },
  { value: "creative", label: "Creative" },
];

function SkillCard({ skill }: { skill: Skill }) {
  const member = memberProfiles[skill.member]!;
  const { openConnect } = useConnect();
  return (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        <Avatar initials={member.initials} tint={member.tint} size={40} />
        <span className={[styles.skType, styles[skill.type]].join(" ")}>
          {skill.type === "offering" ? "Teaching" : "Learning"}
        </span>
      </div>
      <div>
        <div className={styles.skill}>{skill.skill}</div>
        <div className={styles.name}>
          {member.first} {member.last}
        </div>
      </div>
      <div className={styles.desc}>{skill.desc}</div>
      <TagRow>
        {skill.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </TagRow>
      <div className={styles.foot}>
        <span className={styles.hood}>{member.hood}</span>
        <span
          role="button"
          tabIndex={0}
          className={styles.reach}
          onClick={() => openConnect(skill.member)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openConnect(skill.member);
            }
          }}
        >
          Reach out →
        </span>
      </div>
    </div>
  );
}

function SkillSkeleton() {
  return (
    <div className={styles.card} aria-hidden>
      <div className={styles.cardTop}>
        <SkeletonAvatar size={40} />
        <SkeletonLine width={72} height={22} style={{ borderRadius: 6 }} />
      </div>
      <div>
        <SkeletonLine width="80%" height={20} />
        <SkeletonLine width="45%" height={13} style={{ marginTop: 6 }} />
      </div>
      <div>
        <SkeletonLine width="100%" height={13} />
        <SkeletonLine width="90%" height={13} style={{ marginTop: 6 }} />
      </div>
      <div className={styles.tags}>
        <SkeletonLine width={64} height={22} style={{ borderRadius: 6 }} />
        <SkeletonLine width={78} height={22} style={{ borderRadius: 6 }} />
      </div>
      <div className={styles.foot}>
        <SkeletonLine width={80} height={13} />
        <SkeletonLine width={80} height={13} />
      </div>
    </div>
  );
}

export function SkillsPage() {
  const loading = useSimulatedLoad();
  const [active, setActive] = useState("all");
  const filtered = useMemo(
    () => (active === "all" ? SKILLS : SKILLS.filter((s) => s.cat === active)),
    [active],
  );
  const offering = filtered.filter((s) => s.type === "offering");
  const looking = filtered.filter((s) => s.type === "looking");

  return (
    <PageShell>
      <header className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>Skills &amp; learning</div>
          <h1>
            Learn from your <em>community.</em>
          </h1>
          <p>
            No course fees, no algorithms, no performative expertise. Just
            members who are good at things and willing to share what they know —
            and members who want to get better.
          </p>
        </div>
      </header>

      <div className={styles.filterBar}>
        <div className="wrap">
          <div className={styles.filterInner}>
            <span className={styles.filterLabel}>Browse by:</span>
            {FILTERS.map((f) => (
              <button
                type="button"
                key={f.value}
                className={[styles.pill, active === f.value && styles.pillOn]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setActive(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className="wrap">
          <p className={styles.intro}>
            Everything here is offered and requested by members. If you want to
            learn something, post an Ask on the board. If you want to teach
            something, post an Offer.
          </p>

          {loading ? (
            <div className={styles.section}>
              <div className={styles.cards}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkillSkeleton key={i} />
                ))}
              </div>
            </div>
          ) : (
            <>
              {(active === "all" || offering.length > 0) && (
                <div className={styles.section}>
                  <div className={styles.sectionHead}>
                    <span
                      className={styles.sshDot}
                      style={{ background: "var(--jade)" }}
                    />
                    <h2>
                      Members <em>offering</em> to teach
                    </h2>
                  </div>
                  <div className={styles.cards}>
                    {offering.length > 0 ? (
                      offering.map((skill, i) => (
                        <FadeIn
                          key={skill.skill + i}
                          delay={Math.min(i, 8) * 60}
                        >
                          <SkillCard skill={skill} />
                        </FadeIn>
                      ))
                    ) : (
                      <EmptyState
                        compact
                        icon={<FiHeart />}
                        title="Nothing matches your filter"
                        description="No one's offered to teach in this category yet. Clear the filter to see everything members are sharing."
                        action={{
                          label: "Clear filters",
                          onClick: () => setActive("all"),
                        }}
                      />
                    )}
                  </div>
                </div>
              )}

              {(active === "all" || looking.length > 0) && (
                <div className={styles.section}>
                  <div className={styles.sectionHead}>
                    <span
                      className={styles.sshDot}
                      style={{ background: "var(--accent)" }}
                    />
                    <h2>
                      Members <em>wanting</em> to learn
                    </h2>
                  </div>
                  <div className={styles.cards}>
                    {looking.length > 0 ? (
                      looking.map((skill, i) => (
                        <FadeIn
                          key={skill.skill + i}
                          delay={Math.min(i, 8) * 60}
                        >
                          <SkillCard skill={skill} />
                        </FadeIn>
                      ))
                    ) : (
                      <EmptyState
                        compact
                        icon={<FiHeart />}
                        title="Nothing matches your filter"
                        description="No one's asked to learn in this category yet. Clear the filter to see what the rest of the community is hoping to pick up."
                        action={{
                          label: "Clear filters",
                          onClick: () => setActive("all"),
                        }}
                      />
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          <div className={styles.offerStrip}>
            <div>
              <h3>
                Have something <em>to teach?</em>
              </h3>
              <p>
                Post a skill offer on the board — what you can teach, how, and
                who it's for. The community will find you.
              </p>
            </div>
            <Button href="/#board" size="lg">
              Post on the board
            </Button>
          </div>
        </div>
      </div>

      <Outro
        title={
          <>
            The best way to get better is to{" "}
            <em>know someone further along.</em>
          </>
        }
        sub="Join the network and find the people who can help you grow — and the people you can help in return."
      >
        <Button to={routes.requestInvite} variant="primary" size="lg">
          Request an invite
        </Button>
      </Outro>
    </PageShell>
  );
}
