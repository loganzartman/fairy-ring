// shared helpers for the docs pages in storybook (not part of the published library)
import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import ini from "highlight.js/lib/languages/ini";
import javascript from "highlight.js/lib/languages/javascript";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml";
import { html, type TemplateResult } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

hljs.registerLanguage("toml", ini); // highlight.js's ini grammar covers TOML
hljs.registerLanguage("html", xml);
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("sh", bash);
hljs.registerLanguage("css", css);

/**
 * trim blank edges and strip the indentation shared by all lines, so snippets can be indented
 * to match the surrounding code. use as a tag (dedent`...`) or call it on a string.
 */
export function dedent(strings: TemplateStringsArray | string, ...values: unknown[]): string {
  const text =
    typeof strings === "string"
      ? strings
      : strings.reduce((acc, s, i) => acc + s + (i < values.length ? String(values[i]) : ""), "");
  const lines = text.replace(/^\s*\n|\s+$/g, "").split("\n");
  const indent = Math.min(
    ...lines.filter((l) => l.trim()).map((l) => l.length - l.trimStart().length),
  );
  return lines.map((l) => l.slice(indent)).join("\n");
}

/** syntax-highlighted code block */
export function code(
  source: string,
  language: "toml" | "html" | "js" | "sh" | "css",
): TemplateResult {
  return html`<pre><code>${unsafeHTML(hljs.highlight(source.trim(), { language }).value)}</code></pre>`;
}

/** link to another storybook page; relative so it works when deployed under a subpath */
export function storyLink(id: string, text: string): TemplateResult {
  return html`<a href="./?path=/story/${id}">${text}</a>`;
}

export const docsStyles: TemplateResult = html`<style>
  :root {
    color-scheme: light dark;
    --fg: #222;
    --bg: #fff;
    --muted-bg: #f5f5f5;
    --border: #ddd;
    --link: #0969da;
    --target: #fff3c4;
    --hl-keyword: #6f42c1;
    --hl-attr: #005cc5;
    --hl-string: #22863a;
    --hl-literal: #d73a49;
    --hl-comment: #6a737d;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --fg: #e6edf3;
      --bg: #0d1117;
      --muted-bg: #161b22;
      --border: #30363d;
      --link: #4493f8;
      --target: #3d2e00;
      --hl-keyword: #d2a8ff;
      --hl-attr: #79c0ff;
      --hl-string: #a5d6ff;
      --hl-literal: #ff7b72;
      --hl-comment: #8b949e;
    }
  }
  body {
    background: var(--bg);
  }
  a {
    color: var(--link);
  }
  article {
    font:
      15px/1.5 system-ui,
      sans-serif;
    max-width: 960px;
    color: var(--fg);
  }
  h2 {
    font-size: 1.25em;
    margin: 2em 0 0.5em;
    scroll-margin-top: 0.5em;
  }
  h2:first-child {
    margin-top: 0;
  }
  h3 {
    font-size: 1.1em;
    margin: 1.5em 0 0.5em;
    scroll-margin-top: 0.5em;
  }
  h2:target,
  h3:target {
    background: var(--target);
    outline: 0.25em solid var(--target);
  }
  table {
    border-collapse: collapse;
    width: 100%;
  }
  th,
  td {
    border: 1px solid var(--border);
    padding: 0.4em 0.75em;
    text-align: left;
    vertical-align: top;
  }
  th {
    background: var(--muted-bg);
    font-weight: 600;
  }
  td:nth-child(-n + 2) {
    white-space: nowrap;
  }
  th:last-child {
    width: 100%;
  }
  code {
    font-size: 0.9em;
  }
  pre {
    background: var(--muted-bg);
    border: 1px solid var(--border);
    padding: 0.75em 1em;
    overflow-x: auto;
  }
  .hljs-section,
  .hljs-keyword {
    color: var(--hl-keyword);
    font-weight: 600;
  }
  [class^="hljs-selector"] {
    color: var(--hl-keyword);
  }
  .hljs-attr,
  .hljs-attribute,
  .hljs-name,
  .hljs-title {
    color: var(--hl-attr);
  }
  .hljs-string {
    color: var(--hl-string);
  }
  .hljs-literal,
  .hljs-number,
  .hljs-built_in {
    color: var(--hl-literal);
  }
  .hljs-comment {
    color: var(--hl-comment);
  }
</style>`;
