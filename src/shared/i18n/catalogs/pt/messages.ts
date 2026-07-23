import type { Catalog } from "../../types";

/** Mensagens — pt-PT inclusivo. Mesmas chaves que `en/messages.ts`. Nomes,
 *  pronomes, textos de mensagens e datas antigas mantêm-se em inglês (dados
 *  de pessoas/conversas); só o texto à volta é traduzido. */
export const messages: Catalog = {
  // Lista de conversas (MessagesThreadList)
  "thread.title": "Mensagens",
  "thread.composeTooltip": "Nova mensagem",
  "thread.searchPlaceholder": "Pesquisar conversas…",
  "thread.searchAria": "Pesquisar conversas",
  "thread.emptySearchTitle": "Nenhuma conversa encontrada",
  "thread.emptySearchDescription":
    "Ninguém corresponde a “{query}”. Tenta outro nome.",
  "thread.clearSearch": "Limpar pesquisa",
  "thread.emptyTitle": "Ainda sem conversas",
  "thread.emptyDescription":
    "Quando começares uma conversa, ela fica aqui — um espaço tranquilo e privado só para ti e para quem contactares.",
  "thread.newMessage": "Nova mensagem",
  "thread.presenceOnline": "Online agora",

  // Painel da conversa (ConversationPanel)
  "conversation.officialMeta":
    "Oficial · Não é possível responder nesta conversa",
  "conversation.connectedSinceSuffix": " · Ligação desde {date}",
  "conversation.viewProfile": "Ver perfil",
  "conversation.officialNotice":
    "Esta é uma conversa automática — as respostas não são monitorizadas.",
  "conversation.blockedNotice":
    "Bloqueaste {name}. Desbloqueia esta pessoa a partir do perfil dela para enviares uma mensagem.",
  "conversation.composerPlaceholder": "Mensagem para {name}…",
  "conversation.send": "Enviar",
  "conversation.backToList": "Voltar às conversas",
  "conversation.emptyPanelTitle": "As tuas mensagens ficam aqui",
  "conversation.emptyPanelBody":
    "Escolhe uma conversa à esquerda, ou começa uma nova — um espaço tranquilo e privado só para ti e para quem contactares.",
  "day.today": "Hoje",
  "day.yesterday": "Ontem",
  "time.justNow": "Agora mesmo",

  // Escolha de destinatário para nova mensagem (NewMessageModal)
  "newMessage.title": "Nova mensagem",
  "newMessage.close": "Fechar",
  "newMessage.sub": "Escolhe uma ligação para iniciar uma conversa.",
  "newMessage.searchPlaceholder": "Pesquisar ligações…",
  "newMessage.searchAria": "Pesquisar ligações",
  "newMessage.loading": "A carregar as tuas ligações…",
  "newMessage.none": "Ainda não tens ligações.",
  "newMessage.empty": "Nenhuma ligação corresponde a “{query}”.",
};
