import type { Catalog } from "../../types";

/**
 * Homepage — pt-PT inclusivo. Mesmas chaves que `en/homepage.ts`.
 *
 * Notas de tradução:
 * - "Members" → *pessoas* / *a comunidade*, nunca *Membros*.
 * - Registo `tu`, caloroso, nunca `você`.
 * - Formas neutras (*bem-vinde*-style) só no discurso direto à pessoa
 *   (newsletter, saudações) — nunca como neutro por omissão masculino.
 * - Nomes próprios (QueerPulse, Cinema, Studio, bairros de Lisboa) mantêm-se.
 * - Conteúdo fictício de pessoas/comunidades (nomes, bios, citações, títulos
 *   de publicações no quadro) NÃO é traduzido — em modo live vem da API como
 *   texto de quem o escreveu.
 */
export const homepage: Catalog = {
  // ── Meta da página ─────────────────────────────────────────────────────────
  "meta.title": "QueerPulse: uma rede queer, com raízes em Lisboa",
  "meta.description":
    "Um lugar para descobrires o que se passa na comunidade queer de Lisboa e encontrares as pessoas, comunidades, eventos e oportunidades que dão forma à vida queer na cidade.",

  // ── Hero ───────────────────────────────────────────────────────────────────
  "hero.eyebrow": "Ao vivo em Lisboa",
  "hero.title": "Uma rede queer, <em>com raízes em Lisboa.</em>",
  "hero.sub":
    "Um lugar para descobrires o que se passa na comunidade queer de Lisboa e encontrares as pessoas, comunidades, eventos e oportunidades que dão forma à vida queer na cidade.",
  "hero.requestInviteCta": "Pedir um convite",
  "hero.exploreMembersCta": "Explorar pessoas",
  "hero.note":
    "Todas as semanas entram pessoas novas, sempre com um voto de confiança.",

  // ── Manifesto ("about") ──────────────────────────────────────────────────
  "manifesto.label": "O nosso manifesto",
  "manifesto.lead":
    "Uma plataforma de comunidade construída à volta <em>daquilo de que as pessoas queer realmente precisam.</em>",
  "manifesto.body1":
    "A QueerPulse existe porque já não aguentávamos plataformas que tratam pessoas queer como um segmento de mercado em vez de uma comunidade. Cada funcionalidade aqui nasce de uma necessidade real, de uma frustração, ou de algo que gostávamos que já existisse.",
  "manifesto.body2":
    "Acreditamos que a comunidade funciona de outra forma quando há confiança por trás. Quando sabes com quem estás a ligar-te, quando tens controlo sobre o que partilhas, e quando há pessoas a zelar pelos espaços que usas.",
  "manifesto.body3":
    "É por isso que a QueerPulse é só por convite, que as pessoas têm voto de confiança, e que a segurança e a privacidade fazem parte da base da plataforma.",
  "manifesto.body4":
    "A libertação queer é indivisível de todas as outras lutas por segurança e autodeterminação, incluindo a libertação da Palestina. <a>Onde nos posicionamos</a>.",
  "manifesto.highlight":
    "Estamos a construir um lugar onde ser queer é o ponto de partida para uma ligação verdadeira.",
  "manifesto.safetyCta": "Como mantemos isto seguro",
  "manifesto.assurance.vouched.title": "Convite ou voto de confiança",
  "manifesto.assurance.vouched.description":
    "Cada pessoa entra através de uma ligação de confiança ou de um pedido de convite analisado, ajudando-nos a construir uma comunidade onde há sempre uma razão para se estar.",
  "manifesto.assurance.safeSpaces.title": "Espaços seguros onde já estivemos",
  "manifesto.assurance.safeSpaces.description":
    "A nossa equipa visita os locais em pessoa e mantém a informação atualizada, para poderes descobrir sítios que a comunidade já foi mesmo conferir.",
  "manifesto.assurance.encrypted.title": "Encriptação de ponta a ponta",
  "manifesto.assurance.encrypted.description":
    "As tuas conversas diretas são encriptadas, mantendo as mensagens privadas só entre quem elas são para.",
  "manifesto.assurance.privacy.title": "Tu decides o que é visível",
  "manifesto.assurance.privacy.description":
    "Escolhe o que partilhas e quem pode ver. O teu perfil, fotografias e atividade podem ser públicos, só para a comunidade, ou privados.",
  "manifesto.assurance.moderation.title": "Moderação 24 horas por dia",
  "manifesto.assurance.moderation.description":
    "Quando algo corre mal, não devias ter de gritar para o vazio. As denúncias são revistas por pessoas reais e respondidas o mais depressa possível.",

  // ── TrustStrip ─────────────────────────────────────────────────────────────

  // ── PainPoints ("porque construímos isto") ──────────────────────────────────
  "painPoints.eyebrow": "Porque construímos isto",
  "painPoints.title":
    "Construímos a comunidade <em>que queríamos encontrar.</em>",
  "painPoints.lede":
    "A vida queer em Lisboa está cheia de pessoas a fazer coisas notáveis, espalhadas por grupos de conversa, cartazes e passa-palavra.",
  "painPoints.support":
    "A QueerPulse junta tudo num só sítio, para veres o que existe, conheceres quem está por trás e transformares um nome num plano.",

  "painPoints.modal.soonNote":
    "Esta ainda está a ser construída. Os membros são os primeiros a recebê-la, e são eles a dizer o que deve fazer.",
  "painPoints.modal.requestInviteCta": "Pedir um convite",
  "painPoints.modal.signInCta": "Já sou membro",
  "painPoints.soon": "Em breve",
  "painPoints.us": "QueerPulse",
  "painPoints.later": "Umas semanas depois",
  "painPoints.voicesNote":
    "Baseado nas conversas que fomos tendo enquanto decidíamos o que construir a seguir.",
  "painPoints.network.label": "A rede de confiança",
  "painPoints.network.question":
    "Vou a eventos queer e venho embora depois de um copo, porque não conheço lá ninguém.",
  "painPoints.network.question2":
    "Mudei-me para cá o ano passado e toda a gente que conheço é do trabalho.",
  "painPoints.network.heading": "Por isso construímos <em>uma rede.</em>",
  "painPoints.network.body":
    "Cada pessoa entra com o voto de confiança de alguém que já está dentro, por isso quando conheces alguém aqui já têm uma pessoa em comum.",
  "painPoints.network.payoff":
    "Dois jantares depois, já tenho pessoas a quem mandar mensagem a uma terça.",
  "painPoints.network.payoff2":
    "Afinal já conhecia três pessoas daqui, através de uma só.",
  "painPoints.network.cta": "Conhecer a comunidade",
  "painPoints.network.modal.title":
    "Toda a gente aqui <em>entrou por alguém.</em>",
  "painPoints.network.modal.lede":
    "A rede de confiança é a espinha da QueerPulse. Cada pessoa foi trazida por alguém que já pertence, e essa ligação fica visível no perfil.",
  "painPoints.network.modal.a.title": "Como funciona um voto de confiança",
  "painPoints.network.modal.a.body":
    "Alguém te envia um convite e põe o nome dela nele. Esse nome fica no teu perfil, por isso ninguém aqui é um completo desconhecido.",
  "painPoints.network.modal.b.title": "O que ganhas com isto",
  "painPoints.network.modal.b.body":
    "Antes de mandares mensagem a alguém, vês como estão ligados: quem deu a cara por essa pessoa e quem já conhecem os dois.",
  "painPoints.network.modal.c.title": "Como isto sustenta a QueerPulse",
  "painPoints.network.modal.c.body":
    "A habitação, os convívios e o diretório assentam nisto. Dar a tua morada a alguém é outra decisão quando um membro em quem confias deu a cara por essa pessoa.",

  "painPoints.directory.label": "O diretório de negócios",
  "painPoints.directory.question":
    "Quero gastar o meu dinheiro em negócios queer, e só sei deles quando alguém por acaso me fala num.",
  "painPoints.directory.question2":
    "E quero um barbeiro que me trate pelo meu nome e corte exatamente o que peço.",
  "painPoints.directory.heading":
    "Por isso construímos <em>um diretório de negócios queer.</em>",
  "painPoints.directory.body":
    "Negócios queer e serviços queer-friendly por toda a Lisboa, com a morada, o horário e quem está por trás.",
  "painPoints.directory.payoff":
    "O meu sábado inteiro é em negócios queer agora. Barbeiro incluído.",
  "painPoints.directory.payoff2":
    "Encontrei o meu barbeiro ali. Terceiro mês, mesma cadeira, mesmo corte.",
  "painPoints.directory.cta": "Ver o diretório",
  "painPoints.directory.modal.title": "Para onde vai <em>o teu dinheiro.</em>",
  "painPoints.directory.modal.lede":
    "Negócios queer e serviços queer-friendly por toda a Lisboa, listados por quem está à frente deles.",
  "painPoints.directory.modal.a.title": "Como funciona",
  "painPoints.directory.modal.a.body":
    "Pesquisas pelo que precisas ou vês no mapa. Cada ficha traz a morada, o horário e quem está por trás.",
  "painPoints.directory.modal.b.title": "O que ganhas com isto",
  "painPoints.directory.modal.b.body":
    "Os espaços seguros verificados estão na mesma lista, e um sítio só ganha esse selo depois de três membros diferentes lá terem ido e o dizerem.",
  "painPoints.directory.modal.c.title": "Como isto sustenta a QueerPulse",
  "painPoints.directory.modal.c.body":
    "Quem é dono reclama a sua ficha e responde por ela. O dinheiro gasto dentro da comunidade é o que mantém abertos os espaços da comunidade.",

  "painPoints.whatsOn.label": "Sítios onde ir",
  "painPoints.whatsOn.question":
    "Tudo aquilo de que oiço falar começa à meia-noite num bar, e eu deixei de beber há dois anos.",
  "painPoints.whatsOn.question2":
    "Quero um piquenique ao domingo ou uma tarde de colagem, e essas coisas nunca chegam a tempo até mim.",
  "painPoints.whatsOn.heading":
    "Por isso construímos <em>um calendário para a cidade.</em>",
  "painPoints.whatsOn.body":
    "Todos os convívios num só sítio: caminhadas de manhã, jantares partilhados, oficinas, visitas a ateliês, sessões de cinema e conversas. Filtra por dia, bairro, tipo e custo, e cada um diz à partida se é espaço sóbrio, se tem acesso sem degraus ou um canto tranquilo.",
  "painPoints.whatsOn.payoff":
    "Um piquenique em Monsanto ao domingo, marcado como espaço sóbrio antes de eu perguntar.",
  "painPoints.whatsOn.payoff2":
    "Três coisas no meu calendário este mês, todas antes das 20h.",
  "painPoints.whatsOn.cta": "Ver o que aí vem",
  "painPoints.whatsOn.modal.title": "A cidade, <em>num só calendário.</em>",
  "painPoints.whatsOn.modal.lede":
    "Tudo o que os membros estão a organizar num só sítio: caminhadas de manhã, jantares partilhados, oficinas, visitas a ateliês, sessões de cinema e conversas.",
  "painPoints.whatsOn.modal.a.title": "Como funciona",
  "painPoints.whatsOn.modal.a.body":
    "Filtras por dia, bairro, tipo e custo, e depois inscreves-te. O teu bilhete traz a morada, quem organiza e um código para a entrada.",
  "painPoints.whatsOn.modal.b.title": "O que ganhas com isto",
  "painPoints.whatsOn.modal.b.body":
    "Cada convívio diz à partida se é espaço sóbrio, se tem acesso sem degraus ou um canto tranquilo, por isso sabes ao que vais.",
  "painPoints.whatsOn.modal.c.title": "Como isto sustenta a QueerPulse",
  "painPoints.whatsOn.modal.c.body":
    "É aqui que a rede deixa de ser uma lista de nomes. Quem organiza tem entradas e lista de espera, e quem aparece sai a conhecer gente.",

  "painPoints.host.label": "Uma forma de organizar",
  "painPoints.host.question":
    "Quero organizar um jantar mensal e não faço ideia de como encontrar as primeiras doze pessoas.",
  "painPoints.host.question2":
    "Tenho a mesma ideia há um ano. Espaço, orçamento e quem traz as cadeiras é onde eu paro.",
  "painPoints.host.heading":
    "Por isso construímos <em>um guia para organizar.</em>",
  "painPoints.host.body":
    "Tudo para transformar uma ideia num convívio real: uma página que as pessoas encontram, inscrições que podes contar e orientação de quem já organizou.",
  "painPoints.host.payoff":
    "Doze pessoas, uma mesa comprida, e uma checklist que se preocupou por mim.",
  "painPoints.host.payoff2": "Roubei-te a checklist. O meu é em março.",
  "painPoints.host.cta": "Começar a organizar",
  "painPoints.host.modal.title":
    "Tu trazes a ideia. <em>Nós tratamos do resto.</em>",
  "painPoints.host.modal.lede":
    "Tudo para pores algo de pé, de um jantar para doze pessoas a uma oficina para trinta.",
  "painPoints.host.modal.a.title": "Como funciona",
  "painPoints.host.modal.a.body":
    "Publicas uma página com a data, o preço e o número de lugares. As inscrições, a lista de espera e as entradas no próprio dia ficam tratadas.",
  "painPoints.host.modal.b.title": "O que ganhas com isto",
  "painPoints.host.modal.b.body":
    "Uma checklist feita do que outras pessoas aprenderam à força, incluindo os detalhes de acessibilidade que vale a pena dizer antes de alguém ter de perguntar.",
  "painPoints.host.modal.c.title": "Como isto sustenta a QueerPulse",
  "painPoints.host.modal.c.body":
    "Não há candidatura para organizar nem comissão para aprovar. Os membros fazem o que querem fazer, e o calendário enche-se de dentro.",

  "painPoints.skillSwaps.label": "Trocas de saberes",
  "painPoints.skillSwaps.question":
    "Posso ensinar primeiros socorros a qualquer pessoa, e preciso que alguém me explique como passar recibos.",
  "painPoints.skillSwaps.question2":
    "Trocava aulas de ilustração por alguém que perceba de impostos.",
  "painPoints.skillSwaps.heading":
    "Por isso estamos a construir <em>as trocas de saberes.</em>",
  "painPoints.skillSwaps.body":
    "Escreve o que sabes ensinar e o que queres aprender, e trocas diretamente com quem faz par contigo. Ainda está a ser construído.",
  "painPoints.skillSwaps.payoff":
    "Quando abrir, essa troca é um post e uma resposta.",
  "painPoints.skillSwaps.payoff2":
    "A minha já está escrita nas notas do telemóvel.",
  "painPoints.skillSwaps.cta": "Ver no roteiro",
  "painPoints.skillSwaps.modal.title":
    "Troca o que sabes, <em>aprende o que precisas.</em>",
  "painPoints.skillSwaps.modal.lede":
    "Uma troca de saberes onde os membros trocam tempo diretamente: aulas de ilustração por ajuda com impostos, português por um corte de cabelo.",
  "painPoints.skillSwaps.modal.a.title": "Como vai funcionar",
  "painPoints.skillSwaps.modal.a.body":
    "Escreves o que sabes ensinar e o que queres aprender. A troca é um post e uma resposta.",
  "painPoints.skillSwaps.modal.b.title": "O que te vai dar",
  "painPoints.skillSwaps.modal.b.body":
    "Tudo o que a comunidade já sabe fazer, aberto a quem não tem dinheiro para o comprar.",
  "painPoints.skillSwaps.modal.c.title": "Como isto sustenta a QueerPulse",
  "painPoints.skillSwaps.modal.c.body":
    "Fica no polo de trabalho, ao lado das ofertas de emprego, mentoria, bolsas e calculadoras para freelancers, para uma troca poder virar trabalho pago.",

  "painPoints.forum.label": "O fórum",
  "painPoints.forum.question":
    "Quero perguntar quanto tempo demora mesmo a mudança de nome na conservatória, porque o site diz uma coisa e toda a gente que conheço diz outra.",
  "painPoints.forum.question2":
    "Quero perguntar como é que se fala à mãe de uma namorada aos 34, porque há dois anos que digo que a Joana é minha colega de casa.",
  "painPoints.forum.heading": "Por isso construímos <em>um fórum.</em>",
  "painPoints.forum.body":
    "Um sítio a que toda a gente aqui pertence: perguntas, recomendações, propostas e guias, organizados por categoria, respondidos por membros verificados e moderados por pessoas a quem podes recorrer.",
  "painPoints.forum.payoff":
    "Perguntei às 23h. De manhã tinha três respostas e o número real de semanas, de quem já tinha passado por isso.",
  "painPoints.forum.payoff2":
    "Onze pessoas contaram-me como foi com elas, também as difíceis. A Joana veio almoçar em março.",
  "painPoints.forum.cta": "Abrir o fórum",
  "painPoints.forum.modal.title":
    "Um sítio onde <em>a cidade inteira responde.</em>",
  "painPoints.forum.modal.lede":
    "O fórum é a única comunidade a que toda a gente aqui pertence: perguntas, recomendações, propostas e o trabalho lento de organizar.",
  "painPoints.forum.modal.a.title": "Como funciona",
  "painPoints.forum.modal.a.body":
    "Publicas numa categoria e respondem-te membros verificados. Os tópicos ficam pesquisáveis, por isso a resposta continua lá para a próxima pessoa.",
  "painPoints.forum.modal.b.title": "O que ganhas com isto",
  "painPoints.forum.modal.b.body":
    "A pergunta que andas a adiar desde março recebe uma resposta a sério de quem já passou por isso, normalmente na mesma noite.",
  "painPoints.forum.modal.c.title": "Como isto sustenta a QueerPulse",
  "painPoints.forum.modal.c.body":
    "Guias, convívios e comunidades inteiras começam como tópicos no fórum. A moderação publica o que fez em cada trimestre e podes recorrer de uma decisão.",

  "painPoints.magazine.label": "A revista",
  "painPoints.magazine.question":
    "Os artigos que encontro sobre pessoas queer são tão genéricos que podiam ser sobre qualquer cidade.",
  "painPoints.magazine.question2":
    "E os outros parecem inventados. Quero ler sobre pessoas reais em Lisboa.",
  "painPoints.magazine.heading": "Por isso construímos <em>uma revista.</em>",
  "painPoints.magazine.body":
    "Ensaios, perfis e reportagem escritos e editados por pessoas queer em Lisboa. Pessoas com nome, vidas concretas, nas suas próprias palavras.",
  "painPoints.magazine.payoff":
    "Propus uma ideia numa terça e saiu na edição seguinte.",
  "painPoints.magazine.payoff2":
    "A última edição trazia um perfil da senhora que tem a padaria da minha rua.",
  "painPoints.magazine.cta": "Ler a revista",
  "painPoints.magazine.modal.title": "Escrita por quem <em>vive isto.</em>",
  "painPoints.magazine.modal.lede":
    "Ensaios, perfis e reportagem da Lisboa queer, encomendados, escritos e editados por membros.",
  "painPoints.magazine.modal.a.title": "Como funciona",
  "painPoints.magazine.modal.a.body":
    "Propões uma ideia e um editor responde. Os textos saem em edições, com o nome de quem escreve e de quem edita em cada um.",
  "painPoints.magazine.modal.b.title": "O que ganhas com isto",
  "painPoints.magazine.modal.b.body":
    "Histórias sobre pessoas que podes conhecer esta semana, com nomes, ruas e pormenores concretos.",
  "painPoints.magazine.modal.c.title": "Como isto sustenta a QueerPulse",
  "painPoints.magazine.modal.c.body":
    "A revista é como a comunidade guarda o seu próprio registo, para que ninguém de fora decida quais são as três histórias que se contam sobre ela.",

  "painPoints.cinema.label": "Cinema",
  "painPoints.cinema.question":
    "O meu documentário passou uma vez num festival e depois desapareceu.",
  "painPoints.cinema.question2":
    "E metade dos filmes que quero ver nunca chega a Lisboa.",
  "painPoints.cinema.heading":
    "Por isso estamos a construir <em>uma cooperativa de cinema.</em>",
  "painPoints.cinema.body":
    "Uma casa comunitária para o cinema queer: uma programação semanal, obras feitas aqui e quem as fez presente na sessão para falar sobre elas. Ainda está a ser construído.",
  "painPoints.cinema.payoff":
    "Quando abrir, o documentário finalmente tem onde viver.",
  "painPoints.cinema.payoff2": "Conta comigo para a primeira sessão.",
  "painPoints.cinema.cta": "Espreita o Cinema",
  "painPoints.cinema.modal.title": "Cinema queer, <em>com casa própria.</em>",
  "painPoints.cinema.modal.lede":
    "Uma casa comunitária para o cinema queer: uma programação semanal, obras feitas aqui e quem as fez presente para falar sobre elas.",
  "painPoints.cinema.modal.a.title": "Como vai funcionar",
  "painPoints.cinema.modal.a.body":
    "Os membros programam a temporada, e as obras feitas aqui têm exibições próprias com quem as realizou presente.",
  "painPoints.cinema.modal.b.title": "O que te vai dar",
  "painPoints.cinema.modal.b.body":
    "Uma sessão semanal com que podes contar todos os meses, e filmes que de outra forma nunca chegariam a Lisboa.",
  "painPoints.cinema.modal.c.title": "Como isto sustenta a QueerPulse",
  "painPoints.cinema.modal.c.body":
    "Quem financia é dono, por isso o que passa responde a quem está a ver.",

  "painPoints.studio.label": "Studio",
  "painPoints.studio.question":
    "Lancei um EP o ano passado e a plataforma ficou com quase tudo o que ele rendeu.",
  "painPoints.studio.question2":
    "E pago streaming todos os meses sem fazer ideia de quão pouco chega a quem faz a música.",
  "painPoints.studio.heading":
    "Por isso estamos a construir <em>uma cooperativa de música.</em>",
  "painPoints.studio.body":
    "Música de quem a faz: lançamentos, sessões ao vivo e partituras, com os pagamentos e as regras decididos por quem cria. Ainda está a ser construído.",
  "painPoints.studio.payoff": "O próximo lançamento vai para lá primeiro.",
  "painPoints.studio.payoff2":
    "Quando abrir, vou finalmente saber para onde vão os meus dez euros por mês.",
  "painPoints.studio.cta": "Espreita o Studio",
  "painPoints.studio.modal.title":
    "Música de quem a faz, <em>paga como deve ser.</em>",
  "painPoints.studio.modal.lede":
    "Lançamentos, sessões ao vivo e partituras de artistas queer, com os pagamentos e as regras decididos por quem cria.",
  "painPoints.studio.modal.a.title": "Como vai funcionar",
  "painPoints.studio.modal.a.body":
    "Os artistas publicam e definem o preço do seu trabalho, e a divisão do dinheiro fica publicada para qualquer pessoa ler.",
  "painPoints.studio.modal.b.title": "O que te vai dar",
  "painPoints.studio.modal.b.body":
    "Consegues ver quanto do que gastas chega a quem fez o disco.",
  "painPoints.studio.modal.c.title": "Como isto sustenta a QueerPulse",
  "painPoints.studio.modal.c.body":
    "A mesma lógica cooperativa do Cinema: os membros são donos, os artistas definem as condições, e o dinheiro fica dentro da comunidade.",

  "painPoints.wellbeing.label": "A rede de segurança",
  "painPoints.wellbeing.question":
    "Quero terapia com alguém que já perceba de relações queer, para a primeira sessão ser sobre mim.",
  "painPoints.wellbeing.question2":
    "Procurei terapeuta durante meses e desisti duas vezes.",
  "painPoints.wellbeing.heading":
    "Por isso construímos <em>uma rede de segurança.</em>",
  "painPoints.wellbeing.body":
    "Terapeutas queer-friendly, apoio entre pares e recursos de confiança num só sítio, com a forma de contactar cada um.",
  "painPoints.wellbeing.payoff":
    "Tive um nome e um contacto na mesma noite, de alguém que já lá tinha ido.",
  "painPoints.wellbeing.payoff2":
    "O terceiro nome foi o que ficou. Já vou em seis meses.",
  "painPoints.wellbeing.cta": "Ver recursos de bem-estar",
  "painPoints.wellbeing.modal.title":
    "Um sítio para onde ir <em>antes de ser urgente.</em>",
  "painPoints.wellbeing.modal.lede":
    "Terapeutas queer-friendly, apoio entre pares e recursos de confiança, reunidos por quem os usou.",
  "painPoints.wellbeing.modal.a.title": "Como funciona",
  "painPoints.wellbeing.modal.a.body":
    "Procuras pelo que precisas, com a forma de contactar cada um. Os recursos de crise ficam públicos e acessíveis sem conta.",
  "painPoints.wellbeing.modal.b.title": "O que ganhas com isto",
  "painPoints.wellbeing.modal.b.body":
    "Nomes que vêm de quem lá foi mesmo, para a primeira sessão poder ser sobre ti.",
  "painPoints.wellbeing.modal.c.title": "Como isto sustenta a QueerPulse",
  "painPoints.wellbeing.modal.c.body":
    "O cuidado é a parte que a maioria das plataformas deixa de fora. Mantê-lo ao lado do resto é o que faz valer a pena estar aqui.",

  "painPoints.activism.label": "Uma forma de agir",
  "painPoints.activism.question":
    "Tenho duas horas livres ao sábado e não faço ideia de que associação precisa mesmo delas.",
  "painPoints.activism.question2":
    "Há um coletivo a quatro ruas de mim. Fiquei a saber por um cartaz num café.",
  "painPoints.activism.heading":
    "Por isso construímos <em>uma forma de agir.</em>",
  "painPoints.activism.body":
    "Vê as associações e coletivos que fazem o trabalho perto de ti, o que cada função te pede e quantas horas leva.",
  "painPoints.activism.payoff":
    "Duas horas ao sábado, num banco alimentar a dez minutos de casa.",
  "painPoints.activism.payoff2":
    "Sabia o que a função envolvia antes de dizer que sim. Foi por isso que continuei a voltar.",
  "painPoints.activism.cta": "Encontrar uma função",
  "painPoints.activism.modal.title":
    "Duas horas livres, <em>bem empregues.</em>",
  "painPoints.activism.modal.lede":
    "As associações e coletivos que fazem este trabalho perto de ti, com o que cada função te pede de facto.",
  "painPoints.activism.modal.a.title": "Como funciona",
  "painPoints.activism.modal.a.body":
    "Vês as funções por causa e por bairro. Cada uma diz as horas, o compromisso e com quem falar, e candidatas-te pela plataforma.",
  "painPoints.activism.modal.b.title": "O que ganhas com isto",
  "painPoints.activism.modal.b.body":
    "Sabes ao que estás a dizer que sim antes de dizeres, e é por isso que as pessoas continuam a voltar.",
  "painPoints.activism.modal.c.title": "Como isto sustenta a QueerPulse",
  "painPoints.activism.modal.c.body":
    "As organizações publicam as suas próprias funções e avaliam quem se candidata, para a plataforma servir quem já fazia isto muito antes de ela existir.",

  // ── Discovery (destaque de pessoas) ───────────────────────────────────────
  "discovery.eyebrow": "Mais de {count} pessoas, e a crescer",
  "discovery.title": "Os <em>rostos</em> da Lisboa queer",
  "discovery.sub":
    "Explora uma rede diversa de profissionais, criadores, fundadores e dinamizadores comunitários LGBTQ+ a colaborar para transformar ideias em impacto real.",
  "discovery.exploreMembersCta": "Explorar pessoas",
  "discovery.footNote": "Todas as semanas chegam caras novas.",
  "discovery.verifiedBadge": "Verificação",
  "discovery.featuredMember": "Pessoa em destaque",
  "discovery.vouchedBy": "Com voto de confiança de {name}",
  "discovery.viewProfile": "Ver perfil",
  "membersExplainer.eyebrow": "Só para a comunidade",
  "membersExplainer.title": "A comunidade <em>move</em> a QueerPulse",
  "membersExplainer.titlePlain": "A comunidade move a QueerPulse",
  "membersExplainer.lede":
    "O diretório da comunidade abre-se assim que entras. Eis porque o mantemos assim, e como te juntares.",
  "membersExplainer.pillars.vouched.title":
    "Pessoas reais, com voto de confiança",
  "membersExplainer.pillars.vouched.body":
    "Cada pessoa é convidada e recebe o voto de confiança de alguém que já cá está. Sem bots, sem estranhos a copiar a lista.",
  "membersExplainer.pillars.inside.title": "O melhor abre-se por dentro",
  "membersExplainer.pillars.inside.body":
    "Perfis completos, comunidades e encontros abrem-se no momento em que te juntas.",
  "membersExplainer.pillars.safe.title":
    "Só por convite mantém um espaço seguro",
  "membersExplainer.pillars.safe.body":
    "Manter o diretório só para a comunidade é como quem cá está consegue ser plenamente quem é.",
  "membersExplainer.requestInviteCta": "Pedir um convite",
  "membersExplainer.signInCta": "Já faço parte",
  "discovery.featuredMembersAria": "Pessoas em destaque",
  "discovery.featureMemberAria": "Mostrar {name}",

  // ── Live sections (curadoria da equipa, dados reais) ──────────────────────
  "liveDiscovery.eyebrow": "Escolhido pela nossa equipa",
  "liveCommunities.sub":
    "A QueerPulse reúne as comunidades que moldam o ecossistema LGBTQ+ de Lisboa, tornando mais fácil descobrir, ligar e colaborar.",
  "liveCommunities.memberCount": "{count} membros",

  // ── Gatherings (destaque na homepage) ─────────────────────────────────────
  "gatherings.title": "Encontra-te <em>pessoalmente.</em>",
  "gatherings.subtitle":
    "Jantares, oficinas, sessões de cinema e caminhadas: convívios reais a acontecer por Lisboa este mês.",
  "gatherings.spots.seatsLeft": "lugares restantes",
  "gatherings.spots.spotsLeft": "vagas restantes",
  "gatherings.spots.going": "pessoas vão",
  "gatherings.spots.casual": "Informal",
  "gatherings.cta.seeDetails": "Ver detalhes do evento",

  // ── Stories ────────────────────────────────────────────────────────────────
  "stories.title": "Contado <em>com as nossas palavras.</em>",
  "stories.subtitle":
    "Ensaios, perfis e reportagens de dentro da comunidade: sem olhar de fora, sem termos de nos explicar.",
  "stories.imagePlaceholder": "imagem da história",
  // LiveStories.tsx — a mesma secção a partir das peças publicadas na revista.
  "liveStories.byline": "{author} · leitura de {minutes} min",
  "liveStories.issueKicker": "Edição {number}",
  "liveStories.magazineKicker": "Da revista",

  // ── ChangeMakers ───────────────────────────────────────────────────────────
  "changeMakers.eyebrow": "Agentes de mudança",
  "changeMakers.title": "A construir a <em>Lisboa que queremos.</em>",
  "changeMakers.sub":
    "Pessoas organizadoras, ativistas e gente do dia a dia a impulsionar esta cidade.",
  "changeMakers.cta": "Conhecer os agentes de mudança",
  "changeMakers.portraitPlaceholder": "retrato de {name}",

  // ── Communities (variante G — destaque + índice) ───────────────────────────
  "communities.eyebrow": "Comunidades · Lisboa",
  "communities.title":
    "A comunidade é mais forte <em>quando se constroem juntas</em>",
  "communities.sub":
    "Pesquisa ou filtra a lista e depois abre qualquer comunidade para a veres por inteiro: o que é, o que faz, quem está lá dentro, e o que desbloqueias ao entrar.",
  "communities.howCommunitiesWorkCta": "Como funcionam as comunidades",
  "communities.resultCount.all": "<b>{count}</b> comunidades",
  "communities.resultCount.shown": "<b>{count}</b> de {total} comunidades",

  "communities.toolbar.searchPlaceholder": "Pesquisar comunidades…",
  "communities.toolbar.searchAriaLabel": "Pesquisar comunidades",
  "communities.toolbar.langAriaLabel": "Filtrar por idioma",
  "communities.toolbar.langAllOption": "Todos os idiomas",
  "communities.toolbar.hoodAriaLabel": "Filtrar por bairro",
  "communities.toolbar.hoodAllOption": "Todas as zonas",
  "communities.toolbar.sortLabel": "Ordenar",
  "communities.toolbar.sortAriaLabel": "Ordenar comunidades",
  "communities.toolbar.sort.active": "Mais ativas",
  "communities.toolbar.sort.size": "Maiores",
  "communities.toolbar.sort.new": "Mais recentes",
  "communities.toolbar.sort.near": "Mais próximas",

  "communities.category.all": "Todas",
  "communities.category.social": "Social",
  "communities.category.arts": "Artes",
  "communities.category.support": "Apoio",
  "communities.category.activism": "Ativismo",
  "communities.category.sports": "Desporto",
  "communities.category.professional": "Profissional",

  "communities.access.open": "Adesão aberta",
  "communities.access.request": "Adesão por pedido",
  "communities.access.invite": "Só por convite",
  "communities.access.private": "Privada",

  "communities.rail.showingCount": "A mostrar · {count}",
  "communities.rail.noMatches": "Sem resultados",
  "communities.rail.emptyTitle": "Nenhuma comunidade corresponde.",
  "communities.rail.emptyBody": "Alarga o filtro ou limpa a tua pesquisa.",
  "communities.rail.privateNoHeadcount": "Privada: sem contagem de pessoas",
  "communities.clearFiltersCta": "Limpar filtros",

  "communities.spotlight.emptyTitle": "Ainda não há nada aqui.",
  "communities.spotlight.emptyBody":
    "Nenhuma comunidade corresponde a estes filtros. Alarga a pesquisa, ou começa a que está a faltar.",
  "communities.spotlight.startCommunityCta": "Começar uma comunidade",
  "communities.spotlight.quiet.membersOnlyPrivate":
    "Só para a comunidade · privada",
  "communities.spotlight.quiet.discreetSafe":
    "Discreta e segura · sem contagem de pessoas",
  "communities.spotlight.quiet.enterCta": "Entrar",
  "communities.spotlight.whatHappensHere": "O que acontece aqui",
  "communities.spotlight.whatYouGet": "O que ganhas ao entrar",
  "communities.spotlight.keptBy": "Mantida por <b>{name}</b> e {extra}",
  "communities.spotlight.keptByName": "Mantida por <b>{name}</b>",
  "communities.spotlight.sinceLabel": "Desde {year}",

  "communities.room.pulse": "o feed ao vivo",
  "communities.room.discussions": "conversas",
  "communities.room.events": "convívios e confirmações",
  "communities.room.resources": "guias e biblioteca",

  // ── Housing ────────────────────────────────────────────────────────────────
  "housing.title": "Encontra um sítio onde te sintas em <em>casa.</em>",
  "housing.subtitle":
    "Quartos, subarrendamentos e colegas de casa de pessoas da comunidade, com recomendações de quem já lá viveu.",
  "housing.cta": "Ver alojamento",
  "housing.eyebrow": "Quartos e colegas de casa",
  "housing.secondaryCta": "Publica que estás à procura",
  "housing.explainerCta": "Como funciona o alojamento aqui",
  "housing.ctaNote": "Aqui, toda a gente faz parte da mesma rede de confiança.",

  // Explicação para quem está de fora, atrás do único botão de alojamento
  // (HousingExplainerModal). Ver o comentário em housingExplainer.data.ts.
  "housingExplainer.eyebrow": "Alojamento aqui",
  "housingExplainer.title": "Um quadro de quartos, e <em>tudo o resto.</em>",
  "housingExplainer.titlePlain": "Um quadro de quartos, e tudo o resto",
  "housingExplainer.lede":
    "Os anúncios são só uma parte disto. Eis o que está do outro lado da porta, e porque é que existe uma porta.",
  "housingExplainer.pillars.groups.title": "Grupos que escolhem quem entra",
  "housingExplainer.pillars.groups.body":
    "Grupos de habitação pequenos, onde são os membros a decidir quem entra e cada grupo tem as suas próprias regras. Os quartos partilhados dentro de um grupo ficam lá dentro, e nenhum intermediário entra.",
  "housingExplainer.pillars.viewings.title": "A morada exata espera por um sim",
  "housingExplainer.pillars.viewings.body":
    "Um anúncio mostra-te a zona até quem o publicou aceitar a tua visita, e só aí é que a morada exata aparece. Depois escrevem os dois uma avaliação, e nenhum de vocês lê a do outro antes de ambas estarem escritas.",
  "housingExplainer.pillars.door.title": "Porque é que o quadro tem uma porta",
  "housingExplainer.pillars.door.body":
    "Um quadro aberto é copiado para sites de anúncios e vasculhado por quem faz burlas com depósitos, por isso os quartos e os perfis de colegas de casa pedem-te que sejas membro primeiro. O nosso guia claro para detetar uma burla e conhecer os teus direitos enquanto inquilino em Portugal está atrás da mesma porta.",
  "housingExplainer.note":
    "As cooperativas de habitação são a única parte que já podes ler: <coop>vê quem está a organizar casa em conjunto</coop>.",
  "housingExplainer.requestInviteCta": "Pedir um convite",
  "housingExplainer.signInCta": "Já faço parte",
  "housing.tabRoom": "O quarto",
  "housing.tabLandlord": "O senhorio",
  "housing.postedByMember": "Publicado por uma pessoa da comunidade",
  "housing.bringToFrontAria": 'Trazer "{label}" para a frente',
  // Ver a nota em en/homepage.ts: "editar nem remover" em vez de "responder",
  // porque o senhorio tem mesmo direito de resposta (publicado pela equipa).
  "housing.reviewsFootNote":
    "Escrito por pessoas que lá viveram. Os senhorios não podem editar nem remover.",
  "housing.reviewsFootCta": "Como funcionam as avaliações",

  // Modal "Como funcionam as avaliações" (HousingReviewsExplainerModal).
  "housing.reviewsExplainer.eyebrow": "Avaliações de senhorios",
  "housing.reviewsExplainer.title": "Escrito por quem <em>lá viveu</em>",
  "housing.reviewsExplainer.titlePlain": "Escrito por quem lá viveu",
  "housing.reviewsExplainer.lede":
    "Tudo o que lês sobre um senhorio vem de alguém da comunidade que lhe alugou casa. Aqui fica quem pode escrever, o que o senhorio pode fazer e o que nunca garantimos.",
  "housing.reviewsExplainer.rules.livedThere.title": "Só escreve quem lá morou",
  "housing.reviewsExplainer.rules.livedThere.body":
    "Para avaliar um senhorio tens de declarar que lhe alugaste casa e indicar os meses em que lá viveste. Uma avaliação por pessoa e por senhorio, para ninguém poder acumular, e podes voltar atrás para reescrever a tua.",
  "housing.reviewsExplainer.rules.rightOfReply.title":
    "Os senhorios têm direito de resposta",
  "housing.reviewsExplainer.rules.rightOfReply.body":
    'Os senhorios não têm conta aqui, por isso não conseguem editar uma avaliação, escondê-la nem fazê-la desaparecer. Por baixo de cada avaliação há uma ligação "És tu?" para um formulário público, e a nossa equipa publica ali a resposta deles, com as palavras deles.',
  "housing.reviewsExplainer.rules.reportable.title":
    "Podes denunciar o que for falso",
  "housing.reviewsExplainer.rules.reportable.body":
    "Cada avaliação tem uma ligação para denunciar. A moderação pode retirá-la de vista enquanto analisa, e uma avaliação retirada deixa de contar para a nota do senhorio.",
  "housing.reviewsExplainer.note":
    "Não verificamos os arrendamentos. Uma avaliação é o relato de uma pessoa, feito em nome próprio e com telemóvel verificado, e aparece sempre marcada como autodeclarada para que possas avaliá-la por ti.",
  "housing.reviewsExplainer.browseCta": "Ver alojamento",
  "housing.reviewsExplainer.closeCta": "Percebi",

  // Ver nota equivalente em en/homepage.ts: os dois anúncios de exemplo são
  // uma exceção intencional à regra de âmbito acima — conteúdo estático,
  // igual em modo demo e live, nunca vindo da API.
  "housing.listings.a.peekLabel": "Quarto em Arroios · 480 €",
  "housing.listings.a.photoPlaceholder": "O quarto. Apartamento em Arroios.",
  "housing.listings.a.chips.0": "480 € + despesas",
  "housing.listings.a.chips.1": "Arroios · a partir de 1 de outubro",
  "housing.listings.a.title":
    "Um quarto luminoso num apartamento partilhado por três pessoas",
  "housing.listings.a.meta":
    "Quarto privado, cozinha partilhada, terraço e dois gatos que já vivem lá sem pagar renda.",
  "housing.listings.a.price.lead": "40 € abaixo",
  "housing.listings.a.price.rest":
    "da mediana de um quarto em Arroios (520 €). Mostramos-te isso antes de perguntares.",
  "housing.listings.a.household.name": "Vera, Tó e mais uma pessoa",
  "housing.listings.a.household.sub":
    "Recomendada por 3 pessoas da comunidade. Aqui desde 2024.",
  "housing.listings.a.signals.0.lead": "Casa trans-afirmativa.",
  "housing.listings.a.signals.0.rest": "Partilhado por quem lá vive.",
  "housing.listings.a.signals.1.lead":
    "Senhorio avaliado por 3 antigos inquilinos.",
  "housing.listings.a.signals.1.rest":
    "Vê o que os inquilinos anteriores tiveram a dizer antes de entrares em contacto.",
  "housing.listings.a.signals.2.lead": "Termos da caução por escrito.",
  "housing.listings.a.signals.2.rest":
    "Sabe a que estás a concordar antes de te mudares.",
  "housing.listings.a.landlord.sub":
    "Três apartamentos em Arroios. Conhecido aqui desde 2024.",
  "housing.listings.a.landlord.verdict":
    "Os três antigos inquilinos voltariam a alugar com ele",
  "housing.listings.a.landlord.quotes.0.quote":
    "Nunca me perguntou quem era a minha pessoa. Arranjou o esquentador em dois dias.",
  "housing.listings.a.landlord.quotes.0.who": "Rui, viveu lá entre 2022 e 2024",
  "housing.listings.a.landlord.quotes.1.quote":
    "Pôs o meu nome no contrato como eu pedi, à primeira, sem qualquer conversa sobre isso.",
  "housing.listings.a.landlord.quotes.1.who":
    "Nadia, viveu lá entre 2021 e 2022",
  "housing.listings.a.landlord.quotes.2.quote":
    "Caução devolvida na totalidade, as duas vezes. Ele manda uma foto da transferência.",
  "housing.listings.a.landlord.quotes.2.who":
    "Joana, viveu lá entre 2019 e 2021",
  "housing.listings.a.landlord.flag.lead": "Um alerta:",
  "housing.listings.a.landlord.flag.rest":
    "aumentou a renda a meio do contrato em 2023, revertendo depois de uma reclamação por escrito.",

  "housing.listings.b.peekLabel": "Subarrendamento na Graça · 390 € · jan–mar",
  "housing.listings.b.photoPlaceholder": "O estúdio. Subarrendamento na Graça.",
  "housing.listings.b.chips.0": "390 € + despesas",
  "housing.listings.b.chips.1": "Graça · jan–mar",
  "housing.listings.b.title": "Um estúdio inteiro na Graça, de janeiro a março",
  "housing.listings.b.meta":
    "Subarrendo enquanto estou fora. Acesso ao terraço, boa luz à tarde, um cão que terias de alimentar.",
  "housing.listings.b.price.lead": "Perto da mediana",
  "housing.listings.b.price.rest":
    "de um estúdio na Graça (420 €). Mobilado, despesas divididas com o apartamento de baixo.",
  "housing.listings.b.household.sub":
    "Recomendada por 5 pessoas da comunidade. Aqui desde 2023.",
  "housing.listings.b.signals.0.lead":
    "Subarrendamento com consentimento escrito do senhorio.",
  "housing.listings.b.signals.0.rest": "A documentação está no anúncio.",
  "housing.listings.b.signals.1.lead": "Entrada sem degraus.",
  "housing.listings.b.signals.1.rest":
    "Elevador até ao quarto andar, porta de casa de banho larga.",
  "housing.listings.b.signals.2.lead": "Sem caução.",
  "housing.listings.b.signals.2.rest":
    "A Beatriz só está a pedir o primeiro mês.",
  "housing.listings.b.landlord.sub": "Um apartamento na Graça. Nova no quadro.",
  "housing.listings.b.landlord.emptyState.title": "Ainda sem avaliações.",
  "housing.listings.b.landlord.emptyState.body":
    "Ainda ninguém aqui alugou com ela. Se ficares com o quarto, és a primeira pessoa a escrever sobre isso, e a próxima fica a saber o que tu sabes.",
  "housing.listings.b.landlord.facts.0.text":
    "Uma pessoa moderadora verificou a identidade dela pessoalmente.",
  "housing.listings.b.landlord.facts.1.text":
    "Contrato e carta de consentimento mostrados à equipa de alojamento antes de o anúncio ser publicado.",
  "housing.listings.b.landlord.facts.2.text":
    "Ainda sem histórico como senhoria. Leva uma pessoa amiga à visita.",
  "housing.listings.factsHeading": "O que sabemos",

  // ── Subprofiles ────────────────────────────────────────────────────────────
  "subprofiles.title": "Diferentes lados de ti. <em>Tudo num só lugar.</em>",
  "subprofiles.cta": "Explorar perfis alternativos",
  "subprofiles.ctaNote":
    "Três perfis alternativos estão incluídos em cada conta.",
  "personasExplainer.eyebrow": "Só para a comunidade",
  "personasExplainer.title":
    "Os perfis alternativos vivem <em>do lado de dentro</em>",
  "personasExplainer.titlePlain":
    "Os perfis alternativos vivem do lado de dentro",
  "personasExplainer.lede":
    "O diretório que acabaste de tentar abrir é só para quem faz parte. Eis o que está do outro lado.",
  "personasExplainer.pillars.directory.title":
    "Os perfis alternativos têm diretório próprio",
  "personasExplainer.pillars.directory.body":
    "A comunidade navega por perfil alternativo, por isso o lado de ti que aceita trabalhos é o lado que aparece numa pesquisa. Essa página só existe depois de entrares.",
  "personasExplainer.pillars.coOwned.title":
    "Um perfil alternativo pode ser levado por duas pessoas",
  "personasExplainer.pillars.coOwned.body":
    "Convida alguém como coproprietário e trabalham nele os dois. Se uma das pessoas o devolver e sair, o perfil alternativo fica de pé.",
  "personasExplainer.pillars.behindTheDoor.title":
    "A discrição precisa de uma porta fechada",
  "personasExplainer.pillars.behindTheDoor.body":
    "Define um perfil alternativo como só para a comunidade e quem estiver de fora encontra um aviso onde estaria a página. Isso só se aguenta enquanto o diretório inteiro for só por convite.",
  "personasExplainer.note":
    "As recomendações e quem te segue ficam num único perfil alternativo, por isso o que um lado de ti constrói fica com esse lado.",
  "personasExplainer.requestInviteCta": "Pedir um convite",
  "personasExplainer.signInCta": "Já faço parte",
  "subprofiles.proofEverywhereNote":
    "Um único perfil tende a tornar-se na versão de ti mais fácil de explicar. O resto fica de fora.",
  "subprofiles.everywhereElse": "Em qualquer outro lado",
  "subprofiles.proofCrampRoles":
    "artista de drag · ceramista · crítica musical",
  "subprofiles.pickerLabel": "Escolhe um lado para pré-visualizar",
  "subprofiles.oneAccount": "Uma conta",
  "subprofiles.stage.lede":
    "Designer de dia, DJ à noite, ou um lado de ti que preferes manter à parte. Cada lado pode ter o seu perfil alternativo, com página, público e visibilidade próprios.",
  "subprofiles.stage.audienceHeading": "Quem vê isto",
  "subprofiles.visibility.open": "Aberto a todas as pessoas",
  "subprofiles.visibility.openHelp":
    "Qualquer pessoa da comunidade o pode encontrar.",
  "subprofiles.visibility.network": "A tua rede",
  "subprofiles.visibility.networkHelp":
    "Só as pessoas com quem tens ligação o podem ver.",
  "subprofiles.link.main": "Perfil principal",
  "subprofiles.link.mainHelp": "O perfil por que as pessoas já te conhecem.",
  "subprofiles.link.linked": "Ligado ao teu nome",
  "subprofiles.link.linkedHelp":
    "Aparece no teu perfil principal, por isso as pessoas sabem que és tu.",
  "subprofiles.link.standalone": "Autónomo",
  "subprofiles.link.standaloneHelp":
    "Existe por si só, à parte do teu perfil principal.",

  // Ver nota equivalente em en/homepage.ts: os quatro perfis de exemplo são
  // a mesma exceção intencional. Os nomes próprios mantêm-se em
  // personasShowcase.data.ts, fora do catálogo — nomes não se traduzem.
  "subprofiles.personas.main.role": "Designer de produto",
  "subprofiles.personas.main.sub": "Fintech, há seis anos · Arroios",
  "subprofiles.personas.main.cta": "Ver o trabalho",
  "subprofiles.personas.main.bio":
    "Designer de produto em fintech, com casos de estudo e disponibilidade para consultoria.",
  "subprofiles.personas.main.meta.0": "Aberta a consultoria",
  "subprofiles.personas.main.meta.1": "4 casos de estudo",
  "subprofiles.personas.main.meta.2": "Fala inglês e português",
  "subprofiles.personas.main.tiles.0.label": "Caso de estudo",
  "subprofiles.personas.main.tiles.1.label": "Caso de estudo",
  "subprofiles.personas.main.tiles.2.label": "Palestra",
  "subprofiles.personas.main.foot":
    "O teu perfil principal. Aquele por que as pessoas já te conhecem.",
  "subprofiles.personas.main.note":
    "A falar como tu própria: a carreira em design de produto, a que todas as redes já conhecem.",
  "subprofiles.personas.main.laneLabel": "design de produto",

  "subprofiles.personas.mara.role": "Artista de drag",
  "subprofiles.personas.mara.sub": "Anjos · a atuar desde 2018",
  "subprofiles.personas.mara.cta": "Marcar um espetáculo",
  "subprofiles.personas.mara.bio":
    "Espetáculos nos Anjos desde 2018, com cachet público e disponibilidade para festivais.",
  "subprofiles.personas.mara.meta.0": "Dois espetáculos por mês",
  "subprofiles.personas.mara.meta.1": "Tabela de preços pública",
  "subprofiles.personas.mara.meta.2": "Viaja para festivais",
  "subprofiles.personas.mara.tiles.0.label": "Foto do espetáculo",
  "subprofiles.personas.mara.tiles.1.label": "Foto do espetáculo",
  "subprofiles.personas.mara.tiles.2.label": "Cartaz da tour",
  "subprofiles.personas.mara.foot":
    "Tudo o que precisam de saber sobre o trabalho da Sofia como artista, sem o resto do perfil dela pelo meio.",
  "subprofiles.personas.mara.note":
    "A falar como Mara: quem contrata vê os espetáculos, as fotos e o cachet. O currículo de design de produto fica fora desta página.",
  "subprofiles.personas.mara.laneLabel": "drag",

  "subprofiles.personas.atelier.role": "Estúdio de cerâmica, duas pessoas",
  "subprofiles.personas.atelier.sub": "Graça · encomendas e venda por grosso",
  "subprofiles.personas.atelier.cta": "Encomendar uma peça",
  "subprofiles.personas.atelier.bio":
    "Ateliê de cerâmica na Graça gerido por duas pessoas, com encomendas e venda por grosso.",
  "subprofiles.personas.atelier.meta.0": "Encomendas abertas",
  "subprofiles.personas.atelier.meta.1": "Lista de venda por grosso",
  "subprofiles.personas.atelier.meta.2": "Workshops aos sábados",
  "subprofiles.personas.atelier.tiles.0.label": "Peça acabada",
  "subprofiles.personas.atelier.tiles.1.label": "Peça acabada",
  "subprofiles.personas.atelier.tiles.2.label": "O estúdio",
  "subprofiles.personas.atelier.foot":
    "Creditado ao ateliê: uma página inicial partilhada que duas pessoas podem gerir.",
  "subprofiles.personas.atelier.note":
    "A falar como o estúdio: compradores e galerias veem o trabalho e os preços, creditados ao ateliê em vez de a ti.",
  "subprofiles.personas.atelier.laneLabel": "cerâmica",

  "subprofiles.personas.byline.role": "Crítica musical",
  "subprofiles.personas.byline.sub": "Assinaturas em três revistas desde 2021",
  "subprofiles.personas.byline.cta": "Ler os artigos",
  "subprofiles.personas.byline.bio":
    "Crítica musical com assinaturas em três revistas, focada em clubbing e diáspora.",
  "subprofiles.personas.byline.meta.0": "Área: clubbing e diáspora",
  "subprofiles.personas.byline.meta.1": "Nota de proposta disponível",
  "subprofiles.personas.byline.meta.2": "Encomendas a partir de 180 €",
  "subprofiles.personas.byline.tiles.0.label": "Reportagem",
  "subprofiles.personas.byline.tiles.1.label": "Crítica de álbum",
  "subprofiles.personas.byline.tiles.2.label": "Entrevista",
  "subprofiles.personas.byline.foot":
    "Um pseudónimo com portefólio. Os artigos falam por si, sem o trabalho do dia a dia associado.",
  "subprofiles.personas.byline.note":
    "A falar como o pseudónimo: quem edita vê os artigos e a área que cobres, com o teu trabalho do dia a dia fora disso.",
  "subprofiles.personas.byline.laneLabel": "crítica musical",

  // ── Outro (chamada final) ──────────────────────────────────────────────────
  "outro.title": "Entra onde <em>já pertences.</em>",
  "outro.sub":
    "A QueerPulse é uma comunidade só por convite, construída sobre confiança, curiosidade e a crença de que ligações genuínas podem mudar vidas e cidades.",
  "outro.cta": "Pedir um convite",
};
