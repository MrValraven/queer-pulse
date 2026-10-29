import type { Catalog } from "../../types";

/**
 * Studio — pt-PT inclusivo. Mesmas chaves que `en/studio.ts`.
 *
 * Notas de tradução:
 * - "Studio" e "Cinema" são nomes de marca/produto e nunca são traduzidos
 *   (ver `docs/i18n/glossary-pt.md`).
 * - "Members" → *pessoas*, nunca *Membros*.
 * - Registo `tu`, caloroso, nunca `você`.
 * - Nomes de artistas, faixas, álbuns, listas de reprodução e letras ficam em
 *   inglês — em modo live vêm da API como texto de quem os escreveu/gravou.
 */
export const studio: Catalog = {
  // ── Barra superior da shell (StudioShell) ─────────────────────────────────
  "shell.back": "Voltar",
  "shell.historyLabel": "Histórico de páginas",
  "shell.forward": "Avançar",
  "shell.searchPlaceholder": "pesquisar artistas, faixas, partituras…",
  "shell.sustainCta": "Contribuir · {price}/mês",

  // ── Marca (repetida na shell/rail/páginas de erro/entrar) ─────────────────
  "brand.lockup": "Queer<em>Pulse</em>",
  "brand.studioLabel": "Studio",

  // ── Menu lateral (StudioRail) ──────────────────────────────────────────────
  "rail.section.contribute": "Contribuir",
  "rail.section.coop": "A cooperativa",

  "rail.main.home": "Início",
  "rail.main.wednesdaySet": "O set de quarta-feira",
  "rail.main.browse": "Explorar",
  "rail.main.sheetMusic": "Partituras",
  "rail.main.liveBroadcasts": "Transmissões ao vivo",
  "rail.main.notifications": "Notificações",

  "rail.contribute.submitSet": "Submeter um set",
  "rail.contribute.goLive": "Transmitir ao vivo",
  "rail.contribute.openCalls": "Concursos abertos",
  "rail.contribute.rightsTakedown": "Direitos e remoção",
  "rail.contribute.solidarityFund": "Fundo de solidariedade",

  "rail.governance.programWeek": "Programar a semana",
  "rail.governance.curationCouncil": "Conselho de curadoria",
  "rail.governance.submissionInbox": "Caixa de submissões",

  "rail.utility.about": "Sobre a cooperativa",
  "rail.utility.help": "Ajuda e perguntas frequentes",
  "rail.utility.accessibility": "Acessibilidade",
  "rail.utility.trustTerms": "Confiança e termos",

  "rail.foot.sustainedSince": "<em>Sustentas</em> o Studio desde {date}.",
  "rail.foot.paid_one":
    "Já compraste <b>{amount}</b> em música a {count} artista este ano.",
  "rail.foot.paid_other":
    "Já compraste <b>{amount}</b> em música a {count} artistas este ano.",

  "railPlaylists.label": "A tua biblioteca",
  "railPlaylists.autoPlaylist": "Playlist automática",
  "railPlaylists.savedFallback": "Playlist guardada",
  "railPlaylists.empty":
    "Cria uma playlist ou dá gosto a um álbum e aparece aqui",
  "railPlaylists.loadError": "Não conseguimos carregar a tua biblioteca",
  "railPlaylists.releaseMeta": "Álbum · {artist}",
  "railPlaylists.releaseFallback": "Álbum",
  "railPlaylists.menu.label": "Ações de {name}",
  "railPlaylists.menu.removeSaved": "Remover da tua biblioteca",
  "railPlaylists.sortLabel": "Ordenar",
  "railPlaylists.filterLabel": "Filtrar a tua biblioteca",
  "railPlaylists.filterPlaceholder": "Filtrar a biblioteca",
  "railPlaylists.noMatches": 'Nada na tua biblioteca corresponde a "{query}"',
  "railPlaylists.create.label": "Criar",
  "railPlaylists.create.triggerLabel": "Criar playlist ou pasta",
  "railPlaylists.create.menuLabel": "Criar uma playlist ou uma pasta",

  "playlistFolders.create.menuItem": "Criar pasta",
  "playlistFolders.defaultName": "Nova pasta",
  "playlistFolders.count_one": "{count} playlist",
  "playlistFolders.count_other": "{count} playlists",
  "playlistFolders.listLabel": "Playlists em {name}",
  "playlistFolders.emptyHint":
    "Escolhe Mover para pasta no menu de uma playlist, ou arrasta uma para aqui",
  "playlistFolders.moveOutDropHint": "Larga aqui para a tirar da pasta",
  "playlistFolders.rename.fieldLabel": "Nome da pasta",
  "playlistFolders.rename.title": "Mudar o nome da pasta",
  "playlistFolders.rename.saveCta": "Guardar nome",
  "playlistFolders.create.title": "Criar pasta",
  "playlistFolders.create.createCta": "Criar pasta",
  "playlistFolders.create.withPlaylistSub": "{name} entra nela logo",
  "playlistFolders.create.createdToast": "Pasta {name} criada",
  "playlistFolders.nameLabel": "Nome",
  "playlistFolders.nameRequired": "Dá um nome à tua pasta",
  "playlistFolders.namePlaceholder": "Noites longas",
  "playlistFolders.move.title": "Mover {name} para uma pasta",
  "playlistFolders.move.legend": "Pasta",
  "playlistFolders.move.noFolder": "Sem pasta",
  "playlistFolders.move.moveCta": "Mover playlist",
  "playlistFolders.move.movedToast": "{playlist} foi para {folder}",
  "playlistFolders.move.movedOutToast": "{playlist} saiu da pasta",
  "playlistFolders.menu.label": "Ações da pasta {name}",
  "playlistFolders.menu.rename": "Mudar o nome da pasta",
  "playlistFolders.menu.delete": "Apagar pasta",
  "playlistFolders.menu.moveToFolder": "Mover para pasta",
  "playlistFolders.menu.moveToNewFolder": "Mover para nova pasta",
  "playlistFolders.menu.removeFromFolder": "Tirar de {name}",
  "playlistFolders.delete.title": "Apagar {name}?",
  "playlistFolders.delete.body":
    "A pasta desaparece de vez. As playlists dela voltam para a tua lista tal como estão",
  "playlistFolders.delete.confirmCta": "Apagar pasta",
  "playlistFolders.delete.deletedToast": "Pasta {name} apagada",
  "playlistFolders.errors.notFound":
    "Esta pasta já não existe. Talvez a tenhas apagado noutro dispositivo",
  "playlistFolders.errors.limit": "Podes ter até 50 pastas",
  "playlistFolders.errors.playlistUnavailable":
    "Uma pasta guarda playlists que criaste, editas ou guardaste, e esta já não está aberta para ti",
  "playlistFolders.library.title": "As tuas <em>pastas</em>",
  "playlistFolders.library.emptyHint":
    "Ainda não há nada aqui. Escolhe Mover para pasta no menu de uma playlist, ou arrasta uma para esta pasta na lista lateral",

  // ── Etiquetas partilhadas nos cartões de faixas/lançamentos ───────────────
  "tag.free": "Grátis",
  "tag.sustainer": "Apoiante",
  "tag.replay": "Reposição",

  // ── Controlos do leitor (StudioPlayer + reutilizados noutros pontos) ─────
  "player.prev": "Anterior",
  "player.play": "Reproduzir",
  "player.next": "Seguinte",
  "player.tipCta": "Dar {amount}",
  "player.buyLine": "<b>100%</b> de uma compra vai para {artist}",

  // ── Hero da sala "Esta semana" (StudioPageSections → StudioHero) ─────────
  "room.hero.listening_one": "{count} pessoa a ouvir",
  "room.hero.listening_other": "{count} pessoas a ouvir",
  "room.hero.addedToast": "Adicionada à tua biblioteca",
  "room.hero.removedToast": "Removida da tua biblioteca",
  "room.hero.inLibrary": "Na biblioteca",
  "room.hero.addLibrary": "Biblioteca",
  "room.hero.payNote": "Gostas? <em>Compra</em> diretamente a {artist}.",
  "room.hero.tipOnTop": "Queres dar mais? 100% para quem faz.",

  // ── Secção do set "Esta semana" ────────────────────────────────────────────
  "room.set.title": "O set de quarta-feira, <em>ao vivo</em>",
  "room.set.subtitle":
    "Programado por {curator} · em simultâneo · {count} a ouvir",
  "room.set.readPlanCta": "Ler o plano",
  "room.set.sideHeading": "A ouvir contigo",
  "room.set.sideSub":
    "{sustainers} apoiantes · {casual} ocasionais · {cities} cidades",
  "room.set.fee.heading": "A tua quota de apoiante paga",
  "room.set.fee.hosting": "O alojamento",
  "room.set.fee.curators": "As ajudas de custo da curadoria",
  "room.set.fee.fund": "O fundo de solidariedade",
  "room.set.fee.artistShare": "Uma parte para artistas",
  "room.set.fee.artistShareStatus": "Prevista",

  // ── Páginas de erro (Studio404Page, Studio500Page) ────────────────────────
  "error404.kind.release.eyebrow": "Lançamento não encontrado",
  "error404.kind.release.title": "Este lançamento <em>não está aqui.</em>",
  "error404.kind.track.eyebrow": "Faixa não encontrada",
  "error404.kind.track.title": "Esta faixa <em>não está aqui.</em>",
  "error404.kind.artist.eyebrow": "Página de artista não encontrada",
  "error404.kind.artist.title":
    "Esta página de artista <em>não está aqui.</em>",
  "error404.kind.playlist.eyebrow": "Playlist não encontrada",
  "error404.kind.playlist.title": "Esta playlist <em>não está aqui.</em>",
  "error404.kind.scene.eyebrow": "Cena não encontrada",
  "error404.kind.scene.title": "Esta cena <em>não está aqui.</em>",
  "error404.kind.pressKit.eyebrow": "Kit de imprensa não encontrado",
  "error404.kind.pressKit.title":
    "Este kit de imprensa <em>não está aqui.</em>",
  "error404.kind.page.eyebrow": "Página não encontrada",
  "error404.kind.page.title": "Esta página <em>não está aqui.</em>",
  "error404.body":
    "O link pode ter um erro, ou o que mostrava foi retirado ou passou a privado. A pesquisa ou a tua biblioteca levam-te de volta à música.",
  "error404.backCta": "Ir para o início do Studio",
  "error404.goBackCta": "Voltar atrás",
  "error404.tryInsteadTitle": "Experimenta uma destas",
  "error404.link.search.label": "<em>Pesquisar</em> no catálogo",
  "error404.link.search.sub": "Lançamentos, faixas, artistas e playlists",
  "error404.link.library.label": "A tua <em>biblioteca</em>",
  "error404.link.library.sub":
    "As tuas playlists, Músicas de que gostas e o que guardaste",
  "error404.link.home.label": "Início do <em>Studio</em>",
  "error404.link.home.sub": "Lançamentos novos e cenas perto de ti",

  "error500.eyebrow": "Erro na página",
  "error500.title": "Esta página <em>parou.</em>",
  "error500.body":
    "Uma falha no código do Studio parou esta página enquanto aparecia. Tenta outra vez e, se voltar a parar, vai ao início do Studio e abre-a a partir daí.",
  "error500.tryAgainCta": "Tentar outra vez",
  "error500.backCta": "Ir para o início do Studio",
  "error500.reloadCta": "Recarregar o Studio",

  // ── Página de apresentação do Studio (landing/StudioLandingPage e secções) ─
  // Tudo o que aqui se afirma é verdade hoje em live, exceto a secção
  // "plan.*", que está identificada como o plano e não tem números.
  "landing.metaTitle": "Studio QueerPulse: a cena de música queer de Lisboa",
  "landing.description":
    "Ouve artistas queer de Lisboa, lança a tua música de graça, com nome artístico se quiseres, e encontra os eventos onde tudo isto toca ao vivo. Grátis para quem faz parte, aberto pela nossa equipa por fases.",
  "landing.ogImageAlt":
    "A página inicial do Studio num portátil, com os lançamentos e as cenas desta semana",
  "landing.hero.eyebrow": "Studio QueerPulse",
  "landing.hero.title":
    "A cena de música queer de Lisboa, <em>num só leitor</em>.",
  "landing.hero.lede":
    "Ouve hoje quem vais ver na sexta, numa seleção feita por pessoas que vão às mesmas noites que tu.",
  "landing.hero.status":
    "Grátis para quem faz parte do QueerPulse. A nossa equipa abre o acesso por fases.",
  "landing.hero.seeInside": "Ver por dentro",
  "landing.cta.requestInvite": "Pedir um convite",
  "landing.cta.memberNote":
    "A nossa equipa abre o Studio por fases, primeiro para quem faz música. Pede agora e recebes uma notificação quando abrir para ti.",
  "landing.gallery.eyebrow": "Como funciona",
  "landing.gallery.title": "O Studio, <em>ecrã a ecrã</em>",
  "landing.gallery.sampleNote":
    "Estes ecrãs mostram artistas e pessoas de exemplo.",
  "landing.gallery.home.tab": "Início",
  "landing.gallery.home.caption":
    "Os lançamentos da semana, as cenas e as prateleiras, escolhidos à mão pela nossa equipa. Ninguém paga por um lugar.",
  "landing.gallery.home.alt":
    "A página inicial do Studio, com filtros por formato, a prateleira Escolhas da equipa, o início de Novidades da semana e o leitor em baixo",
  "landing.gallery.home.phoneAlt":
    "A página inicial do Studio num telemóvel, a abrir no lançamento em destaque, com a capa e um botão para o ouvir",
  "landing.gallery.artist.tab": "Página de artista",
  "landing.gallery.artist.caption":
    "Cada artista tem uma página com os seus lançamentos, a sua história, um kit de imprensa e os próximos eventos no QueerPulse.",
  "landing.gallery.artist.alt":
    "Uma página de artista, com a foto, os lançamentos, o número de seguidores e um botão para seguir",
  "landing.gallery.artist.phoneAlt":
    "Uma página de artista num telemóvel, com a foto, o número de lançamentos e de seguidores e um botão para seguir",
  "landing.gallery.release.tab": "Lançamento",
  "landing.gallery.release.caption":
    "Alinhamento, créditos e avisos de conteúdo antes de a faixa tocar. Discos feitos para correr seguidos tocam sem pausas.",
  "landing.gallery.release.alt":
    "Uma página de lançamento, com a capa, uma nota sobre o que mudou na nova versão, o alinhamento e uma ligação para comprar o álbum a quem o fez",
  "landing.gallery.release.phoneAlt":
    "Uma página de lançamento num telemóvel, com a capa e uma nota sobre o que mudou na nova versão",
  "landing.gallery.playlists.tab": "Playlists em conjunto",
  "landing.gallery.playlists.caption":
    "Cria playlists com as tuas ligações e vê quem adicionou cada faixa.",
  "landing.gallery.playlists.alt":
    "Uma playlist partilhada, com quem a edita e quem adicionou cada faixa",
  "landing.gallery.playlists.phoneAlt":
    "Uma playlist partilhada num telemóvel, marcada como colaborativa, com quem adicionou cada uma das três faixas",
  "landing.gallery.player.tab": "Leitor",
  "landing.gallery.player.caption":
    "O leitor acompanha-te por todo o QueerPulse, com fila e transição entre faixas.",
  "landing.gallery.player.alt":
    "O ecrã A tocar agora num telemóvel, com a capa e uma faixa em pausa a meio",
  "landing.gallery.share.tab": "Partilhar",
  "landing.gallery.share.caption":
    "Envia uma faixa para uma conversa e ela chega como um cartão, com a tua nota por baixo.",
  "landing.gallery.share.alt":
    "Uma conversa num telemóvel, com uma faixa do Studio partilhada como cartão",
  "landing.compare.eyebrow": "Lado a lado",
  "landing.compare.title":
    "Fica com o Spotify para o resto. <em>O Studio é para a música feita à tua volta</em>.",
  "landing.compare.topicHeading": "Tema",
  "landing.compare.studioHeading": "Studio QueerPulse",
  "landing.compare.studioShort": "Studio",
  "landing.compare.featured.topic": "O que fica em destaque",
  "landing.compare.featured.studio":
    "Escolhido à mão pela nossa equipa. Ninguém paga por um lugar",
  "landing.compare.ads.topic": "Anúncios",
  "landing.compare.ads.studio": "Sem anúncios, para quem faz parte",
  "landing.compare.listening.topic": "O que ouves",
  "landing.compare.listening.studio":
    "Um histórico privado com Pausar e Limpar, e nenhum perfil feito a partir dele",
  "landing.compare.scene.topic": "A cena",
  "landing.compare.scene.studio":
    "Eventos da comunidade ligados a partir da página de artista",
  "landing.compare.owner.topic": "Quem gere",
  "landing.compare.owner.studio":
    "Feito em Lisboa, pela comunidade e para a comunidade",
  "landing.plan.eyebrow": "O plano",
  "landing.plan.chip": "Mais tarde",
  "landing.plan.title": "Para onde queremos levar o <em>Studio</em>",
  "landing.plan.intro":
    "Nada nesta secção está ativo ainda. É a direção em que estamos a trabalhar, e esta página vai dizê-lo quando mudar.",
  "landing.plan.coop.title": "Uma cooperativa",
  "landing.plan.coop.body":
    "Gerida em conjunto por artistas e ouvintes, que decidem o que toca e para onde vai o dinheiro.",
  "landing.plan.money.title": "A maior parte do dinheiro para artistas",
  "landing.plan.money.body":
    "Quando entrar dinheiro, a maior parte vai para quem fez a música, com contas abertas sobre para onde vai o resto.",
  "landing.plan.masters.title": "A tua música continua tua",
  "landing.plan.masters.body":
    "Quem faz a música mantém os seus masters e pode lançar noutros sítios também.",
  "landing.why.eyebrow": "Porque importa",
  "landing.why.quote":
    "Uma cena soa a si própria quando <em>somos nós a gravar</em>.",
  "landing.why.p1":
    "A música queer feita por pessoas queer traz o que um ouvido de fora não apanha: as noites de clube, os coros, as demos gravadas no quarto, as canções que ajudaram tanta gente a aguentar. Para muita gente, foi o primeiro sítio onde se ouviu.",
  "landing.why.p2":
    "A maioria de quem faz música em pequena escala toca meia dúzia de concertos, publica numa plataforma feita para outra gente e perde-se no algoritmo. Muito pouco do que faz lhe volta às mãos.",
  "landing.why.p3":
    "Ouvir artistas locais, partilhar as suas faixas e aparecer nos seus concertos é o que lhes permite fazer o próximo disco. É para isso que este Studio existe.",
  "landing.closing.title": "Ouve a cena <em>de que fazes parte</em>",
  "landing.closing.body":
    "O Studio faz parte do QueerPulse, a rede da comunidade. Entras com um convite, e a nossa equipa abre o Studio às pessoas por fases.",
  "landing.closing.magazineLink": "Ler a revista",
  // Studio landing v2 (2026-10-28)
  "landing.hero.audienceLabel": "O que te traz ao Studio",
  "landing.hero.audience.listener": "Ouço música",
  "landing.hero.audience.artist": "Faço música",
  "landing.hero.artistTitle":
    "Lança a tua música <em>onde a tua comunidade já está</em>.",
  "landing.hero.artistLede":
    "Publica de graça, lança com um nome artístico que nenhum outro membro liga a ti e chega a quem já vai aos teus concertos.",
  "landing.hero.hearItFirst": "Ouve primeiro",
  "landing.photoCredit": "Fotografia: {credit}",
  "landing.demoSampleNote":
    "Demonstração: artistas, faixas, citações e fotografias aqui são exemplos",
  "landing.cta.applyAsArtist": "Candidatar-me como artista",
  "landing.cta.requestAccess": "Pedir acesso ao Studio",
  "landing.cta.makesMusic": "Faço música e quero lançá-la no Studio",
  "landing.cta.checking": "A verificar o teu acesso ao Studio",
  "landing.cta.onList.title": "Estás na lista",
  "landing.cta.onList.body":
    "Recebes uma notificação quando o Studio abrir para ti.",
  "landing.cta.onList.artistBody":
    "Pediste como artista, por isso a nossa equipa vê o teu pedido primeiro. Recebes uma notificação quando o Studio abrir para ti.",
  "landing.cta.cancelRequest": "Cancelar pedido",
  "landing.cta.requestSent": "Pedido enviado. Estás na lista",
  "landing.cta.requestCancelled": "Pedido cancelado",
  "landing.cta.requestFailed": "Não conseguimos enviar o teu pedido",
  "landing.cta.cancelFailed": "Não conseguimos cancelar o teu pedido",
  "landing.proof.label": "O Studio em números",
  "landing.proof.artists_one": "{count} artista",
  "landing.proof.artists_other": "{count} artistas",
  "landing.proof.releases_one": "{count} lançamento",
  "landing.proof.releases_other": "{count} lançamentos",
  "landing.proof.events_one": "{count} evento com artistas do Studio este mês",
  "landing.proof.events_other":
    "{count} eventos com artistas do Studio este mês",
  "landing.nextEvent.eyebrow": "A seguir em palco",
  "landing.nextEvent.with": "Com {artist}",
  "landing.nextEvent.online": "Online",
  "landing.nextEvent.visitorCta": "Pedir convite para ver este evento",
  "landing.nextEvent.memberCta": "Abrir o evento",
  "landing.listen.eyebrow": "Ouve primeiro",
  "landing.listen.title": "Faixas de <em>artistas do Studio</em>",
  "landing.listen.note":
    "Quem fez estas faixas partilhou-as para esta página. O que ouves aqui fica anónimo e não deixa registo.",
  "landing.listen.listLabel": "Faixas para ouvir",
  "landing.listen.play": "Tocar {track} de {artist}",
  "landing.listen.pause": "Pausar {track} de {artist}",
  "landing.listen.progress": "{elapsed} de {total}",
  "landing.listen.playing": "A tocar {track} de {artist}",
  "landing.listen.paused": "{track} está em pausa",
  "landing.listen.retry": "Tentar {track} outra vez",
  "landing.listen.reason.unavailable": "Esta faixa saiu desta página",
  "landing.listen.reason.offline":
    "Estás sem ligação, por isso esta faixa não carrega",
  "landing.listen.reason.rateLimited":
    "Demasiadas audições em pouco tempo. Tenta outra vez daqui a um minuto",
  "landing.listen.reason.server":
    "O Studio não respondeu, por isso esta faixa não carrega",
  "landing.listen.reason.playback":
    "O teu navegador não conseguiu tocar esta faixa",
  "landing.artists.eyebrow": "Conhece quem faz a música",
  "landing.artists.title": "Algumas das pessoas <em>no Studio</em>",
  "landing.artists.listLabel": "Artistas do Studio",
  "landing.forArtists.eyebrow": "Para artistas",
  "landing.forArtists.title": "Lança <em>no Studio</em>",
  "landing.forArtists.intro":
    "Tudo isto já funciona hoje para cada artista que a nossa equipa traz.",
  "landing.forArtists.upload.title": "Publica diretamente, de graça",
  "landing.forArtists.upload.body":
    "WAV e AIFF incluídos, diretamente do teu computador, sem distribuidora pelo meio.",
  "landing.forArtists.persona.title": "Lança com um nome artístico",
  "landing.forArtists.persona.body":
    "A tua persona vive dentro da tua conta, e nenhum outro membro consegue ver a ligação entre as duas.",
  "landing.forArtists.numbers.title": "Vê quem te ouve",
  "landing.forArtists.numbers.body":
    "Totais e tendências de audições, e quem escolhe mostrar o nome como apoiante.",
  "landing.forArtists.tools.title": "Ferramentas para cada lançamento",
  "landing.forArtists.tools.body":
    "Lançamentos agendados, notas de versão, links privados de pré-escuta, um kit de imprensa e álbuns que tocam sem pausas.",
  "landing.forArtists.events.title": "Os teus eventos na tua página",
  "landing.forArtists.events.body":
    "A tua página liga aos teus eventos no QueerPulse, para quem te ouve encontrar o próximo concerto.",
  "landing.forArtists.spotify.label": "Vale a pena saber",
  "landing.forArtists.spotify.fact":
    "Desde 2024, uma faixa no Spotify não gera royalties de gravação até chegar às 1000 reproduções nos 12 meses anteriores.",
  "landing.forArtists.spotify.source":
    "Fonte: anúncio do Spotify, novembro de 2023",
  "landing.forArtists.spotify.opensNewTab": "(abre num novo separador)",
  "landing.forArtists.spotify.studio":
    "No Studio, uma faixa nova tem página própria e quem a ouça desde o primeiro dia. O próprio Studio não guarda nem movimenta dinheiro, e o plano mais abaixo diz para onde o queremos levar.",
  "landing.forArtists.founding.title": "Sê artista da fundação",
  "landing.forArtists.founding.body":
    "Quem entra primeiro fica em destaque no lançamento, numa prateleira do Studio, e guarda o distintivo Artista da fundação na sua página.",
  "landing.forArtists.founding.memberBody":
    "Pede como artista e a nossa equipa vê o teu pedido primeiro.",
  "landing.forArtists.founding.priority":
    "Candidata-te como artista e a nossa equipa vê o teu pedido primeiro.",
  "landing.forArtists.shot.alt":
    "Os números de artista no Studio, com audições por dia e quem mostra o nome como apoiante",
  "landing.forArtists.shot.phoneAlt":
    "Os números de artista no Studio num telemóvel",
  "landing.compare.streamingHeading":
    "Apps de streaming (Spotify, Apple Music)",
  "landing.compare.platformsHeading":
    "Plataformas de artistas (Bandcamp, SoundCloud)",
  "landing.compare.streamingShort": "Apps de streaming",
  "landing.compare.platformsShort": "Plataformas",
  "landing.compare.featured.streaming":
    "Algoritmos, e editoras podem pagar por mais promoção",
  "landing.compare.featured.platforms": "Tabelas globais e escolhas editoriais",
  "landing.compare.releasing.topic": "Lançar a tua música",
  "landing.compare.releasing.streaming":
    "Através de uma distribuidora, muitas vezes paga",
  "landing.compare.releasing.platforms": "Publicas diretamente",
  "landing.compare.releasing.studio": "Publicas diretamente, de graça",
  "landing.compare.stageName.topic": "O teu nome artístico",
  "landing.compare.stageName.streaming":
    "Um perfil público de artista que geres com a tua própria conta",
  "landing.compare.stageName.platforms":
    "Uma página de perfil pública que geres com a tua própria conta",
  "landing.compare.stageName.studio":
    "Uma persona dentro da tua conta, e nenhum outro membro vê a ligação",
  "landing.compare.ads.streaming": "No plano grátis",
  "landing.compare.ads.platforms": "No plano grátis do SoundCloud",
  "landing.compare.listening.streaming":
    "Constrói um perfil para recomendações e anúncios",
  "landing.compare.listening.platforms":
    "Recomendações a partir do que segues e compras",
  "landing.compare.fans.topic": "Quem são os teus fãs",
  "landing.compare.fans.streaming": "Números anónimos",
  "landing.compare.fans.platforms": "Quem compra e quem segue",
  "landing.compare.fans.studio": "Apoiantes que escolhem mostrar o nome",
  "landing.compare.safety.topic": "Segurança",
  "landing.compare.safety.streaming": "Uma etiqueta de conteúdo explícito",
  "landing.compare.safety.platforms":
    "No máximo, uma etiqueta de conteúdo explícito",
  "landing.compare.safety.studio":
    "Avisos de conteúdo antes de a faixa tocar, denúncias e moderação pela nossa equipa",
  "landing.compare.scene.streaming":
    "Concertos listados por parceiros de bilhética",
  "landing.compare.scene.platforms":
    "Os teus concertos estão listados noutro sítio",
  "landing.compare.owner.streaming": "Grandes empresas cotadas em bolsa",
  "landing.compare.owner.platforms": "Grandes empresas e investidores",
  "landing.faq.eyebrow": "Perguntas",
  "landing.faq.title": "O que nos <em>perguntam</em>",
  "landing.faq.free.question": "O Studio é grátis?",
  "landing.faq.free.answer":
    "Sim. O Studio é grátis para quem faz parte, sem anúncios. A música que compras a uma pessoa artista é paga, e o dinheiro vai para essa pessoa.",
  "landing.faq.later.question": "Vai custar dinheiro mais tarde?",
  "landing.faq.later.answer":
    "Queremos que o Studio se torne uma cooperativa gerida por artistas e por quem ouve. Fazer parte e usar o Studio é grátis, e a música que compras a uma pessoa artista é paga, com o dinheiro a ir para essa pessoa. Se alguma outra coisa vier a custar dinheiro, esta página diz primeiro.",
  "landing.faq.spotify.question": "Posso continuar a usar o Spotify?",
  "landing.faq.spotify.answer":
    "Claro. Fica com ele para o resto e vem ao Studio pela música feita à tua volta.",
  "landing.faq.ownership.question": "De quem é a minha música?",
  "landing.faq.ownership.answer":
    "É tua. Ficas com os teus masters e os teus direitos, e podes retirar um lançamento quando quiseres.",
  "landing.faq.elsewhere.question":
    "Posso lançar a minha música noutros sítios?",
  "landing.faq.elsewhere.answer":
    "Sim. O Studio não pede exclusividade, por isso a tua música pode estar em qualquer outra plataforma ao mesmo tempo.",
  "landing.faq.stageName.question": "Posso usar um nome artístico?",
  "landing.faq.stageName.answer":
    "Sim. Cria uma persona na tua conta e lança com ela. Nenhum outro membro consegue ver que a persona está ligada a ti.",
  "landing.faq.listening.question": "O que guardam sobre o que ouço?",
  "landing.faq.listening.answer":
    "Um histórico privado que só tu vês, para o Studio te mostrar os teus artistas e faixas de topo. Pausa-o ou limpa-o quando quiseres. As audições continuam a contar para os totais de quem fez a música, sem o teu nome.",
  "landing.faq.cut.question": "Ficam com uma parte?",
  "landing.faq.cut.answer":
    "Não. O próprio Studio não guarda nem movimenta dinheiro, por isso não há nada de que ficar com uma parte.",
  "landing.faq.upload.question": "O que posso publicar?",
  "landing.faq.upload.answer":
    "Música, mixes de DJ, podcasts, palavra dita e performance gravada, em ficheiros MP3, M4A, WAV ou AIFF.",
  "landing.faq.getIn.question": "Como entro?",
  "landing.faq.getIn.answer":
    "Pede um convite para o QueerPulse. Quando fizeres parte, a nossa equipa abre o Studio por fases, primeiro para quem faz música, e recebes uma notificação quando abrir para ti.",
  "landing.next.eyebrow": "O que acontece a seguir",
  "landing.next.title": "Três passos <em>até ao Studio</em>",
  "landing.next.invite.title": "Pede um convite",
  "landing.next.invite.body":
    "Conta-nos um pouco sobre ti. Demora poucos minutos.",
  "landing.next.review.title": "A nossa equipa lê o pedido",
  "landing.next.review.body":
    "Alguém da nossa equipa lê cada pedido. Chegar agora à nossa comunidade não é problema.",
  "landing.next.list.title": "Ficas na lista do Studio",
  "landing.next.list.body":
    "Quando entrares, ficas automaticamente na lista do Studio, primeiro artistas, e recebes uma notificação quando o Studio abrir para ti.",
  "landing.team.eyebrow": "Quem gere",
  "landing.team.title": "As pessoas que <em>cuidam do QueerPulse</em>",
  "landing.team.body":
    "Pessoas da nossa comunidade fazem parte do conselho consultivo e ajudam a decidir o caminho do QueerPulse, incluindo o Studio.",
  "landing.team.listLabel": "Conselho consultivo",
  "landing.team.link": "Ler como o QueerPulse é gerido",

  // ── Entrar / Junta-te (StudioSignInPage) ─────────────────────────────────
  "signin.tabs.signIn": "Entrar",
  "signin.tabs.join": "Junta-te",
  "signin.aside.onAirNow": "No ar agora · {count} a ouvir",
  "signin.aside.title":
    "Uma cooperativa de streaming que <em>paga</em> a quem fez a música.",
  "signin.aside.body":
    "Compra um lançamento e pagas diretamente a quem fez a música. As gorjetas passam a <em>{tipPercent}</em>. A tua quota de apoiante paga o alojamento, a curadoria e o fundo de solidariedade.",
  "signin.aside.noCut":
    "O QueerPulse não fica com <em>nada</em> de uma compra.",

  "signin.in.title": "Bem-vinde de <em>volta.</em>",
  "signin.in.lede":
    "O Studio é um separador na tua conta QueerPulse. Entra com a conta que já tens.",
  "signin.emailLabel": "Email",
  "signin.emailPlaceholder": "tu@exemplo.com",
  "signin.in.submitCta": "Entrar",
  "signin.orDivider": "ou",
  "signin.googleContinue": "Continuar com o Google",
  "signin.googleLoading": "A entrar…",
  "signin.in.newHere": "Ainda não tens conta?",
  "signin.in.joinCta": "Junta-te ao Studio",
  "signin.in.freePrompt": "Só queres ouvir?",
  "signin.in.freeCta": "Ouve um set grátis, sem conta",
  "signin.in.signedInToast": "Sessão iniciada, bem-vinde de volta",
  "signin.in.signedInGoogleToast":
    "Sessão iniciada com o Google, bem-vinde de volta",

  "signin.join.title": "Junta-te ao <em>Studio.</em>",
  "signin.join.lede":
    "Escolhe quanto da cooperativa queres. Podes mudar de nível ou cancelar em qualquer mês: sem fidelização, sem emails a insistir.",
  "signin.join.chooseTier": "Escolhe o teu nível",
  "signin.join.tier.studio.title": "Só <em>Studio</em>",
  "signin.join.tier.studio.body":
    "Tudo no Studio: o set semanal do conselho, salas ao vivo, o catálogo completo, áudio sem perdas, subscrições diretas a artistas.",
  "signin.join.tier.studio.incl":
    "A tua quota paga o alojamento, a curadoria e o fundo de solidariedade",
  "signin.join.tier.coop.badge": "Melhor valor",
  "signin.join.tier.coop.title": "Toda a <em>cooperativa</em>",
  "signin.join.tier.coop.body":
    "Studio <em>mais</em> Cinema, Magazine, Eventos, grupos de leitura e um voto na assembleia anual. Uma só assinatura, toda a QueerPulse.",
  "signin.join.tier.coop.incl": "Uma conta em todos os espaços",
  "signin.join.submitCta": "Continuar para o pagamento",
  "signin.join.alreadyMember": "Já és pessoa da comunidade?",
  "signin.join.notReady": "Ainda não tens a certeza?",
  "signin.join.freeCta": "Ouve primeiro um set grátis",
  "signin.perMonth": "/mês",

  "firstRun.progress": "Passo {current} de {total}",
  "firstRun.about.name": "O que é o Studio",
  "firstRun.taste.name": "Géneros e ambientes de que gostas",
  "firstRun.follow.name": "Artistas para seguir",
  "firstRun.about.title": "Boas-vindas ao <em>Studio</em>",
  "firstRun.about.dek":
    "Música, spoken word, DJ sets e podcasts de artistas queer da nossa comunidade. Três passos curtos e já estás a ouvir.",
  "firstRun.about.listen.title": "Ouve",
  "firstRun.about.listen.body":
    "Álbuns, EPs, sets e episódios, prontos quando te apetecer.",
  "firstRun.about.save.title": "Dá gosto",
  "firstRun.about.save.body":
    "Dá gosto a uma faixa e ela vai para Músicas de que gostas. Dá gosto a um álbum, podcast ou playlist e fica à tua espera na biblioteca.",
  "firstRun.about.follow.title": "Segue",
  "firstRun.about.follow.body":
    "Segue artistas das cenas locais. A tua biblioteca guarda quem segues.",
  "firstRun.about.note":
    "Salta os passos que quiseres. Podes voltar a abrir isto na Ajuda do Studio.",
  "firstRun.taste.title": "O que gostas de <em>ouvir</em>?",
  "firstRun.taste.dek":
    "Escolhe quantos quiseres. Passam para a frente na tua página inicial do Studio e ficam guardados na tua conta.",
  "firstRun.taste.noneYet": "Ainda nada escolhido. Também está tudo bem.",
  "firstRun.taste.pickedCount_one": "{count} escolhido, guardado na tua conta",
  "firstRun.taste.pickedCount_other":
    "{count} escolhidos, guardados na tua conta",
  "firstRun.follow.title": "Encontra a tua <em>cena</em>",
  "firstRun.follow.dek":
    "Segue artistas das cenas do Studio. Quem está mais perto das tuas escolhas aparece primeiro.",
  "firstRun.follow.followLabel": "Seguir {artist}",
  "firstRun.follow.loadingLabel": "A carregar artistas para seguir",
  "firstRun.follow.empty":
    "As pessoas artistas aparecem aqui quando partilham lançamentos. Podes seguir quem quiseres a partir da página de cada uma.",
  "firstRun.skipCta": "Saltar",
  "firstRun.backCta": "Voltar",
  "firstRun.nextCta": "Seguinte",
  "firstRun.finishCta": "Começar a ouvir",
  "firstRun.savedToast": "As tuas escolhas ficaram guardadas na tua conta",
  "firstRun.saveError":
    "Não conseguimos guardar na tua conta as escolhas das boas-vindas. Abre a Ajuda e escolhe Mostrar as boas-vindas outra vez para repetir",
  "firstRun.help.heading": "Volta a escolher o teu <em>som</em>",
  "firstRun.help.body":
    "As boas-vindas em três passos: o que é o Studio, os géneros e ambientes de que gostas e artistas para seguir.",
  "firstRun.help.cta": "Mostrar as boas-vindas outra vez",

  // ── Sobre a cooperativa (StudioAboutPage + StudioAboutSections) ──────────

  "about.sec.rate.num": "02: como as pessoas artistas recebem",
  "about.sec.rate.heading":
    "Os fãs compram a música e <em>pagam diretamente</em> a quem a fez.",
  "about.sec.rate.p1":
    "Artistas põem preço em álbuns, EPs, singles e nas suas faixas, com um preço fixo ou com o preço à escolha de quem compra. Pagas à pessoa artista <strong>diretamente da tua conta</strong>, pela ligação de pagamento, MB WAY ou IBAN dela, e tocas em Já paguei. Quando ela confirmar, a transferência abre e o teu nome entra no mural <em>Com o apoio de</em> do lançamento.",
  "about.sec.rate.footnote":
    "O QueerPulse não fica com nada de uma compra e nunca guarda o dinheiro. A tua quota de apoiante paga o alojamento, as ajudas de custo da curadoria e o fundo de solidariedade, e está prevista uma parte dela para artistas.",

  "about.rate.cell.floor.value": "<em>0 €</em>",
  "about.rate.cell.floor.label": "que o QueerPulse fica de uma compra",
  "about.rate.cell.share.value": "<em>100</em>%",
  "about.rate.cell.share.label":
    "de cada compra vai diretamente para a pessoa artista",
  "about.rate.cell.tip.value": "<em>100</em>%",
  "about.rate.cell.tip.label":
    "de cada gorjeta, sem corte da plataforma, nunca",

  "about.sec.ceiling.num": "03: o que uma pessoa artista pode realmente ganhar",
  "about.sec.ceiling.heading": "Honestos quanto ao <em>teto</em>.",
  "about.sec.ceiling.p1":
    "A maioria das páginas sobre a «economia de quem cria» mostra-te o top 0,1% e deixa-te presumir que és tu. Aqui está o que as compras e as gorjetas realmente somam em quatro níveis reais de apoio, e onde param.",

  "about.tier.casual.label": "Ocasional",
  "about.tier.casual.value": "74",
  "about.tier.casual.body":
    "Cerca de <em>quinze fãs</em> por mês a comprar um single de 5 €. Dinheiro para um café, pago diretamente a ti.",
  "about.tier.building.label": "Em crescimento",
  "about.tier.building.value": "340",
  "about.tier.building.body":
    "Cerca de trinta compras de álbum por mês, alguns singles, duas gorjetas. Um rendimento extra a sério, <em>quase dá para a renda</em> em Lisboa.",
  "about.tier.sustaining.label": "Consolidado",
  "about.tier.sustaining.value": "1820",
  "about.tier.sustaining.body":
    "Um público que compra cada lançamento, uma bolsa de gorjetas regular, uma sala de audição ao vivo por mês. Abaixo do salário mediano português, e <em>cada euro</em> pago diretamente a ti pelos fãs.",
  "about.tier.touring.label": "Artista em digressão",
  "about.tier.touring.body":
    "O Studio <em>não</em> vai substituir um rendimento de digressão, e não vamos fingir que consegue. Pode, plausivelmente, pagar a renda enquanto fazes a próxima coisa.",
  "about.tierFoot":
    "Estas contas somam preços reais do Studio e números honestos de quem compra, sem nada emprestado de um pitch deck. <em>Cada euro aqui vai de quem é fã para quem cria, e o QueerPulse nunca lhe toca.</em>",

  "about.sec.governance.num": "04: quem decide",
  "about.sec.governance.heading":
    "Um <em>conselho</em> eleito, com mandato limitado, registado publicamente.",
  "about.sec.governance.p1":
    "Seis pessoas programam o set semanal, tratam da triagem de submissões e escrevem um parágrafo a justificar cada escolha. São eleitas por toda a cooperativa na assembleia anual, recebem uma ajuda de custo fixa de 400 €/mês que aparece no livro-razão público, e têm mandatos limitados a dois anos com rotação obrigatória. <strong>Uma pessoa decide quem é ouvido</strong> e assina o nome por baixo.",
  "about.sec.governance.p2":
    "A quota de apoiante, e a forma como se reparte entre alojamento, ajudas de custo da curadoria e fundo de solidariedade, é definida anualmente por votação conjunta de apoiantes e artistas, com um quórum de uma pessoa em cada cinco. Se achas que a quota está errada, <em>votas, ou candidatas-te.</em>",

  "about.sec.hardQuestions.num": "05: as perguntas difíceis",
  "about.sec.hardQuestions.heading": "As que estás <em>mesmo</em> a fazer.",

  "about.skeptic.broke.q":
    "Isto soa lindo e condenado ao fracasso. Como é que isto não vai à falência?",
  "about.skeptic.broke.a":
    "Sendo honestos, em baixa escala, o alojamento é a parte cara, e uma faixa que rebente pode custar mais em largura de banda do que aquilo que as quotas de apoiante trazem. A nossa mitigação é aborrecida e pública: quem ouve de forma ocasional fica por defeito em AAC, fazemos cache de forma agressiva, e o livro-razão das subscrições é reconciliado <em>diariamente</em>, para vermos o vermelho antes de ser uma crise.",
  "about.skeptic.clique.q": "Curadoria feita por seis pessoas soa a panelinha.",
  "about.skeptic.clique.a":
    "Pode tornar-se numa. Esse é o risco real. As salvaguardas são mandatos de dois anos, rotação obrigatória, e o facto de cada escolha ser publicada com um nome e uma razão. <em>Uma panelinha que tem de se justificar por escrito todas as semanas é uma panelinha mais fraca.</em>",
  "about.skeptic.clone.q":
    "Isto não é só um clone do Spotify com copy mais bonita?",
  "about.skeptic.clone.a":
    "Se a página principal fosse filas de capas de álbum quadradas, seria. O produto é editorial de propósito: um set semanal programado, salas de audição ao vivo, um mural de apoio em cada lançamento. <em>Se algum dia parecermos um Spotify mais pequeno, cobra-nos este parágrafo.</em>",
  "about.skeptic.leave.q": "O que acontece à minha música se eu sair?",
  "about.skeptic.leave.a":
    "Ficas com os teus masters e com cada euro que os fãs te pagaram, porque foi diretamente para ti. A remoção é um processo de uma página, com 14 dias, sem ciclo de retenção. Sair é tão fácil como entrar. Achamos que é a única forma honesta de te pedir para ficares.",

  "about.cta.join": "Junta-te ao Studio",
  "about.cta.ledger": "Ler como o QueerPulse é gerido",

  // ── Acessibilidade (StudioAccessibilityPage) ──────────────────────────────
  "accessibility.statement.p1":
    "O QueerPulse Studio compromete-se a cumprir a <em>WCAG 2.2 AA</em> em todas as superfícies, e a tratar a acessibilidade como um requisito de produto central, integrado desde o início. Pessoas surdas e com dificuldades auditivas devem poder usar uma plataforma de música. O mesmo vale para pessoas cegas e com baixa visão e para pessoas que navegam pelo teclado.",
  "accessibility.statement.p2":
    "Se algo aqui não funcionar para ti, isso é um erro, e queremos receber o relato.",

  "accessibility.group.deaf.heading":
    "Para pessoas surdas e com <em>dificuldades auditivas</em>",
  "accessibility.group.deaf.dek":
    "Uma plataforma de música não pode fingir que toda a gente ouve da mesma forma. Por isso o Studio mostra as palavras e a forma de onda.",
  "accessibility.item.lyrics.heading": "Letras <em>sincronizadas</em>",
  "accessibility.item.lyrics.body":
    "Quando a pessoa artista as disponibiliza, as letras avançam ao ritmo da reprodução, com a linha atual destacada. Também podes lê-las como uma folha estática, em qualquer faixa.",
  "accessibility.item.waveforms.heading": "<em>Formas de onda</em> visuais",
  "accessibility.item.waveforms.body":
    "As faixas mostram uma forma de onda ligada ao áudio, para que o ritmo e a dinâmica se vejam e se ouçam.",

  "accessibility.group.language.heading":
    "Para quem ouve em <em>qualquer língua</em>",
  "accessibility.group.language.dek":
    "O catálogo está sobretudo em português, com músicas numa dezena de outras línguas. As palavras não deviam ser uma barreira.",
  "accessibility.item.interfaceLang.heading":
    "Interface na <em>tua língua</em>",
  "accessibility.item.interfaceLang.body":
    "A interface do Studio está disponível em português e em inglês. Escolhe nas Definições.",

  "accessibility.group.lowVision.heading":
    "Para navegação por <em>baixa visão</em> e teclado",
  "accessibility.group.lowVision.dek":
    "Todo o leitor é operável sem rato, e os temas claro e escuro foram construídos para ter contraste além de atmosfera.",
  "accessibility.item.reducedMotion.heading":
    "Respeita o <em>movimento reduzido</em>",
  "accessibility.item.reducedMotion.body":
    "Toda a animação decorativa (o ponto pulsante, as formas de onda, as barras do equalizador) imobiliza-se quando o teu sistema pede movimento reduzido. Nada essencial se move.",

  "accessibility.status.inProgress": "Em curso",

  "accessibility.shortcuts.title": "Atalhos de <em>teclado</em> do leitor",
  "accessibility.shortcuts.dek":
    "Funcionam em qualquer página do Studio enquanto houver música na fila, exceto quando estás a escrever num campo",

  "accessibility.contact.meta": "Objetivo: WCAG 2.2 AA",

  // ── Ajuda e perguntas frequentes (StudioHelpPage + StudioHelpFaq) ─────────

  "help.faq.moneyGo.q": "Para onde vai realmente o meu dinheiro?",
  "help.faq.moneyGo.a":
    "Quando compras um lançamento, <strong>pagas diretamente à pessoa artista</strong> e o QueerPulse não fica com nada. <em>Cada cêntimo de cada gorjeta</em> vai para a pessoa artista sem corte da plataforma. A tua quota de apoiante paga o alojamento, as ajudas de custo da curadoria e o fundo de solidariedade, e está prevista uma parte dela para artistas. Lê <a>como o QueerPulse é gerido</a>.",
  "help.faq.tipNoAccount.q": "Posso dar gorjeta sem ter conta?",
  "help.faq.tipNoAccount.a":
    "Podes <em>ouvir</em> um set de demonstração grátis, mas dar gorjeta exige uma conta, para que o dinheiro possa chegar à pessoa artista e te seja emitido um recibo. O registo demora menos de um minuto e o primeiro mês é por nossa conta.",
  "help.faq.tipNotesPrivate.q": "As minhas notas de gorjeta são privadas?",
  "help.faq.tipNotesPrivate.a":
    "<strong>Sim, por defeito.</strong> Uma nota que escreves com uma gorjeta só é vista por ti e pela pessoa artista. Podes optar por tornar as notas semipúblicas ou públicas em <a>Definições</a>, e mudar qualquer nota depois.",

  "help.faq.priceDiff.q": "Qual é a diferença entre 7 € e 11 €?",
  "help.faq.priceDiff.a":
    "<strong>7 €/mês</strong> é só o Studio. <strong>11 €/mês</strong> é toda a cooperativa QueerPulse: Studio mais Cinema, Magazine, Eventos, grupos de leitura e um voto na assembleia anual. Uma só assinatura, todos os espaços. Muda de nível em qualquer mês.",
  "help.faq.cancel.q": "Como cancelo?",
  "help.faq.cancel.a":
    'Um clique em <a>Definições, depois Apagar e sair</a>. Sem chamada de retenção, sem ciclo de "tens a certeza", sem emails a insistir. Achamos que sair devia ser tão fácil como entrar. É a única forma honesta de te pedir para ficares.',

  "help.faq.getPaid.q": "Quando e como sou pago?",
  "help.faq.getPaid.a":
    "Os fãs pagam-te diretamente, pelas ligações de pagamento, número MB WAY ou IBAN que juntas nas definições do Studio. Tocam em Já paguei, tu verificas a tua conta e confirmas, e a transferência deles abre. O QueerPulse <em>nunca guarda</em> o dinheiro. Revê o que quem compra diz ter pago em <a>Pagamentos</a>.",
  "help.faq.realisticEarn.q": "O que posso realisticamente ganhar?",
  "help.faq.realisticEarn.a":
    "Somos honestos quanto ao teto: cerca de 74 €/mês ocasional, 340 €/mês em crescimento, 1820 €/mês consolidado. O Studio não vai substituir um rendimento de digressão, mas pode substituir a renda. A explicação completa está em <a>Sobre o Studio</a>.",

  "help.statusOperational": "Todos os sistemas operacionais ·",

  // ── Kit de imprensa do artista (StudioPressPage + StudioPressBar) ─────────
  // Só chrome. O conteúdo fictício da demonstração desta página vive em
  // studioShowcase (traduzido); nomes próprios e números ficam nos ficheiros de dados.
  "press.copiedToast": "Copiado",
  "press.copyFailToast": "Não foi possível copiar",
  "press.downloadingPhotosToast":
    "A transferir fotos de imprensa · alta resolução",
  "press.downloadingPhotoToast": "A transferir foto · alta resolução",
  "press.accessRequestedToast":
    "Acesso de imprensa pedido. Vamos verificar-te uma vez",
  "press.fact.from": "De",
  "press.fact.pronouns": "Pronomes",
  "press.fact.since": "Desde",
  "press.fact.followers": "Seguidores",
  "press.fact.forFansOf": "Para quem gosta de",
  "press.section.preview": "Pré-visualização <em>reproduzível</em>",
  "press.fullPromoRequestedToast": "Promo completo pedido",
  "press.requestFullPromoCta": "Pedir o promo completo",
  "press.playAria": "Reproduzir pré-visualização",
  "press.pauseAria": "Pausar pré-visualização",
  "press.watermarkedBadge": "Com marca de água",
  "press.previewNote":
    "Esta pré-visualização tem uma <em>marca de água inaudível</em> e uma identificação falada da QueerPulse no final. Para um master limpo para transmissão, pede o promo completo. Verificamos a tua imprensa uma vez, e depois ficas autorizado para tudo.",
  "press.section.bio": "<em>Biografia</em>",
  "press.section.photos": "Fotos de <em>imprensa</em>",
  "press.downloadAllCta": "Transferir tudo · alta resolução",
  "press.downloadOneHint": "Transferir em alta resolução",
  "press.section.press": "Imprensa <em>selecionada</em>",
  "press.section.boilerplate": "Factos e <em>ficha técnica</em>",
  "press.copyCta": "Copiar",
  "press.boilerplate.fullName": "Nome completo",
  "press.boilerplate.genre": "Género",
  "press.boilerplate.label": "Editora",
  "press.boilerplate.booking": "Contactos",
  "press.boilerplate.pronounce": "Pronúncia",
  "press.requestAccessCta": "Pedir acesso de imprensa",
  "press.bar.crumb": "Kit de imprensa · <em>{name}</em>",
  "press.bar.copyLinkCta": "Copiar link de imprensa",
  "press.bar.downloadAssetsCta": "Transferir recursos",
  "press.bar.copyLinkFailToast": "Não foi possível copiar o link",
  "press.bar.preparingToast": "A preparar os teus recursos de imprensa",

  // ── Confiança e termos (StudioTermsPage) ──────────────────────────────────

  "terms.sec.deed.num": "01: o estatuto da cooperativa",
  "terms.sec.deed.heading": "O que significa isto ser <em>teu</em>.",
  "terms.sec.deed.p1":
    "O QueerPulse Studio é uma cooperativa registada. As pessoas, quem ouve e quem faz música, são as suas proprietárias. Isto é uma estrutura legal, com um estatuto que podes ler, e que vincula quem a gere.",
  "terms.sec.deed.p2":
    "O estatuto fixa uma promessa que quem está no comando <strong>não pode mudar em segredo</strong>: artistas recebem diretamente e o QueerPulse nunca fica com nenhuma parte. Mudar essa promessa exige uma maioria de dois terços de toda a cooperativa. O conselho é <em>eleito, com mandato limitado, e pago no livro-razão</em>. Não há ações de fundador nem veto de investidores.",
  "terms.sec.deed.pull":
    "Se alguma vez começarmos a agir como uma empresa que por acaso tem bons valores, o estatuto é aquilo a que nos podes obrigar.",
  "terms.sec.deed.footnote":
    "O estatuto completo e as contas anuais da cooperativa são publicados todos os anos junto com o <a>relatório de transparência</a>.",

  "terms.sec.licences.num": "02: licenças",
  "terms.sec.licences.heading": "O que podes <em>fazer</em> com a música.",
  "terms.sec.licences.p1":
    "Cada lançamento indica a sua licença, escolhida pela pessoa artista. Aqui está o que cada uma significa para ti como ouvinte, e para quem quiser reutilizar o trabalho num set, num filme, ou numa remistura.",
  "terms.sec.licences.footnote":
    "Os sets de DJ são especiais: um set pode incluir faixas com licenças diferentes, e o nosso sistema credita cada faixa a quem a fez. <em>Covers são permitidos</em>; os direitos mecânicos são geridos através de um parceiro de cobrança português, e não pagamos sincronização, por isso autorizar um cover para uso em filme é contigo.",

  "terms.licence.arr.title": "Todos os direitos <em>reservados</em>",
  "terms.licence.arr.row1": "Reproduzir e guardar",
  "terms.licence.arr.row2": "Comprar uma cópia para ficares com ela",
  "terms.licence.arr.row3": "Sem reutilização sem autorização",
  "terms.licence.ccByNc.title": "Crédito, <em>não comercial</em>",
  "terms.licence.ccByNc.row1": "Reutilizar em trabalho <em>não pago</em>",
  "terms.licence.ccByNc.row2": "Remisturar, com crédito",
  "terms.licence.ccByNc.row3": "Não para uso comercial",
  "terms.licence.ccBySa.title": "Crédito, <em>partilha-igual</em>",
  "terms.licence.ccBySa.row1": "Reutilizar em qualquer lugar, com crédito",
  "terms.licence.ccBySa.row2": "Uso comercial permitido",
  "terms.licence.ccBySa.row3":
    "Partilhar remisturas com a <em>mesma licença</em>",

  "terms.sec.privacy.num": "03: privacidade, em resumo",
  "terms.sec.privacy.heading":
    "O que <em>guardamos</em>, e o que não guardamos.",
  "terms.sec.privacy.p1":
    "Guardamos a tua conta, as tuas gravações, os teus recibos, e o que ativares explicitamente. <strong>Não</strong> guardamos um perfil do teu gosto para vender, um histórico que não pediste que guardássemos, nem nada que déssemos a um anunciante, porque não temos anunciantes.",
  "terms.sec.privacy.footnote":
    "Contagens de reproduções agregadas e anónimas mostram às pessoas artistas como a sua música é ouvida, sem nomes associados. Podes exportar tudo o que guardamos, ou apagá-lo, em <a>Definições, depois Apagar e sair</a>: instantaneamente, sem modal, sem necessidade de desfazer porque falamos a sério.",

  "terms.longVersions.meta":
    "termos v3.2 · privacidade v2.1 · estatuto da cooperativa 2024 · última atualização a 2 jun. 2026",
  "terms.readDeedCta": "Ler o estatuto",
  "terms.readDeedToast": "A abrir o estatuto da cooperativa…",

  // ── Direitos e remoção (StudioRightsPage) ─────────────────────────────────
  // Só chrome. O conteúdo fictício da demonstração desta página vive em
  // studioShowcase (traduzido); nomes próprios e números ficam nos ficheiros de dados.
  "rights.promise.window.title": "Remoção em 14 dias",
  "rights.promise.window.body":
    "Confirma uma remoção e o lançamento deixa de estar disponível dentro de 14 dias, normalmente na mesma noite. As caches limpam-se, os links dão erro 404 para uma página cuidada.",
  "rights.promise.paid.title": "O que os fãs pagaram continua teu",
  "rights.promise.paid.body":
    "Os fãs pagaram-te diretamente, por isso esse dinheiro nunca passou pelo QueerPulse. Remover um trabalho deixa cada pagamento onde está.",
  "rights.promise.banking.title": "As formas de receber não são afetadas",
  "rights.promise.banking.body":
    "Uma remoção deixa a tua conta aberta. As tuas formas de receber, os preços dos teus outros lançamentos, as divisões com colaboradores: tudo continua ativo.",

  "rights.releases.heading": "Os teus <em>lançamentos</em>",
  "rights.releases.liveCount_one": "{count} ativo",
  "rights.releases.liveCount_other": "{count} ativos",
  "rights.releases.removingCount_one": "{count} em janela de remoção",
  "rights.releases.removingCount_other": "{count} em janela de remoção",

  "rights.removingStatus_one": "Em remoção · falta {count} dia",
  "rights.removingStatus_other": "Em remoção · faltam {count} dias",
  "rights.cancelRemovalCta": "Cancelar remoção",
  "rights.takeDownCta": "Remover",

  "rights.leavingCoop.title": "A sair da cooperativa <em>por completo</em>?",
  "rights.leavingCoop.body":
    "Esta página só remove lançamentos individuais. Para encerrar a tua conta de artista, terminar a tua contribuição de apoiante e pedir uma exportação completa dos teus dados, isso está em <a>Definições, depois Apagar e sair</a>. <em>Mesmo assim, cada euro que os fãs te pagaram continua teu</em>, porque foi diretamente para ti.",

  "rights.takedownStartedToast":
    "«{title}» entra na janela de remoção de 14 dias",
  "rights.removalCancelledToast":
    "Remoção cancelada. O lançamento continua disponível",

  // ── Modal de confirmação de remoção (StudioTakedownModal) ─────────────────
  "rights.modal.confirmAria": "Confirmar remoção de {title}",
  "rights.modal.eyebrow": "Confirmar remoção",
  "rights.modal.title": "Remover <em>{title}</em>?",
  "rights.modal.body":
    "Vai deixar de estar disponível dentro de 14 dias. Os links existentes vão passar a mostrar uma pequena página «este trabalho foi retirado pela pessoa artista». <em>Podes republicá-lo quando quiseres</em>. Os teus masters nunca saem das tuas mãos.",
  "rights.modal.keepEarned":
    "<em>Ficas com tudo o que os fãs já te pagaram.</em> Esse dinheiro foi diretamente para ti, por isso uma remoção não lhe toca.",
  "rights.modal.confirmCta": "Remover",
  "rights.modal.cancelCta": "Manter disponível",

  // ── Faixa "mais deste artista" no álbum (StudioAlbumMore) ─────────────────
  "album.more.heading": "Mais de <em>{artist}</em>",
  "album.more.artistPageCta": "Página de artista",

  // ── Chrome partilhado de hero (Álbum/Set — nomes masculinos em
  //    pt-PT; Faixa/Coleção reutilizam o room.hero.addedToast / removedToast
  //    feminino acima, por concordância de género) ───────────────────────────
  "detail.shareCta": "Partilhar",
  "detail.linkCopiedToast": "Link copiado para a área de transferência",
  "detail.copyFailedToast": "Não foi possível copiar o link",
  "detail.tipArtistCta": "Dar gorjeta a {artist}",
  "detail.tipCta": "Dar gorjeta",
  "detail.addedToast": "Adicionado à tua biblioteca",
  "detail.removedToast": "Removido da tua biblioteca",

  // ── Página da faixa (StudioTrackPage + Hero + Sidebar + Lyrics) ───────────
  "track.hero.eyebrow": "Faixa {current} de {total}",
  "track.inSet.status":
    "Estás a ouvir com <b>{count}</b> pessoas no <em>set de quarta-feira</em>, programado por {curator}. A faixa {next} começa dentro de <b>{countdown}</b>.",
  "track.inSet.joinCta": "Entrar no set",
  "track.more.fullAlbumCta": "Álbum completo",
  "track.sidebar.curatorNoteLabel": "Nota de curadoria",
  "track.sidebar.creditsHeading": "Créditos",
  "track.sidebar.leadSheetLabel": "Partitura",
  "track.sidebar.downloadCta": "Transferir",
  "track.sidebar.curatorRole": "responsável pela programação · o set de quarta",
  "track.sidebar.sheetSpec": "6 páginas · piano + voz · {licence} · {artist}",
  "track.lyrics.heading": "Letra & <em>tradução</em>",
  "track.lyrics.leadSheetChordsCta": "Partitura & acordes",

  // ── Página do álbum (StudioAlbumPage + Hero + Main + Sidebar) ─────────────
  "album.tabs.tracklist": "Faixas",
  "album.tabs.linerNotes": "Notas de encarte",

  // ── Perfil do artista (StudioArtistPage + Hero + Main + Sidebar) ──────────
  "artist.tabs.music": "Música",
  "artist.tabs.about": "Sobre",
  "artist.hero.followCta": "Seguir",
  "artist.hero.followedToast": "A seguir {artist}",
  "artist.hero.unfollowedToast": "Deixaste de seguir {artist}",
  "artist.main.releasesHeading": "Lançamentos",
  "artist.main.singlesHeading": "Singles & <em>avulsos</em>",
  "artist.sidebar.thisMonthHeading": "{artist} · este mês",
  "artist.sidebar.tipsReceived": "Gorjetas recebidas",
  "artist.sidebar.directSubscribers": "Subscrições diretas",

  // ── Página do set ao vivo (StudioSetPage) ─────────────────────────────────
  "set.page.playAria": "Reproduzir o set",
  "set.page.joinLiveRoomCta": "Entrar na sala ao vivo",
  "set.page.tracklistHeading": "A <em>lista de faixas</em>",
  "set.page.creditedNote": "Cada faixa creditada a quem a fez",
  "set.page.playingNowLabel": "a tocar agora",

  // ── Prateleiras fora de antena (StudioOffAirShelves) ──────────────────────
  "offAir.carryOn.heading": "Continua onde <em>paraste</em>",
  "offAir.carryOn.sub":
    "Da tua biblioteca · continua a tocar, em transmissão ou não",
  "offAir.libraryCta": "Biblioteca",
  "offAir.quietHours.heading": "Para as <em>horas mais calmas</em>",
  "offAir.quietHours.sub":
    "Coleções do conselho que não precisam de luzes acesas",
  "offAir.allCta": "Todas",

  // ── Página de lançamento removido (StudioWithdrawnPage) ───────────────────
  "withdrawn.hero.eyebrow": "Removido pela pessoa artista",
  "withdrawn.hero.title": "Este trabalho foi <em>removido</em>.",
  "withdrawn.hero.sub":
    "A pessoa artista removeu-o do Studio: o direito é dela, a decisão é dela. <em>Não deve nenhuma explicação</em>, e não pedimos uma.",
  "withdrawn.card.title": "O que isto <em>significa</em>",
  "withdrawn.card.body":
    "Uma remoção tira o lançamento do Studio e deixa o trabalho intacto. Os masters ficam com a pessoa artista, que pode republicá-lo quando quiser. Se o tivesses comprado ou guardado, continua na tua biblioteca como registo, marcado como removido.",
  "withdrawn.card.jadeLine":
    "Se deste uma gorjeta ou compraste isto, <em>cada cêntimo já chegou à pessoa artista</em> e fica com ela. Nada é recuperado.",
  "withdrawn.visitArtistCta": "Ver a página de artista",
  "withdrawn.backToPlayerCta": "Voltar ao leitor",
  "withdrawn.still.heading": "Ainda <em>disponível</em> desta pessoa artista",
  "withdrawn.still.sub":
    "O que continua disponível, e o que o conselho programou em vez disso",

  // ── Cartão final para partilha social (StudioEndCardPage) ─────────────────
  "endCard.eyebrow": "Uma cooperativa de streaming",
  "endCard.tagline": "a música, <em>paga em frente.</em>",
  "endCard.directLine": "os fãs pagam diretamente a quem cria",
  "endCard.perBuyLabel": "de cada compra",
  "endCard.perTipLabel": "de cada gorjeta",
  "endCard.listenCta": "ouve com orgulho",

  // ── Conselho de curadoria (StudioCouncilPage) ─────────────────────────────
  // Só chrome. O conteúdo fictício da demonstração desta página vive em
  // studioShowcase (traduzido); nomes próprios e números ficam nos ficheiros de dados.
  "council.hero.eyebrow": "Governação · o conselho",
  "council.hero.title":
    "Seis pessoas escolhem o que toda a gente <em>ouve</em>.",
  "council.hero.dek":
    "Eleitas todos os anos pela assembleia, recebem uma ajuda de custo fixa registada no livro-razão público, com mandatos limitados a dois anos. Programam o set semanal, tratam da triagem e escrevem as notas. <em>Tudo o que escolhem leva o nome delas.</em>",
  "council.intro.lede":
    "O conselho trabalha às claras. Ouvem em público, <em>justificam cada escolha num parágrafo</em>, e respondem perante a cooperativa. Podes ler os cadernos, ver as seleções, e votar para as substituir.",

  "council.fact.seats.value": "<em>6</em> lugares",
  "council.fact.seats.label": "mandatos de 2 anos · escalonados",
  "council.fact.stipend.value": "<em>400 €</em>",
  "council.fact.stipend.label": "ajuda de custo mensal · no livro-razão",
  "council.fact.slates.value": "<em>52</em>",
  "council.fact.slates.label": "seleções programadas este ano",
  "council.fact.election.value": "<em>9 jun.</em>",
  "council.fact.election.label": "próxima eleição · assembleia",

  "council.notebookLabel": "Do caderno",
  "council.recentSlatesLabel": "Seleções recentes",
  "council.theirSlateCta": "Ver seleção",

  // ── Definições (StudioSettingsPage + Controls + Sections) ─────────────────

  "settings.audio.label": "Áudio",
  "settings.audio.title": "Qualidade de <em>som</em>",
  "settings.audio.dek":
    "FLAC é sem perdas e maior; AAC pesa menos dados. Reprodução e transferências podem diferir. Escolhe por contexto.",
  "settings.audio.streamQuality.heading": "Qualidade de reprodução por defeito",
  "settings.audio.streamQuality.body":
    "Numa boa ligação, vamos tão alto quanto permitires. Nunca subimos a qualidade em dados móveis sem perguntar.",
  "settings.audio.streamQuality.flac.label": "FLAC · 24/48",
  "settings.audio.streamQuality.flac.badge": "sem perdas",
  "settings.audio.streamQuality.flac.sub":
    "O master, sem alterações. ~25 MB / faixa.",
  "settings.audio.streamQuality.aac.label": "AAC · 256kbps",
  "settings.audio.streamQuality.aac.sub":
    "Transparente para a maioria dos ouvidos. ~7 MB / faixa.",
  "settings.audio.downloadQuality.heading": "Qualidade de transferência",
  "settings.audio.downloadQuality.body":
    "O que guardamos quando gravas uma faixa offline (só apoiantes).",
  "settings.audio.normalise.heading": "Normalizar o volume",
  "settings.audio.normalise.body":
    "Equilibra o volume entre faixas e sets. <em>Desliga</em> se quiseres a dinâmica original da pessoa artista.",

  "settings.privacy.label": "Privacidade",
  "settings.privacy.title": "O que o Studio <em>guarda</em>",
  "settings.privacy.dek":
    "Em resumo: um histórico de audição que só tu vês e que podes pausar ou limpar. Nunca vendemos, partilhamos ou treinamos com o que ouves. As audições contam de forma anónima para os totais de quem faz a música, com o histórico ligado ou não.",
  "settings.privacy.cloudSync.heading": "Sincronizar a biblioteca na nuvem",
  "settings.privacy.cloudSync.body":
    "As gravações e os seguimentos passam entre dispositivos. Sem isto, ficam só neste dispositivo.",
  "settings.privacy.tipNotes.heading": "Notas de gorjeta: quem as vê",
  "settings.privacy.tipNotes.body":
    "A nota que escreves ao dar uma gorjeta. <em>Privado é a predefinição</em>: só tu e a pessoa artista a leem.",
  "settings.privacy.tipNotes.private.label": "Privado",
  "settings.privacy.tipNotes.private.badge": "predefinição",
  "settings.privacy.tipNotes.private.sub":
    "Só tu e a pessoa artista. Nunca aparece na página dela nem no teu recibo público.",
  "settings.privacy.tipNotes.semi.label": "Semipúblico",
  "settings.privacy.tipNotes.semi.sub":
    "Visível para quem também apoia a mesma pessoa artista, com o teu nome de utilizador.",
  "settings.privacy.tipNotes.public.label": "Público",
  "settings.privacy.tipNotes.public.sub":
    "Qualquer pessoa pode ler na página da pessoa artista. Ainda podes ocultar qualquer nota depois.",
  "settings.privacy.tipReceipts.heading": "Recibos de gorjeta públicos",
  "settings.privacy.tipReceipts.body":
    'Cada gorjeta gera um recibo com a divisão, sem dados pessoais. Ligado, pode ser partilhado como um cartão "olha o que pagámos a quem fez esta música".',

  "settings.captions.label": "Legendas e letras",
  "settings.captions.title": "Palavras no <em>ecrã</em>",
  "settings.captions.dek":
    "As salas ao vivo têm legendas (automáticas, com revisão humana nas transmissões do conselho). As letras avançam ao ritmo da faixa quando a pessoa artista as fornece.",
  "settings.captions.showCaptions.heading":
    "Mostrar legendas nas salas ao vivo",
  "settings.captions.showCaptions.body":
    "A conversa entre músicas, transcrita. <em>Ligado</em> por defeito em todas as transmissões.",
  "settings.captions.captionSize.heading": "Tamanho das legendas",
  "settings.captions.captionSize.body":
    "Que tamanho têm as legendas e a linha de letra em avanço.",
  "settings.captions.lyricLanguage.heading": "Idioma da letra",
  "settings.captions.lyricLanguage.body":
    "Mostra as letras no original, ou numa tradução da comunidade quando existir.",
  "settings.captions.lyricLanguage.opt.original": "Original (como gravado)",
  "settings.captions.lyricLanguage.opt.english": "Tradução em inglês",
  "settings.captions.lyricLanguage.opt.portuguese": "Português",
  "settings.captions.lyricLanguage.opt.spanish": "Español",
  "settings.captions.lyricLanguage.opt.french": "Français",
  "settings.captions.showBoth.heading": "Mostrar original e tradução",
  "settings.captions.showBoth.body":
    "Duas linhas ao mesmo tempo, o original por cima da tradução.",

  "settings.tipping.label": "Gorjetas",
  "settings.tipping.title": "A tua <em>gorjeta</em> por defeito",
  "settings.tipping.dek":
    "O que o botão de gorjeta rápida envia. 100% chega à pessoa artista. Nunca há corte da plataforma nas gorjetas.",
  "settings.tipping.defaultAmount.heading": "Valor por defeito",
  "settings.tipping.defaultAmount.body":
    "Podes sempre escolher outro valor no momento de dar a gorjeta.",
  "settings.tipping.roundUp.heading":
    "Arredondar compras de álbuns para uma gorjeta",
  "settings.tipping.roundUp.body":
    "Um álbum de {albumPrice} passa a {roundedPrice}, e os {tipAmount} vão para a pessoa artista como gorjeta.",

  "settings.erase.label": "Apagar e sair",
  "settings.erase.title": "Um toque, <em>sem perguntas</em>",
  "settings.erase.dek":
    "Isto não pergunta duas vezes nem mostra um modal. Falamos a sério: sair devia ser tão fácil como entrar.",
  "settings.erase.export.heading": "Transferir tudo o que guardamos sobre ti",
  "settings.erase.export.note":
    "Um ficheiro JSON com as tuas gravações, gorjetas, recibos e definições, enviado por email dentro de uma hora.",
  "settings.erase.export.cta": "Pedir exportação",
  "settings.erase.export.toast":
    "Vamos enviar-te a exportação dos teus dados dentro de uma hora.",
  "settings.erase.closeAccount.heading": "Encerrar a minha conta Studio",
  "settings.erase.closeAccount.note":
    "Termina a tua contribuição de apoiante, remove a tua biblioteca. As gorjetas passadas continuam pagas a artistas. <em>As tuas formas de receber, se também és artista, ficam como estão.</em>",
  "settings.erase.closeAccount.cta": "Encerrar conta",
  "settings.erase.closeAccount.toast":
    "O encerramento da conta abre num fluxo à parte.",

  // ── Notificações (StudioNotificationsPage) ────────────────────────────────
  // Só chrome. O conteúdo fictício da demonstração desta página vive em
  // studioShowcase (traduzido); nomes próprios e números ficam nos ficheiros de dados.
  "notifications.eyebrow":
    "O teu Studio · o que aconteceu enquanto estiveste fora",
  "notifications.title": "Houve <em>movimento</em> por aqui.",
  "notifications.dek":
    "Respostas a gorjetas de artistas, novos lançamentos de quem segues, salas ao vivo prestes a abrir. <em>Só as coisas que pediste para ouvir</em>. Ajusta isso nas Definições.",
  "notifications.filter.all": "Tudo",
  "notifications.filter.reply": "Respostas",
  "notifications.filter.release": "Lançamentos",
  "notifications.filter.live": "Ao vivo",
  "notifications.markAllReadCta": "Marcar tudo como lido",
  "notifications.markAllReadToast": "Tudo em dia",
  "notifications.empty":
    "Nada <em>desse género</em> por agora. Quando acontecer, aparece aqui. O silêncio é permitido.",
  "notifications.day.today": "Hoje",
  "notifications.day.week": "Esta semana",
  "notifications.action.joinRoom": "Juntar-te ao set",
  "notifications.action.rsvp": "Confirmar presença",
  "notifications.rsvpToast": "Estás na lista desta estreia",

  // ── Modal de gorjeta (StudioTipModal — reutilizado em várias páginas) ─────
  "tipModal.dialogAria": "Dar uma gorjeta a {recipient}",
  "tipModal.closeAria": "Fechar",
  "tipModal.eyebrow": "Gorjeta · 100% para a pessoa artista",
  "tipModal.title": "Dar uma gorjeta a <em>{recipient}</em>",
  "tipModal.sub":
    "As gorjetas passam sem retenções: cada cêntimo chega a {recipient}.",
  "tipModal.customPlaceholder": "Outro valor",
  "tipModal.sendingCta": "A enviar…",
  "tipModal.sendCta": "Dar {amount}",
  "tipModal.note":
    "Paga a {recipient} para além da reprodução · <em>nada é retido</em>",
  "tipModal.success.body":
    "100% da tua gorjeta chega a {recipient} diretamente. Sem corte da plataforma, sem processamento retido.",
  "tipModal.success.backCta": "Voltar à música",
  "tipModal.amountsLabel": "Valor da gorjeta",
  "tipModal.failed":
    "O emissor do cartão da demonstração recusou {amount} porque não aceita gorjetas acima de {limit}. Escolhe um valor mais baixo e tenta outra vez, não foi cobrado nada",
  "tipModal.success.heading": "Gorjeta enviada",
  "tipModal.success.sentTo": "Enviado a {recipient}",

  // ── Navegação do back-office de criação (StudioCreatorShell) ──────────────
  "creator.nav.dashboard": "Painel",
  "creator.nav.newRelease": "Novo lançamento",
  "creator.product": "Criação",
  "creator.viewPublicPageCta": "Ver página pública",

  // ── A tua biblioteca (StudioLibraryPage) ──────────────────────────────────
  // Só chrome — os títulos de álbuns/sets/faixas/coleções e nomes de artistas
  // na biblioteca fictícia abaixo são conteúdo e ficam em inglês nos dois
  // modos (§1).
  "library.eyebrow": "A tua biblioteca",
  "library.title": "Tudo o que <em>guardaste.</em>",
  "library.dek":
    "Álbuns, sets e faixas guardados, além dos <em>{amount}</em> em música que já compraste diretamente a {artistCount} artistas este ano.",
  "library.tabs.albums": "Álbuns",
  "library.tabs.sets": "Sets",
  "library.tabs.collections": "Coleções",
  "library.tabs.tracks": "Faixas",
  "library.category.albums": "álbuns",
  "library.category.sets": "sets",
  "library.category.collections": "coleções",
  "library.category.tracks": "faixas",
  "library.empty.title": "A tua biblioteca está vazia aqui",
  "library.empty.description":
    "Ainda nada em <em>{category}</em>. Explora o Studio, e tudo o que guardares aparece aqui, para voltares quando quiseres.",
  "library.empty.browseCta": "Explorar o Studio",
  "library.empty.searchCta": "Pesquisar o catálogo",

  // ── Pesquisa (StudioSearchPage) ────────────────────────────────────────────
  // Só chrome — os títulos de resultados/nomes de artistas/termos de pesquisa
  // recente abaixo são conteúdo (ou, no caso das pesquisas recentes, o
  // histórico da própria pessoa em modo real) e ficam em inglês nos dois
  // modos (§1).
  "search.eyebrow": "Pesquisar o catálogo",
  "search.title": "Encontra o <em>som.</em>",
  "search.inputPlaceholder": "Artistas, álbuns, sets, partituras…",
  "search.filter.everything": "Tudo",
  "search.filter.artists": "Artistas",
  "search.filter.albums": "Álbuns",
  "search.filter.sets": "Sets",
  "search.filter.collections": "Coleções",
  "search.filter.sheetMusic": "Partituras",
  "search.results.forQuery": "Resultados para <em>{query}</em>",
  "search.results.featuredNow": "Em destaque <em>agora</em>",
  "search.empty.title": "Nada correspondeu a isso",
  "search.empty.description":
    "Não encontrámos nada para <em>{term}</em>. Tenta outra palavra, ou alarga o filtro. O catálogo é maior do que parece.",
  "search.empty.clearCta": "Limpar pesquisa",

  // ── Painel de criação (StudioDashboardPage + Charts + Side) ───────────────
  // Só chrome — o nome do artista, títulos de faixas, números por artista
  // (STATS/CURATORS/CITIES/BARS em studioDashboard.data) e os planos
  // concretos de sala ao vivo abaixo são dados deste artista,
  // vindos da API em modo real, e ficam em inglês nos dois modos (§1).
  "dashboard.hero.eyebrow": "Studio · este mês",
  "dashboard.hero.title": "Boa semana, <em>{name}</em>.",
  "dashboard.hero.sub":
    "<em>{trackTitle}</em> já tem dois meses e continua a subir. Os curadores mantiveram-na na rotação.",

  "dashboard.stats.streamingEarnings": "Compras de lançamentos",
  "dashboard.stats.tipsReceived": "Gorjetas recebidas",

  "nextSteps.heading": "Próximos passos",
  "nextSteps.drafts_one": "Tens {count} rascunho à espera de ser terminado",
  "nextSteps.drafts_other":
    "Tens {count} rascunhos à espera de serem terminados",
  "nextSteps.draftsAction": "Terminar rascunhos",
  "nextSteps.scheduled_one": "{count} lançamento está agendado",
  "nextSteps.scheduled_other": "{count} lançamentos estão agendados",
  "nextSteps.scheduledAction": "Rever lançamentos agendados",
  "nextSteps.support":
    "Adiciona ligações do Bandcamp, Ko-fi ou Patreon para que as pessoas te possam apoiar",
  "nextSteps.supportAction": "Adicionar ligações de apoio",
  "nextSteps.press": "Prepara o teu kit de imprensa com um contacto e citações",
  "nextSteps.pressAction": "Editar kit de imprensa",

  "dashboard.charts.curators.heading":
    "Curadoria e <em>seleções</em> · o que deu visibilidade ao teu trabalho esta semana",
  "dashboard.charts.geography.heading": "De onde <em>ouvem</em>",
  "dashboard.charts.geography.hint":
    "Só ao nível da cidade · nunca vemos a rua nem nada mais fino. <em>É o máximo que alguma vez te diremos sobre quem ouve.</em>",

  "dashboard.side.quickActions.heading": "O que podes <em>fazer</em> daqui",
  "dashboard.side.quickActions.upload.label": "Carregar um novo lançamento",
  "dashboard.side.quickActions.upload.hint":
    "WAV / FLAC · 3 passos · 8 minutos",
  "dashboard.side.quickActions.goLive.label":
    "Ficar ao vivo: abrir uma sala ao vivo",
  "dashboard.side.quickActions.payments.label":
    "Rever pagamentos de quem compra",
  "dashboard.side.quickActions.payments.hint":
    "Vê o que quem compra diz ter pago e confirma",
  "dashboard.side.deal.eyebrow": "O acordo, sempre",
  "dashboard.side.deal.heading": "Cada compra vai <em>para ti.</em>",
  "dashboard.side.deal.body":
    "Os fãs pagam-te diretamente pelos teus álbuns, EPs, singles e faixas, e o QueerPulse nunca guarda o dinheiro. O acordo é igual para um primeiro lançamento ou para quem vence um festival.",
  "dashboard.side.deal.buys.label": "Compras",
  "dashboard.side.deal.buys.value": "Pagas diretamente a ti",
  "dashboard.side.deal.platform.label": "Fica para o QueerPulse",
  "dashboard.side.deal.platform.value": "Nada",
  "dashboard.side.deal.tips.label": "Gorjetas",
  "dashboard.side.deal.tips.value": "100% para ti",

  // ── Assistente de carregamento (StudioUploadPage + Sections) ──────────────
  // Só chrome — os nomes dos ficheiros carregados, os detalhes de validação
  // da imagem, o título/género deste lançamento e os nomes/funções dos
  // colaboradores abaixo são dados deste lançamento do artista, vindos da
  // API em modo real, e ficam em inglês nos dois modos (§1).
  "upload.hero.eyebrow": "Novo lançamento · carregar",
  "upload.hero.title": "Traz isto para <em>casa.</em>",
  "upload.hero.sub":
    "Larga os masters. Nós convertemos, tu ficas com os originais. Três passos, cerca de oito minutos.",

  "upload.steps.files.nm": "Ficheiros",
  "upload.steps.files.sub": "· WAV / FLAC · capa · letras",
  "upload.steps.metadata.nm": "Metadados e créditos",
  "upload.steps.metadata.sub": "· título · ano · divisões por faixa",
  "upload.steps.licence.nm": "Licença e lançamento",
  "upload.steps.licence.sub": "· CC / ARR · preço · data de publicação",

  "upload.dropzone.title":
    "Larga uma pasta de <em>WAVs</em>, ou clica para procurar.",
  "upload.dropzone.body":
    "Um EP, um álbum, um single: o mesmo fluxo. Descobrimos a ordem das faixas a partir dos nomes dos ficheiros.",
  "upload.dropzone.accepts":
    "aceita · <em>WAV · FLAC · AIFF</em> · máx. 96 kHz / 24 bit · até 24 faixas",

  "upload.files.heading":
    "Carregados <em>{readyCount} de {totalCount} prontos</em>",
  "upload.files.okReady": "OK · pronto",

  "upload.coverArt.heading":
    "Capa <em>{readyCount} de {totalCount} · validada</em>",

  "upload.splits.heading":
    "Divisões <em>por faixa</em> · 100% para ti por defeito",
  "upload.splits.sub":
    "Adiciona colaboradores e encaminhamos cada cêntimo diretamente para o banco deles.",
  "upload.splits.table.collaborator": "Colaborador",
  "upload.splits.table.roleTracks": "Função · faixas",
  "upload.splits.table.share": "Parte",
  "upload.splits.footer":
    "A divisão por defeito soma {total} · ajustes por faixa sobrepõem-se",
  "upload.splits.addCollaboratorCta": "Adicionar colaborador",
  "upload.splits.handlePlaceholder": "Utilizador QP ou email",
  "upload.splits.inviteCta": "Convidar",
  "upload.splits.invitedToast": "{handle} convidade para as divisões",
  "upload.splits.invitedSubLabel": "convidade · IBAN pendente",
  "upload.splits.invitedRole": "colaborador · todas as faixas",
  "upload.splits.demo.mariana.subtitle":
    "tu · composição, voz, piano · todas as faixas",
  "upload.splits.demo.mariana.role": "autora e intérprete · faixas 1 a 11",
  "upload.splits.demo.joao.subtitle":
    "violoncelista · convite do IBAN pendente",
  "upload.splits.demo.joao.role": "violoncelo · faixas 2, 7 e 11",
  "upload.splits.demo.ines.subtitle":
    "mistura e masterização · membro do QueerPulse",
  "upload.splits.demo.ines.role": "produção · todas as faixas",
  "upload.splits.demo.coro.subtitle": "coro · 15 vozes com uma só parte",
  "upload.splits.demo.coro.role": "coro · faixa 4",

  "upload.side.files.eyebrow": "O que fazemos com os teus ficheiros",
  "upload.side.files.title": "Teus, <em>na mesma</em>.",
  "upload.side.files.body":
    "Tu largas os masters; nós convertemos e transmitimos. O teu WAV / FLAC original continua a ser teu. Guardamos uma cópia <em>só</em> para entrega. A remoção apaga a cópia de reprodução em 14 dias. Não exclusivo, sempre.",
  "upload.side.files.list.sourceKept.label": "Fonte guardada",
  "upload.side.files.list.sourceKept.value": "o teu ficheiro, sem alterações",
  "upload.side.files.list.listenerDelivery.label": "Entrega ao ouvinte",
  "upload.side.files.list.listenerDelivery.value": "FLAC + AAC 256",
  "upload.side.files.list.loudnessTarget.label": "Alvo de volume",
  "upload.side.files.list.loudnessTarget.value":
    "−14 LUFS, medido durante o envio",
  "upload.side.files.list.isrc.label": "Atribuição de ISRC",
  "upload.side.files.list.isrc.value": "automática",

  "upload.side.lyrics.eyebrow": "Letras e traduções",
  "upload.side.lyrics.title": "Letras <em>obrigatórias</em>, traduções pagas.",
  "upload.side.lyrics.body":
    "Carrega as letras em qualquer idioma. Para uma tradução linha a linha, o fundo de solidariedade paga <em>40 € por música</em> a quem traduz na comunidade. Mantêm a assinatura; tu aprovas antes de publicar.",
  "upload.side.lyrics.list.autoTranscribe.label": "Transcrição automática",
  "upload.side.lyrics.list.autoTranscribe.value": "grátis · ~94%",
  "upload.side.lyrics.list.communityTranslation.label":
    "Tradução da comunidade",
  "upload.side.lyrics.list.communityTranslation.value": "40 € para quem traduz",
  "upload.side.lyrics.list.approval.label": "A tua aprovação",
  "upload.side.lyrics.list.approval.value": "antes de publicar",

  "upload.metadata.heading": "Metadados e <em>créditos</em>",
  "upload.metadata.sub":
    "Mais alguns detalhes e o teu lançamento segue para a fila de revisão do conselho.",
  "upload.metadata.field.title": "Título do lançamento",
  "upload.metadata.field.year": "Ano de lançamento",
  "upload.metadata.field.genre": "Géneros",
  "upload.metadata.genre.fado": "Fado / contemporâneo",
  "upload.metadata.genre.electronic": "Eletrónica",
  "upload.metadata.genre.folk": "Folk",
  "upload.metadata.genre.experimental": "Experimental",
  "upload.metadata.backCta": "Voltar aos ficheiros",
  "upload.metadata.submitCta": "Submeter para revisão",

  "upload.submitted.title": "Submetido para <em>revisão.</em>",
  "upload.submitted.body":
    "O teu lançamento está na fila do conselho. Uma pessoa curadora vai verificar os ficheiros, divisões e créditos, normalmente dentro de um ou dois dias, e vais receber um aviso assim que estiver disponível. Nada é publicado sem a tua confirmação final.",
  "upload.submitted.toast": "Lançamento submetido para revisão",

  "upload.continueToMetadataCta": "Continuar para metadados",

  // ── Programar a semana (StudioProgramPage + Inbox + Slate) ────────────────
  // Só chrome. O conteúdo fictício da demonstração desta página vive em
  // studioShowcase (traduzido); nomes próprios e números ficam nos ficheiros de dados.
  "program.header.eyebrow":
    "A programar a semana · segunda-feira de manhã · arrasta o que quiseres abaixo",
  "program.header.title": "Semana <em>{weekNumber}</em> · {dateRange}",
  "program.header.sub":
    "Constrói a seleção da semana: <em>uma capa, 12 a 16 faixas, 2 a 3 coleções, transmissões</em>. Publica ao meio-dia e a página inicial roda.",
  "program.header.autosave": "Guardado automaticamente · {time}, a cada tecla",
  "program.header.previewRoomCta": "Pré-visualizar o programa da semana",

  "program.publishBar.status":
    "A seleção está <em>{percent}% completa</em> · publica {publishDate} · a página inicial roda automaticamente",
  "program.publishBar.previewHomepageCta": "Pré-visualizar a página inicial",
  "program.publishBar.saveDraftCta": "Guardar rascunho",
  "program.publishBar.publishCta": "Publicar ao meio-dia",

  "program.toast.addedToSlate": "Adicionado à seleção desta semana",
  "program.toast.passed": "Recusado. Quem submeteu pode voltar a tentar depois",
  "program.toast.playingPreview": "A reproduzir pré-visualização…",
  "program.toast.openingRoomPreview": "A abrir a pré-visualização do programa…",
  "program.toast.chooseNewCover": "Escolhe uma nova pessoa artista de capa…",
  "program.toast.editingCoverNote": "A editar a nota de capa…",
  "program.toast.openingHomepagePreview":
    "A abrir a pré-visualização da página inicial…",
  "program.toast.draftSaved": "Rascunho guardado",
  "program.toast.published":
    "Seleção publicada. A página inicial roda ao meio-dia",
  "program.toast.movedSingle": "{title} passou a ser o número {position}",
  "program.toast.addSingleFromInbox":
    "Escolhe uma submissão na caixa de entrada e usa + Programar para preencher uma vaga",
  "program.toast.addBroadcastDemo":
    "Agendar uma nova emissão está desligado na demonstração",

  "program.inbox.heading": "Submissões · <em>{count} novas</em>",
  "program.inbox.triageCta": "Triagem",
  "program.inbox.tip":
    "Arrasta qualquer submissão para a esquerda, para um espaço. <em>O fluxo de recusa com motivo está na triagem.</em>",
  "program.inbox.listenCta": "Ouvir",
  "program.inbox.slateLabel": "Selecionar",
  "program.inbox.passCta": "Recusar",

  "program.slate.cover.heading": "Artista de capa da semana",
  "program.slate.cover.count": "1 de 1 · o destaque da semana",
  "program.slate.cover.swapCta": "Trocar",
  "program.slate.cover.editNoteCta": "Editar nota",
  "program.slate.singles.heading": "Singles desta semana",
  "program.slate.singles.count":
    "{placed} de {total} colocados · {open} espaços em aberto",
  "program.slate.singles.notePlaceholder":
    "Escreve uma nota de uma linha · porquê isto, porquê agora",
  "program.slate.singles.noteAria": "Nota para {title}",
  "program.slate.singles.removeAria": "Remover {title}",
  "program.slate.singles.moveUpAria": "Mover {title} para cima",
  "program.slate.singles.moveDownAria": "Mover {title} para baixo",
  "program.slate.singles.addSlotLabel":
    "Arrasta uma faixa das submissões, ou clica para adicionar do catálogo",
  "program.slate.collections.heading": "Rotação de coleções",
  "program.slate.collections.count": "{placed} de {total}",
  "program.slate.broadcasts.heading": "Transmissões ao vivo esta semana",
  "program.slate.broadcasts.count":
    "{scheduled} agendadas · espaço {slotNumber} em aberto",
  "program.slate.broadcasts.addSlotLabel":
    "Agendar uma terceira transmissão para sábado à noite",

  // ── Triagem de submissões (StudioTriagePage + List + Detail) ──────────────
  // Só chrome. O conteúdo fictício da demonstração desta página vive em
  // studioShowcase (traduzido); nomes próprios e números ficam nos ficheiros de dados.
  // Os `id` dos separadores abaixo são valores de filtro estáveis, separados das etiquetas traduzidas (§5.1).
  "triage.header.eyebrow":
    "Triagem de submissões · o conselho responde a cada submissão em 14 dias",
  "triage.header.title":
    "Caixa de entrada · <em>{count}</em> novas esta semana.",
  "triage.header.sub":
    "Cada submissão é lida ou ouvida. <em>Recusar</em> exige uma frase: essa frase torna-se a resposta à pessoa artista. Tempo médio de resposta esta época: {days} dias.",

  "triage.kpi.newThisWeek": "novas esta semana",
  "triage.kpi.youClaimed": "reclamaste",
  "triage.kpi.medianReply": "resposta média",
  "triage.kpi.atDeadline": "no prazo limite",

  "triage.tabs.new.label": "Novas",
  "triage.tabs.new.queue": "novas",
  "triage.tabs.yours.label": "Tuas",
  "triage.tabs.yours.queue": "tuas",
  "triage.tabs.atDeadline.label": "No prazo",
  "triage.tabs.atDeadline.queue": "no prazo",
  "triage.tabs.shortlisted.label": "Pré-selecionadas",
  "triage.tabs.shortlisted.queue": "pré-selecionadas",
  "triage.tabs.answered.label": "Respondidas",
  "triage.tabs.answered.queue": "respondidas",

  "triage.list.empty.title": "Nada nesta fila",
  "triage.list.empty.description":
    "Não há submissões <em>{queue}</em> neste momento. Quando algo chegar, vais encontrá-lo aqui à espera.",
  "triage.list.backToNewCta": "Voltar às novas",
  "triage.list.dayOfTotal": "de 14 para responder",

  "triage.detail.playAria": "Reproduzir",
  "triage.detail.fileHeading": "O ficheiro",
  "triage.detail.file.format": "Formato",
  "triage.detail.file.loudness": "Volume",
  "triage.detail.file.duration": "Duração",
  "triage.detail.file.lyrics": "Letra",
  "triage.detail.file.splits": "Divisões",
  "triage.detail.flaggedHeading":
    "O que outras pessoas da curadoria assinalaram ({count})",
  "triage.detail.answerHeading": "A tua <em>resposta</em>",
  "triage.detail.decision.heading":
    "Se recusares, escreve uma frase. Isto vai para {artistName} como resposta.",
  "triage.detail.decision.placeholder":
    "Uma pequena frase que explique o não. Nunca enviamos uma carta-tipo.",
  "triage.detail.decision.hint":
    "Obrigatório para recusar. <em>Não obrigatório</em> para selecionar.",
  "triage.detail.holdCta": "Reter e ouvir de novo",
  "triage.detail.passCta": "Recusar com a tua nota",
  "triage.detail.addToSlateCta": "Adicionar à próxima seleção",
  "triage.detail.toast.held": "Retido para uma segunda audição",
  "triage.detail.toast.passed":
    "Recusado com a tua frase, enviado a {artistName}",
  "triage.detail.toast.addedToSlate": "Adicionado à próxima seleção",
  "triage.documentTitle": "Triagem de curadoria",
  "triage.tabsLabel": "Filas de submissões",
  "triage.detail.regionLabel": "Submissão selecionada",
  "triage.detail.pauseAria": "Pausar",

  // ── Sala ao vivo (StudioLivePage + LiveNow + LiveChat) ────────────────────
  // Só chrome. O conteúdo fictício da demonstração desta página vive em
  // studioShowcase (traduzido); nomes próprios e números ficam nos ficheiros de dados.
  // Os `id` dos separadores do chat são valores estáveis, separados das etiquetas traduzidas (§5.1).
  "live.ribbon.onAirNow": "No ar agora",

  "liveNow.saveTrackCta": "Guardar faixa",
  "liveNow.savedCta": "Guardada",
  "liveNow.savedToast": "Faixa guardada na tua biblioteca",
  "liveNow.removedToast": "Removida da tua biblioteca",
  "liveNow.lyricsNotesCta": "Letra e notas",
  "liveNow.listenersLabel":
    "a ouvir contigo · {sustainers} apoiantes, {casual} ocasionais",
  "liveNow.tippedLabel": "em gorjetas durante este set · 100% para artistas",
  "liveNow.buyCutLabel": "fica para o QueerPulse quando compras a {artist}",
  "liveNow.setBuilding.heading": "O set · <em>a construir-se ao vivo</em>",
  "liveNow.trackPosition": "Faixa {current} de {total} · saltou da fila",
  "liveNow.tipArtistCta": "Dar {amount} a {artist}",

  "liveChat.tabs.chat.label": "Chat",
  "liveChat.tabs.tips.label": "Gorjetas",
  "liveChat.tabs.listeners.label": "Ouvintes",
  "liveChat.inputPlaceholder": "diz algo a quem está a ouvir…",
  "liveChat.sendAria": "Enviar",
  "liveChat.tipPresetCta": "Dar {amount}",
  "liveChat.tipCustomCta": "Dar __ €",
  "liveChat.tabsLabel": "Painéis do chat",
  "liveChat.tips.empty":
    "Ainda sem gorjetas. As gorjetas aparecem aqui à medida que chegam",
  "liveChat.logLabel": "Mensagens do chat em direto",

  // ── Consola de transmissão ao vivo (StudioBroadcastPage + Console) ───────
  // Só chrome. O conteúdo fictício da demonstração desta página vive em
  // studioShowcase (traduzido); nomes próprios e números ficam nos ficheiros de dados.
  "broadcast.status.onAir": "Estás <em>no ar</em>",
  "broadcast.status.livePill": "ao vivo",
  "broadcast.status.meta":
    "<em>{count}</em> a ouvir · {sustainers} apoiantes · {cities} cidades",
  "broadcast.status.pauseMicCta": "Pausar microfone",
  "broadcast.status.endBroadcastCta": "Terminar transmissão",
  "broadcast.status.toast.micPaused":
    "Microfone em pausa. O público ouve silêncio",
  "broadcast.status.toast.ending":
    "A transmissão termina em 5… a arquivar como reposição",

  "broadcast.audioIn.panelLabel": "Entrada de áudio",
  "broadcast.audioIn.singleCamVideo": "Vídeo de uma câmara",
  "broadcast.audioIn.cameraNote":
    "Só áudio é a predefinição para salas ao vivo. A câmara chega na Fase 5, por agora está desativada.",

  "broadcast.nowPlaying.onAirNow": "No ar agora",
  "broadcast.nowPlaying.setListLabel":
    "Lista do set · <em>escreve à medida que tocas</em>: torna-se a folha de cue no arquivo",
  "broadcast.nowPlaying.inputPlaceholder":
    "O que acabaste de tocar? Artista · título…",
  "broadcast.nowPlaying.inputAria": "Adicionar uma faixa à lista do set",
  "broadcast.nowPlaying.addCta": "Adicionar",
  "broadcast.nowPlaying.justAdded": "Acabado de adicionar",
  "broadcast.nowPlaying.liveYourOwn": "ao vivo, teu",
  "broadcast.nowPlaying.badge.onAir": "No ar",
  "broadcast.nowPlaying.badge.matched": "Correspondido",
  "broadcast.nowPlaying.badge.hold": "Em espera",
  "broadcast.nowPlaying.footer":
    "Faixas correspondidas ficam creditadas a quem as fez automaticamente. <em>Faixas retidas esperam</em> até o sistema de correspondência do conselho as validar.",

  "broadcast.aside.tipsTab": "Gorjetas ao vivo <em>{amount}</em>",
  "broadcast.aside.talkbackTab": "Apoio <em>{count}</em>",
  "broadcast.aside.tipsTotalLabel":
    "Esta noite, até agora · <em>100% para ti</em>",
  "broadcast.aside.talkback.placeholder":
    "Fala com a tua moderação (quem ouve não vê isto)…",
  "broadcast.aside.talkback.aria": "Falar com a tua moderação",
  "broadcast.aside.talkback.sendCta": "Enviar",
  "broadcast.aside.talkback.sentToast": "Enviado à tua moderação",

  // ── Loja de partituras (StudioSheetStorePage + Preview + Checkout + Also) ──
  "sheet.store.eyebrow": "Arquivo de partituras e letras",
  "sheet.store.title": "Compra a <em>partitura</em>, paga a quem a fez.",
  "sheet.store.dek":
    "Um micropagamento de {amount} desbloqueia um PDF limpo e imprimível, e reparte <em>{splitRatio}</em> por quem compôs e transcreveu. Ler é grátis; descarregar paga.",

  "sheet.preview.eyebrow": "Partitura · transcrição",
  "sheet.preview.byLine":
    "música & letra de <strong>{composer}</strong> · de <em>{album}</em>",
  "sheet.preview.freePreview":
    "Pré-visualização gratuita · <em>página {page} de {total}</em>",
  "sheet.preview.watermark": "QUEERPULSE · PRÉVIA",
  "sheet.preview.lockedPages":
    "As páginas {from} a {to} desbloqueiam na compra",
  "sheet.preview.transcribedBy": "Transcrito por <em>{name}</em>",
  "sheet.preview.transcriberRole": "Transcrição da comunidade",
  "sheet.preview.transcriberNote":
    "<em>a tua compra paga diretamente a quem transcreve</em>",

  "sheet.checkout.title": "A tua <em>descarga</em>",
  "sheet.checkout.subtitle":
    "Uma partitura · PDF limpo · tua para guardar & imprimir",
  "sheet.checkout.processingLabel": "Processamento",
  "sheet.checkout.processingSub": "taxa SEPA da cooperativa",
  "sheet.checkout.totalLabel": "Total",
  "sheet.checkout.splitHeading":
    "Para onde vão os teus {amount} · {splitRatio}",
  "sheet.checkout.role.transcriber": "transcrição",
  "sheet.checkout.role.composer": "composição",
  "sheet.checkout.role.coop": "A cooperativa · alojamento & infraestrutura",
  "sheet.checkout.splitFoot":
    "As partituras pagam <em>90%</em> a quem as fez, porque o trabalho é único e alojar um PDF custa quase nada. <em>Aprovado na assembleia de 9 de junho.</em>",
  "sheet.checkout.payMethod.card.label": "Cartão guardado",
  "sheet.checkout.payMethod.card.sub": "um toque, sem reintroduzir dados",
  "sheet.checkout.payMethod.sepa.label": "SEPA direto",
  "sheet.checkout.payMethod.sepa.sub":
    "taxa mais baixa, liquidação em 1 a 2 dias",
  "sheet.checkout.paidLabel": "Pago",
  "sheet.checkout.downloadingLabel": "a descarregar o PDF…",
  "sheet.checkout.payCta": "Pagar {amount} & descarregar",
  "sheet.checkout.note":
    "Descarga imediata · descarrega outra vez quando quiseres a partir da tua biblioteca · <em>quem fez isto é pago esta noite</em>.",
  "sheet.checkout.downloadedToast":
    "Descarregado: {amount} pagos a {names} esta noite",

  "sheet.also.heading": "Da mesma <em>transcrição</em>",
  "sheet.also.subtitle_one":
    "{name} · {count} partitura · {amount} chega a quem transcreve por descarga",
  "sheet.also.subtitle_other":
    "{name} · {count} partituras · {amount} chega a quem transcreve por descarga",
  "sheet.also.freeReadTag": "Leitura gratuita",

  // ── Recibo de gorjeta (StudioReceiptPage) ──────────────────────────────────
  "receipt.tipEyebrow": "Gorjeta · enquanto ouvias",
  "receipt.byPrefix": "de",
  "receipt.fromAlbum": "de <em>{album}</em>",
  "receipt.thanksTitle": "{artist} recebeu <em>{amount}</em>.",
  "receipt.thanksSub":
    "Cada cêntimo. Sem corte da plataforma. <em>Foste tu que fizeste isso.</em>",
  "receipt.detail.receiptNo": "N.º do recibo",
  "receipt.detail.dateTime": "Data & hora",
  "receipt.detail.from": "De",
  "receipt.detail.method": "Método",
  "receipt.detail.visibility": "Visibilidade",
  "receipt.detail.sustainerSince": "a apoiar desde {date}",
  "receipt.detail.chosenByDefault": "<em>escolhido por predefinição</em>",
  "receipt.detail.visibilityValue":
    "Pública · com o teu nome · <em>muda para anónimo</em>",
  "receipt.detail.lisbonTime": "{date} · {time} em Lisboa",
  "receipt.note.label": "A tua nota para {artist}",
  "receipt.note.repliedSuffix": "<em>respondeu</em>",
  "receipt.note.replyWhen": "{relativeTime} · ainda no ar, duas faixas depois",
  "receipt.footer.keepNote": "Guarda este recibo para os teus registos",
  "receipt.footer.exportCta": "Exportar PDF",
  "receipt.actions.share": "Partilhar cartão pago",
  "receipt.actions.tipAgain": "Dar gorjeta outra vez",
  "receipt.actions.openArtistPage": "Abrir a página de {artist}",
  "receipt.toast.shareCopied": "Cartão pago copiado. Partilha onde quiseres.",
  "receipt.toast.tipAgain": "Gorjeta para {artist} outra vez, a mesma faixa.",
  "receipt.privacyNote":
    "Por predefinição, as gorjetas são <em>públicas, com o teu nome</em>. Podes tornar esta anónima, ou definir todas as gorjetas futuras como anónimas, nas definições. <em>Não partilhamos dados de gorjetas com ninguém.</em> <a>Compromissos de privacidade</a>",

  // ── Checkout da contribuição (StudioCheckoutPage) ──────────────────────────
  "checkout.doneToast": "Já estás a contribuir para o studio. Bem-vinde.",
  "checkout.doneTitle": "Já estás a <em>contribuir</em> para isto.",
  "checkout.doneBody":
    "Bem-vinde. Cada faixa que ouvires aqui paga a quem a fez. O teu primeiro pagamento de {amount} está feito. O resto é só ouvir.",
  "checkout.startListeningCta": "Começar a ouvir",
  "checkout.goToLibraryCta": "Ir para a tua biblioteca",
  "checkout.eyebrow": "Checkout",
  "checkout.title": "Contribui para o <em>studio.</em>",
  "checkout.dek":
    "Sete euros por mês mantêm viva uma plataforma de música com pagamento justo: o alojamento, as ajudas de custo da curadoria e o fundo de solidariedade. Quando compras música, pagas diretamente à pessoa artista.",
  "checkout.nameLabel": "Nome no cartão",
  "checkout.namePlaceholder": "O teu nome",
  "checkout.cardLabel": "Número do cartão",
  "checkout.cardPlaceholder": "1234 5678 9012 3456",
  "checkout.expiryLabel": "Validade",
  "checkout.expiryPlaceholder": "MM / AA",
  "checkout.cvcLabel": "CVC",
  "checkout.payCta": "Pagar {amount}{cadence}",
  "checkout.cadenceMonthly": "/mês",
  "checkout.prototypeNote":
    "Isto é um protótipo. Nenhum cartão é cobrado e nada é guardado.",
  "checkout.planName": "Contribuir",
  "checkout.membershipLabel": "Adesão <em>{name}</em>",
  "checkout.dueTodayLabel": "A pagar hoje",
  "checkout.lines.unlimitedListening": "Audição ilimitada",
  "checkout.lines.losslessAudio": "Áudio sem perdas · FLAC",
  "checkout.lines.liveRooms": "Salas de transmissão ao vivo",
  "checkout.lines.artistShare": "Vai para artistas",
  "checkout.lines.platformShare": "Plataforma & alojamento",
  "checkout.lines.included": "incluído",
  "checkout.reassure.cancel":
    "Cancela quando quiseres: um clique, sem email, sem chamada de retenção.",
  "checkout.reassure.share":
    "{percent}% de cada euro é pago diretamente às pessoas artistas que ouves.",
  "checkout.reassure.noAds":
    "Sem anúncios, nunca. Os teus dados de audição nunca são vendidos.",
  "checkout.processingCta": "A processar o pagamento…",
  "checkout.declined":
    "O banco da demonstração recusou o cartão terminado em {last4}. Confirma o número do cartão ou experimenta outro, não foi cobrado nada",
  "checkout.declineHint":
    "Para ver um pagamento recusado, escreve um número de cartão terminado em 0002.",

  // ── Fundo de solidariedade (StudioSolidarityFundPage + Balance + Flows + Log) ──
  "fund.hero.liveLabel": "Público · atualizado às segundas ao meio-dia",
  "fund.hero.title": "O fundo de <em>solidariedade</em>.",
  "fund.hero.dek":
    "Uma pequena reserva partilhada para quem as compras e as gorjetas não conseguem alcançar: <em>quem transcreve, quem traduz, quem está a começar, e artistas num mês difícil</em>. De onde vem e para onde vai, por inteiro.",

  "fund.balance.label": "Saldo do fundo · hoje",
  "fund.balance.paidThisQuarterLabel": "pago este trimestre",
  "fund.balance.peoplePaidLabel_one": "pessoa paga por ele este ano",
  "fund.balance.peoplePaidLabel_other": "pessoas pagas por ele este ano",

  "fund.flows.heading": "De onde <em>vem</em>, para onde <em>vai</em>",
  "fund.flows.inHeading": "Entradas · este trimestre",
  "fund.flows.outHeading": "Saídas · este trimestre",

  "fund.flows.in.surplus.label": "Excedente de <em>subscrições</em>",
  "fund.flows.in.surplus.desc":
    "Quando as quotas de apoiante cobrem mais do que o alojamento e as ajudas de custo da curadoria, a diferença acumula-se aqui.",
  "fund.flows.in.roundups.label": "Arredondamentos de <em>gorjetas</em>",
  "fund.flows.in.roundups.desc":
    "Os 5% opcionais que algumas pessoas acrescentam a uma gorjeta.",
  "fund.flows.in.gifts.label": "<em>Doações</em> diretas",
  "fund.flows.in.gifts.desc":
    "Doações pontuais de pessoas da comunidade e de uma fundação de Lisboa.",

  "fund.flows.out.transcribers.label": "Transcrição & <em>tradução</em>",
  "fund.flows.out.transcribers.desc":
    "Partituras, traduções de letras, pagas por peça aceite.",
  "fund.flows.out.grants.label": "Bolsas de <em>primeira edição</em>",
  "fund.flows.out.grants.desc":
    "1200 € sem restrições para pessoas estreantes na leva da primavera.",
  "fund.flows.out.emergency.label": "Apoio de <em>emergência</em> a artistas",
  "fund.flows.out.emergency.desc":
    "Apoio sem perguntas para quem está num mês difícil.",
  "fund.flows.out.access.label": "Trabalho de <em>acessibilidade</em>",
  "fund.flows.out.access.desc":
    "Intérpretes de LGP, passagens de legendagem, a auditoria de leitores de ecrã.",

  "fund.log.heading": "<em>Desembolsos</em> recentes",
  "fund.log.dek":
    "Cada pagamento do fundo fica aqui registado com um nome (quando há consentimento) e um motivo. <em>Sem caixa negra.</em>",
  "fund.log.showingOf": "A mostrar {shown} de {total} este ano",
  "fund.log.showLess": "mostrar menos",
  "fund.log.fullLog": "registo completo",
  "fund.log.exportCsv": "exportar CSV",
  "fund.log.exportToast": "Registo de desembolsos exportado como CSV",
  "fund.log.tag.transcriber": "Transcrição",
  "fund.log.tag.emergency": "Emergência",
  "fund.log.tag.grant": "Bolsa",
  "fund.log.tag.access": "Acessibilidade",
  "fund.log.tag.translator": "Tradução",
  "fund.log.csv.date": "Data",
  "fund.log.csv.category": "Categoria",
  "fund.log.csv.recipient": "Quem recebeu",
  "fund.log.csv.note": "Nota",
  "fund.log.csv.amount": "Montante (EUR)",

  "fund.apply.heading": "Precisas? <em>Pede.</em>",
  "fund.apply.requestCta": "Pedir apoio de emergência",
  "fund.apply.requestToast":
    "O formulário de apoio de emergência abre num fluxo privado",
  "fund.apply.seeGrantsCta": "Ver bolsas & concursos abertos",

  // ── Concursos abertos & encomendas (StudioOpenCallsPage + Card + Skeleton) ──
  "calls.hero.eyebrow": "Da parte do conselho",
  "calls.hero.title": "Concursos <em>abertos</em> & encomendas.",
  "calls.hero.dek":
    "Propostas financiadas pelo conselho e pela cooperativa. Candidata-te diretamente: anexa <em>uma única faixa ou edição</em> do teu catálogo. Sem cartas de apresentação, sem portefólios; o trabalho fala por si.",

  "calls.filter.all": "Tudo aberto",
  "calls.filter.commissions": "Encomendas",
  "calls.filter.grants": "Bolsas",
  "calls.filter.residencies": "Residências",
  "calls.filter.closingSoon": "A fechar em breve",
  "calls.filter.openCount":
    "<em>{count}</em> abertas · já te candidataste a {applied}",

  "calls.card.saveCta": "Guardar",
  "calls.card.applyCta": "Candidatar",
  "calls.card.saveToast": "Proposta guardada no teu painel",
  "calls.card.attachLabel": "Anexa uma faixa do teu catálogo",
  "calls.card.submitCta": "Submeter candidatura",
  "calls.card.cancelCta": "Cancelar",
  "calls.card.singleTrackNote":
    "<em>Só uma faixa</em>: o conselho quer a tua melhor faixa, uma só.",
  "calls.card.submittedToast":
    "Candidatura submetida. O conselho analisa na triagem de segunda-feira",

  "calls.applied.statusPrefix": "Estado ·",
  "calls.applied.decisionBy": "decisão até {date}",
  "calls.applied.withdrawCta": "Retirar",
  "calls.applied.withdrawnToast": "Candidatura retirada",
  "calls.applied.flatLabel": "fixo",

  // ── Submissão de set (StudioSetSubmissionPage + Matcher + Sidebar) ────────
  "setSubmission.hero.eyebrow": "Nova submissão · set ou mix de DJ",
  "setSubmission.hero.title": "Submete um <em>set</em>.",
  "setSubmission.hero.dek":
    "Carrega o ficheiro completo, cola a tua tracklist com marcas de tempo, e o nosso comparador encontra as fontes originais para que <em>cada faixa do set fique creditada a quem a fez</em>. As faixas não correspondidas ficam em espera até a fonte ser confirmada.",

  "setSubmission.steps.file": "Ficheiro",
  "setSubmission.steps.tracklist": "Tracklist & comparador",
  "setSubmission.steps.notes": "Notas & publicação",

  "setSubmission.matcher.uploadedBadge": "Carregado",
  "setSubmission.matcher.tracklistLabel":
    "Cola a tua tracklist · marca de tempo · artista · título",
  "setSubmission.matcher.pasteHint":
    "Uma linha por faixa. Aceitamos a maioria dos formatos. <em>Volta a correr o comparador</em> sempre que editares.",
  "setSubmission.matcher.runCta": "Correr o comparador",
  "setSubmission.matcher.matchingCta": "A comparar…",
  "setSubmission.matcher.resultsLabel":
    "Resultados do comparador · <em>resolvidos face ao catálogo + base de dados PRO</em>",
  "setSubmission.matcher.creditLine":
    "{who} · <em>creditada a {firstName}</em>",
  "setSubmission.matcher.noSourceFound":
    "fonte não encontrada · crédito retido",
  "setSubmission.matcher.matchedBadge": "Correspondida",
  "setSubmission.matcher.identifyCta": "Identificar",
  "setSubmission.matcher.identifyToast":
    "Pesquisa aberta para identificar esta faixa",
  "setSubmission.matcher.matchedResultToast":
    "{matched} de {total} correspondidas · {held} retidas para confirmação",

  "setSubmission.sidebar.detailsHeading": "<em>Detalhes</em> do set",
  "setSubmission.sidebar.titleLabel": "Título do set",
  "setSubmission.sidebar.typeLabel": "Tipo",
  "setSubmission.sidebar.type.liveDjSet": "Set de DJ ao vivo",
  "setSubmission.sidebar.type.studioMix": "Mix de estúdio",
  "setSubmission.sidebar.type.recordedBroadcast": "Transmissão gravada",
  "setSubmission.sidebar.creditsPreviewHeading":
    "Pré-visualização dos <em>créditos</em>",
  "setSubmission.sidebar.tracksInSet": "Faixas no set",
  "setSubmission.sidebar.matchedCredited": "Correspondidas & creditadas",
  "setSubmission.sidebar.tracksCount_one": "{count} faixa",
  "setSubmission.sidebar.tracksCount_other": "{count} faixas",
  "setSubmission.sidebar.onHold": "Em espera (não correspondidas)",
  "setSubmission.sidebar.holdNote":
    "As faixas não correspondidas <em>ficam em espera</em> até o comparador do conselho as confirmar. O set fica disponível já, e cada faixa retida fica creditada assim que a fonte for confirmada.",
  "setSubmission.sidebar.submitCta": "Submeter set",
  "setSubmission.sidebar.submittedToast":
    "Set submetido. Disponível já, faixas retidas à espera de uma fonte",

  // ── Fora do ar (StudioOffAirPage + Hero) ───────────────────────────────────
  "offAir.page.browseNote":
    "As portas estão fechadas, mas as prateleiras estão abertas. <em>Explora o que quiseres aqui em baixo</em>. Continua tudo a tocar.",
  "offAir.hero.statusLine": "Fora do ar · {time} em Lisboa",
  "offAir.hero.roomDark": "em silêncio esta noite",
  "offAir.hero.title": "O Studio está <em>fora do ar</em> esta noite.",
  "offAir.hero.untilDoors": "até abrir",
  "offAir.hero.nextBroadcastLabel": "Próxima transmissão · {time} Lisboa",
  "offAir.hero.nightcapEyebrow": "O acalanto de ontem à noite",
  "offAir.hero.replayAria": "Repetir o acalanto",
  "offAir.hero.replayingToast": "A repetir {title}",
  "offAir.hero.replaySuffix": "repete quando quiseres",

  // ── sweep no-literal-string: legendas reutilizáveis do ImageSlot ─────────
  "media.coverLabel": "capa",
  "media.scoreLabel": "partitura",
  "media.setArtLabel": "arte do set",
  "media.portraitLabel": "retrato",
  "media.trackLabel": "faixa",

  // ── sweep no-literal-string: linhas "de <artista> · <factos>" ────────────
  "albumHero.byLine": "de <strong>{artist}</strong> · {year} · {location}",
  "artist.sidebar.newFollowers": "Pessoas novas a seguir",
  "liveNow.onAirTag": "no ar",
  "liveNow.byFromLine":
    "de <strong>{artist}</strong> · do álbum <em>{album}</em>",
  "liveNow.setBuilding.activityLine":
    "{curator} escreveu a próxima faixa <em>{elapsed}</em>",
  "live.ribbon.showLine": '"{title}" · programado e apresentado por {host}',
  "track.hero.byFromLine":
    "de <strong>{artist}</strong> · do álbum <em>{album}</em> · {year}",
  "track.page.crumbLabel": "faixa {number}",

  // ── sweep no-literal-string: eyebrows/etiquetas diversas ──────────────────
  "album.sidebar.savesThisMonth": "Guardados este mês",
  "set.page.programmedByEyebrow": "Set · com curadoria de {curator}",
  "sheet.checkout.leadSheetLabel": "Partitura principal: {title}",
  // ── Studio v1 (2026-10-08) ─────────────────────────────────────────────────
  "gate.loadingLabel": "A carregar o Studio",
  "kind.musician": "Música",
  "kind.dj": "DJ",
  "releaseType.album": "Álbum",
  "releaseType.ep": "EP",
  "releaseType.single": "Single",
  "releaseType.mix": "Mix",
  "releaseStatus.draft": "Rascunho",
  "releaseStatus.published": "Publicado",
  "releaseStatus.taken_down": "Retirado",
  // CreatorDraftNotice nos editores de lançamentos e de episódios em rascunho
  "creatorDraftNote.body":
    "A nossa equipa pode ver este lançamento enquanto está em rascunho ou está agendado e dar-te uma mão se precisares",
  "creatorDraftNote.episodeBody":
    "A nossa equipa pode ver este episódio enquanto está em rascunho e dar-te uma mão se precisares",
  "genre.pop": "Pop",
  "genre.hipHop": "Hip-hop",
  "genre.rAndB": "R&B",
  "genre.rock": "Rock",
  "genre.jazz": "Jazz",
  "genre.classical": "Clássica",
  "genre.ambient": "Ambient",
  "genre.other": "Outro",
  "facts.trackCount_one": "{count} faixa",
  "facts.trackCount_other": "{count} faixas",
  "facts.minutes_one": "{count} min",
  "facts.minutes_other": "{count} min",
  "card.playRelease": "Ouvir {title}",
  "card.pauseRelease": "Pausar {title}",
  "states.notFoundTitle": "Não encontramos isso no Studio",
  "states.notFoundBody":
    "Pode ter sido removido, ou o link pode estar desatualizado",
  "states.backHomeCta": "Voltar ao início do Studio",

  // ── Liked songs (StudioLikeButton, StudioLikedPage) ─────────────────────
  "like.cta": "Gosto",
  "like.trackAria": "Gosto de {title}",
  "like.addedToast": "Adicionada a Músicas de que gostas",
  "like.removedToast": "Removida de Músicas de que gostas",
  // O coração de um álbum, podcast ou playlist (StudioCollectionLikeButton)
  "like.collectionAria": "Gosto de {title}",
  "like.collectionUnlike": "Remover da tua biblioteca",
  "like.collectionAddedToast": "Adicionado à tua biblioteca",
  "like.collectionRemovedToast": "Removido da tua biblioteca",
  "like.blockedWithdrawn":
    "Este lançamento foi retirado, por isso as suas faixas não podem ser marcadas com gosto",
  "liked.title": "Músicas de que gostas",
  "liked.page.privateNote": "Só tu vês aqui as músicas de que gostas",
  "liked.page.emptyTitle": "As músicas de que gostas vão aparecer aqui",
  "liked.page.emptyBody":
    "Toca no coração de qualquer faixa para a guardares em Músicas de que gostas",
  "liked.page.showMore": "Mostrar mais músicas",
  "liked.page.loadingMore": "A carregar mais músicas",
  "liked.page.loadMoreError":
    "Não conseguimos carregar mais músicas de que gostas",
  "liked.page.undoCta": "Anular",
  "liked.page.unlikedManyToast_one":
    "Removeste {count} música de Músicas de que gostas",
  "liked.page.unlikedManyToast_other":
    "Removeste {count} músicas de Músicas de que gostas",
  "liked.page.loadingAll_one": "A carregar {count} música",
  "liked.page.loadingAll_other": "A carregar todas as {count} músicas",
  "liked.page.loadAllError":
    "Não conseguimos carregar todas as músicas de que gostas, por isso nada começou a tocar. {reason}",
  "liked.page.loadingLabel": "A carregar Músicas de que gostas",
  "liked.page.nothingToPlayToast":
    "Nenhuma das músicas de que gostas pode tocar agora",
  "liked.page.cancelLoadingAria":
    "Cancelar o carregamento das músicas de que gostas",
  "liked.page.genreFilterLabel": "Filtrar por género",
  "liked.page.noMatchInGenre": 'Nada em {genre} corresponde a "{query}"',
  "liked.page.showAllGenres": "Mostrar todos os géneros",
  "errors.generic":
    "Isso não correu bem. Verifica a tua ligação e tenta de novo daqui a pouco",
  "errors.accessRequired": "O teu acesso ao Studio terminou",
  "errors.notPersonaOwner":
    "Só quem gere a persona pode alterar os lançamentos dela",
  "errors.personaKindNotAllowed":
    "Só personas de música, podcast, spoken word ou performance podem lançar no Studio",
  "errors.releaseNotDraft": "Este lançamento já não é um rascunho",
  "errors.releaseTypeMismatch":
    "Esse tipo de lançamento não serve para esta persona",
  "errors.trackOrderMismatch":
    "A lista de faixas mudou. Recarrega a página e tenta de novo",
  "errors.trackLimit": "Um lançamento leva até 50 faixas",
  "errors.audioUnreadable":
    "Não conseguimos ler este ficheiro. Experimenta outro MP3, M4A, WAV ou AIFF",
  "errors.audioWrongOwner": "Esse ficheiro pertence a outra persona",
  "shell.searchLabel": "Pesquisar no Studio",
  "shell.searchPlaceholderLive": "pesquisar artistas, lançamentos, faixas…",
  "shell.searchPlaceholderShort": "pesquisar no Studio…",
  "shell.accountLabel": "A tua conta, {name}",
  "shell.menu.artistPages": "As tuas páginas de artista",
  "shell.menu.settings": "Definições",
  "shell.menu.backToQueerPulse": "Voltar ao QueerPulse",
  "shell.menu.group.creator": "Criação",
  "shell.menu.group.staff": "Equipa",
  "shell.menu.myClaims": "As minhas reivindicações",
  "shell.menu.myClaimsBadge_one":
    "{count} reivindicação à espera da tua resposta",
  "shell.menu.myClaimsBadge_other":
    "{count} reivindicações à espera da tua resposta",
  "shell.menu.counterWindows": "Reivindicações sobre as tuas faixas",
  "shell.menu.counterWindowsBadge_one":
    "{count} reivindicação a que ainda podes responder",
  "shell.menu.counterWindowsBadge_other":
    "{count} reivindicações a que ainda podes responder",
  "shell.menu.disputesBadge_one":
    "{count} contestação de retirada à espera da nossa equipa",
  "shell.menu.disputesBadge_other":
    "{count} contestações de retirada à espera da nossa equipa",
  "shell.menu.showAll_one": "Mostrar todas ({count})",
  "shell.menu.showAll_other": "Mostrar todas ({count})",
  "shell.menu.showFewer": "Mostrar menos",
  "shell.menu.attentionLabel": "{label}, há algo que precisa da tua atenção",
  "shell.tabs.label": "Secções do Studio",
  "shell.sheet.label": "Menu do Studio",
  "shell.sheet.close": "Fechar menu",
  "shell.sustainShort": "Contribuir",
  "shell.uploadCta": "Carregar um lançamento",
  "creator.avatarLabel": "A carregar como {name}",
  "creator.navLabel": "Páginas de criação",
  "rail.collapseLabel": "Recolher barra lateral",
  "rail.expandLabel": "Expandir barra lateral",
  "accessError.pageTitle": "Acesso ao Studio",
  "accessError.title": "Não conseguimos verificar o teu acesso ao Studio",
  "rail.v1.navLabel": "Studio",
  "rail.v1.search": "Pesquisar",
  "rail.v1.upload": "Carregar um lançamento",
  "home.hero.eyebrow": "Lançamento mais recente",
  "home.hero.byLine": "de <strong>{artist}</strong> · {facts}",
  "home.empty.title": "Ainda não há lançamentos",
  "home.empty.body": "Quando artistas e DJs publicarem música, aparece aqui",
  "home.empty.uploadCta": "Carrega o teu primeiro lançamento",
  "home.newReleases.title": "Novos <em>lançamentos</em>",
  "home.newReleases.showMore": "Mostrar mais lançamentos",
  "home.newReleases.loadingMore": "A carregar mais lançamentos",
  "home.newReleases.loadMoreError": "Não conseguimos carregar mais lançamentos",
  "home.artists.title": "<em>Artistas</em>",
  "artistPage.tabsLabel": "Secções de {name}",
  "artistPage.releaseCount_one": "{count} lançamento",
  "artistPage.releaseCount_other": "{count} lançamentos",
  "artistPage.playAll": "Ouvir todos os lançamentos de {name}",
  "artistPage.viewProfile": "Ver perfil",
  "artistPage.noBio": "Ainda sem biografia",
  "artistPage.noReleases": "Ainda não há lançamentos",
  "artistPage.section.playlists": "Playlists <em>públicas</em>",
  "owner.heading": "Os teus lançamentos",
  "owner.edit": "Editar",
  "owner.editAria": "Editar {title}",
  "owner.publish": "Publicar",
  "owner.publishAria": "Publicar {title}",
  "owner.unpublish": "Despublicar",
  "owner.unpublishAria": "Despublicar {title}",
  "owner.delete": "Apagar",
  "owner.deleteAria": "Apagar {title}",
  "owner.deleteTitle": "Apagar {title}?",
  "owner.deleteBody": "O rascunho e o áudio carregado são apagados de vez",
  "owner.deleteConfirm": "Apagar rascunho",
  "owner.unpublishTitle": "Despublicar {title}?",
  "owner.unpublishBody":
    "Volta a rascunho e sai do Studio até o publicares de novo",
  "owner.unpublishConfirm": "Despublicar lançamento",
  "owner.takedownReason": "Retirado pela nossa equipa: {reason}",
  "release.by": "de",
  "release.tabsLabel": "Secções de {title}",
  "release.tracklistLabel": "Alinhamento de {title}",
  "release.playTrack": "Ouvir {title}",
  "release.pauseTrack": "Pausar {title}",
  "release.nowPlaying": "A tocar agora",
  "release.processing": "A processar",
  "release.explicit": "Explícito",
  "release.explicitShort": "E",
  "release.moreActions": "Mais ações",
  "release.report": "Denunciar lançamento",
  "release.queueFailedToast":
    "Este lançamento não pode entrar na tua fila agora",
  "release.queueEmptyReason":
    "Ainda nenhuma faixa deste lançamento está pronta a tocar",
  "release.queuePartialToast": "Juntaste {count} de {total} faixas à tua fila",
  "release.queuePartialReasonToast":
    "Juntaste {count} de {total} faixas. {reason}",
  "trackPage.byLine":
    "de <strong>{artist}</strong> · do lançamento <em>{release}</em>",
  "trackPage.crumbLabel": "Caminho",
  "trackPage.lyricsHeading": "Letra",
  "trackPage.noLyrics": "Esta faixa não tem letra",
  "trackPage.noCredits": "Ainda sem créditos",
  "trackPage.fullReleaseCta": "Abrir o lançamento completo",
  "searchPage.filter.releases": "Lançamentos",
  "searchPage.filter.tracks": "Faixas",
  "searchPage.filtersLabel": "Filtrar resultados",
  "searchPage.inputLabel": "Pesquisar lançamentos, faixas e artistas",
  "searchPage.resultCount_one": "{count} resultado",
  "searchPage.resultCount_other": "{count} resultados",
  "searchPage.section.releases": "<em>Lançamentos</em>",
  "searchPage.section.tracks": "<em>Faixas</em>",
  "searchPage.section.artists": "<em>Artistas</em>",
  "searchPage.clearCta": "Limpar pesquisa",
  "playerBar.regionLabel": "Leitor do Studio",
  "playerBar.play": "Reproduzir",
  "playerBar.pause": "Pausar",
  "playButton.play": "Ouvir",
  "playButton.pause": "Pausar",
  "playButton.cancel": "Cancelar",
  "playerBar.previous": "Faixa anterior",
  "playerBar.next": "Faixa seguinte",
  "playerBar.seekLabel": "Posição na faixa",
  "playerBar.seekValue": "{elapsed} de {total}",
  "playerBar.seekValueChapter": "{elapsed} de {total}, {chapter}",
  "playerBar.seekValueUnknown": "Duração ainda desconhecida",
  "playerBar.remainingTime": "−{time}",
  "playerBar.timeToggleLabel": "{time}, mostrar o tempo que falta",
  "playerBar.retry": "Tentar a faixa de novo",
  "playerBar.close": "Fechar leitor",
  "playerBar.autoplayBlocked": "Carrega em reproduzir para começar",
  "playerBar.offlinePaused":
    "Estás offline, por isso a reprodução parou. Volta a tocar se voltares a estar online dentro de 3 minutos",
  "uploadFlow.hero.title": "Põe a tua música <em>cá fora.</em>",
  "uploadFlow.hero.sub":
    "Três passos: o lançamento, as faixas e a publicação. MP3, M4A, WAV ou AIFF, até 50 MB por faixa",
  "uploadFlow.steps.label": "Passos do carregamento",
  "uploadFlow.steps.release.nm": "Lançamento",
  "uploadFlow.steps.release.sub": "título · capa · detalhes",
  "uploadFlow.steps.tracks.nm": "Faixas",
  "uploadFlow.steps.tracks.sub": "áudio · créditos · letras",
  "uploadFlow.steps.publish.nm": "Publicar",
  "uploadFlow.steps.publish.sub": "verificações · direitos",
  "uploadFlow.release.heading": "O <em>lançamento</em>",
  "uploadFlow.release.sub":
    "Fica guardado como rascunho enquanto escreves. Nada fica público até publicares",
  "uploadFlow.release.personaLabel": "Lançar como",
  "uploadFlow.release.typeLabel": "Tipo",
  "uploadFlow.release.genresNonePicked": "Nenhum género escolhido",
  "uploadFlow.release.genresCounter": "{count} de {max}",
  "uploadFlow.release.genresMain": "Principal",
  "uploadFlow.release.genresFullReason": "Podes escolher até {max} géneros",
  "uploadFlow.release.genresRemove": "Remover {genre}",
  "uploadFlow.release.dateLabel": "Data de lançamento",
  "uploadFlow.release.dateHint": "Deixa vazio para usar o dia em que publicas",
  "uploadFlow.release.descriptionLabel": "Notas do lançamento",
  "uploadFlow.release.descriptionCount": "{count} de {max}",
  "uploadFlow.release.titleRequired": "Dá um título ao lançamento",
  "uploadFlow.release.titleTooLong": "O título pode ter até 120 caracteres",
  "uploadFlow.release.descriptionTooLong":
    "As notas podem ter até 2000 caracteres",
  "uploadFlow.release.continueCta": "Guardar e passar às faixas",
  "uploadFlow.release.saveChangesCta": "Guardar alterações",
  "uploadFlow.release.changesSaved": "Alterações guardadas",
  "uploadFlow.release.gaplessLabel": "Tocar sem pausas",
  "uploadFlow.release.gaplessHint":
    "Cada faixa segue direto para a seguinte, mesmo para quem tem a transição ligada. Ideal para álbuns ao vivo e mixes",
  "uploadFlow.saving": "A guardar",
  "uploadFlow.saved": "Rascunho guardado",
  "uploadFlow.cover.heading": "<em>Capa</em>",
  "uploadFlow.cover.placeholder": "Ainda sem capa",
  "uploadFlow.cover.hint":
    "Uma imagem quadrada fica melhor. Podes recortá-la depois de a escolheres",
  "uploadFlow.backToRelease": "Voltar ao lançamento",
  "uploadFlow.continueToPublish": "Continuar para publicar",
  "uploadFlow.backToTracks": "Voltar às faixas",
  "uploadFlow.files.dropTitle":
    "Larga aqui ficheiros <em>MP3, M4A, WAV ou AIFF</em>",
  "uploadFlow.files.accepts":
    "aceita · <em>MP3 · M4A · WAV · AIFF</em> · até 50 MB por faixa · até 50 faixas",
  "uploadFlow.files.chooseCta": "Escolher ficheiros de áudio",
  "uploadFlow.files.empty":
    "Ainda não há faixas. Adiciona ficheiros de áudio para começar",
  "uploadFlow.files.listLabel": "Faixas deste lançamento",
  "uploadFlow.files.rejectType":
    "O Studio não consegue ler {fileName}. Usa MP3, M4A, WAV ou AIFF",
  "uploadFlow.files.rejectSize": "{fileName} tem mais de 50 MB",
  "uploadFlow.files.rejectLimit":
    "{fileName} não entrou: um lançamento leva até 50 faixas",
  "uploadFlow.files.errorUpload":
    "O carregamento parou. Tenta de novo quando quiseres",
  "uploadFlow.files.errorTooLarge": "Este ficheiro tem mais de 50 MB",
  "uploadFlow.files.errorRemove": "Não conseguimos remover esta faixa",
  "uploadFlow.files.stage.queued": "Em espera",
  "uploadFlow.files.stage.creating": "A preparar",
  "uploadFlow.files.stage.uploading": "A carregar",
  "uploadFlow.files.stage.confirming": "A verificar o ficheiro",
  "uploadFlow.files.stage.ready": "Pronta",
  "uploadFlow.files.stage.failed": "Não carregou",
  "uploadFlow.files.stage.noAudio": "Ainda sem áudio",
  "uploadFlow.files.progressLabel":
    "Progresso do carregamento da faixa {position}, {title}",
  "uploadFlow.files.stage.checking": "A verificar o ficheiro",
  "uploadFlow.files.stage.converting": "A converter para MP3",
  "uploadFlow.files.convertingHint":
    "Mantém este separador aberto enquanto converte",
  "uploadFlow.files.convertProgressLabel":
    "A converter a faixa {position}, {title}, para MP3",
  "uploadFlow.files.errorTooLong":
    "Este ficheiro é demasiado longo para converter. Pode ter até {maxMinutes} minutos",
  "uploadFlow.files.errorUnsupported":
    "Não conseguimos ler este ficheiro. Exporta-o em WAV, AIFF, MP3 ou M4A",
  "uploadFlow.files.errorConvert":
    "Não conseguimos converter este ficheiro. Tenta de novo ou exporta-o em MP3",
  "uploadFlow.files.wavNote":
    "Os ficheiros WAV e AIFF passam a MP3 no teu navegador antes de serem enviados",
  "uploadFlow.files.moveUp": "Subir a faixa {position}, {title}",
  "uploadFlow.files.moveDown": "Descer a faixa {position}, {title}",
  "uploadFlow.files.retry": "Tentar de novo a faixa {position}, {title}",
  "uploadFlow.files.remove": "Remover a faixa {position}, {title}",
  "uploadFlow.files.editDetails": "Editar detalhes",
  "uploadFlow.files.editDetailsFor": "Editar os detalhes de {title}",
  "uploadFlow.files.loadingDetails": "A carregar os detalhes da faixa",
  "uploadFlow.files.titleLabel": "Título da faixa",
  "uploadFlow.files.creditsLabel": "Créditos",
  "uploadFlow.files.creditName": "Nome do crédito {number}",
  "uploadFlow.files.creditRole": "Função do crédito {number}",
  "uploadFlow.files.removeCredit": "Remover o crédito {number}",
  "uploadFlow.files.addCredit": "Adicionar crédito",
  "uploadFlow.files.lyricsLabel": "Letra",
  "uploadFlow.files.explicitLabel": "Esta faixa tem letra explícita",
  "uploadFlow.files.cancelDetails": "Cancelar",
  "uploadFlow.files.saveDetails": "Guardar detalhes da faixa",
  "uploadFlow.publish.heading": "Tudo pronto para <em>publicar?</em>",
  "uploadFlow.publish.sub":
    "O teu lançamento fica disponível no Studio para todas as pessoas com acesso ao Studio",
  "uploadFlow.publish.missingLead": "Antes de publicares:",
  "uploadFlow.publish.gap.title": "Dá um título ao lançamento",
  "uploadFlow.publish.gap.cover": "Adiciona uma capa",
  "uploadFlow.publish.gap.tracks": "Adiciona pelo menos uma faixa com áudio",
  "uploadFlow.publish.gap.pending":
    "Espera que todas as faixas acabem de carregar",
  "uploadFlow.publish.gap.rights": "Confirma que tens os direitos",
  "uploadFlow.publish.ready": "Está tudo pronto",
  "uploadFlow.publish.rightsLabel":
    "Detenho ou controlo os direitos desta gravação e da capa, e aceito que as pessoas do QueerPulse a ouçam em streaming.",
  "uploadFlow.publish.publishCta": "Publicar lançamento",
  "uploadFlow.publish.publishing": "A publicar",
  "uploadFlow.published.title": "<em>{title}</em> já está no ar",
  "uploadFlow.published.body":
    "Quem tem acesso ao Studio já o pode ouvir. Podes passá-lo a rascunho quando quiseres, na tua página de artista",
  "uploadFlow.published.openCta": "Abrir o lançamento",
  "uploadFlow.published.anotherCta": "Carregar outro lançamento",
  "uploadFlow.pageTitle": "Novo lançamento",
  "uploadFlow.leave.uploadsBody":
    "Os teus carregamentos ainda estão a decorrer. Se saíres agora, param, e vais ter de adicionar esses ficheiros outra vez",
  "uploadFlow.leave.detailsBody":
    "Tens detalhes que ainda não foram guardados. Se saíres agora, perdem-se",
  "uploadFlow.leave.heldFilesBody":
    "Alguns ficheiros pararam antes de acabarem de carregar. Se saíres agora, vais ter de os adicionar outra vez",
  "uploadFlow.autosave.saving": "A guardar…",
  "uploadFlow.autosave.savedAt": "Guardado às {time}",
  "uploadFlow.autosave.notSaved": "Não guardado: {reason}",
  "uploadFlow.autosave.waitingForTitle": "À espera de um título",
  "uploadFlow.release.noChangesReason":
    "Muda primeiro um detalhe e depois guarda-o aqui",
  "uploadFlow.release.personaLockedReason":
    "Um lançamento fica com a persona com que foi começado",
  "uploadFlow.errorSummary.lead_one": "Corrige isto antes de continuares:",
  "uploadFlow.errorSummary.lead_other":
    "Corrige estas {count} coisas antes de continuares:",
  "uploadFlow.steps.doneLabel": "(feito)",
  "uploadFlow.steps.blocked.needsDraft":
    "Guarda primeiro os detalhes do lançamento",
  "uploadFlow.steps.blocked.alreadyLive": "Este lançamento já está publicado",
  "uploadFlow.cover.tooSmall":
    "Esta capa tem {width} por {height} px. Usa pelo menos {min} por {min} px para se manter nítida em ecrãs grandes",
  "uploadFlow.cover.addCta": "Adicionar capa",
  "uploadFlow.cover.changeCta": "Mudar a capa",
  "uploadFlow.locked.takenDownBodyNoReason":
    "Retirado pela nossa equipa. O aviso de retirada nas tuas notificações explica porquê. Não pode ser editado enquanto estiver retirado",
  "uploadFlow.publish.done.title": "O lançamento tem título",
  "uploadFlow.publish.done.cover": "A capa está no sítio",
  "uploadFlow.publish.done.rights": "Confirmaste que tens os direitos",
  "uploadFlow.publish.done.tracks": "Pelo menos uma faixa tem áudio",
  "uploadFlow.publish.done.sources": "Todas as faixas creditam as fontes",
  "uploadFlow.publish.done.pending": "Todas as faixas acabaram de carregar",
  "uploadFlow.files.cancelled":
    "Carregamento cancelado. Tentar de novo volta a enviar o mesmo ficheiro",
  "uploadFlow.files.errorPresignExpired":
    "A ligação de carregamento expirou antes de o ficheiro acabar. Tenta de novo para receberes uma ligação nova",
  "uploadFlow.files.cancelUpload":
    "Cancelar o carregamento da faixa {position}, {title}",
  "uploadFlow.files.attachAudio": "Anexar áudio",
  "uploadFlow.files.attachAudioFor": "Anexar áudio à faixa {position}, {title}",
  "uploadFlow.files.reorderWaits":
    "As faixas podem mudar de lugar quando todas acabarem de ser preparadas",
  "uploadFlow.files.moveAtEnd": "Esta faixa não pode ir mais para esse lado",
  "uploadFlow.files.retryAll_one": "Tentar de novo ({count} faixa)",
  "uploadFlow.files.retryAll_other": "Tentar de novo ({count} faixas)",
  "uploadFlow.files.offline":
    "Estás sem ligação. Os carregamentos param até voltares, e depois Tentar de novo retoma-os",
  "uploadFlow.files.discardTitle": "Descartar as tuas alterações a {title}?",
  "uploadFlow.files.discardBody":
    "As alterações aos detalhes desta faixa não estão guardadas. Os créditos de personas que adicionaste já estão guardados e ficam",
  "uploadFlow.files.discardConfirm": "Descartar alterações",
  "uploadFlow.files.discardKeep": "Continuar a editar",
  "uploadFlow.files.titleRequired": "O título é obrigatório",
  "uploadFlow.files.creditNameLabel": "Nome",
  "uploadFlow.files.creditRoleLabel": "Função",
  "uploadFlow.files.creditNeedsName":
    "Adiciona um nome a este crédito, ou apaga a função",
  "uploadFlow.files.creditNeedsRole":
    "Adiciona uma função a este crédito, ou apaga o nome",
  "uploadFlow.files.personaCreditsSaveOwn":
    "Os créditos de personas ficam guardados assim que os adicionas",
  "uploadFlow.files.pasteCut":
    "Só cabem os primeiros {max} caracteres, por isso o fim do que colaste ficou de fora",
  "uploadFlow.noPersona.title": "Cria uma persona compatível com o Studio",
  "uploadFlow.noPersona.body":
    "Para carregar, precisas de uma persona publicada e aberta a todas as pessoas, de um destes tipos: música, DJ, podcast, produção de podcast, poesia, spoken word, arte drag, performance, dança, ballroom e vogue ou burlesco. Cria uma aqui, publica-a no editor e volta para carregar",
  "uploadFlow.noPersona.cta": "Criar uma persona",
  // Subtítulo do primeiro passo do assistente quando o Studio o abre (StudioNoPersonaState).
  "uploadFlow.noPersona.modalSub":
    "Os carregamentos no Studio precisam de um destes ofícios. Depois de a criares, publica-a aberta a todas as pessoas e já podes carregar",
  // Uma persona artística da pessoa que o Studio ainda não lista.
  "uploadFlow.noPersona.unfinishedBody":
    "{name} funciona com o Studio. Publica-a e deixa-a aberta a todas as pessoas, depois já podes carregar aqui",
  "uploadFlow.noPersona.unfinishedCta": "Abrir {name} no editor",
  // Todos os lugares de persona ocupados e nenhuma é de um tipo artístico.
  "uploadFlow.noPersona.atCapBody":
    "Tens {max} personas, o máximo por conta, e nenhuma funciona com o Studio. Apaga uma que já não uses e depois cria uma para o Studio",
  "uploadFlow.noPersona.dashboardCta": "Ir para as tuas personas",
  "uploadFlow.side.eyebrow": "O que acontece aos teus ficheiros",
  "uploadFlow.side.title": "Os teus ficheiros, <em>prontos a ouvir</em>",
  "uploadFlow.side.body":
    "Guardamos os ficheiros MP3 e M4A tal como os carregas, e os WAV e AIFF como o MP3 que o teu navegador cria. Só quem tem acesso ao Studio os pode ouvir, e ninguém os pode descarregar",
  "uploadFlow.side.formats.label": "Formatos",
  "uploadFlow.side.formats.value": "MP3 · M4A · WAV · AIFF",
  "uploadFlow.side.size.label": "Por faixa",
  "uploadFlow.side.size.value": "até 50 MB",
  "uploadFlow.side.listeners.label": "Quem pode ouvir",
  "uploadFlow.side.listeners.value": "quem tem acesso ao Studio",
  "uploadFlow.locked.takenDownTitle": "Este lançamento foi retirado",
  "uploadFlow.locked.takenDownBody":
    "Retirado pela nossa equipa: {reason}. Não pode ser editado enquanto estiver retirado",
  "uploadFlow.locked.backCta": "Voltar aos teus lançamentos",
  // ── Studio v2 (2026-10-13) ──────────────────────────────────────────────────
  "errors.playlistLimit":
    "Podes ter até 100 playlists. Apaga uma para criares outra",
  "errors.playlistTrackLimit": "Uma playlist leva até 500 faixas",
  "errors.playlistOrderMismatch":
    "Esta playlist acabou de mudar. Tenta outra vez",
  "errors.playlistCreditNotAllowed":
    "Essa persona não pode ser creditada agora. Mostra-a como tu, ou escolhe outra persona",
  "errors.playlistTrackUnavailable": "Essa faixa não pode ser adicionada agora",
  "playlist.visibility.public": "Pública",
  "playlist.visibility.connections": "Só ligações",
  "playlist.visibility.private": "Privada",
  "playlist.visibility.publicHint":
    "Qualquer pessoa com acesso ao Studio a pode encontrar",
  "playlist.visibility.connectionsHint":
    "Só as tuas ligações com acesso ao Studio a podem abrir",
  "playlist.visibility.privateHint": "Só tu",
  "playlist.dialog.createTitle": "Nova playlist",
  "playlist.dialog.editTitle": "Editar detalhes",
  "playlist.dialog.visibilityTitle": "Mudar a visibilidade",
  "playlist.dialog.nameLabel": "Nome",
  "playlist.dialog.namePlaceholder": "Canções para o caminho de casa",
  "playlist.dialog.nameRequired": "Dá um nome à tua playlist",
  "playlist.dialog.descriptionLabel": "Descrição",
  "playlist.dialog.descriptionHelper": "Opcional. Até 500 caracteres",
  "playlist.dialog.visibilityLegend": "Quem a pode abrir",
  "playlist.dialog.creditLegend": "Mostrar como",
  "playlist.dialog.creditYou": "Tu",
  "playlist.dialog.creditYouHint": "Mostra o teu nome e a tua foto",
  "playlist.dialog.creditPersonaHint":
    "Aparece na página Studio de {name} enquanto for pública",
  "playlist.dialog.linkOnlyNote":
    "As tuas ligações podem abri-la pelo link. Fica fora da página de {name}, para ninguém ficar a saber quem gere {name}",
  "playlist.dialog.createCta": "Criar playlist",
  "playlist.dialog.saveDetailsCta": "Guardar detalhes",
  "playlist.dialog.saveVisibilityCta": "Guardar visibilidade",
  "playlist.dialog.cancelCta": "Cancelar",
  "playlist.dialog.createdToast": "Playlist criada",
  "playlist.dialog.savedToast": "Alterações guardadas",
  "playlist.delete.title": "Apagar {name}?",
  "playlist.delete.body":
    "A playlist e a ordem das faixas desaparecem de vez. A música continua no Studio",
  "playlist.delete.confirmCta": "Apagar playlist",
  "playlist.delete.deletedToast": "Playlist apagada",
  "playlist.add.trackCta": "Adicionar a uma playlist",
  "playlist.add.trackAria": "Adicionar {title} a uma playlist",
  "playlist.add.releaseCta": "Adicionar à playlist",
  "playlist.add.pickerTitle": "Adicionar a uma playlist",
  "playlist.add.newPlaylistCta": "Criar playlist",
  "playlist.add.listLabel": "As tuas playlists",
  "playlist.add.addToAria": "Adicionar a {name}",
  "playlist.shareCta": "Partilhar playlist",
  "playlist.add.addedToast": "Adicionaste a {name}",
  "playlist.add.alreadyThereToast": "Já está em {name}",
  "playlist.add.empty": "Ainda não tens playlists. Cria uma para começar",
  "playlist.add.loadError": "Não conseguimos carregar as tuas playlists",
  "playlist.add.showMore": "Mostrar mais playlists",
  "playlist.add.loadingMore": "A carregar mais playlists",
  "playlist.add.loadMoreError": "Não conseguimos carregar mais playlists",
  "playlist.add.nothingToAdd": "Todas as faixas já estão em {name}",
  "playlist.page.eyebrow": "Playlist",
  "playlist.page.byline": "De <strong>{name}</strong>",
  "playlist.page.playAria": "Ouvir {name}",
  "playlist.page.pauseAria": "Pausar {name}",
  "playlist.page.shuffleCta": "Ouvir a playlist por ordem aleatória",
  "playlist.page.actionsLabel": "Ações da playlist",
  "playlist.page.editDetails": "Editar detalhes",
  "playlist.page.changeVisibility": "Mudar a visibilidade",
  "playlist.page.deletePlaylist": "Apagar playlist",
  "playlist.page.tracklistLabel": "Faixas em {name}",
  "playlist.page.emptyOwnerTitle": "Ainda não há nada nesta playlist",
  "playlist.page.emptyOwnerBody":
    "Adiciona faixas a partir de um lançamento, de uma faixa ou do leitor",
  "playlist.page.emptyViewerTitle": "Não há aqui nada que possas ouvir agora",
  "playlist.page.findMusicCta": "Procurar música",
  "playlist.row.unavailable": "Já não está disponível",
  "playlist.row.remove": "Tirar {title} da playlist",
  "playlist.row.removeUnavailable": "Tirar a entrada {position} da playlist",
  "playlist.row.moveUp": "Subir {title}",
  "playlist.row.moveDown": "Descer {title}",
  "playlist.row.movedStatus": "{title} está agora na posição {position}",
  "playlist.row.removedToast": "Saiu da playlist",
  "playlist.row.orderError":
    "Não conseguimos guardar a nova ordem. Tenta outra vez",
  "playlist.row.removeError": "Não conseguimos tirar isso. Tenta outra vez",
  "playlist.card.coverLabel": "Capa da playlist",
  "playlist.card.nothingToPlay":
    "Esta playlist ainda não tem faixas que possas ouvir",
  "playlist.inThese.heading": "Nestas <em>playlists</em>",
  "searchPage.filter.playlists": "Playlists",
  "searchPage.section.playlists": "<em>Playlists</em>",
  "searchPage.genreLabel": "Género",
  "searchPage.genreAny": "Qualquer género",
  "home.genres.heading": "Explorar por <em>género</em>",
  "home.genres.listLabel": "Géneros",
  "browse.eyebrow": "Explorar",
  "browse.title": "Lançamentos de <em>{genre}</em>",
  "browse.titleNone": "Explorar por <em>género</em> ou <em>ambiente</em>",
  "browse.pickPrompt":
    "Escolhe um género ou um ambiente para veres os lançamentos",
  "browse.noGenres":
    "Os géneros aparecem aqui quando houver lançamentos publicados",
  "browse.gridLabel": "Lançamentos de {genre}",
  "browse.empty.title": "Ainda não há lançamentos de {genre}",
  "browse.empty.body": "A música nova aparece aqui à medida que é publicada",
  "libraryLive.dek":
    "As tuas playlists, as Músicas de que gostas, os lançamentos guardados e os artistas que segues",
  "libraryLive.tablistLabel": "A tua biblioteca",
  "libraryLive.tabs.playlists": "Playlists",
  "libraryLive.tabs.releases": "Lançamentos",
  "libraryLive.tabs.artists": "Artistas",
  "libraryLive.yourPlaylists": "As tuas <em>playlists</em>",
  "libraryLive.savedPlaylists": "<em>Playlists</em> guardadas",
  "libraryLive.newPlaylistCta": "Criar playlist",
  "libraryLive.empty.ownPlaylistsTitle": "Ainda não tens playlists tuas",
  "libraryLive.empty.playlistsBody":
    "Cria uma para um estado de espírito, uma noite ou uma pessoa, e junta faixas de qualquer parte do Studio",
  "libraryLive.empty.releasesTitle": "Ainda não guardaste lançamentos",
  "libraryLive.empty.releasesBody":
    "Toca no coração na página de um lançamento e fica aqui à tua espera",
  "libraryLive.empty.artistsTitle": "Ainda não segues artistas",
  "libraryLive.empty.artistsBody":
    "Segue artistas a partir da página Studio de cada persona para as teres por perto",
  "libraryLive.showMoreArtists": "Mostrar mais artistas",
  "libraryLive.loadingMoreArtists": "A carregar mais artistas",
  "libraryLive.loadMoreArtistsError": "Não conseguimos carregar mais artistas",
  "libraryLive.sort.recent": "Recentes",
  "libraryLive.sort.title": "Título",
  "libraryLive.sort.creator": "Autoria",
  "libraryLive.sort.name": "Nome",
  "libraryLive.sort.triggerAria": "Ordenar por {sort}",
  "libraryLive.sort.menuLabel": "Ordenar por",
  "libraryLive.filterLabel": "Filtrar a tua biblioteca",
  "libraryLive.filterPlaceholder": "Filtrar por título ou autoria",
  "libraryLive.noMatches.title": 'Nada aqui corresponde a "{query}"',
  "libraryLive.noMatches.body":
    "Experimenta outra palavra ou limpa o filtro para veres tudo o que guardaste",
  "libraryLive.clearFilterCta": "Limpar filtro",
  "libraryLive.savedReleases": "Lançamentos <em>guardados</em>",
  "libraryLive.showMoreSaves": "Mostrar mais guardados",
  "libraryLive.loadingMoreSaves": "A carregar mais guardados",
  "libraryLive.loadMoreSavesError":
    "Não conseguimos carregar mais do que guardaste",
  "libraryLive.removeSavedAria": "Remover {title} da tua biblioteca",
  "libraryLive.removedToast": "{title} saiu da tua biblioteca",
  "libraryLive.undoCta": "Anular",
  "libraryLive.playlistNothingToPlay":
    "Esta playlist ainda não tem nada para tocar",
  "libraryLive.olderSavesError":
    "Não conseguimos carregar o que guardaste há mais tempo.",
  "numbers.eyebrow": "Os teus números",
  "numbers.title": "Como <em>{name}</em> chega às pessoas",
  "numbers.dek":
    "Totais de hoje. Uma audição conta depois de 30 segundos, e qualquer número de 1 a 4 aparece como Menos de 5, para ninguém ficar identificável",
  "numbers.personaLabel": "Persona",
  "numbers.followers": "Pessoas que seguem",
  "numbers.tableCaption":
    "Audições, guardados e presenças em playlists públicas de cada lançamento de {name}",
  "numbers.column.release": "Lançamento",
  "numbers.column.saves": "Guardados",
  "numbers.column.inPublicPlaylists": "Em playlists públicas",
  "numbers.column.releaseOrTrack": "Lançamento ou faixa",
  "numbers.fewerThanFive": "Menos de 5",
  "numbers.showTracks": "Mostrar as faixas de {title}",
  "numbers.hideTracks": "Esconder as faixas de {title}",
  "numbers.empty.title": "Ainda não há lançamentos",
  "numbers.empty.body": "Publica um lançamento e os números dele aparecem aqui",
  "callsLive.eyebrow": "De Financiamento e Apoios",
  "callsLive.title": "Concursos abertos para <em>música</em>",
  "callsLive.dek":
    "Quem financia e organiza publica os concursos em Financiamento e Apoios. Estes são os abertos com a etiqueta música",
  "callsLive.postCta": "Publicar um concurso",
  "callsLive.allCallsCta": "Ver todos os concursos abertos",
  "callsLive.musicCallsCta":
    "Ver concursos de música em Financiamento e Apoios",
  "callsLive.listLabel": "Concursos abertos para música",
  "callsLive.empty.title": "Não há concursos abertos para música agora",
  "callsLive.empty.body":
    "Os concursos novos com a etiqueta música aparecem aqui assim que forem publicados",
  "callsLive.loadErrorTitle": "Não conseguimos carregar os concursos abertos",
  "callsLive.showMore": "Mostrar mais concursos",
  "callsLive.loadingMore": "A carregar mais concursos",
  "callsLive.loadMoreError": "Não conseguimos carregar mais concursos",
  "callsLive.card.amount": "Montante",
  "callsLive.card.deadline": "Prazo",
  "callsLive.card.eligibility": "Quem pode concorrer",
  "callsLive.card.scope": "Âmbito",
  "callsLive.card.notStated": "Por indicar",
  "fundLive.eyebrow": "Solidariedade",
  "fundLive.title": "Pessoas a ajudar <em>pessoas</em>",
  "fundLive.body":
    "A QueerPulse nunca mexe em dinheiro. Quando alguém da música precisa de ajuda, a comunidade angaria-a em Financiamento e Apoios, e a moderação verifica cada angariação antes de ser publicada",
  "fundLive.safety":
    "Contribui só pelo link da própria angariação. Se alguém te pedir dinheiro numa mensagem, denuncia",
  "fundLive.fundraisersCta": "Ver angariações de música",
  "fundLive.startCta": "Começar uma angariação",
  "fundLive.callsCta": "Ver concursos abertos para música",
  "rail.v2.library": "Biblioteca",
  "rail.v2.openCalls": "Concursos abertos",
  "rail.v2.yourNumbers": "Os teus números",
  "creator.nav.yourNumbers": "Os teus números",
  "demo.dashboard.stats.followers": "Seguidores",
  "demo.dashboard.stats.saves": "Guardados · este mês",
  "demo.dashboard.trend.followers": "<up>{delta}</up> este mês",
  "demo.dashboard.trend.saves":
    "<up>{delta}</up> face ao mês passado · {active} de {total} faixas guardadas",
  "demo.dashboard.trend.earnings": "<up>{delta}</up> face ao mês passado",
  "demo.dashboard.trend.tips":
    "{tippers} gorjetas, {notes} com mensagem · <up>{recent} desde que abriste esta página</up>",
  "demo.dashboard.curator.what.wednesdaySet":
    "<em>{title}</em> entrou na faixa 6 do set de quarta",
  "demo.dashboard.curator.what.collection":
    "<em>{title}</em> entrou em “Canções para pôr a tocar à tua mãe”",
  "demo.dashboard.curator.what.mix":
    "<em>{title}</em> entrou em Trans composers vol. iv",
  "demo.dashboard.curator.what.warmup":
    "<em>{title}</em> escolhida para o aquecimento de segunda",
  "demo.dashboard.curator.who.wednesdaySet":
    "Sara Marques · Vespertina vol. iv · “fica até ao segundo verso”",
  "demo.dashboard.curator.who.collection":
    "Sara Marques · coleção · entrou na rotação desta semana",
  "demo.dashboard.curator.who.mix":
    "D. Okoye · mix · um parágrafo nas notas sobre a letra",
  "demo.dashboard.curator.who.warmup":
    "João Ribeiro · uma faixa · “para a cozinha, às 20h”",
  "demo.dashboard.curator.today": "hoje",
  "demo.dashboard.otherCities": "{count} outras cidades",
  "demo.dashboard.peakSummary":
    "Pico: <em>{day}</em> · {total} guardados e adições a playlists · a Sara escolheu-te na segunda",
  "demo.dashboard.activity.title": "Guardados e adições a playlists",
  "demo.dashboard.activity.sub_one": "Último dia",
  "demo.dashboard.activity.sub_other": "Últimos {count} dias",
  "demo.dashboard.activity.rangeLabel": "Período",
  "demo.dashboard.activity.rangeAria_one": "Mostrar o último dia",
  "demo.dashboard.activity.rangeAria_other": "Mostrar os últimos {count} dias",
  "demo.dashboard.activity.ariaLabel_one":
    "Gráfico de barras dos guardados e adições a playlists do último dia",
  "demo.dashboard.activity.ariaLabel_other":
    "Gráfico de barras dos guardados e adições a playlists por dia nos últimos {count} dias",
  "demo.dashboard.activity.today": "Hoje",
  "demo.dashboard.activity.showTable": "Mostrar tabela de dados",
  "demo.dashboard.activity.hideTable": "Esconder tabela de dados",
  "demo.dashboard.activity.tableCaption_one":
    "Guardados e adições a playlists do último dia",
  "demo.dashboard.activity.tableCaption_other":
    "Guardados e adições a playlists por dia, últimos {count} dias",
  "demo.dashboard.activity.dayColumn": "Dia",
  "demo.dashboard.activity.countColumn": "Guardados e adições a playlists",
  "demo.dashboard.topTrackShare": "<em>{title}</em> é {percent}% disto",
  "demo.dashboard.goLivePlan": "Plano: {date} · estreia de {title}",
  "demo.calls.seat": "Conselho · lugar {seat}",
  "demo.calls.tag.commission": "Encomenda",
  "demo.calls.tag.grant": "Bolsa",
  "demo.calls.tag.residency": "Residência",
  "demo.calls.tag.closesInDays_one": "Fecha daqui a {count} dia",
  "demo.calls.tag.closesInDays_other": "Fecha daqui a {count} dias",
  "demo.calls.tag.applied": "Candidatura enviada · {date}",
  "demo.calls.meta.deadline": "Prazo {date}",
  "demo.calls.meta.oneTrack": "1 faixa",
  "demo.calls.meta.slotsFilled": "{filled} de {total} vagas preenchidas",
  "demo.calls.meta.releaseAsEvidence": "1 lançamento como amostra",
  "demo.calls.meta.grantCount": "{count} bolsas",
  "demo.calls.meta.trackAndNote": "1 faixa e uma nota",
  "demo.calls.meta.oneResidency": "1 residência",
  "demo.calls.track.unreleased": "inédita",
  "demo.calls.marsha.title":
    "Uma canção para a noite <em>Marsha P. Johnson</em>",
  "demo.calls.marsha.brief":
    "Estamos a preparar a música da emissão de 28 de junho, uma sala ao vivo de 90 minutos a assinalar o aniversário. Queremos <em>uma faixa original</em>, de 3 a 6 minutos, para levar a emissão entre intervenções. Fica tua para guardares e voltares a lançar",
  "demo.calls.marsha.amountLabel": "valor fixo · pago na aceitação",
  "demo.calls.marsha.placeholder":
    "Uma frase sobre porquê esta (opcional). O conselho ouve primeiro o trabalho",
  "demo.calls.spring.title":
    "Bolsa de primavera: linha para <em>pessoas compositoras trans</em>",
  "demo.calls.spring.brief":
    "Bolsas de 1200 € sem condições para pessoas compositoras trans e não binárias, em qualquer forma: partitura, ambiente, coral, clube. Financiamos a <em>prática</em> em si, sem nada para entregar. Doze bolsas nesta ronda",
  "demo.calls.spring.amountLabel": "sem condições",
  "demo.calls.spring.placeholder":
    "O que é que a bolsa te deixaria criar? (opcional)",
  "demo.calls.residency.title": "Casa do Comum: residência de <em>agosto</em>",
  "demo.calls.residency.brief":
    "Duas semanas no espaço de Lisboa com chaves, PA e material de gravação, a fechar com uma emissão ao vivo a partir de lá. Viagem e uma ajuda de 600 € incluídas. Procuramos alguém que <em>use o espaço com volume</em>",
  "demo.calls.residency.amountLabel": "mais espaço e viagem",
  "demo.calls.residency.placeholder":
    "Como usarias as duas semanas? (opcional)",
  "demo.calls.applied.title": "Tema de fecho da <em>assembleia do Orgulho</em>",
  "demo.calls.applied.brief":
    "Juntaste <em>{track}</em> e uma nota. A Sara ficou com ela a {claimedOn} e decide até {decisionBy}. Recebes a resposta aqui, com uma frase, seja qual for",
  "demo.calls.applied.statusNote": "em análise com a Sara",
  "demo.fund.balanceNote":
    "Saudável: cerca de quatro meses dos pagamentos atuais. O que passar de seis meses de margem vai para a ronda trimestral de bolsas seguinte, por votação do conselho",
  "demo.fund.flowsDek":
    "O excedente das quotas de apoiante, os arredondamentos das gorjetas e os donativos enchem-no, e <em>o que pagas a artistas pela música, e as tuas gorjetas,</em> ficam com as pessoas artistas",
  "demo.fund.applyBody":
    "Se és do QueerPulse e estás num mês difícil, a linha de emergência é um formulário curto e um sim rápido: <em>sem portefólio, sem prova de rendimentos, sem vergonha</em>. Quem transcreve e traduz recebe por peça aceite, e as bolsas abrem a cada trimestre",
  "demo.fund.name.withheld": "Omitido a <em>pedido</em>",
  "demo.fund.name.helenaAndOthers": "Helena <em>Pinto</em> e mais 6 pessoas",
  "demo.fund.name.lgpInterpreter": "Interpretação em <em>LGP</em>",
  "demo.fund.name.communityPool": "<em>Fundo</em> comunitário · 9 pessoas",
  "demo.fund.name.instrument": "<em>Substituição</em> de instrumento",
  "demo.fund.name.captioning": "<em>Legendagem</em> · 6 emissões",
  "demo.fund.name.springStrand": "Linha de primavera · <em>4 artistas</em>",
  "demo.fund.note.teresa": "14 partituras aceites no arquivo nesta quinzena",
  "demo.fund.note.rent":
    "Um mês de renda para uma pessoa entre digressões, confidencial",
  "demo.fund.note.springGrants":
    "Linha de primavera para primeiros lançamentos · 1200 € sem condições cada",
  "demo.fund.note.marshaSigning":
    "Interpretou a emissão Marsha P. Johnson · 90 minutos",
  "demo.fund.note.lyricTranslations":
    "Traduções de letras de PT para EN, de PT para ES e de FR para PT em 22 faixas",
  "demo.fund.note.accordion":
    "Um acordeão roubado, substituído numa semana, sem formulário",
  "demo.fund.note.mateus":
    "Bolsa de primeiro lançamento · masterização e arte do EP de estreia",
  "demo.fund.note.captions":
    "Legendas ao vivo na temporada de emissões de maio",
  "demo.fund.note.pedro": "Tradução de letras de PT para EN em 8 faixas",
  "demo.fund.note.medical": "Despesas médicas de uma pessoa, confidencial",
  "demo.fund.note.sofia": "9 partituras aceites no arquivo",
  "demo.fund.note.springArtists":
    "Bolsas de primeiro lançamento · 1200 € sem condições cada",

  // ── Studio, páginas abertas (2026-10-13): Ajuda, Sobre, Termos,
  // Acessibilidade e Direitos em produção, a vista de lançamento retirado,
  // contestações, definições do leitor, revisão de denúncias e o grupo de
  // utilidades do menu lateral. As chaves de demonstração acima ficam.
  "errors.releaseWithdrawn": "Este lançamento foi retirado",
  "errors.releaseNotTakenDown": "Este lançamento já não está retirado",
  "errors.disputeAlreadyOpen": "Já há uma contestação à espera da nossa equipa",
  "errors.disputeLimitReached": "Este lançamento já usou as três contestações",
  "errors.disputeNotOpen": "Esta contestação já tem decisão",
  "errors.releaseHasOpenDispute":
    "Este lançamento tem uma contestação à espera. Repõe-o a partir de Contestações",
  "errors.takedownReportMismatch": "Essa denúncia não é sobre este lançamento",
  "errors.takedownReportNotOpen": "Essa denúncia já foi tratada",
  "errors.trackWithheld": "Esta faixa não está disponível",
  "errors.trackExplicitLocked":
    "A nossa equipa marcou esta faixa como explícita, por isso continua marcada",
  "errors.useCopyrightClaim":
    "As reivindicações de direitos de autor têm um formulário próprio",
  "errors.claimOwnTrack":
    "Não podes enviar uma reivindicação sobre uma faixa tua",
  "errors.claimExists": "Já tens uma reivindicação aberta sobre esta faixa",
  "errors.claimLimit": "Podes ter até 10 reivindicações abertas ao mesmo tempo",
  "errors.claimNotCountered":
    "Podes responder quando a pessoa artista enviar uma contranotificação",
  "errors.claimAlreadyReplied": "Já respondeste a esta contranotificação",
  "errors.claimNotLive": "Esta reivindicação já está fechada",
  "errors.claimNotAccepted":
    "A contranotificação só se envia uma vez, enquanto a faixa está retida",
  "errors.claimNotSubmitted": "A nossa equipa já verificou esta reivindicação",
  "errors.claimNotDecidable":
    "A nossa equipa só pode manter ou rejeitar uma reivindicação depois de a aceitar",
  "errors.trackReportMismatch":
    "Essa denúncia não é sobre esta faixa do Studio",
  "errors.trackReportNotOpen": "Essa denúncia já foi tratada",

  "helpLive.hero.eyebrow": "Ajuda do Studio",
  "helpLive.hero.title": "Como te podemos <em>ajudar</em>?",
  "helpLive.hero.dek":
    "Respostas sobre ouvir, partilhar a tua música e estar em segurança no Studio. Se faltar alguma coisa, a nossa equipa lê todas as mensagens.",
  "helpLive.search.label": "Pesquisar na ajuda do Studio",
  "helpLive.search.placeholder": "Experimenta guardar ou playlists",
  "helpLive.search.clearCta": "Limpar a pesquisa",
  "helpLive.search.resultCount_one": "{count} resposta corresponde",
  "helpLive.search.resultCount_other": "{count} respostas correspondem",
  "helpLive.search.emptyTitle": 'Nada corresponde a "{query}"',
  "helpLive.search.emptyBody":
    "Experimenta outra palavra ou pergunta à nossa equipa aqui em baixo.",
  "helpLive.cat.listening.heading": "<em>Ouvir</em>",
  "helpLive.cat.listening.blurb": "Reprodução, guardados, playlists e seguir",
  "helpLive.cat.sharing.heading": "Partilhar a tua <em>música</em>",
  "helpLive.cat.sharing.blurb":
    "Carregamentos, personas, a caixa de direitos e as tuas estatísticas",
  "helpLive.cat.safety.heading": "Segurança e <em>direitos</em>",
  "helpLive.cat.safety.blurb": "Denúncias, retiradas e contestações",
  "helpLive.cat.money.heading": "Dinheiro e <em>gorjetas</em>",
  "helpLive.faq.whatIsStudio.q": "O que é o Studio e quem o pode usar?",
  "helpLive.faq.whatIsStudio.a":
    "O Studio é o sítio do QueerPulse onde artistas queer partilham a sua música com as pessoas da comunidade. Ouvir é gratuito, artistas podem vender a sua música diretamente, e está aberto a quem a nossa equipa deu acesso ao Studio.",
  "helpLive.faq.tracking.q": "O Studio guarda o que eu oiço?",
  "helpLive.faq.tracking.a":
    "Sim, em privado. O Studio guarda um histórico de audição que só tu vês, em <a>O que ouves</a>, onde o podes pausar ou limpar. Quem faz a música vê o total de audições, com qualquer número de 1 a 4 como Menos de 5, e o teu nome só se ligares Mostrar-me entre quem mais ouve na página de artista.",
  "helpLive.faq.saving.q":
    "Como funcionam os gostos, as playlists e seguir artistas?",
  "helpLive.faq.saving.a":
    "Toca no coração de um álbum, podcast ou playlist e fica à tua espera na tua <a>biblioteca</a> e na lista ao lado das tuas playlists. Toca no coração de uma faixa e ela vai para as Músicas de que gostas, que só tu vês. Uma playlist pode ser Pública, Só ligações ou Privada, e podes mudar isso quando quiseres. Segue artistas a partir da página de cada artista para saberes quando lançam algo novo.",
  "helpLive.faq.playerSettings.q":
    "Posso mudar a forma como o leitor funciona?",
  "helpLive.faq.playerSettings.a":
    "Sim. Nas <a>Definições</a> podes desligar a Reprodução automática, esconder faixas marcadas como explícitas e, na maioria dos navegadores, definir uma transição entre faixas. As tuas escolhas acompanham-te em todos os dispositivos.",
  "helpLive.faq.uploading.q": "Como carrego um lançamento?",
  "helpLive.faq.uploading.a":
    "Começa em <a>Carregar um lançamento</a>, escolhe uma das tuas personas de música ou DJ, junta as faixas, a capa e os detalhes, marca a caixa de direitos e publica. O lançamento aparece com o nome da persona.",
  "helpLive.faq.rightsCheckbox.q": "O que significa a caixa de direitos?",
  "helpLive.faq.rightsCheckbox.a":
    "Ao marcá-la confirmas que és titular ou controlas os direitos de todas as gravações e composições do lançamento, e que os créditos estão certos. Se isso mudar, despublica o lançamento na tua página de artista.",
  "helpLive.faq.stats.q": "O que mostram as minhas estatísticas?",
  "helpLive.faq.stats.a":
    "<a>Os teus números</a> mostram audições, pessoas que te seguem, guardados, as playlists públicas com a tua música e quem mais te ouve. Qualquer número de 1 a 4 aparece como Menos de 5, para ninguém conseguir perceber quem fez o quê.",
  "helpLive.faq.reporting.q": "Como denuncio um lançamento?",
  "helpLive.faq.reporting.a":
    "Abre o lançamento, depois Mais ações e Denunciar lançamento. A nossa equipa analisa todas as denúncias e, se um lançamento violar as regras, retira-o e quem o publicou vê porquê.",
  "helpLive.faq.takedown.q": "O que acontece quando um lançamento é retirado?",
  "helpLive.faq.takedown.a":
    "Deixa de estar disponível para quem ouve de imediato. Quem o guardou mantém-no na biblioteca, marcado como retirado. Quem o publicou lê o motivo da nossa equipa na página do lançamento e pode contestá-lo aí.",
  "helpLive.faq.dispute.q": "Como contesto uma retirada?",
  "helpLive.faq.dispute.a":
    "Abre o teu lançamento. Por baixo do motivo da retirada, escreve uma nota para a nossa equipa e envia-a. A resposta aparece no mesmo sítio e, se a equipa concordar, o lançamento volta. Cada lançamento pode ser contestado até três vezes, uma de cada vez. Mais em <a>Direitos e retiradas</a>.",
  "helpLive.contact.heading": "Ainda com <em>dúvidas</em>?",
  "helpLive.contact.team.title": "Fala com a <em>nossa equipa</em>",
  "helpLive.contact.team.body":
    "Envia uma mensagem pelo formulário de contacto e a nossa equipa trata dela a partir daí.",
  "helpLive.contact.team.action": "Contactar a nossa equipa",
  "helpLive.contact.email.title": "Escreve-nos por <em>email</em>",
  "helpLive.contact.email.body":
    "Escreve para hello@queerpulse.com a partir da tua app de email.",
  "helpLive.contact.email.action": "Escrever à nossa equipa",
  "helpLive.contact.platform.title": "Ajuda do <em>QueerPulse</em>",
  "helpLive.contact.platform.body":
    "Perguntas sobre a tua conta e sobre segurança em todo o QueerPulse.",
  "helpLive.contact.platform.action": "Abrir a ajuda do QueerPulse",
  "helpLive.pageTitle": "Ajuda",

  "aboutLive.hero.eyebrow": "Sobre o Studio",
  "aboutLive.hero.title":
    "Música de artistas queer, para <em>quem faz parte da comunidade</em>.",
  "aboutLive.hero.lede":
    "O Studio é um sítio do QueerPulse onde artistas queer partilham a sua música com as pessoas da comunidade. Ouvir é gratuito, artistas podem vender-te a sua música diretamente, e o que ouves fica em privado.",
  "aboutLive.sec.today.num": "01: o que é hoje",
  "aboutLive.sec.today.heading": "O que o Studio <em>faz</em>",
  "aboutLive.sec.today.p1":
    "Artistas carregam lançamentos com uma persona de música ou DJ e publicam-nos para as pessoas com acesso ao Studio. Quem ouve pode tocar, guardar, fazer playlists e seguir artistas de que gosta.",
  "aboutLive.sec.today.p2":
    "Ouvir e carregar música é gratuito. Artistas podem pôr preço em álbuns, EPs, singles e faixas, e quem compra paga-lhes diretamente, por isso o dinheiro vai direto para a pessoa artista e o QueerPulse não fica com nenhuma parte.",
  "aboutLive.sec.privacy.num": "02: o que controlas",
  "aboutLive.sec.privacy.heading": "O que ouves fica <em>contigo</em>",
  "aboutLive.sec.privacy.p1":
    "O teu histórico de audição é teu: só tu o vês, e podes pausá-lo ou limpá-lo quando quiseres. Quem faz a música vê o total de audições, e o teu nome só se escolheres mostrá-lo.",
  "aboutLive.sec.privacy.p2":
    "Artistas veem audições, pessoas que seguem, guardados e inclusões em playlists públicas, e qualquer número de 1 a 4 aparece como Menos de 5.",
  "aboutLive.sec.control.num": "03: como artistas mantêm o controlo",
  "aboutLive.sec.control.heading": "A tua música, <em>a tua decisão</em>",
  "aboutLive.sec.control.p1":
    "Despublica qualquer lançamento na tua página de artista quando quiseres. As denúncias das pessoas da comunidade vão para a nossa equipa e, se a equipa retirar um lançamento, lês o motivo na página do lançamento e podes contestá-lo aí.",
  "aboutLive.sec.personas.num": "04: personas e privacidade",
  "aboutLive.sec.personas.heading": "Lança com o teu <em>nome artístico</em>",
  "aboutLive.sec.personas.p1":
    "Os teus lançamentos, as playlists que creditas a uma persona e as tuas estatísticas ficam todos com o nome da persona. As pessoas com acesso ao Studio veem os teus lançamentos, as tuas faixas, o teu nome artístico e as tuas playlists públicas.",
  "aboutLive.sec.next.num": "05: para onde vai",
  "aboutLive.sec.next.heading": "Crescer com <em>quem o usa</em>",
  "aboutLive.sec.next.p1":
    "As pessoas da comunidade já podem comprar música diretamente a artistas, e o dinheiro vai para a pessoa artista fora do QueerPulse; a seguir, queremos dar-lhes voz sobre o funcionamento do Studio. Vamos construir isso às claras com a nossa comunidade e diremos aqui quando algo for real.",
  "aboutLive.showcase.heading": "A visão <em>cooperativa</em>",
  "aboutLive.showcase.dek":
    "Como poderia ser um Studio cooperativo, mostrado nesta demonstração.",
  "aboutLive.cta.title": "Vem <em>ouvir</em>.",
  "aboutLive.cta.body":
    "Começa no início do Studio ou lê primeiro os termos curtos do Studio.",
  "aboutLive.cta.open": "Abrir o Studio",
  "aboutLive.cta.terms": "Ler os termos do Studio",
  "aboutLive.credits.heading": "Código aberto",
  "aboutLive.credits.lame":
    "O áudio é codificado em MP3 com o <a>codificador LAME MP3</a> (licenciado sob a GNU Lesser General Public License, LGPL), usado através de @mediabunny/mp3-encoder (Mozilla Public License 2.0).",

  "termsLive.eyebrow": "Termos do Studio",
  "termsLive.title": "O <em>aditamento</em> curto do Studio",
  "termsLive.lede":
    "Juntam-se aos termos e à política de privacidade do QueerPulse, que se aplicam ao Studio na íntegra. Tratam do que é próprio do Studio.",
  "termsLive.sec.rights.num": "01: a caixa de direitos",
  "termsLive.sec.rights.heading": "Quando <em>publicas</em>",
  "termsLive.sec.rights.p1":
    "Antes de publicar, confirmas que és titular ou controlas os direitos de todas as gravações e composições do lançamento, e que os créditos estão certos. Os direitos continuam a ser teus. Enquanto o lançamento estiver publicado, as pessoas com acesso ao Studio podem ouvi-lo no QueerPulse.",
  "termsLive.sec.visible.num": "02: o que as pessoas veem",
  "termsLive.sec.visible.heading": "O que fica <em>visível</em>",
  "termsLive.sec.visible.p1":
    "As pessoas com acesso ao Studio veem os teus lançamentos e faixas, o teu nome artístico e as tuas playlists públicas. Uma playlist definida como Só ligações ou Privada fica com as pessoas que essa opção permite.",
  "termsLive.sec.stored.num": "03: o que o Studio guarda",
  "termsLive.sec.stored.heading": "O que <em>guardamos</em>",
  "termsLive.sec.stored.p1":
    "O Studio guarda os teus lançamentos com o áudio e as capas, os teus guardados, playlists e artistas que segues, as definições do leitor, o teu histórico de audição enquanto está ligado (guardado durante 13 meses, e podes limpá-lo), as páginas de artista onde escolheste aparecer entre quem mais ouve, as tuas compras (o que compraste, o valor, o código de referência, o nome no pagamento que deste, o estado e a tua escolha no mural de apoio), as formas de receber que cada artista indica, as contestações que envias com a resposta da nossa equipa, e as reivindicações de direitos de autor e contranotificações que envias com a decisão da nossa equipa. Os totais de audições de cada faixa não levam nenhum nome.",
  "termsLive.sec.stored.p2":
    "Tudo o que o Studio guarda sobre ti está coberto pela <a>política de privacidade</a> do QueerPulse.",
  "termsLive.sec.takedown.num": "04: retiradas e contestações",
  "termsLive.sec.takedown.heading": "Se algo <em>correr mal</em>",
  "termsLive.sec.takedown.p1":
    "Podes despublicar o teu lançamento quando quiseres. Se alguém denunciar um lançamento, a nossa equipa analisa-o e pode retirá-lo. Vês o motivo na página do lançamento e podes contestá-lo aí, uma contestação de cada vez e até três por lançamento. A nossa equipa responde no lançamento e, se concordar, ele volta.",
  "termsLive.sec.takedown.claims":
    "Uma reivindicação de direitos de autor sobre uma faixa tem um formulário próprio, aberto a quem tem sessão iniciada. Enviá-la não muda nada até a nossa equipa a aceitar. Aí só essa faixa fica offline, e a pessoa artista pode enviar uma contranotificação, a que quem fez a reivindicação pode responder uma vez. A pessoa artista lê a reivindicação sem saber quem a fez. Depois de aceitar uma reivindicação, a nossa equipa pode decidi-la a qualquer momento: mantê-la deixa a faixa offline, e rejeitá-la traz a faixa de volta, a não ser que outra reivindicação a retenha. Até à decisão final, quem fez a reivindicação pode retirá-la.",
  "termsLive.questions":
    "Dúvidas sobre estes termos? Escreve para <a>hello@queerpulse.com</a> ou <link>fala com a nossa equipa</link>.",
  "termsLive.full.title": "Os termos completos",
  "termsLive.full.body":
    "Os termos e a política de privacidade do QueerPulse também se aplicam ao Studio.",
  "termsLive.full.termsCta": "Ler os termos completos",
  "termsLive.full.privacyCta": "Ler a política de privacidade",

  "accessibilityLive.eyebrow": "Acessibilidade no Studio",
  "accessibilityLive.title": "O que funciona <em>hoje</em>",
  "accessibilityLive.lede":
    "Esta lista cobre só o que o Studio faz agora. Quando algo ainda não existe, dizemo-lo.",
  "accessibilityLive.status.live": "Disponível",
  "accessibilityLive.status.notYet": "Ainda não",
  "accessibilityLive.group.player.heading": "O <em>leitor</em>",
  "accessibilityLive.group.player.dek":
    "Feito para funcionar com teclado, leitor de ecrã e os controlos multimédia do teu dispositivo.",
  "accessibilityLive.item.mediaKeys.heading":
    "Teclas multimédia e <em>ecrã bloqueado</em>",
  "accessibilityLive.item.mediaKeys.body":
    "Tocar, pausar, seguinte e anterior funcionam com as teclas multimédia do teclado, com os auscultadores e no ecrã bloqueado do telemóvel.",
  "accessibilityLive.item.seek.heading":
    "Barra de progresso por <em>teclado</em>",
  "accessibilityLive.item.seek.body":
    "A barra de progresso é um controlo deslizante. As teclas de seta avançam e recuam na faixa, e Home e End saltam para o início e para o fim.",
  "accessibilityLive.item.labels.heading": "Controlos com <em>nome</em>",
  "accessibilityLive.item.labels.body":
    "Cada botão do leitor tem um nome que o teu leitor de ecrã lê, e os problemas de reprodução são anunciados numa região dinâmica.",
  "accessibilityLive.group.display.heading": "Ecrã e <em>idioma</em>",
  "accessibilityLive.group.display.dek":
    "O Studio segue as escolhas que fizeste no QueerPulse.",
  "accessibilityLive.item.motion.heading":
    "Respeita a <em>redução de movimento</em>",
  "accessibilityLive.item.motion.body":
    "Quando o teu dispositivo ou o QueerPulse pedem menos movimento, painéis e listas deixam de deslizar e de mudar de tamanho. O ecrã de reprodução mantém um esbatimento de 0,2 segundos, para abrir e fechar com suavidade.",
  "accessibilityLive.item.themes.heading": "Temas <em>claro</em> e escuro",
  "accessibilityLive.item.themes.body":
    "O Studio segue o tema do QueerPulse. Muda-o no menu da conta ou nas definições do Studio.",
  "accessibilityLive.item.languages.heading": "Inglês e <em>português</em>",
  "accessibilityLive.item.languages.body":
    "As palavras do próprio Studio existem em inglês e em português. Títulos e letras ficam como quem os escreveu.",
  "accessibilityLive.group.words.heading": "Palavras e <em>legendas</em>",
  "accessibilityLive.group.words.dek": "O que podes ler enquanto ouves.",
  "accessibilityLive.item.lyrics.heading": "Letras em <em>texto</em>",
  "accessibilityLive.item.lyrics.body":
    "Quando quem publica junta a letra, a página da faixa mostra-a em texto para leres ao teu ritmo.",
  "accessibilityLive.item.captions.heading": "<em>Legendas</em>",
  "accessibilityLive.item.captions.body":
    "O Studio ainda não tem conteúdo falado para legendar, por isso hoje não há legendas.",
  "accessibilityLive.contact.title": "Encontraste uma <em>barreira</em>?",
  "accessibilityLive.contact.body":
    "Conta à nossa equipa o que te bloqueou e onde. Tratamos isso como um erro a corrigir.",
  "accessibilityLive.contact.cta": "Reportar um problema de acessibilidade",
  "accessibilityLive.pageTitle": "Acessibilidade",
  "accessibilityLive.shortcutsNote":
    "Os atalhos de uma só letra podem ser desligados nas Definições.",
  "accessibilityLive.shortcutsNoteCta": "Abrir Definições",

  "rightsLive.eyebrow": "Direitos e retiradas",
  "rightsLive.title": "Como funcionam os <em>direitos</em> no Studio",
  "rightsLive.dek":
    "O que confirmas quando publicas, o que acontece depois de uma denúncia ou de uma reivindicação de direitos de autor e como contestar uma retirada.",
  "rightsLive.sec.checkbox.heading": "A caixa de <em>direitos</em>",
  "rightsLive.sec.checkbox.body":
    "Antes de publicar, confirmas que és titular ou controlas os direitos de todas as gravações e composições do lançamento, e que os créditos estão certos.",
  "rightsLive.sec.report.heading": "Depois de uma <em>denúncia</em>",
  "rightsLive.sec.report.body":
    "A nossa equipa analisa todas as denúncias. Se um lançamento violar as regras, a equipa retira-o e escreve um motivo que lês na página do lançamento. O lançamento deixa de estar disponível para quem ouve, e quem o guardou mantém-no na biblioteca, marcado como retirado.",
  "rightsLive.sec.dispute.heading": "Como <em>contestar</em>",
  "rightsLive.sec.dispute.body":
    "Abre o teu lançamento. Por baixo do motivo da retirada, escreve uma nota para a nossa equipa e envia-a. A resposta aparece no lançamento e, se a equipa concordar, o lançamento volta. Podes contestar cada lançamento até três vezes, uma de cada vez.",
  "rightsLive.sec.claims.heading":
    "Reivindicações de <em>direitos de autor</em>",
  "rightsLive.sec.claims.body":
    "Quem tem sessão iniciada envia uma reivindicação de direitos de autor a partir de Denunciar faixa, na própria faixa. Nada muda enquanto a nossa equipa a verifica. Se a nossa equipa a aceitar, só essa faixa fica offline, e a pessoa artista pode enviar uma contranotificação, a que quem fez a reivindicação pode responder uma vez. A pessoa artista lê a reivindicação sem saber quem a fez. A nossa equipa pode manter ou rejeitar uma reivindicação aceite a qualquer momento, e as duas partes leem porquê. Até essa decisão final, quem fez a reivindicação pode retirá-la.",
  "rightsLive.sec.unpublish.heading": "Despublica <em>quando quiseres</em>",
  "rightsLive.sec.unpublish.body":
    "Podes despublicar o teu lançamento na tua página de artista sempre que quiseres. Volta a ser um rascunho que só tu e quem partilha a persona contigo conseguem ver.",
  "rightsLive.cta": "Abrir os teus lançamentos",

  "withdrawnLive.eyebrow": "Studio",
  "withdrawnLive.title": "Este lançamento foi <em>retirado</em>",
  "withdrawnLive.body":
    "A nossa equipa retirou-o depois de uma denúncia. Se o guardaste, continua na tua biblioteca, marcado como retirado.",
  "withdrawnLive.homeCta": "Voltar ao início do Studio",
  "withdrawnLive.rightsCta": "Como funcionam as retiradas",
  "withdrawnLive.rowLabel": "Retirado",

  "dispute.heading": "Contestar esta retirada",
  "dispute.yourDisputeHeading": "A tua contestação",
  "dispute.intro":
    "Se achas que a nossa equipa se enganou, explica porquê. A equipa lê todas as contestações e responde aqui.",
  "dispute.openFormCta": "Escrever uma contestação",
  "dispute.againCta": "Escrever outra contestação",
  "dispute.closeFormCta": "Fechar o formulário de contestação",
  "dispute.noteLabel": "A tua nota para a nossa equipa",
  "dispute.noteHint":
    "Até 1000 caracteres. Partilha o que ajudar, como quem detém os direitos.",
  "dispute.noteRequired": "Escreve uma nota antes de a enviares",
  "dispute.sendCta": "Enviar contestação",
  "dispute.sendingCta": "A enviar a contestação",
  "dispute.sentToast": "Contestação enviada à nossa equipa",
  "dispute.openStatus": "Contestação enviada, a nossa equipa responde aqui",
  "dispute.sentOn": "Enviada a {date}",
  "dispute.yourNoteLabel": "A tua nota",
  "dispute.upheldTitle": "A nossa equipa repôs este lançamento",
  "dispute.rejectedTitle": "A nossa equipa manteve este lançamento retirado",
  "dispute.replyLabel": "A resposta da equipa",
  "dispute.decidedOn": "Decidida a {date}",
  "dispute.limitReached": "Este lançamento já usou as três contestações.",
  "dispute.limitNextStep":
    "A nossa equipa ainda pode rever este lançamento. Lê os teus direitos ou escreve-nos a contar o que mudou.",

  "claimPanel.heading": "Reivindicação de direitos de autor",
  "claimPanel.trackLabel": "Sobre {title}",
  "claimPanel.withheldBanner":
    "Esta faixa está offline enquanto a nossa equipa analisa uma reivindicação de direitos de autor",
  "claimPanel.acceptedOn": "Retida desde {date}",
  "claimPanel.acceptedDate": "Aceite a {date}",
  "claimPanel.withheldBannerRelease_one":
    "Uma faixa deste lançamento está offline enquanto a nossa equipa analisa uma reivindicação de direitos de autor",
  "claimPanel.withheldBannerRelease_other":
    "{count} faixas deste lançamento estão offline enquanto a nossa equipa analisa reivindicações de direitos de autor",
  "claimPanel.offlineTag": "Offline",
  "claims.ownerStatus.accepted": "Offline enquanto a nossa equipa analisa",
  "claims.ownerStatus.countered": "Contranotificação enviada",
  "claims.ownerStatus.upheld": "Reivindicação mantida",
  "claims.ownerStatus.rejected": "Reivindicação rejeitada, de volta online",
  "claims.staffStatus.submitted": "Nova",
  "claims.staffStatus.accepted": "À espera da pessoa artista",
  "claims.staffStatus.countered": "Contranotificação recebida",
  "claims.staffStatus.declined": "Recusada",
  "claims.staffStatus.upheld": "Mantida",
  "claims.staffStatus.rejected": "Rejeitada",
  "claims.staffStatus.withdrawn": "Retirada",
  "claimPanel.claimedWork": "Original reivindicado",
  "claimPanel.claimedDetails": "O que diz a reivindicação",
  "claimPanel.originalLink": "Abrir o original",
  "claimPanel.filedByLabel": "Quem a enviou",
  "claimPanel.claimantRole.rights_holder": "Quem detém os direitos",
  "claimPanel.claimantRole.authorised":
    "Alguém autorizado por quem detém os direitos",
  "claimPanel.counterOpenCta": "Escrever uma contranotificação",
  "claimPanel.counterCloseCta": "Fechar o formulário de contranotificação",
  "claimPanel.counterLabel": "A tua contranotificação",
  "claimPanel.counterHint":
    "Diz porque é que podes publicar esta faixa. Podes enviar uma, e a nossa equipa lê-a antes de decidir",
  "claimPanel.counterGoodFaith":
    "Acredito de boa-fé que esta faixa foi posta offline por engano",
  "claimPanel.counterRequired":
    "Escreve a tua contranotificação antes de a enviares",
  "claimPanel.goodFaithRequired": "Marca a declaração para a enviares",
  "claimPanel.counterCta": "Enviar contranotificação",
  "claimPanel.counterSending": "A enviar a contranotificação",
  "claimPanel.counterSentToast": "Contranotificação enviada à nossa equipa",
  "claimPanel.claimantReplyHeading": "Resposta de quem fez a reivindicação",
  "claimPanel.reviewing":
    "A nossa equipa está a analisar a reivindicação e a tua contranotificação",
  "claimPanel.outcome.upheld":
    "A nossa equipa manteve a reivindicação. A faixa continua offline",
  "claimPanel.outcome.rejected":
    "A nossa equipa rejeitou a reivindicação. A faixa voltou a estar online",
  "claimPanel.decidedOn": "Decidida a {date}",
  "claimPanel.staffNoteHeading": "Nota da nossa equipa",
  "claimPanel.upheldNextStep":
    "A faixa continua offline. Se achas que a nossa equipa se enganou, lê os teus direitos ou escreve-nos.",

  "claims.form.eyebrow": "Direitos no Studio",
  "claims.form.title": "Reivindicação de direitos de autor",
  "claims.form.dek":
    "Diz à nossa equipa que obra esta faixa copia. Nada muda para quem ouve até a nossa equipa verificar",
  "claims.form.subject": "Sobre {title} de {artist}",
  "claims.form.subjectUnknown": "Sobre uma faixa do Studio",
  "claims.form.pickTrack": "Sobre que faixa é a reivindicação?",
  "claims.form.pickTrackRow": "{number}. {title}",
  "claims.form.pickTrackLoading": "A carregar as faixas",
  "claims.form.pickTrackError": "Não conseguimos carregar as faixas.",
  "claims.form.pickTrackEmpty":
    "Nenhuma faixa deste lançamento pode receber uma reivindicação agora",
  "claims.form.roleLegend": "Qual é a tua ligação a esta obra?",
  "claims.form.role.rightsHolder": "Sou quem detém os direitos",
  "claims.form.role.authorised": "Tenho autorização de quem detém os direitos",
  "claims.form.originalWork.label": "Obra original (título e autoria)",
  "claims.form.originalLink.label": "Link para o original (opcional)",
  "claims.form.originalLink.hint": "Um endereço web que começa por https://",
  "claims.form.details.label": "O que a faixa copia e onde",
  "claims.form.details.hint":
    "Os minutos e segundos ajudam a nossa equipa a encontrar",
  "claims.form.goodFaith":
    "Acredito de boa-fé que este uso não está autorizado e que os detalhes que dei estão corretos",
  "claims.form.submit": "Enviar reivindicação",
  "claims.form.sending": "A enviar a reivindicação",
  "claims.form.sent": "Reivindicação enviada. A nossa equipa vai verificá-la",
  "claims.form.throttled":
    "Enviaste várias reivindicações na última hora. Tenta mais tarde",
  "claims.form.trackGone": "Essa faixa já não está no Studio",
  "claims.form.error.roleRequired": "Escolhe a tua ligação a esta obra",
  "claims.form.error.originalWorkRequired": "Indica a obra original",
  "claims.form.error.originalWorkTooLong":
    "Usa menos de 200 caracteres na obra original",
  "claims.form.error.linkInvalid": "Usa um link que comece por https://",
  "claims.form.error.linkTooLong": "Usa um link com menos de 500 caracteres",
  "claims.form.error.detailsRequired": "Diz o que a faixa copia",
  "claims.form.error.detailsTooLong":
    "Usa menos de 2000 caracteres nos detalhes",
  "claims.form.error.goodFaithRequired":
    "Marca a declaração para enviares a reivindicação",
  "claims.form.error.pickTrack": "Escolhe primeiro a faixa",
  "claims.form.pickTrackRetry": "Recarregar faixas",
  "claims.mine.title": "As tuas reivindicações de direitos de autor",
  "claims.mine.dek":
    "O que enviaste, o que a pessoa artista respondeu e o que a nossa equipa decidiu",
  "claims.mine.empty": "Ainda não enviaste nenhuma reivindicação",
  "claims.mine.emptyBody":
    "Para enviares uma, abre a faixa e escolhe Denunciar faixa",
  "claims.mine.emptyCta": "Como funcionam as reivindicações",
  "claims.mine.status.submitted": "À espera da nossa equipa",
  "claims.mine.status.accepted": "Aceite",
  "claims.mine.status.declined": "Recusada",
  "claims.mine.status.countered": "Contranotificação enviada",
  "claims.mine.status.upheld": "Mantida",
  "claims.mine.status.rejected": "Rejeitada",
  "claims.mine.status.withdrawn": "Retirada",
  "claims.mine.filedOn": "Enviada a {date}",
  "claims.mine.counterHeading": "A contranotificação da pessoa artista",
  "claims.mine.yourReplyHeading": "A tua resposta",
  "claims.mine.staffNoteHeading": "Nota da nossa equipa",
  "claims.mine.replyCta": "Escrever uma resposta",
  "claims.mine.replyCloseCta": "Fechar o formulário de resposta",
  "claims.mine.replyLabel": "A tua resposta à contranotificação",
  "claims.mine.replyHint":
    "Podes responder uma vez. A nossa equipa lê-a antes de decidir",
  "claims.mine.replyRequired": "Escreve a tua resposta antes de a enviares",
  "claims.mine.replySend": "Enviar resposta",
  "claims.mine.replySending": "A enviar a resposta",
  "claims.mine.replySentToast": "Resposta enviada à nossa equipa",
  "claims.mine.withdrawCta": "Retirar reivindicação",
  "claims.mine.withdrawConfirm": "Retirar esta reivindicação?",
  "claims.mine.withdrawBody":
    "A nossa equipa deixa de a analisar, e uma faixa que ela mantenha offline volta, a não ser que outra reivindicação a retenha",
  "claims.mine.withdrawnToast": "Reivindicação retirada",
  "claims.mine.loadMore": "Mostrar mais reivindicações",
  "claims.mine.loadingMore": "A carregar mais reivindicações",
  "claims.mine.loadError": "Não conseguimos carregar as tuas reivindicações",
  "claims.mine.decidedOn": "Decidida a {date}",
  "claims.mine.outcome.submitted":
    "A nossa equipa lê todas as reivindicações. Dizemos-te aqui quando decidirmos.",
  "claims.mine.outcome.accepted":
    "Tirámos a faixa do ar. A pessoa artista pode enviar uma contranotificação, e vais vê-la aqui.",
  "claims.mine.outcome.counteredReplied":
    "Já respondeste à contranotificação. A nossa equipa está a ler os dois lados e decide a seguir.",
  "claims.mine.outcome.countered":
    "A pessoa artista enviou uma contranotificação. Podes responder uma vez, e depois a nossa equipa lê os dois lados e decide.",
  "claims.mine.outcome.upheld":
    "A nossa equipa deu-te razão, por isso a faixa continua offline.",
  "claims.mine.outcome.rejected":
    "A nossa equipa rejeitou a reivindicação, por isso ela já não mantém a faixa offline",
  "claims.mine.outcome.declined":
    "A nossa equipa recusou a reivindicação, por isso ela não mantém a faixa offline",
  "claims.mine.outcome.withdrawn":
    "Retiraste esta reivindicação, e ela já não afeta a faixa.",
  "claims.mine.replyCheck": "Rever resposta",
  "claims.mine.replyReviewHeading":
    "A tua resposta, tal como a nossa equipa a vai ler",
  "claims.mine.replyReviewNote":
    "Podes enviar uma resposta a esta contranotificação, e depois de enviada já não a podes mudar.",
  "claims.mine.replyEdit": "Editar resposta",

  "settingsLive.eyebrow": "As tuas definições do Studio",
  "settingsLive.title": "Como o Studio <em>toca</em> para ti",
  "settingsLive.dek":
    "As definições de reprodução e de conteúdo acompanham-te em todos os dispositivos onde usas o Studio.",
  "settingsLive.playback.label": "Reprodução",
  "settingsLive.playback.title": "O que toca a <em>seguir</em>",
  "settingsLive.autoplay.heading": "Reprodução automática",
  "settingsLive.autoplay.body":
    "Quando uma faixa acaba, começa a seguinte da tua fila. Desliga para parar depois de cada faixa.",
  "settingsLive.crossfade.heading": "Transição entre faixas",
  "settingsLive.crossfade.body":
    "Mistura o fim de uma faixa com o início da seguinte enquanto a reprodução automática está ligada.",
  "settingsLive.crossfade.sliderLabel": "Duração da transição",
  "settingsLive.crossfade.off": "Desligada",
  "settingsLive.crossfade.seconds": "{count} s",
  "settingsLive.crossfade.valueText_one": "{count} segundo",
  "settingsLive.crossfade.valueText_other": "{count} segundos",
  "settingsLive.content.label": "Conteúdo",
  "settingsLive.content.title": "O que <em>ouves</em>",
  "settingsLive.hideExplicit.heading": "Esconder faixas explícitas",
  "settingsLive.hideExplicit.body":
    "As faixas marcadas como explícitas saem da tua fila e aparecem esbatidas nas listas. Desliga para as veres de novo de imediato.",
  "settingsLive.askBeforeWarnings.heading":
    "Perguntar antes de faixas com aviso",
  "settingsLive.askBeforeWarnings.body":
    "Paramos antes de uma faixa com aviso de conteúdo e perguntamos primeiro.",
  "settingsLive.claims.label": "Direitos",
  "settingsLive.claims.title": "As tuas <em>reivindicações</em>",
  "settingsLive.claims.heading": "Reivindicações de direitos de autor",
  "settingsLive.claims.body":
    "As reivindicações de direitos de autor que enviaste sobre faixas do Studio, e o que aconteceu a cada uma.",
  "settingsLive.claims.cta": "Abrir as tuas reivindicações",
  "settingsLive.theme.label": "Tema",
  "settingsLive.theme.title": "O aspeto do <em>Studio</em>",
  "settingsLive.theme.dark.heading": "Modo escuro",
  "settingsLive.theme.dark.body":
    "O Studio segue o tema do QueerPulse, por isso uma mudança aqui aplica-se a todo o QueerPulse neste dispositivo.",
  "settingsLive.saveError":
    "Não conseguimos guardar essa definição. Tenta outra vez",
  "settingsLive.pageTitle": "Definições",
  "settingsLive.loadingReason":
    "A carregar a tua definição guardada, por isso este interruptor ainda não muda",
  "settingsLive.device.label": "Este dispositivo",
  "settingsLive.device.title": "O que o Studio <em>recorda</em> aqui",
  "settingsLive.singleKey.heading": "Atalhos de uma só tecla",
  "settingsLive.singleKey.body":
    "Toca, salta, avança e silencia com letras soltas, mais as setas e o Espaço quando nada mais tem o foco. Desliga-os se chocarem com o teu leitor de ecrã ou controlo por voz. Guardado só neste dispositivo.",
  "settingsLive.resume.heading": "Retomar onde ficaste",
  "settingsLive.resume.body":
    "Da próxima vez que abrires o Studio neste dispositivo, a tua fila e a posição estão prontas, em pausa. Fica só neste dispositivo e apaga-se com a Saída rápida, ao terminares sessão ou se perderes o acesso.",

  "hiddenTrack.label": "Escondida pelas tuas definições",
  "contentWarnings.pickerLabel": "Avisos de conteúdo",
  "contentWarnings.pickerHint":
    "Quem ouve vê estes avisos antes de a faixa tocar",
  "contentWarnings.lockedChip": "Adicionado pela nossa equipa",
  "contentWarnings.lockedGroupLabel": "Avisos que a nossa equipa adicionou",
  explicitLocked: "Marcada como explícita pela nossa equipa",
  "track.withheld.title": "Esta faixa não está disponível",
  "track.withheld.body":
    "Não pode ser tocada agora. O resto do Studio continua aqui",
  "album.trackUnavailable": "Indisponível",
  "album.trackUnavailableAria": "A faixa {number} está indisponível",
  "report.trackCta": "Denunciar faixa",
  "player.gate.waiting": "À espera: {title}",
  "player.gate.warning": "Aviso: {themes}",
  "player.gate.play": "Tocar",
  "player.gate.skip": "Saltar faixa",

  "flagReviewLive.eyebrow": "Equipa · revisão do Studio",
  "flagReviewLive.title": "<em>Denúncias</em> e contestações do Studio",
  "flagReviewLive.dek":
    "Denúncias de pessoas da comunidade, contestações de artistas e todos os lançamentos retirados. Quem publicou lê o motivo ou a resposta que escreves aqui.",
  "flagReviewLive.tablistLabel": "Filas de revisão do Studio",
  "flagReviewLive.tabs.reports": "Denúncias",
  "flagReviewLive.tabs.disputes": "Contestações",
  "flagReviewLive.tabs.withdrawn": "Retirados",
  "flagReviewLive.card.byArtist": "de {artist}",
  "flagReviewLive.card.unknownRelease": "Um lançamento do Studio",
  "flagReviewLive.card.filedOn": "Denunciado a {date}",
  "flagReviewLive.card.takedownReason": "Motivo da retirada",
  "flagReviewLive.card.artistNote": "A nota de quem publicou",
  "flagReviewLive.card.disputedOn": "Contestado a {date}",
  "flagReviewLive.card.takenDownOn": "Retirado a {date}",
  "flagReviewLive.card.openDispute": "Contestação à espera",
  "flagReviewLive.card.lookupFailed":
    "Não conseguimos carregar {what}, por isso as ações esperam até carregar.",
  "flagReviewLive.card.reloadRelease": "Recarregar lançamento",
  "flagReviewLive.card.waitingForRelease":
    "Retirar lançamento fica à espera até o lançamento carregar",
  "flagReviewLive.card.dueIn": "Prazo em {span}",
  "flagReviewLive.card.overdueBy": "Prazo ultrapassado há {span}",
  "flagReviewLive.action.takeDown": "Retirar lançamento",
  "flagReviewLive.action.dismiss": "Arquivar denúncia",
  "flagReviewLive.action.openModeration": "Abrir na moderação",
  "flagReviewLive.action.restore": "Repor lançamento",
  "flagReviewLive.action.keepDown": "Manter lançamento retirado",
  "flagReviewLive.dialog.takeDownTitle": "Retirar {title}?",
  "flagReviewLive.dialog.takeDownBody":
    "Deixa de estar disponível para quem ouve de imediato, e todas as denúncias abertas sobre ele ficam resolvidas.",
  "flagReviewLive.dialog.reasonLabel": "Motivo que quem publicou vai ver",
  "flagReviewLive.dialog.dismissTitle": "Arquivar esta denúncia sobre {title}?",
  "flagReviewLive.dialog.dismissBody":
    "O lançamento continua disponível e a denúncia fica resolvida.",
  "flagReviewLive.dialog.restoreTitle": "Repor {title}?",
  "flagReviewLive.dialog.restoreDisputeBody":
    "Volta para quem ouve e quem publicou lê a tua resposta no lançamento.",
  "flagReviewLive.dialog.restoreWithdrawnBody": "Volta para quem ouve.",
  "flagReviewLive.dialog.keepDownTitle": "Manter {title} retirado?",
  "flagReviewLive.dialog.keepDownBody":
    "Continua indisponível e quem publicou lê a tua resposta no lançamento.",
  "flagReviewLive.dialog.replyLabel": "Resposta que quem publicou vai ler",
  "flagReviewLive.dialog.discardQuestion":
    "Descartar a tua nota? Ainda não foi enviada",
  "flagReviewLive.dialog.keepWriting": "Continuar a escrever",
  "flagReviewLive.dialog.discardNote": "Descartar nota",
  "flagReviewLive.toast.takenDown":
    "{title} foi retirado e as denúncias sobre ele estão resolvidas",
  "flagReviewLive.toast.dismissed": "Denúncia arquivada",
  "flagReviewLive.toast.restored": "{title} voltou a estar disponível",
  "flagReviewLive.toast.keptDown":
    "{title} continua retirado e quem publicou já tem a tua resposta",
  "flagReviewLive.toast.actionError": "Isso não ficou feito. Tenta outra vez",
  "flagReviewLive.toast.settledElsewhere":
    "Isto já foi fechado ou já não existe, por isso a fila mostra agora o mais recente",
  "flagReviewLive.empty.reportsTitle": "Sem denúncias abertas",
  "flagReviewLive.empty.reportsBody":
    "As denúncias novas sobre lançamentos do Studio aparecem aqui.",
  "flagReviewLive.empty.disputesTitle": "Sem contestações abertas",
  "flagReviewLive.empty.disputesBody":
    "As contestações de artistas aparecem aqui.",
  "flagReviewLive.empty.withdrawnTitle": "Nada está retirado",
  "flagReviewLive.empty.withdrawnBody":
    "Os lançamentos que a nossa equipa retira aparecem aqui.",
  "flagReviewLive.loadError": "Não conseguimos carregar esta lista",
  "flagReviewLive.loadMore": "Mostrar mais",
  "flagReviewLive.loadingMore": "A carregar mais revisões",
  "flagReviewLive.loadMoreError":
    "Não conseguimos carregar mais. Tenta outra vez",
  "flagReviewLive.tabs.claims": "Reivindicações",
  "flagReviewLive.claims.badge_one": "{count} reivindicação à espera",
  "flagReviewLive.claims.badge_other": "{count} reivindicações à espera",
  "flagReviewLive.claims.emptyTitle": "Nenhuma reivindicação à espera",
  "flagReviewLive.claims.emptyBody":
    "Novas reivindicações e contranotificações aparecem aqui",
  "flagReviewLive.claims.claimantLabel": "Quem fez a reivindicação",
  "flagReviewLive.claims.trackLabel": "Faixa",
  "flagReviewLive.claims.trackLine": "Faixa {number}: {title}",
  "flagReviewLive.claims.accept": "Aceitar reivindicação",
  "flagReviewLive.claims.decline": "Recusar reivindicação",
  "flagReviewLive.claims.uphold": "Manter reivindicação",
  "flagReviewLive.claims.reject": "Rejeitar reivindicação",
  "flagReviewLive.claims.noteLabel": "Nota para as duas partes",
  "flagReviewLive.claims.declineNoteLabel":
    "Nota para quem fez a reivindicação",
  "flagReviewLive.claims.acceptedHeading":
    "Aceites, à espera da pessoa artista",
  "flagReviewLive.claims.acceptedEmptyTitle":
    "Nenhuma reivindicação à espera de uma pessoa artista",
  "flagReviewLive.claims.acceptedEmptyBody":
    "As reivindicações que aceitas esperam aqui pela contranotificação da pessoa artista, e podes mantê-las ou rejeitá-las a qualquer momento",
  "flagReviewLive.claims.availabilityLabel": "Neste momento",
  "flagReviewLive.claims.withheldFact": "Offline para quem ouve",
  "flagReviewLive.claims.dialog.acceptTitle":
    "Aceitar a reivindicação sobre {title}?",
  "flagReviewLive.claims.dialog.acceptBody":
    "A faixa fica offline para quem ouve e a pessoa artista pode enviar uma contranotificação",
  "flagReviewLive.claims.dialog.declineTitle":
    "Recusar a reivindicação sobre {title}?",
  "flagReviewLive.claims.dialog.declineBody":
    "A faixa continua online e quem fez a reivindicação lê a tua nota",
  "flagReviewLive.claims.dialog.upholdTitle":
    "Manter a reivindicação sobre {title}?",
  "flagReviewLive.claims.dialog.upholdBody":
    "A faixa continua offline e as duas partes leem a tua nota",
  "flagReviewLive.claims.dialog.rejectTitle":
    "Rejeitar a reivindicação sobre {title}?",
  "flagReviewLive.claims.dialog.rejectBody":
    "A faixa volta, a não ser que outra reivindicação a retenha, e as duas partes leem a tua nota",
  "flagReviewLive.claims.toast.accepted":
    "{title} está offline enquanto a reivindicação estiver aberta",
  "flagReviewLive.claims.toast.declined": "Reivindicação recusada",
  "flagReviewLive.claims.toast.upheld": "Reivindicação mantida",
  "flagReviewLive.claims.toast.rejected": "Reivindicação rejeitada",
  "flagReviewLive.claims.offlineFor_one": "Offline há {count} dia",
  "flagReviewLive.claims.offlineFor_other": "Offline há {count} dias",
  "flagReviewLive.claims.offlineToday": "Offline desde hoje",
  "flagReviewLive.claims.acceptedOn": "Aceite a {date}",
  "flagReviewLive.claims.counteredOn": "Contranotificação a {date}",
  "flagReviewLive.claims.repliedOn": "Resposta de quem reclamou a {date}",
  "flagReviewLive.trackReports.heading": "Denúncias de faixas",
  "flagReviewLive.trackReports.emptyTitle":
    "Nenhuma denúncia de faixa em aberto",
  "flagReviewLive.trackReports.emptyBody":
    "Novas denúncias sobre faixas aparecem aqui",
  "flagReviewLive.trackReports.unknownTrack": "Uma faixa do Studio",
  "flagReviewLive.trackReports.currentLabel": "Marcações atuais",
  "flagReviewLive.trackReports.markExplicit": "Marcar faixa como explícita",
  "flagReviewLive.trackReports.addWarning": "Adicionar aviso de conteúdo",
  "flagReviewLive.trackReports.dialog.markExplicitTitle":
    "Marcar {title} como explícita?",
  "flagReviewLive.trackReports.dialog.markExplicitBody":
    "A pessoa artista não a pode desmarcar, a denúncia fecha e quem gere a persona recebe um aviso da nossa equipa",
  "flagReviewLive.trackReports.dialog.warningTitle":
    "Adicionar um aviso de conteúdo a {title}",
  "flagReviewLive.trackReports.dialog.warningBody":
    "Quem ouve vê-o antes de a faixa tocar, e a pessoa artista não o pode remover",
  "flagReviewLive.trackReports.dialog.warningConfirm": "Adicionar aviso",
  "flagReviewLive.trackReports.dialog.warningConfirmPending": "A adicionar…",
  "flagReviewLive.trackReports.dialog.dismissBody":
    "A faixa fica como está e a denúncia fecha",
  "flagReviewLive.trackReports.toast.markedExplicit":
    "{title} está marcada como explícita",
  "flagReviewLive.trackReports.toast.warningAdded":
    "Aviso adicionado a {title}",
  "flagReviewLive.documentTitle": "{tab} · Revisão de denúncias",
  "flagReviewLive.disputes.badge_one": "{count} contestação à espera",
  "flagReviewLive.disputes.badge_other": "{count} contestações à espera",
  "flagReviewLive.reports.badge_one": "{count} denúncia em aberto",
  "flagReviewLive.reports.badge_other": "{count} denúncias em aberto",
  "flagReviewLive.reports.badgeMore_one": "{count} ou mais denúncias em aberto",
  "flagReviewLive.reports.badgeMore_other":
    "{count} ou mais denúncias em aberto",
  "flagReviewLive.reports.releaseHeading": "Denúncias de lançamentos",
  "flagReviewLive.severity.emergency": "Emergência",
  "flagReviewLive.severity.high": "Gravidade alta",
  "flagReviewLive.severity.medium": "Gravidade média",
  "flagReviewLive.severity.low": "Gravidade baixa",
  "flagReviewLive.trackReports.reloadTrack": "Recarregar faixa",
  "flagReviewLive.trackReports.waitingForTrack":
    "Estas ações ficam à espera até a faixa carregar",
  "flagReviewLive.trackReports.explicitLockedReason":
    "A nossa equipa já marcou esta faixa como explícita",
  "flagReviewLive.trackReports.everyWarningReason":
    "Esta faixa já tem todos os avisos de conteúdo",
  "flagReviewLive.queue.sortLabel": "Ordenar",
  "flagReviewLive.queue.sortOldest": "Mais antigos primeiro",
  "flagReviewLive.queue.sortNewest": "Mais recentes primeiro",
  "flagReviewLive.queue.sortSeverity": "Mais graves primeiro",
  "flagReviewLive.queue.filterLabel": "Filtrar a fila",
  "flagReviewLive.queue.filterReason": "Filtrar por motivo",
  "flagReviewLive.queue.filterStatus": "Filtrar por estado",
  "flagReviewLive.queue.filterAll": "Todos",
  "flagReviewLive.queue.showing": "A mostrar {shown} de {total}",
  "flagReviewLive.queue.keysHint":
    "Carrega em <key>J</key> e <key>K</key> para passar de cartão em cartão",
  "flagReviewLive.queue.selectReport": "Selecionar a denúncia sobre {title}",
  "flagReviewLive.bulk.selectReports": "Selecionar denúncias",
  "flagReviewLive.bulk.stopSelecting": "Parar de selecionar",
  "flagReviewLive.bulk.dismissAction": "Arquivar denúncias",
  "flagReviewLive.bulk.confirmTitle_one": "Arquivar {count} denúncia?",
  "flagReviewLive.bulk.confirmTitle_other": "Arquivar {count} denúncias?",
  "flagReviewLive.bulk.confirmBody":
    "Cada denúncia fecha, e o lançamento ou a faixa ficam como estão.",
  "flagReviewLive.bulk.confirmAction_one": "Arquivar {count} denúncia",
  "flagReviewLive.bulk.confirmAction_other": "Arquivar {count} denúncias",
  "flagReviewLive.bulk.dismissed_one": "{count} denúncia arquivada",
  "flagReviewLive.bulk.dismissed_other": "{count} denúncias arquivadas",
  "flagReviewLive.bulk.partlyDismissed_one":
    "Arquivámos {done} de {count} denúncia. As restantes continuam selecionadas.",
  "flagReviewLive.bulk.partlyDismissed_other":
    "Arquivámos {done} de {count} denúncias. As restantes continuam selecionadas.",
  "flagReviewLive.bulk.skipped_one":
    "{count} denúncia já tinha saído da fila: {titles}.",
  "flagReviewLive.bulk.skipped_other":
    "{count} denúncias já tinham saído da fila: {titles}.",
  "flagReviewLive.bulk.reportGone":
    "Esta denúncia já foi fechada ou o lançamento já não existe",

  "rail.live.utilityLabel": "Ajuda e informação",
  "rail.live.help": "Ajuda",
  "rail.live.about": "Sobre o Studio",
  "rail.live.rights": "Direitos e retiradas",
  "rail.live.terms": "Termos do Studio",
  "rail.live.accessibility": "Acessibilidade",
  "rail.live.flagReview": "Revisão de denúncias",
  // ── Descoberta no Studio (QUEERPULSE-STUDIO-DISCOVERY-DESIGN-2026-10-13.md) ──
  "mood.lateNight": "Madrugada",
  "mood.euphoric": "Euforia",
  "mood.tender": "Ternura",
  "mood.melancholy": "Melancolia",
  "mood.defiant": "Desafio",
  "mood.dreamy": "Sonho",
  "mood.slowBurn": "Lume brando",
  "mood.calm": "Calma",
  "home.moods.heading": "Explorar por <em>ambiente</em>",
  "home.moods.listLabel": "Ambientes",
  "home.hero.featuredEyebrow": "Em destaque",
  "home.hero.loadingLabel": "A carregar o início do Studio",
  "home.staffPicks.title": "Escolhas da <em>equipa</em>",
  "home.newThisWeek.title": "Novidades da <em>semana</em>",
  "home.artistOfTheMonth.title": "Artista do <em>mês</em>",
  "home.artistOfTheMonth.play": "Ouvir {release}",
  "home.artistOfTheMonth.openArtist": "Abrir {artist}",
  "home.artistOfTheMonth.noteLabel": "Da equipa do Studio",
  "home.newStars.title": "Novas <em>estrelas</em>",
  "home.scenes.title": "Cenas <em>locais</em>",
  "curation.noteLabel": "Nota da equipa do Studio:",
  "browse.titleMood": "Ambiente: <em>{mood}</em>",
  "browse.titleBoth": "{genre} com ambiente <em>{mood}</em>",
  "browse.gridLabelMood": "Lançamentos com ambiente {mood}",
  "browse.gridLabelBoth": "Lançamentos de {genre} com ambiente {mood}",
  "browse.empty.titleMood": "Ainda não há nada com o ambiente {mood}",
  "browse.empty.titleBoth":
    "Ainda não há nada de {genre} com o ambiente {mood}",
  "browse.anyGenre": "Qualquer género",
  "browse.anyMood": "Qualquer ambiente",
  "radio.playCta": "Ouvir a rádio {name}",
  "radio.error": "Não foi possível ligar a rádio. Tenta outra vez",
  "radio.empty": "Esta rádio ainda não tem nada para tocar",
  "radio.playerLabel": "Rádio · {name}",
  "scene.eyebrow": "Cena · {city}",
  "scene.playCta": "Ouvir a cena",
  "scene.releases.title": "<em>Lançamentos</em>",
  "scene.releases.gridLabel": "Lançamentos de {name}",
  "scene.empty.title": "Ainda não há lançamentos nesta cena",
  "scene.empty.body":
    "Quem cria junta um lançamento a uma cena quando o carrega",
  "scene.artists.title": "<em>Artistas</em> desta cena",
  "scene.events.title": "Próximos <em>eventos</em>",
  "scene.events.online": "Online",
  "scene.notFound.title": "Não encontramos essa cena",
  "scene.notFound.body":
    "Pode ter sido arquivada, ou o link pode estar desatualizado",
  "searchPage.moodLabel": "Ambiente",
  "searchPage.moodAny": "Qualquer ambiente",
  "credits.nav": "Créditos",
  "credits.badge_one": "{count} pedido de crédito à espera",
  "credits.badge_other": "{count} pedidos de crédito à espera",
  "credits.role.featured": "Participação",
  "credits.role.producer": "Produção",
  "credits.role.coWriter": "Coautoria",
  "credits.role.mixing": "Mistura",
  "credits.role.mastering": "Masterização",
  "credits.role.remix": "Remistura",
  "credits.role.coverArt": "Capa",
  "credits.role.other": "Outro papel",
  "credits.status.pending": "Pendente",
  "credits.status.accepted": "Aceite",
  "credits.status.declined": "Recusado",
  "credits.removeCta": "Remover crédito",
  "credits.editor.heading": "Creditar uma persona",
  "credits.editor.hint":
    "Escreve o nome de utilizador exato de uma persona pública. Nada aparece na faixa até ela aceitar",
  "credits.editor.handleLabel": "Nome de utilizador da persona",
  "credits.editor.findCta": "Procurar persona",
  "credits.editor.finding": "À procura dessa persona",
  "credits.editor.notFound":
    "Nenhuma persona pública tem esse nome de utilizador",
  "credits.editor.roleLabel": "Papel",
  "credits.editor.addCta": "Creditar {name}",
  "credits.editor.clearCta": "Limpar persona",
  "credits.editor.listLabel": "Personas creditadas nesta faixa",
  "credits.editor.removeAria": "Remover crédito de {name} ({role})",
  "credits.editor.notPublic":
    "Esta persona deixou de ser pública, por isso o crédito fica escondido",
  "credits.editor.limit": "Uma faixa leva até {limit} personas creditadas",
  "credits.editor.added": "Crédito enviado a {name}",
  "credits.editor.removed": "Crédito removido",
  "credits.editor.handleLine": "@{handle}",
  "credits.page.eyebrow": "Créditos",
  "credits.page.title": "Os teus <em>créditos</em>",
  "credits.page.sub":
    "As tuas personas, creditadas em faixas de outras pessoas. Um crédito só fica público depois de o aceitares",
  "credits.inbox.requests.title": "<em>Pedidos</em>",
  "credits.inbox.accepted.title": "<em>Aceites</em>",
  "credits.inbox.requestLine":
    "{requester} creditou {persona} em {track} ({role})",
  "credits.inbox.acceptedLine":
    "{requester} credita {persona} em {track} ({role})",
  "credits.inbox.releaseLine": "De {release}",
  "credits.inbox.acceptCta": "Aceitar crédito",
  "credits.inbox.declineCta": "Recusar crédito",
  "credits.inbox.acceptAria": "Aceitar crédito de {persona} em {track}",
  "credits.inbox.declineAria": "Recusar crédito de {persona} em {track}",
  "credits.inbox.removeAria": "Remover crédito de {persona} em {track}",
  "credits.inbox.confirmRemove.title": "Remover este crédito?",
  "credits.inbox.confirmRemove.body": "{persona} deixa de aparecer em {track}",
  "credits.inbox.empty.title": "Não há pedidos de crédito por agora",
  "credits.inbox.empty.body":
    "Quando alguém credita uma das tuas personas numa faixa, o pedido aparece aqui",
  "credits.inbox.toast.accepted": "Crédito aceite",
  "credits.inbox.toast.declined": "Crédito recusado",
  "credits.inbox.toast.removed": "Crédito removido",
  "credits.inbox.gone": "Esse pedido de crédito já não está aberto",
  "credits.inbox.removeGone": "Esse crédito já tinha sido removido",
  "credits.public.listLabel": "Personas creditadas",
  "credits.album.title": "<em>Créditos</em>",
  "artist.appearsOn.title": "Também <em>em</em>",
  "artist.related.title": "Artistas <em>afins</em>",
  "uploadFlow.release.moodLabel": "Ambiente",
  "uploadFlow.release.moodNone": "Sem ambiente",
  "uploadFlow.release.sceneLabel": "Cena",
  "uploadFlow.release.sceneNone": "Sem cena",
  "uploadFlow.release.sceneHint": "Junta este lançamento à página de uma cena",
  "uploadFlow.release.sceneOption": "{name}, {city}",
  "uploadFlow.release.sceneArchived": "Cena atual, agora arquivada",
  "uploadFlow.release.sceneLoading": "A carregar as cenas",
  "uploadFlow.release.sceneUnavailable": "As cenas não carregaram",
  "errors.radioFilterRequired": "Escolhe um género ou um ambiente para a rádio",
  "errors.sceneNotFound": "Essa cena não está no Studio",
  "errors.creditNotFound": "Esse crédito já não existe",
  "errors.curationShelfFull":
    "Esta prateleira leva 12 escolhas. Remove uma primeiro",
  "errors.curationAlreadyOnShelf": "Esse lançamento já está nesta prateleira",
  "errors.curationOrderMismatch":
    "A prateleira mudou enquanto mudavas a ordem. Recarrega e tenta outra vez",
  "errors.spotlightNotAnArtist":
    "Aqui só pode entrar uma persona artística pública do Studio",
  "errors.spotlightNoRelease":
    "Esta persona ainda não publicou nenhum lançamento",
  "errors.spotlightSlotFull":
    "As Novas estrelas levam 12 artistas. Remove alguém primeiro",
  "errors.spotlightAlreadyInSlot": "Essa persona já está nas Novas estrelas",
  "errors.spotlightOrderMismatch":
    "Alguém mudou esta lista. Recarrega-a e tenta outra vez",
  "errors.spotlightNotFound": "Essa persona já saiu do destaque",
  "errors.sceneSlugTaken": "Outra cena já usa esse endereço",
  "errors.sceneOrderMismatch":
    "As cenas mudaram enquanto mudavas a ordem. Recarrega e tenta outra vez",
  "errors.creditAlreadyRequested":
    "Esta persona já tem esse crédito nesta faixa",
  "errors.creditNotAccepted": "Aqui só podes remover um crédito aceite",
  "errors.sceneCoverChanged":
    "Alguém mudou a capa desta cena antes de ti. Recarrega a cena e escolhe a capa outra vez.",
  "errors.sceneNotAvailable": "Essa cena não pode ser escolhida agora",
  "errors.curationReleaseNotPublished":
    "Só um lançamento publicado pode ir para uma prateleira",
  "errors.sceneEventNotPinnable":
    "Só se pode fixar um evento futuro aberto a todas as pessoas",
  "errors.creditPersonaNotCreditable": "Essa persona não pode ser creditada",
  "errors.creditSelfPersona": "Essa é a persona deste lançamento",
  // ── Studio v3 artist tools (2026-10-13) ──────────────────────────────────────
  "releaseStatus.scheduled": "Agendado",
  "errors.releaseNotSchedulable":
    "Só um rascunho ou um lançamento agendado pode ser agendado",
  "errors.releaseNeedsPlayableTrack":
    "Um lançamento publicado fica sempre com pelo menos uma faixa com áudio. Junta outra antes de tirares esta",
  "errors.releaseNoChanges":
    "Não há nenhuma mudança nas faixas para anotar desde a última versão",
  "errors.previewNotAvailable":
    "Os links de pré-escuta são para rascunhos e lançamentos agendados",
  "errors.previewNotFound":
    "Não encontramos essa pré-escuta. O link pode ter sido desligado",
  "errors.scheduleOutOfRange":
    "Escolhe uma hora entre daqui a 15 minutos e daqui a 365 dias",
  "errors.pressTrackNotAllowed":
    "Uma dessas faixas não está nos lançamentos desta persona",
  "schedule.choice.legend": "Quando deve ficar disponível?",
  "schedule.choice.now": "Publicar agora",
  "schedule.choice.nowHint":
    "Fica disponível assim que carregares em Publicar lançamento",
  "schedule.choice.schedule": "Agendar lançamento",
  "schedule.choice.scheduleHint":
    "Escolhe a data e a hora, e fica disponível nessa altura",
  "schedule.form.dateLabel": "Data",
  "schedule.form.timeLabel": "Hora",
  "schedule.form.zoneHint": "No teu fuso horário ({zone})",
  "schedule.form.readback": "Fica disponível a {date} às {time}",
  "schedule.form.incomplete": "Escolhe uma data e uma hora",
  "schedule.form.tooSoon": "Escolhe uma hora daqui a pelo menos 15 minutos",
  "schedule.form.tooFar": "Escolhe uma data nos próximos 365 dias",
  "schedule.form.scheduleCta": "Agendar lançamento",
  "schedule.form.saveDateCta": "Guardar a nova data",
  "schedule.form.keepDateCta": "Manter a data atual",
  "schedule.form.scheduling": "A agendar",
  "schedule.panel.heading": "Agendado para <em>{date}</em> às {time}",
  "schedule.panel.body":
    "Fica disponível sozinho nesse dia. Quem carregou em Avisa-me recebe o alerta nessa altura",
  "schedule.panel.changeDateCta": "Mudar a data",
  "schedule.panel.cancelCta": "Cancelar o agendamento",
  "schedule.panel.cancelling": "A cancelar",
  "schedule.panel.dateChanged": "Nova data guardada",
  "upcoming.outOn": "Sai a {date} às {time}",
  "upcoming.tracksOut_one": "{count} faixa, sai a {date}",
  "upcoming.tracksOut_other": "{count} faixas, saem a {date}",
  "upcoming.notifyMe": "Avisa-me",
  "upcoming.notifyMeSet": "Avisamos-te",
  "upcoming.notifyMeAria": "Avisa-me quando {title} sair",
  "upcoming.notifyMeOffStatus": "Lembrete de {title} desligado",
  "upcoming.notifyMeError": "Não conseguimos guardar isso. Tenta outra vez",
  "upcoming.cardHeading": "Em breve",
  "upcoming.notifyMeGone": "Este lançamento já não está disponível",
  "versions.line": "Versão {version} · {date}",
  "versions.earlierCta": "Versões anteriores",
  "versions.blockLabel": "O que mudou neste lançamento",
  "versions.panel.heading": "Mudaste as faixas",
  "versions.panel.body":
    "Junta uma nota de versão para quem ouve saber o que há de novo. Aparece na página do lançamento como versão {version}",
  "versions.panel.noteLabel": "Nota de versão",
  "versions.panel.notePlaceholder": "O que mudou, numa ou duas linhas",
  "versions.panel.noteCount": "{count} de {max}",
  "versions.panel.noteRequired": "Escreve primeiro o que mudou",
  "versions.panel.saveCta": "Guardar nota de versão",
  "versions.panel.saving": "A guardar",
  "versions.panel.savedStatus":
    "Nota de versão guardada. Quem segue não recebe um segundo alerta",
  "previewLink.heading": "Link privado de pré-escuta",
  "previewLink.offBody":
    "Partilha este lançamento antes de sair. Só quem tem acesso ao Studio pode abrir o link",
  "previewLink.onBody":
    "Quem tiver acesso ao Studio e este link pode ouvir até o lançamento sair. Depois disso, o link abre a página do lançamento",
  "previewLink.makeCta": "Criar link de pré-escuta",
  "previewLink.fieldLabel": "Link de pré-escuta",
  "previewLink.copyCta": "Copiar link",
  "previewLink.copied": "Copiado",
  "previewLink.copiedToast": "Link de pré-escuta copiado",
  "previewLink.copyFailedToast":
    "Não conseguimos copiar o link. Seleciona-o e copia-o tu",
  "previewLink.made": "Criado {time}",
  "previewLink.newCta": "Criar um link novo",
  "previewLink.newTitle": "Criar um link de pré-escuta novo?",
  "previewLink.newBody": "O link antigo deixa de funcionar",
  "previewLink.turnOffCta": "Desligar o link",
  "previewLink.madeStatus": "Link de pré-escuta criado",
  "previewLink.replacedStatus":
    "Link novo criado. O antigo deixou de funcionar",
  "previewLink.turnedOffStatus": "Link de pré-escuta desligado",
  "previewLink.dialogTitle": "Link de pré-escuta de {title}",
  "previewPage.banner":
    "Pré-escuta privada de {persona}. Guarda este link só para ti",
  "support.artistHeading": "Apoiar {name}",
  "support.releaseHeading": "Comprar e apoiar {name}",
  "support.listLabel": "Onde apoiar {name}",
  "support.note":
    "Estes links abrem as páginas de {name} e a QueerPulse nunca mexe em dinheiro",
  "support.ownerEmpty":
    "Junta o Bandcamp, o Ko-fi ou o Patreon aos links da tua persona",
  "support.ownerEmptyCta": "Editar os links da persona",
  "support.buyOnBandcamp": "Comprar no Bandcamp",
  "support.buyRelease": "Comprar este lançamento",
  "support.opensInNewTab": "(abre num separador novo)",
  "pressKit.eyebrow": "Kit de imprensa",
  "pressKit.section.bestTracks": "As melhores <em>faixas</em>",
  "pressKit.bestTracksLabel": "As melhores faixas de {name}",
  "pressKit.fallbackNote": "Dos lançamentos mais recentes",
  "pressKit.copyBioCta": "Copiar a biografia",
  "pressKit.bioCopiedToast": "Biografia copiada",
  "pressKit.noBio": "Ainda sem biografia",
  "pressKit.section.releases": "Últimos <em>lançamentos</em>",
  "pressKit.section.links": "Links e <em>apoio</em>",
  "pressKit.linksLabel": "{name} noutros sítios",
  "pressKit.section.contact": "<em>Contacto</em>",
  "pressKit.noContact": "Ainda sem contacto de imprensa",
  "pressKit.editCta": "Editar o kit de imprensa",
  "pressKit.ownerEmptySection":
    "Publica um lançamento para preencher esta secção",
  "pressEdit.eyebrow": "Kit de imprensa",
  "pressEdit.title": "O teu <em>kit de imprensa</em>",
  "pressEdit.dek":
    "O que quem tem acesso ao Studio vê na tua página de imprensa, e o que a folha de apresentação imprime",
  "pressEdit.personaLabel": "Persona",
  "pressEdit.heading": "Kit de imprensa de <em>{name}</em>",
  "pressEdit.sub": "Tudo aqui é opcional. As partes vazias vêm da persona",
  "pressEdit.pitchLabel": "Frase de apresentação",
  "pressEdit.count": "{count} de {max}",
  "pressEdit.pitchTooLong": "Mantém a frase em 140 caracteres",
  "pressEdit.bioLabel": "Biografia para imprensa",
  "pressEdit.bioHint":
    "Aparece no kit de imprensa quando preenchida. Vazia, usa a biografia da persona",
  "pressEdit.bioTooLong": "Mantém a biografia em 1500 caracteres",
  "pressEdit.tracksLegend": "As melhores faixas",
  "pressEdit.tracksHint": "Até {max}, pela ordem que escolheres",
  "pressEdit.tracksFallbackHint":
    "Sem nenhuma escolhida, o kit mostra até 5 faixas dos teus lançamentos mais recentes",
  "pressEdit.trackUnavailable": "Já não está disponível",
  "pressEdit.addTrackLabel": "Juntar uma faixa",
  "pressEdit.addTrackPlaceholder": "Escolhe uma faixa",
  "pressEdit.moveUp": "Subir {title}",
  "pressEdit.moveDown": "Descer {title}",
  "pressEdit.removeTrack": "Tirar {title} das melhores faixas",
  "pressEdit.removeUnavailableTrack": "Remover a faixa indisponível {number}",
  "pressEdit.tracksLoadErrorTitle": "As tuas faixas não carregaram",
  "pressEdit.quotesLegend": "Citações",
  "pressEdit.quoteLabel": "Citação",
  "pressEdit.sourceLabel": "Fonte",
  "pressEdit.addQuoteCta": "Juntar citação",
  "pressEdit.removeQuoteCta": "Tirar a citação {number}",
  "pressEdit.quoteRequired": "Escreve a citação, ou tira esta",
  "pressEdit.quoteTooLong": "Mantém a citação em 300 caracteres",
  "pressEdit.quoteSourceRequired": "Diz de onde é a citação",
  "pressEdit.quoteSourceTooLong": "Mantém a fonte em 80 caracteres",
  "pressEdit.contactLabel": "Contacto",
  "pressEdit.contactHint":
    "Uma página começada por https:// ou um endereço começado por mailto:",
  "pressEdit.contactInvalid":
    "Usa um link começado por https:// ou um endereço começado por mailto:",
  "pressEdit.saveCta": "Guardar o kit de imprensa",
  "pressEdit.saving": "A guardar",
  "pressEdit.savedStatus": "Kit de imprensa guardado",
  "pressEdit.viewCta": "Ver o kit de imprensa",
  "pressEdit.moveUpTooltip": "Subir",
  "pressEdit.moveDownTooltip": "Descer",
  "pressEdit.removeTooltip": "Tirar",
  "oneSheet.downloadCta": "Descarregar a folha de apresentação",
  "oneSheet.backCta": "Voltar ao kit de imprensa",
  "oneSheet.saveHint": "Na janela de impressão, escolhe Guardar como PDF",
  "oneSheet.fileTitle": "{name}, folha de apresentação",
  "oneSheet.label": "Folha de apresentação de {name}",
  "oneSheet.bio": "Biografia",
  "oneSheet.bestTracks": "As melhores faixas",
  "oneSheet.releases": "Últimos lançamentos",
  "oneSheet.contact": "Contacto",
  "oneSheet.links": "Links",
  "oneSheet.qrLabel": "Código QR da página da persona {name}",
  "owner.v3.previewLink": "Link de pré-escuta",
  "owner.v3.previewLinkAria": "Link de pré-escuta de {title}",
  "owner.v3.toolsHeading": "Kit de imprensa e novidades",
  "owner.v3.pressKit": "Kit de imprensa",
  "owner.v3.editPressKit": "Editar o kit de imprensa",
  "owner.v3.postUpdateHeading": "Publicar uma novidade",
  "uploadFlow.v3.buyUrlLabel": "Link de compra",
  "uploadFlow.v3.buyUrlHint": "Bandcamp ou a tua própria loja. Opcional",
  "uploadFlow.v3.buyUrlHttpsOnly": "Usa um link completo começado por https://",
  "uploadFlow.v3.buyUrlTooLong": "Mantém o link em 1000 caracteres",
  "uploadFlow.v3.removePublishedTitle": "Tirar {title} de {release}?",
  "uploadFlow.v3.removePublishedBody":
    "Quem a guardou vai vê-la como já não disponível e ela sai de todas as playlists onde está",
  "uploadFlow.v3.removePublishedConfirm": "Tirar faixa",
  "numbers.reminders": "À espera: {value}",
  // Dashboard Part 1 (2026-10-26)
  "numbers.growth.title": "Pessoas novas que continuam a seguir",
  "numbers.growth.sub": "Por semana, nas últimas 12 semanas",
  "numbers.growth.ariaLabel":
    "Pessoas novas que continuam a seguir, por semana nas últimas 12 semanas",
  "numbers.growth.thisWeek": "Esta semana",
  "numbers.growth.weekOf": "Semana de {date}",
  "numbers.growth.tableCaption":
    "Pessoas novas que continuam a seguir, por semana",
  "numbers.growth.weekColumn": "Semana",
  "numbers.growth.countColumn": "Pessoas novas",
  "numbers.growth.empty":
    "Ninguém novo começou a seguir nas últimas 12 semanas",
  "numbers.chart.showTable": "Mostrar tabela de dados",
  "numbers.chart.hideTable": "Esconder tabela de dados",
  "numbers.health.heading": "Lista de verificação dos lançamentos",
  "numbers.health.progress": "{done} de {total} feitos",
  "numbers.health.showChecklist": "Mostrar a lista de {title}",
  "numbers.health.hideChecklist": "Esconder a lista de {title}",
  "numbers.health.optional": "Opcional",
  "numbers.health.showMore_one": "Mostrar mais {count} lançamento",
  "numbers.health.showMore_other": "Mostrar mais {count} lançamentos",
  "numbers.health.showFewer": "Mostrar menos lançamentos",
  "numbers.health.todo.cover": "Adiciona uma capa",
  "numbers.health.todo.description": "Escreve uma descrição",
  "numbers.health.todo.genreAndMood": "Escolhe um género e um ambiente",
  "numbers.health.todo.creditsOnEveryTrack": "Junta créditos a todas as faixas",
  "numbers.health.todo.lyrics": "Junta letra a todas as faixas",
  "numbers.health.todo.buyLink": "Adiciona um link de compra",
  "numbers.health.todo.versionNote":
    "Escreve uma nota de versão para as mudanças nas faixas",
  "numbers.health.done.cover": "Capa adicionada",
  "numbers.health.done.description": "Descrição escrita",
  "numbers.health.done.genreAndMood": "Género e ambiente escolhidos",
  "numbers.health.done.creditsOnEveryTrack": "Todas as faixas têm créditos",
  "numbers.health.done.lyrics": "Todas as faixas têm letra",
  "numbers.health.done.buyLink": "Link de compra adicionado",
  "numbers.health.done.versionNote": "Nota de versão escrita",
  "numbers.nextRelease.heading": "Próximo lançamento",
  "numbers.nextRelease.in": "{title} sai daqui a {time}",
  "numbers.nextRelease.daysAndHours": "{days} e {hours}",
  "numbers.nextRelease.underAnHour": "{title} sai daqui a menos de uma hora",
  "numbers.nextRelease.now": "{title} está a sair agora",
  "numbers.nextRelease.openCta": "Abrir a página do lançamento",
  "numbers.placements.heading": "Onde a tua música vive",
  "numbers.placements.dek":
    "Playlists públicas com as tuas faixas, as mais recentes primeiro",
  "numbers.placements.yourTracks": "As tuas faixas aqui: {titles}",
  "numbers.placements.moreTracks_one": "mais {count} faixa",
  "numbers.placements.moreTracks_other": "mais {count} faixas",
  "numbers.placements.lastAdded": "Última adição a {date}",
  "numbers.placements.empty":
    "Quando alguém junta uma faixa tua a uma playlist pública, ela aparece aqui",
  "numbers.placements.showMore": "Mostrar mais playlists",
  "numbers.milestones.heading": "Marcos",
  "numbers.milestones.dek":
    "Momentos para partilhar. Um marco fica depois de alcançado",
  "numbers.milestones.new": "Novo",
  "numbers.milestones.reachedOn": "Alcançado a {date}",
  "numbers.milestones.shareCta": "Partilhar marco",
  "numbers.milestones.empty":
    "O teu primeiro marco chega com 10 pessoas a seguir",
  "numbers.milestones.showAll": "Mostrar todos os marcos",
  "numbers.milestones.showFewer": "Mostrar menos marcos",
  "share.milestone.followers": "{persona} passou das {value} pessoas a seguir",
  "share.milestone.firstPlacement":
    "{persona} entrou numa playlist pública pela primeira vez",
  "share.milestone.trackPlays": "{track} passou das {value} audições",
  "share.milestone.artistPlays": "{persona} passou das {value} audições",
  "share.milestone.dialogTitle": "Partilhar marco",
  "share.milestone.dialogSub":
    "O cartão mostra este marco a quem tem acesso ao Studio",
  "share.milestone.optionsLabel": "Formas de partilhar este marco",
  "errors.reason.studio_milestone_not_found":
    "Este marco não está disponível para ti",
  "errors.what.placements": "onde a tua música vive",
  "errors.what.milestones": "os teus marcos",
  // Dashboard Part 2: listening (2026-10-27)
  "shell.menu.yourListening": "O que ouves",
  "listening.pageTitle": "O que ouves",
  "listening.eyebrow": "Só tu vês esta página",
  "listening.title": "O que <em>ouves</em>",
  "listening.dek":
    "Os teus artistas e faixas de topo, o que ouviste ultimamente e quem vê o teu nome. Pausa ou limpa quando quiseres",
  "listening.controls.heading": "Definições do teu histórico",
  "listening.history.heading": "Histórico de audição",
  "listening.history.body":
    "Guarda uma lista privada do que ouves, para veres os teus artistas e faixas de topo. Em pausa, as audições continuam a contar para os totais de quem fez a música, sem o teu nome",
  "listening.clearCta": "Limpar histórico de audição",
  "listening.clear.title": "Limpar histórico de audição",
  "listening.clear.body":
    "Isto apaga todas as audições do teu histórico e a lista do que ouviste recentemente neste dispositivo. Os totais de quem fez a música ficam como estão",
  "listening.clear.confirm": "Limpar histórico de audição",
  "listening.clear.done": "O teu histórico de audição foi limpo",
  "listening.clear.failed": "Não conseguimos limpar o teu histórico de audição",
  "listening.paused.body":
    "O histórico está em pausa. As novas audições ficam fora do teu histórico até o voltares a ligar",
  "listening.paused.resumeCta": "Voltar a ligar o histórico",
  "listening.range.label": "Período",
  "listening.range.4w": "4 semanas",
  "listening.range.6m": "6 meses",
  "listening.range.12m": "12 meses",
  "listening.listens_one": "{count} audição",
  "listening.listens_other": "{count} audições",
  "listening.days_one": "{count} dia com música",
  "listening.days_other": "{count} dias com música",
  "listening.topArtists.heading": "Artistas de topo",
  "listening.topTracks.heading": "Faixas de topo",
  "listening.top.empty":
    "Ainda nada neste período. Ouve alguma coisa e aparece aqui",
  "listening.top.pausedEmpty":
    "O teu histórico está em pausa, por isso as novas audições ficam fora desta lista",
  "listening.recent.heading": "Ouvido ultimamente",
  "listening.recent.playedOn": "Ouvida a {date}",
  "listening.recent.unavailable": "Esta faixa já não está disponível",
  "listening.recent.showMore": "Mostrar mais do teu histórico",
  "listening.recent.empty":
    "Ouve uma faixa durante 30 segundos e ela aparece aqui",
  "listening.recent.pausedEmpty":
    "O teu histórico está em pausa, por isso as novas audições ficam fora desta lista",
  "listening.empty.title": "O que ouves começa aqui",
  "listening.empty.body":
    "Ouve uma faixa durante 30 segundos e os teus artistas e faixas de topo começam a aparecer. Só tu vês esta página",
  "listening.empty.cta": "Abrir o início do Studio",
  "listening.empty.pausedBody":
    "O teu histórico de audição está em pausa. Volta a ligá-lo e os teus artistas e faixas de topo começam a aparecer",
  "listening.supporting.heading": "Artistas que veem o teu nome",
  "listening.supporting.dek":
    "Veem-te entre quem mais os ouve, com o nome que escolheste",
  "listening.supporting.since": "Apareces desde {date}",
  "listening.supporting.shownAs": "Apareces como {name}",
  "listening.supporting.linksLabel": "Formas de apoiar {name}",
  "listening.supporting.empty":
    "Liga Mostrar-me entre quem mais ouve numa página de artista para a juntares aqui",
  "listening.supporting.stop": "Deixar de mostrar o meu nome",
  "listening.supporting.stopAria": "Deixar de mostrar o teu nome a {artist}",
  "listening.supporting.pausedNote":
    "Enquanto o teu histórico estiver em pausa, não apareces entre quem mais os ouve",
  "listening.notice.body":
    "O teu histórico de audição está ligado. Só tu o vês",
  "listening.notice.cta": "Ver o que ouves",
  "listening.notice.close": "Fechar aviso",
  "settingsLive.history.label": "O que ouves",
  "settingsLive.history.title": "O que o Studio <em>guarda</em> para ti",
  "supporter.heading": "Mostrar-me entre quem mais ouve {persona}",
  "supporter.body":
    "{persona} vê o nome e a foto que escolheres entre quem mais ouve a sua música, pelo quanto a ouviste nos últimos 28 dias",
  "supporter.pausedNote":
    "Enquanto o teu histórico estiver em pausa, não apareces entre quem mais ouve a sua música",
  "supporter.pickerLegend": "Como {persona} te vê",
  "supporter.account": "A tua conta",
  "supporter.saveCta": "Guardar como apareces",
  "supporter.closeCta": "Fechar sem guardar",
  "supporter.changeCta": "Mudar como apareces",
  "supporter.confirmation": "{persona} vê-te como {name}",
  "supporter.confirmationLead": "É assim que {persona} te vê",
  "supporter.removed":
    "{persona} deixou de te ver entre quem mais ouve a sua música",
  "supporter.saveFailed": "Não conseguimos guardar como apareces",
  "supporter.removeFailed":
    "Não conseguimos desligar Mostrar-me entre quem mais ouve",
  "numbers.column.plays": "Audições",
  "numbers.plays.showsNotCounted": "Não contam nos programas",
  "numbers.plays.title": "Audições",
  "numbers.plays.sub": "Por dia, nos últimos 28 dias",
  "numbers.plays.ariaLabel": "Audições por dia nos últimos 28 dias",
  "numbers.plays.today": "Hoje",
  "numbers.plays.tableCaption": "Audições por dia",
  "numbers.plays.dayColumn": "Dia",
  "numbers.plays.countColumn": "Audições",
  "numbers.plays.totals": "Desde sempre: {total} · Últimos 28 dias: {recent}",
  "numbers.plays.note":
    "Uma audição conta depois de 30 segundos. As audições tuas e de quem gere a persona contigo nunca contam",
  "numbers.plays.empty": "Ainda sem audições nos últimos 28 dias",
  "numbers.supporters.heading": "Quem mais te ouve",
  "numbers.supporters.dek":
    "Pessoas que escolheram aparecer, por ordem das audições nos últimos 28 dias",
  "numbers.supporters.optedIn": "A aparecer entre quem mais te ouve: {value}",
  "numbers.supporters.empty":
    "Quando alguém liga Mostrar-me entre quem mais ouve, aparece aqui",
  "numbers.supporters.listLabel": "Quem mais ouve {name}",
  "errors.reason.studio_supporter_artist_not_found":
    "Esta página de artista não está disponível para mostrares o teu nome",
  "errors.reason.studio_supporter_own_persona":
    "Fazes parte desta persona de artista, por isso não podes aparecer entre quem mais a ouve",
  "errors.reason.studio_supporter_identity_not_yours":
    "Só podes aparecer com a tua conta ou com uma persona de que fazes parte",
  "errors.what.listening": "o que ouves",
  "errors.what.listeningHistory": "o teu histórico de audição",
  "errors.what.supporting": "quem vê o teu nome",
  "errors.what.supporter": "a tua definição de quem mais ouve",
  "errors.what.plays": "as tuas audições",
  "errors.what.topSupporters": "quem mais te ouve",
  "rail.v3.pressKit": "Kit de imprensa",
  "creator.nav.pressKit": "Kit de imprensa",
  "artistPage.v3.moreAria": "Mais sobre {name}",
  "artistPage.v3.pressKit": "Kit de imprensa",
  "artistPage.followerCountGrouped_one": "{number} pessoa segue",
  "artistPage.followerCountGrouped_other": "{number} pessoas seguem",
  "artistPage.pauseAll": "Pausar a música de {name}",
  "artistPage.editPage.button": "Editar página no Studio",
  "artistPage.viewAsVisitor": "Ver como visitante",
  "artistPage.visitorPreview.banner":
    "Estás a ver a tua página do Studio como um <strong>visitante</strong> a vê.",
  "artistPage.visitorPreview.exit": "Sair da pré-visualização",
  "artistPage.editPage.title": "Edita a tua página no Studio",
  "artistPage.editPage.intro":
    "Escolhe o que aparece no topo da tua página. A página por trás deste painel mostra cada opção à medida que escolhes",
  "artistPage.editPage.choicesLabel": "O que aparece no topo da tua página",
  "artistPage.editPage.choice.banner.title": "Banner",
  "artistPage.editPage.choice.banner.effect":
    "A tua foto de capa ocupa o topo, com o teu nome por cima",
  "artistPage.editPage.choice.portrait.title": "Avatar",
  "artistPage.editPage.choice.portrait.effect":
    "O teu avatar redondo fica no topo, ao lado do teu nome",
  "artistPage.editPage.choice.both.title": "Banner e avatar",
  "artistPage.editPage.choice.both.effect":
    "A tua foto de capa ocupa o topo, com o teu avatar redondo por cima",
  "artistPage.editPage.needsCover": "Precisa de uma foto de capa",
  "artistPage.editPage.noCover":
    "Um banner precisa de uma foto de capa. <a>Adiciona uma no editor da persona</a>",
  "artistPage.editPage.save": "Guardar",
  "artistPage.editPage.saving": "A guardar",
  "artistPage.editPage.cancel": "Cancelar",
  "artistPage.editPage.close": "Fechar",
  "artistPage.editPage.error.invalidChoice":
    "O servidor não aceitou esta opção. Recarrega a página e escolhe de novo",
  "artistPage.editPage.error.signedOut":
    "A tua sessão terminou. Entra de novo para guardares a tua escolha",
  "artistPage.editPage.error.notAllowed":
    "Não podes editar esta persona. Só quem a gere pode mudar a página dela no Studio",
  "artistPage.editPage.error.personaMissing":
    "Esta persona foi apagada ou já não a geres",
  "artistPage.editPage.error.editConflict":
    "Outra pessoa guardou esta persona ao mesmo tempo. Guarda de novo para aplicares a tua escolha",
  "artistPage.editPage.error.tooMany":
    "Demasiadas gravações em pouco tempo. Espera um minuto e guarda de novo",
  "artistPage.editPage.error.serverDown":
    "O nosso servidor está com problemas agora e a tua escolha não foi guardada. Tenta de novo daqui a pouco",
  "artistPage.editPage.error.network":
    "A ligação caiu antes de a tua escolha nos chegar. Confirma que estás online e guarda de novo",
  "artistPage.editPage.error.unexpected":
    "O servidor recusou a gravação com o erro {status}. Tenta de novo ou recarrega a página",
  "artistPage.editPage.error.unexpectedNoStatus":
    "Esta página teve um erro dela antes de a tua escolha nos chegar. Tenta de novo ou recarrega a página",
  // ── Studio Listening (2026-10-13): player, Now playing, queue, track
  // menu, chapters, lyric timing and the upload loudness check. Plan 3
  // Task 0 writes every key; Plan 2's code reads only the shortcuts and
  // chapters.error.outOfRange keys (contract section D). ────────────────
  // Player shortcuts (contract D; st/player/studioShortcuts.data.ts, StudioShortcutsSheet)
  "shortcuts.title": "Atalhos de teclado",
  "shortcuts.dek":
    "Funcionam em qualquer página enquanto houver música na fila, exceto quando estás a escrever num campo",
  "shortcuts.closeCta": "Fechar os atalhos",
  "shortcuts.playPause": "Reproduzir ou pausar",
  "shortcuts.seekBack": "Recuar 5 segundos",
  "shortcuts.seekForward": "Avançar 5 segundos",
  "shortcuts.previousTrack": "Faixa anterior",
  "shortcuts.nextTrack": "Faixa seguinte",
  "shortcuts.volumeUp": "Subir o volume",
  "shortcuts.volumeDown": "Baixar o volume",
  "shortcuts.mute": "Silenciar ou voltar a ouvir",
  "shortcuts.shuffle": "Ligar ou desligar a ordem aleatória",
  "shortcuts.repeat": "Mudar a repetição",
  "shortcuts.lyrics": "Abrir a letra",
  "shortcuts.queue": "Abrir a fila",
  "shortcuts.help": "Mostrar estes atalhos",
  "shortcuts.key.space": "Espaço",
  "shortcuts.key.shift": "Shift",
  "shortcuts.key.left": "Seta para a esquerda",
  "shortcuts.key.right": "Seta para a direita",
  "shortcuts.key.up": "Seta para cima",
  "shortcuts.key.down": "Seta para baixo",
  "shortcuts.focusSearch": "Ir para a pesquisa",
  "shortcuts.key.commandOrControl": "Cmd ou Ctrl",
  // Player bar, controls and Now playing extras (player/ui)
  "player.playFrom": "Ouvir desde {time}",
  "player.playFromAria": "Ouvir {title} a partir de {time}",
  "player.playFromNamedAria": "Ouvir desde {time}, {title}",
  "player.openNowPlaying": "Abrir A tocar agora, {title} de {artist}",
  "player.chapterAria": "Capítulo {number}: {title}",
  "player.queueShow": "Mostrar a fila",
  "player.queueHide": "Esconder a fila",
  "player.nowPlayingShow": "Mostrar A tocar agora",
  "player.nowPlayingHide": "Esconder A tocar agora",
  "player.shuffle": "Ordem aleatória",
  "player.repeat.off": "Repetir: desligado",
  "player.repeat.all": "Repetir: tudo",
  "player.repeat.one": "Repetir: esta faixa",
  "player.shuffleEpisodeDisabled":
    "O aleatório está desligado nos episódios, que tocam por ordem",
  "player.repeatEpisodeDisabled":
    "A repetição está desligada nos episódios, que tocam uma vez",
  "player.cast": "Ouvir noutro dispositivo",
  "player.castConnected": "A tocar noutro dispositivo",
  "player.volume": "Volume",
  "player.volumeValue": "{percent}%",
  "player.mute": "Silenciar",
  "player.unmute": "Voltar a ouvir",
  "player.more": "Mais opções do leitor",
  "player.goToTrack": "Ver faixa",
  "player.goToTrackAria": "Ver a página de {title} de {artist}",
  "player.crossfade.label": "Transição",
  "player.crossfade.hint":
    "Funde cada faixa com a seguinte. Os lançamentos marcados para tocar sem pausas seguem direto",
  "player.crossfade.unavailable":
    "A transição não está disponível nesta sessão",
  "player.crossfade.castHint":
    "O teu dispositivo de transmissão toca uma faixa de cada vez, por isso a transição fica em pausa enquanto transmites",
  "player.loudness.label": "Equilibrar o volume",
  "player.loudness.hint": "Aproxima todas as faixas do mesmo nível",
  "player.loudness.plainHint":
    "Nesta sessão só consegue baixar as faixas mais altas",
  "player.loudness.castHint":
    "O teu dispositivo de transmissão define o próprio volume, por isso este interruptor fica em pausa enquanto transmites",
  "player.audio.heading": "Áudio",
  "player.equalizer.heading": "Equalizador",
  "player.equalizer.presets.flat": "Neutro",
  "player.equalizer.presets.warm": "Quente",
  "player.equalizer.presets.voice": "Voz",
  "player.equalizer.presets.bass": "Graves",
  "player.equalizer.hint":
    "Fica guardado neste dispositivo. Neutro toca cada faixa tal como foi misturada",
  "player.equalizer.customHint":
    "A tua própria curva, guardada neste dispositivo",
  "player.equalizer.plainHint":
    "Esta sessão usa o áudio básico do navegador, por isso o equalizador fica em pausa",
  "player.equalizer.castHint":
    "O teu dispositivo de transmissão toca a faixa tal como foi misturada, por isso o equalizador fica em pausa",
  "player.equalizer.adjustBands": "Ajustar bandas",
  "player.equalizer.hideBands": "Esconder bandas",
  "player.equalizer.reset": "Repor o equalizador",
  "player.equalizer.bandLabel": "Banda de {frequency}",
  "player.equalizer.gainValue": "{value} dB",
  "player.equalizer.frequencyHz": "{value} Hz",
  "player.equalizer.frequencyKhz": "{value} kHz",
  "player.format.label": "Formato de áudio: {line}",
  "player.format.sampleRate": "{rate} kHz",
  "player.format.mono": "Mono",
  "player.format.stereo": "Estéreo",
  "player.format.channels_one": "{count} canal",
  "player.format.channels_other": "{count} canais",
  "player.shortcutsCta": "Atalhos de teclado",
  "player.sleep.heading": "Temporizador",
  "player.sleep.minutes": "{count} minutos",
  "player.sleep.endOfTrack": "Fim da faixa",
  "player.sleep.turnOff": "Desligar o temporizador",
  "player.sleep.chip": "Faltam {remaining}",
  "player.sleep.chipEndOfTrack": "Para depois desta faixa",
  "player.sleep.chipEndOfEpisode": "Para depois deste episódio",
  "player.sleep.cancelAria": "Desligar o temporizador, faltam {remaining}",
  "player.sleep.cancelAriaEndOfTrack":
    "Desligar o temporizador marcado para o fim desta faixa",
  "player.sleep.cancelAriaEndOfEpisode":
    "Desligar o temporizador marcado para o fim deste episódio",
  "player.sleep.setStatus": "Temporizador definido para {minutes} minutos",
  "player.sleep.endOfTrackStatus": "A reprodução para no fim desta faixa",
  "player.sleep.endOfEpisode": "Fim do episódio",
  "player.sleep.endOfEpisodeStatus": "A reprodução para no fim deste episódio",
  "player.sleep.cancelledStatus": "Temporizador desligado",
  "player.sleep.minutesShort": "{count} min",
  "player.lyrics.listLabel": "Letra, a acompanhar a música",
  "player.lyrics.backToCurrent": "Voltar à linha atual",
  "player.lyrics.shareLine": "Partilhar letra",
  "player.lyrics.playFromLine": "Tocar a partir desta linha",
  "player.lyrics.lineMenuLabel": "Opções da linha da letra",
  // Now playing (StudioNowPlaying)
  "nowPlaying.dialogLabel": "A tocar agora",
  "nowPlaying.close": "Fechar A tocar agora",
  "nowPlaying.playingFrom": "A tocar de {source}",
  "nowPlaying.playingFromQueue": "A tocar da tua fila",
  "nowPlaying.tabsLabel": "Detalhes do que está a tocar",
  "nowPlaying.tab.lyrics": "Letra",
  "nowPlaying.tab.queue": "Fila",
  "nowPlaying.tab.credits": "Créditos",
  "nowPlaying.tab.chapters": "Capítulos",
  "nowPlaying.tab.artist": "Artista",
  "nowPlaying.tab.show": "Podcast",
  "nowPlaying.noLyrics": "Esta faixa ainda não tem letra",
  "nowPlaying.noCredits": "Esta faixa ainda não tem créditos",
  "nowPlaying.creditsLoading": "A carregar os créditos",
  "nowPlaying.markPlayed": "Marcar {title} como ouvido",
  "nowPlaying.markUnplayed": "Marcar {title} como não ouvido",
  // Now playing side panel (StudioSidePanel*, StudioNowPlayingAbout, StudioNowPlayingArtistExtras)
  "sidePanel.aboutArtist": "Sobre a pessoa artista",
  "sidePanel.openArtistPage": "Abrir a página de artista",
  "sidePanel.openShowPage": "Abrir a página do podcast",
  "sidePanel.artistLoading": "A carregar a pessoa artista",
  "sidePanel.showAllCredits": "Mostrar todos os créditos",
  "sidePanel.showFewerCredits": "Mostrar menos créditos",
  "sidePanel.nextInQueue": "A seguir na fila",
  "sidePanel.playNextAria": "Ouvir {title} de {artist}",
  "sidePanel.openQueue": "Abrir a fila",
  "sidePanel.seeAllEventsAria": "Ver todos os eventos com {artist}",
  // Queue (StudioQueueList, StudioQueuePanel)
  "queue.heading": "Fila",
  "queue.close": "Fechar a fila",
  "queue.nowPlaying": "A tocar agora",
  "queue.yours": "A tua fila",
  "queue.clear": "Limpar a fila",
  "queue.undo": "Anular",
  "queue.clearedToast_one": "Tiraste 1 faixa da tua fila",
  "queue.clearedToast_other": "Tiraste {count} faixas da tua fila",
  "queue.nextFrom": "A seguir de {source}",
  "queue.nextUp": "A seguir",
  "queue.emptyHint":
    "Junta faixas com Tocar a seguir ou Adicionar à fila no menu de qualquer faixa",
  "queue.upcomingEmpty": "Não há mais nada depois desta faixa",
  "queue.moveUp": "Subir {title}",
  "queue.moveDown": "Descer {title}",
  "queue.remove": "Tirar {title} da fila",
  "queue.movedStatus": "{title} está agora na posição {position}",
  "queue.removedToast": "Tiraste {title} da fila",
  "queue.undoHiddenExplicitToast":
    "{title} fica fora da tua fila enquanto Esconder faixas explícitas estiver ligado",
  "queue.undoUnavailableToast":
    "{title} já não pode tocar, por isso não voltou à tua fila",
  "queue.undoStoppedToast":
    "A reprodução parou, por isso {title} não voltou à fila",
  "queue.played": "Já tocadas",
  "queue.showPlayed_one": "Mostrar 1 faixa",
  "queue.showPlayed_other": "Mostrar {count} faixas",
  "queue.hidePlayed": "Esconder faixas tocadas",
  "queue.clearPlayed": "Limpar faixas tocadas",
  "queue.playedPlayNext": "Tocar {title} a seguir",
  "queue.dragHint": "Arrasta para reordenar",
  // Track menu (StudioTrackMenu)
  "trackMenu.trigger": "Mais ações para {title}",
  "trackMenu.triggerUnavailable": "Mais ações para {title}, faixa {number}",
  "trackMenu.playNext": "Tocar a seguir",
  "trackMenu.addToQueue": "Adicionar à fila",
  "trackMenu.copyLink": "Copiar link",
  "trackMenu.copyLinkAt": "Copiar link em {time}",
  "trackMenu.playingNextToast": "Toca a seguir",
  "trackMenu.addedToast": "Adicionaste à tua fila",
  "trackMenu.linkCopiedToast": "Link copiado",
  "trackMenu.queueFailedToast": "Esta faixa não pode entrar na tua fila agora",
  "trackMenu.sendInMessage": "Enviar numa mensagem",
  "trackMenu.menuLabel": "Ações para {title}",
  "trackMenu.like": "Adicionar a Músicas de que gostas",
  "trackMenu.unlike": "Remover de Músicas de que gostas",
  "trackMenu.goToArtist": "Ver artista",
  "trackMenu.goToRelease": "Ver lançamento",
  "share.card.teaser": "Do QueerPulse Studio, aberto a quem tem acesso",
  "share.card.withdrawn": "Este lançamento foi retirado",
  "share.card.unavailable": "Indisponível",
  "share.card.retryCta": "Tentar de novo",
  "share.card.error.offline": "Estás sem ligação",
  "share.card.error.timeout": "O Studio demorou demasiado a responder",
  "share.card.error.rateLimited": "Pedidos a mais, espera um minuto",
  "share.card.error.server": "O nosso servidor não respondeu",
  "share.card.error.unreachable": "Não conseguimos chegar ao Studio",
  "share.card.error.forbidden": "A tua conta não pode abrir isto",
  "share.card.error.restricted": "Uma restrição de moderação bloqueia isto",
  "share.card.error.unknown": "O pedido não chegou a ser feito",
  "share.card.error.notFound": "Isto já não está disponível",
  "share.card.loading": "A carregar do Studio",
  "share.card.byline": "De {name}",
  "share.card.openAria": "Abrir {title} no Studio",
  "share.card.removeCta": "Remover link do Studio",
  "share.card.hiddenNote": "Escondida pelas tuas definições",
  "share.lyric.dialogTitle": "Partilhar letra",
  "share.lyric.dialogSub":
    "O cartão mostra esta linha a quem tem acesso ao Studio",
  "share.lyric.optionsLabel": "Formas de partilhar esta letra",
  "share.lyric.playFromLine": "Tocar {title} a partir desta linha",
  "share.lyric.warnedNote":
    "A letra está atrás de um aviso de conteúdo na página da faixa",
  "share.lyric.withheldNote":
    "A letra está indisponível enquanto esta faixa estiver offline",
  "share.lyric.missingNote": "Esta linha já não está na letra",
  // Chapters: listener lists, errors (contract A.7, D) and the editor
  "chapters.listHeading": "Alinhamento",
  "chapters.listHeadingFor": "Alinhamento de {title}",
  "chapters.listLabel": "Capítulos de {title}",
  "chapters.error.outOfRange":
    "Cada capítulo tem de começar antes de a faixa acabar",
  "chapters.error.time": "Escreve o tempo como m:ss ou h:mm:ss",
  "chapters.error.firstAtZero": "O primeiro capítulo começa em 0:00",
  "chapters.error.order": "Começa depois do capítulo de cima",
  "chapters.error.pastEnd": "Começa antes de a faixa acabar, em {time}",
  "chapters.error.titleRequired": "Dá um título a este capítulo",
  "chapters.error.titleTooLong": "Mantém o título até 120 caracteres",
  "chapters.error.artistTooLong":
    "Mantém o nome da pessoa artista até 120 caracteres",
  "chapters.error.tooMany": "Usa no máximo 100 capítulos",
  "chapters.error.summary":
    "Corrige os capítulos assinalados abaixo para guardar",
  "chapters.editor.heading": "Capítulos",
  "chapters.editor.count_one": "{count} capítulo",
  "chapters.editor.count_other": "{count} capítulos",
  "chapters.editor.hint":
    "Marca onde começa cada parte da faixa. Quem ouve pode saltar diretamente para ela",
  "chapters.editor.needsAudio":
    "Junta capítulos quando o áudio desta faixa estiver pronto",
  "chapters.editor.timeLabel": "Início do capítulo {number}",
  "chapters.editor.titleLabel": "Título do capítulo {number}",
  "chapters.editor.artistLabel": "Artista do capítulo {number}, opcional",
  "chapters.editor.add": "Adicionar um capítulo",
  "chapters.editor.remove": "Tirar o capítulo {number}",
  "chapters.editor.moveUp": "Subir o capítulo {number}",
  "chapters.editor.moveDown": "Descer o capítulo {number}",
  "chapters.editor.pasteToggle": "Colar um alinhamento",
  "chapters.editor.pasteLabel": "Alinhamento, uma linha por capítulo",
  "chapters.editor.pasteHint":
    "Por exemplo 00:00 Artista - Título ou 1:02:30 Título",
  "chapters.editor.pasteHintEpisode":
    "Por exemplo 00:00 Introdução ou 1:02:30 Entrevista",
  "chapters.editor.columnTime": "Tempo",
  "chapters.editor.columnTitle": "Título",
  "chapters.editor.columnArtist": "Artista",
  "chapters.editor.pasteApply": "Usar este alinhamento",
  "chapters.editor.pasteReplaceNote": "Isto substitui os capítulos acima",
  "chapters.editor.pasteUnparsed": "Não conseguimos ler estas linhas:",
  "chapters.editor.pasteLine": "Linha {number}: {text}",
  "chapters.editor.pasteEmpty":
    "Cola pelo menos uma linha que comece com um tempo",
  "chapters.editor.pastedStatus_one": "{count} capítulo adicionado",
  "chapters.editor.pastedStatus_other": "{count} capítulos adicionados",
  // Lyric timing tool (upload/lyrics)
  "lyricTiming.addCta": "Adicionar tempos",
  "lyricTiming.editCta": "Editar tempos",
  "lyricTiming.summary_one": "{count} linha com tempo",
  "lyricTiming.summary_other": "{count} linhas com tempo",
  "lyricTiming.clearCta": "Apagar os tempos",
  "lyricTiming.mismatch":
    "A letra mudou desde que marcaste os tempos. Ao guardar, os tempos são apagados",
  "lyricTiming.dialogTitle": "Marcar os tempos da letra",
  "lyricTiming.dialogSub": "Quem ouve vê cada linha acender enquanto toca",
  "lyricTiming.modesLabel": "Como adicionar os tempos",
  "lyricTiming.mode.tap": "Marcar a ouvir",
  "lyricTiming.mode.paste": "Colar LRC",
  "lyricTiming.paste.label": "Letra em LRC",
  "lyricTiming.paste.hint":
    "Uma linha por marca, como [01:23.45] Uma linha da canção. Etiquetas como [ar:] ficam de fora e [offset:] é aplicado",
  "lyricTiming.paste.parsed_one": "{count} linha lida",
  "lyricTiming.paste.parsed_other": "{count} linhas lidas",
  "lyricTiming.paste.unparsedHeading":
    "Estas linhas não têm um tempo que consigamos ler e ficam de fora:",
  "lyricTiming.paste.noStamp": "Linha {number}: {text}",
  "lyricTiming.paste.tooLong": "A linha {number} passa dos 300 caracteres",
  "lyricTiming.paste.overLimit": "Usa no máximo 500 linhas com tempo",
  "lyricTiming.tap.stamp": "Marcar a linha {number}",
  "lyricTiming.tap.stampVisible": "Marcar",
  "lyricTiming.tap.stampHint":
    "Carrega em Espaço ou em Marcar quando cada linha começa",
  "lyricTiming.tap.left_one": "Falta {count} linha",
  "lyricTiming.tap.left_other": "Faltam {count} linhas",
  "lyricTiming.tap.allStamped": "Todas as linhas têm tempo",
  "lyricTiming.tap.earlier": "Linha {number} 0,1 segundos mais cedo",
  "lyricTiming.tap.later": "Linha {number} 0,1 segundos mais tarde",
  "lyricTiming.tap.playFromHere": "Ouvir a partir da linha {number}",
  "lyricTiming.tap.restart": "Recomeçar",
  "lyricTiming.tap.notTimed": "Ainda sem tempo",
  "lyricTiming.tap.silentClock":
    "Esta faixa não tem áudio para tocar aqui, por isso o relógio corre em silêncio",
  "lyricTiming.tap.loading": "A carregar o áudio",
  "lyricTiming.tap.audioError":
    "Não conseguimos tocar o áudio. Colar LRC continua a funcionar",
  "lyricTiming.tap.needsLyrics":
    "Escreve primeiro a letra para marcar a ouvir, ou cola LRC",
  "lyricTiming.preview": "Pré-visualizar",
  "lyricTiming.saveCta": "Usar estes tempos",
  "lyricTiming.cancelCta": "Cancelar",
  "lyricTiming.needAllLines":
    "Marca o tempo de todas as linhas para usar estes tempos",
  "lyricTiming.needLines": "Cola pelo menos uma linha com tempo",
  // Upload loudness: measuring, backfill and the check (spec 8.1 to 8.3)
  "upload.loudness.measuring": "A medir o volume",
  "upload.loudness.backfill_one": "A medir {count} faixa",
  "upload.loudness.backfill_other": "A medir {count} faixas",
  "upload.loudness.heading": "Verificação de volume",
  "upload.loudness.loudNote":
    "A faixa {number} mede {lufs} LUFS. Quem mantém 'Equilibrar o volume' ligado ouve-a um pouco mais baixa",
  "upload.loudness.peakNote":
    "A faixa {number} tem picos de {peak} dB, no topo da escala. O Studio mantém os picos de uma faixa reforçada em −1 dB ou menos, por isso pode tocar um pouco mais baixa",
  "upload.loudness.explainerToggle": "Como o Studio equilibra o volume",
  "upload.loudness.explainer":
    "Guardamos o teu ficheiro <em>tal como o enviaste</em>. Durante o envio, o teu navegador mede o volume. Quando quem ouve tem 'Equilibrar o volume' ligado, o Studio sobe ou baixa cada faixa em direção a −14 LUFS, no máximo 6 dB para cima e 12 dB para baixo, e uma faixa que sobe nunca passa de −1 dB nos picos. Quem o desliga ouve o teu master tal como está. Nada é recodificado",
  "uploadFlow.side.loudness.label": "Volume",
  "uploadFlow.side.loudness.value": "medido durante o envio",
  // ── Studio artist kinds (2026-10-14) ──────────────────────────────────────────
  "format.all": "Tudo",
  "format.music": "Música",
  "format.podcast": "Podcasts",
  "format.spoken_word": "Palavra falada",
  "format.performance": "Performance",
  "format.listLabel": "Mostrar um formato",
  "releaseType.podcast": "Podcast",
  "releaseType.edit": "Edit de performance",
  "releaseType.lip_sync": "Lip-sync mix",
  "genre.spokenWord": "Palavra falada",
  "home.newEpisodes.title": "Episódios <em>novos</em>",
  "home.spokenWord.title": "Palavra <em>falada</em>",
  "home.onStage.title": "Em <em>palco</em>",
  "home.continue.title": "Continua a <em>ouvir</em>",
  "home.continue.eyebrow": "Guardado só neste dispositivo",
  "home.continue.minutesLeft_one": "Falta {count} min",
  "home.continue.minutesLeft_other": "Faltam {count} min",
  "home.shelf.showLess": "Mostrar menos",
  "home.pageHeading": "Início do Studio",
  "home.tabTitle": "Início",
  "episodeCard.playAria": "Ouvir {title}",
  "episodeCard.pauseAria": "Pausar {title}",
  "browse.titleFormat": "<em>{format}</em> no Studio",
  "browse.gridLabelFormat": "Tudo em {format}",
  "browse.emptyTitleFormat": "Ainda não há nada em {format}",
  "searchPage.formatLabel": "Formato",
  "searchPage.formatAny": "Qualquer formato",
  "show.kindLine_one": "Podcast · {count} episódio",
  "show.kindLine_other": "Podcast · {count} episódios",
  "show.playLatestCta": "Ouvir o episódio mais recente",
  "show.pauseLatestCta": "Pausar o episódio mais recente",
  "show.aboutHeading": "Sobre o podcast",
  "show.episodesHeading": "Episódios",
  "show.sortLabel": "Ordenar episódios",
  "show.sortNewest": "Mais recentes",
  "show.sortOldest": "Mais antigos",
  "show.noEpisodes": "Ainda não há episódios",
  "show.addEpisodeCta": "Adicionar episódio",
  "show.draftsHeading": "Rascunhos",
  "show.draftChip": "Rascunho",
  "show.editEpisodeCta": "Editar episódio",
  "show.savedMeta": "Podcast · {artist}",
  "show.listLabel": "Episódios de {title}",
  "show.nothingToPlay": "Ainda não há episódios prontos a tocar",
  "show.takenDownReason": "A nossa equipa tirou este podcast do ar",
  "episode.number": "Episódio {number}",
  "episode.minutesLeft_one": "Falta {count} min",
  "episode.minutesLeft_other": "Faltam {count} min",
  "episode.played": "Ouvido",
  "episode.markPlayed": "Marcar como ouvido",
  "episode.markUnplayed": "Marcar como não ouvido",
  "episode.markedPlayedStatus": "{title} marcado como ouvido",
  "episode.markedUnplayedStatus": "{title} marcado como não ouvido",
  "episode.playAria": "Ouvir {title}",
  "episode.pauseAria": "Pausar {title}",
  "episode.notesHeading": "Notas do episódio",
  "episode.opensInNewTab": "(abre num separador novo)",
  "episode.playFromAria": "Ouvir a partir de {time}",
  "episode.crumbLabel": "Episódio",
  "episode.fromLabel": "De",
  "episode.publishedOn": "Publicado a {date}",
  "episode.draftReason":
    "Este episódio é um rascunho, por isso ainda não pode tocar",
  "episode.noAudioReason": "O áudio deste episódio ainda não está pronto",
  "trackPage.transcriptHeading": "Transcrição",
  "trackPage.noTranscript": "Ainda não há transcrição",
  "sources.heading": "Fontes",
  "sources.line": "{title} de {artist}",
  "sources.listLabel": "Músicas usadas em {title}",
  "sources.editorHint": "Cada música que usaste, com quem a fez",
  "sources.titleLabel": "Título da música {number}",
  "sources.artistLabel": "Artista {number}",
  "sources.addCta": "Adicionar fonte",
  "sources.removeCta": "Remover fonte",
  "sources.removeAria": "Remover fonte {number}",
  "sources.incomplete":
    "Preenche o título e quem fez a música em todas as linhas, ou remove a linha",
  "artist.main.showsHeading": "Podcasts",
  "artist.main.performanceHeading": "Áudio de performance",
  "owner.addEpisodeAria": "Adicionar episódio a {title}",
  "owner.publishTitle": "Publicar {title}?",
  "owner.publishBody":
    "Fica público e qualquer pessoa com acesso ao Studio o pode ouvir. Podes despublicar mais tarde.",
  "owner.publishConfirm": "Publicar lançamento",
  "owner.publishedAnnouncement": "{title} foi publicado",
  "player.skipBack": "Recuar 15 s",
  "player.skipForward": "Avançar 30 s",
  "player.speed.heading": "Velocidade",
  "player.speed.value": "{rate}x",
  "player.speed.hint":
    "A velocidade aplica-se aos episódios de podcast. A música toca a 1x",
  "player.announce.nowPlaying": "A tocar {title} de {artist}",
  "player.announce.playing": "A tocar",
  "player.announce.paused": "Em pausa",
  "player.announce.position": "Aos {time}",
  "player.announce.volume": "Volume {percent}%",
  "player.announce.muted": "Som desligado",
  "player.announce.unmuted": "Som ligado",
  "player.announce.shuffleOn": "Ordem aleatória ligada",
  "player.announce.shuffleOff": "Ordem aleatória desligada",
  "player.announce.noNextTrack": "Não há nada na fila depois desta faixa",
  "player.documentTitlePrefix": "A tocar:",
  "player.shortcutHint": "{label} ({keys})",
  "uploadFlow.release.showNameLabel": "Nome do podcast",
  "uploadFlow.release.showAboutLabel": "Sobre o podcast",
  "uploadFlow.publish.gap.sources": "Credita todas as fontes: {titles}",
  "uploadFlow.publish.rightsLabelSourced":
    "Tenho autorização para partilhar este edit, todas as fontes estão creditadas, e aceito que as pessoas do QueerPulse o ouçam em streaming.",
  "uploadFlow.files.transcriptLabel": "Transcrição",
  "uploadFlow.files.lyricsHint": "A letra como é cantada, uma linha por verso",
  "uploadFlow.files.transcriptHint":
    "Tudo o que é dito, para quem quiser ler enquanto ouve",
  "uploadFlow.files.notesLabel": "Notas do episódio",
  "uploadFlow.files.notesHint":
    "Os endereços web passam a links, e tempos como 12:30 passam a botões para ouvir",
  "uploadFlow.files.countLabel": "{count} de {max}",
  "uploadFlow.files.rejectSizePodcast": "{fileName} tem mais de 250 MB",
  "uploadFlow.files.acceptsPodcast":
    "aceita · <em>MP3 · M4A · WAV · AIFF</em> · até 250 MB por episódio",
  "episodeUpload.newTitle": "Episódio <em>novo</em>",
  "episodeUpload.editTitle": "Editar <em>episódio</em>",
  "episodeUpload.forShow": "Para {show}",
  "episodeUpload.audioHeading": "Áudio do episódio",
  "episodeUpload.titleLabel": "Título do episódio",
  "episodeUpload.explicitLabel": "Este episódio tem conteúdo explícito",
  "episodeUpload.uploading": "A carregar {fileName}",
  "episodeUpload.converting": "A converter {fileName} para MP3, {percent}%",
  "episodeUpload.convertingLabel": "A converter {fileName} para MP3",
  "episodeUpload.processing": "A ler o áudio",
  "episodeUpload.uploadFailed":
    "O carregamento parou. Escolhe o ficheiro outra vez",
  "episodeUpload.chaptersFromNotesCta": "Ler capítulos das notas",
  "episodeUpload.chaptersReplaceTitle": "Substituir os capítulos?",
  "episodeUpload.chaptersReplaceBody_one":
    "Os tempos das notas substituem o {count} capítulo que tens",
  "episodeUpload.chaptersReplaceBody_other":
    "Os tempos das notas substituem os {count} capítulos que tens",
  "episodeUpload.chaptersReplaceConfirm": "Substituir capítulos",
  "episodeUpload.chaptersNoneFound":
    "Nenhuma linha das notas começa com um tempo como 12:30",
  "episodeUpload.chaptersRead_one": "{count} capítulo lido das notas",
  "episodeUpload.chaptersRead_other": "{count} capítulos lidos das notas",
  "episodeUpload.saveCta": "Guardar episódio",
  "episodeUpload.publishCta": "Publicar episódio",
  "episodeUpload.savedStatus": "Episódio guardado",
  "episodeUpload.needsAudio": "Adiciona o áudio para publicar este episódio",
  "episodeUpload.publishedTitle": "<em>{title}</em> está publicado",
  "episodeUpload.openEpisodeCta": "Abrir o episódio",
  "episodeUpload.anotherCta": "Adicionar outro episódio",
  "episodeUpload.backToShowCta": "Voltar ao podcast",
  "episodeUpload.draftShowTitle": "Este podcast ainda é um rascunho",
  "episodeUpload.draftShowBody":
    "Adiciona os primeiros episódios no passo Faixas e depois publica o podcast",
  "episodeUpload.draftShowCta": "Abrir as faixas do podcast",
  "episodeUpload.oneFileOnly":
    "Um episódio leva um ficheiro, por isso usámos {fileName}",
  "episodeUpload.scheduledShowTitle": "Este podcast sai a {date}",
  "episodeUpload.scheduledShowBody":
    "Os episódios que juntares agora saem com ele",
  "errors.publishMissingSources":
    "Credita todas as fontes nas faixas de edit, lip-sync e mix",
  "errors.episodeShowNotPublished": "Publica o podcast antes dos episódios",
  "errors.episodeAlreadyPublished": "Este episódio já está publicado",
  "errors.episodeOrderLocked":
    "Um podcast publicado ordena os episódios pela data, e essa ordem mantém-se",
  "errors.notAPodcast": "Os episódios pertencem a podcasts",
  "errors.episodeLimit": "Um podcast tem no máximo 500 episódios",
  "uploadFlow.hero.subShow":
    "Três passos: o podcast, os episódios e a publicação. MP3, M4A, WAV ou AIFF, até 250 MB por episódio",
  "uploadFlow.side.size.valueShow": "até 250 MB por episódio",
  "uploadFlow.release.headingShow": "O <em>podcast</em>",
  "uploadFlow.release.continueCtaShow": "Guardar e seguir para os episódios",
  "facts.episodeCount_one": "{count} episódio",
  "facts.episodeCount_other": "{count} episódios",
  "episodeUpload.eyebrow": "Novo episódio · carregar",
  "episodeUpload.dropTitle": "Larga aqui um ficheiro MP3, M4A, WAV ou AIFF",
  "episodeUpload.chooseFile": "Escolher um ficheiro de áudio",
  "episodeUpload.cancelCta": "Cancelar carregamento",
  "episodeUpload.cancelFor": "Cancelar o carregamento de {fileName}",
  "episodeUpload.retryCta": "Tentar carregar de novo",
  "episodeUpload.retryFor": "Tentar de novo o carregamento de {fileName}",
  "episodeUpload.pageTitleNew": "Novo episódio",
  "episodeUpload.pageTitleEdit": "Editar episódio",
  "chapters.editor.hintEpisode": "Marca onde começa cada parte do episódio",
  "chapters.editor.pasteEpisode": "Colar capítulos",
  "searchPage.episodesHeading": "<em>Episódios</em>",
  "searchPage.documentTitle": "Pesquisar",
  "searchPage.seeAll": "Ver tudo ({count})",
  "searchPage.seeAllMore": "Ver tudo ({count}+)",
  "searchPage.showMore.releases": "Mostrar mais lançamentos",
  "searchPage.showMore.tracks": "Mostrar mais faixas",
  "searchPage.showMore.artists": "Mostrar mais artistas",
  "searchPage.showMore.playlists": "Mostrar mais playlists",
  "searchPage.showMore.episodes": "Mostrar mais episódios",
  "searchPage.showMoreLoading": "A carregar mais resultados",
  "searchPage.showMoreError":
    "Não conseguimos carregar mais resultados. {reason}",
  "searchPage.loadingResults": "A carregar os resultados da pesquisa",
  "searchPage.emptyFiltered":
    "Não encontrámos nada para <em>{term}</em> com estes filtros. Remove um para alargar a pesquisa, e o teu termo fica",
  "searchPage.dropFilterLead": "Experimenta sem um filtro",
  "searchPage.dropFilter": "Remover o filtro {filter}",
  "searchPage.recentHeading": "Pesquisas recentes",
  "searchPage.recentClear": "Limpar pesquisas recentes",
  "searchPage.recentNote":
    "Guardadas só neste dispositivo, e apagadas pela Saída rápida e ao terminar sessão",
  "searchPage.suggestionsHeading": "Experimenta uma pesquisa",
  "searchPage.featuredLoading": "A carregar os lançamentos em destaque",
  "searchPage.suggestion.fadoReworked": "fado reinventado",
  "searchPage.suggestion.saraMarques": "sara marques",
  "searchPage.suggestion.transComposers": "pessoas compositoras trans",
  "searchPage.suggestion.sheetMusic": "partituras",
  "searchPage.facetsToggle": "Filtros",
  "searchPage.facetsToggleCount": "Filtros ({count})",
  "artist.showCount_one": "{count} podcast",
  "artist.showCount_other": "{count} podcasts",
  "artist.tabs.podcast": "Podcasts",
  "artist.tabs.spokenWord": "Palavra falada",
  "artist.tabs.performance": "Performance",
  // ── Playlists colaborativas (2026-10-14) ────────────────────────────────────
  "errors.playlistNotFound": "Esta playlist já não está disponível",
  "errors.playlistOwnerOnly": "Só quem criou a playlist pode fazer isso",
  "errors.playlistEditorSourceMismatch":
    "Esta playlist mudou. Recarrega a página e tenta outra vez",
  "errors.playlistEditorCap":
    "Uma playlist pode ter até 10 pessoas a editar ou convidadas",
  "errors.playlistEditorIneligible":
    "Algumas destas pessoas não podem ser convidadas agora",
  "errors.playlistInviteUnavailable": "Este convite já não está disponível",
  "errors.playlistInviteNotFound": "Este convite já foi respondido ou retirado",
  "errors.playlistCreditChangeRemovesEditors":
    "Mudar quem aparece na playlist tira o acesso a algumas pessoas que a editam",
  "errors.playlistEntryNotFound": "Essa faixa já tinha saído",
  "errors.playlistEditorNotFound":
    "Esse acesso de edição já tinha sido removido",
  "errors.load.title": "Não conseguimos carregar <em>{what}</em>",
  "errors.load.offline":
    "Estás offline. Verifica o teu Wi-Fi ou dados móveis e tenta outra vez",
  "errors.load.timeout":
    "O Studio demorou demasiado a responder. Tenta outra vez daqui a um momento",
  "errors.load.rateLimited":
    "Fizeste muitos pedidos em pouco tempo. Espera um minuto e tenta outra vez",
  "errors.load.server":
    "O nosso servidor não respondeu. A falha é nossa, por isso tenta outra vez daqui a um momento",
  "errors.load.unreachable":
    "Não conseguimos chegar ao Studio. Verifica a tua ligação ou tenta outra vez daqui a um momento",
  "errors.load.forbidden":
    "A tua conta não tem acesso a isto. Inicia sessão outra vez se achas que devia ter",
  "errors.load.notFound":
    "Isto já não está disponível. Pode ter mudado de sítio ou sido retirado",
  "errors.load.restricted":
    "Não podes abrir isto enquanto estiver em vigor uma restrição de moderação. Podes recorrer em Segurança, em Contestar uma decisão",
  "errors.load.unknown":
    "O pedido não chegou ao fim. Tenta outra vez daqui a um momento",
  "errors.save.offline":
    "Estás offline, por isso isto não ficou guardado. Verifica a tua ligação e tenta outra vez",
  "errors.save.timeout":
    "Guardar demorou demasiado e pode não ter ficado feito. Tenta outra vez",
  "errors.save.rateLimited":
    "Fizeste muitas alterações em pouco tempo. Espera um minuto e tenta outra vez",
  "errors.save.server":
    "O nosso servidor não conseguiu guardar isto. A falha é nossa, por isso tenta outra vez daqui a um momento",
  "errors.save.unreachable":
    "Não conseguimos chegar ao Studio, por isso isto não ficou guardado. Verifica a tua ligação ou tenta outra vez daqui a um momento",
  "errors.save.forbidden":
    "A tua conta não pode fazer esta alteração. Inicia sessão outra vez e tenta de novo",
  "errors.save.notFound":
    "Isto já não está disponível, por isso a alteração não ficou guardada",
  "errors.save.restricted":
    "Não podes fazer alterações enquanto estiver em vigor uma restrição de moderação. Podes recorrer em Segurança, em Contestar uma decisão",
  "errors.save.unknown": "Esta alteração não chegou ao fim. Tenta outra vez",
  "errors.play.offline":
    "Estás offline, por isso isto não pode tocar. Verifica a tua ligação e tenta outra vez",
  "errors.play.timeout":
    "O áudio demorou demasiado a carregar. Tenta outra vez",
  "errors.play.rateLimited":
    "Começaste muitas faixas em pouco tempo. Espera um minuto e carrega outra vez em reproduzir",
  "errors.play.server":
    "O nosso servidor de áudio não respondeu. A falha é nossa, por isso tenta outra vez daqui a um momento",
  "errors.play.unreachable":
    "Não conseguimos chegar ao Studio, por isso isto não pode tocar. Verifica a tua ligação ou tenta outra vez daqui a um momento",
  "errors.play.forbidden":
    "A tua conta não pode reproduzir isto. Inicia sessão outra vez e carrega de novo em reproduzir",
  "errors.play.notFound":
    "Este áudio já não está disponível. Escolhe outra faixa para continuares a ouvir",
  "errors.play.restricted":
    "Não podes reproduzir isto enquanto estiver em vigor uma restrição de moderação. Podes recorrer em Segurança, em Contestar uma decisão",
  "errors.play.unknown": "Esta faixa não conseguiu começar. Tenta outra vez",
  "errors.upload.offline":
    "Estás offline, por isso o carregamento parou. Verifica a tua ligação e tenta outra vez",
  "errors.upload.timeout":
    "O carregamento demorou demasiado a responder. Tenta outra vez",
  "errors.upload.rateLimited":
    "Carregaste muita coisa em pouco tempo. Espera um minuto e tenta outra vez",
  "errors.upload.server":
    "O nosso servidor não conseguiu receber o carregamento. A falha é nossa, por isso tenta outra vez daqui a um momento",
  "errors.upload.unreachable":
    "Não conseguimos chegar ao Studio, por isso o carregamento parou. Verifica a tua ligação ou tenta outra vez daqui a um momento",
  "errors.upload.forbidden":
    "A tua conta não pode carregar ficheiros aqui. Confirma que escolheste uma persona que geres e tenta outra vez",
  "errors.upload.notFound":
    "O lançamento para onde estás a carregar já não está disponível. Começa um novo em Carregar um lançamento",
  "errors.upload.restricted":
    "Não podes carregar ficheiros enquanto estiver em vigor uma restrição de moderação. Podes recorrer em Segurança, em Contestar uma decisão",
  "errors.upload.unknown": "O carregamento não chegou ao fim. Tenta outra vez",
  "errors.queue.offline":
    "Estás offline, por isso a fila não mudou. Verifica a tua ligação e tenta outra vez",
  "errors.queue.timeout":
    "A fila demorou demasiado a atualizar. Tenta outra vez",
  "errors.queue.rateLimited":
    "Mudaste muito a fila em pouco tempo. Espera um minuto e tenta outra vez",
  "errors.queue.server":
    "O nosso servidor não conseguiu preencher a fila. A falha é nossa, por isso tenta outra vez daqui a um momento",
  "errors.queue.unreachable":
    "Não conseguimos chegar ao Studio, por isso a fila não mudou. Verifica a tua ligação ou tenta outra vez daqui a um momento",
  "errors.queue.forbidden":
    "A tua conta não pode juntar isto à fila. Inicia sessão outra vez e tenta de novo",
  "errors.queue.notFound":
    "Essa faixa já não está disponível, por isso ficou fora da tua fila",
  "errors.queue.restricted":
    "Não podes mudar a fila enquanto estiver em vigor uma restrição de moderação. Podes recorrer em Segurança, em Contestar uma decisão",
  "errors.queue.unknown": "A fila não atualizou. Tenta outra vez",
  "errors.what.release": "este lançamento",
  "errors.what.track": "esta faixa",
  "errors.what.artist": "esta página de artista",
  "errors.what.scene": "esta cena",
  "errors.what.sceneReleases": "os lançamentos desta cena",
  "errors.what.playlist": "esta playlist",
  "errors.what.liked": "Músicas de que gostas",
  "errors.what.show": "este programa",
  "errors.what.episode": "este episódio",
  "errors.what.pressKit": "este kit de imprensa",
  "errors.what.pressTracks": "estas faixas",
  "errors.what.creditsInbox": "os teus créditos",
  "errors.what.credits": "os créditos",
  "errors.what.persona": "esta persona",
  "errors.what.claims": "as tuas reivindicações",
  "errors.what.reviewList": "a lista de revisão",
  "errors.what.yourNumbers": "os teus números",
  "errors.what.playbackSettings": "as tuas definições de reprodução",
  "errors.what.preview": "esta pré-visualização",
  "errors.what.previewLink": "este link de pré-visualização",
  "errors.what.searchResults": "estes resultados",
  "errors.what.releases": "estes lançamentos",
  "errors.what.genres": "os géneros",
  "errors.what.newReleases": "os lançamentos novos",
  "errors.what.yourPlaylists": "as tuas playlists",
  "errors.what.followedArtists": "os artistas que segues",
  "errors.what.featured": "os lançamentos em destaque",
  "errors.what.savedReleases": "os teus lançamentos guardados",
  "errors.what.access": "o teu acesso ao Studio",
  "errors.what.suggestedArtists": "as sugestões de artistas",
  "playlist.page.manageEditors": "Gerir quem edita",
  "playlist.page.leavePlaylist": "Sair da playlist",
  "playlist.page.loadingLabel": "A carregar esta playlist",
  "playlist.page.nothingToPlay": "Ainda nada nesta playlist pode tocar",
  "playlist.collab.chip": "Colaborativa",
  "playlist.collab.openAria_one":
    "Playlist colaborativa com {count} pessoa a editar. Ver quem edita",
  "playlist.collab.openAria_other":
    "Playlist colaborativa com {count} pessoas a editar. Ver quem edita",
  "playlist.collab.moreCount": "+{count}",
  "playlist.row.addedBy": "Adicionada por {name}",
  "playlist.row.undoCta": "Anular",
  "playlist.row.removedManyToast_one": "Removeste {count} faixa da playlist",
  "playlist.row.removedManyToast_other": "Removeste {count} faixas da playlist",
  "playlist.row.restoredToast": "De volta à playlist, no lugar onde estava",
  "playlist.row.restoreError":
    "Não conseguimos voltar a pôr isso na playlist. Tenta outra vez",
  "playlist.row.restoredNoneToast":
    "A playlist já tem estas faixas, por isso nada voltou",
  "playlist.row.restoredSomeToast_one":
    "Voltaste a pôr {count} de {total} faixas. A playlist já tinha as outras",
  "playlist.row.restoredSomeToast_other":
    "Voltaste a pôr {count} de {total} faixas. A playlist já tinha as outras",
  "playlist.row.removedTitledToast": "«{title}» saiu da playlist",
  "playlist.invite.bannerTitle": "{name} convidou-te para editar esta playlist",
  "playlist.invite.bannerBody":
    "Quem edita pode adicionar, tirar e reordenar faixas, e mudar o nome e a descrição",
  "playlist.invite.acceptCta": "Aceitar convite",
  "playlist.invite.declineCta": "Recusar convite",
  "playlist.invite.acceptedToast": "Agora podes editar {name}",
  "playlist.invite.declinedToast": "Convite recusado",
  "playlist.invite.cardChip": "Convite",
  "playlist.invite.acceptingCta": "A aceitar o convite",
  "playlist.invite.decliningCta": "A recusar o convite",
  "playlist.editors.title": "Quem edita",
  "playlist.editors.ownerSubMember":
    "Quem edita pode adicionar, tirar e reordenar faixas, e mudar o nome e a descrição. Quem pode abrir, quem aparece e apagar a playlist ficam contigo",
  "playlist.editors.ownerSubPersona":
    "Escolhe quem gere {persona} contigo e pode editar esta playlist",
  "playlist.editors.editorSub":
    "Todas as pessoas que podem editar esta playlist",
  "playlist.editors.listLabel": "Quem edita {name}",
  "playlist.editors.loadingLabel": "A carregar quem edita",
  "playlist.editors.pendingLabel": "Convite enviado",
  "playlist.editors.ownerLabel": "Dono",
  "playlist.editors.removeCta": "Remover acesso de edição",
  "playlist.editors.removeAria": "Remover o acesso de edição de {name}",
  "playlist.editors.cancelInviteCta": "Cancelar convite",
  "playlist.editors.cancelInviteAria": "Cancelar o convite a {name}",
  "playlist.editors.removeConfirmTitle":
    "Remover o acesso de edição de {name}?",
  "playlist.editors.removeConfirmBody":
    "As faixas que adicionou ficam na playlist",
  "playlist.editors.removedToast": "{name} já não pode editar esta playlist",
  "playlist.editors.inviteCancelledToast": "Convite cancelado",
  "playlist.editors.inviteCta": "Convidar para editar",
  "playlist.editors.emptyTitle": "Ainda só tu editas esta playlist",
  "playlist.editors.emptyBody":
    "Convida ligações para adicionarem faixas contigo",
  "playlist.editors.loadError": "Não conseguimos carregar quem edita",
  "playlist.editors.slotsUsed": "{count} de {max} lugares ocupados",
  "playlist.editors.slotsFull":
    "Os {max} lugares estão ocupados. Remove um acesso ou cancela um convite para convidares outra pessoa",
  "playlist.editors.invite.title": "Convidar para editar",
  "playlist.editors.invite.searchLabel": "Procurar nas tuas ligações",
  "playlist.editors.invite.loadingPeople": "A carregar as tuas ligações",
  "playlist.editors.invite.noConnections": "As tuas ligações aparecem aqui",
  "playlist.editors.invite.loadError":
    "Não conseguimos carregar as tuas ligações",
  "playlist.editors.invite.allListed":
    "Todas as pessoas da lista já editam esta playlist ou têm convite",
  "playlist.editors.invite.sendDefaultCta": "Enviar convites",
  "playlist.editors.invite.sendCta_one": "Enviar {count} convite",
  "playlist.editors.invite.sendCta_other": "Enviar {count} convites",
  "playlist.editors.invite.backCta": "Voltar a quem edita",
  "playlist.editors.invite.sentToast_one": "Convite enviado",
  "playlist.editors.invite.sentToast_other": "{count} convites enviados",
  "playlist.editors.invite.ineligible":
    "Não dá para convidar {names} agora. Desmarca e tenta outra vez",
  // Why the server refused each person (2026-10-21): one sentence per reason.
  "playlist.editors.refused.noStudioAccess_one":
    "{names} ainda não tem acesso ao Studio, por isso não pode editar playlists",
  "playlist.editors.refused.noStudioAccess_other":
    "{names} ainda não têm acesso ao Studio, por isso não podem editar playlists",
  "playlist.editors.refused.notConnected_one":
    "{names} já não está nas tuas ligações",
  "playlist.editors.refused.notConnected_other":
    "{names} já não estão nas tuas ligações",
  "playlist.editors.refused.notCoOwner_one":
    "{names} já não gere {persona} contigo",
  "playlist.editors.refused.notCoOwner_other":
    "{names} já não gerem {persona} contigo",
  "playlist.editors.refused.notCoOwnerUnnamed_one":
    "{names} já não gere este perfil contigo",
  "playlist.editors.refused.notCoOwnerUnnamed_other":
    "{names} já não gerem este perfil contigo",
  "playlist.editors.refused.blocked_one":
    "Não dá para convidar {names} a partir da tua conta",
  "playlist.editors.refused.blocked_other":
    "Não dá para convidar {names} a partir da tua conta",
  "playlist.editors.refused.notFound_one":
    "Não encontrámos {names}. Pode ter saído do QueerPulse ou mudado o link do perfil",
  "playlist.editors.refused.notFound_other":
    "Não encontrámos {names}. Podem ter saído do QueerPulse ou mudado o link do perfil",
  "playlist.editors.refused.isOwner_one": "A playlist já é de {names}",
  "playlist.editors.refused.isOwner_other": "A playlist já é de {names}",
  "playlist.editors.refused.creditLapsed":
    "Esta playlist já não aparece como {persona}, por isso não dá para adicionar quem gere {persona}. Recarrega a página para veres quem aparece agora",
  "playlist.editors.refused.creditLapsedUnnamed":
    "Esta playlist já não aparece como uma persona, por isso não dá para adicionar quem gere a persona. Recarrega a página para veres quem aparece agora",
  "playlist.editors.refused.unexplained_one":
    "Não dá para convidar {names} agora",
  "playlist.editors.refused.unexplained_other":
    "Não dá para convidar {names} agora",
  "playlist.editors.refused.untickAndRetry": "Desmarca e tenta outra vez",
  "playlist.editors.refused.untickToSendRest":
    "Desmarca para enviares os restantes convites",
  "playlist.editors.coOwners.listLabel": "Quem gere {persona}",
  "playlist.editors.coOwners.searchLabel": "Procurar quem gere a persona",
  "playlist.editors.coOwners.empty": "Mais ninguém gere {persona} contigo",
  "playlist.editors.coOwners.noMatch": "Ninguém corresponde a essa pesquisa",
  "playlist.editors.coOwners.addedToast": "{name} já pode editar esta playlist",
  "playlist.editors.coOwners.loadError":
    "Não conseguimos carregar quem gere a persona",
  "playlist.leave.title": "Sair de {name}?",
  "playlist.leave.body": "Deixas de a editar. As faixas que adicionaste ficam",
  "playlist.leave.confirmCta": "Sair da playlist",
  "playlist.leave.leftToast": "Saíste de {name}",
  "playlist.creditChange.title": "Mudar quem aparece na playlist?",
  "playlist.creditChange.body_one":
    "{names} deixa de editar esta playlist. As faixas que adicionou ficam",
  "playlist.creditChange.body_other":
    "{names} deixam de editar esta playlist. As faixas que adicionaram ficam",
  "playlist.creditChange.bodyUnnamed":
    "Algumas pessoas deixam de editar esta playlist. As faixas que adicionaram ficam",
  "playlist.creditChange.confirmCta": "Mudar e remover acessos",
  "playlist.add.addToCollaborativeAria":
    "Adicionar a {name}, uma playlist colaborativa",
  "kit.shelf.seeAll": "Ver tudo",
  "kit.shelf.scrollLeft": "Deslizar {title} para a esquerda",
  "kit.shelf.scrollRight": "Deslizar {title} para a direita",
  "trackRow.selectAria": "Selecionar {title}",
  "selection.regionLabel": "Faixas selecionadas",
  "selection.prompt": "Escolhe faixas",
  "selection.count_one": "{count} faixa selecionada",
  "selection.count_other": "{count} faixas selecionadas",
  "selection.selectAll": "Selecionar todas as faixas",
  "selection.clear": "Limpar seleção",
  "selection.keyboardHint": "Prime F6 para chegares às ações.",
  "selection.addToPlaylist": "Adicionar a uma playlist",
  "selection.addToQueue": "Adicionar à fila",
  "selection.removeFromPlaylist": "Remover desta playlist",
  "selection.unlike": "Remover de Músicas de que gostas",
  "selection.queuedToast_one": "Adicionaste {count} faixa à tua fila",
  "selection.queuedToast_other": "Adicionaste {count} faixas à tua fila",
  "selection.queueFailedToast":
    "Nenhuma destas faixas pode entrar na tua fila agora",
  "selection.nothingPlayableToast":
    "Nenhuma das faixas que escolheste pode tocar agora",
  "selection.pickerSubject_one": "{count} faixa",
  "selection.pickerSubject_other": "{count} faixas",
  "selection.queueFailedReasonToast":
    "Nenhuma destas faixas entrou na tua fila. {reason}",
  "selection.queuedSomeToast_one":
    "Adicionaste {count} de {total} faixas à tua fila. {reason}",
  "selection.queuedSomeToast_other":
    "Adicionaste {count} de {total} faixas à tua fila. {reason}",
  "selection.countCompact_one": "{count} selecionada",
  "selection.countCompact_other": "{count} selecionadas",

  // ── Passagem de polimento do Studio 2: heróis, carregamento, lista de faixas, ajuda de segurança, pré-visualização ──
  "hero.shareAria": "Partilhar {title}",
  "hero.blocked.noAudio": "Ainda nenhuma faixa tem áudio",
  "hero.blocked.takenDown": "Um lançamento retirado não pode tocar",
  "hero.blocked.trackNoAudio": "Esta faixa ainda não tem áudio",
  "hero.blocked.artistNoReleases": "Ainda não há lançamentos para ouvir",
  "loading.release": "A carregar este lançamento",
  "loading.track": "A carregar esta faixa",
  "loading.artist": "A carregar esta página de artista",
  "loading.scene": "A carregar esta cena",
  "loading.moreFromArtist": "A carregar mais de {artist}",
  "loading.detail": "A carregar esta página",
  "loading.previewLink":
    "A carregar as definições da ligação de pré-visualização",
  "loading.reviews": "A carregar as revisões de remoções",
  "loading.playlists": "A carregar as tuas playlists",
  "loading.openCalls": "A carregar as chamadas abertas",
  "loading.pressTrack": "A carregar a faixa",
  "pageTitle.withdrawn": "Lançamento retirado",
  "tracklist.sortLabel": "Ordenar por",
  "tracklist.sortAria": "Ordenar por {order}",
  "tracklist.searchPlaceholder": "Pesquisar por título, artista ou lançamento",
  "tracklist.searchAria": "Pesquisar em {name}",
  "tracklist.selectCta": "Selecionar faixas",
  "tracklist.sortCustom": "Ordem da playlist",
  "tracklist.sortRecentlyAdded": "Adicionadas recentemente",
  "tracklist.sortRecentlyLiked": "Gostos mais recentes",
  "tracklist.sortTitle": "Título",
  "tracklist.sortArtist": "Artista",
  "tracklist.sortDuration": "Duração",
  "tracklist.noMatch": 'Nada aqui corresponde a "{query}"',
  "safety.help.readRights": "Ler os teus direitos no Studio",
  "safety.help.contactTeam": "Falar com a nossa equipa",
  "preview.goneTitle": "Esta ligação de pré-visualização está desligada",
  "preview.goneBody":
    "A pessoa artista desligou esta ligação ou criou uma nova. Pede-lhe a ligação atual.",
  "preview.documentTitle": "Pré-visualização de {title}",

  // Studio purchases and the supporter wall (2026-10-28)
  "libraryLive.tabs.purchases": "Compras",
  "purchase.format.album": "Álbum digital",
  "purchase.format.ep": "EP digital",
  "purchase.format.single": "Single digital",
  "purchase.format.track": "Faixa digital",
  "purchase.format.release": "Lançamento digital",
  "purchase.price.nameYourPrice": "Escolhe o preço, a partir de {amount}",
  "purchase.panel.label": "Comprar {title}",
  "purchase.panel.buy.album": "Comprar álbum",
  "purchase.panel.buy.ep": "Comprar EP",
  "purchase.panel.buy.single": "Comprar single",
  "purchase.panel.buy.track": "Comprar faixa",
  "purchase.panel.buy.release": "Comprar lançamento",
  "purchase.panel.buyAria": "{action}: {title} de {artist}",
  "purchase.panel.tracksOnly":
    "Este lançamento vende-se faixa a faixa. Escolhe uma faixa abaixo para a comprar",
  "purchase.panel.directNote": "Pagas diretamente a {artist}",
  "purchase.panel.ownPersonaLink": "Abrir pagamentos por confirmar",
  "purchase.panel.owned": "Na tua coleção",
  "purchase.panel.downloadCta": "Transferir faixas",
  "purchase.panel.hideDownloadsCta": "Esconder transferências",
  "purchase.panel.pending": "À espera que {artist} confirme o teu pagamento",
  "purchase.panel.pendingAmount": "Disseste que pagaste {amount}",
  "purchase.panel.showWaysToPay": "Mostrar formas de pagar a {artist}",
  "purchase.panel.hideWaysToPay": "Esconder formas de pagar",
  "purchase.panel.cancelCta": "Cancelar esta compra",
  "purchase.panel.openPurchases": "Abrir as tuas compras",
  "purchase.panel.loading": "A carregar o preço",
  "purchase.cancel.title": "Cancelar esta compra?",
  "purchase.cancel.body":
    "{artist} deixa de ver o teu pedido. Se já pagaste, fala diretamente com {artist}",
  "purchase.cancel.confirm": "Cancelar compra",
  "purchase.cancel.keep": "Continuar à espera",
  "purchase.cancel.done": "Compra cancelada",
  "purchase.cancel.failed": "Não conseguimos cancelar esta compra",
  "purchase.sheet.title": "Comprar {title}",
  "purchase.sheet.sub": "De {artist}",
  "purchase.sheet.amountHeading": "Valor",
  "purchase.sheet.amountLabel": "O teu valor em euros",
  "purchase.sheet.amountHint": "A partir de {minimum}, até {cap}",
  "purchase.sheet.quickPicksLabel": "Valores sugeridos",
  "purchase.sheet.amountRequired": "Escreve um valor em euros, como 5 ou 5,50",
  "purchase.sheet.payHeading": "Paga a {artist}",
  "purchase.sheet.payIntro": "Paga {amount} com uma destas formas",
  "purchase.sheet.methodsLabel": "Formas de pagar a {artist}",
  "purchase.sheet.payerLabel": "Nome no pagamento (opcional)",
  "purchase.sheet.payerHint":
    "O nome que o teu banco ou o MB WAY mostra a {artist}. Só tu e {artist} o veem",
  "purchase.sheet.wallLegend": "Como apareces no mural",
  "purchase.sheet.notice":
    "Pagas diretamente a {artist}. O QueerPulse nunca toca neste dinheiro, e qualquer reembolso fica entre ti e {artist}",
  "purchase.sheet.paidCta": "Já paguei",
  "purchase.sheet.createFailed": "Não conseguimos registar o teu pagamento",
  "purchase.sheet.doneStatus":
    "{artist} vai confirmar o teu pagamento. Acompanha nas tuas compras",
  "purchase.sheet.loading": "A carregar as formas de pagar",
  "purchase.reference.label": "Código de referência",
  "purchase.reference.line":
    "Junta este código à nota do pagamento para {artist} o encontrar",
  "purchase.reference.loading": "A obter o teu código de pagamento",
  "purchase.reference.loadFailed":
    "Não conseguimos obter o teu código de pagamento",
  "purchase.reference.retryCta": "Obter um código de pagamento novo",
  "purchase.reference.neededReason":
    "O teu código de pagamento ainda está a carregar, por isso o Já paguei espera por ele",
  "purchase.reference.neededReasonFailed":
    "Obtém primeiro um código de pagamento novo",
  "purchase.reference.copyCta": "Copiar código",
  "purchase.reference.copyAria": "Copiar código para a nota do pagamento",
  "purchase.reference.copied": "Código de referência copiado",
  "purchase.reference.copyFailed":
    "Não conseguimos copiar o código. Seleciona-o e copia-o à mão",
  "purchase.status.pending": "À espera da pessoa artista",
  "purchase.status.confirmed": "Confirmada",
  "purchase.status.declined": "Recusada",
  "purchase.status.cancelled": "Cancelada",
  "purchase.status.expired": "Expirada",
  "purchase.statusLine.pending": "À espera que {artist} confirme",
  "purchase.statusLine.expired":
    "{artist} não respondeu em 30 dias, por isso este pedido expirou. Podes voltar a comprar",
  "purchase.statusLine.cancelled": "Cancelaste esta compra",
  "purchase.statusLine.declinedAgain":
    "Podes começar uma nova compra na página do lançamento",
  "purchase.declineReason.payment_not_found":
    "{artist} não encontrou o teu pagamento",
  "purchase.declineReason.amount_different":
    "{artist} recebeu um valor diferente",
  "purchase.declineReason.other": "{artist} recusou esta compra",
  "purchase.declineNoteLine": "{artist} acrescentou: {note}",
  "purchase.list.heading": "As tuas <em>compras</em>",
  "purchase.list.dek":
    "Música que compraste diretamente a artistas. As transferências abrem quando a pessoa artista confirma o teu pagamento",
  "purchase.list.label": "As tuas compras",
  "purchase.list.empty":
    "Ainda não compraste nada. Um lançamento ou uma faixa com preço tem um botão Comprar na página",
  "purchase.list.showMore": "Mostrar mais compras",
  "purchase.row.amount": "Pagaste {amount}",
  "purchase.row.date": "Comprado a {date}",
  "purchase.row.byArtist": "de {artist}",
  "purchase.row.itemGone":
    "Esta música já não está no Studio. As tuas transferências ficam",
  "purchase.downloads.heading": "Transferências",
  "purchase.downloads.listLabel": "Faixas de {title} para transferir",
  "purchase.downloads.formatNote":
    "MP3 ou M4A, tal como a pessoa artista carregou",
  "purchase.downloads.cta": "Transferir",
  "purchase.downloads.ctaAria": "Transferir {title}",
  "purchase.downloads.failed": "Não conseguimos começar esta transferência",
  "purchase.downloads.demoToast":
    "A demonstração não tem ficheiros de áudio. No Studio, a faixa fica guardada no teu dispositivo",
  "purchase.downloads.none": "Ainda não há nada para transferir",
  "purchase.downloads.mp3": "MP3",
  "purchase.downloads.m4a": "M4A",
  "purchase.wall.toggle": "Mostrar-me no mural de apoio",
  "purchase.wall.body":
    "Quem tem acesso ao Studio vê o nome e a foto que escolheres na página do lançamento, sem qualquer valor",
  "purchase.wall.shownAs": "Apareces como {name}",
  "purchase.wall.pickAgain":
    "A persona que escolheste já não existe. Escolhe como apareces",
  "purchase.wall.pendingNote":
    "Apareces quando {artist} confirmar o teu pagamento",
  "purchase.wall.saved": "Estás no mural de apoio como {name}",
  "purchase.wall.removed": "Saíste do mural de apoio",
  "purchase.wall.saveFailed":
    "Não conseguimos mudar o teu lugar no mural de apoio",
  "purchase.inbox.nav": "Pagamentos por confirmar",
  "purchase.inbox.badge_one": "{count} pagamento por confirmar",
  "purchase.inbox.badge_other": "{count} pagamentos por confirmar",
  "purchase.inbox.pageTitle": "Pagamentos por confirmar",
  "purchase.inbox.eyebrow": "Pagamentos",
  "purchase.inbox.title": "Pagamentos por <em>confirmar</em>",
  "purchase.inbox.dek":
    "Aqui sabes quando alguém te pagou. Vê o teu banco, o MB WAY ou a página de pagamento, e depois confirma ou recusa. O QueerPulse nunca vê o dinheiro",
  "purchase.inbox.personaLabel": "Página de artista",
  "purchase.inbox.tabsLabel": "Pagamentos de {name}",
  "purchase.inbox.unknownPersona":
    "Essa página de artista não é tua, por isso mostramos {name}",
  "purchase.inbox.tab.confirm": "Por confirmar",
  "purchase.inbox.tab.sales": "Vendas",
  "purchase.inbox.listLabel": "Pagamentos de {name} por confirmar",
  "purchase.inbox.empty":
    "Não há pagamentos à espera. Quando alguém disser que te pagou, aparece aqui",
  "purchase.inbox.reference": "Referência {code}",
  "purchase.inbox.payerName": "Nome no pagamento: {name}",
  "purchase.inbox.deletedAccount": "Conta apagada",
  "purchase.inbox.claimedOn": "Disse que pagou a {date}",
  "purchase.inbox.confirmCta": "Confirmar pagamento",
  "purchase.inbox.confirmAria": "Confirmar pagamento de {name} por {title}",
  "purchase.inbox.declineCta": "Recusar pagamento",
  "purchase.inbox.declineAria": "Recusar pagamento de {name} por {title}",
  "purchase.inbox.confirmed":
    "Pagamento confirmado. {name} já pode transferir {title}",
  "purchase.inbox.declined": "Pagamento recusado. {name} vê o teu motivo",
  "purchase.inbox.confirmFailed": "Não conseguimos confirmar este pagamento",
  "purchase.inbox.declineFailed": "Não conseguimos recusar este pagamento",
  "purchase.inbox.showMore": "Mostrar mais pagamentos",
  "purchase.inbox.loadingMore": "A carregar mais pagamentos",
  "purchase.decline.title": "Recusar este pagamento?",
  "purchase.decline.body":
    "{name} recebe uma notificação com o motivo que escolheres",
  "purchase.decline.reasonLegend": "Porque estás a recusar?",
  "purchase.decline.reason.payment_not_found": "Não encontro o pagamento",
  "purchase.decline.reason.amount_different": "O valor é diferente",
  "purchase.decline.reason.other": "Outro motivo",
  "purchase.decline.noteLabel": "Nota para {name} (opcional)",
  "purchase.decline.notePlaceholder": "Uma frase curta, até 200 caracteres",
  "purchase.decline.confirm": "Recusar pagamento",
  "purchase.decline.keep": "Deixar à espera",
  "purchase.sales.totalsLabel": "Os totais das tuas vendas",
  "purchase.sales.last28": "Últimos 28 dias",
  "purchase.sales.allTime": "Desde sempre",
  "purchase.sales.count_one": "{count} venda",
  "purchase.sales.count_other": "{count} vendas",
  "purchase.sales.note":
    "Os pagamentos que confirmaste. O QueerPulse guarda o registo e o dinheiro fica entre ti e quem te comprou",
  "purchase.sales.listLabel": "Vendas de {name}",
  "purchase.sales.empty":
    "Ainda sem vendas. Os pagamentos confirmados aparecem aqui",
  "purchase.sales.confirmedOn": "Confirmado a {date}",
  "purchase.sales.showMore": "Mostrar mais vendas",
  "purchase.sales.loadingMore": "A carregar mais vendas",
  "purchase.account.pageTitle": "As tuas compras de música",
  "purchase.account.eyebrow": "Conta",
  "purchase.account.title": "As tuas compras de <em>música</em>",
  "purchase.account.dek":
    "Tudo o que compraste a artistas do Studio, com as transferências. Ficam contigo com ou sem acesso ao Studio",
  "purchase.account.empty": "Ainda não há compras confirmadas",
  "purchase.account.cardTitle": "As tuas compras de música",
  "purchase.account.cardDesc":
    "Transfere a música que compraste a artistas do Studio",
  "purchase.account.cardCta": "Abrir as tuas compras de música",
  "purchase.price.legend": "Preço",
  "purchase.price.trackLegend": "Preço desta faixa",
  "purchase.price.mode.not_for_sale": "Não está à venda",
  "purchase.price.mode.fixed": "Preço fixo",
  "purchase.price.mode.name_your_price": "Quem compra escolhe o preço",
  "purchase.price.amountLabel.fixed": "Preço em euros",
  "purchase.price.amountLabel.name_your_price": "Mínimo em euros",
  "purchase.price.hint.fixed": "De {minimum} a {cap}",
  "purchase.price.hint.name_your_price":
    "De {minimum} a {cap}. Quem compra pode pagar mais, até {cap}",
  "purchase.price.amountRequired": "Escreve o preço em euros, como 5 ou 5,50",
  "purchase.price.directNote":
    "Quem compra paga-te diretamente pelas tuas formas de receber, e tu confirmas cada pagamento",
  "purchase.price.needsMethods":
    "Junta uma forma de receber antes de definir um preço",
  "purchase.price.needsMethodsCta": "Adicionar forma de receber",
  "purchase.price.notOutNote": "A compra abre quando o lançamento sair",
  "paymentMethods.label": "Receber",
  "paymentMethods.title": "Como te <em>pagam</em>",
  "paymentMethods.dek":
    "Quem compra paga-te diretamente por aqui. O QueerPulse nunca guarda o dinheiro",
  "paymentMethods.personaLabel": "Página de artista",
  "paymentMethods.listLabel": "Formas de receber de {name}",
  "paymentMethods.privacyNote":
    "Quem compra só vê isto enquanto compra ou espera a tua confirmação",
  "paymentMethods.empty":
    "Ainda não há formas de receber. Junta uma antes de pôr música à venda",
  "paymentMethods.addCta": "Adicionar forma de receber",
  "paymentMethods.saveCta": "Guardar formas de receber",
  "paymentMethods.saved":
    "Guardado. Quem compra vê estas formas de pagar a {name}",
  "paymentMethods.saveFailed":
    "Não conseguimos guardar as tuas formas de receber",
  "paymentMethods.rowError": "Forma {number}: {reason}",
  "paymentMethods.rowLegend": "Forma de receber {count}",
  "paymentMethods.lastMethodWarning":
    "Há música de {name} à venda, por isso mantém pelo menos uma forma de receber",
  "paymentMethods.noPersona":
    "Receber fica disponível quando tiveres uma página de artista",
  "wall.heading": "Com o apoio de",
  "wall.listLabel": "Pessoas que compraram {title}",
  "wall.showAll": "Mostrar todo o apoio",
  "wall.loadMoreFailed": "Não conseguimos carregar mais apoio",
  "owner.v3.paymentsLink": "Pagamentos por confirmar",
  "owner.v3.gettingPaidLink": "Receber",
  "errors.what.purchases": "as tuas compras",
  "errors.what.paymentMethods": "as tuas formas de receber",
  "errors.what.sales": "as tuas vendas",
  "errors.what.wall": "o mural de apoio",
  "errors.what.offer": "o preço desta música",
  "errors.what.paymentsInbox": "os teus pagamentos por confirmar",
  "errors.reason.studio_persona_not_found":
    "Esta página de artista não é uma das que geres",
  "errors.reason.studio_release_type_not_for_sale":
    "Só se podem vender álbuns, EPs e singles e as suas faixas",
  "errors.reason.studio_price_out_of_range":
    "Um preço fixo vai de 1 € a 500 €, e um mínimo de 0 € a 500 €",
  "errors.reason.studio_payment_methods_needed_for_sale":
    "Junta uma forma de receber antes de pôr música à venda, e mantém uma enquanto houver algo à venda",
  "errors.reason.studio_payment_methods_limit":
    "Cada artista pode ter até 8 formas de receber",
  "errors.reason.studio_payment_link_invalid":
    "Uma ligação de pagamento tem de ser um endereço https:// completo",
  "errors.reason.studio_payment_mbway_invalid":
    "O MB WAY precisa de um número de telemóvel português",
  "errors.reason.studio_payment_iban_invalid":
    "Verifica o IBAN: o código do país, o tamanho ou os dígitos de controlo não batem certo",
  "errors.reason.studio_purchase_item_required":
    "Escolhe um lançamento ou uma faixa para comprar",
  "errors.reason.studio_purchase_item_not_found":
    "Esta música não está disponível para ti",
  "errors.reason.studio_purchase_own_persona":
    "Fazes parte desta persona de artista, por isso não podes comprar a sua música",
  "errors.reason.studio_purchase_not_for_sale": "Isto não está à venda",
  "errors.reason.studio_purchase_release_not_published":
    "Este lançamento ainda não saiu, por isso não se pode comprar",
  "errors.reason.studio_purchase_track_unavailable":
    "Esta faixa não se pode comprar agora",
  "errors.reason.studio_purchase_unavailable":
    "Não podes comprar música desta persona de artista",
  "errors.reason.studio_purchase_no_payment_methods":
    "Esta persona de artista ainda não juntou uma forma de receber",
  "errors.reason.studio_purchase_pending_exists":
    "Já disseste a esta persona de artista que pagaste isto; está à espera da resposta",
  "errors.reason.studio_purchase_already_owned": "Isto já está na tua coleção",
  "errors.reason.studio_purchase_amount_below_minimum":
    "O valor está abaixo do mínimo definido",
  "errors.reason.studio_purchase_amount_above_cap":
    "Uma compra pode ir até 500 €",
  "errors.reason.studio_purchase_price_changed":
    "O preço mudou. Vê o novo preço e tenta outra vez",
  "errors.reason.studio_purchase_reference_invalid":
    "Este código de pagamento é demasiado antigo. Obtém um código novo abaixo e, se já pagaste com o antigo, escreve o código antigo no campo do nome para a pessoa artista o encontrar",
  "errors.reason.studio_purchase_reference_taken":
    "Este código de pagamento acabou de ser usado noutra compra. Obtém um código novo abaixo",
  "errors.reason.studio_purchase_not_found":
    "Esta compra não está disponível para ti",
  "errors.reason.studio_purchase_not_pending": "Esta compra já teve resposta",
  "errors.reason.studio_purchase_wall_not_available":
    "O mural de apoio está aberto a compras pendentes e confirmadas de artistas que continuam no Studio",
  "errors.reason.studio_purchase_not_confirmed":
    "As transferências abrem quando a pessoa artista confirmar o teu pagamento",
  "errors.reason.studio_download_item_deleted":
    "A pessoa artista apagou esta música, por isso já não se pode transferir",
  "errors.reason.studio_download_track_removed":
    "Esta faixa já não está no lançamento",
  "errors.reason.studio_download_release_taken_down":
    "A nossa equipa retirou este lançamento, por isso não se pode transferir",
  "errors.reason.studio_download_artist_unavailable":
    "Esta página de artista foi removida, por isso a sua música não se pode transferir",
  "errors.reason.studio_download_track_withheld":
    "Uma reclamação de direitos de autor mantém esta faixa offline, por isso não se pode transferir",
  "errors.reason.studio_download_track_not_ready":
    "Esta faixa ainda não tem áudio",
  "errors.reason.studio_download_track_preparing":
    "Estamos a preparar este ficheiro para ti. Tenta outra vez daqui a uns minutos",
  // Studio landing v2 (2026-10-28)
  "founding.badge": "Artista da fundação",
  "home.founding.title": "Artistas <em>da fundação</em>",
  "landingPreviews.title": "A tua música na página do Studio",
  "landingPreviews.sub":
    "A nossa equipa escolhe algumas faixas para tocar a quem visita a página do Studio. Ouve-se a faixa inteira, e só com o teu sim",
  "landingPreviews.listLabel": "Pedidos da página do Studio",
  "landingPreviews.status.pending": "À espera da tua resposta",
  "landingPreviews.status.approved": "Aprovada para a página do Studio",
  "landingPreviews.status.approvedOff":
    "Aprovada. Fora da página enquanto não puder tocar lá",
  "landingPreviews.credited": "Tens crédito nesta faixa de {artist}",
  "landingPreviews.requestedOn": "Pedida a {date}",
  "landingPreviews.approveCta": "Aprovar pré-escuta",
  "landingPreviews.declineCta": "Recusar pré-escuta",
  "landingPreviews.withdrawCta": "Retirar pré-escuta",
  "landingPreviews.approveLabel": "Aprovar pré-escuta de {track}",
  "landingPreviews.declineLabel": "Recusar pré-escuta de {track}",
  "landingPreviews.withdrawLabel": "Retirar pré-escuta de {track}",
  "landingPreviews.approveConfirm.title": "Tocar {track} na página do Studio?",
  "landingPreviews.approveConfirm.body":
    "Quem abrir a página do Studio pode ouvir a faixa inteira. Podes retirá-la a qualquer momento, tal como quem tiver crédito nela.",
  "landingPreviews.withdrawConfirm.title": "Tirar {track} da página do Studio?",
  "landingPreviews.withdrawConfirm.body":
    "Deixa de tocar para quem visita dentro de um minuto. Para voltar, a nossa equipa tem de pedir outra vez.",
  "landingPreviews.approved": "{track} está aprovada para a página do Studio",
  "landingPreviews.declined": "Recusaste a pré-escuta de {track}",
  "landingPreviews.withdrawn":
    "{track} sai da página do Studio dentro de um minuto",
  "landingPreviews.approveFailed": "Não conseguimos aprovar a pré-escuta",
  "landingPreviews.declineFailed": "Não conseguimos recusar a pré-escuta",
  "landingPreviews.withdrawFailed": "Não conseguimos retirar a pré-escuta",
  "errors.what.landingPreviews": "os pedidos da página do Studio",
  "errors.reason.studio_landing_preview_unavailable":
    "Esta faixa já não está na página do Studio",
  "errors.reason.studio_landing_preview_not_found":
    "Esta pré-escuta já não existe",
  "errors.reason.studio_landing_preview_track_not_eligible":
    "Esta faixa não pode tocar na página do Studio",
  "errors.reason.studio_landing_preview_exists":
    "Esta faixa já tem um pedido em aberto ou uma pré-escuta ativa",
  "errors.reason.studio_landing_previews_full":
    "Já há 10 pré-escutas em aberto. Remove uma primeiro",
  "errors.reason.studio_landing_preview_no_reachable_owner":
    "Ninguém que gere esta persona tem acesso ao Studio, por isso ninguém poderia responder",
  "errors.reason.studio_landing_preview_not_pending":
    "Alguém já respondeu a este pedido",
  "errors.reason.studio_landing_preview_not_approved":
    "Esta pré-escuta já não está na página do Studio",
  "errors.reason.studio_landing_preview_main_persona_only":
    "Só quem lançou esta faixa pode responder",
  "errors.reason.studio_landing_consent_required":
    "Marca a caixa de consentimento antes de guardar",
  "errors.reason.studio_landing_persona_not_eligible":
    "Esta persona não pode aparecer na página do Studio: a página tem de estar publicada e pública",
  "errors.reason.studio_landing_card_exists": "Esta persona já tem um cartão",
  "errors.reason.studio_landing_cards_full":
    "Já há 6 cartões de artista. Remove um primeiro",
  "errors.reason.studio_landing_card_not_found": "Este cartão já não existe",
  "errors.reason.studio_landing_photo_not_yours":
    "Usa uma fotografia que tu carregaste, ou mantém a que este espaço já tem",
  "errors.reason.studio_landing_order_mismatch":
    "A lista mudou enquanto a ordenavas. Recarrega-a e tenta outra vez",
  "errors.reason.studio_founding_persona_not_eligible":
    "Esta persona não pode ser artista da fundação: a página tem de estar publicada e pública",
  "errors.reason.studio_founding_artist_exists":
    "Esta persona já é artista da fundação",
  "errors.reason.studio_founding_artists_full": "Já há 50 artistas da fundação",
  "errors.reason.studio_founding_artist_not_found":
    "Esta persona já não está na lista da fundação",
  "errors.reason.studio_access_request_exists": "Já pediste acesso ao Studio",
  "errors.reason.studio_access_already_granted": "Já tens acesso ao Studio",
  "errors.reason.studio_access_request_not_found":
    "Este pedido já não está à espera",
  // Studio purchases: Help and terms on buying and selling
  "helpLive.cat.buying.heading": "Comprar e <em>vender</em>",
  "helpLive.cat.buying.blurb": "Preços, pagar a artistas e transferências",
  "helpLive.faq.buying.q": "Como compro música no Studio?",
  "helpLive.faq.buying.a":
    "Abre um lançamento ou uma faixa com preço e toca em Comprar. Pagas diretamente à pessoa artista com uma das suas ligações de pagamento, MB WAY ou IBAN, juntas à nota do pagamento o código que a janela de compra mostra, para a pessoa artista o encontrar, e depois tocas em Já paguei. Quando ela confirmar, transfere os ficheiros em <a>As tuas compras</a>. O QueerPulse nunca toca no dinheiro, por isso um reembolso fica entre ti e a pessoa artista.",
  "helpLive.faq.selling.q": "Como vendo a minha música?",
  "helpLive.faq.selling.a":
    "Nas <a>definições do Studio</a>, junta uma forma de receber em Receber: uma ligação de pagamento, um número MB WAY ou um IBAN. Depois define um preço fixo ou um mínimo num álbum, EP, single ou faixa no editor do lançamento. Quem compra paga-te diretamente, e tu confirmas cada pagamento em Pagamentos por confirmar. Mixes, edits, mixes de lip-sync e podcasts ficam só para ouvir.",
  "termsLive.sec.selling.num": "05: comprar e vender música",
  "termsLive.sec.selling.heading": "Vender <em>música</em>",
  "termsLive.sec.selling.p1":
    "Artistas podem pôr preço em álbuns, EPs, singles e nas suas faixas. Quem compra paga diretamente à pessoa artista, pela sua ligação de pagamento, número MB WAY ou IBAN. O QueerPulse não é parte da venda. Não guarda nem movimenta o dinheiro, e não pode reembolsar um pagamento.",
  "termsLive.sec.selling.p2":
    "Uma compra abre as transferências e o mural de apoio quando a pessoa artista confirma o pagamento. Um reembolso ou um desacordo sobre dinheiro fica entre quem compra e a pessoa artista. Se uma pessoa artista recebeu o teu pagamento e não o confirmou, denuncia a página de artista à nossa equipa.",
};
