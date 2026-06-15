# Inbox de Atendimento WhatsApp com IA

Frontend de um inbox de atendimento WhatsApp, com sugestão de resposta via IA.
Construído como desafio técnico — o backend já estava pronto e hospedado; o foco é
arquitetura de componentes, data fetching e UX.

> O enunciado original do desafio está no histórico do git (commit `b19d168`).

---

## 🚀 Como rodar

```bash
cp .env.example .env.local   # NEXT_PUBLIC_API_URL já vem preenchida
npm install
npm run dev                  # http://localhost:3000
```

Outros scripts:

```bash
npm run build       # build de produção
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
```

Há uma rota `/health` pra debug — checa se a API responde.

---

## 🧱 Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript** (strict)
- **Tailwind v4** pra estilos (sem UI lib — componentes próprios)
- **TanStack Query v5** pra fetch/cache/polling/optimistic
- **Axios** (client já vinha pronto em `lib/api.ts`)
- **clsx** (condicionais de classe) + **date-fns** (formatação ptBR)

Sem dependências extras além dessas duas.

---

## 📁 Estrutura

```
app/
  (inbox)/                       ← route group: shell compartilhado
    layout.tsx                   ← Server: header + sidebar + <slot>
    page.tsx                     ← / → EmptyChatState
    c/[conversationId]/page.tsx  ← /c/:id → ChatPanel
  health/page.tsx                ← /health (debug)
  layout.tsx                     ← root layout
  providers.tsx                  ← QueryClientProvider

components/
  inbox/
    AgentHeader.tsx              ← /me
    ConversationList*.tsx        ← sidebar (lista, item, skeleton, empty, search)
    ChatPanel.tsx                ← orquestrador do chat
    ChatHeader.tsx
    MessageList.tsx              ← scroll inteligente + agrupamento por dia
    MessageBubble.tsx            ← bolha memoizada
    MessageDayDivider.tsx
    ChatMessageStatus.tsx        ← sent / delivered / read / pending
    ChatPanelSkeleton.tsx
    Composer.tsx                 ← textarea + botão IA + envio
    EmptyChatState.tsx

lib/
  api.ts                         ← cliente axios + tipos + funções (fornecido)
  format.ts                      ← timestamps + iniciais + dayKey
  hooks/
    useConversations.ts          ← lista + useConversation(id) via select
    useMessages.ts               ← polling 3s
    useSendMessage.ts            ← optimistic update completo
    useSuggestReply.ts           ← IA
```

---

## 🧠 Decisões de arquitetura

### Server vs Client Components
Layouts e páginas são Server por padrão. Cada Client Component é uma "ilha"
isolada que justifica o `"use client"` por precisar de hook (query, mutation,
estado local, ref): `AgentHeader`, `ConversationList`, `ChatPanel`, `Composer`,
`MessageList`. O resto da árvore é Server — inclusive `EmptyChatState` e
`MessageDayDivider`, que são puro JSX.

### Route group `(inbox)`
O grupo `(inbox)` deixa `/` e `/c/:id` compartilharem o mesmo shell (header +
sidebar) sem prefixar a URL. Nada de redirect artificial — `/` já renderiza o
estado vazio dentro da shell. **Conversa selecionada é URL state** (`/c/:id`),
não estado local: link compartilhável, navegação nativa do browser, simples no
mobile.

### Polling com intervalos diferentes
- **Sidebar**: 5s (mensagens chegando em conversas que não estão abertas)
- **Chat aberto**: 3s (foco do atendente — precisa parecer mais "vivo")

Polling foi a escolha porque (a) o enunciado considera suficiente, (b) o backend
fornecido é REST puro. WebSocket / SSE seriam evolução natural; ver
"O que faria com mais tempo".

### `useConversation(id)` reusa o cache de `useConversations`
A API não tem `GET /conversations/:id`. Em vez de fazer uma request extra, o
hook usa a mesma `queryKey` e um `select` que extrai a conversa atual da lista
já em memória. Isso significa:
- Zero requests adicionais ao clicar numa conversa
- Funciona com **deep link** (entra direto em `/c/:id`): o react-query dispara
  a query da lista uma única vez e o `select` filtra
- Header do chat aparece instantaneamente

### Optimistic update do envio
`useSendMessage` faz update otimista completo em 4 passos:

1. **`onMutate`**: `cancelQueries` impede o polling de 3s sobrescrever a bolha
   em trânsito. Injeta uma `LocalMessage` com `pending: true` no cache.
2. **`onError`**: NÃO faz rollback. Marca `error: true` na mensagem otimista.
   Manter no DOM com "Tentar novamente?" é melhor UX que sumir.
3. **`onSuccess`**: substitui a otimista pela mensagem real do servidor (id e
   status corretos).
4. **`onSettled`**: invalida `messages` (ressincroniza ordem) **e**
   `conversations` (sidebar atualiza `lastMessage` / `lastMessageAt`).

Cada envio gera um `tempId` único via `crypto.randomUUID()` — suporta envios em
rápida sucessão sem colisão no cache.

### Tipo `LocalMessage`
`LocalMessage extends Message` adiciona `pending?`, `error?`, `draftText?`.
Mantém o tipo do backend limpo e permite consumidores que só leem `Message`
continuarem funcionando sem cast. O cache do react-query é declarado como
`LocalMessage[]`.

