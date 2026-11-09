/**
 * Demo copy of the "Pop divas: spin the wheel" wheel template. The backend seeds the
 * same pack as a draft in AddQuizshowWheelTemplates1840100000000; keep the two
 * identical.
 */
import { QUIZSHOW_DEMO_WHEEL_TEMPLATE_IDS } from "./quizshowDemoWheelTemplateIds";
import type { QuizshowDemoWheelPack } from "./quizshowDemoWheelPack";

export const POP_DIVAS_WHEEL_PACK: QuizshowDemoWheelPack = {
  id: QUIZSHOW_DEMO_WHEEL_TEMPLATE_IDS.popDivas,
  card: {
    title: {
      en: "Pop divas: spin the wheel",
      pt: "Divas pop: gira a roda",
    },
    description: {
      en: "Number ones, chart records, album eras, a diva Lie Detector and pop alter egos, and the wheel decides which round plays next",
      pt: "Números um, recordes nas tabelas, eras de álbuns, um Detetor de Mentiras de divas e alter egos pop, e é a roda que decide a ronda seguinte",
    },
  },
  staffNotes:
    "Round 1, question 1: Wikipedia, List of Billboard Hot 100 number ones of 1984, and Stereogum The Number Ones: Like a Virgin hit No. 1 on 22 December 1984, Madonna's first Hot 100 number one (Material Girl peaked No. 2, Lucky Star No. 4)\nRound 1, question 2: Wikipedia, Whitney Houston singles discography and Where Do Broken Hearts Go: the song topped the Hot 100 on 23 April 1988, her seventh consecutive No. 1, beating the six of The Beatles and Bee Gees\nRound 1, question 3: Guinness World Records (oldest female artist to reach No. 1 on the US Hot 100) and Billboard: Cher was 52 when Believe topped the Hot 100 in March 1999, the oldest woman to do so at that time (Brenda Lee's holiday song passed it in 2023, hence 'at the time')\nRound 1, question 4: Billboard via The Fader (16 December 2019) and AP: All I Want for Christmas Is You first reached No. 1 on the Hot 100 chart dated 21 December 2019, 25 years after release\nRound 1, question 5: Wikipedia, The Loco-Motion and Kylie (album), plus NFSA Kyliemania: Kylie's debut single was her 1987 cover Locomotion, seven weeks at No. 1 on the Australian Kent Music Report\nRound 1, question 6: Wikipedia, Rihanna singles discography and Pon de Replay: Pon de Replay peaked at No. 2 on the Hot 100 (behind We Belong Together); SOS (2006) was her first No. 1. Answer false\nRound 2, question 1: Guinness World Records (most US No. 1 singles by a solo artist) and Billboard: Mariah Carey has 19 Hot 100 number ones, the 19th being All I Want for Christmas Is You on 21 December 2019; none added in 2020 to 2024\nRound 2, question 2: whitneyhouston.com, American Songwriter and Wikipedia, List of Billboard Hot 100 number ones of 1992: I Will Always Love You reached No. 1 on 28 November 1992 and stayed 14 weeks\nRound 2, question 3: Wikipedia, I Feel Love, and 909originals: released in 1977 (B-side in May, A-side in July 1977), produced by Giorgio Moroder and Pete Bellotte, from I Remember Yesterday\nRound 2, question 4: CBS News, ABC7 and The Week (5 February 2023): Beyoncé reached 32 career Grammys at the 2023 ceremony, passing Georg Solti's 31\nRound 2, question 5: Wikipedia, List of Billboard Hot 100 number ones of 1999: ...Baby One More Time was No. 1 on the chart dated 30 January 1999; Britney was born 2 December 1981, so she was 17\nRound 2, question 6: Wikipedia, What's Love Got to Do with It (song), and Stereogum The Number Ones: it was Tina Turner's first and only solo Hot 100 No. 1 (1984); Proud Mary with Ike peaked at No. 4. Answer true\nRound 3, question 1: Wikipedia, Madonna albums discography: Like a Virgin 1984, Like a Prayer 1989, Ray of Light 1998, Confessions on a Dance Floor 2005\nRound 3, question 2: Wikipedia, Britney Spears discography: Oops!... I Did It Again (May 2000), In the Zone (2003), Blackout (2007), Circus (2008)\nRound 3, question 3: Wikipedia, Lady Gaga discography: The Fame 2008, Born This Way 2011, Artpop 2013, Chromatica 2020\nRound 3, question 4: Wikipedia album pages: Whitney Houston (14 February 1985), Mariah Carey (12 June 1990), ...Baby One More Time (12 January 1999), Music of the Sun (30 August 2005)\nRound 3, question 5: Official Charts and Rolling Stone: Radical Optimism, Dua Lipa's third studio album, released 3 May 2024 (Future Nostalgia was the second, Club Future Nostalgia a remix album)\nRound 3, question 6: Wikipedia, Charli XCX discography: True Romance (April 2013), Sucker (December 2014), Charli (2019), Brat (June 2024)\nRound 4, question 1: Grammy.com (Madonna wins Best Pop Album for Ray of Light, 1999 Grammy Rewind) and Wikipedia, Ray of Light: produced with William Orbit, won Best Pop Album at the 41st Grammys\nRound 4, question 2: Grammy.com, Album of the Year 1994, and Deseret News (2 March 1994): The Bodyguard Original Soundtrack Album won Album of the Year at the 36th Grammys. Accepted answers include the Portuguese film title O Guarda-Costas\nRound 4, question 3: Reuters via 1News (14 November 2020) and Wikipedia, Disco (Kylie Minogue album): Disco was largely recorded in her home studio during the COVID-19 lockdown, released 6 November 2020\nRound 4, question 4: Wikipedia, I Am... Sasha Fierce: Beyoncé's third studio album (November 2008), built around her alter ego Sasha Fierce\nRound 4, question 5: Wikipedia, Control (Janet Jackson album), and Treble: third album, released 4 February 1986, produced with Jimmy Jam and Terry Lewis, her first Billboard 200 No. 1\nRound 4, question 6: Wikipedia, The Emancipation of Mimi, Tampa Bay Times (30 November 2004) and BMI: 2005 album; Carey called Mimi a very personal nickname only used by those closest to her\nRound 5, question 1: CNN Style (Remember when Kylie Minogue's gold hotpants...), Euronews (22 November 2021) and Broadsheet: the gold lame hotpants from Spinning Around cost 50p, bought secondhand in London by photographer Katerina Jebb (the exact shop or market varies by source: North End Road, Camden, an Oxfam shop per NFSA, so the prompt only says a secondhand find in London)\nRound 5, question 2: MTV News (Chasing Banana) and Yahoo/AP interview with snake handler Mike Hano: Britney posted about the python years later and christened it Banana (Yahoo cites a tweet 11 years on, Bustle an Instagram post; Hano says it had no such name at the time, so the prompt says 'on social media')\nRound 5, question 3: Wikipedia, Tina Turner, and Tennessee Encyclopedia: born Anna Mae Bullock on 26 November 1939\nRound 5, question 4: PinkNews (13 February 2011), The Daily Beast and Grammy.com: Lady Gaga arrived at the 2011 Grammys inside a giant egg carried by models and hatched from it to perform Born This Way\nRound 6, question 1: party prompt, no fact to check\nRound 6, question 2: party prompt, no fact to check\nRound 6, question 3: party prompt, no fact to check",
  quiz: {
    title: "Pop divas: spin the wheel",
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
          en: "Number ones",
          pt: "Números um",
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
              en: "Which song gave Madonna her first number one on the US Billboard Hot 100?",
              pt: "Que canção deu à Madonna o primeiro número um na Billboard Hot 100 dos EUA?",
            },
            options: [
              {
                id: "a",
                text: {
                  en: "Holiday",
                  pt: "Holiday",
                },
              },
              {
                id: "b",
                text: {
                  en: "Lucky Star",
                  pt: "Lucky Star",
                },
              },
              {
                id: "c",
                text: {
                  en: "Like a Virgin",
                  pt: "Like a Virgin",
                },
              },
              {
                id: "d",
                text: {
                  en: "Material Girl",
                  pt: "Material Girl",
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
              en: "In 1988, which diva became the first artist with seven consecutive number ones on the US Hot 100?",
              pt: "Em 1988, que diva se tornou a primeira artista com sete números um seguidos na Hot 100 dos EUA?",
            },
            options: [
              {
                id: "a",
                text: {
                  en: "Madonna",
                  pt: "Madonna",
                },
              },
              {
                id: "b",
                text: {
                  en: "Whitney Houston",
                  pt: "Whitney Houston",
                },
              },
              {
                id: "c",
                text: {
                  en: "Mariah Carey",
                  pt: "Mariah Carey",
                },
              },
              {
                id: "d",
                text: {
                  en: "Janet Jackson",
                  pt: "Janet Jackson",
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
              en: "Which song made Cher, at 52, the oldest woman at the time to top the US Hot 100 in 1999?",
              pt: "Que canção fez da Cher, aos 52 anos, a mulher mais velha até então a chegar ao topo da Hot 100 dos EUA, em 1999?",
            },
            options: [
              {
                id: "a",
                text: {
                  en: "Believe",
                  pt: "Believe",
                },
              },
              {
                id: "b",
                text: {
                  en: "Strong Enough",
                  pt: "Strong Enough",
                },
              },
              {
                id: "c",
                text: {
                  en: "If I Could Turn Back Time",
                  pt: "If I Could Turn Back Time",
                },
              },
              {
                id: "d",
                text: {
                  en: "The Shoop Shoop Song",
                  pt: "The Shoop Shoop Song",
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
              en: "In what year did Mariah Carey's All I Want for Christmas Is You first reach number one on the US Hot 100?",
              pt: "Em que ano é que All I Want for Christmas Is You, da Mariah Carey, chegou pela primeira vez ao número um da Hot 100 dos EUA?",
            },
            options: [
              {
                id: "a",
                text: {
                  en: "1994",
                  pt: "1994",
                },
              },
              {
                id: "b",
                text: {
                  en: "2000",
                  pt: "2000",
                },
              },
              {
                id: "c",
                text: {
                  en: "2012",
                  pt: "2012",
                },
              },
              {
                id: "d",
                text: {
                  en: "2019",
                  pt: "2019",
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
              en: "Kylie Minogue's debut single topped the Australian chart in 1987. It was a cover of which song?",
              pt: "O single de estreia da Kylie Minogue chegou ao número um na Austrália em 1987. Era uma versão de que canção?",
            },
            options: [
              {
                id: "a",
                text: {
                  en: "Respect",
                  pt: "Respect",
                },
              },
              {
                id: "b",
                text: {
                  en: "I Should Be So Lucky",
                  pt: "I Should Be So Lucky",
                },
              },
              {
                id: "c",
                text: {
                  en: "The Loco-Motion",
                  pt: "The Loco-Motion",
                },
              },
              {
                id: "d",
                text: {
                  en: "Venus",
                  pt: "Venus",
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
            type: "true_false",
            prompt: {
              en: "Rihanna's debut single Pon de Replay reached number one on the US Hot 100",
              pt: "O single de estreia da Rihanna, Pon de Replay, chegou ao número um da Hot 100 dos EUA",
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
          en: "Charts in numbers",
          pt: "Tabelas em números",
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
            type: "closest_number",
            prompt: {
              en: "By the end of 2024, how many US Hot 100 number ones had Mariah Carey scored?",
              pt: "Até ao fim de 2024, quantos números um na Hot 100 dos EUA tinha somado a Mariah Carey?",
            },
            options: [],
            answer: {
              value: 19,
            },
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: null,
            points: 1000,
          },
          {
            type: "closest_number",
            prompt: {
              en: "How many weeks did Whitney Houston's I Will Always Love You spend at number one on the US Hot 100 in 1992 and 1993?",
              pt: "Quantas semanas passou I Will Always Love You, da Whitney Houston, no número um da Hot 100 dos EUA entre 1992 e 1993?",
            },
            options: [],
            answer: {
              value: 14,
            },
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: null,
            points: 1000,
          },
          {
            type: "closest_number",
            prompt: {
              en: "In what year did Donna Summer release I Feel Love, the synth disco track made with Giorgio Moroder?",
              pt: "Em que ano lançou a Donna Summer I Feel Love, o tema disco de sintetizadores feito com Giorgio Moroder?",
            },
            options: [],
            answer: {
              value: 1977,
            },
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: null,
            points: 1000,
          },
          {
            type: "closest_number",
            prompt: {
              en: "How many Grammys had Beyoncé won in total after the February 2023 ceremony, the night she broke the all-time record?",
              pt: "Quantos Grammys tinha a Beyoncé ganho no total depois da cerimónia de fevereiro de 2023, a noite em que bateu o recorde absoluto?",
            },
            options: [],
            answer: {
              value: 32,
            },
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: null,
            points: 1000,
          },
          {
            type: "closest_number",
            prompt: {
              en: "How old was Britney Spears when ...Baby One More Time hit number one on the US Hot 100 in January 1999?",
              pt: "Que idade tinha a Britney Spears quando ...Baby One More Time chegou ao número um da Hot 100 dos EUA, em janeiro de 1999?",
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
            type: "true_false",
            prompt: {
              en: "What's Love Got to Do with It is Tina Turner's only solo number one on the US Hot 100",
              pt: "What's Love Got to Do with It é o único número um a solo da Tina Turner na Hot 100 dos EUA",
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
        ],
      },
      {
        kind: "quiz",
        title: {
          en: "Release order",
          pt: "Ordem de lançamento",
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
            type: "order",
            prompt: {
              en: "Put these Madonna albums in order, earliest first",
              pt: "Põe estes álbuns da Madonna por ordem, do mais antigo para o mais recente",
            },
            options: [
              {
                id: "a",
                text: {
                  en: "Ray of Light",
                  pt: "Ray of Light",
                },
              },
              {
                id: "b",
                text: {
                  en: "Like a Virgin",
                  pt: "Like a Virgin",
                },
              },
              {
                id: "c",
                text: {
                  en: "Confessions on a Dance Floor",
                  pt: "Confessions on a Dance Floor",
                },
              },
              {
                id: "d",
                text: {
                  en: "Like a Prayer",
                  pt: "Like a Prayer",
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
            type: "multiple_choice",
            prompt: {
              en: "Which of these Britney Spears albums came out first?",
              pt: "Qual destes álbuns da Britney Spears saiu primeiro?",
            },
            options: [
              {
                id: "a",
                text: {
                  en: "Blackout",
                  pt: "Blackout",
                },
              },
              {
                id: "b",
                text: {
                  en: "Circus",
                  pt: "Circus",
                },
              },
              {
                id: "c",
                text: {
                  en: "Oops!... I Did It Again",
                  pt: "Oops!... I Did It Again",
                },
              },
              {
                id: "d",
                text: {
                  en: "In the Zone",
                  pt: "In the Zone",
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
            type: "order",
            prompt: {
              en: "Put these Lady Gaga albums in order, earliest first",
              pt: "Põe estes álbuns da Lady Gaga por ordem, do mais antigo para o mais recente",
            },
            options: [
              {
                id: "a",
                text: {
                  en: "Chromatica",
                  pt: "Chromatica",
                },
              },
              {
                id: "b",
                text: {
                  en: "The Fame",
                  pt: "The Fame",
                },
              },
              {
                id: "c",
                text: {
                  en: "Artpop",
                  pt: "Artpop",
                },
              },
              {
                id: "d",
                text: {
                  en: "Born This Way",
                  pt: "Born This Way",
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
              en: "Put these debut albums in order, earliest first",
              pt: "Põe estes álbuns de estreia por ordem, do mais antigo para o mais recente",
            },
            options: [
              {
                id: "a",
                text: {
                  en: "Britney Spears: ...Baby One More Time",
                  pt: "Britney Spears: ...Baby One More Time",
                },
              },
              {
                id: "b",
                text: {
                  en: "Rihanna: Music of the Sun",
                  pt: "Rihanna: Music of the Sun",
                },
              },
              {
                id: "c",
                text: {
                  en: "Whitney Houston: Whitney Houston",
                  pt: "Whitney Houston: Whitney Houston",
                },
              },
              {
                id: "d",
                text: {
                  en: "Mariah Carey: Mariah Carey",
                  pt: "Mariah Carey: Mariah Carey",
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
            type: "multiple_choice",
            prompt: {
              en: "What is the title of Dua Lipa's third studio album, released in May 2024?",
              pt: "Como se chama o terceiro álbum de estúdio da Dua Lipa, lançado em maio de 2024?",
            },
            options: [
              {
                id: "a",
                text: {
                  en: "Future Nostalgia",
                  pt: "Future Nostalgia",
                },
              },
              {
                id: "b",
                text: {
                  en: "Radical Optimism",
                  pt: "Radical Optimism",
                },
              },
              {
                id: "c",
                text: {
                  en: "Club Future Nostalgia",
                  pt: "Club Future Nostalgia",
                },
              },
              {
                id: "d",
                text: {
                  en: "Dua Lipa",
                  pt: "Dua Lipa",
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
            type: "order",
            prompt: {
              en: "Put these Charli XCX albums in order, earliest first",
              pt: "Põe estes álbuns da Charli XCX por ordem, do mais antigo para o mais recente",
            },
            options: [
              {
                id: "a",
                text: {
                  en: "Brat",
                  pt: "Brat",
                },
              },
              {
                id: "b",
                text: {
                  en: "Sucker",
                  pt: "Sucker",
                },
              },
              {
                id: "c",
                text: {
                  en: "True Romance",
                  pt: "True Romance",
                },
              },
              {
                id: "d",
                text: {
                  en: "Charli",
                  pt: "Charli",
                },
              },
            ],
            answer: {
              orderedIds: ["c", "b", "d", "a"],
            },
            acceptedAnswers: [],
            mediaRef: null,
            timeLimitSeconds: 30,
            points: 1000,
          },
        ],
      },
      {
        kind: "quiz",
        title: {
          en: "Name the album",
          pt: "Diz o álbum",
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
              en: "Which 1998 Madonna album, made with producer William Orbit, won the Grammy for Best Pop Album?",
              pt: "Que álbum da Madonna de 1998, feito com o produtor William Orbit, ganhou o Grammy de Melhor Álbum Pop?",
            },
            options: [],
            answer: {
              text: {
                en: "Ray of Light",
                pt: "Ray of Light",
              },
            },
            acceptedAnswers: [
              "Ray of Light",
              "Ray Of Light",
              "Ray of Lite",
              "Rays of Light",
            ],
            mediaRef: null,
            timeLimitSeconds: 25,
            points: 1000,
          },
          {
            type: "type_answer",
            prompt: {
              en: "Which 1992 soundtrack won Whitney Houston the Grammy for Album of the Year?",
              pt: "Que banda sonora de 1992 deu à Whitney Houston o Grammy de Álbum do Ano?",
            },
            options: [],
            answer: {
              text: {
                en: "The Bodyguard",
                pt: "The Bodyguard",
              },
            },
            acceptedAnswers: [
              "The Bodyguard",
              "Bodyguard",
              "The Body Guard",
              "Body Guard",
              "O Guarda-Costas",
              "Guarda-Costas",
              "Guarda Costas",
            ],
            mediaRef: null,
            timeLimitSeconds: 25,
            points: 1000,
          },
          {
            type: "type_answer",
            prompt: {
              en: "Kylie Minogue recorded most of her 2020 album in her home studio during lockdown. What is its one-word title?",
              pt: "A Kylie Minogue gravou quase todo o álbum de 2020 no estúdio de casa, durante o confinamento. Qual é o título, numa só palavra?",
            },
            options: [],
            answer: {
              text: {
                en: "Disco",
                pt: "Disco",
              },
            },
            acceptedAnswers: ["Disco", "Disko"],
            mediaRef: null,
            timeLimitSeconds: 25,
            points: 1000,
          },
          {
            type: "multiple_choice",
            prompt: {
              en: "Beyoncé's 2008 album is named after her on-stage alter ego. What is it called?",
              pt: "O álbum de 2008 da Beyoncé tem o nome do alter ego dela em palco. Como se chama?",
            },
            options: [
              {
                id: "a",
                text: {
                  en: "B'Day",
                  pt: "B'Day",
                },
              },
              {
                id: "b",
                text: {
                  en: "4",
                  pt: "4",
                },
              },
              {
                id: "c",
                text: {
                  en: "I Am... Sasha Fierce",
                  pt: "I Am... Sasha Fierce",
                },
              },
              {
                id: "d",
                text: {
                  en: "Dangerously in Love",
                  pt: "Dangerously in Love",
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
              en: "Janet Jackson's 1986 breakthrough album, made with Jimmy Jam and Terry Lewis, was her first Billboard 200 number one. What is its one-word title?",
              pt: "O álbum de 1986 que consagrou a Janet Jackson, feito com Jimmy Jam e Terry Lewis, foi o primeiro número um dela na Billboard 200. Qual é o título, numa só palavra?",
            },
            options: [],
            answer: {
              text: {
                en: "Control",
                pt: "Control",
              },
            },
            acceptedAnswers: ["Control", "Controle", "Kontrol"],
            mediaRef: null,
            timeLimitSeconds: 25,
            points: 2000,
          },
          {
            type: "type_answer",
            prompt: {
              en: "Mariah Carey's 2005 comeback album has a nickname in its title that only her closest people use. What is the album called?",
              pt: "O álbum de regresso da Mariah Carey, de 2005, tem no título uma alcunha que só os mais próximos usam. Como se chama o álbum?",
            },
            options: [],
            answer: {
              text: {
                en: "The Emancipation of Mimi",
                pt: "The Emancipation of Mimi",
              },
            },
            acceptedAnswers: [
              "The Emancipation of Mimi",
              "Emancipation of Mimi",
              "The Emancipation of Mimmi",
              "Emancipation of Mimmi",
              "The Emancipation",
              "Emancipation",
            ],
            mediaRef: null,
            timeLimitSeconds: 25,
            points: 1000,
          },
        ],
      },
      {
        kind: "lie_detector",
        title: {
          en: "Diva Lie Detector",
          pt: "Detetor de Mentiras",
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
              en: "Kylie's gold hotpants from the Spinning Around video were a secondhand find in London. What did they reportedly cost?",
              pt: "Os calções dourados da Kylie no vídeo de Spinning Around foram comprados em segunda mão em Londres. Quanto terão custado?",
            },
            options: [],
            answer: {
              truth: {
                en: "50p",
                pt: "50 pence",
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
              en: "Years after dancing with a python at the 2001 VMAs, what name did Britney give the snake on social media?",
              pt: "Anos depois de dançar com uma cobra gigante nos VMAs de 2001, que nome lhe deu a Britney nas redes sociais?",
            },
            options: [],
            answer: {
              truth: {
                en: "Banana",
                pt: "Banana",
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
              en: "What was Tina Turner's birth name?",
              pt: "Qual era o nome de nascimento da Tina Turner?",
            },
            options: [],
            answer: {
              truth: {
                en: "Anna Mae Bullock",
                pt: "Anna Mae Bullock",
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
              en: "What did Lady Gaga arrive inside on the 2011 Grammys red carpet?",
              pt: "Dentro de quê chegou a Lady Gaga à passadeira vermelha dos Grammys de 2011?",
            },
            options: [],
            answer: {
              truth: {
                en: "A giant egg",
                pt: "Um ovo gigante",
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
          en: "Pop alter ego",
          pt: "Alter ego pop",
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
              en: "Your diva alter ego is your favourite dessert plus the city of your best night out, what is her name?",
              pt: "O teu alter ego de diva é a tua sobremesa favorita mais a cidade da tua melhor noite de sempre, como se chama?",
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
              en: "You've just landed a Las Vegas residency. Name the show using your morning drink and your most dramatic habit",
              pt: "Acabaste de conseguir uma residência em Las Vegas. Dá nome ao espetáculo com a tua bebida da manhã e o teu hábito mais dramático",
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
              en: "Your comeback album drops at midnight and its title mixes a gemstone with the last emoji you sent, what is it called?",
              pt: "O teu álbum de regresso sai à meia-noite e o título junta uma pedra preciosa com o último emoji que enviaste, como se chama?",
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
