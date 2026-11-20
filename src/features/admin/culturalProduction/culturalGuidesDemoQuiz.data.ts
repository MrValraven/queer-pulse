import type { DemoCulturalGuideSeed } from "./culturalProductionDemo.data";

// Quiz night in English and Portuguese, copied from contract sections 14.3
// and 14.4 character for character. `culturalGuidesDemo.data` adds the ids
// and lists these two after Board game night.

export const QUIZ_NIGHT_GUIDE_EN: DemoCulturalGuideSeed = {
  id: "demo-guide-quiz-en",
  title: "Quiz night",
  eventType: "quiz_night",
  locale: "en",
  summary:
    "How QueerPulse runs a quiz night on Pulse Live: teams answer on their phones, the questions show on a big screen, a quizmaster keeps the energy up, and every round is one everyone can play.",
  sections: [
    {
      heading: "The night in short",
      body: `Teams of two to six play five or six rounds over about two hours. Questions show on a projector or a TV and teams answer on their phones through Pulse Live, which also keeps the score. People who come alone join a team at the door.

A good QueerPulse quiz mixes queer culture, music, pictures and a local Lisbon round, with easy and hard questions in every round so every team keeps up.`,
      steps: [
        {
          text: "Pick the date, the number of rounds and the team size",
          daysBefore: 42,
        },
      ],
    },
    {
      heading: "Venue",
      body: `You need:
- A projector or a large TV with an HDMI input, visible from every table
- A microphone and a speaker for the quizmaster
- Stable wifi or good mobile signal, since every team plays on a phone
- Tables for the teams, and a power socket near the screen for the laptop
- A step-free entrance and a step-free, gender-neutral toilet

Test the screen and the connection at the venue a few days before, with the laptop you will use on the night.`,
      steps: [
        {
          text: "Confirm the venue in writing: screen, sound, wifi, tables and hours",
          daysBefore: 35,
        },
        {
          text: "Test the screen and the wifi at the venue with the laptop for the night",
          daysBefore: 7,
        },
      ],
    },
    {
      heading: "Questions",
      body: `Start from a quiz in [Quiz templates](/admin/quizshow/templates) and adapt it, or plan your own rounds. A mix that works:
- Queer culture and history
- A music round with song intros
- A picture round
- A local round about Lisbon and its queer spaces
- A wheel round, where the wheel picks the category

Every answer needs a source, written in the quiz's staff notes. Keep the questions on culture and history, and leave out anything that guesses at a real person's identity or makes fun of one. If the crowd mixes Portuguese and English speakers, set the quiz to both languages.`,
      steps: [
        {
          text: "Pick a quiz in Quiz templates or plan the rounds from scratch",
          daysBefore: 28,
        },
        {
          text: "Write or adapt the questions and add a source for every answer",
          daysBefore: 14,
        },
        {
          text: "Ask another producer to fact-check every question",
          daysBefore: 7,
        },
        {
          text: "Play the whole quiz once on the screen and the remote",
          daysBefore: 3,
        },
      ],
    },
    {
      heading: "Hosts",
      body: `Three roles, for three people or two:
- The quizmaster reads each question twice, keeps the energy up and announces the scores between rounds.
- The tech host runs Pulse Live from the event's Manage page, Live game tab: the screen on the projector and the remote on a phone.
- The door host welcomes people, helps them join with the code on [the join page](/play), and forms teams for people who came alone.

Pulse Live keeps the score, so nobody marks answer sheets.`,
      steps: [
        {
          text: "Confirm the quizmaster, the tech host and the door host",
          daysBefore: 14,
        },
        {
          text: "Rehearse with the tech host on the event's Live game tab",
          daysBefore: 3,
        },
      ],
    },
    {
      heading: "Promotion",
      body: `Publish the event on QueerPulse with the team size, the prizes, the access details and a line for newcomers: come alone and we'll find you a team.

Share it in the communities that fit the night and in the team's channels. A sample question makes a good teaser a week before.`,
      steps: [
        {
          text: "Publish the event on QueerPulse with the team size, prizes and access details",
          daysBefore: 28,
        },
        {
          text: "Share the event in the communities that fit the night",
          daysBefore: 21,
        },
        { text: "Post a sample question as a teaser", daysBefore: 7 },
        { text: "Post a last call", daysBefore: 1 },
      ],
    },
    {
      heading: "The night itself",
      body: `A timeline that works:
- 18:30 The tech host sets up the laptop, opens the event's Manage page, Live game tab, puts the screen on the projector and opens the remote on a phone
- 19:00 Doors open. The join code is on the screen and the door host helps teams join
- 19:30 Round one
- After round three, a fifteen-minute break
- 21:15 Final round, then the scores and the prizes

Answers go in on phones only, and teams keep search engines closed. The quizmaster reads every question out loud twice, so everyone can follow wherever they sit.`,
      steps: [
        {
          text: "Pack the laptop, the HDMI and power cables, a spare charger and the prizes",
          daysBefore: 0,
        },
        {
          text: "Open the screen and the remote and check that the join code works",
          daysBefore: 0,
        },
      ],
    },
    {
      heading: "Wrap-up",
      body: `Announce the winners, take photos only of people who said yes, and thank everyone for coming.

In the days after:
- Thank the venue and the hosts
- Note which questions worked and which flopped in the quiz's staff notes
- Write down how many teams came and what to change, then add it as an idea or update this guide`,
      steps: [
        { text: "Thank the venue and the hosts", daysBefore: -1 },
        {
          text: "Note which questions worked in the quiz's staff notes",
          daysBefore: -2,
        },
        {
          text: "Write down attendance and what to change, and update this guide",
          daysBefore: -3,
        },
      ],
    },
  ],
};

