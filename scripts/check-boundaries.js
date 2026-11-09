#!/usr/bin/env node
/**
 * Enforces the Onion / Clean Architecture dependency rule for one
 * mock service in this repo.
 *
 * Usage (from the repo root):
 *   node scripts/check-boundaries.js service-<name> [service-<name> ...]
 * Usage (from inside a service directory):
 *   node ../scripts/check-boundaries.js .
 * Exit 0 = no violation, exit 1 = violation(s) listed.
 *
 * This is the single-service adaptation of the rusuh-core script
 * (rusuh-core/scripts/check-boundaries.js). Differences from the
 * monorepo original: services live directly under the repo root
 * (service-<name>/src) instead of apps/<name>/src, and there are no
 * @rusuh/* workspace packages, so the allowed-import sets below
 * have no workspace-package entries.
 *
 * Layers (src/ of one service) and what each may import:
 *   domain/         — pure business logic. ONLY: node built-ins,
 *                     other domain/ files.
 *   application/    — use cases. ONLY: domain/, node built-ins,
 *                     npm packages.
 *   infrastructure/ — adapters. ONLY: domain/, application/ (ports),
 *                     node built-ins, npm packages. NEVER presentation/.
 *   presentation/   — HTTP. ONLY: application/, domain/ (DTOs),
 *                     node built-ins, npm packages. NEVER infrastructure/.
 *   platform/       — cross-cutting shims. ONLY: node built-ins.
 *   src/*.js (app.js, server.js, container.js) — composition root /
 *                     entry points: exempt, they wire everything.
 *                     The container lives here, NOT in
 *                     infrastructure/, because it imports from every
 *                     layer to wire them together.
 *
 * Test files (*.test.js, __tests__/) are exempt — a test may import the
 * whole app to verify the wiring.
 *
 * The `@/` alias resolves to src/. Relative requires are resolved against
 * the requiring file. Anything that is not a relative path, `@/`, or a
 * node built-in is an npm package.
 */
const fs = require('fs');
const path = require('path');
const { builtinModules } = require('module');

const NODE_BUILTINS = new Set(builtinModules);

const LAYERS = ['domain', 'application', 'infrastructure', 'presentation', 'platform'];

// What a file in `layer` may import (by the imported file's top-level
// folder, or by package name). Each layer may always import itself.
const ALLOWED = {
  domain: new Set(['domain']),
  application: new Set(['application', 'domain', 'npm']),
  infrastructure: new Set(['infrastructure', 'domain', 'application', 'npm']),
  presentation: new Set(['presentation', 'application', 'domain', 'npm']),
  platform: new Set(['platform'])
};

function topLayer(srcDir, absPath) {
  const rel = path.relative(srcDir, absPath);
  if (rel.startsWith('..') || path.isAbsolute(rel)) return null; // outside src
  const first = rel.split(path.sep)[0];
  return LAYERS.includes(first) ? first : 'root';
}

function classifyImport(srcDir, fromFile, spec) {
  // Returns { kind, target } where kind is 'layer' | 'package' | 'builtin'
  // and target is the layer name or package name.
  if (NODE_BUILTINS.has(spec) || spec.startsWith('node:')) {
    return { kind: 'builtin', target: spec };
  }
  if (spec.startsWith('@/')) {
    const abs = path.join(srcDir, spec.slice(2));
    return { kind: 'layer', target: topLayer(srcDir, abs) || 'root' };
  }
  if (spec.startsWith('./') || spec.startsWith('../')) {
    const abs = path.resolve(path.dirname(fromFile), spec);
    return { kind: 'layer', target: topLayer(srcDir, abs) || 'root' };
  }
  // Anything else is an npm package.
  return { kind: 'package', target: 'npm' };
}

function collectJsFiles(dir, out) {
  const acc = out || [];
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'coverage') {
        collectJsFiles(full, acc);
      }
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      acc.push(full);
    }
  });
  return acc;
}

const REQUIRE_RE = /require\(\s*['"]([^'"]+)['"]\s*\)/g;

function checkService(serviceDir) {
  const srcDir = path.join(serviceDir, 'src');
  if (!fs.existsSync(srcDir)) {
    console.error(`skip: no src/ in ${serviceDir}`);
    return [];
  }
  const violations = [];
  collectJsFiles(srcDir).forEach((file) => {
    const relFile = path.relative(serviceDir, file);
    if (relFile.includes('__tests__') || file.endsWith('.test.js')) return; // tests exempt
    const layer = topLayer(srcDir, file);
    if (layer === 'root' || !layer) return; // app.js / server.js / container.js: composition root
    const content = fs.readFileSync(file, 'utf8');
    let m = REQUIRE_RE.exec(content);
    while (m !== null) {
      const spec = m[1];
      const { kind, target } = classifyImport(srcDir, file, spec);
      if (kind !== 'builtin' && !ALLOWED[layer].has(target)) {
        violations.push(`${relFile} [${layer}] -> ${spec} (${target})`);
      }
      m = REQUIRE_RE.exec(content);
    }
  });
  return violations;
}

function main() {
  const services = process.argv.slice(2);
  if (services.length === 0) {
    console.error('usage: node scripts/check-boundaries.js service-<name> [...]');
    process.exit(2);
  }
  let all = [];
  services.forEach((service) => {
    const v = checkService(service);
    if (v.length > 0) {
      console.log(`\n${service}: ${v.length} boundary violation(s)`);
      v.forEach((line) => console.log(`  ${line}`));
    } else {
      console.log(`${service}: OK (no boundary violation)`);
    }
    all = all.concat(v);
  });
  if (all.length > 0) {
    console.error(`\n${all.length} boundary violation(s) total.`);
    process.exit(1);
  }
}

main();
