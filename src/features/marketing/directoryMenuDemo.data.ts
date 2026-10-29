import type { ListingMenu } from "./listBusiness/listingMenu.data";

/**
 * The demo wine bar's menu (A Farinha): a short plates section and a Wines
 * section split into Red, White and Rosé. Most wines carry a glass and a
 * bottle price, one is only sold by the bottle and one only by the glass.
 */
export const DEMO_WINE_BAR_MENU: ListingMenu = {
  currency: "EUR",
  sections: [
    {
      title: "Small plates",
      items: [
        {
          name: "Pão com manteiga de algas",
          price: "4.50",
          description: "Sourdough from the bakery down the street",
          dietary: ["vegetarian"],
        },
        {
          name: "Cogumelos salteados",
          price: "9.00",
          description: "Wild mushrooms, garlic, a soft egg yolk",
          dietary: ["vegetarian", "glutenFree"],
        },
        {
          name: "Sardinha curada",
          price: "8.50",
          description: "Cured sardine on toasted rye with pickled onion",
          dietary: [],
        },
      ],
      subsections: [],
    },
    {
      title: "Wines",
      items: [],
      subsections: [
        {
          title: "Red",
          items: [
            {
              name: "Dão Tinto, Quinta da Pellada",
              price: "",
              priceGlass: "6.50",
              priceBottle: "28.00",
              description: "Light, peppery and best a little cool",
              dietary: ["vegan"],
            },
            {
              name: "Baga Pet-Nat, Filipa Pato",
              price: "",
              priceBottle: "42.00",
              description: "Lightly sparkling red, bottle only",
              dietary: ["vegan"],
            },
            {
              name: "Douro Tinto, Niepoort Vertente",
              price: "",
              priceGlass: "7.50",
              priceBottle: "34.00",
              description: "",
              dietary: [],
            },
          ],
        },
        {
          title: "White",
          items: [
            {
              name: "Vinho Verde, Aphros Loureiro",
              price: "",
              priceGlass: "5.50",
              priceBottle: "24.00",
              description: "Crisp and just a little salty",
              dietary: ["vegan"],
            },
            {
              name: "Bical Skin Contact, Luís Pato",
              price: "",
              priceGlass: "8.00",
              description: "Amber and grippy, poured by the glass only",
              dietary: [],
            },
          ],
        },
        {
          title: "Rosé",
          items: [
            {
              name: "Rosé de Touriga, Herdade do Rocim",
              price: "",
              priceGlass: "5.00",
              priceBottle: "22.00",
              description: "Pale, dry and made for the terrace",
              dietary: ["vegan"],
            },
            {
              name: "Clarete Alentejano, João Portugal Ramos",
              price: "",
              priceGlass: "6.00",
              priceBottle: "26.50",
              description: "",
              dietary: [],
            },
          ],
        },
      ],
    },
    {
      title: "Without alcohol",
      items: [
        {
          name: "Kombucha da casa",
          price: "4.00",
          description: "Ginger and hibiscus",
          dietary: ["vegan", "alcoholFree"],
        },
        {
          name: "Sumo de maçã prensado",
          price: "3.50",
          description: "",
          dietary: ["vegan", "alcoholFree"],
        },
      ],
      subsections: [],
    },
  ],
  file: null,
  link: "",
};
