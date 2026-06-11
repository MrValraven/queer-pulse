import { type ReactNode } from 'react'
import { routes } from '../../app/routeMap'

export interface HrItem {
  title: string
  body: string
}

export interface HrSection {
  label: string
  title: string
  alert?: { head: string; body: string }
  items: HrItem[]
  link?: { label: string; href: string }
}

export interface NaloxoneStep {
  n: number
  body: ReactNode
}

export const SECTIONS: HrSection[] = [
  {
    label: 'Before the night',
    title: 'Know before you go',
    items: [
      { title: 'Eat beforehand', body: 'Alcohol and MDMA both hit harder on an empty stomach. Eat a proper meal 2–3 hours before, not immediately before.' },
      { title: 'Test your substances', body: 'Drug checking services operate in Lisbon — KOSMICARE at festivals, and the DICAD-supported service. Reagent test kits are legal in Portugal and available online. Never assume a pill is what you were told.' },
      { title: 'Know your medications', body: 'SSRIs, MAOIs, antiretrovirals, and many other medications interact dangerously with MDMA, stimulants, and some psychedelics. Check interactions at TripSit or DrugsData before you go.' },
      { title: 'Tell someone where you are', body: 'Share your location with a trusted person who is not going out. Agree on a check-in time. This is not paranoia — it is standard care for yourself.' },
      { title: 'Budget your doses', body: 'Decide what you are taking before you go. It is much harder to make good decisions at 3am in a loud room. Write it down if it helps.' },
    ],
  },
  {
    label: 'At the party',
    title: 'During the night',
    alert: { head: 'Water: not too little, not too much', body: 'MDMA can cause both dehydration and hyponatraemia (too much water). If dancing heavily: ~500ml per hour. If not dancing: ~250ml per hour. Sports drinks help with salt.' },
    items: [
      { title: 'Start low, wait longer than you think', body: 'MDMA takes 45–90 minutes to peak. Cocaine\'s effect is shorter. Many hospitalisations happen because someone redosed before the first dose peaked. Wait at least 90 minutes.' },
      { title: 'Take breaks from dancing', body: 'Overheating is a genuine risk. Go outside, sit down, cool off regularly. If you feel very hot and stop sweating, get help immediately.' },
      { title: 'Mixing substances', body: 'Alcohol + MDMA: harder on your body, increases dehydration. MDMA + cocaine: significant cardiac stress. MDMA + ketamine: unpredictable. Never mix with opioids unless you have naloxone present.' },
      { title: 'Look after each other', body: 'If your friend seems confused, overly hot, or unresponsive to your voice — get them out of the crowd, give water, and if no improvement in 5 minutes, call 112.' },
    ],
  },
]

export const AFTER: HrSection = {
  label: 'The next day',
  title: 'Recovery',
  items: [
    { title: 'MDMA comedown is real', body: 'MDMA temporarily depletes serotonin. Days 2–4 after use can involve low mood, anxiety, and fatigue. This is neurological, not a reflection of your life. It passes. Eating, sleeping, and light activity help.' },
    { title: 'Sleep and food first', body: 'Before anything else. Your body has worked hard. The urge to redose to chase the good feeling almost always makes the comedown worse.' },
    { title: 'If you feel worried about your use', body: 'CAT (Centro de Atendimento a Toxicodependentes) offers free, confidential support — no judgment, no obligation. You do not have to be dependent to ask for support. Call 800 20 40 60.' },
    { title: 'Chemsex and follow-up testing', body: 'If you have had sex while using substances, consider an STI test within 72 hours if you want PEP (HIV post-exposure prophylaxis). Checkpoint and GAT both offer rapid testing. No appointment needed.' },
  ],
}

export const SOBER: HrSection = {
  label: 'Not using',
  title: 'Sober at the party',
  items: [
    { title: 'You belong there', body: 'Queer nightlife can feel substance-centric. You are allowed to be there without drinking or using — and you do not owe anyone an explanation.' },
    { title: 'Non-alcoholic options', body: 'Most Lisbon venues serve water and soft drinks. Ask for sparkling water with lime if you do not want it to look like you are not drinking — it is no one else\'s business.' },
    { title: 'QueerPulse Sober community', body: 'The Sober page connects community members who are sober or sober-curious. You are not alone in wanting to be part of the night without the substances.' },
  ],
  link: { label: 'Visit the Sober page →', href: routes.sober },
}

export const SERVICES: HrSection = {
  label: 'Support & services',
  title: 'Where to go',
  items: [
    { title: 'GAT Lisboa', body: 'Free HIV/STI testing, naloxone, condoms, harm reduction support. Rua de São Lázaro 58 · gat.org.pt' },
    { title: 'Checkpoint Lisboa', body: 'Rapid HIV and STI testing, PrEP support, walk-ins welcome. Rua do Crucifixo 100 · checkpointlx.com' },
    { title: 'CAT (drug support)', body: 'Free and confidential support for anyone concerned about their substance use. 800 20 40 60 · no appointment needed.' },
    { title: 'KOSMICARE', body: 'Psychedelic crisis support and integration. Active at Boom Festival and available for consultations year-round. kosmicare.org' },
    { title: 'TripSit & DrugsData', body: 'Drug interaction checker, dosage guides, and substance information. tripsit.me · drugsdata.org' },
  ],
}

export const NALOXONE_STEPS: NaloxoneStep[] = [
  { n: 1, body: <><strong>Call 112</strong> — say "a person is unresponsive and not breathing normally"</> },
  { n: 2, body: <><strong>Administer naloxone</strong> — nasal spray: one spray in one nostril. Injection: follow kit instructions.</> },
  { n: 3, body: <><strong>Recovery position</strong> — roll onto their side, tilt head back to open airway</> },
  { n: 4, body: <><strong>If no response in 2–3 minutes</strong> — give a second dose if you have one. Continue until help arrives.</> },
  { n: 5, body: <><strong>Stay with them</strong> — naloxone wears off before many opioids do. They need monitoring.</> },
]
