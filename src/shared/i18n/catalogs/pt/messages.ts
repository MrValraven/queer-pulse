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
  "thread.menuAria": "Opções da conversa",
  "thread.deleteChat": "Apagar conversa",
  "deleteChat.confirmTitle": "Apagar esta conversa?",
  "deleteChat.confirmBody":
    "Desaparece da tua caixa de entrada e limpa a tua cópia. {name} mantém a dele(a) — e se te enviar mensagem outra vez, a conversa volta só com as mensagens novas.",
  "deleteChat.confirmBodyGeneric":
    "Desaparece da tua caixa de entrada e limpa a tua cópia. A outra pessoa mantém a dela — e se te enviar mensagem outra vez, a conversa volta só com as mensagens novas.",
  "deleteChat.confirmCta": "Apagar conversa",
  "deleteChat.cancelCta": "Cancelar",

  // Painel da conversa (ConversationPanel)
  "conversation.activeNow": "Ativo/a agora",
  "conversation.officialMeta":
    "Oficial · Não é possível responder nesta conversa",
  "conversation.connectedSinceSuffix": " · Ligação desde {date}",
  "conversation.viewProfile": "Ver perfil",
  "conversation.you": "Tu",
  "conversation.newMessages": "Novas mensagens",
  "conversation.unreadDivider": "Novas mensagens",
  "conversation.loadingOlder": "A carregar mensagens anteriores…",
  "conversation.typing": "{name} está a escrever…",
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
  "status.sending": "A enviar…",
  "status.retry": "Não entregue · Tentar de novo",
  "status.seen": "Visto",

  // Barra de ações por mensagem (MessageActions/ReactionPicker)
  "actions.react": "Reagir",
  "actions.more": "Mais",
  "actions.report": "Denunciar",
  "actions.delete": "Eliminar",

  // Overlay de pressão longa/clique direito (MessageActionOverlay) — reutiliza
  // actions.report/actions.delete acima para os seus próprios itens de menu.
  "actions.menuLabel": "Ações da mensagem",
  "actions.reply": "Responder",
  "actions.edit": "Editar",
  "actions.copy": "Copiar",
  "actions.edited": "editada",
  "actions.editing": "A editar mensagem",
  "actions.editSave": "Guardar",
  "actions.editCancel": "Cancelar",
  "actions.replyingTo": "A responder a {name}",
  replyDeleted: "Mensagem eliminada",
  tombstone: "Esta mensagem foi eliminada",
  "delete.confirmTitle": "Eliminar esta mensagem?",
  "delete.confirmBody": "Será removida para todos nesta conversa.",
  "delete.confirmCta": "Eliminar",
  "delete.cancelCta": "Cancelar",
  "report.title": "Denunciar esta mensagem",

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
