/**
 * Demo copy of the "Queer TV night: spin the wheel" wheel template. The backend seeds the
 * same pack as a draft in AddQuizshowWheelTemplates1840100000000; keep the two
 * identical.
 */
import { QUIZSHOW_DEMO_WHEEL_TEMPLATE_IDS } from "./quizshowDemoWheelTemplateIds";
import type { QuizshowDemoWheelPack } from "./quizshowDemoWheelPack";

export const QUEER_TV_NIGHT_WHEEL_PACK: QuizshowDemoWheelPack = {
  id: QUIZSHOW_DEMO_WHEEL_TEMPLATE_IDS.queerTvNight,
  card: {
    title: {
      en: "Queer TV night: spin the wheel",
      pt: "Noite de TV queer: roda a roda",
    },
    description: {
      en: "Sitcoms, reality TV, iconic lines, premiere dates, a Lie Detector round and spin-off pitches, and the wheel decides which round plays next",
      pt: "Sitcoms, reality shows, falas icónicas, datas de estreia, uma ronda de Detetor de Mentiras e ideias de spin-offs, e é a roda que decide a ronda seguinte",
    },
  },
  staffNotes:
    "Round 1, question 1: en.wikipedia.org/wiki/Queer_as_Folk_(British_TV_series): the series follows three gay men in Manchester's gay village around Canal Street\nRound 1, question 2: en.wikipedia.org/wiki/Queer_as_Folk_(British_TV_series) and hollywoodreporter.com (Russell T Davies on It's a Sin): Russell T Davies created Queer as Folk (Channel 4, 1999) and It's a Sin (Channel 4, 2021)\nRound 1, question 3: whats-on-netflix.com and geektown.co.uk (Heartstopper launch coverage, March 2022): the series is based on the graphic novels by Alice Oseman\nRound 1, question 4: en.wikipedia.org/wiki/Johnny_Rose and schitts-creek.fandom.com/wiki/David_Rose: David co-owns Rose Apothecary; Rose Video was Johnny's video rental chain, Rosebud Motel and Cafe Tropical are other town places\nRound 1, question 5: npr.org/2022/01/10/1071828269 and etonline.com: Mj Rodriguez won Best Actress in a TV Drama at the 79th Golden Globes (January 2022) for Blanca in Pose, the first trans actress to win a Golden Globe\nRound 1, question 6: en.wikipedia.org/wiki/Six_Feet_Under_(TV_series): the Fisher family run a funeral home in Los Angeles. PT title Sete Palmos de Terra per rtp.pt/programa/tv/p13799 and infopedia.pt\nRound 2, question 1: en.wikipedia.org/wiki/Queer_Eye_(2003_TV_series): original title Queer Eye for the Straight Guy, premiered on Bravo 15 July 2003\nRound 2, question 2: thewrap.com and mic.com (Netflix Queer Eye cast guides, 2017 to 2018): Jonathan Van Ness grooming, Antoni Porowski food and wine, Tan France fashion, Karamo Brown culture, Bobby Berk design\nRound 2, question 3: en.wikipedia.org/wiki/Big_Brother_(British_TV_series)_series_5 (final week: Nadia 74% to win) and en.wikipedia.org/wiki/Nadia_Almada (from Ribeira Brava, Madeira; 74% in the final two-way vote against Jason); advocate.com 2004 report on her win\nRound 2, question 4: en.wikipedia.org/wiki/Brian_Dowling_(presenter) and irishexaminer.com (Past winner is new Big Brother host): Dowling won series 2 in 2001 and was confirmed as presenter of the Channel 5 revival on 22 July 2011\nRound 2, question 5: en.wikipedia.org/wiki/I_Kissed_a_Boy_(TV_series) and thepinknews.com 2023/03/30: BBC Three dating show hosted by Dannii Minogue, first series from 13 May 2023, set in a masseria in Puglia\nRound 2, question 6: thepinknews.com 2024/01/12 and scottishnews.com: Alan Cumming has hosted The Traitors US since its 2023 launch\nRound 3, question 1: bi.org (the unicorn scale, Schitt's Creek) and identiversity.org (scene transcript) and en.wikipedia.org/wiki/List_of_Schitt's_Creek_episodes: David Rose says \"I like the wine and not the label\" to Stevie in season 1, episode 10 \"Honeymoon\"\nRound 3, question 2: en.wikipedia.org/wiki/Sophia_Petrillo and goodmorningamerica.com (Golden Girls facts): Sophia's trademark story opener is \"Picture it: Sicily, 1922\". PT title Sarilhos com Elas per magazine-hd.com (Disney+ Portugal launch)\nRound 3, question 3: en.wikipedia.org/wiki/Jack_McFarland and en.wikiquote.org (Will & Grace season 1): Jack's one-man shows include Just Jack\nRound 3, question 4: xtramagazine.com (Eleven reasons why Sex Education's Eric Effiong gives us life) and bustle.com (Ncuti Gatwa interview): Eric plays the French horn in the Moordale swing band\nRound 3, question 5: tvinsider.com (Our Flag Means Death trailer) and bellmedia.ca press release: Rhys Darby plays \"Gentleman Pirate\" Stede Bonnet, Taika Waititi plays Blackbeard\nRound 3, question 6: thepinknews.com 2005/10/18 and en.wikipedia.org/wiki/List_of_Torchwood_episodes: Torchwood (2006 to 2011) is a Doctor Who spin-off starring John Barrowman as Captain Jack Harkness\nRound 4, question 1: Will & Grace 21 Sep 1998 (rottentomatoes.com, outhistory.org); Six Feet Under 3 Jun 2001 (en.wikipedia.org/wiki/Six_Feet_Under_(TV_series)); Looking 19 Jan 2014 (tvguide.com, metacritic); Pose 3 Jun 2018 (broadwayworld.com FX press release)\nRound 4, question 2: Skins 25 Jan 2007 (en.wikipedia.org/wiki/Skins_series_1); Glee pilot 19 May 2009 (en.wikipedia.org/wiki/Pilot_(Glee)); Sex Education 11 Jan 2019 (en.wikipedia.org/wiki/Sex_Education_(TV_series)); Heartstopper 22 Apr 2022 (whats-on-netflix.com)\nRound 4, question 3: Absolutely Fabulous 12 Nov 1992 (en.wikipedia.org/wiki/Absolutely_Fabulous_series_1); Queer as Folk US 3 Dec 2000 (en.wikipedia.org/wiki/Queer_as_Folk_(American_TV_series)); Queer Eye for the Straight Guy 15 Jul 2003 (en.wikipedia.org/wiki/Queer_Eye_(2003_TV_series)); Schitt's Creek 2015 (en.wikipedia.org/wiki/List_of_Schitt's_Creek_episodes). PT title Absolutamente Fabulosas per pt.wikipedia.org/wiki/Absolutely_Fabulous (Em Portugal) and justwatch.com/pt\nRound 4, question 4: It's a Sin 22 Jan 2021 (attitude.co.uk premiere date); Somebody Somewhere 16 Jan 2022 (nexttv.com, bostonglobe.com); Our Flag Means Death 3 Mar 2022 (tvline.com, bellmedia.ca); Fellow Travelers 27 Oct 2023 on Paramount+ with Showtime, 29 Oct on Showtime (telltaletv.com, Wikipedia)\nRound 4, question 5: en.wikipedia.org/wiki/Queer_as_Folk_(British_TV_series) and attitude.co.uk: first aired on Channel 4 on 23 February 1999\nRound 4, question 6: en.wikipedia.org/wiki/List_of_Schitt's_Creek_episodes and tvseriesfinale.com: 80 episodes over six seasons, 2015 to 2020\nRound 5, question 1: empireonline.com (Russell T Davies interview), attitude.co.uk (formerly known as Boys) and gaytimes.com: working title Boys, renamed It's a Sin after the Pet Shop Boys song to avoid a clash with Amazon's The Boys. en.wikipedia.org/wiki/It's_a_Sin_(TV_series): first reported in 2018 as The Boys, the working title was clarified in early 2020 as Boys\nRound 5, question 2: en.wikipedia.org/wiki/The_Puppy_Episode and biography.com: an executive suggested Ellen Morgan get a puppy instead, and the writers used The Puppy Episode as the secret working title. Accounts differ on whether it was an ABC executive or Michael Eisner, so the truth says only \"an executive\"\nRound 5, question 3: tvinsider.com/852956 and syfy.com (Dr Clara Mandrake): Moira shoots The Crows Have Eyes III: The Crowening in Bosnia in the season 5 premiere\nRound 5, question 4: en.wikipedia.org/wiki/Modern_Mother_and_Daughter and en.wikipedia.org/wiki/Absolutely_Fabulous: Ab Fab grew out of the 1990 French and Saunders sketch, in which Dawn French played the sensible daughter\nRound 6, question 1: party prompt, no fact to check\nRound 6, question 2: party prompt, no fact to check\nRound 6, question 3: party prompt, no fact to check",
  quiz: {
    title: "Queer TV night: spin the wheel",
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
          wheelPick: "round",
          sliceCount: null,
        },
        questions: [],
      },
      {
        kind: "quiz",
        title: {
          en: "Series and sitcoms",
          pt: "Séries e sitcoms",
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
              en: "Queer as Folk (1999) follows three gay men around Canal Street. Which city is it set in?",
              pt: "Queer as Folk (1999) segue três homens gays à volta da Canal Street. Em que cidade se passa?",
            },
            options: [
              {
                id: "a",
                text: {
                  en: "Leeds",
                  pt: "Leeds",
                },
              },
              {
                id: "b",
                text: {
                  en: "Liverpool",
                  pt: "Liverpool",
                },
              },
              {
                id: "c",
                text: {
                  en: "Manchester",
                  pt: "Manchester",
                },
              },
              {
                id: "d",
                text: {
                  en: "Birmingham",
                  pt: "Birmingham",
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
              en: "Which writer created both Queer as Folk (1999) and It's a Sin (2021)?",
              pt: "Que argumentista criou Queer as Folk (1999) e também It's a Sin (2021)?",
            },
            options: [],
            answer: {
              text: {
                en: "Russell T Davies",
                pt: "Russell T Davies",
              },
            },
            acceptedAnswers: [
              "Russell T Davies",
              "Russell T. Davies",
              "Russell Davies",
              "Davies",
              "RTD",
              "Russell",
            ],
            mediaRef: null,
            timeLimitSeconds: 25,
            points: 1000,
          },
          {
            type: "multiple_choice",
            prompt: {
              en: "Heartstopper is adapted from whose graphic novels?",
              pt: "Heartstopper é adaptada da banda desenhada de quem?",
            },
            options: [
              {
                id: "a",
                text: {
                  en: "Alice Oseman",
                  pt: "Alice Oseman",
                },
              },
              {
                id: "b",
                text: {
                  en: "Becky Albertalli",
                  pt: "Becky Albertalli",
                },
              },
              {
                id: "c",
                text: {
                  en: "Sally Rooney",
                  pt: "Sally Rooney",
                },
              },
              {
                id: "d",
                text: {
                  en: "Casey McQuiston",
                  pt: "Casey McQuiston",
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
              en: "In Schitt's Creek, what is the name of the shop David Rose opens?",
              pt: "Em Schitt's Creek, como se chama a loja que o David Rose abre?",
            },
            options: [
              {
                id: "a",
                text: {
                  en: "Rose Video",
                  pt: "Rose Video",
                },
              },
              {
                id: "b",
                text: {
                  en: "Rose Apothecary",
                  pt: "Rose Apothecary",
                },
              },
              {
                id: "c",
                text: {
                  en: "Café Tropical",
                  pt: "Café Tropical",
                },
              },
              {
                id: "d",
                text: {
                  en: "Rosebud Motel",
                  pt: "Rosebud Motel",
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
              en: "Mj Rodriguez became the first trans actress to win a Golden Globe, for playing Blanca in Pose",
              pt: "Mj Rodriguez foi a primeira atriz trans a ganhar um Globo de Ouro, pelo papel de Blanca em Pose",
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
              en: "In Six Feet Under, the Fisher family runs a funeral home in which city?",
              pt: "Em Sete Palmos de Terra, a família Fisher gere uma agência funerária em que cidade?",
            },
            options: [
              {
                id: "a",
                text: {
                  en: "San Francisco",
                  pt: "São Francisco",
                },
              },
              {
                id: "b",
                text: {
                  en: "Chicago",
                  pt: "Chicago",
                },
              },
              {
                id: "c",
                text: {
                  en: "Miami",
                  pt: "Miami",
                },
              },
              {
                id: "d",
                text: {
                  en: "Los Angeles",
                  pt: "Los Angeles",
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
          en: "Reality TV",
          pt: "Reality shows",
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
            type: "type_answer",
            prompt: {
              en: "The original 2003 Queer Eye had a longer title. Queer Eye for the Straight...?",
              pt: "O Queer Eye original, de 2003, tinha um título mais comprido. Queer Eye for the Straight...?",
            },
            options: [],
            answer: {
              text: {
                en: "Guy",
                pt: "Guy",
              },
            },
            acceptedAnswers: [
              "Guy",
              "Guys",
              "Straight Guy",
              "the Straight Guy",
              "Queer Eye for the Straight Guy",
            ],
            mediaRef: null,
            timeLimitSeconds: 25,
            points: 500,
          },
          {
            type: "multiple_choice",
            prompt: {
              en: "In the first season of Netflix's Queer Eye (2018), which of the Fab Five looked after grooming?",
              pt: "Na primeira temporada do Queer Eye da Netflix (2018), qual dos Fab Five tratava do cabelo e da pele?",
            },
            options: [
              {
                id: "a",
                text: {
                  en: "Antoni Porowski",
                  pt: "Antoni Porowski",
                },
              },
              {
                id: "b",
                text: {
                  en: "Tan France",
                  pt: "Tan France",
                },
              },
              {
                id: "c",
                text: {
                  en: "Karamo Brown",
                  pt: "Karamo Brown",
                },
              },
              {
                id: "d",
                text: {
                  en: "Jonathan Van Ness",
                  pt: "Jonathan Van Ness",
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
            type: "closest_number",
            prompt: {
              en: "Nadia Almada, from Madeira, won Big Brother UK in 2004. What percentage of the final vote did she get?",
              pt: "A madeirense Nadia Almada venceu o Big Brother britânico em 2004. Que percentagem dos votos da final conseguiu?",
            },
            options: [],
            answer: {
              value: 74,
            },
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: null,
            points: 1000,
          },
          {
            type: "true_false",
            prompt: {
              en: "Brian Dowling, who won Big Brother UK in 2001, later became the show's presenter",
              pt: "Brian Dowling, que venceu o Big Brother britânico em 2001, mais tarde passou a apresentar o programa",
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
              en: "Who hosted the first series of I Kissed a Boy (2023), the BBC dating show set on an Italian farm?",
              pt: "Quem apresentou a primeira temporada de I Kissed a Boy (2023), o programa de encontros da BBC numa quinta italiana?",
            },
            options: [
              {
                id: "a",
                text: {
                  en: "Kylie Minogue",
                  pt: "Kylie Minogue",
                },
              },
              {
                id: "b",
                text: {
                  en: "Dannii Minogue",
                  pt: "Dannii Minogue",
                },
              },
              {
                id: "c",
                text: {
                  en: "Alan Carr",
                  pt: "Alan Carr",
                },
              },
              {
                id: "d",
                text: {
                  en: "Holly Willoughby",
                  pt: "Holly Willoughby",
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
            type: "multiple_choice",
            prompt: {
              en: "Who hosted the first season of the US version of The Traitors, in 2023?",
              pt: "Quem apresentou a primeira temporada da versão norte-americana de The Traitors, em 2023?",
            },
            options: [
              {
                id: "a",
                text: {
                  en: "Alan Cumming",
                  pt: "Alan Cumming",
                },
              },
              {
                id: "b",
                text: {
                  en: "Claudia Winkleman",
                  pt: "Claudia Winkleman",
                },
              },
              {
                id: "c",
                text: {
                  en: "Andy Cohen",
                  pt: "Andy Cohen",
                },
              },
              {
                id: "d",
                text: {
                  en: "Neil Patrick Harris",
                  pt: "Neil Patrick Harris",
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
        ],
      },
      {
        kind: "quiz",
        title: {
          en: "Iconic characters",
          pt: "Personagens icónicas",
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
            type: "multiple_choice",
            prompt: {
              en: 'Who says "I like the wine and not the label" in Schitt\'s Creek?',
              pt: 'Quem diz "gosto do vinho e não do rótulo" em Schitt\'s Creek?',
            },
            options: [
              {
                id: "a",
                text: {
                  en: "Stevie Budd",
                  pt: "Stevie Budd",
                },
              },
              {
                id: "b",
                text: {
                  en: "David Rose",
                  pt: "David Rose",
                },
              },
              {
                id: "c",
                text: {
                  en: "Patrick Brewer",
                  pt: "Patrick Brewer",
                },
              },
              {
                id: "d",
                text: {
                  en: "Alexis Rose",
                  pt: "Alexis Rose",
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
              en: 'Which Golden Girl starts her stories with "Picture it: Sicily, 1922"?',
              pt: 'Em Sarilhos com Elas, quem começa as histórias com "Imagina: Sicília, 1922"?',
            },
            options: [],
            answer: {
              text: {
                en: "Sophia Petrillo",
                pt: "Sophia Petrillo",
              },
            },
            acceptedAnswers: [
              "Sophia",
              "Sophia Petrillo",
              "Petrillo",
              "Sofia",
              "Estelle Getty",
            ],
            mediaRef: null,
            timeLimitSeconds: 25,
            points: 1000,
          },
          {
            type: "multiple_choice",
            prompt: {
              en: 'In Will & Grace, who stages a one-man show called "Just Jack"?',
              pt: 'Em Will & Grace, quem monta um espetáculo a solo chamado "Just Jack"?',
            },
            options: [
              {
                id: "a",
                text: {
                  en: "Will Truman",
                  pt: "Will Truman",
                },
              },
              {
                id: "b",
                text: {
                  en: "Karen Walker",
                  pt: "Karen Walker",
                },
              },
              {
                id: "c",
                text: {
                  en: "Grace Adler",
                  pt: "Grace Adler",
                },
              },
              {
                id: "d",
                text: {
                  en: "Jack McFarland",
                  pt: "Jack McFarland",
                },
              },
            ],
            answer: {
              correctIndex: 3,
            },
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: null,
            points: 500,
          },
          {
            type: "true_false",
            prompt: {
              en: "In Sex Education, Eric Effiong plays the French horn in the school band",
              pt: "Em Sex Education, o Eric Effiong toca trompa na banda da escola",
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
              en: 'In Our Flag Means Death, which character is known as "the Gentleman Pirate"?',
              pt: 'Em Our Flag Means Death, que personagem é conhecida como "o Pirata Cavalheiro"?',
            },
            options: [
              {
                id: "a",
                text: {
                  en: "Stede Bonnet",
                  pt: "Stede Bonnet",
                },
              },
              {
                id: "b",
                text: {
                  en: "Blackbeard",
                  pt: "Barba Negra",
                },
              },
              {
                id: "c",
                text: {
                  en: "Calico Jack",
                  pt: "Calico Jack",
                },
              },
              {
                id: "d",
                text: {
                  en: "Izzy Hands",
                  pt: "Izzy Hands",
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
              en: "Which Doctor Who character got his own spin-off, Torchwood, in 2006?",
              pt: "Que personagem de Doctor Who ganhou o seu próprio spin-off, Torchwood, em 2006?",
            },
            options: [
              {
                id: "a",
                text: {
                  en: "Rory Williams",
                  pt: "Rory Williams",
                },
              },
              {
                id: "b",
                text: {
                  en: "Mickey Smith",
                  pt: "Mickey Smith",
                },
              },
              {
                id: "c",
                text: {
                  en: "Captain Jack Harkness",
                  pt: "Capitão Jack Harkness",
                },
              },
              {
                id: "d",
                text: {
                  en: "Adam Mitchell",
                  pt: "Adam Mitchell",
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
        ],
      },
      {
        kind: "quiz",
        title: {
          en: "Premieres in order",
          pt: "Estreias por ordem",
        },
        contentLabel: "none",
        settings: {
          timeLimitSeconds: 20,
          isSpeedBonusOn: true,
          isJokerAllowed: true,
          writeSeconds: 60,
          voteSeconds: 30,
          wheelBonus: 1000,
          wheelPick: "round",
          sliceCount: null,
        },
        questions: [
          {
            type: "order",
            prompt: {
              en: "Put these shows in premiere order, earliest first",
              pt: "Põe estas séries por ordem de estreia, da mais antiga para a mais recente",
            },
            options: [
              {
                id: "a",
                text: {
                  en: "Pose",
                  pt: "Pose",
                },
              },
              {
                id: "b",
                text: {
                  en: "Will & Grace",
                  pt: "Will & Grace",
                },
              },
              {
                id: "c",
                text: {
                  en: "Looking",
                  pt: "Looking",
                },
              },
              {
                id: "d",
                text: {
                  en: "Six Feet Under",
                  pt: "Sete Palmos de Terra",
                },
              },
            ],
            answer: {
              orderedIds: ["b", "d", "c", "a"],
            },
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: 30,
            points: 1000,
          },
          {
            type: "order",
            prompt: {
              en: "Put these teen and school shows in premiere order, earliest first",
              pt: "Põe estas séries juvenis por ordem de estreia, da mais antiga para a mais recente",
            },
            options: [
              {
                id: "a",
                text: {
                  en: "Sex Education",
                  pt: "Sex Education",
                },
              },
              {
                id: "b",
                text: {
                  en: "Skins",
                  pt: "Skins",
                },
              },
              {
                id: "c",
                text: {
                  en: "Heartstopper",
                  pt: "Heartstopper",
                },
              },
              {
                id: "d",
                text: {
                  en: "Glee",
                  pt: "Glee",
                },
              },
            ],
            answer: {
              orderedIds: ["b", "d", "a", "c"],
            },
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: 30,
            points: 1000,
          },
          {
            type: "order",
            prompt: {
              en: "Put these shows in premiere order, earliest first",
              pt: "Põe estes programas por ordem de estreia, do mais antigo para o mais recente",
            },
            options: [
              {
                id: "a",
                text: {
                  en: "Queer Eye for the Straight Guy",
                  pt: "Queer Eye for the Straight Guy",
                },
              },
              {
                id: "b",
                text: {
                  en: "Schitt's Creek",
                  pt: "Schitt's Creek",
                },
              },
              {
                id: "c",
                text: {
                  en: "Absolutely Fabulous",
                  pt: "Absolutamente Fabulosas",
                },
              },
              {
                id: "d",
                text: {
                  en: "Queer as Folk (US)",
                  pt: "Queer as Folk (EUA)",
                },
              },
            ],
            answer: {
              orderedIds: ["c", "d", "a", "b"],
            },
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: 30,
            points: 1000,
          },
          {
            type: "order",
            prompt: {
              en: "Tough one: put these 2020s shows in premiere order, earliest first",
              pt: "Esta é difícil: põe estas séries dos anos 2020 por ordem de estreia, da mais antiga para a mais recente",
            },
            options: [
              {
                id: "a",
                text: {
                  en: "Fellow Travelers",
                  pt: "Fellow Travelers",
                },
              },
              {
                id: "b",
                text: {
                  en: "Our Flag Means Death",
                  pt: "Our Flag Means Death",
                },
              },
              {
                id: "c",
                text: {
                  en: "It's a Sin",
                  pt: "It's a Sin",
                },
              },
              {
                id: "d",
                text: {
                  en: "Somebody Somewhere",
                  pt: "Somebody Somewhere",
                },
              },
            ],
            answer: {
              orderedIds: ["c", "d", "b", "a"],
            },
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: 30,
            points: 2000,
          },
          {
            type: "closest_number",
            prompt: {
              en: "In what year did the original Queer as Folk first air on Channel 4?",
              pt: "Em que ano estreou o Queer as Folk original no Channel 4?",
            },
            options: [],
            answer: {
              value: 1999,
            },
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: null,
            points: 1000,
          },
          {
            type: "closest_number",
            prompt: {
              en: "Schitt's Creek ran for six seasons, from 2015 to 2020. How many episodes did it make in total?",
              pt: "Schitt's Creek teve seis temporadas, de 2015 a 2020. Quantos episódios teve no total?",
            },
            options: [],
            answer: {
              value: 80,
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
          en: "Lie Detector: TV edition",
          pt: "Detetor: edição TV",
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
              en: "Before it was named after a Pet Shop Boys song, what was the working title of It's a Sin?",
              pt: "Antes de ganhar o nome de uma canção dos Pet Shop Boys, qual era o título provisório de It's a Sin?",
            },
            options: [],
            answer: {
              truth: {
                en: "Boys",
                pt: "Boys",
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
              en: 'Why is Ellen\'s 1997 coming-out episode called "The Puppy Episode"?',
              pt: 'Porque é que o episódio de 1997 em que a Ellen se assume se chama "The Puppy Episode"?',
            },
            options: [],
            answer: {
              truth: {
                en: "An executive suggested Ellen just get a puppy instead",
                pt: "Um executivo sugeriu que, em vez disso, a Ellen arranjasse um cachorrinho",
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
              en: "In Schitt's Creek, what is the full title of the horror film Moira Rose shoots in Bosnia?",
              pt: "Em Schitt's Creek, qual é o título completo do filme de terror que a Moira Rose roda na Bósnia?",
            },
            options: [],
            answer: {
              truth: {
                en: "The Crows Have Eyes III: The Crowening",
                pt: "The Crows Have Eyes III: The Crowening",
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
              en: "Absolutely Fabulous grew out of a 1990 sketch. Who played the sensible daughter in it?",
              pt: "Absolutamente Fabulosas nasceu de um sketch de 1990. Quem fazia de filha certinha nesse sketch?",
            },
            options: [],
            answer: {
              truth: {
                en: "Dawn French",
                pt: "Dawn French",
              },
            },
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: null,
            points: 1000,
          },
        ],
      },
      {
        kind: "drag_name",
        title: {
          en: "Name the spin-off",
          pt: "Inventa o spin-off",
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
              en: "Give your favourite TV side character their own queer spin-off. What is the show called?",
              pt: "Dá à tua personagem secundária preferida o seu próprio spin-off queer. Como se chama a série?",
            },
            options: [],
            answer: null,
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: null,
            points: 1000,
          },
          {
            type: "prompt",
            prompt: {
              en: "A new queer dating reality show is filming in a palace in Sintra. What is it called?",
              pt: "Um novo reality show de encontros queer está a ser gravado num palácio em Sintra. Como se chama?",
            },
            options: [],
            answer: null,
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: null,
            points: 1000,
          },
          {
            type: "prompt",
            prompt: {
              en: "Your life is now a sitcom named after your street and your worst habit. What is it called?",
              pt: "A tua vida é agora uma sitcom com o nome da tua rua e do teu pior hábito. Como se chama?",
            },
            options: [],
            answer: null,
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
