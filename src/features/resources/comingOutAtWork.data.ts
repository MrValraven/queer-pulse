export interface Consideration {
  title: string;
  body: string;
}

export interface Signal {
  badge: "good" | "caution";
  text: string;
}

export interface Script {
  context: string;
  line: string;
}

export interface Voice {
  text: string;
  who: string;
}

export const TIMING: Consideration[] = [
  {
    title: "There is no universal right time",
    body: "Anyone who tells you there's a correct moment is selling something. The right time is the one that's right for your safety, your finances, and your peace — in that order.",
  },
  {
    title: "Safety and security first",
    body: "If coming out could put your job, visa, or housing at risk, that calculation is allowed to come first. Protecting yourself is not the same as hiding.",
  },
  {
    title: "You can do it in degrees",
    body: "Out to one trusted colleague is a complete and valid choice. You don't owe the whole office an announcement, ever.",
  },
];

export const SIGNALS: Signal[] = [
  {
    badge: "good",
    text: "Visible LGBTQ+ colleagues who are out and seem fine",
  },
  {
    badge: "good",
    text: "A written non-discrimination policy that names sexual orientation and gender identity",
  },
  {
    badge: "good",
    text: "Inclusive language in everyday talk — partners, not assumptions",
  },
  {
    badge: "caution",
    text: "Jokes that go unchallenged, including by managers",
  },
  {
    badge: "caution",
    text: "A culture where personal life is policed or gossiped about",
  },
  {
    badge: "caution",
    text: "No HR, or an HR that reports straight to the person you'd be disclosing to",
  },
];

export const SCRIPTS: Script[] = [
  {
    context: "Low-key, to one colleague",
    line: '"My partner — her name\'s Ana — and I went to Sintra at the weekend." Said in passing, it does the whole job without a sit-down.',
  },
  {
    context: "If you want to be deliberate",
    line: "\"I wanted to mention, since we work closely — I'm gay. It's not a big deal to me day-to-day, I just didn't want to keep editing myself around you.\"",
  },
  {
    context: "Setting a boundary at the same time",
    line: "\"I'm happy to answer questions, but I'd rather it not become the topic. Thanks for keeping it normal.\"",
  },
];

export const IF_BAD: Consideration[] = [
  {
    title: "Document everything",
    body: "Dates, words, witnesses. Discrimination on grounds of sexual orientation or gender identity is unlawful in Portugal, and a record is what turns an experience into a case.",
  },
  {
    title: "You have rights",
    body: "You cannot be lawfully dismissed or harassed for being queer. The ACT handles workplace discrimination complaints, and you can report anonymously. Our legal aid page has the templates.",
  },
  {
    title: "You are not alone in it",
    body: "The coming-out space and the wider community have walked people through exactly this. Bring it to the forum — you'll find people who've survived the same manager.",
  },
];

export const VOICES: Voice[] = [
  {
    text: "I told one person first. By the time the rest of the office knew, it had already become completely unremarkable. That's the version I'd recommend.",
    who: "A member, coming-out space",
  },
  {
    text: "It did not go well, and I got through it — with the network, the legal templates, and a new job six months later. Even the bad version is survivable.",
    who: "A member, coming-out space",
  },
];
