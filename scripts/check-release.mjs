/** Dependency-free safeguards for the offline frontend release. */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, relative, join } from 'node:path';

const root = process.cwd();
const failures = [];
const read = file => readFileSync(resolve(root, file), 'utf8');
const check = (condition, reason) => { if (!condition) failures.push(reason); };
const packageJson = JSON.parse(read('package.json'));
// Bun text lockfile allows trailing commas; JSON.parse does not.
function parseBunLock(source) {
  let quoted = false, escaped = false, output = '';
  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    if (quoted) {
      output += c;
      if (escaped) escaped = false;
      else if (c === '\\') escaped = true;
      else if (c === '"') quoted = false;
    } else if (c === '"') { quoted = true; output += c; }
    else if (c === ',' && /^[\s]*[}\]]/.test(source.slice(i + 1))) { /* trailing comma */ }
    else output += c;
  }
  return JSON.parse(output);
}
const lock = parseBunLock(read('bun.lock'));
const dockerfile = read('Dockerfile');
const compose = read('compose.yaml');

check(packageJson.packageManager === 'bun@1.4.4', 'Bun version does not match release baseline');
check(dockerfile.includes('FROM oven/bun:1.4.4 AS builder'), 'Docker builder must use pinned Bun');
check(dockerfile.includes('bun install --frozen-lockfile'), 'Docker builder must install from frozen lock');
check(!/yarn(?:\.lock|\s+(?:install|build))/.test(dockerfile), 'Dockerfile uses unsupported Yarn');
check(!existsSync(resolve(root, 'yarn.lock')), 'Stale yarn.lock should not ship');
check(compose.includes(`image: lifeboard:${packageJson.version}`), 'Docker image tag differs from package version');
const workspace = lock.workspaces?.[''];
check(Boolean(workspace), 'bun.lock missing root workspace');
for (const key of ['dependencies', 'devDependencies']) {
  for (const [name, version] of Object.entries(packageJson[key] ?? {})) {
    check(workspace?.[key]?.[name] === version, `${key}: ${name} disagrees with bun.lock`);
  }
  for (const name of Object.keys(workspace?.[key] ?? {})) {
    check(name in (packageJson[key] ?? {}), `${key}: ${name} only present in bun.lock`);
  }
}
check(read('src/modules/lifeboard/stores/useLifeStore.ts').includes("'lifeboard:state:v1'"), 'Local v1 data key changed');
check(read('src/shared/stores/useAuthStore.ts').includes("'lifeboard:local-profile:v1'"), 'Local profile key changed');

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(item => {
    const entry = join(directory, item.name);
    return item.isDirectory() ? walk(entry) : [entry];
  });
}
const sourceFiles = walk(resolve(root, 'src')).filter(file => /\.(vue|ts|css)$/.test(file));
const imports = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|@import\s*|@config\s*)['"]([^'"]+)['"]/g;
for (const file of sourceFiles) {
  const source = readFileSync(file, 'utf8');
  let match;
  while ((match = imports.exec(source))) {
    const specifier = match[1].split('?')[0];
    if (!specifier.startsWith('@/') && !specifier.startsWith('.')) continue;
    const base = specifier.startsWith('@/') ? resolve(root, 'src', specifier.slice(2)) : resolve(dirname(file), specifier);
    const options = [base, `${base}.ts`, `${base}.js`, `${base}.vue`, `${base}.css`, `${base}.json`, resolve(base, 'index.ts'), resolve(base, 'index.vue')];
    check(options.some(candidate => existsSync(candidate) && statSync(candidate).isFile()), `Missing import ${relative(root, file)}: ${match[1]}`);
  }
}
const readme = read('README.md');
for (const match of readme.matchAll(/(?:src|href)=["']([^"']+)["']|!\[[^\]]*\]\(([^)]+)\)/g)) {
  const asset = match[1] || match[2];
  if (!asset.startsWith('docs/')) continue;
  check(existsSync(resolve(root, asset)), `README asset missing: ${asset}`);
}
check(existsSync(resolve(root, 'public/favicon.svg')), 'Missing favicon');
check(existsSync(resolve(root, 'public/lifeboard-mascot.svg')), 'Missing static mascot');
check(!existsSync(resolve(root, 'src/modules/lifeboard/components/jakk/helperApi.ts')), 'Unused Helper transport unexpectedly shipped');
if (failures.length) {
  console.error(`Release verification failed (${failures.length}):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Release layout OK: v${packageJson.version}, ${sourceFiles.length} source files, local data keys preserved.`);
}
