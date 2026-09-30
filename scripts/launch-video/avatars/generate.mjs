/**
 * Draw the film's cast (cast.json) as illustrated avatars, one SVG each.
 *
 * The SVGs are committed, so this only needs re-running when the cast
 * changes. DiceBear is deliberately not an app dependency; install it for the
 * run and throw it away:
 *
 *   npm i --no-save @dicebear/core@9 @dicebear/collection@9
 *   node scripts/launch-video/avatars/generate.mjs
 *
 * Art: DiceBear "Micah", based on Avatar Illustration System by Micah Lanier,
 * CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Credit it wherever
 * the film is published.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createAvatar } from "@dicebear/core";
import { micah } from "@dicebear/collection";

const DIR = fileURLToPath(new URL(".", import.meta.url));
const { people } = JSON.parse(readFileSync(`${DIR}cast.json`, "utf8"));
// Line colour that stays visible on the deepest skin tones.
const DEEP = ["4a2617", "6b3a24", "8d5438"];

for (const p of people) {
  const svg = createAvatar(micah, {
    seed: p.id,
    radius: 50,
    backgroundColor: [p.bg],
    baseColor: [p.skin],
    hair: [p.hair],
    hairColor: [p.hairColor],
    hairProbability: 100,
    mouth: [p.mouth],
    eyes: [p.eyes],
    eyebrows: ["up"],
    eyebrowsColor: ["1f1a1c"],
    shirt: [p.shirt],
    shirtColor: [p.shirtColor],
    ears: ["attached"],
    nose: ["curve"],
    glasses: [p.glasses || "round"],
    glassesProbability: p.glasses ? 100 : 0,
    glassesColor: [DEEP.includes(p.skin) ? "f7f3ee" : "1f1a1c"],
    facialHair: [p.facialHair || "beard"],
    facialHairProbability: p.facialHair ? 100 : 0,
    facialHairColor: [p.hairColor === "c9c3bd" ? "c9c3bd" : "1f1a1c"],
    earrings: [p.earrings || "stud"],
    earringsProbability: p.earrings ? 100 : 0,
    earringColor: ["e8b44a"],
    mouthColor: ["1f1a1c"],
    eyesColor: ["1f1a1c"],
  }).toString();
  writeFileSync(`${DIR}${p.id}.svg`, svg);
}
console.log(`drew ${people.length} avatars`);
