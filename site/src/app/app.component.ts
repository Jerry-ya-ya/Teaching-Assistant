import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ContentService } from './content.service';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent {
  readonly content = inject(ContentService);
  readonly menuOpen = signal(false);
  readonly query = signal('');
  readonly filtered = computed(() => {
    const query = this.query().trim().toLowerCase();
    return this.content.courses().filter(course => `${course.number} ${course.title} ${course.category}`.toLowerCase().includes(query));
  });

  @HostListener('document:keydown', ['$event'])
  searchShortcut(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    if (event.key !== '/' || target.closest('input, textarea, [contenteditable="true"]')) return;
    event.preventDefault();
    this.menuOpen.set(true);
    document.getElementById('course-search')?.focus();
  }

  skipToContent(event: Event) {
    event.preventDefault();
    document.getElementById('main-content')?.focus();
  }

  constructor() {
    void this.content.load().catch(() => undefined);
    inject(Router).events.pipe(takeUntilDestroyed()).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.menuOpen.set(false);
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    });
  }
}
