import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { PageHero, PageShell } from "../../shared/components/layout";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import s from "./HelpPage.module.css";

interface QA {
  q: string;
  a: ReactNode;
}
interface Category {
  id: string;
  label: string;
  headPre: string;
  headEm: string;
  qa: QA[];
}

const CATEGORIES: Category[] = [
  {
    id: "getting-started",
    label: "Getting started",
    headPre: "Getting ",
    headEm: "started",
    qa: [
      {
        q: "How do I get an invitation to QueerPulse?",
        a: (
          <>
            QueerPulse is invite-only. You need to be invited by an existing
            member, or apply to the waitlist via the homepage. A member may then
            vouch for you — <strong>Level 3+ members</strong> can submit
            vouches, reviewed by our moderation team before an invite is sent.
          </>
        ),
      },
      {
        q: "What happens after I accept my invite?",
        a: "You'll create your account, complete a short onboarding (around 5 minutes), and be introduced to a few members you might want to connect with. You'll set identity and interest preferences — these are private and shape what you see.",
      },
      {
        q: "Is QueerPulse only for people in Lisbon?",
        a: "No — members join from across Portugal and internationally. In-person gatherings are primarily Lisbon-based for now, but this will expand as the community grows in other cities.",
      },
      {
        q: "Is QueerPulse free?",
        a: (
          <>
            Yes — joining and using the platform is entirely free, and always
            will be.{" "}
            <Link to={routes.cinemaMembership}>Supporting members</Link>{" "}
            contribute voluntarily (from €5/month), but this is never required
            and doesn't affect your access.
          </>
        ),
      },
    ],
  },
  {
    id: "account",
    label: "Your account",
    headPre: "Your ",
    headEm: "account",
    qa: [
      {
        q: "How do I change my display name or pronouns?",
        a: (
          <>
            Go to your profile and click "Edit profile" (or the{" "}
            <Link to={routes.settings}>Settings</Link> page). Your display name
            can differ from your legal name. Pronoun changes take effect
            immediately across the platform.
          </>
        ),
      },
      {
        q: "Can I make my profile private?",
        a: (
          <>
            Yes. In <Link to={routes.settings}>Settings → Visibility</Link>, set
            it to <strong>Open</strong>, <strong>Network only</strong>, or{" "}
            <strong>Private</strong>. Private profiles are hidden from the
            directory and search, but you can still browse and join gatherings.
          </>
        ),
      },
      {
        q: "How do I delete my account?",
        a: (
          <>
            Go to{" "}
            <Link to={routes.settings}>Settings → Data &amp; privacy</Link> and
            find "Delete account". We show what gets removed and offer gentler
            alternatives (deactivating). If you still want to delete, your data
            is removed within 30 days.
          </>
        ),
      },
      {
        q: "What does my level mean and how do I level up?",
        a: "Your level reflects your participation — attending gatherings, making connections, contributing, and supporting the platform. Each level unlocks new perks.",
      },
    ],
  },
  {
    id: "gatherings",
    label: "Gatherings",
    headPre: "",
    headEm: "Gatherings",
    qa: [
      {
        q: "How do I RSVP to a gathering?",
        a: (
          <>
            Find a gathering in the <Link to={routes.calendar}>Gatherings</Link>{" "}
            section and click RSVP. If open, you'll get a confirmation with a QR
            code for the door. Level 4+ members get{" "}
            <strong>48-hour early access</strong>.
          </>
        ),
      },
      {
        q: "Can I host a gathering?",
        a: (
          <>
            Yes — members at Level 3+ can apply to{" "}
            <Link to={routes.host}>host</Link>. Your idea is reviewed by the
            team (usually within 3 days). Once approved, you get host tools —
            attendee list, messaging, check-in.
          </>
        ),
      },
      {
        q: "What if I can't make it after RSVPing?",
        a: "You can cancel your RSVP from the event page or ticket. Please do this early — it releases your spot to someone on the waitlist. Hosts are notified so they can manage capacity.",
      },
      {
        q: "How does the waitlist work?",
        a: "If a gathering is full, you can join the waitlist. You'll be notified as soon as a spot opens — usually because someone cancelled. Spots are released in order.",
      },
    ],
  },
  {
    id: "safety",
    label: "Safety & moderation",
    headPre: "Safety &amp; ",
    headEm: "moderation",
    qa: [
      {
        q: "How do I report a member?",
        a: 'Go to the member\'s profile and find "Report". Select a category and describe what happened. All reports go to our moderation queue and are reviewed by a human — not an algorithm.',
      },
      {
        q: "What happens after I file a report?",
        a: (
          <>
            A moderator reviews it — for high-severity reports, usually within
            24 hours. You'll be notified of the outcome. The reported member is
            never told who filed. You can also <strong>block or mute</strong>{" "}
            someone privately.
          </>
        ),
      },
      {
        q: "Can I appeal a moderation decision?",
        a: (
          <>
            Yes. Appeals are reviewed by a different moderator than the one who
            made the original decision, and ultimately by the{" "}
            <Link to={routes.governance}>advisory council</Link>. We aim to
            respond within 5 business days.
          </>
        ),
      },
      {
        q: "How do I block or mute someone?",
        a: (
          <>
            <strong>Muting</strong> hides someone's activity from your feed —
            they're never told. <strong>Blocking</strong> prevents them from
            viewing your profile or messaging you. Both are private actions.
          </>
        ),
      },
    ],
  },
  {
    id: "membership",
    label: "Membership",
    headPre: "",
    headEm: "Membership",
    qa: [
      {
        q: "How do I become a supporting member?",
        a: (
          <>
            Visit the{" "}
            <Link to={routes.cinemaMembership}>supporting membership page</Link>
            . Tiers start at €5/month, handled via Stripe. Your badge appears on
            your profile immediately.
          </>
        ),
      },
      {
        q: "How do invites work?",
        a: "All members get 1 invite per month. Level 5+ members get 2. Invites expire after 7 days if not accepted. The quota resets on the 1st of each month.",
      },
      {
        q: "What is vouching and how does it work?",
        a: (
          <>
            Vouching is how members advocate for people on the waitlist. Level
            3+ members can vouch once per month with a short statement, reviewed
            by moderation before an invite is sent.
          </>
        ),
      },
      {
        q: "What are perks and how do I redeem them?",
        a: "Perks are benefits unlocked as you level up — early RSVP access, an increased invite quota, and more. Some activate automatically; others you claim on the Perks page.",
      },
    ],
  },
  {
    id: "technical",
    label: "Technical",
    headPre: "",
    headEm: "Technical",
    qa: [
      {
        q: "How do I manage my email notifications?",
        a: (
          <>
            Go to <Link to={routes.settings}>Settings → Notifications</Link>.
            You can toggle each type individually and set how often we batch
            them (immediately, daily, or weekly), plus quiet hours.
          </>
        ),
      },
      {
        q: "Which browsers and devices are supported?",
        a: "QueerPulse works on any modern browser — Chrome, Firefox, Safari, Edge — on desktop and mobile. There is no app to install; the site is fully responsive.",
      },
      {
        q: "Something looks broken. What do I do?",
        a: (
          <>
            Try a hard refresh first. If it persists, write to us via{" "}
            <Link to={routes.contact}>Contact</Link> with your browser and what
            you were doing — crash reports help us fix things faster.
          </>
        ),
      },
    ],
  },
];

