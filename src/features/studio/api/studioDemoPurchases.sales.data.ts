import { DEMO_ARTIST_VANDA_DIESEL } from "./studioDemoFormats.data";
import {
  DEMO_ARTIST_MARIANA,
  DEMO_DEFAULT_RELEASE_ID,
  DEMO_DEFAULT_TRACK_ID,
} from "./studioDemoMe.data";
import {
  CORO_ID,
  RITA_ID,
  type DemoPurchaseSeed,
} from "./studioDemoPurchases.data";

// Pending claims, Mariana's confirmed sales and the buyers on Coro de
// Outubro's wall. Sales and claims share one shape with the viewer's own
// purchases (studioDemoPurchases.data.ts).

const REFERENCE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

const claimOf = (
  fields: Pick<DemoPurchaseSeed, "id" | "referenceCode" | "createdDaysAgo"> & {
    name: string;
    payerName: string;
    isTrack: boolean;
  },
): DemoPurchaseSeed => ({
  id: fields.id,
  kind: fields.isTrack ? "track" : "release",
  itemId: fields.isTrack ? DEMO_DEFAULT_TRACK_ID : DEMO_DEFAULT_RELEASE_ID,
  artistId: DEMO_ARTIST_MARIANA.id,
  amountCents: fields.isTrack ? 150 : 800,
  referenceCode: fields.referenceCode,
  buyer: { name: fields.name },
  payerName: fields.payerName,
  createdDaysAgo: fields.createdDaysAgo,
});

/** Pending claims on Mariana's album and track 06. */
export const DEMO_PENDING_CLAIMS: DemoPurchaseSeed[] = [
  claimOf({
    id: "demo-claim-ines",
    name: "Inês Duarte",
    payerName: "Inês D.",
    isTrack: false,
    referenceCode: "H4TM7Z",
    createdDaysAgo: 1,
  }),
  claimOf({
    id: "demo-claim-joana",
    name: "Joana Matos",
    payerName: "Joana M.",
    isTrack: true,
    referenceCode: "W3PQ8D",
    createdDaysAgo: 3,
  }),
  claimOf({
    id: "demo-claim-rui",
    name: "Rui Alves",
    payerName: "R Alves",
    isTrack: false,
    referenceCode: "N6CR2G",
    createdDaysAgo: 6,
  }),
];

export const DEMO_SALE_BUYER_NAMES = [
  "Ana Lopes",
  "Tomás Reis",
  "Carla Pinto",
  "Bea Nunes",
  "Diogo Faria",
  "Marta Sousa",
  "Leonor Vaz",
  "Sara Gomes",
  "Hugo Ramos",
  "Filipa Neves",
  "Pedro Lobo",
  "Clara Moniz",
  "Nuno Teles",
  "Rita Prata",
  "Vasco Leal",
  "Alice Mota",
  "Gil Pires",
  "Eva Correia",
  "Luís Sena",
  "Maria Brito",
  "Caio Freitas",
  "Íris Lago",
  "Duarte Melo",
  "Teresa Cunha",
  "Simão Rocha",
  "Joel Matias",
  "Lara Fontes",
  "Zé Cardoso",
];

const DELETED_ACCOUNT_INDEX = 5;
const OFF_WALL_INDEX = 12;
/** Index 3 shows on the wall as Vanda Diesel and index 8 as Rita Ferreira
 *  (no handle, so unlinked). */
const wallPersonaOf = (index: number): string | null =>
  index === 3 ? DEMO_ARTIST_VANDA_DIESEL.id : index === 8 ? RITA_ID : null;

/** Mariana's confirmed sales: even indexes buy the album, odd the track. */
export const marianaSales = (): DemoPurchaseSeed[] =>
  DEMO_SALE_BUYER_NAMES.map((name, index) => {
    const isTrack = index % 2 === 1;
    return {
      id: `demo-sale-${index}`,
      kind: isTrack ? "track" : "release",
      itemId: isTrack ? DEMO_DEFAULT_TRACK_ID : DEMO_DEFAULT_RELEASE_ID,
      artistId: DEMO_ARTIST_MARIANA.id,
      amountCents: isTrack ? 150 : 800,
      referenceCode: `R9${REFERENCE_ALPHABET[index]}${REFERENCE_ALPHABET[(index * 7) % 31]}${REFERENCE_ALPHABET[(index * 11 + 5) % 31]}K`,
      buyer: index === DELETED_ACCOUNT_INDEX ? null : { name },
      status: "confirmed",
      createdDaysAgo: 2 + index * 3,
      decidedDaysAgo: 1 + index * 3,
      isOnWall: index !== DELETED_ACCOUNT_INDEX && index !== OFF_WALL_INDEX,
      shownAsSubprofileId: wallPersonaOf(index),
    };
  });

/** The members who bought Coro de Outubro's single and sit on its wall,
 *  beside the viewer's Late Bloomers entry. */
export const DEMO_CORO_WALL = ["Ana Lopes", "Clara Moniz", "Hugo Ramos"];
export const coroSales = (): DemoPurchaseSeed[] =>
  DEMO_CORO_WALL.map((name, index) => ({
    id: `demo-coro-sale-${index}`,
    kind: "release",
    itemId: "demo-release-home-3",
    artistId: CORO_ID,
    amountCents: 200,
    referenceCode: `C${index + 2}D${index + 4}P${index + 7}`,
    buyer: { name },
    status: "confirmed",
    createdDaysAgo: 21 + index * 10,
    decidedDaysAgo: 20 + index * 10,
    isOnWall: true,
  }));
