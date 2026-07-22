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
    labelKey: "resources:accessibleLisbon.group.routes.label",
    introKey: "resources:accessibleLisbon.group.routes.intro",
    places: [
      {
        name: "Parque das Nações riverside",
        detailKey: "resources:accessibleLisbon.place.parqueNacoes.detail",
        flagKeys: [
          "resources:accessibleLisbon.flag.7km",
          "resources:accessibleLisbon.flag.tarmac",
          "resources:accessibleLisbon.flag.stepFree",
        ],
      },
      {
        name: "Belém to Algés waterfront",
        detailKey: "resources:accessibleLisbon.place.belemAlges.detail",
        flagKeys: [
          "resources:accessibleLisbon.flag.5km",
          "resources:accessibleLisbon.flag.flat",
          "resources:accessibleLisbon.flag.turnBackAnywhere",
        ],
      },
      {
        name: "Alameda to Gulbenkian gardens",
        detailKey: "resources:accessibleLisbon.place.alamedaGulbenkian.detail",
        flagKeys: [
          "resources:accessibleLisbon.flag.4km",
          "resources:accessibleLisbon.flag.mostlyLevel",
        ],
      },
    ],
  },
  {
    id: "venues",
    labelKey: "resources:accessibleLisbon.group.venues.label",
    introKey: "resources:accessibleLisbon.group.venues.intro",
    places: [
      {
        name: "Arquivo, Príncipe Real",
        detailKey: "resources:accessibleLisbon.place.arquivo.detail",
        flagKeys: [
          "resources:accessibleLisbon.flag.stepFree",
          "resources:accessibleLisbon.flag.lowNoise",
          "resources:accessibleLisbon.flag.seated",
        ],
      },
      {
        name: "Maria Caxuxa, Intendente",
        detailKey: "resources:accessibleLisbon.place.mariaCaxuxa.detail",
        flagKeys: [
          "resources:accessibleLisbon.flag.stepFree",
          "resources:accessibleLisbon.flag.hearingLoop",
          "resources:accessibleLisbon.flag.accessibleWc",
        ],
      },
      {
        name: "Heim, Arroios",
        detailKey: "resources:accessibleLisbon.place.heim.detail",
        flagKeys: [
          "resources:accessibleLisbon.flag.rampOnRequest",
          "resources:accessibleLisbon.flag.lowMusic",
        ],
      },
      {
        name: "Cervejaria Trindade, Chiado",
        detailKey: "resources:accessibleLisbon.place.trindade.detail",
        flagKeys: [
          "resources:accessibleLisbon.flag.stepFreeEntrance",
          "resources:accessibleLisbon.flag.quietBackRoom",
        ],
      },
    ],
  },
  {
    id: "family",
    labelKey: "resources:accessibleLisbon.group.family.label",
    introKey: "resources:accessibleLisbon.group.family.intro",
    places: [
      {
        name: "Jardim da Estrela",
        detailKey: "resources:accessibleLisbon.place.jardimEstrela.detail",
        flagKeys: [
          "resources:accessibleLisbon.flag.playground",
          "resources:accessibleLisbon.flag.stepFree",
          "resources:accessibleLisbon.flag.toilets",
        ],
      },
      {
        name: "Parque Eduardo VII (lower lawns)",
        detailKey: "resources:accessibleLisbon.place.eduardoVii.detail",
        flagKeys: [
          "resources:accessibleLisbon.flag.buggyFriendly",
          "resources:accessibleLisbon.flag.openSpace",
        ],
      },
      {
        name: "Gulbenkian gardens",
        detailKey: "resources:accessibleLisbon.place.gulbenkianGardens.detail",
        flagKeys: [
          "resources:accessibleLisbon.flag.shaded",
          "resources:accessibleLisbon.flag.smoothPaths",
          "resources:accessibleLisbon.flag.calm",
        ],
      },
    ],
  },
];