export const QUIZ_NIGHT_GUIDE_PT: DemoCulturalGuideSeed = {
  id: "demo-guide-quiz-pt",
  title: "Noite de quiz",
  eventType: "quiz_night",
  locale: "pt",
  summary:
    "Como o QueerPulse organiza uma noite de quiz no Pulse Live: as equipas respondem no telemóvel, as perguntas aparecem num ecrã grande, quem apresenta mantém a energia em alta e cada ronda é para toda a gente.",
  sections: [
    {
      heading: "A noite em resumo",
      body: `Equipas de duas a seis pessoas jogam cinco ou seis rondas em cerca de duas horas. As perguntas aparecem num projetor ou numa televisão e as equipas respondem no telemóvel através do Pulse Live, que também conta os pontos. Quem vem sem companhia junta-se a uma equipa à porta.

Um bom quiz QueerPulse mistura cultura queer, música, imagens e uma ronda local sobre Lisboa, com perguntas fáceis e difíceis em cada ronda para que todas as equipas acompanhem.`,
      steps: [
        {
          text: "Escolhe a data, o número de rondas e o tamanho das equipas",
          daysBefore: 42,
        },
      ],
    },
    {
      heading: "Espaço",
      body: `Precisas de:
- Um projetor ou uma televisão grande com entrada HDMI, visível de todas as mesas
- Um microfone e uma coluna para quem apresenta
- Wi-fi estável ou boa rede móvel, porque cada equipa joga num telemóvel
- Mesas para as equipas e uma tomada perto do ecrã para o portátil
- Entrada sem degraus e uma casa de banho sem degraus e para todos os géneros

Testa o ecrã e a ligação no espaço uns dias antes, com o portátil que vais usar na noite.`,
      steps: [
        {
          text: "Confirma o espaço por escrito: ecrã, som, wi-fi, mesas e horário",
          daysBefore: 35,
        },
        {
          text: "Testa o ecrã e o wi-fi no espaço com o portátil da noite",
          daysBefore: 7,
        },
      ],
    },
    {
      heading: "Perguntas",
      body: `Começa por um quiz em [Modelos de quiz](/admin/quizshow/templates) e adapta-o, ou planeia as tuas rondas. Uma mistura que funciona:
- Cultura e história queer
- Uma ronda de música com o início das canções
- Uma ronda de imagens
- Uma ronda local sobre Lisboa e os seus espaços queer
- Uma ronda da roda, em que a roda escolhe a categoria

Cada resposta precisa de uma fonte, escrita nas notas internas do quiz. Mantém as perguntas na cultura e na história, e deixa de fora tudo o que tente adivinhar a identidade de uma pessoa real ou goze com ela. Se o público misturar quem fala português e quem fala inglês, põe o quiz nas duas línguas.`,
      steps: [
        {
          text: "Escolhe um quiz em Modelos de quiz ou planeia as rondas do zero",
          daysBefore: 28,
        },
        {
          text: "Escreve ou adapta as perguntas e junta uma fonte a cada resposta",
          daysBefore: 14,
        },
        {
          text: "Pede a outra pessoa da produção que verifique cada pergunta",
          daysBefore: 7,
        },
        {
          text: "Joga o quiz inteiro uma vez no ecrã e no comando",
          daysBefore: 3,
        },
      ],
    },
    {
      heading: "Hosts",
      body: `Três papéis, para três pessoas ou duas:
- Quem apresenta lê cada pergunta duas vezes, mantém a energia e anuncia os pontos entre rondas.
- Quem trata da parte técnica corre o Pulse Live a partir da página Gerir do evento, separador Jogo ao vivo: o ecrã no projetor e o comando num telemóvel.
- A pessoa da porta recebe as pessoas, ajuda-as a entrar com o código na [página de entrada](/play) e forma equipas para quem veio sem companhia.

O Pulse Live conta os pontos, por isso ninguém tem de corrigir folhas de respostas.`,
      steps: [
        {
          text: "Confirma quem apresenta, quem trata da parte técnica e a pessoa da porta",
          daysBefore: 14,
        },
        {
          text: "Ensaia com quem trata da parte técnica no separador Jogo ao vivo do evento",
          daysBefore: 3,
        },
      ],
    },
    {
      heading: "Divulgação",
      body: `Publica o evento no QueerPulse com o tamanho das equipas, os prémios, os detalhes de acessibilidade e uma frase para quem vem pela primeira vez: vem sem companhia, nós encontramos-te uma equipa.

Partilha-o nas comunidades que fazem sentido para a noite e nos canais da equipa. Uma pergunta de exemplo é um bom aperitivo uma semana antes.`,
      steps: [
        {
          text: "Publica o evento no QueerPulse com o tamanho das equipas, os prémios e os detalhes de acessibilidade",
          daysBefore: 28,
        },
        {
          text: "Partilha o evento nas comunidades que fazem sentido para a noite",
          daysBefore: 21,
        },
        {
          text: "Publica uma pergunta de exemplo como aperitivo",
          daysBefore: 7,
        },
        { text: "Publica uma última chamada", daysBefore: 1 },
      ],
    },
    {
      heading: "A noite",
      body: `Um horário que funciona:
- 18:30 Quem trata da parte técnica monta o portátil, abre a página Gerir do evento, separador Jogo ao vivo, põe o ecrã no projetor e abre o comando num telemóvel
- 19:00 Abrem as portas. O código de entrada está no ecrã e a pessoa da porta ajuda as equipas a entrar
- 19:30 Primeira ronda
- Depois da terceira ronda, quinze minutos de intervalo
- 21:15 Ronda final, depois os pontos e os prémios

As respostas entram só pelo telemóvel e as equipas mantêm os motores de busca fechados. Quem apresenta lê cada pergunta em voz alta duas vezes, para que toda a gente acompanhe, esteja onde estiver na sala.`,
      steps: [
        {
          text: "Leva o portátil, os cabos HDMI e de alimentação, um carregador extra e os prémios",
          daysBefore: 0,
        },
        {
          text: "Abre o ecrã e o comando e confirma que o código de entrada funciona",
          daysBefore: 0,
        },
      ],
    },
    {
      heading: "Depois do evento",
      body: `Anuncia quem ganhou, tira fotos só de quem disse que sim e agradece a toda a gente por ter vindo.

Nos dias a seguir:
- Agradece ao espaço e aos hosts
- Regista nas notas internas do quiz que perguntas resultaram e quais falharam
- Regista quantas equipas vieram e o que mudar, e junta isso como ideia ou atualiza este guia`,
      steps: [
        { text: "Agradece ao espaço e aos hosts", daysBefore: -1 },
        {
          text: "Regista nas notas internas do quiz que perguntas resultaram",
          daysBefore: -2,
        },
        {
          text: "Regista a afluência e o que mudar, e atualiza este guia",
          daysBefore: -3,
        },
      ],
    },
  ],
};
