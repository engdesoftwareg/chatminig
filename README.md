# chatminig

[![license](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**[▶ Live demo](https://engdesoftwareg.github.io/chatminig/)** · [Versão em português](README.pt-BR.md)

AI chat web application with user authentication and spoken replies.

Built to practise front-end without a framework, integration with a managed backend, and consuming language-model APIs safely.

## Screens

Login screen

![chatminig login screen](screenshot-login.png)

Conversation interface

![chatminig conversation interface](screenshot-chat.png)

## Features

- Email and password sign-up and sign-in, with a persistent session and logout
- Real-time conversation interface, sending the history to the model to preserve context
- Text-to-speech conversion of the replies
- Sign-up control: new registrations can be blocked without affecting existing accounts

## Architecture decision

Calls to the language model and to the speech service do **not** happen in the browser: they go through Edge Functions.

That keeps API keys on the server, never exposed in client-side code. The key that does appear in `index.html` is the Supabase publishable key, designed for browser use and protected by row-level security on the database.

## Tech

HTML, CSS and vanilla JavaScript (no framework), in a single file · Supabase for authentication · Supabase Edge Functions for the chat and speech routes · supabase-js SDK loaded over ESM

## Running it

Clone the repository and open `index.html` in a browser, or serve the folder with any static server:

```bash
git clone https://github.com/engdesoftwareg/chatminig.git
cd chatminig
python -m http.server 8000
```

Then open `http://localhost:8000`.

To use it with your own backend, create a Supabase project, deploy the `chat` and `tts` functions and adjust the URL and publishable key at the top of `index.html`.

## Structure

```
index.html    the whole application (markup, styles and logic)
```

## Current state

This is the oldest project in the portfolio and **has no automated tests or CI** — unlike the other repositories here. The application works and is deployed, but it carries no safety net. Extracting the logic out of the single file and covering it with tests is the next step.

## License

MIT
