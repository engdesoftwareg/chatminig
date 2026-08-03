/**
 * Renderização de Markdown e conversão para texto puro.
 *
 * Este módulo é a fronteira de segurança da aplicação: tudo que o modelo de
 * linguagem devolve passa por aqui antes de virar HTML na tela. O conteúdo é
 * texto gerado por IA a partir de páginas da internet — ou seja, entrada não
 * confiável. Por isso `esc` roda ANTES de qualquer formatação: primeiro
 * neutraliza o HTML, depois adiciona as tags que a gente controla.
 */

/**
 * Neutraliza HTML antes de qualquer formatação.
 *
 * As aspas também são escapadas: valores daqui acabam dentro de atributos
 * (`href="..."`), e uma aspa não escapada fecharia o atributo e permitiria
 * injetar um manipulador de evento.
 */
export function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Converte Markdown em HTML seguro para inserir na página. */
export function md(text) {
  let t = esc(text);

  t = t.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, l, c) => `<pre><code>${c.trim()}</code></pre>`);
  t = t.replace(/`([^`\n]+)`/g, "<code>$1</code>");
  // Só http(s): impede que o modelo produza um link javascript: clicável.
  t = t.replace(
    /\[([^\]]+)\]\((https?:[^)\s]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener">$1</a>',
  );
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/^#{1,4} (.*)$/gm, "<strong>$1</strong>");
  t = t.replace(/((?:^[-*•] .*\n?)+)/gm, (m) =>
    "<ul>" + m.trim().split(/\n/).map((l) => `<li>${l.replace(/^[-*•] /, "")}</li>`).join("") + "</ul>",
  );
  t = t.replace(/((?:^\d+[.)] .*\n?)+)/gm, (m) =>
    "<ol>" + m.trim().split(/\n/).map((l) => `<li>${l.replace(/^\d+[.)] /, "")}</li>`).join("") + "</ol>",
  );

  return t
    .split(/\n{2,}/)
    .map((p) => (/^<(ul|ol|pre)/.test(p.trim()) ? p : `<p>${p.replace(/\n/g, "<br>")}</p>`))
    .join("");
}

/** Reduz Markdown a texto corrido, para a síntese de voz não ler pontuação. */
export function toPlain(mdText) {
  return String(mdText ?? "")
    .replace(/```[\s\S]*?```/g, " (trecho de código) ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\(https?:[^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/^#{1,4} /gm, "")
    .replace(/^[-*•] /gm, "")
    .trim();
}
