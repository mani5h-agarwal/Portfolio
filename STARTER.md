# React Project Starter

React 19 · TypeScript · Vite · React Router · Vitest + Testing Library · oxlint · Prettier

## Start a new project (one command)

From this starter folder:

```bash
npm run new -- my-app                 # creates ../my-app, installs deps, makes the first commit
npm run new -- my-app --dir ~/code    # put it somewhere else
```

Then `cd ../my-app && npm run dev`.

**Run it from anywhere:** add this to your `~/.zshrc`, then use `new-react my-app` in any folder:

```bash
new-react() { node /path/to/React-Project-Starter/starter/create.mjs "$@" --dir "$PWD"; }
```

## Update an existing project from the starter (one command)

Inside a project created with `npm run new`:

```bash
npm run starter:update
```

This fetches the latest starter and does a git merge: your code is kept and only the starter's
new changes come in. Changed dependencies are installed and `package-lock.json` conflicts are
fixed for you. If you and the starter edited the same lines, git shows normal conflicts. Fix
them, then run `npm install && git add -A && git commit --no-edit` (or `git merge --abort` to
cancel the update).

## Keep the starter itself up to date (one command)

In this starter folder:

```bash
npm run deps:update   # bump all deps to latest, then typecheck, lint, test and build
git commit -am "Update dependencies"
```

Then run `npm run starter:update` in any project to bring those updates in.

> Tip: push the starter to GitHub (`git remote add origin …`). New projects then pull updates
> from GitHub instead of this local folder, so it works on any machine.

## Commands

| Command            | What it does                                   |
| ------------------ | ---------------------------------------------- |
| `npm run dev`      | Dev server at http://localhost:5173            |
| `npm run build`    | Typecheck + production build into `dist/`      |
| `npm run preview`  | Serve the production build locally             |
| `npm run check`    | Typecheck, lint, format check and tests        |
| `npm test`         | Run tests once (`npm run test:watch` to watch) |
| `npm run lint:fix` | Auto-fix lint issues                           |
| `npm run format`   | Format all files with Prettier                 |

## Structure

```
src/
  app/          routes.tsx (add pages here), router.tsx, app tests
  components/   shared UI (Layout, …)
  pages/        one component per route
  lib/          helpers; env.ts gives typed access to VITE_* env vars
  styles/       global CSS
  test/         test setup + renderRoute() helper
starter/        create.mjs and update.mjs (the starter tooling)
```

- Import from `src` with the `@/` alias: `import { env } from '@/lib/env'`.
- Env vars: copy `.env.example` to `.env.local`. Only `VITE_*` vars reach the browser.

## Getting clean updates

- Put your own code in new files where you can, instead of rewriting starter files. That keeps
  `starter:update` merges conflict-free.
- Your `README.md` is yours. Starter docs live in this file.
