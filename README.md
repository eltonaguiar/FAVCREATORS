# FAVCREATORS

FavCreators is a React + TypeScript experience built with Vite. It lets you track favorite creators, surface live accounts, export your list, and always keep a polished card grid even on GitHub Pages.

[🌐 Live Demo on GitHub Pages](https://eltonaguiar.github.io/FAVCREATORS/)

## Development

- `npm run dev` — Launch the Vite dev server with hot reload on `localhost:5173`.
- `npm run build` — Compile the app for production (`dist` folder).
- `npm run lint` — Run ESLint over the project.
- `npm run preview` — Spin up the built app locally for verification.

## GitHub Pages

- `npm run predeploy` builds the site and creates `dist/.nojekyll` so GitHub Pages serves the React bundle instead of the README.
- `npm run deploy` runs that build step and then pushes the `dist` folder to the `gh-pages` branch via `gh-pages -d dist`.
- The workflow in `.github/workflows/deploy.yml` automatically runs `npm run deploy` on pushes to `main`/`master` and can be triggered manually via `workflow_dispatch`.
- After the workflow succeeds, go to **Settings → Pages** and set the source to the `gh-pages` branch (root) so GitHub Pages no longer renders the README and serves the React bundle instead.

## Sharing Creator Packs

- Click **Share pack** (next to the Live check control) to encode your current list—pins, notes, live-status metadata, and everything—into a short URL. It copies to your clipboard so you can paste it into chat, docs, or threads.
- Anyone opening a URL with `?pack=…` will see a banner describing the shared pack and can choose to apply it. The query string is cleared afterward so the link stays reusable.

## React + TypeScript + Vite

This repository started from the Vite + React + TypeScript template, so it ships with a minimal ESLint config and Fast Refresh via [`@vitejs/plugin-react`](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react).

- [`@vitejs/plugin-react`](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses Babel (or [oxc](https://oxc.rs) when used in rolldown-vite) for Fast Refresh.
- [`@vitejs/plugin-react-swc`](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses SWC for Fast Refresh.

## React Compiler

The React Compiler is not enabled in this template because of the performance impact on dev/build. To enable it, see the [React Compiler installation guide](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

To get the most out of ESLint, consider enabling the type-aware rules listed below:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
```

You can also add [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for richer React linting.
