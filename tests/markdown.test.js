import { describe, expect, it } from "vitest";

import { esc, md, toPlain } from "../lib/markdown.js";

describe("esc", () => {
  it("neutraliza os caracteres que abrem tag HTML", () => {
    expect(esc('<script>alert(1)</script>')).toBe(
      "&lt;script&gt;alert(1)&lt;/script&gt;",
    );
  });

  it("escapa o & primeiro, para não gerar entidade dupla", () => {
    expect(esc("&lt;")).toBe("&amp;lt;");
  });

  it("aceita valores ausentes sem quebrar", () => {
    expect(esc(null)).toBe("");
    expect(esc(undefined)).toBe("");
  });
});

describe("md — segurança", () => {
  it("não deixa passar tag de script vinda do modelo", () => {
    const saida = md('Olha isto: <script>fetch("https://malicioso.example")</script>');

    expect(saida).not.toMatch(/<script/i);
    expect(saida).toContain("&lt;script&gt;");
  });

  it("não deixa passar atributo de evento", () => {
    const saida = md('<img src=x onerror="alert(1)">');

    // A tag não pode existir: o texto pode aparecer, desde que escapado.
    expect(saida).not.toMatch(/<img/i);
    expect(saida).toContain("&lt;img");
  });

  it("não transforma javascript: em link clicável", () => {
    const saida = md("[clique aqui](javascript:alert(1))");

    expect(saida).not.toMatch(/<a /);
    expect(saida).not.toMatch(/href=/);
  });

  it("não deixa a URL fechar o atributo href para injetar um evento", () => {
    // Regressão: o escape original não tratava aspas, então esta URL fechava o
    // href e o que vinha depois virava atributo do próprio link.
    const saida = md('[clique](https://ok.example"onmouseover=alert(1))');

    expect(saida).not.toMatch(/"\s*onmouseover/);
    expect(saida).toContain("&quot;");
  });

  it("escapa aspas simples, que também fecham atributo", () => {
    expect(esc("'")).toBe("&#39;");
  });

  it("escapa HTML mesmo dentro de bloco de código", () => {
    const saida = md("```\n<script>alert(1)</script>\n```");

    expect(saida).toContain("<pre><code>");
    expect(saida).not.toMatch(/<script/i);
  });
});

describe("md — formatação", () => {
  it("converte negrito", () => {
    expect(md("isto é **importante**")).toContain("<strong>importante</strong>");
  });

  it("converte código em linha", () => {
    expect(md("rode `npm test` agora")).toContain("<code>npm test</code>");
  });

  it("converte link http em âncora que não vaza a aba de origem", () => {
    const saida = md("veja [o site](https://example.com)");

    expect(saida).toContain('href="https://example.com"');
    expect(saida).toContain('rel="noopener"');
    expect(saida).toContain(">o site</a>");
  });

  it("converte lista com marcadores", () => {
    const saida = md("- primeiro\n- segundo");

    expect(saida).toContain("<ul>");
    expect(saida).toContain("<li>primeiro</li>");
    expect(saida).toContain("<li>segundo</li>");
  });

  it("converte lista numerada", () => {
    const saida = md("1. um\n2. dois");

    expect(saida).toContain("<ol>");
    expect(saida).toContain("<li>um</li>");
  });

  it("converte título em negrito, já que o balão não comporta hierarquia", () => {
    expect(md("## Resumo")).toContain("<strong>Resumo</strong>");
  });

  it("separa parágrafos e preserva quebra simples como <br>", () => {
    const saida = md("linha um\nlinha dois\n\nnovo parágrafo");

    expect(saida).toContain("linha um<br>linha dois");
    expect(saida).toContain("<p>novo parágrafo</p>");
  });

  it("não envolve bloco de código em parágrafo", () => {
    expect(md("```\ncodigo\n```")).not.toMatch(/<p><pre/);
  });
});

describe("toPlain", () => {
  it("substitui bloco de código por um aviso, para a voz não soletrar código", () => {
    const saida = toPlain("Antes\n```js\nconst x = 1;\n```\nDepois");

    expect(saida).toContain("(trecho de código)");
    expect(saida).not.toContain("const x = 1;");
  });

  it("mantém o texto do link e descarta a URL", () => {
    expect(toPlain("veja [o site](https://example.com)")).toBe("veja o site");
  });

  it("remove marcação de negrito, título e lista", () => {
    expect(toPlain("## Título")).toBe("Título");
    expect(toPlain("**forte**")).toBe("forte");
    expect(toPlain("- item")).toBe("item");
  });

  it("aceita valores ausentes sem quebrar", () => {
    expect(toPlain(null)).toBe("");
  });
});
