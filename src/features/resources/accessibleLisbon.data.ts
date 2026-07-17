export interface Place {
  name: string;
  detailKey: string;
  flagKeys: string[];
}

export interface PlaceGroup {
  id: string;
  labelKey: string;
  introKey: string;
  places: Place[];
}

export const GROUPS: PlaceGroup[] = [
  {
    id: "routes",
    labelKey: "accessibleLisbon.group.routes.label",
    introKey: "accessibleLisbon.group.routes.intro",
    places: [
      {
        name: "Parque das Nações riverside",
        detailKey: "accessibleLisbon.place.parqueNacoes.detail",
        flagKeys: [
          "accessibleLisbon.flag.7km",
          "accessibleLisbon.flag.tarmac",
          "accessibleLisbon.flag.stepFree",
        ],
      },
      {
        name: "Belém to Algés waterfront",
        detailKey: "accessibleLisbon.place.belemAlges.detail",
        flagKeys: [
          "accessibleLisbon.flag.5km",
          "accessibleLisbon.flag.flat",
          "accessibleLisbon.flag.turnBackAnywhere",
        ],
      },
      {
        name: "Alameda to Gulbenkian gardens",
        detailKey: "accessibleLisbon.place.alamedaGulbenkian.detail",
        flagKeys: [
          "accessibleLisbon.flag.4km",
          "accessibleLisbon.flag.mostlyLevel",
        ],
      },
    ],
  },
  {
    id: "venues",
    labelKey: "accessibleLisbon.group.venues.label",
    introKey: "accessibleLisbon.group.venues.intro",
    places: [
      {
        name: "Arquivo, Príncipe Real",
        detailKey: "accessibleLisbon.place.arquivo.detail",
        flagKeys: [
          "accessibleLisbon.flag.stepFree",
          "accessibleLisbon.flag.lowNoise",
          "accessibleLisbon.flag.seated",
        ],
      },
      {
        name: "Maria Caxuxa, Intendente",
        detailKey: "accessibleLisbon.place.mariaCaxuxa.detail",
        flagKeys: [
          "accessibleLisbon.flag.stepFree",
          "accessibleLisbon.flag.hearingLoop",
          "accessibleLisbon.flag.accessibleWc",
        ],
      },
      {
        name: "Heim, Arroios",
        detailKey: "accessibleLisbon.place.heim.detail",
        flagKeys: [
          "accessibleLisbon.flag.rampOnRequest",
          "accessibleLisbon.flag.lowMusic",
        ],
      },
      {
        name: "Cervejaria Trindade, Chiado",
        detailKey: "accessibleLisbon.place.trindade.detail",
        flagKeys: [
          "accessibleLisbon.flag.stepFreeEntrance",
          "accessibleLisbon.flag.quietBackRoom",
        ],
      },
    ],
  },
  {
    id: "family",
    labelKey: "accessibleLisbon.group.family.label",
    introKey: "accessibleLisbon.group.family.intro",
    places: [
      {
        name: "Jardim da Estrela",
        detailKey: "accessibleLisbon.place.jardimEstrela.detail",
        flagKeys: [
          "accessibleLisbon.flag.playground",
          "accessibleLisbon.flag.stepFree",
          "accessibleLisbon.flag.toilets",
        ],
      },
      {
        name: "Parque Eduardo VII (lower lawns)",
        detailKey: "accessibleLisbon.place.eduardoVii.detail",
        flagKeys: [
          "accessibleLisbon.flag.buggyFriendly",
          "accessibleLisbon.flag.openSpace",
        ],
      },
      {
        name: "Gulbenkian gardens",
        detailKey: "accessibleLisbon.place.gulbenkianGardens.detail",
        flagKeys: [
          "accessibleLisbon.flag.shaded",
          "accessibleLisbon.flag.smoothPaths",
          "accessibleLisbon.flag.calm",
        ],
      },
    ],
  },
];
