/**
 * Demo copy of the "Screen icons: spin the wheel" wheel template. The backend seeds the
 * same pack as a draft in AddQuizshowWheelTemplates1840100000000; keep the two
 * identical.
 */
import { QUIZSHOW_DEMO_WHEEL_TEMPLATE_IDS } from "./quizshowDemoWheelTemplateIds";
import type { QuizshowDemoWheelPack } from "./quizshowDemoWheelPack";

export const SCREEN_ICONS_WHEEL_PACK: QuizshowDemoWheelPack = {
  id: QUIZSHOW_DEMO_WHEEL_TEMPLATE_IDS.screenIcons,
  card: {
    title: {
      en: "Screen icons: spin the wheel",
      pt: "Ícones do ecrã: gira a roda",
    },
    description: {
      en: "Queer film and the screen legends we adore: award nights, sets, characters, directors and numbers, plus a Lie Detector twist, and a wheel picks the category for every question",
      pt: "Cinema queer e as lendas do ecrã que adoramos: prémios, bastidores, personagens, realizadores e números, com um Detetor de Mentiras pelo meio, e uma roda escolhe a categoria de cada pergunta",
    },
  },
  staffNotes:
    "Round 1, question 1: Guinness World Records 'most consecutive Best Actor Oscar wins' and faroutmagazine.co.uk: Tom Hanks won Best Actor for Philadelphia (1994 ceremony) and Forrest Gump (1995 ceremony)\nRound 1, question 2: Guinness World Records 'Oldest Oscar winner' and TheWrap / ET Online, March 2018: James Ivory won Best Adapted Screenplay for Call Me by Your Name at 89, the oldest competitive Oscar winner on record at the time (beating Ennio Morricone, 87). PT title 'Chama-me pelo Teu Nome' (Público Cinecartaz)\nRound 1, question 3: Wikipedia 'A Fantastic Woman' and MercoPress 5 March 2018: first Chilean winner of Best Foreign Language Film (Chile's earlier Oscar was Bear Story, animated short, 2016)\nRound 1, question 4: Wikipedia 'Teddy Award' winners table and teddyaward.tv archive: the first Teddy (1987) Best Feature Film went to Almodóvar's Law of Desire; the only other 1987 Teddy went to Gus Van Sant's shorts (kept out of the options). Jarman (1988), von Praunheim (1990) and Ozon (2000) won in later years\nRound 1, question 5: festival-cannes.com 'Happy Together' and SCMP: Wong Kar-wai won Best Director at Cannes 1997 for Happy Together. Portugal titles: 'Disponível para Amar' (Cinema Trindade, JustWatch PT, Leopardo Filmes) and 'Felizes Juntos' (Cinema Trindade, Teatro Municipal do Porto, Time Out Lisboa); Chungking Express keeps its title in Portugal (pt.wikipedia)\nRound 2, question 1: Wikipedia 'Call Me by Your Name (film)' and movie-locations.com: shot mainly in Crema, Lombardy, May to June 2016 (villa in nearby Moscazzano)\nRound 2, question 2: Wikipedia 'Weekend (2011 film)', Screen Daily Oct 2010 and Filmmaker Magazine interview: shot on location in Nottingham\nRound 2, question 3: Wikipedia 'Fire Island (film)' and NPR Fresh Air 27 June 2022: Joel Kim Booster's film is a modern retelling of Jane Austen's Pride and Prejudice. Portugal title 'Fire Island: Orgulho & Sedução' (JustWatch PT, Disney+)\nRound 2, question 4: Country & Town House, Homes & Gardens, ITV News Anglia Feb 2024: Saltburn's estate is Drayton House, Lowick, Northamptonshire\nRound 2, question 5: Wikipedia 'Ruby slippers' and Mental Floss: in Baum's 1900 book the shoes are silver; MGM made them ruby for Technicolor (statement is FALSE)\nRound 3, question 1: Wikipedia 'The Adventures of Priscilla, Queen of the Desert' and TV Insider cast list: Terence Stamp plays Bernadette Bassenger. Portugal title 'Priscilla, a Rainha do Deserto' (Público Cinecartaz; JustWatch PT lists it without the article)\nRound 3, question 2: Wikipedia 'Some Like It Hot' cast list and Rotten Tomatoes: Jack Lemmon plays Jerry/Daphne, Tony Curtis plays Joe/Josephine. Portugal title 'Quanto Mais Quente Melhor' (Público Cinecartaz)\nRound 3, question 3: Roger Ebert review and Wikipedia 'The Birdcage': Nathan Lane plays Albert, Robin Williams plays Armand. PT title 'Casa de Doidas' (pt.wikipedia infobox, prt)\nRound 3, question 4: Wikipedia 'Death Becomes Her' and AFI Catalog: Meryl Streep plays Madeline Ashton, Goldie Hawn plays Helen Sharp (statement is FALSE). Portugal title 'A Morte Fica-Vos Tão Bem' (pt.wikipedia)\nRound 3, question 5: Wikipedia 'Love, Simon' and Elite Daily: Bram Greenfeld (Keiynan Lonsdale) is revealed as Blue. Portugal title 'Com Amor, Simon' (pt.wikipedia)\nRound 4, question 1: Wikipedia 'Milk (2008 American film)' and 'List of accolades received by Milk': directed by Gus Van Sant\nRound 4, question 2: Wikipedia 'John Waters' and American University library guide: Waters directed Divine in Pink Flamingos (1972), Female Trouble (1974) and Hairspray (1988). Portugal title of Hairspray (1988) is 'Laca' (Público Cinecartaz, pt.wikipedia)\nRound 4, question 3: BFI 'Blue at 30: remembering Derek Jarman's final film' and Walker Art Center: Blue is a single unchanging International Klein Blue image for the whole film (statement is TRUE)\nRound 4, question 4: Wikipedia 'Weekend (2011 film)' and 'All of Us Strangers', Criterion: both written and directed by Andrew Haigh. All of Us Strangers went straight to Disney+ in Portugal as 'Desconhecidos' (Magazine HD, JustWatch PT); Weekend kept its title in Portugal (DN, Queer Lisboa 16 opening film)\nRound 4, question 5: Criterion Channel and TCM 'Velvet Goldmine': 1998 glam rock film directed by Todd Haynes with Ewan McGregor and Jonathan Rhys Meyers. Portugal titles 'Velvet Goldmine' and 'Hedwig - A Origem do Amor' (Público Cinecartaz)\nRound 5, question 1: Wikipedia 'The Rocky Horror Picture Show' and Click Americana: released 14 August 1975 (London)\nRound 5, question 2: Judy Garland born 10 June 1922 (Wikipedia 'Judy Garland'); The Wizard of Oz opened in August 1939 (Wikipedia 'The Wizard of Oz (1939 film)'), so she was 17. PT title 'O Feiticeiro de Oz'\nRound 5, question 3: release years from Wikipedia: Some Like It Hot 1959, Mommie Dearest Sept 1981, Priscilla Aug 1994, Pride Sept 2014, Saltburn 2023. Portugal titles 'Quanto Mais Quente Melhor', 'Priscilla, a Rainha do Deserto' and 'Orgulho' (Público Cinecartaz), 'Queridíssima Mamã' (pt.wikipedia)\nRound 5, question 4: TCM 'Cabaret (1972)' and Library of Congress blog: Cabaret won 8 Oscars, incl. Best Actress for Liza Minnelli\nRound 5, question 5: Slashfilm Sundance 2015 report and American Cinematographer (theasc.com): Tangerine was shot on iPhone 5s phones and the filmmakers bought three for the shoot (two filmed at a time)\nRound 6, question 1: Wikipedia 'American Express Gold Card dress' and The Virginian-Pilot 29 March 1995: Lizzy Gardiner wore a dress of 254 gold American Express cards to collect her Priscilla costume Oscar\nRound 6, question 2: Wikipedia 'Joan Crawford' and 'Alfred Steele': after Steele died in 1959 Crawford was elected to the Pepsi-Cola board, retiring in 1973\nRound 6, question 3: Wikipedia 'Terry (dog)' and NPR 25 Aug 2014 'How Terry the terrier became Toto': the dog who played Toto was a female Cairn Terrier named Terry",
  quiz: {
    title: "Screen icons: spin the wheel",
    languages: "both",
    screenLanguage: "en",
    rounds: [
      {
        kind: "wheel",
        title: {
          en: "",
          pt: "",
        },
        contentLabel: "none",
        settings: {
          timeLimitSeconds: 20,
          isSpeedBonusOn: true,
          isJokerAllowed: true,
          writeSeconds: 60,
          voteSeconds: 30,
          wheelBonus: 0,
          wheelPick: "question",
          sliceCount: null,
        },
        questions: [],
      },
      {
        kind: "quiz",
        title: {
          en: "Awards night",
          pt: "Noite de prémios",
        },
        contentLabel: "none",
        settings: {
          timeLimitSeconds: 20,
          isSpeedBonusOn: true,
          isJokerAllowed: true,
          writeSeconds: 60,
          voteSeconds: 30,
          wheelBonus: 250,
          wheelPick: "round",
          sliceCount: null,
        },
        questions: [
          {
            type: "multiple_choice",
            prompt: {
              en: "Tom Hanks won Best Actor for Philadelphia. For which film did he win it again the very next year?",
              pt: "Tom Hanks ganhou o Óscar de Melhor Ator por Filadélfia. Com que filme voltou a ganhá-lo logo no ano seguinte?",
            },
            options: [
              {
                id: "a",
                text: {
                  en: "Apollo 13",
                  pt: "Apollo 13",
                },
              },
              {
                id: "b",
                text: {
                  en: "Forrest Gump",
                  pt: "Forrest Gump",
                },
              },
              {
                id: "c",
                text: {
                  en: "Big",
                  pt: "Big",
                },
              },
              {
                id: "d",
                text: {
                  en: "Cast Away",
                  pt: "O Náufrago",
                },
              },
            ],
            answer: {
              correctIndex: 1,
            },
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: null,
            points: 1000,
          },
          {
            type: "type_answer",
            prompt: {
              en: "At 89, who became the oldest competitive Oscar winner on record at the time, for adapting Call Me by Your Name?",
              pt: "Aos 89 anos, quem se tornou a pessoa mais velha de sempre a ganhar um Óscar competitivo, até então, pela adaptação de Chama-me pelo Teu Nome?",
            },
            options: [],
            answer: {
              text: {
                en: "James Ivory",
                pt: "James Ivory",
              },
            },
            acceptedAnswers: ["Ivory", "James Ivory", "Jim Ivory", "J. Ivory"],
            mediaRef: null,
            timeLimitSeconds: 25,
            points: 2000,
          },
          {
            type: "true_false",
            prompt: {
              en: "A Fantastic Woman won Chile its first Oscar for Best Foreign Language Film",
              pt: "Uma Mulher Fantástica deu ao Chile o seu primeiro Óscar de Melhor Filme Estrangeiro",
            },
            options: [],
            answer: {
              isTrue: true,
            },
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: null,
            points: 1000,
          },
          {
            type: "multiple_choice",
            prompt: {
              en: "The very first Teddy Award at the Berlin film festival, in 1987, went to Law of Desire. Who directed it?",
              pt: "O primeiro Teddy Award de sempre, no festival de cinema de Berlim em 1987, foi para A Lei do Desejo. Quem o realizou?",
            },
            options: [
              {
                id: "a",
                text: {
                  en: "Derek Jarman",
                  pt: "Derek Jarman",
                },
              },
              {
                id: "b",
                text: {
                  en: "Rosa von Praunheim",
                  pt: "Rosa von Praunheim",
                },
              },
              {
                id: "c",
                text: {
                  en: "Pedro Almodóvar",
                  pt: "Pedro Almodóvar",
                },
              },
              {
                id: "d",
                text: {
                  en: "François Ozon",
                  pt: "François Ozon",
                },
              },
            ],
            answer: {
              correctIndex: 2,
            },
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: null,
            points: 1000,
          },
          {
            type: "multiple_choice",
            prompt: {
              en: "Wong Kar-wai won Best Director at Cannes in 1997. For which film?",
              pt: "Wong Kar-wai ganhou o prémio de Melhor Realizador em Cannes em 1997. Com que filme?",
            },
            options: [
              {
                id: "a",
                text: {
                  en: "In the Mood for Love",
                  pt: "Disponível para Amar",
                },
              },
              {
                id: "b",
                text: {
                  en: "Chungking Express",
                  pt: "Chungking Express",
                },
              },
              {
                id: "c",
                text: {
                  en: "2046",
                  pt: "2046",
                },
              },
              {
                id: "d",
                text: {
                  en: "Happy Together",
                  pt: "Felizes Juntos",
                },
              },
            ],
            answer: {
              correctIndex: 3,
            },
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: null,
            points: 1000,
          },
        ],
      },
      {
        kind: "quiz",
        title: {
          en: "Behind the scenes",
          pt: "Bastidores",
        },
        contentLabel: "none",
        settings: {
          timeLimitSeconds: 20,
          isSpeedBonusOn: true,
          isJokerAllowed: true,
          writeSeconds: 60,
          voteSeconds: 30,
          wheelBonus: 0,
          wheelPick: "round",
          sliceCount: null,
        },
        questions: [
          {
            type: "multiple_choice",
            prompt: {
              en: "Call Me by Your Name was mainly shot in and around which small Lombardy town?",
              pt: "Chama-me Pelo Teu Nome foi filmado sobretudo dentro e à volta de que pequena cidade da Lombardia?",
            },
            options: [
              {
                id: "a",
                text: {
                  en: "Crema",
                  pt: "Crema",
                },
              },
              {
                id: "b",
                text: {
                  en: "Como",
                  pt: "Como",
                },
              },
              {
                id: "c",
                text: {
                  en: "Verona",
                  pt: "Verona",
                },
              },
              {
                id: "d",
                text: {
                  en: "Mantua",
                  pt: "Mântua",
                },
              },
            ],
            answer: {
              correctIndex: 0,
            },
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: null,
            points: 1000,
          },
          {
            type: "true_false",
            prompt: {
              en: "Andrew Haigh's Weekend (2011) was shot on location in Nottingham",
              pt: "Weekend (2011), de Andrew Haigh, foi filmado em Nottingham",
            },
            options: [],
            answer: {
              isTrue: true,
            },
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: null,
            points: 1000,
          },
          {
            type: "type_answer",
            prompt: {
              en: "Fire Island (2022) is a modern queer retelling of which Jane Austen novel?",
              pt: "Fire Island: Orgulho & Sedução (2022) é uma versão queer e moderna de que romance de Jane Austen?",
            },
            options: [],
            answer: {
              text: {
                en: "Pride and Prejudice",
                pt: "Orgulho e Preconceito",
              },
            },
            acceptedAnswers: [
              "Pride and Prejudice",
              "Pride & Prejudice",
              "Pride and Predjudice",
              "Orgulho e Preconceito",
              "Orgulho e Preconceitos",
            ],
            mediaRef: null,
            timeLimitSeconds: 25,
            points: 1000,
          },
          {
            type: "multiple_choice",
            prompt: {
              en: "Which English stately home played the Saltburn estate in Emerald Fennell's film?",
              pt: "Que mansão inglesa fez de propriedade de Saltburn no filme de Emerald Fennell?",
            },
            options: [
              {
                id: "a",
                text: {
                  en: "Highclere Castle",
                  pt: "Highclere Castle",
                },
              },
              {
                id: "b",
                text: {
                  en: "Castle Howard",
                  pt: "Castle Howard",
                },
              },
              {
                id: "c",
                text: {
                  en: "Drayton House",
                  pt: "Drayton House",
                },
              },
              {
                id: "d",
                text: {
                  en: "Chatsworth House",
                  pt: "Chatsworth House",
                },
              },
            ],
            answer: {
              correctIndex: 2,
            },
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: null,
            points: 2000,
          },
          {
            type: "true_false",
            prompt: {
              en: "In L. Frank Baum's original book, Dorothy's magic shoes are ruby red",
              pt: "No livro original de L. Frank Baum, os sapatos mágicos da Dorothy são vermelho-rubi",
            },
            options: [],
            answer: {
              isTrue: false,
            },
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: null,
            points: 1000,
          },
        ],
      },
      {
        kind: "quiz",
        title: {
          en: "Characters",
          pt: "Personagens",
        },
        contentLabel: "none",
        settings: {
          timeLimitSeconds: 20,
          isSpeedBonusOn: true,
          isJokerAllowed: true,
          writeSeconds: 60,
          voteSeconds: 30,
          wheelBonus: 0,
          wheelPick: "round",
          sliceCount: null,
        },
        questions: [
          {
            type: "multiple_choice",
            prompt: {
              en: "Which character does Terence Stamp play in Priscilla, Queen of the Desert?",
              pt: "Que personagem interpreta Terence Stamp em Priscilla, a Rainha do Deserto?",
            },
            options: [
              {
                id: "a",
                text: {
                  en: "Felicia",
                  pt: "Felicia",
                },
              },
              {
                id: "b",
                text: {
                  en: "Mitzi",
                  pt: "Mitzi",
                },
              },
              {
                id: "c",
                text: {
                  en: "Priscilla",
                  pt: "Priscilla",
                },
              },
              {
                id: "d",
                text: {
                  en: "Bernadette",
                  pt: "Bernadette",
                },
              },
            ],
            answer: {
              correctIndex: 3,
            },
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: null,
            points: 1000,
          },
          {
            type: "multiple_choice",
            prompt: {
              en: "In Some Like It Hot, what name does Jack Lemmon's Jerry go by in the all-girl band?",
              pt: "Em Quanto Mais Quente Melhor, que nome usa o Jerry de Jack Lemmon na banda só de raparigas?",
            },
            options: [
              {
                id: "a",
                text: {
                  en: "Daphne",
                  pt: "Daphne",
                },
              },
              {
                id: "b",
                text: {
                  en: "Josephine",
                  pt: "Josephine",
                },
              },
              {
                id: "c",
                text: {
                  en: "Sugar",
                  pt: "Sugar",
                },
              },
              {
                id: "d",
                text: {
                  en: "Roberta",
                  pt: "Roberta",
                },
              },
            ],
            answer: {
              correctIndex: 0,
            },
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: null,
            points: 1000,
          },
          {
            type: "multiple_choice",
            prompt: {
              en: "Who plays Albert, the drag star of the club, in The Birdcage (1996)?",
              pt: "Quem interpreta Albert, a estrela drag do clube, em Casa de Doidas (1996)?",
            },
            options: [
              {
                id: "a",
                text: {
                  en: "Robin Williams",
                  pt: "Robin Williams",
                },
              },
              {
                id: "b",
                text: {
                  en: "Nathan Lane",
                  pt: "Nathan Lane",
                },
              },
              {
                id: "c",
                text: {
                  en: "Gene Hackman",
                  pt: "Gene Hackman",
                },
              },
              {
                id: "d",
                text: {
                  en: "Hank Azaria",
                  pt: "Hank Azaria",
                },
              },
            ],
            answer: {
              correctIndex: 1,
            },
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: null,
            points: 1000,
          },
          {
            type: "true_false",
            prompt: {
              en: "In Death Becomes Her, Meryl Streep's character is called Helen Sharp",
              pt: "Em A Morte Fica-Vos Tão Bem, a personagem de Meryl Streep chama-se Helen Sharp",
            },
            options: [],
            answer: {
              isTrue: false,
            },
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: null,
            points: 1000,
          },
          {
            type: "type_answer",
            prompt: {
              en: "In Love, Simon, which classmate turns out to be Blue, Simon's secret pen pal?",
              pt: "Em Com Amor, Simon, que colega de escola se revela ser o Blue, o correspondente secreto do Simon?",
            },
            options: [],
            answer: {
              text: {
                en: "Bram",
                pt: "Bram",
              },
            },
            acceptedAnswers: [
              "Bram",
              "Bram Greenfeld",
              "Greenfeld",
              "Bram Greenfield",
            ],
            mediaRef: null,
            timeLimitSeconds: 25,
            points: 1000,
          },
        ],
      },
      {
        kind: "quiz",
        title: {
          en: "Directors",
          pt: "Realizadores",
        },
        contentLabel: "none",
        settings: {
          timeLimitSeconds: 20,
          isSpeedBonusOn: true,
          isJokerAllowed: true,
          writeSeconds: 60,
          voteSeconds: 30,
          wheelBonus: 250,
          wheelPick: "round",
          sliceCount: null,
        },
        questions: [
          {
            type: "multiple_choice",
            prompt: {
              en: "Who directed Milk (2008), starring Sean Penn as Harvey Milk?",
              pt: "Quem realizou Milk (2008), com Sean Penn no papel de Harvey Milk?",
            },
            options: [
              {
                id: "a",
                text: {
                  en: "Todd Haynes",
                  pt: "Todd Haynes",
                },
              },
              {
                id: "b",
                text: {
                  en: "Jonathan Demme",
                  pt: "Jonathan Demme",
                },
              },
              {
                id: "c",
                text: {
                  en: "Gus Van Sant",
                  pt: "Gus Van Sant",
                },
              },
              {
                id: "d",
                text: {
                  en: "Ang Lee",
                  pt: "Ang Lee",
                },
              },
            ],
            answer: {
              correctIndex: 2,
            },
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: null,
            points: 1000,
          },
          {
            type: "type_answer",
            prompt: {
              en: "Which Baltimore director cast Divine in Pink Flamingos, Female Trouble and Hairspray?",
              pt: "Que realizador de Baltimore escolheu Divine para Pink Flamingos, Female Trouble e Laca (Hairspray)?",
            },
            options: [],
            answer: {
              text: {
                en: "John Waters",
                pt: "John Waters",
              },
            },
            acceptedAnswers: ["Waters", "John Waters", "Jon Waters"],
            mediaRef: null,
            timeLimitSeconds: 25,
            points: 1000,
          },
          {
            type: "true_false",
            prompt: {
              en: "Derek Jarman's final feature, Blue (1993), shows one unchanging shade of blue for its whole running time",
              pt: "A última longa-metragem de Derek Jarman, Blue (1993), mostra um único tom de azul do princípio ao fim",
            },
            options: [],
            answer: {
              isTrue: true,
            },
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: null,
            points: 1000,
          },
          {
            type: "multiple_choice",
            prompt: {
              en: "Which director made both Weekend (2011) and All of Us Strangers (2023)?",
              pt: "Que realizador fez Weekend (2011) e Desconhecidos (2023)?",
            },
            options: [
              {
                id: "a",
                text: {
                  en: "Andrew Haigh",
                  pt: "Andrew Haigh",
                },
              },
              {
                id: "b",
                text: {
                  en: "Francis Lee",
                  pt: "Francis Lee",
                },
              },
              {
                id: "c",
                text: {
                  en: "Luca Guadagnino",
                  pt: "Luca Guadagnino",
                },
              },
              {
                id: "d",
                text: {
                  en: "Stephen Daldry",
                  pt: "Stephen Daldry",
                },
              },
            ],
            answer: {
              correctIndex: 0,
            },
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: null,
            points: 1000,
          },
          {
            type: "multiple_choice",
            prompt: {
              en: "Todd Haynes directed which 1998 glam rock film with Ewan McGregor and Jonathan Rhys Meyers?",
              pt: "Todd Haynes realizou que filme de glam rock de 1998, com Ewan McGregor e Jonathan Rhys Meyers?",
            },
            options: [
              {
                id: "a",
                text: {
                  en: "Rocketman",
                  pt: "Rocketman",
                },
              },
              {
                id: "b",
                text: {
                  en: "Velvet Goldmine",
                  pt: "Velvet Goldmine",
                },
              },
              {
                id: "c",
                text: {
                  en: "Hedwig and the Angry Inch",
                  pt: "Hedwig: A Origem do Amor",
                },
              },
              {
                id: "d",
                text: {
                  en: "Bohemian Rhapsody",
                  pt: "Bohemian Rhapsody",
                },
              },
            ],
            answer: {
              correctIndex: 1,
            },
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: null,
            points: 1000,
          },
        ],
      },
      {
        kind: "quiz",
        title: {
          en: "By the numbers",
          pt: "Em números",
        },
        contentLabel: "none",
        settings: {
          timeLimitSeconds: 20,
          isSpeedBonusOn: true,
          isJokerAllowed: true,
          writeSeconds: 60,
          voteSeconds: 30,
          wheelBonus: 500,
          wheelPick: "round",
          sliceCount: null,
        },
        questions: [
          {
            type: "closest_number",
            prompt: {
              en: "In what year was The Rocky Horror Picture Show released?",
              pt: "Em que ano estreou The Rocky Horror Picture Show?",
            },
            options: [],
            answer: {
              value: 1975,
            },
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: null,
            points: 1000,
          },
          {
            type: "closest_number",
            prompt: {
              en: "How old was Judy Garland when The Wizard of Oz opened in cinemas in August 1939?",
              pt: "Que idade tinha Judy Garland quando O Feiticeiro de Oz estreou nos cinemas, em agosto de 1939?",
            },
            options: [],
            answer: {
              value: 17,
            },
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: null,
            points: 1000,
          },
          {
            type: "order",
            prompt: {
              en: "Put these films in order of release, earliest first",
              pt: "Põe estes filmes por ordem de estreia, do mais antigo para o mais recente",
            },
            options: [
              {
                id: "a",
                text: {
                  en: "Pride",
                  pt: "Orgulho",
                },
              },
              {
                id: "b",
                text: {
                  en: "Some Like It Hot",
                  pt: "Quanto Mais Quente Melhor",
                },
              },
              {
                id: "c",
                text: {
                  en: "Saltburn",
                  pt: "Saltburn",
                },
              },
              {
                id: "d",
                text: {
                  en: "Priscilla, Queen of the Desert",
                  pt: "Priscilla, a Rainha do Deserto",
                },
              },
              {
                id: "e",
                text: {
                  en: "Mommie Dearest",
                  pt: "Queridíssima Mamã",
                },
              },
            ],
            answer: {
              orderedIds: ["b", "e", "d", "a", "c"],
            },
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: 30,
            points: 1000,
          },
          {
            type: "closest_number",
            prompt: {
              en: "How many Oscars did Cabaret (1972), starring Liza Minnelli, win?",
              pt: "Quantos Óscares ganhou Cabaret (1972), com Liza Minnelli?",
            },
            options: [],
            answer: {
              value: 8,
            },
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: null,
            points: 1000,
          },
          {
            type: "closest_number",
            prompt: {
              en: "Tangerine (2015) was shot on iPhone 5s phones. How many did the filmmakers buy for the shoot?",
              pt: "Tangerine (2015) foi filmado com iPhones 5s. Quantos comprou a equipa para a rodagem?",
            },
            options: [],
            answer: {
              value: 3,
            },
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: null,
            points: 1000,
          },
        ],
      },
      {
        kind: "lie_detector",
        title: {
          en: "Lie Detector",
          pt: "Detetor de mentiras",
        },
        contentLabel: "none",
        settings: {
          timeLimitSeconds: 20,
          isSpeedBonusOn: true,
          isJokerAllowed: true,
          writeSeconds: 60,
          voteSeconds: 30,
          wheelBonus: 0,
          wheelPick: "round",
          sliceCount: null,
        },
        questions: [
          {
            type: "prompt",
            prompt: {
              en: "Priscilla's costume designer Lizzy Gardiner collected her Oscar in a dress made of what?",
              pt: "A figurinista de Priscilla, Lizzy Gardiner, foi buscar o Óscar com um vestido feito de quê?",
            },
            options: [],
            answer: {
              truth: {
                en: "Gold American Express cards",
                pt: "Cartões American Express dourados",
              },
            },
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: null,
            points: 1000,
          },
          {
            type: "prompt",
            prompt: {
              en: "After her husband died in 1959, Joan Crawford joined the board of directors of which company?",
              pt: "Depois de o marido morrer em 1959, Joan Crawford entrou para o conselho de administração de que empresa?",
            },
            options: [],
            answer: {
              truth: {
                en: "Pepsi-Cola",
                pt: "Pepsi-Cola",
              },
            },
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: null,
            points: 1000,
          },
          {
            type: "prompt",
            prompt: {
              en: "What was the real name of the dog who played Toto in The Wizard of Oz?",
              pt: "Qual era o verdadeiro nome da cadela que fez de Toto em O Feiticeiro de Oz?",
            },
            options: [],
            answer: {
              truth: {
                en: "Terry",
                pt: "Terry",
              },
            },
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: null,
            points: 1000,
          },
        ],
      },
    ],
  },
};
