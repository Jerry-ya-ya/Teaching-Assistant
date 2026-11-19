import { readFile, writeFile, mkdir, copyFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const contentDir = path.join(root, 'site/public/content');

export function parseCourses(readme) {
  // Only the ordered list in the course map is a source of course metadata.
  const map = readme.split(/^```mermaid/m)[0];
  const groups = {
    version_control: '版本控制', containerization: '容器與部署',
    backend: '後端開發', frontend: '前端開發', launch: '容器與部署', system_design: '系統設計',
  };
  const courses = [...map.matchAll(/^(\d+)\.\s+\[([^\]]+)\]\(([^)]+\.md)\)([^\r\n]*)/gm)]
    .map(([, number, title, href, suffix]) => {
      const source = path.posix.normalize(href.replace(/^\//, ''));
      if (source.startsWith('../') || source.includes(':')) throw new Error(`Invalid course path: ${href}`);
      return {
        id: source.replace(/\.md$/i, '').replaceAll('/', '-'),
        number: Number(number), title, source,
        category: groups[source.split('/')[0]] ?? '其他課程',
        pending: suffix.includes('待補充'),
      };
    });
  if (!courses.length) throw new Error('README course map is empty.');
  if (new Set(courses.map(c => c.id)).size !== courses.length) throw new Error('Duplicate course IDs.');
  courses.forEach((course, index) => {
    if (course.number !== index + 1) throw new Error('Course numbers must be consecutive.');
  });
  return courses;
}

async function copy(source, destination) {
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(source, destination);
}

async function copyDirectory(source, destination) {
  for (const entry of await readdir(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isDirectory()) await copyDirectory(from, to);
    else await copy(from, to);
  }
}

export async function prepareContent() {
  const readme = await readFile(path.join(root, 'Readme.md'), 'utf8');
  const courses = parseCourses(readme);
  await mkdir(contentDir, { recursive: true });
  for (const course of courses) {
    // Missing pages fail the build instead of shipping broken navigation.
    await copy(path.join(root, course.source), path.join(contentDir, course.source));
  }
  await copy(path.join(root, 'Readme.md'), path.join(contentDir, 'Readme.md'));
  await copyDirectory(path.join(root, 'img'), path.join(contentDir, 'img'));
  await writeFile(path.join(contentDir, 'courses.json'), JSON.stringify(courses, null, 2) + '\n');
  console.log(`Prepared ${courses.length} courses and shared images from the README course map.`);
  return courses;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await prepareContent();
