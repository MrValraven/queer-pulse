import { SubpageIndex } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { POLICY_VERSION } from "../../shared/api/consent.api";
import { LegalDoc, type LegalSection } from "./LegalDoc";
import s from "./LegalDoc.module.css";

const SECTIONS: LegalSection[] = [
  {
    id: "who-we-are",
    title: "1. Who we are",
    body: (
      <>
        <p>
          QueerPulse is a private community platform operated as an
          unincorporated community association based in Lisbon, Portugal. For
          the purposes of EU data protection law (GDPR), the data controller is
          Sofia Ferreira, reachable at privacy@queerpulse.pt.
        </p>
        <p>
          We are not a company. We are a community. That said, the same privacy
          obligations apply — and we take them seriously.
        </p>
      </>
    ),
  },
  {
    id: "what-we-collect",
    title: "2. What data we collect",
    body: (
      <>
        <h4>Account data</h4>
        <ul>
          <li>
            <strong>Email address</strong> — required to create an account.
            Never displayed publicly.
          </li>
          <li>
            <strong>Display name or chosen name</strong> — displayed on your
            profile. You do not need to use your legal name.
          </li>
          <li>
            <strong>Profile information</strong> — bio, location, skills,
            pronouns — anything you choose to add. All optional. All visible
            only to other members unless you set your profile to private.
          </li>
          <li>
            <strong>Profile photo</strong> — optional. Never shared outside the
            platform.
          </li>
        </ul>
        <h4>Activity data</h4>
        <ul>
          <li>
            <strong>Platform actions relevant to moderation</strong> — reports
            filed, moderation decisions, appeals. Retained for as long as
            necessary for safety purposes.
          </li>
          <li>
            <strong>Event RSVPs</strong> — which events you have signed up for,
            and which tier you selected. Not shared with other members except as
            an anonymised count.
          </li>
          <li>
            <strong>Forum and message content</strong> — messages you send and
            posts you make. Visible according to your privacy settings.
          </li>
        </ul>
        <h4>What we do not collect</h4>
        <div className={s.highlight}>
          <p>
            We do not collect: tracking data, advertising identifiers, precise
            location, device fingerprints, cross-site browsing history,
            biometric data, or any sensitive personal data beyond what you
            voluntarily share in your profile. We do not use analytics services
            that track individual users. Any anonymous, aggregate analytics or
            error reporting stays off until you choose to turn it on.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "3. How we use it",
    body: (
      <>
        <p>We use your data only to run the platform. Specifically:</p>
        <ul>
          <li>To create and maintain your account</li>
          <li>To enable you to connect with and message other members</li>
          <li>To send you emails you have subscribed to</li>
          <li>To process event RSVPs and send confirmations</li>
          <li>To investigate safety reports and enforce the Code of Care</li>
          <li>
            To send mandatory safety alerts if your account is affected by
            something urgent
          </li>
        </ul>
        <p>
          We do not use your data for advertising, profiling, or automated
          decision-making. No algorithm uses your data to decide what you see on
          the platform.
        </p>
      </>
    ),
  },
  {
    id: "who-sees",
    title: "4. Who can see your data",
    body: (
      <>
        <p>
          <strong>Other members</strong> can see the profile information you
          have chosen to make visible, based on your visibility settings. They
          can see your public forum posts and any events you have publicly
          RSVPed to.
        </p>
        <p>
          <strong>The moderation team</strong> can see reports filed about or by
          you, and activity logs relevant to any investigation. They are bound
          by a confidentiality agreement.
        </p>
        <p>
          <strong>The platform team</strong> (4 people) has access to account
          data for operational purposes — password resets, account recovery, and
          technical support.
        </p>
        <p>
          <strong>No one else.</strong> We do not share data with third parties,
          advertisers, or partner organisations. The partner organisations
          listed in our financial reports support specific funds but have no
          access to member data.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "5. How long we keep it",
    body: (
      <>
        <p>
          Account data is kept for as long as your account is active. If you
          delete your account, your data is permanently deleted within 30 days —
          including your profile, messages, forum posts, and event history.
        </p>
        <p>
          Moderation records (reports, decisions, appeals) are retained for
          three years after the relevant event, for safety and accountability
          purposes. These are not shared with third parties.
        </p>
        <p>
          Anonymised, aggregated statistics (such as the numbers published in
          our quarterly health reports) are not linked to individual accounts
          and are retained indefinitely as part of the platform's public record.
        </p>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "6. Your rights (GDPR)",
    body: (
      <>
        <p>
          As a person in the EU, you have the following rights regarding your
          personal data:
        </p>
        <ul>
          <li>
            <strong>Right to access</strong> — request a copy of all data we
            hold about you
          </li>
          <li>
            <strong>Right to rectification</strong> — correct inaccurate data
          </li>
          <li>
            <strong>Right to erasure</strong> — delete your account and all
            associated data
          </li>
          <li>
            <strong>Right to data portability</strong> — receive your data in a
            machine-readable format
          </li>
          <li>
            <strong>Right to object</strong> — object to any processing you
            believe is not justified
          </li>
          <li>
            <strong>Right to restrict processing</strong> — pause processing
            while a complaint is investigated
          </li>
        </ul>
        <p>
          To exercise any of these rights, email privacy@queerpulse.pt. We will
          respond within 30 days.
        </p>
        <p>
          If you believe we have mishandled your data, you have the right to
          complain to the Portuguese data protection authority, the CNPD
          (www.cnpd.pt).
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "7. Cookies",
    body: (
      <>
        <p>
          Signing in sets a first-party session cookie so we know it's you, plus
          a CSRF cookie that protects your requests from forgery. These are
          strictly necessary — the platform can't run without them — so they
          need no consent and can't be switched off. The session cookie contains
          only your session token and expires when you log out or after 30 days
          of inactivity.
        </p>
        <p>
          We store your language, theme, and a few interface preferences in your
          browser's localStorage. This lives on your device and never leaves it.
        </p>
        <p>
          Everything beyond the essentials — anonymous, aggregate usage
          analytics and automatic error reporting — is{" "}
          <strong>off until you opt in</strong>. The first time you visit, a
          small banner asks; <em>Reject</em> is exactly as easy as{" "}
          <em>Accept</em>, nothing loads unless you say yes, and the app works
          fully either way. You can change your mind any time from Settings →
          Data &amp; privacy → Cookie &amp; privacy choices. We never use
          advertising, profiling, or cross-site tracking cookies.
        </p>
      </>
    ),
  },
  {
    id: "third-parties",
    title: "8. Third-party services",
    body: (
      <>
        <p>
          We use a small number of third-party services to run the platform.
          Each is listed here with what data they receive and why:
        </p>
        <ul>
          <li>
            <strong>Postmark</strong> (email delivery) — receives your email
            address and the content of emails we send you. EU data processing
            agreement in place. Does not use your data for its own purposes.
          </li>
          <li>
            <strong>Hetzner</strong> (hosting) — our servers are hosted in
            Germany (EU). Hetzner does not have access to platform data.
          </li>
          <li>
            <strong>Backblaze B2</strong> (file storage) — stores profile images
            and uploaded files. EU-based storage. Does not access content.
          </li>
        </ul>
        <p>
          Two further services run <strong>only if you opt in</strong> to the
          matching category in the consent banner or your settings — until then
          they never load:
        </p>
        <ul>
          <li>
            <strong>Privacy-first analytics</strong> (optional) — anonymous,
            aggregate page metrics with no personal identifiers and no
            cross-site tracking. EU data processing agreement in place. Loads
            only with your analytics consent.
          </li>
          <li>
            <strong>Error monitoring</strong> (optional) — automatic crash
            diagnostics so we can fix bugs faster. Carries no advertising or
            profiling data; IP addresses are truncated. EU data processing
            agreement in place. Loads only with your error-reporting consent.
          </li>
        </ul>
        <p>
          We do not use Google Analytics, Meta Pixel, or any other advertising
          or cross-site tracking service. If our processors ever change, we will
          update this policy and announce it to the community before it happens.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "9. Changes to this policy",
    body: (
      <>
        <p>
          We will notify all members by email if we make a material change to
          this privacy policy. The notification will explain what changed and
          why. Changes take effect 14 days after notification, giving you time
          to delete your account if you disagree.
        </p>
        <p>
          Minor clarifications (correcting typos, adding examples) do not
          require notice but are reflected in the version number above.
        </p>
      </>
    ),
  },
  {
    id: "contact-privacy",
    title: "10. Contact",
    body: (
      <>
        <p>
          For any question about this policy or your data:{" "}
          <a href="mailto:privacy@queerpulse.pt">privacy@queerpulse.pt</a>. We
          aim to respond within 5 working days.
        </p>
      </>
    ),
  },
];

export function PrivacyPage() {
  return (
    <LegalDoc
      eyebrow="Legal"
      title={
        <>
          Privacy <em>Policy</em>
        </>
      }
      meta={[
        "Effective: 1 February 2023",
        "Last updated: 10 July 2026",
        `Version ${POLICY_VERSION}`,
      ]}
      plain={{
        title: "Plain language summary",
        text: "We collect the minimum data needed to run the platform. We do not sell it, share it with advertisers, or use it to build profiles for third parties. You can ask us to delete everything at any time. This policy explains all of it in full — but that's the version that matters.",
      }}
      toc={[
        { id: "who-we-are", label: "1. Who we are" },
        { id: "what-we-collect", label: "2. What data we collect" },
        { id: "how-we-use", label: "3. How we use it" },
        { id: "who-sees", label: "4. Who can see your data" },
        { id: "retention", label: "5. How long we keep it" },
        { id: "your-rights", label: "6. Your rights (GDPR)" },
        { id: "cookies", label: "7. Cookies" },
        { id: "third-parties", label: "8. Third-party services" },
        { id: "changes", label: "9. Changes to this policy" },
        { id: "contact-privacy", label: "10. Contact" },
      ]}
      sections={SECTIONS}
      contact={{
        text: (
          <>
            <strong>Questions about this policy?</strong> Write to
            privacy@queerpulse.pt. We read everything and will reply within 5
            working days. No chatbots, no templated responses.
          </>
        ),
        email: "privacy@queerpulse.pt",
      }}
      related={
        <SubpageIndex
          title="Exercise your rights"
          items={[
            {
              label: "Data request",
              to: routes.dsar,
              blurb: "Ask for a copy of your data, or ask us to delete it.",
            },
          ]}
        />
      }
    />
  );
}