### Sugerir resposta com IA
Botão chama `/ai/suggest`, preenche o textarea com o resultado e foca o
campo (para o atendente revisar antes de enviar). Se já houver texto digitado,
pede confirmação via `window.confirm` (sem sistema de modal pra essa única
ação). Quando `source === "mock" | "mock-fallback"`, mostra um badge âmbar
discreto — útil pro dev saber que o backend caiu em fallback.

### Estados (loading / erro / vazio)
Cada superfície cobre os três:
- **Loading inicial** = skeleton (não spinner)
- **Erro** = mensagem + botão "Tentar novamente" que chama `refetch()` /
  reenvia
- **Vazio** = ilustração + texto

Refetches do polling **não piscam a UI** — só um pequeno "Atualizando…"
discreto no header do bloco, controlado por `isFetching && !isPending`.

### Scroll inteligente do chat
Ao montar a lista, ancora no final sem animação (evita flash). Em mensagens
novas, **só rola** se o usuário estiver dentro de 80px do final — se ele subiu
pra ler histórico, respeita a posição. É o comportamento padrão de
WhatsApp/iMessage/Slack.

### Acessibilidade
- `role="log" aria-live="polite" aria-atomic="false"` na lista de mensagens
- `sr-only` prefixa "Sua mensagem" / "Mensagem do cliente" nas bolhas
- `aria-label` pluralizado no badge de não-lidas ("1 não lida" / "N não lidas")
- `aria-current="page"` no item ativo da sidebar
- `role="separator"` nos divisores por dia
- Botões só-com-ícone com `aria-label`
- IME-safe: `e.nativeEvent.isComposing` evita Enter mandar durante composição
  de caractere em japonês/chinês/coreano
- Toast de erro com `role="status"` + `aria-live="polite"`

### Memoização cirúrgica
`MessageBubble` é `memo`-izado porque o polling de 3s recria o array de
mensagens — sem `memo`, todas as bolhas re-renderizariam a cada tick. Como o
id é estável, comparação rasa basta. `onRetry` precisa estar estável no pai
(`useCallback`) pra memo não quebrar.

### Tema visual
- Acento `#25D366` (verde WhatsApp), neutros cinza/branco
- Painel de chat com background `#E5DDD5` + dois radial-gradients sutis
  imitando o "papel de parede" clássico
- Bolha out: `#DCF8C6`; bolha in: branca com borda
- Status `read` em azul `#34B7F1`

### Hydration warning
Foi necessário adicionar `suppressHydrationWarning` no `<body>` do root layout
porque algumas extensões de browser (ex: Testim) injetam atributos no body
antes do React hidratar. O suppress é **não-recursivo** — erros reais dentro
da árvore continuam aparecendo.

---

## 🛠️ O que eu faria com mais tempo

### UX
- **Botão "↓ N novas"** quando mensagens chegam com scroll lá em cima
- **Marcar como lida** otimisticamente ao abrir a conversa (`unread = 0`)
- **Atalhos de teclado** (J/K navegação, `/` foca busca, Esc volta no mobile)
- **Anexos** (imagens, áudios) se o backend expor `attachments[]`
- **Indicador "digitando…"** se o backend expor — exige SSE/WebSocket
- **Dark mode** via CSS vars ou next-themes
- **Animações sutis** de entrada das bolhas (Framer Motion)

### Robustez
- **404 handling** quando `/c/:id` aponta pra conversa inexistente
- **Reconectar** quando a aba volta do background (`refetchOnWindowFocus`
  seletivo nas queries críticas)
- **Toast system** próprio (hoje é toast inline simples no Composer)
- **i18n** estrutural (strings hardcoded em pt-BR hoje)

### Real-time
- Substituir o polling por **SSE** ou **WebSocket** quando o backend expuser.
  A camada de abstração já existe — só trocar o `useQuery` polling por um hook
  que escuta o stream e chama `queryClient.setQueryData`.

### Testes
- **Unit**: `format.ts`, hooks via RTL + MSW
- **E2E**: Playwright cobrindo golden path + erro de envio + retry + IA

### Performance
- **Virtualização** da lista de mensagens (TanStack Virtual) se o histórico
  crescer
- **Prefetch** das mensagens ao hover no item da sidebar
- **Lazy load** do ChatPanel

### Tooling
- **Husky + lint-staged** rodando typecheck/lint pre-commit
- **CI** com build + typecheck + tests
- **Storybook** pros componentes do inbox

---

## ✅ Mapeamento ao desafio

| Requisito | Onde |
|---|---|
| Lista de conversas (busca, não-lidas, última msg) | `components/inbox/ConversationList*.tsx` |
| Tela de chat (bolhas in/out, timestamps) | `components/inbox/MessageList.tsx` + `MessageBubble.tsx` |
| Envio com update otimista | `lib/hooks/useSendMessage.ts` |
| Sugerir IA | `lib/hooks/useSuggestReply.ts` + `components/inbox/Composer.tsx` |
| Loading / erro / vazio + a11y | em cada componente; padrão sr-only + roles ARIA |
| Polling | `useConversations` (5s), `useMessages` (3s) |
