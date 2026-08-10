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
  "nav.group.prototype": "Protótipo",
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
  "nav.item.uploads": "As minhas imagens",
  "nav.item.simulations": "Simulações",
  "nav.item.deleteAccount": "Eliminar conta",

  // ── Guia de terminologia da comunidade (settings.data.ts TERMS) ──────────
  "terms.queer.name": "Queer",
  "terms.queer.def":
    "Um termo abrangente para identidades sexuais e de género que não são heterossexuais nem cisgénero. Reapropriado de um insulto; o uso varia — algumas pessoas mais velhas da comunidade podem preferir não o usar.",
  "terms.cisgender.name": "Cisgénero",
  "terms.cisgender.def":
    "Descreve alguém cuja identidade de género corresponde ao sexo atribuído à nascença. Não é um juízo de valor — é apenas um descritor neutro.",
  "terms.nonBinary.name": "Não-binárie",
  "terms.nonBinary.def":
    "Uma identidade de género que existe fora do binário homem/mulher. Algumas pessoas não-binárias usam pronomes neutros; pergunta sempre, nunca presumas.",
  "terms.twoSpirit.name": "Two-spirit",
  "terms.twoSpirit.def":
    "Um termo usado por algumas culturas indígenas norte-americanas para uma pessoa que incorpora espíritos masculinos e femininos. Não é equivalente aos termos LGBTQ+ ocidentais.",

  // ── SettingsPage.tsx (barra de guardar + confirmação de eliminação) ──────
  "page.saveBar.unsaved": "Tens alterações por guardar.",
  "page.saveBar.discard": "Descartar",
  "page.saveBar.save": "Guardar alterações",
  "page.saveBar.savedToast": "Definições guardadas",
  "page.saveBar.saveErrorToast":
    "Não foi possível guardar as tuas alterações. Tenta novamente.",
  "page.leaveConfirm":
    "Tens alterações por guardar aqui. Queres sair sem as guardar?",

  // ── SettingsControls.tsx — DeleteAccountModal (primeira confirmação) ─────
  "controls.deleteModal.title": "Eliminar a tua conta?",
  "controls.deleteModal.body":
    "A eliminação apaga permanentemente o teu perfil, mensagens, publicações nas comunidades e todos os dados associados no prazo de 30 dias. Não pode ser revertida. Recomendamos que descarregues primeiro os teus dados. De seguida, vais confirmar que és tu e concluir o pedido aqui mesmo.",
  "controls.deleteModal.cancel": "Cancelar",
  "controls.deleteModal.continue": "Continuar para eliminar",

  // ── SettingsModals.tsx — chrome partilhado dos modais ────────────────────
  "modals.common.close": "Fechar",
  "modals.common.done": "Concluído",

  // ── SettingsModals.tsx — SuggestEditModal (guia de terminologia) ─────────
  "modals.suggestEdit.ariaLabel": "Sugerir uma alteração a {term}",
  "modals.suggestEdit.success.title": "Agradecemos — <em>anotado.</em>",
  "modals.suggestEdit.success.body":
    "A tua sugestão de alteração a <strong>{term}</strong> está com a nossa equipa editorial da comunidade. As alterações de terminologia são revistas antes de serem publicadas; iremos avisar-te do que acontece.",
  "modals.suggestEdit.eyebrow": "Terminologia · sugerir uma alteração",
  "modals.suggestEdit.title": "Refina <em>{term}.</em>",
  "modals.suggestEdit.desc":
    "Este guia é editado pela comunidade. Sugere uma redação mais clara ou uma correção — todas as alterações são revistas antes de serem publicadas.",
  "modals.suggestEdit.wordingLabel": "A tua sugestão de redação",
  "modals.suggestEdit.wordingPlaceholder":
    "Uma definição mais clara de «{term}»…",
  "modals.suggestEdit.whyLabel": "Porquê mudar?",
  "modals.suggestEdit.optional": "(opcional)",
  "modals.suggestEdit.whyPlaceholder": "Contexto que ajude a equipa editorial",
  "modals.suggestEdit.sending": "A enviar…",
  "modals.suggestEdit.send": "Enviar sugestão",
  "modals.suggestEdit.cancel": "Cancelar",

  // ── SettingsModals.tsx — DataExportModal (transferência simulada) ───────
  "modals.dataExport.eyebrow": "Dados e privacidade",
  "modals.dataExport.preparingBody":
    "A reunir os teus dados e a preparar um ficheiro JSON. Isto costuma demorar um momento…",
  "modals.dataExport.readyTitle": "A tua exportação está <em>pronta.</em>",
  "modals.dataExport.readyBody":
    "Preparámos os teus dados em <strong>{filename}</strong>. Não enviamos nada por email — descarregas aqui mesmo, nesta página.",
  "modals.dataExport.downloadCta": "Descarregar {filename}",

  // ── SettingsPersonalisation.tsx — ProfileThemePane ───────────────────────
  "personalisation.theme.title": "Tema do <em>perfil.</em>",
  "personalisation.theme.sub":
    "Personaliza o aspeto do teu perfil e do cartão no diretório. Escolhe uma bandeira, um estilo de capa e um padrão — e o que aparece junto ao teu nome.",

  // ── SettingsPersonalisation.tsx — AccessibilityPane ──────────────────────
  "personalisation.accessibility.title":
    "Preferências de <em>acessibilidade.</em>",
  "personalisation.accessibility.sub":
    "Ajusta a visualização, o movimento, a leitura e a interação ao teu gosto. Estas definições aplicam-se a toda a plataforma.",
  "personalisation.accessibility.resetAll": "Repor todas as preferências",
  "personalisation.accessibility.resetNote":
    "Isto repõe todas as definições de visualização para os valores predefinidos. Os dados do teu perfil não são afetados.",
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
    "Isto é privado — não aparece no teu perfil. Ajuda-nos a mostrar-te convívios, pessoas e conteúdo relevante para ti. Podes mudar isto quando quiseres.",
  "interests.identities.heading": "Que identidades sentes como tuas?",
  "interests.identities.skip": "Saltar",
  "interests.identities.skipped": "Saltado",
  "interests.identities.helper":
    "Seleciona quantas fizerem sentido. Usamos isto para sugerir comunidades e conteúdo relevantes — não para te categorizar.",
  // ── Descoberta por identidade (IdentitySections.tsx) ────────────────────
  // Copy que pede uma revelação: diz o que acontece e quem vê, sem incentivar
  // a resposta. Sem alcance, sem contagens, sem "ajuda os outros a encontrar-te".
  "discoverable.heading": "Ser encontrade por identidade",
  "discoverable.helper":
    "Está desligado a não ser que o ligues. O que ligares aqui fica visível para outros membros com sessão iniciada quando filtram o diretório — e em mais lado nenhum. As tuas identidades continuam fora do teu perfil de qualquer forma.",
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
    "Não foi possível guardar — nada mudou. Tenta outra vez daqui a pouco.",

  "interests.lookingFor.heading": "O que procuras aqui?",
  "interests.lookingFor.helper": "Seleciona quantas quiseres.",
  "interests.lookingFor.showOnProfile": "Mostrar no meu perfil o que procuro",
  "interests.life.heading": "Um pouco sobre a tua vida",
  "interests.life.note": "(privado — ajuda com sugestões locais)",
  "interests.life.cityLabel": "Cidade / região",
  "interests.life.languagesLabel": "Idiomas",
  "interests.life.languagesPlaceholder": "ex.: português, inglês",
  "interests.life.ageLabel": "A tua faixa etária",
  "interests.life.ageNote": "(opcional — nunca é mostrado a outras pessoas)",
  "interests.reading.heading": "O que gostas de ler?",
  "interests.reading.frequencyHeading":
    "Com que frequência queres ter notícias nossas?",
  "interests.content.heading": "Definições de conteúdo",
  "interests.content.helper":
    "Desativar isto nunca afeta o teu acesso à comunidade — só o teu feed.",
  "interests.content.legalNote":
    "Estas preferências são privadas. Só tu e a QueerPulse podem vê-las.",

  // ── interests.data.ts — faixas etárias (só o índice é guardado) ─────────
  "interests.age.under25": "Menos de 25",
  "interests.age.25to35": "25–35",
  "interests.age.35to45": "35–45",
  "interests.age.45plus": "45+",

  // ── interests.data.ts — frequência de email (o id "daily"/"weekly"/
  // "important" é o valor guardado; só título/descrição são traduzidos) ───
  "interests.freq.daily.title": "Resumo diário",
  "interests.freq.daily.desc":
    "Um email por dia com as tuas atualizações principais",
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
  "interests.contentSetting.mentalHealth":
    "Conteúdo sobre saúde mental e bem-estar",
  "interests.contentSetting.sexualityIdentity":
    "Conteúdo sobre exploração da sexualidade e identidade",

  // ── SimulationPreviewModal.tsx ────────────────────────────────────────────
  "previewModal.ariaLabel": "Pré-visualização: {title}",
  "previewModal.kicker": "Pré-visualização",
  "previewModal.deviceGroupAriaLabel": "Largura da pré-visualização",
  "previewModal.mobile": "Telemóvel",
  "previewModal.desktop": "Computador",
  "previewModal.openFullScreen": "Abrir em ecrã inteiro",
  "previewModal.closeAriaLabel": "Fechar pré-visualização",

  // ── SettingsPanes.tsx — NotificationsPane ────────────────────────────────
  "notifications.title": "Preferências de <em>notificações.</em>",
  "notifications.sub":
    "Controlo detalhado sobre o que chega até ti e como. Nunca te enviaremos algo que não tenhas pedido.",
  "notifications.section.gatherings": "Convívios",
  "notifications.section.messagesConnections": "Mensagens e ligações",
  "notifications.section.communitiesBoard": "Comunidades e mural",
  "notifications.section.delivery": "Entrega",
  "notifications.gatherings.newAnnounced.title": "Novo convívio anunciado",
  "notifications.gatherings.newAnnounced.desc":
    "Quando é publicado um convívio que corresponde aos teus interesses",
  "notifications.gatherings.rsvpReminder.title":
    "Lembrete de confirmação de presença",
  "notifications.gatherings.rsvpReminder.desc":
    "48 horas antes de um convívio a que confirmaste presença",
  "notifications.gatherings.lastFewSpots.title": "Últimas vagas",
  "notifications.gatherings.lastFewSpots.desc":
    "Quando um convívio que guardaste está quase esgotado",
  "notifications.messages.newMessage.title": "Nova mensagem",
  "notifications.messages.newMessage.desc":
    "Quando alguém te envia uma mensagem direta",
  "notifications.messages.connectionRequest.title": "Pedido de ligação",
  "notifications.messages.connectionRequest.desc":
    "Quando alguém te pede para se ligar a ti",
  "notifications.messages.sayHello.title": "Recebeste um «Olá»",
  "notifications.messages.sayHello.desc": "Quando alguém te acena no perfil",
  "notifications.messages.vouch.title": "Avais",
  "notifications.messages.vouch.desc": "Quando alguém te avaliza",
  "notifications.phonePush.title": "Notificações no telemóvel",
  "notifications.phonePush.desc":
    "Recebe um aviso no telemóvel quando alguém te envia mensagem — mesmo com o QueerPulse fechado. Adiciona primeiro o QueerPulse ao ecrã principal.",
  "notifications.phonePush.unsupported":
    "O teu navegador ainda não consegue mostrar notificações no telemóvel.",
  "notifications.phonePush.blocked":
    "As notificações estão bloqueadas. Volta a ativá-las nas definições do navegador e tenta de novo.",
  "notifications.phonePush.test.title": "Envia um teste a ti",
  "notifications.phonePush.test.desc":
    "Envia uma notificação para os teus dispositivos para confirmar que está tudo a funcionar.",
  "notifications.phonePush.test.action": "Enviar teste",
  "notifications.phonePush.test.sent": "Teste enviado — confirma no teu dispositivo",
  "notifications.phonePush.test.error":
    "Não foi possível enviar o teste — tenta daqui a pouco",
  "notifications.communities.newPost.title":
    "Nova publicação nas minhas comunidades",
  "notifications.communities.newPost.desc":
    "Atividade nas comunidades a que te juntaste",
  "notifications.communities.threadReply.title":
    "Resposta a um tópico em que participo",
  "notifications.communities.threadReply.desc":
    "Quando alguém responde a um tópico em que participaste",
  "notifications.communities.mention.title": "Menções",
  "notifications.communities.mention.desc":
    "Quando alguém te menciona numa publicação ou discussão",
  "notifications.communities.weeklyDigest.title":
    "Resumo semanal da comunidade",
  "notifications.communities.weeklyDigest.desc":
    "Um resumo tranquilo do que se passa — um email, uma vez por semana",
  "notifications.delivery.email.title": "Notificações por email",
  "notifications.delivery.email.desc":
    "Com que frequência agrupar e enviar notificações por email",
  "notifications.delivery.email.immediately": "Imediatamente",
  "notifications.delivery.email.dailyDigest": "Resumo diário",
  "notifications.delivery.email.weeklyDigest": "Resumo semanal",
  "notifications.delivery.email.never": "Nunca",
  "notifications.delivery.quietHours.title": "Horas de silêncio",
  "notifications.delivery.quietHours.desc": "Não enviar nada entre estas horas",
  "notifications.delivery.quietHours.none": "Sem horas de silêncio",

  // ── SettingsPanes.tsx — LanguagePane ──────────────────────────────────────
  "language.title": "Idioma e <em>terminologia.</em>",
  "language.sub":
    "Uma referência viva, mantida atualizada pela comunidade. Procura um termo para veres como o usamos em toda a QueerPulse.",
  "language.section.platformPreference": "Preferência de idioma da plataforma",
  "language.interfaceLanguage.title": "Idioma da interface",
  "language.interfaceLanguage.desc":
    "O idioma que a QueerPulse usa nos menus, etiquetas e mensagens do sistema. O português ainda está a ser traduzido em toda a plataforma — algumas páginas ficam em inglês por agora.",
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
  "data.consent.analytics.title": "Dados analíticos e de utilização",
  "data.consent.analytics.desc":
    "Padrões de utilização anónimos e agregados para melhorar a plataforma. Sem monitorização individual, sem redes publicitárias. Desligado a menos que o ativares.",
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
    "Usa os teus interesses e ligações para melhorar as pessoas e convívios sugeridos. Uma preferência de produto — fica na tua conta, não é monitorização.",
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
  "data.export.full.title": "A preparar a tua exportação completa",
  "data.export.messages.title": "A preparar as tuas mensagens",
  "data.export.messages.note":
    "Exportação simples do teu histórico completo de mensagens.",

  // ── SettingsPanes.tsx — SimulationsPane ───────────────────────────────────
  "simulations.title": "Simulações de <em>fluxos.</em>",
  "simulations.sub":
    "Pré-visualiza as principais jornadas de uma pessoa da comunidade, do início ao fim. Os ecrãs de estado abrem numa pré-visualização em moldura de dispositivo aqui mesmo; os fluxos mais elaborados abrem os ecrãs reais para os percorreres exatamente como qualquer outra pessoa.",
  "simulations.preview": "Pré-visualizar",
  "simulations.start": "Iniciar simulação",

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
    "Esconde de outros membros quem te deu aval e a quem deste aval. A administração continua a conseguir ver, por motivos de segurança.",
  "visibility.featuredConsent.label":
    "Deixar a administração destacar-te na página inicial",
  "visibility.featuredConsent.description":
    "Membros públicos que deram o seu consentimento podem ser escolhidos para aparecer na página inicial de vez em quando. Podes desativar isto quando quiseres ficar fora dos destaques.",
  "visibility.featuredConsent.disabledHint":
    'Define primeiro a tua visibilidade como "Aberto a ligações" — só perfis públicos podem ser destacados.',
  "visibility.newArrivals.title": "Mostrar-me em «Novidades»",
  "visibility.newArrivals.desc":
    "Diz à comunidade que te juntaste recentemente",
  "visibility.suggestedConnections.title": "Aparecer em ligações sugeridas",
  "visibility.suggestedConnections.desc":
    "Permite à plataforma sugerir-te a pessoas com interesses em comum",
  "visibility.activityStatus.title": "Mostrar estado de atividade",
  "visibility.activityStatus.desc":
    "Deixa as pessoas verem a tua última atividade (aproximada)",

  // ── SettingsPanes.tsx — AccountPane ────────────────────────────────────────
  "account.title": "Definições da <em>conta.</em>",
  "account.sub": "Preferências de sessão e segurança.",
  "account.section.account": "Conta",
  "account.emailAddress.title": "Endereço de email",
  "account.emailAddress.desc":
    "O endereço associado à tua conta e início de sessão.",
  "account.section.security": "Segurança",
  "account.twoFactor.title": "Autenticação de dois fatores",
  "account.twoFactor.desc":
    "Adiciona um segundo passo ao iniciar sessão num novo dispositivo",
  "account.loginAlerts.title": "Alertas de início de sessão",
  "account.loginAlerts.desc":
    "Avisa-me por email quando a minha conta é acedida a partir de um novo dispositivo",
  "account.disclosure.title": "Comunicar uma vulnerabilidade de segurança",
  "account.disclosure.desc":
    "Encontraste uma falha ou uma fragilidade no QueerPulse? A nossa política de divulgação explica como comunicá-la e o que acontece a seguir.",
  "account.disclosure.cta": "Ler a política",

  // ── MyUploadsPane.tsx — imagens que a própria pessoa enviou ──────────────
  "uploads.title": "As tuas imagens",
  "uploads.intro":
    "Todas as imagens que enviaste. Apaga as que não precisares — incluindo envios duplicados sem querer.",
  "uploads.demoOnly":
    "As tuas imagens aparecem aqui quando tens sessão iniciada na app em direto.",
  "uploads.loading": "A carregar as tuas imagens…",
  "uploads.error":
    "Não conseguimos carregar as tuas imagens. Tenta novamente dentro de momentos.",
  "uploads.empty": "Ainda não enviaste nenhuma imagem.",
  "uploads.inUse": "Em uso",
  "uploads.kind.avatar": "Foto de perfil",
  "uploads.kind.work-image": "Imagem de destaque",
  "uploads.kind.story-cover": "Capa de matéria",
  "uploads.kind.gathering-photo": "Foto de convívio",
  "uploads.kind.group-avatar": "Foto de grupo",
  "uploads.kind.listing-photo": "Foto do estabelecimento",
  "uploads.usedAs.profile-photo": "a tua foto de perfil atual",
  "uploads.usedAs.showcase": "o teu destaque de perfil",
  "uploads.usedAs.story-cover": "uma capa de matéria",
  "uploads.usedAs.event": "um evento que organizas",
  "uploads.usedAs.group": "uma foto de grupo",
  "uploads.usedAs.listing": "um estabelecimento",
  "uploads.delete.button": "Apagar",
  "uploads.delete.title": "Apagar esta imagem?",
  "uploads.delete.confirm": "Esta ação não pode ser anulada.",
  "uploads.delete.warnInUse":
    "Esta imagem ainda está a ser usada ({where}). Apagá-la vai removê-la também daí, e não pode ser anulado.",
  "uploads.delete.cta": "Apagar imagem",
  "uploads.delete.cancel": "Cancelar",
  "uploads.delete.toast.success": "Imagem apagada.",
  "uploads.delete.toast.error": "Não conseguimos apagar essa imagem. Tenta novamente.",

  // ── EditProfileSidebar.tsx / editProfileNav.data.tsx ─────────────────────
  "editProfile.nav.group.profile": "Perfil",
  "editProfile.nav.group.privacy": "Privacidade",
  "editProfile.nav.identity.label": "Identidade e foto",
  "editProfile.nav.pronouns.label": "Pronomes e nome",
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
  "editProfile.identity.displayNameLabel": "Nome de apresentação",
  "editProfile.identity.displayNameHint":
    "O teu nome de apresentação é o que as pessoas leem; o teu nome de utilizador abaixo é a tua identificação.",
  "editProfile.identity.locationLabel": "Localização em Lisboa",
  "editProfile.identity.locationOptional": "opcional",
  "editProfile.identity.locationPlaceholder": "ex.: Mouraria, Intendente…",
  "editProfile.identity.locationHint":
    "Apenas ao nível do bairro — nunca a morada exata.",

  // ── EditProfileSections.tsx — PronounsSection ────────────────────────────
  "editProfile.pronouns.title": "Pronomes <em>e nome</em>",
  "editProfile.pronouns.sub":
    "O teu nome escolhido e os teus pronomes aparecem em toda a plataforma. Consulta o <a>guia de pronomes</a> se estiveres a atualizar um nome legal em toda a plataforma.",
  "editProfile.pronouns.label": "Pronomes",
  "editProfile.pronouns.writeOwnLabel": "Escreve os teus",
  "editProfile.pronouns.writeOwnPlaceholder": "Ou escreve os teus…",
  "editProfile.pronouns.hint":
    "Podes selecionar várias etiquetas acima. Os pronomes só são mostrados no teu perfil — não em meta tags nem em URLs.",
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
    "Esta é a tua identificação em toda a QueerPulse — como as pessoas encontram o teu perfil. Escolhe uma que seja tua; podes mudá-la mais tarde, embora as ligações antigas deixem de apontar para aqui.",
  "editProfile.username.fieldLabel": "Nome de utilizador",
  "editProfile.username.fieldHint":
    "Letras minúsculas, números e hífenes — de 3 a 30 carateres.",
  "editProfile.username.save": "Guardar nome de utilizador",
  "editProfile.username.saving": "A guardar…",
  "editProfile.username.previewPrefix":
    "O teu perfil está em <strong>/members/{handle}</strong>",
  "editProfile.username.toast.updated": "Nome de utilizador atualizado.",
  "editProfile.username.error.taken":
    "Já há alguém com esse nome — tenta outro.",
  "editProfile.username.error.reserved":
    "Essa palavra está reservada para a plataforma — tenta outra.",
  "editProfile.username.error.invalid":
    "Esse nome de utilizador não é permitido — verifica o formato e tenta novamente.",
  "editProfile.username.error.generic":
    "Não conseguimos atualizar o teu nome de utilizador agora — tenta novamente.",

  // ── UsernameField.tsx / usernameField.data.ts ────────────────────────────
  "usernameField.defaultLabel": "Nome de utilizador",
  "usernameField.placeholder": "oteunome",
  "usernameField.checking": "A verificar…",
  "usernameField.free": "Parece livre — este pode ser teu.",
  "usernameField.yours": "Este é o teu nome de utilizador.",
  "usernameField.reason.invalid":
    "Os nomes de utilizador têm de 3 a 30 carateres — letras minúsculas, números e hífenes.",
  "usernameField.reason.reserved":
    "Essa palavra está reservada para a plataforma — tenta outra.",
  "usernameField.reason.taken": "Já há alguém com esse nome — tenta outro.",

  // ── SessionsPage.tsx — chrome (os registos de sessão são mock/dados
  // vindos de GET /account/sessions — ficam em inglês) ─────────────────────
  "sessions.ago.justNow": "agora mesmo",
  "sessions.ago.unknown": "desconhecido",
  "sessions.backToSecurity": "Segurança",
  "sessions.eyebrow": "Segurança · Sessões ativas",
  "sessions.h1": "Onde tens <em>sessão iniciada</em> agora mesmo.",
  "sessions.lead":
    "Todos os dispositivos com uma sessão ativa. Se algo aqui parecer estranho, termina a sessão — e lê <a>o que fazer a seguir</a>.",
  "sessions.bulk.onlyDevice":
    "Este é o único dispositivo em que tens sessão iniciada.",
  "sessions.bulk.multi_one":
    "Tens sessão iniciada em <strong>{count} dispositivo</strong>. Termina a sessão em qualquer um que não reconheças.",
  "sessions.bulk.multi_other":
    "Tens sessão iniciada em <strong>{count} dispositivos</strong>. Termina a sessão em qualquer um que não reconheças.",
  "sessions.bulk.signOutAll": "Terminar sessão em todos os outros dispositivos",
  "sessions.sectionActiveNow": "Ativas agora",
  "sessions.card.badgeThis": "Esta sessão",
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
    "Não há sessão iniciada em lado nenhum agora — nem mesmo neste dispositivo, o que normalmente significa que a tua sessão está prestes a ser renovada.",
  "sessions.toast.signedOut":
    "Sessão terminada. Se não foste tu, revê as tuas sessões ativas e termina qualquer dispositivo que não reconheças.",
  "sessions.toast.signedOutError":
    "Não conseguimos terminar essa sessão. Tenta novamente.",
  "sessions.toast.signedOutAll":
    "Sessão terminada em todos os outros dispositivos",
  "sessions.toast.signedOutAllError":
    "Não conseguimos terminar as outras sessões. Tenta novamente.",
  "sessions.footNote":
    "<strong>Algo parece errado?</strong> Termina a sessão em qualquer dispositivo que não reconheças e <a>conta-nos o que aconteceu</a> — vamos ajudar-te a proteger a tua conta.",

  // ── DataExportPage.tsx — hero + toast + outro ────────────────────────────
  "dataExport.hero.eyebrow": "Os teus dados · RGPD, art.º 20",
  "dataExport.hero.titleLine1": "Os teus dados.",
  "dataExport.hero.titleLine2": "Teus, para levares.",
  "dataExport.hero.sub":
    "Ao abrigo do RGPD, tens o direito de receber uma cópia de todos os dados pessoais que guardamos sobre ti, num formato legível por máquina. É aqui que os pedes. Sem formulários. Sem salas de espera. Só os teus dados.",
  "dataExport.toast.selectType": "Seleciona pelo menos um tipo de dados.",
  "dataExport.outro.titleLine1": "Perguntas sobre",
  "dataExport.outro.titleLine2": "os teus dados?",
  "dataExport.outro.sub":
    "Escreve-nos e uma pessoa real responde-te.",
  "dataExport.outro.cta": "Contacta-nos",

  // ── DataExportSections.tsx — DataExportSteps ─────────────────────────────
  "dataExport.steps.aria": "Progresso da exportação",
  "dataExport.steps.step1.label": "Escolhe o que exportar",
  "dataExport.steps.step1.desc":
    "Seleciona os tipos de dados que queres incluir no teu arquivo.",
  "dataExport.steps.step2.label": "Confirma a tua identidade",
  "dataExport.steps.step2.desc":
    "Pedimos-te para confirmares que és tu, aqui mesmo — sem email nem palavra-passe.",
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

  // ── DataExportSections.tsx — DataExportStatus ────────────────────────────
  "dataExport.status.ready.title": "O teu arquivo está pronto",
  "dataExport.status.ready.body":
    "Está pronto para descarregares. Não enviámos nada por email — isto fica entre ti e esta página.",
  "dataExport.status.ready.bodyWithExpiry":
    "Está pronto para descarregares. Não enviámos nada por email. Guardamo-lo aqui até <strong>{date}</strong> e depois apagamo-lo.",
  "dataExport.status.expired.title": "Essa ligação expirou",
  "dataExport.status.expired.body":
    "Não guardamos arquivos indefinidamente. Pede outra vez e criamos-te um novo.",
  "dataExport.status.failed.title": "Isso não funcionou",
  "dataExport.status.failed.body":
    "Não conseguimos construir o teu arquivo agora — nada saiu da tua conta. Tenta novamente dentro de momentos.",
  "dataExport.status.retry": "Pedir novamente",
  "dataExport.status.building.title": "A construir o teu arquivo",
  "dataExport.status.building.body":
    "Estamos a reunir os teus dados e a prepará-los. Isto demora só um momento — mantém-te nesta página e o teu arquivo fica pronto para descarregares aqui mesmo.",
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
    "Se contribuíste para eventos pagos ou para o fundo da comunidade, um registo das datas e montantes das transações. Não guardamos dados de cartão — os pagamentos são processados pela Stripe.",

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
    "Exportação de demonstração gerada no navegador — nenhum dado pessoal saiu deste dispositivo.",

  // ── SaveButton.tsx — controlo de guardar reutilizável ────────────────────
  "saveButton.defaultLabel": "Guardar alterações",
  "saveButton.savingLabel": "A guardar…",
  "saveButton.savedLabel": "Guardado",

  // ── AccessibilityPreferencesPage.tsx + Sections — a página completa de
  // acessibilidade. Só a Redução de movimento é funcional; o resto são
  // etiquetas em interruptores não funcionais — só as etiquetas são traduzidas.
  "a11y.sidebar.preferences": "Preferências",
  "a11y.sidebar.display": "Visualização",
  "a11y.sidebar.motion": "Movimento",
  "a11y.sidebar.reading": "Leitura",
  "a11y.sidebar.interaction": "Interação",
  "a11y.sidebar.reset": "Repor",
  "a11y.section.display.eyebrow": "Visualização",
  "a11y.section.display.desc":
    "Estas definições aplicam-se a toda a plataforma.",
  "a11y.toggle.highContrast.title": "Modo de alto contraste",
  "a11y.toggle.highContrast.desc":
    "Aumenta o contraste de cor para melhor legibilidade. Afeta texto, contornos e anéis de foco.",
  "a11y.toggle.largerText.title": "Aumentar o tamanho do texto",
  "a11y.toggle.largerText.desc":
    "Torna o texto do corpo ligeiramente maior em todas as páginas.",
  "a11y.toggle.dyslexia.title": "Tipo de letra para dislexia",
  "a11y.toggle.dyslexia.desc":
    "Maior espaçamento entre letras e altura de linha aumentada para melhor legibilidade.",
  "a11y.textSize.label": "Tamanho do texto",
  "a11y.textSize.preview":
    "A raposa castanha atravessou o Príncipe Real e encontrou uma comunidade à espera do outro lado.",
  "a11y.section.motion.eyebrow": "Movimento",
  "a11y.section.motion.desc":
    "Controla animações e transições em toda a plataforma.",
  "a11y.toggle.reduceMotion.title": "Reduzir movimento",
  "a11y.toggle.reduceMotion.desc":
    "Desativa animações, transições e efeitos de pulsação em toda a plataforma.",
  "a11y.toggle.pauseDecorative.title": "Pausar animações decorativas",
  "a11y.toggle.pauseDecorative.desc":
    "Impede que orbes de fundo, pontos pulsantes e indicadores de carregamento animem.",
  "a11y.preview.liveLabel": "Pré-visualização em direto",
  "a11y.preview.cardText":
    "Este cartão anima ao carregar — muda as definições de movimento para veres o efeito.",
  "a11y.section.reading.eyebrow": "Leitura",
  "a11y.section.reading.desc":
    "Ajusta a forma como o conteúdo é apresentado para uma leitura confortável.",
  "a11y.toggle.wideSpacing.title": "Espaçamento entre linhas mais amplo",
  "a11y.toggle.wideSpacing.desc":
    "Aumenta o espaço entre linhas de texto (altura de linha: 2.0).",
  "a11y.toggle.focusRings.title": "Mostrar indicadores de foco",
  "a11y.toggle.focusRings.desc":
    "Adiciona anéis de foco do teclado visíveis em todos os elementos interativos.",
  "a11y.colorTheme.label": "Tema de cor",
  "a11y.colorTheme.headingLabel": "Estilo de cor dos títulos",
  "a11y.colorTheme.default": "Predefinido",
  "a11y.colorTheme.softer": "Suave",
  "a11y.colorTheme.highContrast": "Alto contraste",
  "a11y.section.interaction.eyebrow": "Interação",
  "a11y.section.interaction.desc":
    "Ajusta a forma como interages com a plataforma.",
  "a11y.toggle.largeTargets.title": "Alvos de toque maiores",
  "a11y.toggle.largeTargets.desc":
    "Aumenta o tamanho mínimo de botões e ligações para facilitar a interação por toque.",
  "a11y.toggle.stickyNav.title": "Navegação fixa",
  "a11y.toggle.stickyNav.desc":
    "Mantém a barra de navegação sempre visível ao percorreres a página.",
  "a11y.toggle.skipLink.title": "Ligação para saltar para o conteúdo",
  "a11y.toggle.skipLink.desc":
    "Ligado por predefinição. Pressiona Tab e aparece no topo uma ligação «Saltar para o conteúdo principal», para passares a navegação de uma vez. Desligar remove esse atalho — a ligação fica escondida até receber foco, por isso deixá-la ligada não te custa nada.",

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
    "Não tens a certeza? Considera <strong>pausar as notificações</strong> durante um mês em vez disso. Continuas a fazer parte sem o ruído.",
  "deleteAccount.pauseStrip.cta": "Desativar todos os emails e resumos",
  "deleteAccount.toast.pausedEmails":
    "Todas as notificações por email foram pausadas durante 30 dias.",
  "deleteAccount.whatHappens.title.deactivate":
    "O que acontece quando desativas",
  "deleteAccount.whatHappens.title.delete": "O que acontece quando eliminas",
  "deleteAccount.confirm.typeLabel":
    "Escreve <strong>«{phrase}»</strong> para confirmares",
  "deleteAccount.confirm.cancelBtn": "Cancelar",
  "deleteAccount.pending.cancelling": "A cancelar…",
  "deleteAccount.pending.cancelBtn": "Cancelar eliminação",
  "deleteAccount.toast.cancelled": "Eliminação cancelada — bem-vinde de volta.",
  "deleteAccount.toast.cancelError":
    "Não conseguimos cancelar isso agora. Tenta novamente.",
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
    "O teu <strong>perfil fica oculto</strong> de imediato — nenhuma outra pessoa o consegue encontrar ou ver.",
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
    "As mensagens que enviaste <strong>são eliminadas de todas as conversas</strong> — quem as recebeu também as perde.",
  "deleteAccount.wh.delete.postsRemoved":
    "As tuas publicações no fórum são <strong>permanentemente removidas</strong> — não anonimizadas, eliminadas.",
  "deleteAccount.wh.delete.emailSuppressed":
    "O teu endereço de email é <strong>adicionado a uma lista de supressão</strong> para não recriarmos a tua conta por acidente.",
  "deleteAccount.wh.delete.exportFirst":
    "Podes pedir um <strong>arquivo de dados antes de eliminares</strong> — faz isso primeiro.",
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
    "Não conseguimos concluir isto agora — nada foi alterado. Verifica a tua ligação e tenta novamente, ou volta dentro de momentos.",
  "destructiveFlow.error.close": "Fechar",
  "destructiveFlow.error.tryAgain": "Tentar novamente",
  "destructiveFlow.confirm.notNow": "Agora não",
  "destructiveFlow.deactivate.eyebrow": "Desativar conta",
  "destructiveFlow.deactivate.title":
    "Ocultar o teu perfil <em>por agora?</em>",
  "destructiveFlow.deactivate.body":
    "O teu perfil torna-se invisível e as notificações param. <strong>Nada é eliminado</strong> — volta a iniciar sessão quando quiseres e continuas exatamente de onde ficaste.",
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
    "A tua conta está agendada para eliminação. Tens <strong>30 dias</strong> para mudar de ideias — basta voltares a iniciar sessão com a Google e paramos a eliminação. Depois disso, os teus dados são permanentemente apagados. Cuida de ti.",

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
    "Atualiza-se em direto à medida que escolhes um tema. Guardado neste navegador como pré-visualização — ainda não aparece no teu perfil público.",
  "themeStudio.profileCardLabel": "Cartão de perfil",
  "themeStudio.directoryCardLabel": "Cartão no diretório",
  "themeStudio.directoryHint":
    "É assim que o teu perfil aparece nos resultados de pesquisa e no diretório de pessoas.",
  "themeStudio.memberSince": "Lisboa · Aqui desde {year}",
  "themeStudio.levelPreview": "Nív.4 · Familiar",
  "themeStudio.cover.stripe": "Risca arrojada",
  "themeStudio.pattern.none": "Liso",
  "themeStudio.pattern.stripe": "Riscas diagonais",
  "themeStudio.pattern.dots": "Grelha de pontos",
  "themeStudio.pattern.grid": "Grelha",
  "themeStudio.badge.foundingMember": "Pessoa Fundadora (Lendário)",
  "themeStudio.badge.eventHost": "Organiza Encontros (Lendário)",
  "themeStudio.badge.sustainer": "Apoiante (Raro)",
  "themeStudio.badge.regular": "Regular (Raro)",
  "themeStudio.badge.vouch": "Aval (Raro)",
  "themeStudio.backToProfile": "O meu perfil",
  "themeStudio.saveTheme": "Guardar tema",
  "themeStudio.toast.saved": "Tema guardado",

  // ── LinkProviderModal.tsx ─────────────────────────────────────────────────
  "linkProvider.ariaLabel": "Autorizar {provider}",
  "linkProvider.eyebrow": "Autorizar · {provider}",
  "linkProvider.continueWith": "Continuar com {provider}",
  "linkProvider.requestingAccess": "A QueerPulse está a pedir acesso",
  "linkProvider.authorizing": "A autorizar…",
  "linkProvider.authorizeCta": "Autorizar {provider}",
  "linkProvider.cancel": "Cancelar",
  "linkProvider.linkedTitle": "Ligação com {provider} <em>concluída.</em>",
  "linkProvider.linkedSub":
    "Já podes entrar na QueerPulse com {provider}. Revoga o acesso quando quiseres, a partir desta página — as tuas mensagens e associações a comunidades nunca foram partilhadas.",
  "linkProvider.done": "Concluído",

  // ── IntegrationsModal.tsx ─────────────────────────────────────────────────
  "integrationsModal.ariaLabel": "Integrações disponíveis",
  "integrationsModal.eyebrow": "Ligar outra",
  "integrationsModal.title": "Integrações <em>disponíveis.</em>",
  "integrationsModal.desc":
    "Cada integração tem um âmbito restrito — nenhuma consegue ler as tuas mensagens diretas, rascunhos, faturação ou associações a comunidades.",
  "integrationsModal.connectedTag": "Ligada",
  "integrationsModal.connectCta": "Ligar",

  // ── SecurityPage.tsx — divulgação de vulnerabilidades ────────────────────
  // Os créditos do mural (SecurityPage HALL) são registos de atribuição — nomes
  // dos investigadores e o tipo/data da vulnerabilidade — e ficam em inglês,
  // como os restantes valores de registo indicados no topo deste ficheiro.
  "security.hero.eyebrow": "Divulgação de vulnerabilidades",
  "security.hero.titleTop": "Encontraste algo?",
  "security.hero.titleEm": "Diz-nos.",
  "security.hero.sub":
    "Levamos a segurança a sério. Se encontraste uma vulnerabilidade no QueerPulse, queremos saber. Esta página explica como comunicá-la, o que esperar e como tratamos as divulgações.",

  "security.commitment.eyebrow": "O nosso compromisso",
  "security.commitment.title": "Não <em>penalizamos</em> a boa fé.",
  "security.commitment.body1":
    "Os investigadores de segurança que comunicam vulnerabilidades de boa fé não sofrerão qualquer ação legal da nossa parte. Não contactaremos a tua entidade patronal, o teu fornecedor de internet nem as autoridades, a menos que uses o teu acesso para prejudicar membros. Acreditamos que a investigação de segurança torna toda a gente mais segura, e ficamos gratos quando alguém dedica tempo a comunicar o que encontra.",
  "security.commitment.body2":
    "Pedimos-te que nos dês um prazo razoável para corrigir um problema antes de o divulgares publicamente. Em troca, comprometemo-nos a confirmar a receção da tua comunicação em 48 horas, a manter-te a par do progresso e a creditar-te nos nossos agradecimentos de segurança, se assim o quiseres.",

  "security.scope.eyebrow": "Âmbito",
  "security.scope.title": "O que está <em>no âmbito.</em>",
  "security.scope.inLabel": "No âmbito",
  "security.scope.outLabel": "Fora do âmbito",
  "security.scope.in.1": "queerpulse.pt e *.queerpulse.pt",
  "security.scope.in.2": "Autenticação e gestão de sessões",
  "security.scope.in.3": "Acesso a dados e escalada de privilégios",
  "security.scope.in.4": "XSS armazenado e refletido",
  "security.scope.in.5": "CSRF em endpoints autenticados",
  "security.scope.in.6": "Injeção de SQL",
  "security.scope.in.7": "Referências diretas a objetos inseguras",
  "security.scope.in.8": "Exposição de dados sensíveis",
  "security.scope.out.1": "Ataques de negação de serviço",
  "security.scope.out.2": "Engenharia social da nossa equipa",
  "security.scope.out.3": "Ataques físicos à infraestrutura",
  "security.scope.out.4": "Spam ou contorno dos limites de tráfego",
  "security.scope.out.5":
    "Infraestrutura de terceiros (Hetzner, Postmark, Backblaze)",
  "security.scope.out.6": "Clickjacking em páginas não sensíveis",
  "security.scope.out.7": "Cabeçalhos de segurança em falta (apenas comunicação)",

  "security.process.eyebrow": "Processo",
  "security.process.aria": "O que acontece depois de comunicares",
  "security.process.title": "O que acontece <em>depois de comunicares.</em>",
  "security.process.step1.title": "Confirmação",
  "security.process.step1.text":
    "Confirmamos a receção em 48 horas e avisamos-te de que estamos a analisar. Atribuímos um número de referência para podermos acompanhá-la em conjunto.",
  "security.process.step1.note": "Objetivo: 48 horas",
  "security.process.step2.title": "Avaliação",
  "security.process.step2.text":
    "Investigamos e avaliamos a gravidade. Mantemos-te a par e poderemos colocar perguntas de seguimento. Se não conseguirmos reproduzir o problema, explicamos-te porquê.",
  "security.process.step2.note": "Objetivo: 5 dias úteis",
  "security.process.step3.title": "Correção",
  "security.process.step3.text":
    "Para vulnerabilidades confirmadas, corrigimos e implementamos uma atualização. O prazo depende da gravidade — os problemas críticos são tratados como emergências.",
  "security.process.step3.note":
    "Crítico: <72h · Elevado: <7 dias · Médio/Baixo: próxima versão",
  "security.process.step4.title": "Divulgação",
  "security.process.step4.text":
    "Coordenamos contigo um calendário de divulgação. Creditamos-te nos nossos agradecimentos de segurança, a não ser que prefiras o anonimato.",
  "security.process.step4.note": "Por omissão: divulgação coordenada a 90 dias",

  "security.ack.eyebrow": "Agradecimentos",
  "security.ack.title": "<em>Investigadores</em> de segurança que ajudaram.",
  "security.ack.body":
    "Estamos gratos aos seguintes investigadores que divulgaram vulnerabilidades de forma responsável. (Listados com autorização.)",

  "security.report.titleTop": "Comunicar uma",
  "security.report.titleEm": "vulnerabilidade",
  "security.report.body":
    "Cifra a tua comunicação com a nossa chave PGP e envia-nos um email. Inclui os passos para reproduzir, o impacto potencial e qualquer prova de conceito.",
  "security.report.cta": "Enviar email à equipa de segurança",
  "security.pgp.label": "Chave pública PGP",
  "security.pgp.copyCta": "Copiar chave",
  "security.pgp.copied": "Chave PGP copiada.",
  "security.pgp.copyFailed": "Falha ao copiar — seleciona e copia manualmente.",

  "security.outro.titleTop": "A segurança é",
  "security.outro.titleEm": "trabalho de comunidade.",
  "security.outro.sub":
    "Obrigade a todas as pessoas que ajudam a manter o QueerPulse seguro.",
  "security.outro.cta": "Contactar a equipa de segurança",
};
