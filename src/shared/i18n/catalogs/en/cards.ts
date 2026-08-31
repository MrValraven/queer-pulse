import type { Catalog } from "../../types";

export const cards: Catalog = {
  "page.eyebrow": "Your cards",
  "page.title": "Membership cards",
  "page.dek":
    "Each community you belong to can issue you a card. Show it to prove you are a member.",
  "page.loadError.title": "We couldn't load <em>your cards</em>",
  "page.loadError.body":
    "Your cards are still there. The request didn't come back, so try again in a moment.",

  "empty.title": "No cards yet",
  "empty.body":
    "Membership cards come from communities. An owner or moderator of a community you belong to issues them, and yours lands here.",
  "empty.issuers.title": "Your communities that issue cards",
  "empty.issuers.hint": "Ask an owner or moderator there about getting yours.",
  "empty.noIssuers":
    "None of the communities you belong to run a card programme yet.",
  "empty.cta": "Your communities",

  "remove.cta": "Remove this card",
  "remove.ctaAria": "Remove your {community} card",
  "remove.confirm.title": "Remove your {community} card?",
  "remove.confirm.body":
    "This permanently deletes the card from your wallet. It cannot be undone.",
  "remove.confirm.confirmCta": "Remove card",
  "remove.toast": "Card removed.",

  "photo.consent": "Show my photo on this card",
  "photo.consentAria": "Show my photo on my {community} card",

  "pronouns.consent": "Show my pronouns on this card",
  "pronouns.consentAria": "Show my pronouns on my {community} card",
  "pronouns.noneSet":
    "Your {community} card prints your pronouns beside your name. Add them to your profile and they will appear here.",

  "discreet.title": "Card hidden",
  "discreet.body":
    "Your card names the community that issued it. It stays covered until you show it, and hides again when you leave this screen.",
  "discreet.show": "Show card",
  "discreet.showAria": "Show your membership card",
  "discreet.hideAria": "Hide your membership card",

  "face.ariaLabel": "Membership card for {community}",
  "face.loading": "Loading your membership card",
  "face.qrAriaLabel": "Scannable proof of membership for {community}",
  "face.serial": "No.",
  "face.memberSince": "Since",
  "face.validUntil": "Valid until",
  "face.neverExpires": "No expiry",
  "face.role": "Role",
  "face.backAriaLabel": "Back of your {community} membership card",
  "face.backAriaLabelIssuer": "Back of this {community} membership card",
  "face.flipToBack": "Turn the card over to show the code",
  "face.flipToFront": "Turn the card back to the front",
  "face.scanToVerify": "Scan to verify at {host}",

  "qrNotice.unavailable": "This card's code is unavailable right now.",
  "qrNotice.expired": "This card has expired",
  "qrNotice.suspended": "This card is paused",
  "qrNotice.revoked": "This card is no longer valid",

  "status.expired":
    "This card expired. Ask the community to issue you a new one.",
  // The same fact, where the programme lets the member act on it themselves.
  "status.expiredRenewable":
    "This card expired. Renewing puts it back in date.",
  "status.suspended": "This card is paused. The community can tell you more.",
  "status.revoked":
    "This card is no longer valid. The community can tell you more.",
  "status.tag.active": "Active",
  "status.tag.expired": "Expired",
  "status.tag.suspended": "Paused",
  "status.tag.revoked": "Revoked",

  // The expiry line under each card. A card that works reports a fact; a card
  // running out asks for something. The two are deliberately worded that way.
  "expiry.never": "This card does not expire.",
  "expiry.inDate": "Valid until {date}.",
  "expiry.soon_one": "This card expires in {count} day.",
  "expiry.soon_other": "This card expires in {count} days.",
  "expiry.soonRenewable_one":
    "This card expires in {count} day. You can renew it now.",
  "expiry.soonRenewable_other":
    "This card expires in {count} days. You can renew it now.",

  "renew.cta": "Renew card",
  "renew.ctaAria": "Renew your {community} card",
  "renew.pending": "Renewing…",
  "renew.toast": "Card renewed. It is valid until {date}.",
  "renew.error.notAllowed":
    "This community issues its own renewals. Ask an owner or moderator for a new card.",
  "renew.error.withdrawn":
    "This card was withdrawn by its community, so only they can bring it back.",
  "renew.error.notAMember":
    "You are no longer a member of this community, so this card cannot be renewed.",
  "renew.error.paused":
    "This card programme is paused right now. Try again once the community resumes it.",
  "renew.error.noExpiry":
    "This card does not expire, so there is nothing to renew.",
  "renew.error.notDue":
    "This card is still in date. You can renew it in its last 30 days.",
  "renew.error.generic": "The card could not be renewed. Try again.",

  "role.owner": "Owner",
  "role.coOwner": "Co-owner",
  "role.mod": "Moderator",
  "role.member": "Member",

  "verify.metaTitle": "Card check · QueerPulse",
  "verify.unverified": "This card could not be verified",
  "verify.status.active": "Valid membership card",
  "verify.status.expired": "Expired card",
  "verify.status.suspended": "Paused card",
  "verify.status.revoked": "Card no longer valid",
  "verify.role": "Role",
  "verify.serial": "Card no.",
  "verify.memberSince": "Member since",
  "verify.checkPhoto":
    "Check the photo on the card against the person showing it.",
  "verify.checkNoPhoto":
    "This card carries no photo, so it cannot confirm who is holding it. Ask for a name or something else you trust.",

  "verify.lead.active":
    "The community below issued this card and it stands today.",
  "verify.lead.expired":
    "This card was genuine and its term has run out. Its community can renew it.",
  "verify.lead.suspended":
    "Its community has put this card on hold. Treat it as not valid today.",
  "verify.lead.revoked":
    "Its community has withdrawn this card. Treat it as not valid.",

  "verify.face.label": "The face on this card",
  "verify.face.caption":
    "This copy came from the community's own records. Compare it with the person showing you the card.",

  "verify.stamp": "Checked at {time}",
  "verify.stampNote":
    "This page is live, so a screenshot of it proves nothing.",

  "verify.unverified.lead":
    "The code you scanned does not match a card that stands today.",
  "verify.unverified.whyTitle": "Why this happens",
  "verify.unverified.why.replaced":
    "The card was replaced, and this is an older printed or saved copy.",
  "verify.unverified.why.screenshot":
    "The code came from a screenshot or a photograph of a card rather than from the card itself.",
  "verify.unverified.why.partial":
    "The address was copied or typed incompletely.",
  "verify.unverified.why.foreign":
    "No community on QueerPulse ever issued this code.",
  "verify.unverified.privacy":
    "QueerPulse answers all of these the same way on purpose, so that anyone scanning codes at random learns nothing about who holds a card here.",
  "verify.unverified.next":
    "Ask the person to open their card in QueerPulse and scan the code from their own screen.",
  "verify.unverified.fair":
    "This says nothing about the person in front of you. A card can fail to verify for reasons entirely outside their hands.",

  "verify.unreachable.title": "We could not reach QueerPulse",
  "verify.unreachable.lead":
    "Nothing was checked and nothing was decided about this card. Your device could not get an answer.",
  "verify.unreachable.next":
    "Check your signal or wi-fi and try again. If the person is waiting, ask them to open their card in QueerPulse on their own connection.",
  "verify.retry": "Try again",
  "verify.retrying": "Checking…",
  "verify.checking": "Checking this card…",

  "designer.ariaLabel": "Design your community's membership card",
  "designer.loadErrorBody":
    "We couldn't load your card programme, so the designer is holding back rather than saving over it. Try again in a moment.",
  "designer.defaultCardName": "Member",
  "designer.cardNameLabel": "What the card calls a member",
  "designer.cardNamePlaceholder": "Member, Sócie, Companheire",
  "designer.cardNameHelper":
    "The word printed under your community's name on every card.",
  "designer.backgroundLabel": "What the card is made of",
  "designer.background.colour": "Colour",
  "designer.background.flag": "Flag",
  "designer.background.photo": "Photo",
  "designer.flagHelper":
    "The flag fills the whole card. Text on top of it always stays readable; choose how below.",
  "designer.photoHelper":
    "A wide image, cropped to the card. Text on top of it always stays readable; choose how below.",
  "designer.backdropLabel": "Behind the text",
  "backdrop.panel": "Panel",
  "backdrop.panelHelper":
    "A small dark panel sits behind your community's name and behind the member's name. Best when the artwork is busy, because everything else stays uncovered.",
  "backdrop.shade": "Shade",
  "backdrop.shadeHelper":
    "The top and bottom of the card are darkened and the middle is left clear. Best for flags, and for photos that are quiet at the edges.",
  "backdrop.veil": "Veil",
  "backdrop.veilHelper":
    "The whole card is darkened evenly. Best when the artwork has detail everywhere and every line has to be readable.",
  "flag.rainbow": "Rainbow",
  "flag.progress": "Progress Pride",
  "flag.transgender": "Transgender",
  "flag.bisexual": "Bisexual",
  "flag.lesbian": "Lesbian",
  "flag.pansexual": "Pansexual",
  "flag.asexual": "Asexual",
  "flag.aromantic": "Aromantic",
  "flag.nonbinary": "Non-binary",
  "flag.genderfluid": "Genderfluid",
  "flag.genderqueer": "Genderqueer",
  "flag.agender": "Agender",
  "flag.intersex": "Intersex",
  "designer.skinLabel": "Card style",
  "designer.accentLabel": "Accent",
  "designer.accentInvisible":
    "This accent is the same colour as the card, so the accent bar disappears.",
  "designer.memberPhotoLabel": "Member photos",
  "designer.memberPhotoCheck": "Put each member's photo on their card",
  "designer.memberPhotoHelper":
    "The photo comes from the member's own profile and sits beside your community's name. Anyone can turn theirs off on their own card.",
  "designer.photoStyleLabel": "How photos are printed",
  "designer.photoStyleHelper":
    "This applies to every member's photo on this card, so it is your choice about their pictures rather than theirs.",
  "photoStyle.color": "In colour",
  "photoStyle.mono": "Black and white",
  "designer.pronounsLabel": "Pronouns",
  "designer.pronounsCheck": "Print each member's pronouns beside their name",
  "designer.pronounsHelper":
    "The pronouns come from the member's own profile, so a card only shows what they have already set there. Anyone can turn theirs off on their own card.",
  "designer.pronounsStandIn": "your pronouns",
  "designer.selfRenewLabel": "Renewals",
  "designer.selfRenewCheck": "Let members renew their own card near expiry",
  "designer.selfRenewHelper":
    "In its last 30 days, a member can put their own card back in date without waiting for you to issue cards across the roster. Being on your roster is the only condition. A card you paused or revoked stays that way, and only you can bring it back.",
  "designer.printLabel": "Printed cards",
  "designer.printCheck": "Let owners and moderators print these cards",
  "designer.printHelper":
    "Print a sheet of physical cards for your members to carry. A printed card shows the same code as the one on their phone, so it keeps working until you replace it.",
  "designer.crestLabel": "Crest",
  "designer.crestHelper":
    "A small square logo, shown in the top corner of the card. Optional.",
  "designer.validityLabel": "How long a card stays valid",
  "designer.validityHelper": "A card issued today stops working on {date}.",
  "designer.validityHelperNever":
    "Cards keep working until you pause or revoke them.",
  "designer.previewCaption": "How a member sees their card.",
  "designer.previewThemeLabel": "Preview the card in light or dark mode",
  "designer.previewLight": "Light",
  "designer.previewDark": "Dark",
  "designer.save": "Save and issue cards",
  "designer.saveDesign": "Save design",
  "designer.saved": "Card saved. {count} members now hold one.",
  "designer.savedDesign": "Card design saved. Every card updates to match.",
  "designer.savedPaused":
    "Card saved. It stays paused, so members won't see the change until you resume it.",
  "designer.discard.title": "Discard this design?",
  "designer.discard.body":
    "Your changes to the card have not been saved yet. Closing now loses them.",
  "designer.discard.confirm": "Discard changes",
  "designer.discard.cancel": "Keep editing",

  "skin.plum": "Plum",
  "skin.cream": "Cream",
  "skin.jade": "Jade",
  "skin.coral": "Coral",
  "skin.ink": "Ink",

  "accent.accent": "Coral",
  "accent.plum": "Plum",
  "accent.jade": "Jade",
  "accent.ink": "Ink",

  "validity.never": "Never expires",
  "validity.oneYear": "One year",
  "validity.twoYears": "Two years",

  "holders.title": "Card holders",
  "holders.loadErrorBody":
    "We couldn't load the card holders. Try again in a moment.",
  "holders.searchLabel": "Search card holders",
  "holders.searchPlaceholder": "Name or card number",
  "holders.suspend": "Pause",
  "holders.suspendAria": "Pause {name}'s card",
  "holders.revoke": "Revoke",
  "holders.revokeAria": "Revoke {name}'s card",
  "holders.reinstate": "Reinstate",
  "holders.reinstateAria": "Reinstate {name}'s card",
  "holders.selectAria": "Select {name}'s card for printing",
  "holders.selectAllActive": "Select every active card",
  "holders.clearSelection": "Clear selection",
  "holders.printSelected_one": "Print 1 card",
  "holders.printSelected_other": "Print {count} cards",
  "holders.replace": "Replace",
  "holders.replaceAria": "Replace {name}'s card",
  "holders.replaceModal.title": "Replace {name}'s card?",
  "holders.replaceModal.body":
    "Use this when a printed card is lost or stolen. Every printed copy stops working straight away. The card on their phone keeps working and starts showing a new code, so they stay a member throughout.",
  "holders.replaceModal.confirm": "Replace card",
  "holders.replaceModal.cancel": "Keep this card",
  "holders.replaceToast": "{name}'s card has a new code.",
  "holders.verifiedNever": "Never checked.",
  "holders.verifiedCount_one": "Checked once.",
  "holders.verifiedCount_other": "Checked {count} times.",
  "holders.reasonLabel": "Reason",
  "holders.reasonPlaceholder": "Why is this card changing?",
  "holders.reasonHint":
    "Only your community's owners and moderators see this. It never appears on the card.",
  "holders.modal.suspended": "Pause {name}'s card?",
  "holders.modal.revoked": "Revoke {name}'s card?",
  "holders.modal.active": "Reinstate {name}'s card?",
  "holders.confirm.suspended": "Pause card",
  "holders.confirm.revoked": "Revoke card",
  "holders.confirm.active": "Reinstate card",
  "holders.toast.suspended": "{name}'s card is paused.",
  "holders.toast.revoked": "{name}'s card is revoked.",
  "holders.toast.active": "{name}'s card is active again.",
  "holders.viewCardAria": "Open {name}'s card",
  "holders.card.caption":
    "The card as its holder sees it. Turn it over for the details.",
  "holders.card.issued": "Issued",
  "holders.card.changedOn": "Status changed",
  "holders.card.viewProfile": "View profile",
  "holders.card.close": "Close",

  "print.metaTitle": "Print membership cards · QueerPulse",
  "print.loadErrorBody":
    "We couldn't load this community's cards, so there is nothing to lay out yet. Try again in a moment.",
  "print.title_one": "One card to print",
  "print.title_other": "{count} cards to print",
  "print.print": "Print",
  "print.back": "Back to card holders",
  "print.inkNotice":
    "These cards print edge to edge in full colour, so a large batch uses a lot of ink.",
  "print.foldHint":
    "Each card prints as one strip. Cut along the corner marks, then fold backwards on the dashed line so the front and back meet.",
  "print.unavailableTitle": "Nothing to print",
  "print.emptyBody":
    "None of the selected members hold an active card. Issue cards first, then come back.",
  "print.disabledBody":
    "Printed cards are turned off for this programme. An owner or moderator can turn them on in the card designer.",

  "modTools.title": "Members card",
  "modTools.empty":
    "Give your members a card that proves they belong here. They can show it at your gatherings and anyone can verify it.",
  "modTools.start": "Start a members card",
  "modTools.edit": "Edit card",
  "modTools.pause": "Pause this card programme",
  "modTools.resume": "Resume this card programme",
  "modTools.pausedNotice":
    "This card programme is paused. Members cannot show or scan a card until you resume it.",
  "modTools.issue": "Issue cards",
  "modTools.issueConfirm.title": "Issue cards across your roster?",
  "modTools.issueConfirm.body":
    "Every member without a card gets one, and cards that have expired are put back in date. Cards you paused or revoked stay as they are.",
  "modTools.issueConfirm.confirm": "Issue cards",
  "modTools.issued.new_one": "One new card issued.",
  "modTools.issued.new_other": "{count} new cards issued.",
  "modTools.issued.renewed_one": "One expired card renewed.",
  "modTools.issued.renewed_other": "{count} expired cards renewed.",
  "modTools.issued.none": "Everyone on your roster already holds a card.",
  "modTools.issued.skipped_one":
    "One paused or revoked card was left as it is.",
  "modTools.issued.skipped_other":
    "{count} paused or revoked cards were left as they are.",
  "modTools.pausedToast": "Card programme paused.",
  "modTools.resumedToast": "Card programme resumed.",
  "verifications.title": "Card checks",
  "verifications.total_one": "{count} check",
  "verifications.total_other": "{count} checks",
  "verifications.recent_one": "{count} in the last {days} days",
  "verifications.recent_other": "{count} in the last {days} days",
  "verifications.last": "Last checked {date}.",
  "verifications.empty": "No card from this programme has been checked yet.",
  "verifications.note":
    "A count of how often these cards were checked, kept for 90 days and then deleted. QueerPulse keeps no record of who checked a card, or where.",
};
