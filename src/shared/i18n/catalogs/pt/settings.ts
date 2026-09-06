import type { Catalog } from "../../types";

/**
 * Definições — pt-PT inclusivo. Mesmas chaves que `en/settings.ts`.
 *
 * Definições relacionadas com segurança (saída rápida), privacidade
 * (visibilidade, exportação/eliminação de dados) e identidade (pronomes,
 * identidades) exigem precisão acima de estilo — ver notas junto de cada
 * chave sensível.
 */
export const settings: Catalog = {
  // ── Navegação das Definições (settings.data.ts NAV) ──────────────────────
  "nav.group.preferences": "Preferências",
  "nav.group.privacyData": "Privacidade e dados",
  "nav.group.account": "Conta",
  "nav.group.personalisation": "Personalização",
  "nav.group.dangerZone": "Zona de perigo",
  "nav.item.notifications": "Notificações",
  "nav.item.language": "Idioma e terminologia",
  "nav.item.data": "Dados e privacidade",
  "nav.item.visibility": "Visibilidade",
  "nav.item.profile": "Perfil",
  "nav.item.account": "Conta",
  "nav.item.profileTheme": "Tema do perfil",
  "nav.item.accessibility": "Acessibilidade",
  "nav.item.interests": "Interesses",
  "nav.item.blockedUsers": "Bloqueados e silenciados",
  "nav.item.uploads": "As minhas imagens",
  "nav.item.deleteAccount": "Eliminar conta",

  // ── Guia de terminologia da comunidade (settings.data.ts TERMS) ──────────
  "terms.queer.name": "Queer",
  "terms.queer.def":
    "Um termo abrangente para identidades sexuais e de género que não são heterossexuais nem cisgénero. Reapropriado de um insulto; o uso varia: algumas pessoas mais velhas da comunidade podem preferir não o usar.",
  "terms.cisgender.name": "Cisgénero",
  "terms.cisgender.def":
    "Descreve alguém cuja identidade de género corresponde ao sexo atribuído à nascença. É apenas um descritor neutro, sem qualquer juízo de valor.",
  "terms.nonBinary.name": "Não-binárie",
  "terms.nonBinary.def":
    "Uma identidade de género que existe fora do binário homem/mulher. Algumas pessoas não-binárias usam pronomes neutros; pergunta sempre, nunca presumas.",
  "terms.twoSpirit.name": "Two-spirit",
  "terms.twoSpirit.def":
    "Um termo usado por algumas culturas indígenas norte-americanas para uma pessoa que incorpora espíritos masculinos e femininos. Não é equivalente aos termos LGBTQ+ ocidentais.",

  // ── SettingsPage.tsx (barra de guardar + confirmação de eliminação) ──────
  "page.saveBar.unsaved": "Tens alterações por guardar.",
  "page.saveBar.changesCount_one": "{count} alteração",
  "page.saveBar.changesCount_other": "{count} alterações",
  "page.saveBar.discard": "Descartar",
  "page.saveBar.save": "Guardar alterações",
  "page.saveBar.savedToast": "Definições guardadas",
  "page.saveBar.saveErrorToast":
    "Não foi possível guardar as tuas alterações. Tenta novamente.",
  "page.leaveConfirm":
    "Tens alterações por guardar aqui. Queres sair sem as guardar?",

  // ── SettingsSaveBar.tsx — disclosure "o que mudou" (settings.data.ts
  //    changeLabelKey()). A maioria reutiliza um rótulo já existente; estas
  //    duas não têm um rótulo existente que resulte bem numa lista.
  "changes.interests.identities": "Identidades",
  "changes.interests.lookingFor": "O que procuras",

  // ── SettingsControls.tsx — DeleteAccountModal (primeira confirmação) ─────
  "controls.deleteModal.title": "Eliminar a tua conta?",
  "controls.deleteModal.body":
    "A eliminação apaga permanentemente o teu perfil, mensagens, publicações nas comunidades e todos os dados associados no prazo de 30 dias. Não pode ser revertida. Recomendamos que descarregues primeiro os teus dados. De seguida, vais confirmar que és tu e concluir o pedido aqui mesmo.",
  "controls.deleteModal.cancel": "Cancelar",
  "controls.deleteModal.continue": "Continuar para eliminar",

  // ── SuggestEditModal (guia de terminologia) ─────────

  // ── SettingsPersonalisation.tsx — ProfileThemePane ───────────────────────
  "personalisation.theme.title": "Tema do <em>perfil.</em>",
  "personalisation.theme.sub":
    "Personaliza o aspeto do teu perfil e do cartão no diretório. Escolhe uma bandeira, um estilo de capa e um padrão, e o que aparece junto ao teu nome.",

  // ── SettingsPersonalisation.tsx — AccessibilityPane ──────────────────────
  "personalisation.accessibility.title":
    "Preferências de <em>acessibilidade.</em>",
  "personalisation.accessibility.sub":
    "Ajusta o movimento e a navegação ao teu gosto. O que mudares aqui fica guardado assim que o alteras e aplica-se a toda a plataforma. As preferências marcadas como em breve ainda estão a ser construídas.",
  "personalisation.accessibility.resetAll": "Repor todas as preferências",
  "personalisation.accessibility.resetNote":
    "Isto repõe as preferências que podes alterar para os valores predefinidos. Os dados do teu perfil não são afetados.",
  "personalisation.accessibility.deviceNote":
    "As tuas preferências são guardadas localmente neste dispositivo.",
  "personalisation.accessibility.resetToast":
    "Todas as preferências foram repostas",

  // ── InterestsPane.tsx ─────────────────────────────────────────────────────
  // NOTA: IDENTITIES.options / LOOKING_FOR.options (interests.data.ts) são o
  // valor *guardado* de draft.identities / draft.lookingFor, lido noutros
  // pontos da app (tipo Member, diretório) fora do âmbito desta varredura.
  // Traduzir a etiqueta sem uma divisão id/label-key no mesmo âmbito
  // dessincronizaria silenciosamente o valor guardado da sua apresentação —
  // ficam em inglês, sinalizado no relatório para um follow-up coordenado.
  "interests.title": "Molda o que <em>vês.</em>",
  "interests.sub":
    "Isto é privado (não aparece no teu perfil). Ajuda-nos a mostrar-te convívios, pessoas e conteúdo relevante para ti. Podes mudar isto quando quiseres.",
  "interests.identities.heading": "Que identidades sentes como tuas?",
  "interests.identities.skip": "Saltar",
  "interests.identities.helper":
    "Seleciona quantas fizerem sentido. Usamos isto para sugerir comunidades e conteúdo relevantes. Nunca serve para te categorizar.",
  // ── Descoberta por identidade (IdentitySections.tsx) ────────────────────
  // Copy que pede uma revelação: diz o que acontece e quem vê, sem incentivar
  // a resposta. Sem alcance, sem contagens, sem "ajuda os outros a encontrar-te".
  "discoverable.heading": "Ser encontrade por identidade",
  "discoverable.helper":
    "Está desligado a não ser que o ligues. O que ligares aqui fica visível para outros membros com sessão iniciada quando filtram o diretório, e em mais lado nenhum. As tuas identidades continuam fora do teu perfil de qualquer forma.",
  "discoverable.retract":
    "Desliga e deixas de aparecer nessas pesquisas de imediato.",
  "discoverable.rowOn": "Quem filtrar por isto consegue encontrar-te.",
  "discoverable.rowOff": "Não apareces nestas pesquisas.",
  "discoverable.toggleLabel": "Encontrável como {label}",
  "discoverable.empty":
    "Ainda não há nada aqui. O que acrescentares acima, decides uma de cada vez.",
  "discoverable.unsaved":
    "As identidades que acabaste de acrescentar aparecem aqui depois de guardares.",
  "discoverable.toast.removed": "Já não apareces nessas pesquisas.",
  "discoverable.error":
    "Não foi possível guardar. Nada mudou. Tenta outra vez daqui a pouco.",

  "interests.lookingFor.heading": "O que procuras aqui?",
  "interests.lookingFor.helper": "Seleciona quantas quiseres.",
  "interests.lookingFor.showOnProfile": "Mostrar no meu perfil o que procuro",
  "interests.professional.heading": "O que fazes",
  "interests.professional.helper":
    "Estes três são públicos. Aparecem no teu cartão de perfil e ajudam as pessoas a encontrar-te pelos filtros do diretório.",
  "interests.professional.languagesHeading": "Línguas que falas",
  "interests.life.heading": "Um pouco sobre a tua vida",
  "interests.life.note": "(privado: ajuda com sugestões locais)",
  "interests.life.cityLabel": "Cidade / região",
  "interests.life.languagesLabel": "Idiomas",
  "interests.life.languagesPlaceholder": "ex.: português, inglês",
  "interests.life.ageLabel": "A tua faixa etária",
  "interests.life.ageNote": "(opcional: nunca é mostrado a outras pessoas)",
  "interests.reading.heading": "O que gostas de ler?",
  "interests.reading.frequencyHeading":
    "Com que frequência queres ter notícias nossas?",
  "interests.content.heading": "Definições de conteúdo",
  "interests.content.helper":
    "Desativar isto nunca afeta o teu acesso à comunidade, só o teu feed.",
  "interests.content.legalNote":
    "Estas preferências são privadas. Só tu e a QueerPulse podem vê-las.",

  // ── interests.data.ts — faixas etárias (só o índice é guardado) ─────────
  "interests.age.under25": "Menos de 25",
  "interests.age.25to35": "25–35",
  "interests.age.35to45": "35–45",
  "interests.age.45plus": "45+",

  // ── interests.data.ts: com que frequência o resumo do feed se junta (o
  // id "daily"/"weekly"/"important" é o valor guardado; só título/descrição
  // são traduzidos). Não fala de email: a QueerPulse não envia nenhum e nunca
  // vai enviar, por isso "ter notícias nossas" é o que chega na app. ───────
  "interests.freq.daily.title": "Resumo diário",
  "interests.freq.daily.desc":
    "Um resumo por dia com as tuas atualizações principais",
  "interests.freq.weekly.title": "Resumo semanal",
  "interests.freq.weekly.desc": "Um resumo semanal com o que importa",
  "interests.freq.important.title": "Só o importante",
  "interests.freq.important.desc":
    "Apenas notificações que precisam da tua ação",

  // ── interests.data.ts — preferências de leitura (interruptores só de UI,
  // sem valor guardado além do estado local do componente) ────────────────
  "interests.readingPref.longform": "Artigos longos e ensaios",
  "interests.readingPref.memberStories":
    "Histórias e ensaios pessoais de pessoas da comunidade",
  "interests.readingPref.resourcesGuides": "Recursos e guias",
  "interests.readingPref.communityThreads":
    "Tópicos e discussões da comunidade",

  // ── interests.data.ts — definições de conteúdo (idem) ────────────────────
  "interests.contentSetting.dating": "Conteúdo sobre convívios e relações",
  "interests.contentSetting.dating.desc":
    "Esconde publicações e encontros de comunidades de encontros, relações e kink",
  "interests.contentSetting.mentalHealth":
    "Conteúdo sobre saúde mental e bem-estar",
  "interests.contentSetting.mentalHealth.desc":
    "Esconde publicações e encontros de comunidades de saúde mental, bem-estar e recuperação",
  "interests.contentSetting.sexualityIdentity":
    "Conteúdo sobre exploração da sexualidade e identidade",
  "interests.contentSetting.sexualityIdentity.desc":
    "Esconde publicações e encontros de comunidades de sexualidade, género e assumir-se",
  "interests.content.toastError":
    "Não conseguimos guardar essa definição. Tenta novamente.",

  // ── SettingsPanes.tsx — NotificationsPane ────────────────────────────────
  "notifications.title": "Preferências de <em>notificações.</em>",
  "notifications.sub":
    "Controlo detalhado sobre o que chega até ti e como. Nunca te enviaremos algo que não tenhas pedido.",
  "notifications.toast.saveError":
    "Não foi possível guardar essa definição de notificações. Tenta novamente.",
  "notifications.toast.saveErrorReason":
    "Não foi possível guardar essa definição de notificações: {reason}.",
  "notifications.section.gatherings": "Convívios",
  "notifications.section.messagesConnections": "Mensagens e ligações",
  "notifications.section.communitiesBoard": "Comunidades e mural",
  "notifications.section.delivery": "Entrega",

  // ── Notification volume (SOC-10) ──────────────────────────────────────────
  "notifications.section.phonePush": "No teu telemóvel",
  "notifications.section.yourWork": "O teu trabalho e os teus anúncios",
  "notifications.volume.eventInvites.title": "Novo convívio anunciado",
  "notifications.volume.eventInvites.desc":
    "Quando és convidada para um convívio",
  "notifications.volume.eventReminders.title": "Lembrete de presença",
  "notifications.volume.eventReminders.desc":
    "Antes de um convívio a que disseste que ias",
  "notifications.volume.eventActivity.title":
    "Atividade nos convívios que organizas",
  "notifications.volume.eventActivity.desc":
    "Novas confirmações e convites para co-organizar",
  "notifications.volume.eventCapacity.title": "Últimos lugares",
  "notifications.volume.eventCapacity.desc":
    "Quando um convívio que guardaste, ou a que respondeste talvez, está quase cheio",
  "notifications.volume.newMessages.title": "Nova mensagem",
  "notifications.volume.newMessages.desc":
    "Quando alguém te envia uma mensagem direta",
  "notifications.volume.connections.title": "Pedidos de ligação",
  "notifications.volume.connections.desc":
    "Quando alguém pede para se ligar, envia um olá com o pedido, ou aceita o teu",
  "notifications.volume.vouches.title": "Abonações",
  "notifications.volume.vouches.desc":
    "Quando alguém abona por ti, ou por um espaço que geres",
  "notifications.volume.invitations.title": "Convites e apresentações",
  "notifications.volume.invitations.desc":
    "Quando um convite que enviaste é aceite, alguém te apresenta, ou uma comunidade te convida",
  "notifications.volume.mentions.title": "Menções",
  "notifications.volume.mentions.desc":
    "Quando alguém te nomeia numa publicação ou numa conversa",
  "notifications.volume.replies.title":
    "Respostas em conversas onde participas",
  "notifications.volume.replies.desc":
    "Quando alguém responde numa conversa em que participaste",
  "notifications.volume.posts.title": "Novas publicações nas tuas comunidades",
  "notifications.volume.posts.desc":
    "Publicações comuns e recursos partilhados. Define o nível por comunidade abaixo para manter umas salas altas e outras baixas",
  "notifications.volume.announcements.title": "Anúncios das comunidades",
  "notifications.volume.announcements.desc":
    "Apenas o que quem gere ou modera marcou como anúncio",
  "notifications.volume.topicFollows.title": "Temas que segues",
  "notifications.volume.topicFollows.desc":
    "Novas publicações num tema que escolheste seguir",
  // PRD-208. Paralelo a topicFollows acima, ver a nota no catálogo EN.
  "notifications.volume.personaFollows.title": "Personas que segues",
  "notifications.volume.personaFollows.desc":
    "Trabalho novo de uma persona que escolheste seguir",
  "notifications.volume.recognition.title": "Reconhecimento",
  "notifications.volume.recognition.desc":
    "Níveis, distintivos, apoios, créditos e novos seguidores",
  "notifications.volume.personas.title": "Personas",
  "notifications.volume.personas.desc":
    "Convites para co-gerir uma persona, e quem se juntou a uma",
  "notifications.volume.listings.title": "Anúncios que geres",
  "notifications.volume.listings.desc":
    "Perguntas públicas, edições aceites e convites para co-gerir",
  "notifications.volume.opportunities.title": "Oportunidades",
  "notifications.volume.opportunities.desc":
    "Candidaturas ao que publicaste, propostas de troca e casas que correspondem a uma pesquisa que guardaste",
  "notifications.volume.magazine.title": "A revista",
  "notifications.volume.magazine.desc":
    "Mensagens sobre uma peça em que trabalhas, e uma nova edição a sair",
  "notifications.volume.alwaysOn.label": "Sempre entregues",
  "notifications.volume.alwaysOn.desc":
    "Decisões de segurança e moderação, alertas de conta e de acesso, mudanças numa comunidade a que pertences e decisões sobre coisas que pediste são sempre entregues. Não podem ser desligadas.",
  "notifications.perCommunity.label": "Volume, comunidade a comunidade",
  "notifications.perCommunity.intro":
    "Baixa o volume de uma sala movimentada sem sair dela. É a mesma definição que a página da própria comunidade oferece.",
  "notifications.perCommunity.rowDesc": "Quanto queres ouvir desta comunidade",
  "notifications.perCommunity.level.all": "Tudo",
  "notifications.perCommunity.level.announcements": "Só anúncios",
  "notifications.perCommunity.level.muted": "Desligado",
  "notifications.delivery.quietHours.title": "Horas de silêncio",
  "notifications.delivery.quietHours.desc":
    "Segura as notificações no telemóvel durante estas horas, lidas pelo teu próprio relógio. Nada se perde: chega tudo às tuas notificações, apenas não vibra.",
  "notifications.delivery.quietHours.none": "Sem horas de silêncio",

  "notifications.phonePush.title": "Notificações no telemóvel",
  "notifications.phonePush.desc":
    "Recebe um aviso no telemóvel quando alguém te envia mensagem, mesmo com o QueerPulse fechado. Adiciona primeiro o QueerPulse ao ecrã principal.",
  "notifications.phonePush.unsupported":
    "O teu navegador ainda não consegue mostrar notificações no telemóvel.",
  "notifications.phonePush.blocked":
    "As notificações estão bloqueadas. Volta a ativá-las nas definições do navegador e tenta de novo.",
  "notifications.phonePush.previews.title": "Esconder pré-visualizações",
  "notifications.phonePush.previews.desc":
    "Mostra que chegou algo sem dizer de quem é nem o que diz. Aplica-se em todos os dispositivos onde tens sessão iniciada, incluindo no iPhone. Útil se outras pessoas conseguem ver o teu ecrã bloqueado.",
  "notifications.phonePush.previews.error":
    "Não conseguimos guardar. As tuas pré-visualizações não mudaram.",
  "notifications.phonePush.test.title": "Envia um teste a ti",
  "notifications.phonePush.test.desc":
    "Envia uma notificação para os teus dispositivos para confirmar que está tudo a funcionar.",
  "notifications.phonePush.test.action": "Enviar teste",
  "notifications.phonePush.test.sent":
    "Teste enviado. Confirma no teu dispositivo",
  "notifications.phonePush.test.error":
    "Não foi possível enviar o teste. Tenta daqui a pouco",
  "notifications.phonePush.manage.title": "Gere os teus dispositivos",
  "notifications.phonePush.manage.desc":
    "Vê todos os dispositivos que recebem as tuas notificações push e remove os que não reconheças.",
  "notifications.phonePush.manage.cta": "Gerir dispositivos",

  // ── SettingsPanes.tsx — LanguagePane ──────────────────────────────────────
  "language.title": "Idioma e <em>terminologia.</em>",
  "language.sub":
    "Uma referência viva, mantida atualizada pela comunidade. Procura um termo para veres como o usamos em toda a QueerPulse.",
  "language.section.platformPreference": "Preferência de idioma da plataforma",
  "language.interfaceLanguage.title": "Idioma da interface",
  "language.interfaceLanguage.desc":
    "O idioma que a QueerPulse usa nos menus, etiquetas e mensagens do sistema. O português ainda está a ser traduzido em toda a plataforma. Algumas páginas ficam em inglês por agora.",
  "language.section.terminologyGuide": "Guia de terminologia da comunidade",
  "language.searchPlaceholder": "Procurar termos…",

  // ── SettingsPanes.tsx — DataPane (privacidade/RGPD — precisão acima de estilo)
  "data.title": "Dados e <em>privacidade.</em>",
  "data.sub":
    "Os teus dados pertencem-te. Recolhemos o mínimo necessário para gerir a plataforma e nunca os vendemos. Podes descarregar ou eliminar tudo a qualquer momento.",
  "data.gdprBox":
    "<strong>Conforme com o RGPD.</strong> A QueerPulse está sujeita à lei de proteção de dados da UE e ao RGPD português. Os teus direitos incluem acesso, correção, portabilidade e eliminação. Esta página é como os exerces.",
  "data.section.yourData": "Os teus dados",
  "data.download.title": "Descarregar os teus dados",
  "data.download.desc":
    "Uma exportação completa do teu perfil, mensagens, publicações nas comunidades e atividade. Entregue como ficheiro JSON no prazo de 48 horas.",
  "data.download.cta": "Pedir exportação",
  "data.downloadMessages.title": "Descarregar as tuas mensagens",
  "data.downloadMessages.desc":
    "O teu histórico completo de mensagens, exportado como texto simples.",
  "data.downloadMessages.cta": "Exportar mensagens",
  "data.correct.title": "Corrigir dados incorretos",
  "data.correct.desc":
    "Se tivermos dados sobre ti que estejam factualmente incorretos, tens o direito de os fazer corrigir.",
  "data.correct.cta": "Contactar a equipa de dados",
  "data.section.cookiePrivacy": "Escolhas de cookies e privacidade",
  "data.consent.monitoring.title": "Relatórios de falhas e erros",
  "data.consent.monitoring.desc":
    "Diagnósticos automáticos quando algo falha, para conseguirmos corrigi-lo mais depressa. Sem dados de publicidade ou definição de perfis.",
  "data.cookiePrefs.title": "Gerir preferências de cookies",
  "data.cookiePrefs.desc":
    "Consulta o detalhe completo do que é guardado e muda qualquer escolha. Os cookies estritamente necessários mantêm-te com sessão iniciada e estão sempre ativos.",
  "data.cookiePrefs.cta": "Abrir preferências",
  "data.section.personalisation": "Personalização",
  "data.searchPersonalisation.title": "Personalização da pesquisa",
  "data.searchPersonalisation.desc":
    "Usa os teus interesses e ligações para melhorar as pessoas e convívios sugeridos. É uma preferência de produto que fica na tua conta, mantida à parte de qualquer monitorização.",
  "data.section.dangerZone": "Zona de perigo",
  "data.deactivate.title": "Desativar conta",
  "data.deactivate.desc":
    "O teu perfil torna-se invisível e deixas de receber notificações. Podes reativá-la a qualquer momento voltando a iniciar sessão. Os teus dados são mantidos.",
  "data.deactivate.cta": "Desativar",
  "data.deletePermanently.title": "Eliminar conta permanentemente",
  "data.deletePermanently.desc":
    "Elimina permanentemente o teu perfil, mensagens e todos os dados associados no prazo de 30 dias. Não pode ser revertido.",
  "data.deletePermanently.cta": "Eliminar conta",
  "data.fineprint":
    "Ao abrigo do artigo 17.º do RGPD, tens o direito ao apagamento. Os pedidos de eliminação são processados no prazo de 30 dias. Alguns dados podem ser mantidos quando exista uma obrigação legal para tal.",

  // ── SettingsPanes.tsx — VisibilityPane (quem pode encontrar/contactar-te)
  // Os ids "open"/"network"/"private" são o valor guardado — nunca traduzir
  // o id, só a etiqueta/descrição mostrada.
  "visibility.title": "Visibilidade do <em>perfil.</em>",
  "visibility.sub":
    "Controla quem te consegue encontrar e contactar. Podes mudar isto a qualquer momento, sem perguntas.",
  "visibility.section.whoCanSee": "Quem pode ver o teu perfil",
  "visibility.open.title": "Aberto a ligações",
  "visibility.open.desc":
    "Qualquer pessoa na rede pode ver o teu perfil e dizer olá",
  "visibility.network.title": "Só a rede",
  "visibility.network.desc": "Visível para pessoas a duas ligações de ti",
  "visibility.private.title": "Manter discreto por agora",
  "visibility.private.desc":
    "Contacto quando for a altura certa. Perfil não visível na pesquisa.",
  "visibility.section.additionalControls": "Controlos adicionais",
  "visibility.privateNetwork.label": "Manter a minha rede de confiança privada",
  "visibility.privateNetwork.help":
    "Esconde de outros membros quem te deu um voto de confiança e a quem deste um voto de confiança. A administração continua a conseguir ver, por motivos de segurança.",
  "visibility.featuredConsent.label":
    "Deixar a administração destacar-te na página inicial",
  "visibility.featuredConsent.description":
    "Membros públicos que deram o seu consentimento podem ser escolhidos para aparecer na página inicial de vez em quando. Podes desativar isto quando quiseres ficar fora dos destaques.",
  "visibility.featuredConsent.disabledHint":
    'Define primeiro a tua visibilidade como "Aberto a ligações". Só perfis públicos podem ser destacados.',
  "visibility.newArrivals.title": "Mostrar-me em «Novidades»",
  "visibility.newArrivals.desc":
    "Diz à comunidade que te juntaste recentemente",
  "visibility.suggestedConnections.title": "Aparecer em ligações sugeridas",
  "visibility.suggestedConnections.desc":
    "Permite à plataforma sugerir-te a pessoas com interesses em comum. Se desligares, continuas a ver sugestões e permaneces no diretório de membros.",
  "visibility.suggestedConnections.toastError":
    "Não conseguimos guardar essa definição. Tenta novamente.",
  "visibility.activityStatus.title": "Mostrar estado de atividade",
  "visibility.activityStatus.desc":
    "Deixa as pessoas verem há quanto tempo estiveste por cá, por alto. Guardamos o mês e nada mais fino.",
  "visibility.activityStatus.descWithBand":
    "Deixa as pessoas verem há quanto tempo estiveste por cá, por alto. Neste momento lês-te como: {band}.",
  "visibility.activityStatus.toastError":
    "Não conseguimos guardar essa definição. Tenta novamente.",

  // ── SettingsPanes.tsx — AccountPane ────────────────────────────────────────
  "account.title": "Definições da <em>conta.</em>",
  "account.sub": "Preferências de sessão e segurança.",
  "account.section.account": "Conta",
  "account.emailAddress.title": "Endereço de email",
  "account.emailAddress.desc":
    "O endereço associado à tua conta e início de sessão.",
  "account.emailAddress.notSet": "Ainda não definido",
  "account.section.security": "Segurança",
  "account.twoFactor.title": "Autenticação de dois fatores",
  "account.twoFactor.desc":
    "Entras com a Google, por isso é a verificação em dois passos da tua conta Google que protege o QueerPulse. Também protege o caminho de volta se perderes o acesso.",
  "account.twoFactor.cta": "Ativar na Google",
  "account.loginAlerts.title": "Alertas de início de sessão",
  // Nomeia os dois canais que existem. A linha anterior dizia "por email", que
  // a QueerPulse nunca conseguiu enviar e nunca vai.
  "account.loginAlerts.desc":
    "Avisa-me aqui e no telemóvel quando a minha conta iniciar sessão a partir de um dispositivo que ainda não usei",
  "account.loginAlerts.toastError":
    "Não conseguimos guardar essa definição. Tenta novamente.",
  "account.sessions.title": "Sessões ativas",
  "account.sessions.desc":
    "Vê todos os dispositivos com sessão iniciada na tua conta e termina sessão em qualquer um que não reconheças.",
  "account.sessions.cta": "Gerir sessões",
  "account.securityHub.title": "A segurança da tua conta",
  "account.securityHub.desc":
    "Como inicias sessão, que dispositivos estão com sessão iniciada agora, quais recebem notificações e os controlos de exportação e eliminação.",
  "account.securityHub.cta": "Abrir segurança",
  "account.disclosure.title": "Comunicar uma vulnerabilidade de segurança",
  "account.disclosure.desc":
    "Encontraste uma falha ou uma fragilidade no QueerPulse? A nossa política de divulgação explica como comunicá-la e o que acontece a seguir.",
  "account.disclosure.cta": "Ler a política",

  // ── AccountSecurityPage.tsx — o painel de segurança da própria pessoa (ID-15)
  // Cada linha descreve algo com um endpoint real por trás. As capacidades que
  // a plataforma não tem estão nomeadas em `notYet.*` como texto, nunca como um
  // controlo. Não há canal de email e nunca haverá, por isso o texto dos
  // alertas nomeia os dois canais que existem.
  "accountSecurity.back": "Voltar às definições da conta",
  "accountSecurity.eyebrow": "Segurança da conta",
  "accountSecurity.h1": "Quem consegue <em>entrar na tua conta.</em>",
  "accountSecurity.lead":
    "Tudo sobre a forma como inicias sessão e que dispositivos estão a levar a tua conta neste momento, num só sítio. Cada linha leva à página que a altera.",
  "accountSecurity.counting": "A verificar…",
  "accountSecurity.countUnavailable": "Não conseguimos carregar isto agora.",

  "accountSecurity.section.signIn": "Como inicias sessão",
  "accountSecurity.section.devices": "Dispositivos com a tua conta",
  "accountSecurity.section.data": "Os teus dados",
  "accountSecurity.section.more": "Noutro sítio",

  "accountSecurity.signIn.title": "Google",
  "accountSecurity.signIn.value":
    "Inicias sessão com a Google, como <strong>{email}</strong>.",
  "accountSecurity.signIn.noEmail": "a tua conta Google",
  "accountSecurity.signIn.note":
    "Esta é a única forma de entrar na tua conta, por isso não há palavra-passe para mudar aqui. Mantém a tua própria conta Google bem protegida.",

  "accountSecurity.alerts.title": "Avisar-me sobre novos inícios de sessão",
  "accountSecurity.alerts.desc":
    "Quando a tua conta iniciar sessão a partir de um dispositivo que ainda não usaste, dizemos-te aqui e nos dispositivos onde autorizaste notificações. Não enviamos email.",

  "accountSecurity.sessions.title": "Com sessão iniciada agora",
  "accountSecurity.sessions.count_one": "{count} sessão ativa.",
  "accountSecurity.sessions.count_other": "{count} sessões ativas.",
  "accountSecurity.sessions.note":
    "Uma por cada navegador ou aplicação onde tens sessão iniciada. Podes terminar qualquer uma, ou todas as outras de uma vez.",
  "accountSecurity.sessions.cta": "Ver sessões",

  "accountSecurity.push.title": "Dispositivos com notificações",
  "accountSecurity.push.count_one":
    "{count} dispositivo registado para notificações.",
  "accountSecurity.push.count_other":
    "{count} dispositivos registados para notificações.",
  "accountSecurity.push.note":
    "As notificações, incluindo os alertas de novos inícios de sessão, chegam a estes dispositivos. Remover um corta as notificações aí de imediato.",
  "accountSecurity.push.cta": "Gerir dispositivos",

  "accountSecurity.export.title": "Descarregar os teus dados",
  "accountSecurity.export.value":
    "Leva uma cópia de tudo o que guardamos sobre ti, em JSON ou CSV.",
  "accountSecurity.export.note":
    "Inicias sessão com a Google outra vez antes de o arquivo ser criado, para que uma sessão emprestada não leve os teus dados.",
  "accountSecurity.export.cta": "Começar uma exportação",

  "accountSecurity.erasure.title": "Desativar ou eliminar",
  "accountSecurity.erasure.value":
    "Esconde a tua conta e volta mais tarde, ou pede-nos para a apagar de vez.",
  "accountSecurity.erasure.note":
    "A eliminação abre um período de 30 dias que podes cancelar e termina a sessão em todo o lado. Também te pede para iniciares sessão com a Google outra vez.",
  "accountSecurity.erasure.cta": "Ver as opções",
  "accountSecurity.erasure.ctaPending": "Rever o pedido",
  "accountSecurity.erasure.pending":
    "<strong>A tua conta está marcada para ser apagada a {date}.</strong> Podes cancelar até lá.",

  "accountSecurity.disclosure.title": "Encontraste uma vulnerabilidade?",
  "accountSecurity.disclosure.value":
    "A nossa política de divulgação responsável explica o que está dentro do âmbito, como comunicar e o que acontece a seguir.",
  "accountSecurity.disclosure.cta": "Ler a política",

  "accountSecurity.notYet.title": "Ainda não disponível",
  "accountSecurity.notYet.twoFactor":
    "Um segundo fator. Hoje, quem protege o início de sessão é a verificação em dois passos da tua própria conta Google.",
  "accountSecurity.notYet.recovery":
    "Uma segunda forma de entrar que não passe pela Google. Perder a conta Google já não é o fim: escreve-nos e podemos voltar a ligar a tua conta QueerPulse a uma identidade Google com o mesmo endereço verificado.",

  "accountSecurity.compromised":
    "<strong>Achas que mais alguém está na tua conta?</strong> <sessions>Termina todas as outras sessões</sessions> primeiro, o que deixa apenas o navegador onde estás a ler isto com sessão iniciada, e depois <contact>diz-nos</contact> para podermos ver o que aconteceu.",

  // ── MyUploadsPane.tsx — imagens que a própria pessoa enviou ──────────────
  "uploads.title": "As tuas imagens",
  "uploads.intro":
    "Todas as imagens que enviaste. Apaga as que não precisares, incluindo envios duplicados sem querer.",
  "uploads.demoOnly":
    "As tuas imagens aparecem aqui quando tens sessão iniciada na app em direto.",
  "uploads.loading": "A carregar as tuas imagens…",
  "uploads.error":
    "Não conseguimos carregar as tuas imagens. Tenta novamente dentro de momentos.",
  "uploads.empty": "Ainda não enviaste nenhuma imagem.",
  "uploads.inUseCount": "Em uso ({count})",
  "uploads.notReferenced": "Sem referências",
  "uploads.unverified": "Por verificar",
  "uploads.degradedBanner":
    "Algumas verificações de utilização não correram, por isso “sem referências” pode estar incompleto. Tenta recarregar antes de eliminar.",
  "uploads.kind.avatar": "Foto de perfil",
  "uploads.kind.work-image": "Imagem de destaque",
  "uploads.kind.story-cover": "Capa de matéria",
  "uploads.kind.persona-cover": "Banner de persona",
  "uploads.kind.gathering-photo": "Foto de convívio",
  "uploads.kind.group-avatar": "Foto de grupo",
  "uploads.kind.listing-photo": "Foto do estabelecimento",
  "uploads.delete.button": "Apagar",
  "uploads.delete.title": "Apagar esta imagem?",
  "uploads.delete.confirm": "Esta ação não pode ser anulada.",
  "uploads.delete.warnInUse_one":
    "Esta imagem está a ser usada em {count} lugar. Ao apagá-la, também é removida daí, e não pode ser anulado.",
  "uploads.delete.warnInUse_other":
    "Esta imagem está a ser usada em {count} lugares. Ao apagá-la, também é removida daí, e não pode ser anulado.",
  "uploads.delete.usedInHeading": "Usada nestes lugares:",
  "uploads.delete.cta": "Apagar imagem",
  "uploads.delete.cancel": "Cancelar",
  "uploads.delete.toast.success": "Imagem apagada.",
  "uploads.delete.toast.error":
    "Não conseguimos apagar essa imagem. Tenta novamente.",

  // ── EditProfileSidebar.tsx / editProfileNav.data.tsx ─────────────────────
  "editProfile.nav.group.profile": "Perfil",
  "editProfile.nav.identity.label": "Identidade e foto",
  "editProfile.nav.bio.label": "Biografia e ocupação",
  "editProfile.nav.links.label": "Ligações e redes sociais",
  "editProfile.nav.skills.label": "Competências e interesses",
  "editProfile.nav.communities.label": "Comunidades",
  "editProfile.nav.more": "Mais",
  "editProfile.nav.pronounsGuideLink": "Guia de pronomes",

  // ── EditProfilePage.tsx (barra de guardar + confirmação de gravação) ─────
  "editProfile.savedBar.updated":
    "Guardado. Atualizado <strong>{sections}</strong>.",
  "editProfile.savedBar.upToDate": "Guardado. O teu perfil está atualizado.",
  "editProfile.saveBar.unsavedLabel": "Alterações por guardar em {sections}",
  "editProfile.saveBar.discard": "Descartar",
  "editProfile.saveBar.saving": "A guardar…",
  "editProfile.saveBar.save": "Guardar perfil",
  "editProfile.leaveConfirm":
    "Tens alterações ao perfil por guardar. Queres sair sem as guardar?",

  // ── EditProfilePane.tsx — toasts ──────────────────────────────────────────
  "editProfile.toast.photoRemoved": "Foto removida.",
  "editProfile.toast.photoRestored": "Foto restaurada a partir da Google.",

  // ── EditProfileSections.tsx — IdentitySection ────────────────────────────
  "editProfile.identity.title": "Identidade <em>e foto</em>",
  "editProfile.identity.sub":
    "É assim que apareces às outras pessoas da comunidade.",
  "editProfile.identity.uploadPhoto": "Carregar nova foto",
  "editProfile.identity.removePhoto": "Remover foto",
  "editProfile.identity.useGooglePhoto": "Usar a tua foto da Google",
  "editProfile.identity.photoHint.default":
    "JPG ou PNG · máx. 5 MB · funciona melhor em formato quadrado",
  "editProfile.identity.photoHint.google":
    "Podemos recuperar a foto da conta com que iniciaste sessão.",
  "editProfile.identity.firstNameLabel": "Nome próprio",
  "editProfile.identity.lastNameLabel": "Apelido",
  "editProfile.identity.nameHint":
    "O teu nome é o que as pessoas leem; o teu nome de utilizador abaixo é a tua identificação.",
  "editProfile.identity.locationLabel": "Localização em Lisboa",
  "editProfile.identity.locationOptional": "opcional",
  "editProfile.identity.locationPlaceholder": "ex.: Mouraria, Intendente…",
  "editProfile.identity.locationHint":
    "Apenas ao nível do bairro. Nunca a morada exata.",

  // ── EditProfileSections.tsx — PronounsSection ────────────────────────────
  "editProfile.pronouns.title": "Pronomes <em>e nome</em>",
  "editProfile.pronouns.sub":
    "O teu nome escolhido e os teus pronomes aparecem em toda a plataforma. Consulta o <a>guia de pronomes</a> se estiveres a atualizar um nome legal em toda a plataforma.",
  "editProfile.pronouns.label": "Pronomes",
  "editProfile.pronouns.writeOwnLabel": "Escreve os teus",
  "editProfile.pronouns.writeOwnPlaceholder": "Ou escreve os teus…",
  "editProfile.pronouns.removeCustomAriaLabel": "Remover {pronoun}",

  // ── EditProfileSections.tsx — BioSection ─────────────────────────────────
  "editProfile.bio.title": "Biografia <em>e ocupação</em>",
  "editProfile.bio.sub":
    "Conta à comunidade quem és. Não é preciso linguagem de currículo.",
  "editProfile.bio.label": "Biografia",
  "editProfile.bio.placeholder": "Algumas frases sobre ti…",
  "editProfile.bio.occupationLabel": "Ocupação",

  // ── LinksSection.tsx ──────────────────────────────────────────────────────
  "editProfile.links.title": "Ligações <em>e redes sociais</em>",
  "editProfile.links.sub":
    "Adiciona o teu site e perfis de redes sociais. Cada um aparece com o respetivo ícone no teu perfil.",
  "editProfile.links.platformAriaLabel": "Plataforma da ligação",
  "editProfile.links.linkAriaLabel": "Ligação de {platform}",
  "editProfile.links.removeAriaLabel": "Remover ligação de {platform}",
  "editProfile.links.addLink": "Adicionar uma ligação",

  // ── EditProfileSections.tsx — SkillsSection ──────────────────────────────
  "editProfile.skills.title": "Competências <em>e interesses</em>",
  "editProfile.skills.sub":
    "Usado para encontrar correspondências na bolsa de competências e para te ligar a pessoas com interesses semelhantes.",
  "editProfile.skills.offerLabel": "Competências que podes oferecer",
  "editProfile.skills.offerPlaceholder":
    "ex.: Aconselhamento jurídico, Design gráfico…",
  "editProfile.skills.add": "Adicionar",
  "editProfile.skills.interestsLabel": "Interesses",
  "editProfile.skills.interestsPlaceholder":
    "ex.: Política de habitação, Cinema, Culinária…",
  "editProfile.skills.removeAria": "Remover competência {name}",
  "editProfile.interests.removeAria": "Remover interesse {name}",

  // ── EditProfileSections.tsx — CommunitiesSection ─────────────────────────
  "editProfile.communities.title": "Comunidades <em>em destaque</em>",
  "editProfile.communities.sub":
    "Escolhe até 6 comunidades para mostrar no teu perfil. Comunidades privadas não podem ser destacadas.",
  "editProfile.communities.counter": "{count} / 6 em destaque",
  "editProfile.communities.capHint":
    "Podes destacar até 6. Remove uma para adicionar outra.",
  "editProfile.communities.emptyHint":
    "Ainda não estás em comunidades que possas destacar.",
  "editProfile.communities.feature": "Destacar",
  "editProfile.communities.featured": "Em destaque",
  "editProfile.communities.moveUp": "Mover para cima",
  "editProfile.communities.moveDown": "Mover para baixo",

  // ── UsernameSection.tsx ────────────────────────────────────────────────────
  "editProfile.username.title": "O teu <em>nome de utilizador</em>",
  "editProfile.username.sub":
    "Esta é a tua identificação em toda a QueerPulse: como as pessoas encontram o teu perfil. Escolhe uma que seja tua; podes mudá-la mais tarde, embora as ligações antigas deixem de apontar para aqui.",
  "editProfile.username.fieldLabel": "Nome de utilizador",
  "editProfile.username.fieldHint":
    "Letras minúsculas, números e hífenes: de 3 a 30 carateres.",
  "editProfile.username.save": "Guardar nome de utilizador",
  "editProfile.username.saving": "A guardar…",
  "editProfile.username.previewPrefix":
    "O teu perfil está em <strong>/members/{handle}</strong>",
  "editProfile.username.toast.updated": "Nome de utilizador atualizado.",
  "editProfile.username.error.taken":
    "Já há alguém com esse nome. Tenta outro.",
  "editProfile.username.error.reserved":
    "Essa palavra está reservada para a plataforma. Tenta outra.",
  "editProfile.username.error.invalid":
    "Esse nome de utilizador não é permitido. Verifica o formato e tenta novamente.",
  "editProfile.username.error.generic":
    "Não conseguimos atualizar o teu nome de utilizador agora. Tenta novamente.",

  // ── UsernameField.tsx / usernameField.data.ts ────────────────────────────
  "usernameField.defaultLabel": "Nome de utilizador",
  "usernameField.placeholder": "oteunome",
  "usernameField.checking": "A verificar…",
  "usernameField.free": "Parece livre. Este pode ser teu.",
  "usernameField.yours": "Este é o teu nome de utilizador.",
  "usernameField.reason.invalid":
    "Os nomes de utilizador têm de 3 a 30 carateres: letras minúsculas, números e hífenes.",
  "usernameField.reason.reserved":
    "Essa palavra está reservada para a plataforma. Tenta outra.",
  "usernameField.reason.taken": "Já há alguém com esse nome. Tenta outro.",

  // ── SessionsPage.tsx — chrome (os registos de sessão são mock/dados
  // vindos de GET /account/sessions — ficam em inglês) ─────────────────────
  "sessions.ago.justNow": "agora mesmo",
  "sessions.ago.unknown": "desconhecido",
  "sessions.backToAccount": "Conta",
  "sessions.eyebrow": "Segurança · Sessões ativas",
  "sessions.h1": "Onde tens <em>sessão iniciada</em> agora mesmo.",
  "sessions.lead":
    "Todos os dispositivos com uma sessão ativa. Se algo aqui parecer estranho, termina a sessão, e lê <a>o que fazer a seguir</a>.",
  "sessions.bulk.onlyDevice":
    "Este é o único dispositivo em que tens sessão iniciada.",
  "sessions.bulk.multi_one":
    "Tens sessão iniciada em <strong>{count} dispositivo</strong>. Termina a sessão em qualquer um que não reconheças.",
  "sessions.bulk.multi_other":
    "Tens sessão iniciada em <strong>{count} dispositivos</strong>. Termina a sessão em qualquer um que não reconheças.",
  "sessions.bulk.signOutAll": "Terminar sessão em todos os outros dispositivos",
  "sessions.sectionActiveNow": "Ativas agora",
  "sessions.card.badgeThis": "Esta sessão",
  "sessions.card.currentDeviceNote":
    "Estás a usar este dispositivo neste momento.",
  // Abre o User-Agent em bruto, recolhido. Nomeado pelo que é, para ninguém
  // ter de o ler para saber que o pode ignorar.
  "sessions.card.technicalDetail": "Detalhe técnico",
  "sessions.card.badgeReview": "Rever",
  "sessions.card.signedIn": "Sessão iniciada <strong>{when}</strong>",
  "sessions.card.lastActivity": "Última atividade <strong>{when}</strong>",
  "sessions.card.current": "Atual",
  "sessions.card.signOut": "Terminar sessão",
  "sessions.empty.error.title": "Não conseguimos carregar as tuas sessões",
  "sessions.empty.error.desc":
    "Em vez de te mostrarmos uma lista em que não podemos confiar, não mostrámos nada. Tenta novamente dentro de momentos.",
  "sessions.empty.none.title": "Sem sessões ativas",
  "sessions.empty.none.desc":
    "Todos os dispositivos têm sessão terminada neste momento, incluindo este, o que normalmente significa que a tua sessão está prestes a ser renovada.",
  "sessions.toast.signedOut":
    "Sessão terminada. Se não foste tu, revê as tuas sessões ativas e termina qualquer dispositivo que não reconheças.",
  "sessions.toast.signedOutError":
    "Não conseguimos terminar essa sessão. Tenta novamente.",
  "sessions.toast.signedOutAll":
    "Sessão terminada em todos os outros dispositivos",
  "sessions.toast.signedOutAllError":
    "Não conseguimos terminar as outras sessões. Tenta novamente.",
  "sessions.footNote":
    "<strong>Algo parece errado?</strong> Termina a sessão em qualquer dispositivo que não reconheças e <a>conta-nos o que aconteceu</a>. Vamos ajudar-te a proteger a tua conta.",

  // ── PushDevicesPage.tsx — chrome (os registos de dispositivos são mock/
  // dados vindos de GET /push/subscriptions — mesma convenção do
  // SessionsPage acima) ─────────────────────────────────────────────────────
  "pushDevices.ago.justNow": "agora mesmo",
  "pushDevices.ago.unknown": "desconhecido",
  "pushDevices.backToNotifications": "Notificações",
  "pushDevices.eyebrow": "Notificações · Dispositivos push",
  "pushDevices.h1":
    "Dispositivos que recebem as tuas <em>notificações push</em>.",
  "pushDevices.lead":
    "Todos os dispositivos registados para receber notificações push da QueerPulse. Remove os que não reconheças, incluindo um telemóvel perdido ou roubado.",
  "pushDevices.sectionRegistered": "Dispositivos registados",
  "pushDevices.card.registered": "Registado <strong>{when}</strong>",
  "pushDevices.card.lastUsed": "Última notificação <strong>{when}</strong>",
  "pushDevices.card.remove": "Remover",
  "pushDevices.empty.error.title":
    "Não conseguimos carregar os teus dispositivos",
  "pushDevices.empty.error.desc":
    "Em vez de te mostrarmos uma lista em que não podemos confiar, não mostrámos nada. Tenta novamente dentro de momentos.",
  "pushDevices.empty.none.title": "Ainda sem dispositivos",
  "pushDevices.empty.none.desc":
    "Ativa as notificações push num dispositivo e ele aparece aqui.",
  "pushDevices.toast.removed":
    "Dispositivo removido. Deixa de receber notificações push da QueerPulse.",
  "pushDevices.toast.removedError":
    "Não conseguimos remover esse dispositivo. Tenta novamente.",
  "pushDevices.footNote":
    "<strong>Perdeste um dispositivo?</strong> Removê-lo aqui pára as notificações push de imediato, mesmo que não consigas terminar sessão nele.",

  // ── BlockedUsersPane.tsx — chrome (registos mock de membros bloqueados
  // ficam em inglês, seguindo a convenção das sessões mock acima) ──────────
  "blockedUsers.title": "Membros que <em>silenciaste</em>.",
  "blockedUsers.sub":
    "Membros bloqueados não conseguem ver o teu perfil, enviar-te mensagens nem encontrar-te na pesquisa. Membros silenciados apenas ficam em silêncio para ti e nunca foram avisados. Estão os dois aqui e podes desfazer os dois.",
  "blockedUsers.section.blocked": "Bloqueados",
  "blockedUsers.row.blockedOn": "Bloqueado {date}",
  "blockedUsers.row.deletedMember": "Membro eliminado",
  "blockedUsers.row.unblockCta": "Desbloquear",
  "blockedUsers.empty.error.title":
    "Não conseguimos carregar os teus membros bloqueados",
  "blockedUsers.empty.error.desc":
    "Em vez de te mostrarmos uma lista em que não podemos confiar, não mostrámos nada. Tenta novamente dentro de momentos.",
  "blockedUsers.empty.none.title": "Ainda não bloqueaste ninguém",
  "blockedUsers.empty.none.desc":
    "Quando bloqueares um membro, ele aparece aqui para poderes rever ou desfazer isso a qualquer momento.",
  "blockedUsers.toast.unblocked": "{name} está desbloqueado.",
  "blockedUsers.toast.unblockedError":
    "Não conseguimos desbloquear esse membro. Tenta novamente.",

  // ── DataExportPage.tsx — hero + toast + outro ────────────────────────────
  "dataExport.hero.eyebrow": "Os teus dados · RGPD, art.º 20",
  "dataExport.hero.titleLine1": "Os teus dados.",
  "dataExport.hero.titleLine2": "Teus, para levares.",
  "dataExport.hero.sub":
    "Ao abrigo do RGPD, tens o direito de receber uma cópia de todos os dados pessoais que guardamos sobre ti, num formato legível por máquina. É aqui que os pedes. Sem formulários. Sem salas de espera. Só os teus dados.",
  "dataExport.toast.selectType": "Seleciona pelo menos um tipo de dados.",
  "dataExport.outro.titleLine1": "Perguntas sobre",
  "dataExport.outro.titleLine2": "os teus dados?",
  "dataExport.outro.sub": "Escreve-nos e uma pessoa real responde-te.",
  "dataExport.outro.cta": "Contacta-nos",

  // ── DataExportSections.tsx — DataExportSteps ─────────────────────────────
  "dataExport.steps.aria": "Progresso da exportação",
  "dataExport.steps.step1.label": "Escolhe o que exportar",
  "dataExport.steps.step1.desc":
    "Seleciona os tipos de dados que queres incluir no teu arquivo.",
  "dataExport.steps.step2.label": "Confirma a tua identidade",
  "dataExport.steps.step2.desc":
    "Pedimos-te para confirmares que és tu, aqui mesmo. Sem email nem palavra-passe.",
  "dataExport.steps.step3.label": "Descarrega o teu arquivo",
  "dataExport.steps.step3.desc":
    "É criado logo e descarregas a partir desta página.",

  // ── DataExportSections.tsx — DataExportForm ──────────────────────────────
  "dataExport.form.title": "Pede o teu <em>arquivo de dados</em>",
  "dataExport.form.sub":
    "Seleciona as categorias que queres incluir. Podes levar tudo, ou só as partes que te interessam. O teu arquivo é criado assim que o pedires.",
  "dataExport.form.includeLabel": "O que incluir",
  "dataExport.form.formatLabel": "Formato do ficheiro",
  "dataExport.form.legalNote":
    "Ao abrigo do <strong>artigo 20.º do RGPD</strong>, podes levar os teus dados contigo, num formato que outros serviços conseguem ler. O teu arquivo é criado a pedido e descarregado através de uma ligação encriptada.",
  "dataExport.form.submitting": "A pedir…",
  "dataExport.form.submit": "Pedir o meu arquivo de dados",
  "dataExport.format.both": "Ambos",

  // ── dataExport.data.ts — DATA_TYPES (form checklist) ─────────────────────
  "dataExport.type.profile.label": "Perfil e identidade",
  "dataExport.type.profile.sub": "Nome, pronomes, biografia, foto",
  "dataExport.type.messages.label": "Mensagens",
  "dataExport.type.messages.sub": "Todas as conversas diretas e de grupo",
  "dataExport.type.forumPosts.label": "Publicações no fórum",
  "dataExport.type.forumPosts.sub": "Todas as publicações, respostas, reações",
  "dataExport.type.events.label": "Eventos",
  "dataExport.type.events.sub":
    "Confirmações de presença, histórico de participação",
  "dataExport.type.connections.label": "Ligações",
  "dataExport.type.connections.sub":
    "Pessoas que segues ou com quem tens uma ligação",
  "dataExport.type.activityLog.label": "Registo de atividade",
  "dataExport.type.activityLog.sub":
    "Histórico de início de sessão, sessões em dispositivos",
  "dataExport.type.subprofiles.label": "Personas",
  "dataExport.type.subprofiles.sub":
    "Todas as personas que criaste, incluindo as não associadas",
  "dataExport.type.listings.label": "Anúncios no diretório local",
  "dataExport.type.listings.sub":
    "Anúncios de negócios ou espaços que submeteste",
  "dataExport.type.housing.label": "Habitação",
  "dataExport.type.housing.sub":
    "Anúncios de habitação, perfil de colega de casa, pedidos de visita",
  "dataExport.type.saved.label": "Itens guardados",
  "dataExport.type.saved.sub": "Marcadores e coleções guardadas",
  "dataExport.type.notifications.label": "Notificações",
  "dataExport.type.notifications.sub":
    "O teu histórico e preferências de notificações",
  "dataExport.type.consent.label": "Registos de consentimento",
  "dataExport.type.consent.sub": "A que deste consentimento, e quando",
  "dataExport.type.magazine.label": "Escrita na revista",
  "dataExport.type.magazine.sub":
    "Os teus artigos e rascunhos, na íntegra, e tudo o que submeteste",
  "dataExport.type.communities.label": "Comunidades",
  "dataExport.type.communities.sub":
    "Comunidades que geres, e todas as publicações que escreveste numa delas",
  "dataExport.type.volunteering.label": "Voluntariado",
  "dataExport.type.volunteering.sub":
    "Funções a que te candidataste, e o que aconteceu a cada uma",
  "dataExport.type.governance.label": "Governação",
  "dataExport.type.governance.sub":
    "Os teus votos e as propostas que apresentaste",
  "dataExport.type.reviews.label": "Avaliações que escreveste",
  "dataExport.type.reviews.sub":
    "Avaliações de espaços, de empregadores e de visitas a casas",
  "dataExport.type.media.label": "Ficheiros carregados",
  "dataExport.type.media.sub":
    "As tuas fotografias e imagens. Os ficheiros vêm com os formatos CSV e Ambos, que chegam num zip. O JSON lista-os sem os ficheiros.",

  // ── DataExportSections.tsx — DataExportStatus ────────────────────────────
  "dataExport.status.ready.title": "O teu arquivo está pronto",
  "dataExport.status.ready.body":
    "Está pronto para descarregares. Não enviámos nada por email. Isto fica entre ti e esta página.",
  "dataExport.status.ready.bodyWithExpiry":
    "Está pronto para descarregares. Não enviámos nada por email. Guardamo-lo aqui até <strong>{date}</strong> e depois apagamo-lo.",
  "dataExport.status.expired.title": "Essa ligação expirou",
  "dataExport.status.expired.body":
    "Não guardamos arquivos indefinidamente. Pede outra vez e criamos-te um novo.",
  "dataExport.status.failed.title": "Isso não funcionou",
  "dataExport.status.failed.body":
    "Não conseguimos construir o teu arquivo agora. Nada saiu da tua conta. Tenta novamente dentro de momentos.",
  "dataExport.status.retry": "Pedir novamente",
  "dataExport.status.building.title": "A construir o teu arquivo",
  "dataExport.status.building.body":
    "Estamos a reunir os teus dados e a prepará-los. Isto demora só um momento. Mantém-te nesta página e o teu arquivo fica pronto para descarregares aqui mesmo.",
  "dataExport.status.download": "Descarregar {filename}",

  // ── DataExportSections.tsx — DataExportIncluded ──────────────────────────
  "dataExport.included.title": "O que está <em>incluído</em>",
  "dataExport.included.sub":
    "Um resumo de cada categoria de dados que guardamos e o que cada uma contém.",

  // ── dataExport.data.ts — ACCORDION_ITEMS ─────────────────────────────────
  "dataExport.accordion.profile.title": "Perfil e identidade",
  "dataExport.accordion.profile.body":
    "O teu nome de apresentação, nome de utilizador, pronomes, biografia, ocupação, foto de perfil e quaisquer ligações que tenhas adicionado ao teu perfil.",
  "dataExport.accordion.messages.title": "Mensagens",
  "dataExport.accordion.messages.body":
    "Todas as mensagens diretas e conversas de grupo em que participaste. Inclui o conteúdo das mensagens, datas/horas e confirmações de leitura. As mensagens de pessoas que eliminaram a conta são anonimizadas.",
  "dataExport.accordion.forumPosts.title": "Publicações e respostas no fórum",
  "dataExport.accordion.forumPosts.body":
    "Cada publicação e resposta que fizeste no fórum, incluindo o tópico a que pertence, quaisquer edições e reações que deste ou recebeste.",
  "dataExport.accordion.events.title": "Eventos",
  "dataExport.accordion.events.body":
    "Eventos a que confirmaste presença, eventos que marcaste como tendo interesse, confirmação de participação quando aplicável, e quaisquer mensagens relacionadas com eventos.",
  "dataExport.accordion.connections.title": "Ligações",
  "dataExport.accordion.connections.body":
    "Uma lista das pessoas que segues, das pessoas que te seguem, e quaisquer relações de ligação explícitas. Não inclui os contactos de outras pessoas.",
  "dataExport.accordion.activitySessions.title": "Atividade e sessões",
  "dataExport.accordion.activitySessions.body":
    "Datas/horas de início de sessão, tipos de dispositivo (navegador/SO), endereços IP (apenas dos últimos 90 dias) e informação de sessões ativas. Não registamos o histórico de navegação dentro da plataforma.",
  "dataExport.accordion.preferences.title": "Preferências e definições",
  "dataExport.accordion.preferences.body":
    "As tuas preferências de notificações, definições de privacidade, seleção de idioma e qualquer outra configuração de conta que tenhas definido.",
  "dataExport.accordion.payments.title": "Pagamentos (se aplicável)",
  "dataExport.accordion.payments.body":
    "Se contribuíste para eventos pagos ou para o fundo da comunidade, um registo das datas e montantes das transações. Não guardamos dados de cartão. Os pagamentos são processados pela Stripe.",

  // ── dataExport.data.ts — shared accordion tag dictionary ─────────────────
  "dataExport.tag.name": "nome",
  "dataExport.tag.pronouns": "pronomes",
  "dataExport.tag.bio": "biografia",
  "dataExport.tag.photo": "foto",
  "dataExport.tag.occupation": "ocupação",
  "dataExport.tag.links": "ligações",
  "dataExport.tag.content": "conteúdo",
  "dataExport.tag.timestamps": "datas e horas",
  "dataExport.tag.readReceipts": "confirmações de leitura",
  "dataExport.tag.attachments": "anexos",
  "dataExport.tag.posts": "publicações",
  "dataExport.tag.replies": "respostas",
  "dataExport.tag.edits": "edições",
  "dataExport.tag.reactions": "reações",
  "dataExport.tag.rsvps": "confirmações de presença",
  "dataExport.tag.attendance": "presença",
  "dataExport.tag.interest": "interesse",
  "dataExport.tag.follows": "quem segues",
  "dataExport.tag.connections": "ligações",
  "dataExport.tag.blockedList": "lista de bloqueados",
  "dataExport.tag.logins": "inícios de sessão",
  "dataExport.tag.deviceTypes": "tipos de dispositivo",
  "dataExport.tag.ipAddresses": "endereços IP",
  "dataExport.tag.sessions": "sessões",
  "dataExport.tag.notifications": "notificações",
  "dataExport.tag.privacy": "privacidade",
  "dataExport.tag.language": "idioma",
  "dataExport.tag.appearance": "aparência",
  "dataExport.tag.transactions": "transações",
  "dataExport.tag.amounts": "montantes",
  "dataExport.tag.dates": "datas",
  "dataExport.demoArchiveNote":
    "Exportação de demonstração gerada no navegador. Nenhum dado pessoal saiu deste dispositivo.",

  // ── SaveButton.tsx — controlo de guardar reutilizável ────────────────────

  // ── AccessibilityPrefSections.tsx — as linhas do painel de acessibilidade.
  // Todas funcionam. O PRD-307 removeu as sete que estavam marcadas como em
  // breve e inertes, e construiu o cursor do tamanho do texto.
  "a11y.instantSaveHint": "Guardado neste dispositivo assim que o alteras.",
  "a11y.section.display.eyebrow": "Visualização",
  "a11y.section.display.desc":
    "O tamanho do texto aplica-se a toda a plataforma e cresce ao mesmo tempo em títulos, etiquetas e parágrafos.",
  "a11y.textSize.label": "Tamanho do texto",
  "a11y.textSize.value": "{percent}%",
  "a11y.textSize.preview":
    "A raposa castanha atravessou o Príncipe Real e encontrou uma comunidade à espera do outro lado.",
  "a11y.section.motion.eyebrow": "Movimento",
  "a11y.section.motion.desc":
    "Controla animações e transições em toda a plataforma.",
  "a11y.toggle.reduceMotion.title": "Reduzir movimento",
  "a11y.toggle.reduceMotion.desc":
    "Desativa animações, transições e efeitos de pulsação em toda a plataforma.",
  "a11y.preview.liveLabel": "Pré-visualização em direto",
  "a11y.preview.cardText":
    "Este cartão anima ao carregar. Muda as definições de movimento para veres o efeito.",
  "a11y.section.reading.eyebrow": "Leitura",
  "a11y.section.reading.desc":
    "Ajusta a forma como o conteúdo é apresentado para uma leitura confortável.",
  "a11y.toggle.wideSpacing.title": "Abrir o espaçamento do texto",
  "a11y.toggle.wideSpacing.desc":
    "Acrescenta espaço entre linhas, letras, palavras e parágrafos, no corpo do texto, nas listas e nas citações.",
  "a11y.toggle.focusRings.title": "Mostrar sempre o anel de foco",
  "a11y.toggle.focusRings.desc":
    "Marca o elemento onde estás depois de cada clique, toque e tecla. Normalmente o anel aparece só quando a plataforma lê a tua interação como navegação por teclado.",
  "a11y.section.interaction.eyebrow": "Interação",
  "a11y.section.interaction.desc":
    "Ajusta a forma como interages com a plataforma.",
  "a11y.toggle.skipLink.title": "Ligação para saltar para o conteúdo",
  "a11y.toggle.skipLink.desc":
    "Ligado por predefinição. Pressiona Tab e aparece no topo uma ligação «Saltar para o conteúdo principal», para passares a navegação de uma vez. Desligar remove esse atalho. A ligação fica escondida até receber foco, por isso deixá-la ligada não te custa nada.",

  // ── DeleteAccountPage.tsx / DeleteAccountSection.tsx / DeleteAccountSections.tsx
  // — o fluxo de saída. Precisão acima de estilo (zona de perigo).
  "deleteAccount.sidebar.account": "Conta",
  "deleteAccount.sidebar.editProfile": "Editar perfil",
  "deleteAccount.sidebar.privacy": "Privacidade",
  "deleteAccount.sidebar.dangerZone": "Zona de perigo",
  "deleteAccount.sidebar.deactivateAccount": "Desativar conta",
  "deleteAccount.page.title": "Estás a sair da <em>QueerPulse?</em>",
  "deleteAccount.page.sub":
    "Lamentamos que te vás embora. Antes de decidires, escolhe a opção que se adequa à tua situação.",
  "deleteAccount.pending.title": "Eliminação <em>agendada.</em>",
  "deleteAccount.pending.sub":
    "Pediste para eliminarmos a tua conta. Eis a situação atual.",
  "deleteAccount.pauseStrip.text":
    "Não tens a certeza? Podes antes <strong>baixar o volume</strong>. Escolhe que notificações te chegam e define horas de silêncio para o telemóvel descansar de noite. O teu lugar aqui fica, com menos ruído.",
  "deleteAccount.pauseStrip.cta": "Escolher as tuas notificações",
  "deleteAccount.whatHappens.title.deactivate":
    "O que acontece quando desativas",
  "deleteAccount.whatHappens.title.delete": "O que acontece quando eliminas",
  "deleteAccount.confirm.typeLabel":
    "Escreve <strong>«{phrase}»</strong> para confirmares",
  "deleteAccount.confirm.cancelBtn": "Cancelar",
  "deleteAccount.pending.cancelling": "A cancelar…",
  "deleteAccount.pending.cancelBtn": "Cancelar eliminação",
  "deleteAccount.toast.cancelled": "Eliminação cancelada. Bem-vinde de volta.",
  "deleteAccount.toast.cancelError":
    "Não conseguimos cancelar isso agora. Tenta novamente.",

  // ── Reautenticação (useReauthToken.ts) ────────────────────────────────────
  "reauth.completion.success":
    "Reautenticação confirmada. Carrega em confirmar outra vez para terminar.",
  "reauth.completion.failed":
    "Não conseguimos confirmar que eras tu. Tenta novamente.",
  "deleteAccount.options.deactivate.title": "Desativar",
  "deleteAccount.options.deactivate.desc":
    "O teu perfil torna-se invisível. Os teus dados são preservados. Podes reativá-la a qualquer momento voltando a iniciar sessão.",
  "deleteAccount.options.deactivate.tag": "Reversível",
  "deleteAccount.options.delete.title": "Eliminar conta",
  "deleteAccount.options.delete.desc":
    "Apaga permanentemente a tua conta e todos os dados associados no prazo de 30 dias. Não pode ser revertido.",
  "deleteAccount.options.delete.tag": "Permanente",
  "deleteAccount.pending.banner":
    "<strong>A tua conta está agendada para eliminação.</strong> Está tudo oculto agora e será permanentemente apagado a <strong>{date}</strong>. Mudaste de ideias? Ainda podes cancelar e continuar de onde ficaste.",
  "deleteAccount.wh.deactivate.profileHidden":
    "O teu <strong>perfil fica oculto</strong> de imediato. Nenhuma outra pessoa o consegue encontrar ou ver.",
  "deleteAccount.wh.deactivate.dataPreserved":
    "Os teus <strong>dados são totalmente preservados</strong>: mensagens, publicações e histórico mantêm-se intactos.",
  "deleteAccount.wh.deactivate.reactivateInstantly":
    "<strong>Reativa instantaneamente</strong> ao iniciares sessão de novo com a Google.",
  "deleteAccount.wh.deactivate.nameRemoved":
    "O teu <strong>nome é removido</strong> das listas de pessoas e dos resultados de pesquisa.",
  "deleteAccount.wh.deactivate.attributedDeactivated":
    "As confirmações de presença em eventos e as contribuições no fórum ficam <strong>atribuídas a [pessoa desativada]</strong>.",
  "deleteAccount.wh.delete.queuedForDeletion":
    "<strong>Todos os teus dados ficam em fila para eliminação</strong> e são permanentemente apagados no prazo de 30 dias.",
  "deleteAccount.wh.delete.messagesDeleted":
    "As mensagens que enviaste <strong>são eliminadas de todas as conversas</strong>. Quem as recebeu também as perde.",
  "deleteAccount.wh.delete.postsRemoved":
    "As tuas publicações no fórum são <strong>permanentemente removidas</strong>. O conteúdo é eliminado por completo.",
  "deleteAccount.wh.delete.emailSuppressed":
    "O teu endereço de email é <strong>adicionado a uma lista de supressão</strong> para não recriarmos a tua conta por acidente.",
  "deleteAccount.wh.delete.exportFirst":
    "Podes pedir um <strong>arquivo de dados antes de eliminares</strong>. Faz isso primeiro.",
  "deleteAccount.phrase.deactivate": "desativar a minha conta",
  "deleteAccount.phrase.delete": "eliminar a minha conta",
  "deleteAccount.confirmHint.deactivate":
    "Podes desfazer isto a qualquer momento voltando a iniciar sessão.",
  "deleteAccount.confirmHint.delete":
    "Vais ter 30 dias para mudar de ideias. Depois disso não pode ser revertido.",
  "deleteAccount.btnLabel.deactivate": "Desativar a minha conta",
  "deleteAccount.btnLabel.delete": "Eliminar permanentemente a minha conta",

  // ── DestructiveActionFlow.tsx + destructiveFlows.data.tsx — diálogo
  // partilhado de confirmação → carregamento → resultado ──────────────────
  "destructiveFlow.backToHome": "Voltar à QueerPulse",
  "destructiveFlow.error.title": "Isso não <em>correu bem.</em>",
  "destructiveFlow.error.body":
    "Não conseguimos concluir isto agora. Nada foi alterado. Verifica a tua ligação e tenta novamente, ou volta dentro de momentos.",
  "destructiveFlow.error.close": "Fechar",
  "destructiveFlow.error.tryAgain": "Tentar novamente",
  "destructiveFlow.confirm.notNow": "Agora não",
  "destructiveFlow.deactivate.eyebrow": "Desativar conta",
  "destructiveFlow.deactivate.title":
    "Ocultar o teu perfil <em>por agora?</em>",
  "destructiveFlow.deactivate.body":
    "O teu perfil torna-se invisível e as notificações param. <strong>Nada é eliminado</strong>. Volta a iniciar sessão quando quiseres e continuas exatamente de onde ficaste.",
  "destructiveFlow.deactivate.confirmLabel": "Desativar",
  "destructiveFlow.deactivate.loadingText": "A desativar a tua conta…",
  "destructiveFlow.deactivate.resultTitle": "Sessão <em>terminada.</em>",
  "destructiveFlow.deactivate.resultBody":
    "O teu perfil está oculto e os teus dados estão guardados em segurança. Quando quiseres voltar, inicia sessão e tudo estará à tua espera. Estaremos aqui.",
  "destructiveFlow.delete.eyebrow": "Eliminar conta",
  "destructiveFlow.delete.title": "Eliminar <em>permanentemente?</em>",
  "destructiveFlow.delete.body":
    "Isto coloca o teu perfil, mensagens e todos os dados associados em fila para eliminação no prazo de 30 dias. <strong>Isto não pode ser revertido.</strong>",
  "destructiveFlow.delete.confirmLabel": "Eliminar a minha conta",
  "destructiveFlow.delete.loadingText": "A agendar a eliminação da tua conta…",
  "destructiveFlow.delete.resultTitle": "Está <em>agendado.</em>",
  "destructiveFlow.delete.resultBody":
    "A tua conta está agendada para eliminação. Tens <strong>30 dias</strong> para mudar de ideias. Basta voltares a iniciar sessão com a Google e paramos a eliminação. Depois disso, os teus dados são permanentemente apagados. Cuida de ti.",

  // ── ThemeStudio.tsx / profileTheme.data.ts — seletor de tema do perfil.
  // Os NOMES das bandeiras (FLAG_SWATCHES.label) ficam deliberadamente em
  // inglês — vários são neologismos contestados em pt-PT ("aromantic") e
  // ficam sinalizados para revisão por falante nativo em vez de adivinhados.
  "themeStudio.sectionLabel": "Tema do perfil",
  "themeStudio.sub":
    "Mostrado no teu perfil público e no diretório de pessoas.",
  "themeStudio.prideThemesLabel": "Temas de orgulho",
  "themeStudio.coverStyleLabel": "Estilo de capa",
  "themeStudio.coverPatternLabel": "Padrão de capa",
  "themeStudio.badgeDisplayLabel": "Exibição de distintivo",
  "themeStudio.showBadgesToggle": "Mostrar distintivos no perfil",
  "themeStudio.showLevelToggle": "Mostrar nível no perfil",
  "themeStudio.previewLabel": "Pré-visualização",
  "themeStudio.previewHintTop":
    "Atualiza-se em direto à medida que escolhes um tema. Guardado neste navegador como pré-visualização. Ainda não aparece no teu perfil público.",
  "themeStudio.profileCardLabel": "Cartão de perfil",
  "themeStudio.directoryCardLabel": "Cartão no diretório",
  "themeStudio.directoryHint":
    "É assim que o teu perfil aparece nos resultados de pesquisa e no diretório de pessoas.",
  "themeStudio.memberSince": "Lisboa · Aqui desde {year}",
  // Ver a nota no catálogo EN.
  "themeStudio.levelPreview": "Nív.{level} · {name}",
  "themeStudio.cover.stripe": "Risca arrojada",
  "themeStudio.pattern.none": "Liso",
  "themeStudio.pattern.stripe": "Riscas diagonais",
  "themeStudio.pattern.dots": "Grelha de pontos",
  "themeStudio.pattern.grid": "Grelha",

  // ── AccountDataSheet.tsx — o painel "Os teus dados" do perfil, que agora
  // encaminha para a página que trata de cada ação em vez de construir uma
  // segunda cópia das quatro. PRD-09. ─────────────────────────────────────
  "accountData.download.title": "Descarregar os teus dados",
  "accountData.download.desc":
    "Escolhe o que incluir e recebe um arquivo legível por máquina. RGPD, artigo 20.",
  "accountData.download.cta": "Abrir exportação de dados",
  "accountData.stepAway.title": "Pausar ou apagar a tua conta",
  "accountData.stepAway.desc":
    "Esconde o teu perfil durante uns tempos, ou pede que tudo seja apagado. Ambos exigem uma confirmação escrita e uma nova entrada com a Google. RGPD, artigo 17.",
  "accountData.stepAway.cta": "Abrir pausar e apagar",
  "accountData.dsar.title": "Fazer um pedido sobre os teus dados",
  "accountData.dsar.desc":
    "Pergunta o que guardamos sobre ti, pede uma correção, ou opõe-te à forma como é usado. RGPD, artigos 15, 16 e 21.",
  "accountData.dsar.cta": "Abrir o formulário",
  "accountData.note":
    "Cada um destes abre numa página completa, para leres exatamente o que faz antes de avançares.",

  // Deep-scan section 13 (the vertical surfaces), built 2026-08-31.
  // PRD-48-FE — PRD-48 - the member's own submissions index at /account/submissions (MySubmissionsPage), plus the Settings > Account card that leads to it. Three intakes on one page: partner applications, swap proposals sent, resource suggestions. Each keeps its own status vocabulary on purpose. `resource.status.archived` is queue tidying rather than a verdict, so its copy must never read as a refusal. Nothing here may promise an email: QueerPulse sends none.
  "account.submissions.title": "O que enviaste",
  "account.submissions.desc":
    "Candidaturas a parceria, propostas de troca e sugestões de recursos, cada uma com o ponto de situação e a decisão.",
  "account.submissions.cta": "Abrir as tuas submissões",
  "mySubmissions.backToAccount": "Conta",
  "mySubmissions.eyebrow": "A tua conta · Submissões",
  "mySubmissions.h1": "O que <em>enviaste</em>, e no que deu.",
  "mySubmissions.lead":
    "Tudo o que submeteste para alguém rever, e o ponto de situação de cada coisa. As respostas chegam aqui e às tuas notificações. A QueerPulse não envia email, por isso é nesta página que a decisão fica depois de limpares o sino.",
  "mySubmissions.footNote":
    "Só aparecem aqui as submissões que passam por uma fila de revisão. As publicações, encontros e anúncios que publicas ficam logo online, por isso não há nada a aguardar.",
  "mySubmissions.emptyAll.title": "Ainda não enviaste nada",
  "mySubmissions.emptyAll.description":
    "Candidata uma organização a parceira, propõe uma troca na bolsa de competências ou sugere uma entrada para o diretório de recursos, e passa a aparecer aqui com a respetiva resposta.",
  "mySubmissions.row.sentOn": "Enviado a {date}",
  "mySubmissions.row.decidedOn": "Respondido a {date}",
  // PRD-263: ver a nota no catálogo EN.
  "mySubmissions.partner.manageProfileCta": "Gerir o perfil da tua organização",
  "mySubmissions.partner.heading": "Candidaturas a parceria",
  "mySubmissions.partner.kind": "Candidatura a parceria",
  "mySubmissions.partner.status.pending": "Com a equipa de parcerias",
  "mySubmissions.partner.status.approved": "Aprovada",
  "mySubmissions.partner.status.rejected": "Não aprovada",
  "mySubmissions.partner.noteLabel": "Da equipa de parcerias",
  "mySubmissions.partner.noReason":
    "Não ficou registada nenhuma razão para esta.",
  "mySubmissions.partner.empty.title": "Sem candidaturas a parceria",
  "mySubmissions.partner.empty.description":
    "Ainda não candidataste nenhuma organização a parceira da QueerPulse.",
  "mySubmissions.partner.error.title":
    "Não conseguimos carregar as tuas candidaturas a parceria",
  "mySubmissions.partner.error.description":
    "O resto desta página continua a funcionar. Tenta esta secção outra vez.",
  "mySubmissions.barter.heading": "Propostas de troca que enviaste",
  "mySubmissions.barter.kind": "Proposta de troca",
  "mySubmissions.barter.status.pending": "Com quem publicou",
  "mySubmissions.barter.status.accepted": "Aceite por quem publicou",
  "mySubmissions.barter.status.declined": "Recusada por quem publicou",
  "mySubmissions.barter.listingGone": "Esta troca já não está no quadro",
  "mySubmissions.barter.editedAfter":
    "Quem publicou alterou esta troca depois de a tua oferta ter seguido, por isso pode já não dizer o mesmo que dizia quando propuseste.",
  "mySubmissions.barter.link": "Abrir as tuas trocas",
  "mySubmissions.barter.empty.title": "Sem propostas de troca",
  "mySubmissions.barter.empty.description":
    "Ainda não ofereceste uma troca no anúncio de outra pessoa.",
  "mySubmissions.barter.error.title":
    "Não conseguimos carregar as tuas propostas de troca",
  "mySubmissions.barter.error.description":
    "O resto desta página continua a funcionar. Tenta esta secção outra vez.",
  "mySubmissions.resource.heading": "Recursos que sugeriste",
  "mySubmissions.resource.kind": "Sugestão de recurso",
  "mySubmissions.resource.status.pending": "A aguardar revisão",
  "mySubmissions.resource.status.approved": "Adicionado ao diretório",
  "mySubmissions.resource.status.declined": "Não adicionado",
  "mySubmissions.resource.status.archived": "Fechado sem decisão",
  "mySubmissions.resource.archivedNote":
    "Ninguém recusou isto. A fila fechou a sugestão sem chegar a decidir, normalmente porque o recurso já está listado ou porque a sugestão ficou desatualizada.",
  "mySubmissions.resource.noteLabel": "De quem reviu",
  "mySubmissions.resource.noReason":
    "Não ficou registada nenhuma razão para esta.",
  "mySubmissions.resource.empty.title": "Sem sugestões de recursos",
  "mySubmissions.resource.empty.description":
    "Ainda não sugeriste nenhuma entrada para o diretório de recursos.",
  "mySubmissions.resource.error.title":
    "Não conseguimos carregar as tuas sugestões de recursos",
  "mySubmissions.resource.error.description":
    "O resto desta página continua a funcionar. Tenta esta secção outra vez.",

  // ── Deep-scan section 6 (Gatherings), built 2026-09-06 ────────────────────
  // PRD-186 — ver a nota no catálogo EN.
  "notifications.reminderLead.title": "Lembra-me",
  "notifications.reminderLead.desc":
    "Quanto tempo antes de um encontro começar. Só se aplica com os lembretes ligados.",
  "notifications.reminderLead.option.60": "Uma hora antes",
  "notifications.reminderLead.option.1440": "Um dia antes",
  "notifications.reminderLead.option.10080": "Uma semana antes",

  // ── Deep-scan section 12 (PRD-308), built 2026-09-06 ──────────────────────
  // SessionsPage.tsx — ver a nota no catálogo EN. "Nos outros dispositivos" e
  // "em todo o lado" têm de se ler como dois atos diferentes, porque quem
  // procura este controlo costuma estar assustade.
  "sessions.bulk.signOutOthers": "Terminar sessão nos outros dispositivos",
  "sessions.bulk.signOutEverywhere": "Terminar sessão em todo o lado",
  "sessions.everywhere.confirmTitle":
    "Terminar sessão em todos os dispositivos?",
  "sessions.everywhere.confirmBody":
    "Isto termina todas as sessões da tua conta, incluindo a deste dispositivo, por isso a tua sessão aqui termina assim que confirmares. Volta a iniciar sessão com a tua conta Google quando quiseres. Não se apaga nada da tua conta.",
  "sessions.everywhere.confirmCta": "Terminar sessão em todo o lado",
  "sessions.toast.signedOutEverywhere":
    "Sessão terminada em todos os dispositivos",
  "sessions.toast.signedOutEverywhereError":
    "Não conseguimos terminar a sessão em todo o lado neste momento. Continuas com sessão iniciada, por isso tenta novamente.",
};
