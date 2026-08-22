import type { Catalog } from "../../types";

export const cards: Catalog = {
  "page.eyebrow": "Your cards",
  "page.title": "Membership cards",
  "page.dek":
    "Each community you belong to can issue you a card. Show it to prove you are a member.",

  "empty.title": "No cards yet",
  "empty.body":
    "When a community you belong to starts a card programme, your card appears here.",

  "remove.cta": "Remove this card",
  "remove.ctaAria": "Remove your {community} card",
  "remove.confirm.title": "Remove your {community} card?",
  "remove.confirm.body":
    "This permanently deletes the card from your wallet. It cannot be undone.",
  "remove.confirm.confirmCta": "Remove card",
  "remove.toast": "Card removed.",

  "photo.consent": "Show my photo on this card",
  "photo.consentAria": "Show my photo on my {community} card",

  "discreet.title": "Card hidden",
  "discreet.body":
    "Your card names the community that issued it. It stays covered until you show it, and hides again when you leave this screen.",
  "discreet.show": "Show card",
  "discreet.showAria": "Show your membership card",
  "discreet.hide": "Hide",
  "discreet.hideAria": "Hide your membership card",

  "face.ariaLabel": "Membership card for {community}",
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

  "qrNotice.minting": "Preparing your code",
  "qrNotice.offline": "Cannot reach QueerPulse. Your card cannot prove itself right now.",
  "qrNotice.expired": "This card has expired",
  "qrNotice.suspended": "This card is paused",
  "qrNotice.revoked": "This card is no longer valid",
  "qrNotice.holderOnly": "Only the holder can show this card's code",

  "status.expired":
    "This card expired. Ask the community to issue you a new one.",
  "status.suspended":
    "This card is paused. The community can tell you more.",
  "status.revoked":
    "This card is no longer valid. The community can tell you more.",
  "status.tag.active": "Active",
  "status.tag.expired": "Expired",
  "status.tag.suspended": "Paused",
  "status.tag.revoked": "Revoked",

  "role.owner": "Owner",
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

  "designer.ariaLabel": "Design your community's membership card",
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
    "The flag fills the whole card. Text on top of it stays readable automatically.",
  "designer.photoHelper":
    "A wide image, cropped to the card. Text on top of it stays readable automatically.",
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
  "holders.searchLabel": "Search card holders",
  "holders.searchPlaceholder": "Name or card number",
  "holders.suspend": "Pause",
  "holders.suspendAria": "Pause {name}'s card",
  "holders.revoke": "Revoke",
  "holders.revokeAria": "Revoke {name}'s card",
  "holders.reinstate": "Reinstate",
  "holders.reinstateAria": "Reinstate {name}'s card",
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
};
