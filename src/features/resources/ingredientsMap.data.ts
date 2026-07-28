export interface Spot {
  name: string;
  findsKey: string;
  originKey: string;
  hoursKey: string;
}

export interface MapArea {
  neighbourhoodKey: string;
  anchorId: string;
  spots: Spot[];
}

export const AREAS: MapArea[] = [
  {
    neighbourhoodKey: "resources:ingredientsMap.hood.mourariaIntendente",
    anchorId: "mouraria",
    spots: [
      {
        name: "Mercearia Sol Nascente",
        findsKey: "resources:ingredientsMap.spot.mercearia.finds",
        originKey: "resources:ingredientsMap.spot.mercearia.origin",
        hoursKey: "resources:ingredientsMap.spot.mercearia.hours",
      },
      {
        name: "Loja Bengali",
        findsKey: "resources:ingredientsMap.spot.lojaBengali.finds",
        originKey: "resources:ingredientsMap.spot.lojaBengali.origin",
        hoursKey: "resources:ingredientsMap.spot.lojaBengali.hours",
      },
      {
        name: "Tropical Martim Moniz",
        findsKey: "resources:ingredientsMap.spot.tropical.finds",
        originKey: "resources:ingredientsMap.spot.tropical.origin",
        hoursKey: "resources:ingredientsMap.spot.tropical.hours",
      },
    ],
  },
  {
    neighbourhoodKey: "resources:ingredientsMap.hood.anjosArroios",
    anchorId: "anjos",
    spots: [
      {
        name: "Padaria Cabo-Verdiana",
        findsKey: "resources:ingredientsMap.spot.padaria.finds",
        originKey: "resources:ingredientsMap.spot.padaria.origin",
        hoursKey: "resources:ingredientsMap.spot.padaria.hours",
      },
      {
        name: "Mercado de Arroios stalls",
        findsKey: "resources:ingredientsMap.spot.mercado.finds",
        originKey: "resources:ingredientsMap.spot.mercado.origin",
        hoursKey: "resources:ingredientsMap.spot.mercado.hours",
      },
    ],
  },
  {
    neighbourhoodKey: "resources:ingredientsMap.hood.marvilaBeato",
    anchorId: "marvila",
    spots: [
      {
        name: "Asia Market Marvila",
        findsKey: "resources:ingredientsMap.spot.asiaMarket.finds",
        originKey: "resources:ingredientsMap.spot.asiaMarket.origin",
        hoursKey: "resources:ingredientsMap.spot.asiaMarket.hours",
      },
    ],
  },
];
