# MBG Adventure

React 19 and React Router Framework Mode with server-side rendering, Tailwind CSS, and React Three Fiber / Three.js. Requires Node.js 20.19+ (or 22.12+).

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

SSR is enabled in `react-router.config.js`. React Router supplies the default server and hydration entries. The orthographic WebGL renderer mounts after hydration, with an error fallback for unsupported browsers. Personal best and safety are read after hydration because they live in browser storage; initial server HTML uses default values. Results read query parameters through React Router.

Use `pnpm format` to format the application. Add pages to `app/pages/` and register them in `app/routes.js`.

## Game rendering and controls

All playable scenes share an orthographic 2D renderer in `app/components/game/`. The supplied `public/models` artwork is registered in `app/configs/images.js` before use. Both DOM illustrations and WebGL sprites read the same URLs and sprite regions. Public URLs start with `/models/`, never `/public/models/`. The van uses silhouette geometry to exclude its white backdrop without modifying the source image. The kitchen chef walks to selected stations and completes timed work. Packing animates each ingredient into the tray. Delivery uses a delta-time simulation with traffic collisions, boost, pause, a one-time detour, and automatic arrival.

- Kitchen: WASD / arrows to walk, select the current station to work; touch buttons also move the chef.
- Packing: select ingredients using the tray or labeled buttons.
- Delivery: hold W / up to accelerate, S / down to brake, A/D or left/right to steer, Space to boost. Touch controls support holding multiple buttons.
- Input resets on blur and tab changes. Hidden tabs suspend rendering; reduced-motion preferences stop the decorative home animation.

Run `node --test app/lib/driving.test.js` for simulation regressions.

## Design and image assets

`DESIGN.md` supplies the layout and typography reference; `app/configs/brand.js` defines the current MBG coral identity: white paper surfaces, rounded self-hosted Nunito fonts, flat 2px borders, coral progress/headlines, and blue secondary actions. Primary buttons use the reference's neutral Night Ink treatment. Marketing sections pair one illustration with text; game pages retain their playable stage and accessible controls.

Register original image URLs in `models`, and UI/game-ready descriptors in `images` inside `app/configs/images.js`. Sprite regions use `[x, y, width, height]` pixels from the top-left of the source sheet. `ModelImage` clips them for HTML and `Sprite` maps the same regions onto WebGL geometry. `mealImages` keeps packing labels and artwork consistent. Raw chicken is reserved for inspection; packed chicken uses the cooked meal region.

Traffic uses the red car, school bus, and taxi from `public/models/vehicle_sprites_cropped`, registered in `app/configs/images.js`. The player retains the MBG van. Vehicle silhouettes exclude the source backgrounds while retaining the original paint colors.
