// shared helpers for the docs pages in storybook (not part of the published library)
import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import ini from "highlight.js/lib/languages/ini";
import javascript from "highlight.js/lib/languages/javascript";
import xml from "highlight.js/lib/languages/xml";
import { html, type TemplateResult } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

hljs.registerLanguage("toml", ini); // highlight.js's ini grammar covers TOML
hljs.registerLanguage("html", xml);
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("sh", bash);

/** syntax-highlighted code block */
export function code(source: string, language: "toml" | "html" | "js" | "sh"): TemplateResult {
  return html`<pre><code>${unsafeHTML(hljs.highlight(source.trim(), { language }).value)}</code></pre>`;
}

/** link to another storybook page; relative so it works when deployed under a subpath */
export function storyLink(id: string, text: string): TemplateResult {
  return html`<a href="./?path=/story/${id}">${text}</a>`;
}

export const docsStyles: TemplateResult = html`<style>
  article {
    font:
      15px/1.5 system-ui,
      sans-serif;
    max-width: 960px;
    color: #222;
  }
  h2 {
    font-size: 1.25em;
    margin: 2em 0 0.5em;
    scroll-margin-top: 0.5em;
  }
  h2:first-child {
    margin-top: 0;
  }
  h2:target {
    background: #fff3c4;
    outline: 0.25em solid #fff3c4;
  }
  table {
    border-collapse: collapse;
    width: 100%;
  }
  th,
  td {
    border: 1px solid #ddd;
    padding: 0.4em 0.75em;
    text-align: left;
    vertical-align: top;
  }
  th {
    background: #f5f5f5;
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
    background: #f5f5f5;
    border: 1px solid #ddd;
    padding: 0.75em 1em;
    overflow-x: auto;
  }
  .hljs-section,
  .hljs-keyword {
    color: #6f42c1;
    font-weight: 600;
  }
  .hljs-attr,
  .hljs-name,
  .hljs-title {
    color: #005cc5;
  }
  .hljs-string {
    color: #22863a;
  }
  .hljs-literal,
  .hljs-number,
  .hljs-built_in {
    color: #d73a49;
  }
  .hljs-comment {
    color: #6a737d;
  }
</style>`;
