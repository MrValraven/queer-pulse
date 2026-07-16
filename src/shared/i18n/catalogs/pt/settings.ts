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
  "nav.item.safety": "Segurança",
  "nav.item.profile": "Perfil",
  "nav.item.account": "Conta",
  "nav.item.profileTheme": "Tema do perfil",
  "nav.item.accessibility": "Acessibilidade",
  "nav.item.interests": "Interesses",
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

  // ── SettingsControls.tsx — DeleteAccountModal (primeira confirmação) ─────
  "controls.deleteModal.title": "Eliminar a tua conta?",
  "controls.deleteModal.body":
    "A eliminação apaga permanentemente o teu perfil, mensagens, publicações nas comunidades e todos os dados associados no prazo de 30 dias. Não pode ser revertida. Recomendamos que descarregues primeiro os teus dados. De seguida, vais confirmar a tua palavra-passe e enviaremos um email para concluíres o pedido.",
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
  "modals.suggestEdit.wordingPlaceholder": "Uma definição mais clara de «{term}»…",
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
    "Preparámos os teus dados em <strong>{filename}</strong>. No produto real também te enviaríamos um link seguro por email — aqui já podes descarregá-lo.",
  "modals.dataExport.downloadCta": "Descarregar {filename}",

  // ── SettingsPersonalisation.tsx — ProfileThemePane ───────────────────────
  "personalisation.theme.title": "Tema do <em>perfil.</em>",
  "personalisation.theme.sub":
    "Personaliza o aspeto do teu perfil e do cartão no diretório. Escolhe uma bandeira, um estilo de capa e um padrão — e o que aparece junto ao teu nome.",

  // ── SettingsPersonalisation.tsx — AccessibilityPane ──────────────────────
  "personalisation.accessibility.title": "Preferências de <em>acessibilidade.</em>",
  "personalisation.accessibility.sub":
    "Ajusta a visualização, o movimento, a leitura e a interação ao teu gosto. Estas definições aplicam-se a toda a plataforma.",
  "personalisation.accessibility.resetAll": "Repor todas as preferências",
  "personalisation.accessibility.resetNote":
    "Isto repõe todas as definições de visualização para os valores predefinidos. Os dados do teu perfil não são afetados.",
  "personalisation.accessibility.deviceNote":
    "As tuas preferências são guardadas localmente neste dispositivo.",
  "personalisation.accessibility.resetToast": "Todas as preferências foram repostas",

  // ── SafetyPane.tsx — controlo de segurança de saída rápida ──────────────
  // Precisão acima de tudo: a saída rápida limpa o *ecrã*, não é anonimato
  // e não apaga o histórico do navegador. Mantém essa distinção exata.
  "safety.title": "Segurança e <em>saída rápida.</em>",
  "safety.sub":
    "Uma forma rápida de limpar o ecrã se alguém entrar na sala. Estas definições vivem só neste dispositivo — nunca ficam associadas à tua conta.",
  "safety.gdprBox":
    "<strong>A saída rápida limpa o ecrã depressa — não é anonimato.</strong> Envia este separador para uma página neutra do estado do tempo e reabre a QueerPulse noutro separador. Não consegue apagar o teu histórico anterior do navegador, marcadores ou sugestões da barra de endereço — para isso, usa também uma janela privada.",
  "safety.section.quickExit": "Saída rápida",
  "safety.toggle.showButton.title": "Mostrar o botão de saída rápida",
  "safety.toggle.showButton.desc":
    "Um botão flutuante, em todas as páginas, que sai do site instantaneamente. Ativo por predefinição, para a segurança de todes.",
  "safety.toggle.doubleTap.title": "Atalho de duplo toque no Shift",
  "safety.toggle.doubleTap.desc":
    "Carrega duas vezes na tecla Shift para saíres sem teres de procurar o botão. Só funciona enquanto o botão de saída rápida estiver ativo.",

  // ── InterestsPane.tsx ─────────────────────────────────────────────────────
  // NOTA: IDENTITIES.options / LOOKING_FOR.options (interests.data.ts) são o
  // valor *guardado* de draft.identities / draft.lookingFor, lido noutros
  // pontos da app (tipo Member, diretório) fora do âmbito desta varredura.
  // Traduzir a etiqueta sem uma divisão id/label-key no mesmo âmbito
  // dessincronizaria silenciosamente o valor guardado da sua apresentação —
  // ficam em inglês, sinalizado no relatório para um follow-up coordenado.
  "interests.title": "Molda o que <em>vês.</em>",
  "interests.sub":
    "Isto é privado — não aparece no teu perfil. Ajuda-nos a mostrar-te encontros, pessoas e conteúdo relevante para ti. Podes mudar isto quando quiseres.",
  "interests.identities.heading": "Que identidades sentes como tuas?",
  "interests.identities.skip": "Saltar",
  "interests.identities.skipped": "Saltado",
  "interests.identities.helper":
    "Seleciona quantas fizerem sentido. Usamos isto para sugerir comunidades e conteúdo relevantes — não para te categorizar.",
  "interests.lookingFor.heading": "O que procuras aqui?",
  "interests.lookingFor.helper": "Seleciona quantas quiseres.",
  "interests.life.heading": "Um pouco sobre a tua vida",
  "interests.life.note": "(privado — ajuda com sugestões locais)",
  "interests.life.cityLabel": "Cidade / região",
  "interests.life.languagesLabel": "Idiomas",
  "interests.life.languagesPlaceholder": "ex.: português, inglês",
  "interests.life.ageLabel": "A tua faixa etária",
  "interests.life.ageNote": "(opcional — nunca é mostrado a outras pessoas)",
  "interests.reading.heading": "O que gostas de ler?",
  "interests.reading.frequencyHeading": "Com que frequência queres ter notícias nossas?",
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
  "interests.freq.daily.desc": "Um email por dia com as tuas atualizações principais",
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
  "interests.contentSetting.dating": "Conteúdo sobre encontros e relações",
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
  "notifications.section.gatherings": "Encontros",
  "notifications.section.messagesConnections": "Mensagens e ligações",
  "notifications.section.communitiesBoard": "Comunidades e mural",
  "notifications.section.delivery": "Entrega",
  "notifications.section.newslettersEmail": "Newsletters e email",
  "notifications.gatherings.newAnnounced.title": "Novo encontro anunciado",
  "notifications.gatherings.newAnnounced.desc":
    "Quando é publicado um encontro que corresponde aos teus interesses",
  "notifications.gatherings.rsvpReminder.title":
    "Lembrete de confirmação de presença",
  "notifications.gatherings.rsvpReminder.desc":
    "48 horas antes de um encontro a que confirmaste presença",
  "notifications.gatherings.lastFewSpots.title": "Últimas vagas",
  "notifications.gatherings.lastFewSpots.desc":
    "Quando um encontro que guardaste está quase esgotado",
  "notifications.messages.newMessage.title": "Nova mensagem",
  "notifications.messages.newMessage.desc":
    "Quando alguém te envia uma mensagem direta",
  "notifications.messages.connectionRequest.title": "Pedido de ligação",
  "notifications.messages.connectionRequest.desc":
    "Quando alguém te pede para se ligar a ti",
  "notifications.messages.sayHello.title": "Recebeste um «Olá»",
  "notifications.messages.sayHello.desc":
    "Quando alguém te acena no perfil",
  "notifications.communities.newPost.title":
    "Nova publicação nas minhas comunidades",
  "notifications.communities.newPost.desc":
    "Atividade nas comunidades a que te juntaste",
  "notifications.communities.threadReply.title":
    "Resposta a um tópico em que participo",
  "notifications.communities.threadReply.desc":
    "Quando alguém responde a um tópico em que participaste",
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
  "notifications.delivery.quietHours.desc":
    "Não enviar nada entre estas horas",
  "notifications.delivery.quietHours.none": "Sem horas de silêncio",
  "notifications.newsletter.title": "Preferências de newsletters e email",
  "notifications.newsletter.desc":
    "Escolhe que newsletters e fluxos de email recebes — edições da revista, resumos de eventos, anúncios da comunidade e mais.",
  "notifications.newsletter.manage": "Gerir",

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
    "Usa os teus interesses e ligações para melhorar as pessoas e encontros sugeridos. Uma preferência de produto — fica na tua conta, não é monitorização.",
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
};
