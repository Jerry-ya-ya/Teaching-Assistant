import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { root, contentDir, parseCourses, prepareContent } from '../scripts/prepare-content.mjs';

test('README courses publish their original Markdown and all local assets', async () => {
  const courses = await prepareContent();
  assert.ok(courses.length > 0);
  for (const course of courses) {
    const original = await readFile(path.join(root, course.source), 'utf8');
    assert.equal(await readFile(path.join(contentDir, course.source), 'utf8'), original);
    const prose = original.replace(/^```[^\n]*\n[\s\S]*?^```/gm, '');
    for (const [, target] of prose.matchAll(/!?\[[^\]\n]*\]\(([^)\n]+)\)/g)) {
      if (/^(https?:|mailto:|#)/.test(target)) continue;
      const source = new URL(target, new URL(course.source, 'https://content.local/'));
      await access(path.join(contentDir, decodeURIComponent(source.pathname)));
    }
  }
  assert.deepEqual(JSON.parse(await readFile(path.join(contentDir, 'courses.json'), 'utf8')), courses);
});

test('new courses are picked up from README without editing application code', () => {
  const source = '1. [First](/backend/first.md)\n2. [New topic](/frontend/new.md)（待補充）\n```mermaid\n';
  const courses = parseCourses(source);
  assert.equal(courses[1].id, 'frontend-new');
  assert.equal(courses[1].category, '前端開發');
  assert.equal(courses[1].pending, true);
  assert.throws(() => parseCourses('1. [Unsafe](/../secret.md)'), /Invalid/);
  assert.throws(() => parseCourses('2. [Out of order](/topic.md)'), /consecutive/);
});
