#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const IGNORED_DIRECTORIES = new Set(['node_modules', '.turbo', 'dist', '.rspeedy', 'coverage']);

export function copyDirectory(source: string, destination: string) {
  fs.mkdirSync(destination, { recursive: true });

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (entry.isDirectory() && IGNORED_DIRECTORIES.has(entry.name)) {
      continue;
    }

    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, destinationPath);
      continue;
    }

    fs.copyFileSync(sourcePath, destinationPath);
  }
}

export function resolveTemplateDir(currentFile = fileURLToPath(import.meta.url)) {
  const distDir = path.dirname(currentFile);
  const publishedTemplateDir = path.resolve(distDir, '../templates/starter');

  if (fs.existsSync(publishedTemplateDir)) {
    return publishedTemplateDir;
  }

  return path.resolve(distDir, '../../..', 'templates/starter');
}

export function scaffoldVueLynxProject(targetDir: string) {
  const templateDir = resolveTemplateDir();

  if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
    console.error(`[create-vue-lynx] Target directory is not empty: ${targetDir}`);
    process.exit(1);
  }

  copyDirectory(templateDir, targetDir);
}

export function main(argv = process.argv.slice(2)) {
  const targetArg = argv[0] ?? 'my-vue-lynx-app';
  const targetDir = path.resolve(process.cwd(), targetArg);
  scaffoldVueLynxProject(targetDir);
  console.log(`[create-vue-lynx] Created starter in ${targetDir}`);
}

const executedAsScript = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (executedAsScript) {
  main();
}
