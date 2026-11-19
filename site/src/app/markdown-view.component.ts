import { Component, ElementRef, effect, input, output, signal, viewChild } from '@angular/core';
import DOMPurify from 'dompurify';
import type { Course } from './content.service';
import { renderMarkdown, type Heading } from './markdown';

let diagramSequence = 0;
let diagramQueue: Promise<unknown> = Promise.resolve();
let mermaidReady: Promise<typeof import('mermaid').default> | undefined;

@Component({
  selector: 'app-markdown',
  template: '<div #body class="markdown-body" (click)="onClick($event)"></div><span class="sr-only" role="status" aria-live="polite">{{ copyStatus() }}</span>',
})
export class MarkdownViewComponent {
  readonly markdown = input.required<string>();
  readonly source = input.required<string>();
  readonly courses = input.required<Course[]>();
  readonly headingsChange = output<Heading[]>();
  private readonly body = viewChild<ElementRef<HTMLDivElement>>('body');
  private codes: string[] = [];
  readonly copyStatus = signal('');

  constructor() {
    effect(() => {
      const body = this.body()?.nativeElement;
      const markdown = this.markdown();
      const source = this.source();
      const courses = this.courses();
      if (!body) return;
      const rendered = renderMarkdown(markdown, source, courses);
      this.codes = rendered.codes;
      body.innerHTML = rendered.html;
      this.headingsChange.emit(rendered.headings);
      for (const element of body.querySelectorAll<HTMLElement>('[data-diagram]')) {
        const source = rendered.diagrams[Number(element.dataset['diagram'])];
        diagramQueue = diagramQueue.catch(() => undefined).then(async () => {
          if (!element.isConnected) return;
          try {
            const mermaid = await (mermaidReady ??= import('mermaid').then(module => {
              module.default.initialize({ startOnLoad: false, securityLevel: 'strict', htmlLabels: false, theme: 'base', themeVariables: {
                primaryColor: '#e3f2ed', primaryTextColor: '#193b38', primaryBorderColor: '#7eaca0',
                lineColor: '#7a8c8c', fontFamily: 'system-ui, sans-serif',
              } });
              return module.default;
            }));
            if (!element.isConnected) return;
            const { svg } = await mermaid.render(`course-diagram-${++diagramSequence}`, source);
            if (element.isConnected) {
              element.innerHTML = DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true, svgFilters: true } });
              const drawing = element.querySelector('svg');
              if (drawing && drawing.viewBox.baseVal.width > element.clientWidth) {
                // Keep wide learning diagrams readable instead of shrinking every label.
                drawing.style.width = `${Math.ceil(drawing.viewBox.baseVal.width)}px`;
                drawing.style.maxWidth = 'none';
              }
            }
          } catch {
            if (element.isConnected) element.textContent = '圖表暫時無法顯示，仍可查看或複製下方原始碼。';
          }
        });
      }
    });
  }

  async onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const button = target.closest<HTMLButtonElement>('button[data-copy]');
    if (button) {
      const text = this.codes[Number(button.dataset['copy'])];
      try {
        if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
        else {
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.append(textarea);
          textarea.select();
          const copied = document.execCommand('copy');
          textarea.remove();
          if (!copied) throw new Error('Clipboard unavailable');
          button.focus();
        }
        button.textContent = '已複製';
        this.copyStatus.set('程式碼已複製');
      } catch {
        button.textContent = '請選取程式碼複製';
        this.copyStatus.set('複製失敗，請手動選取程式碼複製');
      }
      return;
    }
    const link = target.closest<HTMLAnchorElement>('a[href^="#"]');
    if (link && !link.getAttribute('href')?.startsWith('#/')) {
      event.preventDefault();
      const id = decodeURIComponent(link.getAttribute('href')!.slice(1));
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
