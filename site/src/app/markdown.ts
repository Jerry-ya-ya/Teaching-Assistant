import { Marked, Renderer, type Tokens } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js/lib/common';
import type { Course } from './content.service';

const escape = (text: string) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

export interface Heading { id: string; title: string; level: number }
export interface MarkdownResult { html: string; codes: string[]; diagrams: string[]; headings: Heading[] }

export function renderMarkdown(markdown: string, source: string, courses: Course[]): MarkdownResult {
  const result: MarkdownResult = { html: '', codes: [], diagrams: [], headings: [] };
  const renderer = new Renderer();
  const parser = new Marked({ gfm: true, breaks: false });
  const headingCounts = new Map<string, number>();

  function resolve(href: string, image = false): string {
    if (/^(https?:|mailto:)/i.test(href)) return href;
    if (href.startsWith('#')) return image ? '' : href;
    if (/^[a-z][a-z\d+.-]*:/i.test(href) || href.startsWith('//')) return '';
    const url = new URL(href, new URL(source, 'https://content.local/'));
    const pathname = decodeURIComponent(url.pathname).replace(/^\//, '');
    if (!image && /\.md$/i.test(pathname)) {
      const course = courses.find(c => c.source === pathname);
      const route = pathname.toLowerCase() === 'readme.md' ? '#/' : course ? `#/lesson/${course.id}` : '';
      if (!route) return `https://github.com/Jerry-ya-ya/Teaching-Assistant/blob/main/${pathname}${url.hash}`;
      return route + (url.hash ? `?section=${encodeURIComponent(decodeURIComponent(url.hash.slice(1)))}` : '');
    }
    return new URL(`content/${pathname}${url.search}${url.hash}`, document.baseURI).href;
  }

  renderer.link = function(token: Tokens.Link) {
    const text = this.parser.parseInline(token.tokens);
    try {
      const href = resolve(token.href);
      const external = /^https?:/i.test(href) && new URL(href).origin !== location.origin;
      return `<a href="${escape(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${text}</a>`;
    } catch {
      // GFM may include full-width punctuation in a bare URL; retain readable text.
      return text;
    }
  };
  renderer.image = token => `<img src="${escape(resolve(token.href, true))}" alt="${escape(token.text)}" loading="lazy"${token.title ? ` title="${escape(token.title)}"` : ''}>`;
  renderer.heading = function(token) {
    const title = token.text.replace(/<[^>]*>/g, '').replace(/[*`_]/g, '');
    const slug = title.toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').trim().replace(/\s/g, '-');
    const count = headingCounts.get(slug) ?? 0;
    headingCounts.set(slug, count + 1);
    const id = slug + (count ? `-${count}` : '');
    result.headings.push({ id, title, level: token.depth });
    return `<h${token.depth} id="${escape(id)}">${this.parser.parseInline(token.tokens)}</h${token.depth}>`;
  };
  renderer.blockquote = function(token) {
    const match = token.text.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*(?:\n|$)/);
    if (!match) return `<blockquote>${this.parser.parse(token.tokens)}</blockquote>`;
    const type = match[1];
    const labels: Record<string, string> = { NOTE: '補充說明', TIP: '操作提示', IMPORTANT: '重要事項', WARNING: '注意', CAUTION: '小心操作' };
    // Re-parse only the body so a marker sharing the first paragraph is removed cleanly.
    const body = parser.parse(token.text.slice(match[0].length)) as string;
    return `<aside class="markdown-alert alert-${type.toLowerCase()}"><div class="alert-label">${labels[type]}</div>${body}</aside>`;
  };
  renderer.code = token => {
    const index = result.codes.push(token.text) - 1;
    const language = (token.lang ?? 'text').split(/\s+/)[0];
    const copy = `<button type="button" class="copy-button" data-copy="${index}" aria-label="複製${escape(language)}程式碼">複製</button>`;
    const plain = `<pre><code>${escape(token.text)}</code></pre>`;
    if (language === 'mermaid') {
      const diagram = result.diagrams.push(token.text) - 1;
      return `<section class="diagram-block"><div class="code-toolbar"><span>流程圖 · MERMAID · 可左右捲動</span>${copy}</div><div class="diagram" data-diagram="${diagram}" role="img" aria-label="課程流程圖" tabindex="0"><p class="diagram-loading">圖表載入中…</p></div><details><summary>查看圖表原始碼</summary>${plain}</details></section>`;
    }
    const aliases: Record<string, string> = { dotenv: 'ini', gitignore: 'plaintext', requirements: 'plaintext', jinja: 'django', text: 'plaintext' };
    const highlightLanguage = aliases[language] ?? language;
    const code = hljs.getLanguage(highlightLanguage) ? hljs.highlight(token.text, { language: highlightLanguage }).value : escape(token.text);
    return `<section class="code-block"><div class="code-toolbar"><span>${escape(language)}</span>${copy}</div><pre><code class="hljs language-${escape(language)}">${code}</code></pre></section>`;
  };
  // Register after defining overrides: Marked snapshots renderer methods in use().
  parser.use({ renderer });
  // HTML examples inside fences are always escaped; raw HTML is sanitized before insertion.
  result.html = DOMPurify.sanitize(parser.parse(markdown) as string, {
    ADD_ATTR: ['target'], FORBID_TAGS: ['form', 'iframe', 'style'],
  });
  return result;
}
