# chatminig


[![ci](https://github.com/engdesoftwareg/chatminig/actions/workflows/ci.yml/badge.svg)](https://github.com/engdesoftwareg/chatminig/actions/workflows/ci.yml)

[English version](README.md)

Aplicação web de chat com IA, com autenticação de usuários e resposta em áudio.

O projeto foi criado para praticar front-end sem framework, integração com backend gerenciado e consumo de APIs de modelos de linguagem de forma segura.

Demo: https://engdesoftwareg.github.io/chatminig/

## Telas

Tela de login

![Tela de login do chatminig](screenshot-login.png)

Interface de conversa

![Interface de conversa do chatminig](screenshot-chat.png)

## Funcionalidades

Login e cadastro por e-mail e senha, com sessão persistente e logout.
Interface de conversa em tempo real, com histórico enviado ao modelo para manter contexto.
Conversão das respostas em áudio (text-to-speech).
Controle de cadastro: o registro de novos usuários pode ser bloqueado sem afetar quem já tem conta.

## Tecnologias

HTML, CSS e JavaScript puro (sem framework), em arquivo único.
Supabase para autenticação.
Supabase Edge Functions para as rotas de chat e de síntese de voz.
SDK supabase-js carregado via ESM.

## Decisão de arquitetura

As chamadas ao modelo de linguagem e ao serviço de voz não acontecem no navegador: elas passam por Edge Functions.
Assim as chaves de API ficam no servidor e nunca são expostas no código do cliente.

## Como executar

Clone o repositório e abra o arquivo `index.html` no navegador, ou sirva a pasta com qualquer servidor estático:

```bash
git clone https://github.com/engdesoftwareg/chatminig.git
cd chatminig
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.

Para usar com o seu próprio backend, configure um projeto no Supabase, publique as funções `chat` e `tts` e ajuste a URL e a chave pública no início do `index.html`.

## Estrutura

```
index.html          interface, estilos e integração
lib/markdown.js     conversão de Markdown em HTML e em texto puro
tests/              testes automatizados (vitest)
```

## Testes

```bash
npm install
npm test
```

**21 testes** cobrindo o módulo que transforma a resposta do modelo em HTML — a fronteira de segurança da aplicação, já que o texto vem de uma IA que lê páginas da internet.

Cobrem escape de HTML, blocos de código, links, listas, separação de parágrafos e a conversão para texto puro usada pela síntese de voz. E, principalmente, cobrem os ataques que essa camada precisa barrar: tags `<script>`, atributos de evento, links `javascript:` e URL tentando fechar o atributo `href` para injetar um manipulador.

**Uma vulnerabilidade real foi encontrada ao escrever esses testes.** A função de escape tratava `&`, `<` e `>`, mas não aspas — e a URL do link é inserida dentro de `href="..."`. Uma URL com aspa dupla fechava o atributo e transformava o restante em manipulador de evento no próprio link. Como as respostas vêm de um modelo que lê páginas da web, uma página maliciosa poderia fazer esse link ser reproduzido no chat. Corrigido escapando as aspas, com teste de regressão.

O CI roda os testes a cada push.

## Licença

MIT
