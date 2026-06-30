import { LegalDoc, type LegalSection } from "./LegalDoc";
import s from "./LegalDoc.module.css";

const SECTIONS: LegalSection[] = [
  {
    id: "eligibility",
    title: "1. Who can join",
    body: (
      <>
        <p>
          QueerPulse is open to people who identify as queer, or who are
          questioning their identity and feel the community is a place they
          belong. There is no formal verification process. We rely on the invite
          system and community trust.
        </p>
        <p>
          <strong>You must be 18 or older</strong> to create an account. If we
          discover an account belongs to someone under 18, we will close it
          immediately.
        </p>
        <p>
          Membership is invite-only. Creating an account with false information,
          or sharing your invite link without authorisation, is a violation of
          these terms and grounds for immediate removal.
        </p>
      </>
    ),
  },
  {
    id: "account",
    title: "2. Your account",
    body: (
      <>
        <p>
          You are responsible for keeping your account credentials secure. Do
          not share your login details with anyone. If you believe your account
          has been accessed by someone else, contact us immediately at
          safety@queerpulse.pt.
        </p>
        <p>
          You may have only one account. Operating multiple accounts to
          circumvent a moderation decision is grounds for permanent removal.
        </p>
        <p>
          You can delete your account at any time from Settings. Deletion is
          permanent and irreversible. Your data will be deleted within 30 days
          as described in our Privacy Policy.
        </p>
      </>
    ),
  },
  {
    id: "conduct",
    title: "3. How you must behave",
    body: (
      <>
        <p>
          The Code of Care is part of these terms. By creating an account, you
          agree to it in full. The short version:
        </p>
        <ul>
          <li>Treat members with respect, warmth, and honesty</li>
          <li>Do not harass, intimidate, or discriminate against anyone</li>
          <li>
            Do not share private information about other members without their
            consent
          </li>
          <li>
            Do not use the platform for commercial solicitation, spam, or
            unsolicited promotion
          </li>
          <li>
            Do not impersonate another person or mislead others about who you
            are
          </li>
          <li>
            Do not attempt to access, interfere with, or disrupt the platform's
            technical systems
          </li>
        </ul>
        <div className={s.highlight}>
          <p>
            QueerPulse is a queer space. Queerphobic, transphobic, racist,
            ableist, or otherwise discriminatory behaviour — including
            microaggressions and "just asking questions" framing — is not
            permitted and will result in immediate removal.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "content",
    title: "4. Content you create",
    body: (
      <>
        <p>
          <strong>You own your content.</strong> Messages you send, forum posts
          you write, and profile information you add remain yours. We do not
          claim any ownership or licence over your content beyond what is
          necessary to display it on the platform.
        </p>
        <p>
          By posting content on QueerPulse, you grant us a limited,
          non-exclusive licence to display and store that content for the
          purposes of running the platform. This licence ends when you delete
          the content or close your account.
        </p>
        <p>
          You are responsible for ensuring that content you post does not
          violate any law or the rights of any third party. Do not post content
          that is defamatory, fraudulent, or that infringes copyright.
        </p>
        <h4>Magazine contributions</h4>
        <p>
          If you contribute to QueerPulse Magazine, a separate contributor
          agreement governs the publication. Magazine contributions are
          compensated. Contact magazine@queerpulse.pt for details.
        </p>
      </>
    ),
  },
  {
    id: "events",
    title: "5. Events and gatherings",
    body: (
      <>
        <p>
          Events listed on QueerPulse are organised by community members.
          QueerPulse facilitates listings but is not the organiser of
          member-hosted events and is not liable for what happens at them.
        </p>
        <p>
          If you host an event, you are responsible for: complying with the Code
          of Care, providing accurate information about the event, honouring the
          sliding scale pricing commitment, and being accessible to attendees
          who have notified you of access needs.
        </p>
        <p>
          Ticket revenue from member-hosted events goes entirely to the host.
          QueerPulse takes no commission. For platform-organised events, revenue
          is recorded in the quarterly financial report.
        </p>
        <p>
          If something goes wrong at an event, use the report system or contact
          safety@queerpulse.pt.
        </p>
      </>
    ),
  },
  {
    id: "termination",
    title: "6. Account suspension and termination",
    body: (
      <>
        <p>
          We can suspend or remove your account if you violate the Code of Care
          or these terms. The process is described on the Governance page. In
          summary:
        </p>
        <ul>
          <li>
            Minor violations: warning, with a description of what happened
          </li>
          <li>
            Repeated or serious violations: temporary suspension or permanent
            removal
          </li>
          <li>
            Urgent safety situations: immediate temporary suspension pending
            review
          </li>
        </ul>
        <p>
          You will always be told the outcome of any decision, even if not the
          identity of the person who reported. You have the right to appeal
          within 14 days to the advisory council.
        </p>
        <p>
          If you believe your account has been removed unfairly, email
          safety@queerpulse.pt. We are a small team and we make mistakes. If we
          made one, we will acknowledge it and reverse the decision.
        </p>
      </>
    ),
  },
  {
    id: "liability",
    title: "7. Our liability",
    body: (
      <>
        <p>
          QueerPulse is provided as-is by a small volunteer and part-time team.
          We do our best to keep it running reliably and safely, but we cannot
          guarantee uninterrupted service.
        </p>
        <p>
          To the extent permitted by Portuguese and EU law, QueerPulse is not
          liable for: indirect damages arising from use or inability to use the
          platform; content posted by other members; events organised by
          community members; or any loss of data resulting from technical
          failure.
        </p>
        <p>
          Nothing in these terms excludes liability for death or personal injury
          caused by negligence, fraud, or any other liability that cannot be
          excluded under applicable law.
        </p>
        <div className={s.highlight}>
          <p>
            We are a community, not a corporation. We are not hiding behind
            legal language. If we cause you harm through our negligence, we take
            responsibility. If something goes wrong, talk to us first.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "changes-terms",
    title: "8. Changes to these terms",
    body: (
      <>
        <p>
          We will notify all members by email of material changes to these terms
          at least 14 days before they take effect. If you disagree with a
          change, you may close your account. Continuing to use the platform
          after the effective date constitutes acceptance.
        </p>
        <p>
          Minor clarifications that do not affect your rights will be made
          without notice, reflected in the version number above.
        </p>
      </>
    ),
  },
  {
    id: "law",
    title: "9. Governing law",
    body: (
      <>
        <p>
          These terms are governed by Portuguese law. Disputes will be resolved
          by the courts of Lisbon, except where EU consumer protection law gives
          you the right to use courts in your country of residence.
        </p>
        <p>
          If you are an EU consumer, nothing in these terms affects your
          statutory rights under EU law.
        </p>
      </>
    ),
  },
  {
    id: "contact-terms",
    title: "10. Contact",
    body: (
      <>
        <p>
          For questions about these terms:{" "}
          <a href="mailto:hello@queerpulse.pt">hello@queerpulse.pt</a>. For
          legal notices: legal@queerpulse.pt. We aim to respond within 5 working
          days.
        </p>
      </>
    ),
  },
];

export function TermsPage() {
  return (
    <LegalDoc
      eyebrow="Legal"
      title={
        <>
          Terms of <em>Service</em>
        </>
      }
      meta={[
        "Effective: 1 February 2023",
        "Last updated: 1 June 2026",
        "Version 2.4",
      ]}
      plain={{
        title: "Plain language summary",
        text: "QueerPulse is a private, invite-only network for adults. You must follow the Code of Care. You own the content you create. We can remove your account if you break the rules. We're not liable for much — we're a small community, not a corporation. If something's unclear, ask us.",
      }}
      toc={[
        { id: "eligibility", label: "1. Who can join" },
        { id: "account", label: "2. Your account" },
        { id: "conduct", label: "3. How you must behave" },
        { id: "content", label: "4. Content you create" },
        { id: "events", label: "5. Events and gatherings" },
        { id: "termination", label: "6. Account suspension and termination" },
        { id: "liability", label: "7. Our liability" },
        { id: "changes-terms", label: "8. Changes to these terms" },
        { id: "law", label: "9. Governing law" },
        { id: "contact-terms", label: "10. Contact" },
      ]}
      sections={SECTIONS}
      contact={{
        text: (
          <>
            <strong>Questions about these terms?</strong> We use plain language
            intentionally. If something is unclear, ask — we'd rather explain it
            than have you agree to something you don't understand.
          </>
        ),
        email: "hello@queerpulse.pt",
      }}
    />
  );
}
