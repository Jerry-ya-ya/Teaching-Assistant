import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ContentService, type Course } from './content.service';
import { MarkdownViewComponent } from './markdown-view.component';
import type { Heading } from './markdown';

@Component({
  selector: 'app-lesson',
  imports: [RouterLink, MarkdownViewComponent],
  templateUrl: './lesson.component.html',
})
export class LessonComponent {
  readonly content = inject(ContentService);
  private readonly route = inject(ActivatedRoute);
  readonly course = signal<Course | undefined>(undefined);
  readonly markdown = signal('');
  readonly loading = signal(true);
  readonly error = signal('');
  readonly headings = signal<Heading[]>([]);
  readonly toc = computed(() => this.headings().filter(h => h.level <= 3));
  readonly previous = computed(() => this.content.courses().find(c => c.number === (this.course()?.number ?? 0) - 1));
  readonly next = computed(() => this.content.courses().find(c => c.number === (this.course()?.number ?? 0) + 1));
  readonly sourceUrl = computed(() => `https://github.com/Jerry-ya-ya/Teaching-Assistant/blob/main/${this.course()?.source ?? ''}`);
  private request = 0;

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe(params => void this.load(params.get('id') ?? ''));
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe(() => this.scrollToSection());
  }

  private async load(id: string) {
    const request = ++this.request;
    this.loading.set(true);
    this.error.set('');
    this.markdown.set('');
    this.headings.set([]);
    try {
      const courses = await this.content.load();
      const course = courses.find(course => course.id === id);
      if (!course) throw new Error('課程不存在，請從課程目錄選擇其他教材。');
      const markdown = await this.content.read(course.source);
      if (request !== this.request) return;
      this.course.set(course);
      this.markdown.set(markdown);
      document.title = `${String(course.number).padStart(2, '0')} ${course.title}｜Teaching Assistant`;
    } catch (error) {
      if (request === this.request) this.error.set(error instanceof Error && error.message.startsWith('課程') ? error.message : '教材暫時無法載入，請稍後重試。');
    } finally {
      if (request === this.request) this.loading.set(false);
    }
  }

  updateHeadings(headings: Heading[]) {
    this.headings.set(headings);
    setTimeout(() => this.scrollToSection(), 0);
  }

  scrollToSection() {
    const section = this.route.snapshot.queryParamMap.get('section');
    if (section) document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
  }

  goTo(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }
}
