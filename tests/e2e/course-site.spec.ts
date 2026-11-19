import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { Marked } from 'marked';
import type { Course } from '../../site/src/app/content.service';

const courses = JSON.parse(await readFile('site/public/content/courses.json', 'utf8')) as Course[];
const markdown = new Marked();

function getCodes(tokens: any[]): string[] {
  return tokens.flatMap(token => {
    if (token.type === 'code') return [token.text];
    if (token.type === 'blockquote' && /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/.test(token.text)) {
      return getCodes(markdown.lexer(token.text.replace(/^\[![A-Z]+\]\s*\n?/, '')));
    }
    if (token.tokens) return getCodes(token.tokens);
    if (token.items) return token.items.flatMap((item: any) => getCodes(item.tokens));
    return [];
  });
}

test('home, filters, course navigation, refresh, images and Mermaid work at the repository base path', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('./');
  await expect(page.locator('.course-card')).toHaveCount(courses.length);
  await page.screenshot({ path: 'test-results/home-desktop.png', fullPage: false });
  await page.getByRole('button', { name: '前端開發', exact: true }).click();
  await expect(page.locator('.course-card')).toHaveCount(courses.filter(c => c.category === '前端開發').length);
  await page.getByRole('button', { name: '全部課程', exact: true }).click();
  await page.locator('.primary-button').click();
  await expect(page.locator('.lesson-header h1')).toHaveText(courses[0].title);
  await expect(page.locator('.diagram svg')).toHaveCount(1, { timeout: 30_000 });
  await expect(page.locator('.diagram svg')).toContainText('安裝 Git');
  await page.reload();
  await expect(page.locator('.lesson-header h1')).toHaveText(courses[0].title);
  await page.locator('.lesson-pagination .next-lesson').click();
  await expect(page.locator('.lesson-header h1')).toHaveText(courses[1].title);
  const docker = courses.find(c => c.source.endsWith('/docker.md'))!;
  await page.goto(`./#/lesson/${docker.id}`);
  await expect(page.locator('.lesson-header h1')).toHaveText(docker.title);
  await expect(page.locator('.diagram svg')).toHaveCount(1);
  expect(await page.locator('.diagram').evaluate(node => node.scrollWidth > node.clientWidth)).toBeTruthy();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.locator('.markdown-body img').evaluateAll(async images => {
    await Promise.all(images.map(image => new Promise<void>((resolve, reject) => {
      const img = image as HTMLImageElement;
      img.loading = 'eager';
      if (img.complete) { img.naturalWidth ? resolve() : reject(new Error(`Broken image ${img.src}`)); return; }
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Broken image ${img.src}`));
    })));
  });
  await page.screenshot({ path: 'test-results/lesson-desktop.png', fullPage: false });
  expect(errors).toEqual([]);
});

test('every code button copies the original code, all lessons render and all GitHub alert types are styled', async ({ page, context }) => {
  test.setTimeout(180_000);
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.addInitScript(() => {
    const write = navigator.clipboard.writeText.bind(navigator.clipboard);
    Object.defineProperty(navigator.clipboard, 'writeText', { value: async (text: string) => {
      (window as any).lastCopied = text;
      await write(text);
    } });
  });
  const seenAlerts = new Set<string>();
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const course of courses) {
    await page.goto(`./#/lesson/${course.id}`);
    await expect(page.locator('.lesson-header h1')).toHaveText(course.title);
    const text = await readFile(`site/public/content/${course.source}`, 'utf8');
    const codes = getCodes(markdown.lexer(text));
    const buttons = page.locator('button[data-copy]');
    await expect(buttons).toHaveCount(codes.length);
    // Test the full corpus, including Python indentation, HTML entities and PowerShell backticks.
    for (let index = 0; index < codes.length; index++) {
      await buttons.nth(index).click();
      await expect(buttons.nth(index)).toHaveText('已複製');
      expect(await page.evaluate(() => (window as any).lastCopied)).toBe(codes[index]);
      // Windows converts LF to CRLF in its native clipboard; compare canonical newlines.
      expect((await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, '\n')).toBe(codes[index]);
    }
    for (const className of await page.locator('.markdown-alert').evaluateAll(nodes => nodes.map(n => n.className))) seenAlerts.add(className);
    await expect(page.locator('.markdown-body')).not.toContainText('[!TIP]');
    const diagrams = page.locator('.diagram');
    for (let i = 0; i < await diagrams.count(); i++) {
      const svg = diagrams.nth(i).locator('svg');
      await expect(svg).toHaveCount(1, { timeout: 30_000 });
      expect(await svg.locator('text').count()).toBeGreaterThan(0);
      expect((await svg.locator('text').allTextContents()).join('').trim().length).toBeGreaterThan(0);
    }
    await page.locator('.markdown-body a').first().click();
    await expect(page.locator('.hero h1')).toBeVisible();
  }
  for (const type of ['note', 'tip', 'important', 'warning', 'caution']) expect([...seenAlerts].some(name => name.includes(`alert-${type}`))).toBeTruthy();
  await page.goto('./');
  const readme = await readFile('site/public/content/Readme.md', 'utf8');
  const intro = readme.slice(readme.indexOf('## 關於這份教材'));
  const homeCodes = getCodes(markdown.lexer(intro));
  await expect(page.locator('.author-section button[data-copy]')).toHaveCount(homeCodes.length);
  for (let index = 0; index < homeCodes.length; index++) {
    await page.locator('.author-section button[data-copy]').nth(index).click();
    expect(await page.evaluate(() => (window as any).lastCopied)).toBe(homeCodes[index]);
    expect((await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, '\n')).toBe(homeCodes[index]);
  }
  expect(errors).toEqual([]);
});

test('mobile menu, empty search, pending page and unknown course have usable states', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  await expect(page.locator('.course-card')).toHaveCount(courses.length);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.screenshot({ path: 'test-results/home-mobile.png', fullPage: false });
  await page.getByRole('button', { name: '課程目錄 ☰' }).click();
  const search = page.getByRole('searchbox', { name: '搜尋課程' });
  await search.fill('no-such-topic');
  await expect(page.locator('.nav-empty')).toHaveText('找不到符合的課程');
  await search.fill('Angular');
  await page.locator('.course-link').click();
  await expect(page.locator('.alert-note')).toContainText('教材待補充');
  await expect(page.locator('.sidebar')).not.toHaveClass(/open/);
  await page.goto('./#/lesson/not-a-course');
  await expect(page.getByRole('alert')).toContainText('課程不存在');
});

test('Markdown sanitization, nested alerts, links, tables, fences and clipboard failure stay safe', async ({ page }) => {
  const first = courses[0];
  const fixture = '# Test\n\n## Same\n\n## Same\n\n> [!TIP]\n> **建立檔案**\n>\n> ```html\n> <script>alert("example")</script>\n> ```\n\n| A | B |\n|---|---|\n| 1 | 2 |\n\n[unsafe](javascript:alert%281%29)\n\n<img src=x onerror="window.hacked=true">\n<script>window.hacked=true</script>\n';
  await page.route(`**/content/${first.source}`, route => route.fulfill({ body: fixture, contentType: 'text/markdown' }));
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('denied')) } }));
  await page.goto(`./#/lesson/${first.id}`);
  await expect(page.locator('.alert-tip code')).toHaveText('<script>alert("example")</script>');
  await expect(page.locator('.markdown-body table')).toHaveCount(1);
  await expect(page.locator('#same')).toHaveCount(1);
  await expect(page.locator('#same-1')).toHaveCount(1);
  await expect(page.locator('.markdown-body script')).toHaveCount(0);
  expect(await page.locator('.markdown-body img').getAttribute('onerror')).toBeNull();
  expect(await page.evaluate(() => (window as any).hacked)).toBeUndefined();
  await page.locator('button[data-copy]').click();
  await expect(page.locator('button[data-copy]')).toHaveText('請選取程式碼複製');
});
