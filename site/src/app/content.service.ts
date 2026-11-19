import { Injectable, signal } from '@angular/core';

export interface Course {
  id: string;
  number: number;
  title: string;
  source: string;
  category: string;
  pending: boolean;
}

@Injectable({ providedIn: 'root' })
export class ContentService {
  readonly courses = signal<Course[]>([]);
  readonly error = signal('');
  private ready?: Promise<Course[]>;
  private cache = new Map<string, string>();

  load(): Promise<Course[]> {
    return this.ready ??= this.read('courses.json').then(text => {
      const courses = JSON.parse(text) as Course[];
      this.courses.set(courses);
      return courses;
    }).catch(error => {
      this.ready = undefined;
      this.error.set('課程目錄暫時無法載入，請重新整理再試一次。');
      throw error;
    });
  }

  async read(source: string): Promise<string> {
    if (this.cache.has(source)) return this.cache.get(source)!;
    const url = new URL(`content/${source}`, document.baseURI);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Unable to load ${source}: ${response.status}`);
    const text = await response.text();
    this.cache.set(source, text);
    return text;
  }
}
