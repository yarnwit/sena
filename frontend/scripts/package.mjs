// Assembles a `release/` folder ready to zip and hand off for deployment.
// Run via `npm run release` (runs `next build` first).
import { cpSync, rmSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const release = join(root, "release");

rmSync(release, { recursive: true, force: true });
mkdirSync(release);

cpSync(join(root, ".next/standalone"), join(release, "standalone"), { recursive: true });
cpSync(join(root, ".next/static"), join(release, "static"), { recursive: true });

if (existsSync(join(root, "public"))) {
  cpSync(join(root, "public"), join(release, "public"), { recursive: true });
}

cpSync(join(root, "deploy/Dockerfile"), join(release, "Dockerfile"));
cpSync(join(root, "deploy/docker-compose.yml"), join(release, "docker-compose.yml"));

console.log(`Release ready at ${release} — zip this folder and send it over.`);
