# MBG Adventure

React 19 and React Router Framework Mode with server-side rendering, Tailwind CSS, and Three.js. Requires Node.js 20.19+ (or 22.12+).

```sh
pnpm install
pnpm dev
pnpm build
pnpm start
```

`pnpm start` serves the production build using the React Router Node server. Deploy both `build/client` and `build/server`; this app requires a Node runtime. `PORT` and `HOST` configure the server.

## Structure

- `app/root.jsx`: HTML document, metadata, outlet, and error boundary.
- `app/routes.js`: route configuration; each page is a separate route module.
- `app/pages/`: home, mission, kitchen, packing, delivery, and results.
- `app/components/`: shared shell and Three.js scenes.
- `app/elements/`: reusable UI primitives such as Button.
- `app/lib/`: mission data and browser storage helpers.
- `app/styles/`: global styles.
- `public/`: static assets.

SSR is enabled in `react-router.config.js`. React Router supplies the default server and hydration entries. WebGL runs inside client effects. Personal best and safety are read after hydration because they live in browser storage; initial server HTML uses default values. Results read query parameters through React Router.

Use `pnpm format` to format the application. Add pages to `app/pages/` and register them in `app/routes.js`.
