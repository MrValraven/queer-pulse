import type { Catalog } from "../../types";

/** pt-PT — see `en/culture.ts` for the scope-rule note (book/film/album
 * titles, member quotes/bios, commission pitches, gallery credits and radio
 * track/curator content are fictional-user content and stay English) and for
 * which forms record through the generic intake pipeline. */
export const culture: Catalog = {
  "tabs.club": "Clube de Livro · Cinema · Música",
  "tabs.commission": "Quadro de Encomendas",
  "tabs.showcase": "Mostra de Arte",
  "tabs.radio": "Rádio",

  // ── Metadados da página (FE-CNT-12) ────────────────────────────────────
  "meta.title": "Cultura: Revista QueerPulse",
  "meta.description":
    "Os clubes, encomendas, mostras e rádio que compõem a vida cultural queer em Lisboa.",

  "hero.eyebrow": "Cena e rádio de Lisboa",
  "hero.title": "A <em>cena</em> queer de Lisboa.",
  "hero.lead":
    "Os clubes, encomendas, mostras e rádio que compõem a vida cultural queer da cidade: com curadoria da comunidade, sempre em mudança.",
  "outro.title": "Cria algo <em>connosco.</em>",
  "outro.sub":
    "Cultura é o que construímos entre os eventos, em silêncio, com constância, juntes.",
  "outro.submitWorkCta": "Submeter o teu trabalho",
  "outro.exploreCommunitiesCta": "Explorar comunidades",

  "club.picksHeading": "As <em>escolhas</em> deste mês.",
  "club.picksSub":
    "Com curadoria da comunidade. Vota na seleção do próximo mês em todos os últimos domingos.",
  "club.suggestPickCta": "+ Sugerir uma escolha",
  "club.kind.book": "Livro",
  "club.kind.film": "Filme",
  "club.kind.music": "Música",
  "club.picks.eventKind.meets": "Reúne a {date}",
  "club.picks.eventKind.screening": "Exibição a {date}",
  "club.picks.eventKind.listeningParty": "Sessão de escuta a {date}",
  "club.picks.discussing_one": "{count} pessoa a comentar",
  "club.picks.discussing_other": "{count} pessoas a comentar",
  "club.discussionsHeading": "<em>Discussões</em> recentes.",
  "club.replies_one": "{count} resposta",
  "club.replies_other": "{count} respostas",
  "club.emptyLive.title": "Escolhas e discussões em breve",
  "club.emptyLive.description":
    "Quando o clube arrancar, as escolhas do mês e as conversas à volta delas vão viver aqui.",

  "commissions.heading": "Encomendas <em>criativas.</em>",
  "commissions.sub":
    "Estou a criar algo. Ajuda-me a torná-lo melhor. Mais estruturado do que o quadro aberto.",
  "commissions.postProjectCta": "+ Publicar um projeto",
  "commissions.cat.photo": "Fotografia",
  "commissions.cat.music": "Música",
  "commissions.cat.writing": "Escrita",
  "commissions.cat.design": "Design",
  "commissions.cat.film": "Cinema",
  "commissions.expressInterestCta": "Manifestar interesse",
  "commissions.interestSent": "Interesse enviado",
  "commissions.emptyLive.title": "Encomendas abertas em breve",
  "commissions.emptyLive.description":
    "Quando as pessoas começarem a publicar projetos e a procurar colaborações, os apelos vão aparecer aqui.",

  "showcase.heading": "Trabalho da <em>comunidade.</em>",
  "showcase.sub":
    "Exposição rotativa: 8 trabalhos exibidos de cada vez. Submissões revistas mensalmente.",
  "showcase.submitWorkCta": "+ Submeter o teu trabalho",
  "showcase.emptyLive.title": "Trabalhos em destaque em breve",
  "showcase.emptyLive.description":
    "A mostra rotativa de trabalhos da comunidade ainda está a ser preparada. Sê a primeira pessoa a submeter o teu.",

  "radio.heading": "Rádio da <em>comunidade.</em>",
  "radio.sub":
    "Presença cultural ambiente, com curadoria de DJs rotativos. Sem algoritmo. Sem anúncios.",
  "radio.submitPlaylistCta": "Submeter uma playlist",
  "radio.emptyLive.title": "Programação de rádio em breve",
  "radio.emptyLive.description":
    "A rádio da comunidade ainda não está no ar. Quando alguém da curadoria pegar no primeiro turno, vais ouvi-lo aqui.",
  "radio.curatorLabel": "Curadoria desta semana",
  "radio.curatedBy": "com curadoria de {name}",
  "radio.becomeCurator": "Torna-te curador",
  "radio.nowPlaying": "A tocar agora",
  "radio.upNext": "A seguir",
  "radio.previousTrack": "Faixa anterior",
  "radio.nextTrack": "Faixa seguinte",
  "radio.play": "Reproduzir",
  "radio.playbackNote":
    "A reprodução ainda não está ativa. Isto mostra o que está no ar neste momento.",

  "modal.dialogAriaLabel": "Janela",
  "modal.done": "Concluído",
  "common.cancel": "Cancelar",
  "common.sending": "A enviar…",

  "suggestPick.title": "Sugerir uma <em>escolha</em>",
  "suggestPick.sub": "Nomeia algo para a comunidade votar este mês.",
  "suggestPick.formatLabel": "Formato",
  "suggestPick.titleLabel": "Título",
  "suggestPick.titlePlaceholder": "p.ex. Detransition, Baby",
  "suggestPick.authorLabel": "Autor / artista / realizador",
  "suggestPick.authorPlaceholder": "Quem criou isto?",
  "suggestPick.whyLabel": "Porquê esta escolha?",
  "suggestPick.whyPlaceholder":
    "Uma frase sobre porque é que o clube devia escolher isto…",
  "suggestPick.nominateCta": "Nomear escolha",
  "suggestPick.success.title": "Escolha",
  "suggestPick.success.em": "nomeada.",
  "suggestPick.success.body":
    "Recebemos a tua nomeação. A comunidade decide o que lemos, vemos e ouvimos a seguir.",
  "suggestPick.success.step1": "Entra na votação de último domingo.",
  "suggestPick.success.step2":
    "O resultado é publicado aqui nesta página depois da votação.",

  "postProject.title": "Publicar um <em>projeto</em>",
  "postProject.sub":
    "Conta à comunidade o que estás a criar e de quem precisas.",
  "postProject.titleLabel": "Título do projeto",
  "postProject.titlePlaceholder": "O que estás a criar?",
  "postProject.descLabel": "Descrição",
  "postProject.descPlaceholder":
    "O que é, em que ponto estás, e como é a colaboração…",
  "postProject.lookingForLabel": "À procura de",
  "postProject.postCta": "Publicar projeto",
  "postProject.success.title": "Projeto",
  "postProject.success.em": "publicado.",
  "postProject.success.body":
    "Recebemos o teu projeto. O quadro ainda é pequeno, por isso as publicações ainda não são associadas automaticamente a colaboradores.",
  "postProject.success.step1": "Está guardado e visível para a nossa equipa.",
  "postProject.success.step2":
    "Se alguém quiser avançar como colaborador, uma curadora responde-te por mensagem na QueerPulse.",

  "submitWork.title": "Submete o teu <em>trabalho</em>",
  "submitWork.sub":
    "Até três peças. Revisto mensalmente por pessoas curadoras da comunidade.",
  "submitWork.titleLabel": "Título do trabalho",
  "submitWork.titlePlaceholder": "p.ex. Corpo Estranho, 2024",
  "submitWork.mediumLabel": "Suporte",
  "submitWork.mediumPlaceholder": "Escolhe um suporte",
  "submitWork.linkLabel": "Ligação para o trabalho",
  "submitWork.linkPlaceholder": "URL do portefólio, imagem ou vídeo",
  "submitWork.aboutLabel": "Sobre a peça",
  "submitWork.aboutPlaceholder":
    "Uma breve nota que as pessoas curadoras possam ler…",
  "submitWork.submitCta": "Submeter trabalho",
  "submitWork.success.title": "Trabalho",
  "submitWork.success.em": "submetido.",
  "submitWork.success.body":
    "Recebemos o teu trabalho. A mostra roda oito peças de cada vez, escolhidas pela comunidade.",
  "submitWork.success.step1": "Está guardado na fila da mostra.",
  "submitWork.success.step2":
    "Se for selecionado, uma curadora responde-te por mensagem na QueerPulse.",

  "submitPlaylist.eyebrow": "Rádio da Comunidade",
  "submitPlaylist.title": "Submeter uma <em>playlist</em>",
  "submitPlaylist.sub":
    "Propõe um set para um lugar de DJ convidade. Sem anúncios, sem algoritmo.",
  "submitPlaylist.nameLabel": "Nome da playlist",
  "submitPlaylist.namePlaceholder": "p.ex. A noite que ficou em Lisboa",
  "submitPlaylist.linkLabel": "Ligação para o set",
  "submitPlaylist.linkPlaceholder":
    "URL do Spotify, SoundCloud ou de uma tracklist",
  "submitPlaylist.vibeLabel": "Ambiente",
  "submitPlaylist.noteLabel": "Nota da curadoria",
  "submitPlaylist.notePlaceholder": "Para quando é isto? Sobre o que é?…",
  "submitPlaylist.submitCta": "Submeter playlist",
  "submitPlaylist.success.title": "Playlist",
  "submitPlaylist.success.em": "recebida.",
  "submitPlaylist.success.body":
    "Recebemos a tua playlist. Rodamos as pessoas convidadas para o som se manter humano.",
  "submitPlaylist.success.step1":
    "Está guardada aqui para uma pessoa da curadoria considerar.",
  "submitPlaylist.success.step2":
    "Se conseguirmos reservar-te um lugar, uma curadora responde-te por mensagem na QueerPulse.",

  "commissionInterest.errorToast":
    "Não foi possível enviar o teu interesse. Tenta novamente.",
  "commissionInterest.eyebrow": "Manifestar interesse",
  "commissionInterest.title": "Contacta <em>{name}</em>",
  "commissionInterest.sub":
    "Conta-lhes um pouco sobre ti e porque é que este projeto te fala. Só verão isto se enviares.",
  "commissionInterest.messageLabel": "A tua mensagem (opcional)",
  "commissionInterest.messagePlaceholder":
    "O que trarias, o que já fizeste antes, ou apenas um olá…",
  "commissionInterest.sendCta": "Enviar interesse",
  "commissionInterest.success.title": "Interesse",
  "commissionInterest.success.em": "enviado.",
  "commissionInterest.success.body":
    "Vamos ligar-te a {name} se quiser avançar com isto.",
  "commissionInterest.success.step1":
    "{name} pode ver a tua nota e o teu perfil.",
  "commissionInterest.success.step2":
    "Se quiser avançar, a apresentação acontece por mensagem na QueerPulse.",
  "commissionInterest.success.step3":
    "Sem pressão de qualquer forma. As colaborações aqui são sempre um sim de ambos os lados.",

  "options.lookingFor.writer": "Escrita",
  "options.lookingFor.editor": "Edição",
  "options.lookingFor.photographer": "Fotografia",
  "options.lookingFor.illustrator": "Ilustração",
  "options.lookingFor.designer": "Design",
  "options.lookingFor.musician": "Música",
  "options.lookingFor.translator": "Tradução",
  "options.lookingFor.sensitivityReader": "Leitura de sensibilidade",
  "options.lookingFor.studioSpace": "Espaço de estúdio",
  "options.medium.photography": "Fotografia",
  "options.medium.painting": "Pintura",
  "options.medium.illustration": "Ilustração",
  "options.medium.mixedMedia": "Técnica mista",
  "options.medium.ceramics": "Cerâmica",
  "options.medium.digital": "Digital",
  "options.medium.performance": "Performance",
  "options.medium.installation": "Instalação",
  "options.vibe.lateNight": "Noite dentro",
  "options.vibe.tender": "Terno",
  "options.vibe.joyful": "Alegre",
  "options.vibe.political": "Político",
  "options.vibe.ambient": "Ambiente",
  "options.vibe.dancefloor": "Pista de dança",
  "options.vibe.healing": "Cura",
  "options.vibe.nostalgic": "Nostálgico",

  // ── Página "ainda não lançado" em modo live (CultureComingSoon, CON-14) ───
  // Os conteúdos de todos os separadores são curadoria só de demonstração, sem
  // qualquer forma de publicar, por isso em modo live /magazine/culture resolve
  // aqui e a entrada no meganav desaparece.
  "comingSoon.metaTitle": "Cultura: em breve na QueerPulse",
  "comingSoon.title": "A Cultura ainda está a ser montada",
  "comingSoon.description":
    "As escolhas de noite, o quadro de encomendas, a montra de arte e a rádio comunitária ainda estão a ser construídos e não há nada publicado. Entretanto, a revista já está a sair e é nas comunidades que a cena se organiza.",
  "comingSoon.magazineCta": "Ler a revista",
  "comingSoon.communitiesCta": "Explorar comunidades",

  // Deep-scan section 13 (the vertical surfaces), built 2026-08-31.
  // PRD-46 — PRD-46 - the live commission-interest page carved out of the Culture coming-soon gate, plus the panel on CultureComingSoon that offers it. Success copy promises the admin queue and nothing else: QueerPulse sends no email and the backend has no commission_interest notification, so no reply of any kind reaches the member.
  "commissionInterestPage.metaTitle": "Registar interesse numa encomenda",
  "commissionInterestPage.metaDescription":
    "Diz à equipa de cultura o que gostarias de encomendar enquanto o Quadro de Encomendas está a ser construído.",
  "commissionInterestPage.hubLabel": "Cultura",
  "commissionInterestPage.eyebrow": "Quadro de Encomendas",
  "commissionInterestPage.title": "Registar interesse numa <em>encomenda</em>",
  "commissionInterestPage.intro":
    "O Quadro de Encomendas ainda está a ser construído, por isso ainda não há nada para explorar. O que já funciona é este formulário: regista o que procuras e com quem gostarias de trabalhar.",
  "commissionInterestPage.introReach":
    "O que enviares vai para a fila da equipa de cultura, onde alguém da administração ou da equipa editorial o lê. Nada disto é publicado e ninguém fora dessa equipa o vê.",
  "commissionInterestPage.titleLabel": "O que gostarias de encomendar",
  "commissionInterestPage.titleHelper":
    "Uma descrição curta da peça ou do projeto. Por exemplo: retratos para a capa de uma fanzine do Orgulho.",
  "commissionInterestPage.categoryLabel": "Tipo de trabalho",
  "commissionInterestPage.categoryHelper":
    "A opção mais próxima. A equipa lê as tuas outras respostas em conjunto com esta.",
  "commissionInterestPage.recipientLabel": "Com quem gostarias de trabalhar",
  "commissionInterestPage.recipientHelper":
    "Indica uma pessoa ou um coletivo. Se não te ocorrer ninguém em concreto, descreve o tipo de pessoa que procuras.",
  "commissionInterestPage.messageLabel": "Algo mais que queiras acrescentar",
  "commissionInterestPage.messageHelper":
    "Opcional. Orçamento, prazos, referências ou a forma como queres trabalhar.",
  "commissionInterestPage.submitCta": "Registar interesse",
  "commissionInterestPage.sending": "A enviar",
  "commissionInterestPage.error.title": "Não foi possível enviar.",
  "commissionInterestPage.error.body":
    "As tuas respostas continuam aqui. Verifica a ligação e envia outra vez.",
  "commissionInterestPage.error.retryCta": "Tentar de novo",
  "commissionInterestPage.success.title": "Interesse",
  "commissionInterestPage.success.em": "registado",
  "commissionInterestPage.success.body":
    "O que enviaste ficou guardado e está agora na fila que a equipa de cultura lê.",
  "commissionInterestPage.success.step1":
    "A equipa vê o que escreveste, juntamente com o teu nome na QueerPulse.",
  "commissionInterestPage.success.step2":
    "O Quadro de Encomendas ainda está a ser construído, por isso nada do que enviaste é publicado.",
  "commissionInterestPage.success.step3":
    "Daqui não sai nenhuma resposta. A QueerPulse não envia e-mails nem cria notificações para isto, por isso não fica nada à tua espera numa caixa de entrada.",
  "commissionInterestPage.success.backCta": "Voltar a Cultura",
  "commissionInterestPage.success.anotherCta": "Registar outro interesse",
  "comingSoon.commissions.title":
    "O Quadro de Encomendas está a ser construído",
  "comingSoon.commissions.body":
    "Ainda não há nada publicado nele. Podes na mesma dizer à equipa de cultura o que gostarias de encomendar, e isso vai direto para a fila que eles leem.",
  "comingSoon.commissions.cta": "Registar interesse",

  // Deep-scan section 13 (the vertical surfaces), built 2026-08-31.
  // PRD-46 — PRD-46 - the live commission-interest page carved out of the Culture coming-soon gate, plus the panel on CultureComingSoon that offers it. Success copy promises the admin queue and nothing else: QueerPulse sends no email and the backend has no commission_interest notification, so no reply of any kind reaches the member.
};
