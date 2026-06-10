import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { linkToPath } from "../../app/routeMap";
import { communities } from "../homepage/data/communities";
import { JoinModal } from "./JoinModal";
import {
  getCommunityDetail,
  membersFor,
  type Person,
  type Thread as ThreadData,
  type Tint,
} from "./communityDetails";
import styles from "./CommunityDetailPage.module.css";

const GATHERING = linkToPath("QueerPulse Gathering.html");
const MEMBER = linkToPath("QueerPulse Profile.html");

const AV_CLASS: Record<Tint, string> = { coral: styles.tCoral, jade: styles.tJade, plum: styles.tPlum };
const HERO_AV: Record<Tint, { background: string; color: string }> = {
  coral: { background: "rgba(232,119,90,.22)", color: "#F4A08A" },
  jade: { background: "rgba(74,140,111,.22)", color: "#7DC4A0" },
  plum: { background: "rgba(247,243,238,.18)", color: "rgba(247,243,238,.8)" },
};

type Tab = "about" | "members" | "forum";

function Thread({ data }: { data: ThreadData }) {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [voted, setVoted] = useState(false);
  const [reply, setReply] = useState("");
  const [extra, setExtra] = useState<{ name: string; text: string }[]>([]);

  const post = () => {
    if (!reply.trim()) return;
    setExtra((e) => [...e, { name: "You", text: reply.trim() }]);
    setReply("");
    showToast("Reply posted.", "success");
  };

  return (
    <div className={styles.thread}>
      <div className={styles.thHead} onClick={() => setOpen((o) => !o)}>
        <div className={styles.thVote}>
          <button
            type="button"
            className={[styles.vbtn, voted && styles.vbtnVoted].filter(Boolean).join(" ")}
            onClick={(e) => {
              e.stopPropagation();
              setVoted((v) => !v);
            }}
          >
            ▲
          </button>
          <span className={styles.vnum}>{data.votes + (voted ? 1 : 0)}</span>
        </div>
        <div className={styles.thMain}>
          <div className={styles.thTitle}>{data.title}</div>
          <div className={styles.thMeta}>
            <div className={[styles.thAv, AV_CLASS[data.author.tint]].join(" ")}>{data.author.initials}</div>
            <span className={styles.thName}>{data.author.name}</span>
            <span>{data.time}</span>
            <span className={styles.thReplies}>💬 {data.replyCount} replies</span>
          </div>
        </div>
      </div>
      {open && (
        <div className={styles.thBody}>
          <p className={styles.postText}>{data.post}</p>
          {data.replies.map((r, i) => (
            <div className={styles.reply} key={i}>
              <div className={[styles.rAv, AV_CLASS[r.tint]].join(" ")}>{r.initials}</div>
              <div>
                <div className={styles.rName}>{r.name}</div>
                <div className={styles.rText}>{r.text}</div>
              </div>
            </div>
          ))}
          {extra.map((r, i) => (
            <div className={styles.reply} key={`x${i}`}>
              <div className={[styles.rAv, styles.tPlum].join(" ")}>Me</div>
              <div>
                <div className={styles.rName}>{r.name}</div>
                <div className={styles.rText}>{r.text}</div>
              </div>
            </div>
          ))}
          <div className={styles.replyBar}>
            <div className={[styles.rAv, styles.tPlum].join(" ")}>Me</div>
            <textarea
              className={styles.replyTa}
              rows={1}
              placeholder="Reply to this thread…"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
            />
            <Button variant="primary" onClick={post} style={{ padding: "9px 16px", fontSize: 13 }}>
              Reply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function CommunityDetailPage() {
  const { slug } = useParams();
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>("about");
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [newPost, setNewPost] = useState("");

  const community = communities.find((c) => c.slug === slug);
  const detail = getCommunityDetail(slug);
  if (!community || !detail) return <Navigate to="/communities" replace />;

  const memberNum = parseInt(community.count, 10);
  const hasCount = !Number.isNaN(memberNum);
  const seed = slug!.length;
  const members = membersFor(seed, 8);
  const heroAvatars = members.slice(0, 5);

  const welcome: ThreadData = {
    votes: 38,
    title: `Welcome, new members — introduce yourself 👋`,
    author: detail.organiser,
    time: "2 weeks ago",
    replyCount: 18,
    post: `New to ${community.name}? Say hello here. Tell us your name, where you're from, and what brought you here. We read every one.`,
    replies: [
      { initials: members[6].initials, name: members[6].name, tint: members[6].tint, text: "Hello! Just moved to Lisbon and this is the first thing I've joined. Already feels like the right call." },
      { initials: members[4].initials, name: members[4].name, tint: members[4].tint, text: "Welcome! Come to the next one — easiest way in is just to show up." },
    ],
  };
  const threads = [detail.topicThread, welcome];

  const related = communities.filter((c) => c.slug !== slug && !c.privateBadge).slice(0, 3);
  const relTint = (t: string): Tint => (t === "sports" || t === "social" || t === "support" ? "jade" : t === "arts" || t === "professional" ? "coral" : "plum");

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className={`wrap ${styles.heroInner}`}>
          <Link to="/communities" className={styles.breadcrumb}>
            ← Communities
          </Link>
          <div className={styles.typeBadge}>
            <span className={styles.dot} />
            {detail.badge}
          </div>
          <h1 className={styles.h1}>{community.name}</h1>
          <p className={styles.heroSub}>{community.description}</p>
          <div className={styles.heroMeta}>
            <span>{community.count}</span>
            <span className={styles.metaSep} />
            <span>{detail.founded}</span>
            <span className={styles.metaSep} />
            <span>{detail.cadence}</span>
          </div>
          <div className={styles.actRow}>
            <Button
              variant={joined ? "jade" : "primary"}
              onClick={() => (joined ? setJoined(false) : setJoining(true))}
            >
              {joined ? "✓ Joined" : community.privateBadge ? "Request access" : "Join community"}
            </Button>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div className={styles.avStrip}>
                {heroAvatars.map((m, i) => (
                  <div key={i} className={styles.sav} style={HERO_AV[m.tint]}>
                    {m.initials}
                  </div>
                ))}
              </div>
              {hasCount && <span className={styles.stripNote}>and {memberNum - 5} more</span>}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.layout}>
            <div>
              <div className={styles.tabs}>
                <button type="button" className={[styles.tab, tab === "about" && styles.tabActive].filter(Boolean).join(" ")} onClick={() => setTab("about")}>
                  About
                </button>
                <button type="button" className={[styles.tab, tab === "members" && styles.tabActive].filter(Boolean).join(" ")} onClick={() => setTab("members")}>
                  Members {hasCount && <span className={styles.tabCount}>{memberNum}</span>}
                </button>
                <button type="button" className={[styles.tab, tab === "forum" && styles.tabActive].filter(Boolean).join(" ")} onClick={() => setTab("forum")}>
                  Forum <span className={styles.tabCount}>{threads.length}</span>
                </button>
              </div>

              {tab === "about" && (
                <div>
                  {detail.about.map((p, i) => (
                    <p className={styles.aboutP} key={i}>
                      {p}
                    </p>
                  ))}

                  <div className={styles.secLbl}>Who this is for</div>
                  {detail.whoFor.map((w) => (
                    <div className={styles.bullet} key={w}>
                      <div className={styles.bulletDot} />
                      <span>{w}</span>
                    </div>
                  ))}

                  <div className={styles.secLbl}>Upcoming gathering</div>
                  <Link to={GATHERING} className={styles.gCard}>
                    <div className={styles.gDate}>
                      <div className={styles.gDd}>{detail.nextEvent.dd}</div>
                      <div className={styles.gDm}>{detail.nextEvent.mm}</div>
                    </div>
                    <div>
                      <div className={styles.gTitle}>{detail.nextEvent.title}</div>
                      <div className={styles.gMeta}>
                        {detail.nextEvent.meta} · {detail.nextEvent.spots}
                      </div>
                    </div>
                  </Link>

                  <div className={styles.tagRow}>
                    {detail.tags.map((t) => (
                      <span className={styles.tag} key={t}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {tab === "members" && (
                <div>
                  <div className={styles.memberGrid}>
                    {members.map((m: Person, i) => (
                      <Link to={MEMBER} className={styles.mCard} key={i}>
                        <div className={[styles.mAv, AV_CLASS[m.tint]].join(" ")}>{m.initials}</div>
                        <div className={styles.mName}>{m.name}</div>
                        <div className={styles.mRole}>{m.role}</div>
                      </Link>
                    ))}
                  </div>
                  <p className={styles.showing}>
                    {hasCount ? `Showing 8 of ${memberNum} members` : "Showing the core members"}
                  </p>
                </div>
              )}

              {tab === "forum" && (
                <div>
                  {threads.map((t, i) => (
                    <Thread data={t} key={i} />
                  ))}
                  <div className={styles.newPost}>
                    <div className={[styles.rAv, styles.tPlum].join(" ")} style={{ width: 30, height: 30 }}>
                      Me
                    </div>
                    <textarea
                      className={styles.npTa}
                      rows={1}
                      placeholder="Start a new discussion in this community…"
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                    />
                    <Button
                      variant="ghost"
                      onClick={() => {
                        if (!newPost.trim()) return;
                        showToast("Post added to the community forum.", "success");
                        setNewPost("");
                      }}
                      style={{ whiteSpace: "nowrap", fontSize: 13 }}
                    >
                      Post
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <aside className={styles.sidebar}>
              <div className={styles.sbC}>
                <div className={styles.sbLbl}>Organiser</div>
                <div className={[styles.sbOrgAv, AV_CLASS[detail.organiser.tint]].join(" ")}>
                  {detail.organiser.initials}
                </div>
                <div className={styles.sbOrgName}>{detail.organiser.name}</div>
                <div className={styles.sbBadge}>{detail.organiser.role}</div>
                <p className={styles.sbOrgBio}>{detail.organiser.bio}</p>
                <Button variant="ghost" className={styles.sbFull} onClick={() => showToast(`Message sent to ${detail.organiser.name.split(" ")[0]}.`, "success")}>
                  Send a message
                </Button>
              </div>

              <div className={styles.sbC}>
                <div className={styles.sbLbl}>Next gathering</div>
                <div className={styles.sbEvDate}>
                  <div className={styles.sbEDd}>{detail.nextEvent.dd}</div>
                  <div className={styles.sbEDm}>{detail.nextEvent.mm}</div>
                </div>
                <div className={styles.sbETitle}>{detail.nextEvent.title}</div>
                <div className={styles.sbEMeta}>{detail.nextEvent.meta}</div>
                <div className={styles.sbESpots}>
                  <span className={styles.sbESdot} />
                  {detail.nextEvent.spots}
                </div>
                <Button variant="primary" to={GATHERING} className={styles.sbFull} style={{ marginTop: 14 }}>
                  RSVP →
                </Button>
              </div>

              <div className={styles.sbC}>
                <div className={styles.sbLbl}>Related communities</div>
                {related.map((c) => (
                  <Link key={c.slug} to={`/community/${c.slug}`} className={styles.sbRelItem}>
                    <div className={[styles.sbRelIc, AV_CLASS[relTint(c.type)]].join(" ")}>
                      {c.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <div className={styles.sbRelName}>{c.name}</div>
                      <div className={styles.sbRelCt}>{c.count}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </div>

      {joining && (
        <JoinModal
          community={{
            name: community.name,
            typeLabel: detail.badge,
            count: community.count,
            description: community.description,
            tags: detail.tags,
          }}
          onClose={() => setJoining(false)}
          onJoined={() => setJoined(true)}
        />
      )}
    </PageShell>
  );
}
