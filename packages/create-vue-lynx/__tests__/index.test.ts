import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { resolveTemplateDir, scaffoldVueLynxProject } from '../src/index';

const tempDirs: string[] = [];

afterEach(() => {
  for (const tempDir of tempDirs.splice(0)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

describe('create-vue-lynx', () => {
  it('resolves a template directory', () => {
    expect(fs.existsSync(resolveTemplateDir())).toBe(true);
  });

  it('scaffolds a starter without generated workspace artifacts', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pgg-vue-lynx-'));
    tempDirs.push(tempDir);

    const targetDir = path.join(tempDir, 'starter-app');
    scaffoldVueLynxProject(targetDir);

    expect(fs.existsSync(path.join(targetDir, 'package.json'))).toBe(true);
    expect(fs.existsSync(path.join(targetDir, 'src', 'App.vue'))).toBe(true);
    expect(fs.existsSync(path.join(targetDir, 'node_modules'))).toBe(false);
    expect(fs.existsSync(path.join(targetDir, '.turbo'))).toBe(false);
  });
});
