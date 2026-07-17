import type { Catalog } from "../../types";

/**
 * `support` — the Sustainer (supporting-membership) page and its payment
 * flow. There is no backend integration anywhere in this feature (no `api/`
 * directory, purely local state + `useLocalStorage`), so per the extraction
 * brief's scope rule almost everything here is chrome and in scope. The one
 * exception: `SustainerTestimonials` member quotes are fictional-user
 * content (attributed names/roles), left untranslated — see the worked
 * examples table in `docs/i18n/extraction-brief.md`.
 */
export const support: Catalog = {
  // ── Hero ──────────────────────────────────────────────────────────────
  "hero.eyebrow": "Supporting membership",
  "hero.title": "Keep QueerPulse <em>going</em>",
  "hero.sub":
    "QueerPulse is free to join and always will be. Supporting members help cover the costs of running it — hosting, moderation tools, and assuring the team's livelihood.",
  "hero.chooseAmountCta": "Choose an amount",
  "hero.seeBudgetCta": "See where it goes",
  "hero.chip.smallTeam": "Built by a small team",
  "hero.chip.noInvestors": "No investors",
  "hero.chip.freeForever": "Free forever",
  "hero.supportingNow": "Supporting right now",
  "hero.supportingMembersLabel": "supporting members",
  "hero.progressCount": "{count} of {goal}",
  "hero.toBreakEven": "to break even",
  "hero.joinedThisWeek_one": "{count} person joined this week",
  "hero.joinedThisWeek_other": "{count} people joined this week",

  // ── Impact ("what you're contributing to") ───────────────────────────
  "impact.heading": "What you're <em>contributing to</em>",
  "impact.sub":
    "Every euro goes directly into keeping this community running and cared for.",
  "impact.card.moderation.title": "Moderation & safety",
  "impact.card.moderation.desc":
    "Reviewing reports, managing appeals, and keeping the community a place people actually want to be in.",
  "impact.card.hosting.title": "Hosting & infrastructure",
  "impact.card.hosting.desc":
    "Servers, email delivery, backups, and the small army of services that make it all reliable.",
  "impact.card.team.title": "The team",
  "impact.card.team.desc":
    "Two part-time people and a small contractor budget. We pay fair wages. That costs money.",
  "impact.card.freeAccess.title": "Free access for everyone",
  "impact.card.freeAccess.desc":
    "Supporting members make it possible for the platform to stay free for everyone else. Always.",

  // ── Budget transparency block ────────────────────────────────────────
  "budget.title": "Where the money actually goes",
  "budget.period": "Typical month · 2026",
  "budget.intro":
    "We said transparency isn't negotiable, so here's the real thing. This is roughly what it costs to run QueerPulse each month. No marketing budget, no office, no investors to pay back.",
  "budget.row.team": "Team (2 part-time)",
  "budget.row.magazine": "Magazine & contributors",
  "budget.row.moderationTools": "Moderation & safety tools",
  "budget.row.payments": "Payment processing",
  "budget.totalLabel": "Monthly running cost",
  "budget.foot":
    "Full quarterly figures live in our <link>transparency report</link>. Any surplus goes to the mental-health fund and micro-grants — never to profit.",

  // ── Tiers / amount picker ─────────────────────────────────────────────
  "tiers.heading": "What feels <em>right</em>",
  "tiers.sub":
    "There's no wrong amount. Every contribution helps, and you can change or cancel at any time.",
  "tiers.name.supporter": "Supporter",
  "tiers.name.friend": "Friend",
  "tiers.name.patron": "Patron",
  "tiers.name.custom": "Custom",
  "tiers.microlabel.supporter": "Popular with new members",
  "tiers.microlabel.friend": "The sweet spot",
  "tiers.microlabel.patron": "Best for regulars",
  "tiers.mostChosen": "Most chosen",
  "tiers.chooseCta": "Choose {name}",
  "tiers.selectAriaLabel": "Select {name} tier",
  "tiers.saveSuffix": "save {amount}/yr",
  "tiers.perk.supporter.badge": "Sustainer badge on your profile",
  "tiers.perk.supporter.thankYou": "Name in monthly thank-you post",
  "tiers.perk.supporter.gratitude": "Our genuine gratitude",
  "tiers.perk.friend.everythingSupporter": "Everything in Supporter",
  "tiers.perk.friend.earlyAccess": "Early access to new features",
  "tiers.perk.friend.rareBadge": "Sustainer badge (Rare)",
  "tiers.perk.friend.xp": "10 XP credited monthly",
  "tiers.perk.patron.everythingFriend": "Everything in Friend",
  "tiers.perk.patron.annualList": "Name in annual supporters list",
  "tiers.perk.patron.directLine": "Direct line to the team",
  "tiers.perk.patron.roadmap": "Input on roadmap priorities",
  "tiers.freqAdverb.monthly": "monthly",
  "tiers.freqAdverb.annual": "yearly",
  "tiers.freqAdverb.once": "one-time",
  "tiers.customAmountPlaceholder": "Other",
  "tiers.customAmountAriaLabel": "Custom amount",
  "tiers.customText": "Or contribute what you can, {freq}",
  "tiers.customHelp.perYear": "= {amount} per year",
  "tiers.customHelp.perMonth": "≈ {amount} per month",
  "tiers.customHelp.onceNote": "A one-time contribution",
  "tiers.customErr": "Please enter an amount of {sym}1 or more.",
  "tiers.yourAmount": "your amount",
  "tiers.continueCta": "Continue with {name}",
  "tiers.chargeNote": "There's no charge until you review and confirm.",
  "tiers.solidOpt.title":
    "Add <amt>{amount}</amt> to sponsor a free membership",
  "tiers.solidOpt.detail":
    "Pay it forward for someone in the community who can't contribute right now.",
  "tiers.giftOpt.title": "Make this a gift",
  "tiers.giftOpt.detail":
    "Support QueerPulse on behalf of someone else — they'll get the badge and a note from you.",

  // ── Frequency labels (canonical FreqKey stays English; these are display) ─
  "freq.monthly.per": "per month",
  "freq.monthly.short": "/month",
  "freq.monthly.billing": "Monthly",
  "freq.monthly.sub": "Recurring · cancel any time",
  "freq.annual.per": "per year",
  "freq.annual.short": "/year",
  "freq.annual.billing": "Yearly",
  "freq.annual.sub": "Billed once a year · cancel any time",
  "freq.once.per": "one time",
  "freq.once.billing": "One-time",
  "freq.once.sub": "A single contribution",
  "controls.billingFrequencyAriaLabel": "Billing frequency",
  "controls.currencyAriaLabel": "Currency",
  "controls.saveTag": "2 mo free",

  // ── How it works ───────────────────────────────────────────────────────
  "howItWorks.heading": "How it <em>works</em>",
  "howItWorks.sub": "No lock-in, no small print games.",
  "howItWorks.step1": "Pick an amount that feels right for you",
  "howItWorks.step2": "Pay securely — card, Apple Pay, PayPal or SEPA",
  "howItWorks.step3": "Your Sustainer badge activates instantly",
  "howItWorks.step4": "Change or cancel any time, no questions",

  // ── Impact framing (below the amount picker, per contribution level) ──
  "impact.msg.high":
    "funds nearly a full day of the team keeping this place running and cared for.",
  "impact.msg.mid":
    "covers a month of hosting and email for dozens of members.",
  "impact.msg.low": "keeps the forum and the moderation tools running.",

  // ── Impact stats (sidebar) ────────────────────────────────────────────
  "impactStats.mentalHealthFund": "to the mental-health fund",
  "impactStats.freeMemberships": "free memberships funded",
  "impactStats.yearsRunning": "of activity — we're still here",
  "impactStats.years": "years",
  "impactStats.communityFunded": "community-funded",

  // ── Sidebar ────────────────────────────────────────────────────────────
  "sidebar.statsHead": "Members' impact so far",
  "sidebar.membersNeeded": "members needed to fully cover monthly costs",
  "sidebar.whyHead": "Why we built it this way",
  "sidebar.whyText":
    "We turned down investment offers. Not out of pride — out of principle. The moment a platform has investors, the community stops being the product and starts becoming one. QueerPulse stays free because the people who use it choose to keep it alive. That's the deal.",
  "sidebar.sign": "— The QueerPulse team",
  "sidebar.reassure.stripe": "Secure via Stripe",
  "sidebar.reassure.cancel": "Cancel any time",
  "sidebar.reassure.refund": "14-day refund",

  // ── Testimonials section (heading/sub are chrome; quotes are content) ──
  "testimonials.heading": "Why members <em>chip in</em>",
  "testimonials.sub": "In their own words.",

  // ── FAQ ────────────────────────────────────────────────────────────────
  "faq.heading": "Questions, <em>answered</em>",
  "faq.sub": "Everything you might reasonably want to know before chipping in.",
  "faq.change.q": "Can I change or pause my amount later?",
  "faq.change.a":
    "Any time, from your account settings. Change the amount, switch between monthly and yearly, pause for a few months, or cancel — all self-serve, no email required.",
  "faq.cancel.q": "Can I cancel?",
  "faq.cancel.a":
    "Yes, instantly, any time — from your account settings. No questions, no retention flow, no guilt trip. Your Sustainer badge stays until the billing period ends.",
  "faq.refunds.q": "Do you offer refunds?",
  "faq.refunds.a":
    "If you change your mind within 14 days of a payment, email us and we'll refund it in full, no reason needed. After that, cancelling stops future payments but past ones aren't refunded.",
  "faq.methods.q": "Which payment methods work?",
  "faq.methods.a":
    "Card, Apple Pay, PayPal and SEPA direct debit for EU bank accounts. Everything is processed by Stripe — we never see or store your card details.",
  "faq.invoice.q": "Can I get an invoice or receipt?",
  "faq.invoice.a":
    "Yes. Every payment sends a receipt to your email automatically, and you can download a dated invoice — including a company name and VAT number — from your account.",
  "faq.taxDeductible.q": "Is this tax deductible?",
  "faq.taxDeductible.a":
    "No — QueerPulse is not a registered charity. Your contribution is a membership payment, not a donation. We can't provide tax receipts for deduction purposes.",
  "faq.currency.q": "Can I support in a currency other than euro?",
  "faq.currency.a":
    "Euro is our default and what our costs are in, but you can pay in GBP or USD using the currency switch above the amounts. Your card can be from anywhere.",
  "faq.cantAfford.q": "What if I can't afford it?",
  "faq.cantAfford.a":
    "The platform is free and always will be. Contributing is never required. If you want to support in other ways — hosting a gathering, vouching for members, writing for the magazine — those matter just as much.",

  // ── Member banner (already a supporter) ───────────────────────────────
  "memberBanner.label": "You're a supporting member",
  "memberBanner.nextPayment": "Next payment {date} · Sustainer badge active",
  "memberBanner.changeAmountCta": "Change amount",
  "memberBanner.receiptsCta": "Receipts",
  "memberBanner.cancelCta": "Cancel",
  "memberBanner.receiptsToast": "Receipts emailed to you.",
  "memberBanner.cancelToast":
    "Membership cancelled. Your badge stays until the period ends.",

  // ── Recap bar ──────────────────────────────────────────────────────────
  "recap.customName": "Your contribution",
  "recap.continueCta": "Continue",

  // ── Payment modal ──────────────────────────────────────────────────────
  "modal.checkoutAriaLabel": "Supporting membership checkout",
  "modal.close": "Close",
  "modal.head.done": "All <em>done</em>",
  "modal.head.gift": "Gift a <em>membership</em>",
  "modal.head.custom": "Support <em>QueerPulse</em>",
  "modal.head.tier": "Becoming a <em>{name}</em>",
  "modal.giftSentToast": "Gift sent.",
  "modal.welcomeToast": "Welcome aboard — badge activated.",
  "modal.welcomeName.gift": "friend of QueerPulse",
  "modal.welcomeName.customSupporter": "supporter",
  "modal.receipt.giftText":
    "We've emailed your gift and their new Sustainer badge is ready to activate.",
  "modal.receipt.text":
    "Your Sustainer badge is active. Thank you for keeping this place alive.",
  "modal.receipt.giftSuffix": " (gift)",

  // ── Checkout ───────────────────────────────────────────────────────────
  "checkout.giftMembership": "Gift membership",
  "checkout.solidLine": "Sponsor a free membership",
  "checkout.totalToday": "Total today",
  "checkout.recipientEmailLabel": "Email of who's receiving the gift",
  "checkout.emailErr": "Enter a valid email.",
  "checkout.ibanLabel": "IBAN",
  "checkout.ibanErr": "Enter a valid IBAN.",
  "checkout.accountHolderLabel": "Account holder",
  "checkout.accountHolderErr": "Enter the account holder name.",
  "checkout.applePayNote": "Fast, private checkout with Touch ID or Face ID.",
  "checkout.applePayCta": "Pay with Apple Pay",
  "checkout.paypalNote": "PayPal will ask you to confirm.",
  "checkout.paypalCta": "Continue with PayPal",
  "checkout.method.applePay": "Apple Pay",
  "checkout.method.paypal": "PayPal",
  "checkout.method.sepa": "SEPA",
  "checkout.backToCard": "‹ Pay by card instead",
  "checkout.moreWaysToPay": "More ways to pay",
  "checkout.validationToast": "Please check the highlighted fields.",
  "checkout.startCta": "Start supporting — {amount}",
  "checkout.stripeNote": "Powered by Stripe · Secure payment",
  "checkout.fineprint":
    "By continuing you agree to our terms. Cancel any time; 14-day refund on request.",
  "checkout.cardNumberLabel": "Card number",
  "checkout.cardNumberErr": "Enter a valid 16-digit card number.",
  "checkout.expiryLabel": "Expiry",
  "checkout.cvcLabel": "CVC",
  "checkout.cvcErr": "3–4 digits",
  "checkout.nameOnCardLabel": "Name on card",
  "checkout.nameOnCardErr": "Enter the name on the card.",

  // ── Success / receipt ──────────────────────────────────────────────────
  "success.welcomeTitle": "Welcome, <em>{name}</em>",
  "success.shareLabel": "Help us grow — tell people",
  "success.shareAriaLabel.story": "Share your story",
  "success.shareAriaLabel.link": "Copy a link",
  "success.shareAriaLabel.feed": "Post to your feed",
  "success.share.story": "your story",
  "success.share.link": "a copied link",
  "success.share.feed": "your feed",
  "success.share.toast":
    "Shared to {channel}. Thank you for spreading the word!",
  "success.receipt.membership": "Membership",
  "success.receipt.billing": "Billing",
  "success.receipt.sponsoredMembership": "Sponsored membership",
  "success.receipt.reference": "Reference",
  "success.receipt.chargedToday": "Charged today",
  "success.downloadCta": "Download receipt",
  "success.downloadToast": "Receipt downloaded (PDF).",
  "success.backCta": "Back to QueerPulse",
};