export function HelpPage() {
  const [tab, setTab] = useState(CATEGORIES[0]!.id);
  const [open, setOpen] = useState<string | null>(`${CATEGORIES[0]!.id}-0`);
  const category = CATEGORIES.find((c) => c.id === tab)!;

  return (
    <PageShell>
      <PageHero
        plum={false}
        eyebrow="Help Centre"
        title={
          <>
            How can we <em>help?</em>
          </>
        }
        sub="Answers to the questions members ask most. Can't find what you need? Write to us — a real person reads every message."
      >
        <div className={s.tabs}>
          {CATEGORIES.map((c) => (
            <button
              type="button"
              key={c.id}
              className={[s.tab, tab === c.id && s.tabOn]
                .filter(Boolean)
                .join(" ")}
              onClick={() => {
                setTab(c.id);
                setOpen(`${c.id}-0`);
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </PageHero>

      <div className="wrap">
        <div className={s.body}>
          <h2 className={s.hsHead}>
            {category.headPre.replace("&amp;", "&")}
            <em>{category.headEm}</em>
          </h2>
          <div className={s.accordion}>
            {category.qa.map((item, i) => {
              const key = `${category.id}-${i}`;
              const isOpen = open === key;
              return (
                <div key={key} className={s.accItem}>
                  <button
                    type="button"
                    className={s.accQ}
                    onClick={() => setOpen(isOpen ? null : key)}
                  >
                    {item.q}
                    <span
                      className={[s.chevron, isOpen && s.chevronOpen]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      ›
                    </span>
                  </button>
                  {isOpen && <div className={s.accA}>{item.a}</div>}
                </div>
              );
            })}
          </div>

          <div className={s.helpContact}>
            <div>
              <h3>Still stuck?</h3>
              <p>
                We answer every message ourselves, usually within a day or two.
              </p>
            </div>
            <Button to={routes.contact}>Contact us →</Button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
