import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { LEVELS } from '../../src/content/levels';
import { MEDIA, MEDIA_LICENCES } from '../../src/content/media';
import { APPROVED_PACKAGE_LICENCES, SHIPPED_BUILD_PACKAGES, SOURCES } from '../../src/content/sources';

const MEDIA_DIR = 'public/media';
const files = (dir: string): string[] =>
  existsSync(dir) ? readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? files(join(dir, f)) : [join(dir, f)])) : [];

const allSets = [1, 2].flatMap((l) => [...LEVELS[l as 1 | 2].sets, ...LEVELS[l as 1 | 2].pictureSets]);
const imageOptions = allSets.flatMap((s) => s.groups.flatMap((g) => (g.options ?? []).filter((o) => o.image).map((o) => ({ group: g.id, image: o.image! }))));

describe('media register (photos and recordings)', () => {
  it('every file in public/media is registered, and every registered file exists', () => {
    const onDisk = files(MEDIA_DIR).map((f) => relative(MEDIA_DIR, f)).filter((f) => !f.endsWith('.DS_Store')).sort();
    const registered = Object.values(MEDIA).map((m) => m.file).sort();
    expect(onDisk).toEqual(registered);
  });

  it("each file is exactly the one recorded (checksum), so changes can't slip in unnoticed", () => {
    for (const [id, m] of Object.entries(MEDIA)) {
      const hash = createHash('sha256').update(readFileSync(join(MEDIA_DIR, m.file))).digest('hex');
      expect(hash, id).toBe(m.sha256);
    }
  });

  it('every item has a full, approved credit', () => {
    for (const [id, m] of Object.entries(MEDIA)) {
      expect(MEDIA_LICENCES[m.licence], id).toBeTruthy();
      expect(m.file, id).toContain(id);
      expect(m.alt.length, id).toBeGreaterThan(10);
      expect(m.author, id).toBeTruthy();
      expect(m.sourceUrl, id).toMatch(/^https:\/\//);
      expect(m.authorUrl, id).toMatch(/^https:\/\//);
      expect(m.downloaded, id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(m.changes, id).toBeTruthy();
      if (m.licence === 'Unsplash License') expect(m.sourceUrl, id).toMatch(/^https:\/\/unsplash\.com\/photos\/.+-[A-Za-z0-9_-]+$/);
    }
  });

  it('screen-reader descriptions never contain Chinese (they must not give answers away)', () => {
    for (const m of Object.values(MEDIA)) expect(/\p{Script=Han}/u.test(m.alt), m.file).toBe(false);
  });

  it('every picture in a question is registered, and used only once per question group', () => {
    for (const { group, image } of imageOptions) expect(MEDIA[image], `${group}: ${image}`).toBeTruthy();
    const byGroup = Map.groupBy(imageOptions, (o) => o.group);
    for (const [group, opts] of byGroup) expect(new Set(opts.map((o) => o.image)).size, group).toBe(opts.length);
  });

  it('nothing is shipped that no question uses', () => {
    const used = new Set(imageOptions.map((o) => o.image));
    for (const id of Object.keys(MEDIA)) expect(used.has(id), id).toBe(true);
  });
});

describe('licences of code and fonts shipped to users', () => {
  const lock = JSON.parse(readFileSync('package-lock.json', 'utf8')) as { packages: Record<string, { dev?: boolean; license?: string }> };
  const pkg = (name: string) => lock.packages[`node_modules/${name}`];
  const shipped = [
    ...Object.entries(lock.packages)
      .filter(([path, p]) => path && !p.dev && !path.includes('node_modules/', 'node_modules/'.length))
      .map(([path]) => path.replace(/^node_modules\//, '')),
    ...SHIPPED_BUILD_PACKAGES,
  ];

  it('every shipped package has an approved licence', () => {
    for (const name of shipped) expect(APPROVED_PACKAGE_LICENCES, `${name}: ${pkg(name)?.license}`).toContain(pkg(name)?.license);
  });

  it('every shipped package is credited on the Sources & Licences screen', () => {
    const credited = new Set(SOURCES.flatMap((s) => s.packages ?? []));
    for (const name of shipped) expect(credited.has(name), name).toBe(true);
  });
});
