import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from './content.service';
import { MarkdownViewComponent } from './markdown-view.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, MarkdownViewComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  readonly content = inject(ContentService);
  readonly introduction = signal('');
  readonly category = signal('全部課程');
  readonly categories = computed(() => ['全部課程', ...new Set(this.content.courses().map(course => course.category))]);
  readonly visible = computed(() => this.content.courses().filter(course => this.category() === '全部課程' || course.category === this.category()));
  readonly available = computed(() => this.content.courses().filter(course => !course.pending).length);
  readonly first = computed(() => this.content.courses()[0]);

  constructor() {
    document.title = '課程地圖｜Teaching Assistant';
    void this.content.read('Readme.md').then(text => {
      const index = text.indexOf('## 關於這份教材');
      this.introduction.set(index >= 0 ? text.slice(index) : text);
    }).catch(() => this.introduction.set('教材介紹暫時無法載入，請重新整理。'));
  }
}
