#!/usr/bin/env node
// Create a new project from this starter.
//
//   npm run new -- my-app                  -> creates ../my-app next to the starter
//   npm run new -- my-app --dir ~/code     -> creates ~/code/my-app
//   npm run new -- my-app --no-install     -> skip npm install
//
// The new project is a git clone of the starter (remote name "starter"), so
// later starter improvements can be pulled in with `npm run starter:update`.

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const starterRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const args = process.argv.slice(2)
const flag = (name) => args.includes(name)
const option = (name) => {
  const i = args.indexOf(name)
  return i === -1 ? undefined : args[i + 1]
}
const name = args.find((a, i) => !a.startsWith('--') && !['--dir', '--from'].includes(args[i - 1]))

if (!name || flag('--help') || flag('-h')) {
  console.log(
    `Usage: npm run new -- <project-name> [--dir <parent-dir>] [--from <git-url>] [--no-install]`,
  )
  process.exit(name ? 0 : 1)
}
if (!/^[a-z0-9][a-z0-9._-]*$/.test(name)) {
  fail(`"${name}" is not a valid name. Use lowercase letters, numbers, ".", "_" or "-".`)
}

const git = (cwd, ...a) => execFileSync('git', a, { cwd, encoding: 'utf8' }).trim()
const tryGit = (cwd, ...a) => {
  try {
    return git(cwd, ...a)
  } catch {
    return ''
  }
}

// Where to clone from: --from, else the starter's own "origin" (e.g. GitHub), else the local folder.
if (!existsSync(path.join(starterRoot, '.git'))) {
  fail(
    `The starter at ${starterRoot} is not a git repo. Run "git init && git add -A && git commit -m init" there first.`,
  )
}
if (tryGit(starterRoot, 'status', '--porcelain')) {
  console.warn(
    '⚠ The starter has uncommitted changes — they will NOT be in the new project. Commit them first.\n',
  )
}
const source = option('--from') || tryGit(starterRoot, 'remote', 'get-url', 'origin') || starterRoot
const branch = tryGit(starterRoot, 'rev-parse', '--abbrev-ref', 'HEAD') || 'main'

const parentDir = path.resolve(expandHome(option('--dir') ?? path.dirname(starterRoot)))
const target = path.join(parentDir, name)
if (existsSync(target)) fail(`${target} already exists.`)

console.log(`→ Creating ${target}\n  from ${source} (${branch})\n`)
execFileSync('git', ['clone', '--origin', 'starter', '--branch', branch, source, target], {
  stdio: 'inherit',
})

// Personalise the project.
editFile('package.json', (s) => s.replace(/"name":\s*"[^"]*"/, `"name": "${name}"`))
editFile('index.html', (s) => s.replace(/<title>.*<\/title>/, `<title>${name}</title>`))
writeFileSync(
  path.join(target, 'README.md'),
  `# ${name}

Created from React Project Starter. See [STARTER.md](./STARTER.md) for all commands.

\`\`\`bash
npm run dev       # start dev server
npm run check     # typecheck + lint + format + tests
npm run build     # production build
npm run starter:update   # pull in the latest starter changes
\`\`\`
`,
)
writeFileSync(
  path.join(target, '.starterrc.json'),
  JSON.stringify({ repo: source, branch }, null, 2) + '\n',
)

git(target, 'add', '-A')
git(target, 'commit', '-q', '-m', `Initialize ${name} from starter`)
console.log(`\n✔ Committed initial project setup`)

if (!flag('--no-install')) {
  console.log('→ Installing dependencies…')
  execFileSync('npm', ['install'], { cwd: target, stdio: 'inherit' })
}

console.log(`
✔ Done! Next steps:

  cd ${path.relative(process.cwd(), target) || '.'}
  npm run dev

To publish it: create an empty repo on GitHub, then
  git remote add origin <your-repo-url> && git push -u origin ${branch}
`)

function editFile(file, fn) {
  const p = path.join(target, file)
  writeFileSync(p, fn(readFileSync(p, 'utf8')))
}
function expandHome(p) {
  return p.startsWith('~') ? path.join(homedir(), p.slice(1)) : p
}
function fail(msg) {
  console.error(`✖ ${msg}`)
  process.exit(1)
}
