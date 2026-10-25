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

SSR is enabled in `react-router.config.js`. React Router supplies the default server and hydration entries. The orthographic WebGL renderer mounts after hydration, with an error fallback for unsupported browsers. The versioned mission save and personal best are read after hydration. Protected game routes resume the current phase; results and scores come from the completed run, never URL parameters.

Use `pnpm format` to format the application. Add pages to `app/pages/` and register them in `app/routes.js`.

## Game rendering and controls

The kitchen and delivery share an orthographic 2D renderer in `app/components/game/`. Packing uses an accessible HTML tray with animated portions. The supplied `public/models` artwork is registered in `app/configs/images.js` before use. Both DOM illustrations and WebGL sprites read the same URLs and sprite regions. Public URLs start with `/models/`, never `/public/models/`. The van uses silhouette geometry to exclude its white backdrop without modifying the source image. The kitchen chef walks to selected stations and completes timed work. Packing animates each ingredient into the tray. Delivery uses a delta-time simulation with traffic collisions, boost, pause, a one-time detour, and automatic arrival.

- Kitchen: WASD / arrows to walk, select the current station to work; touch buttons also move the chef.
- Menu: spin for a recipe, then choose its required ingredients from the existing food artwork.
- Packing: add the cooked dish first, then milk, fruit, and vegetables in the recipe ticket’s exact order. Incorrect choices leave the tray unchanged and cost points.
- Destination: spin for a country and school before driving the final local delivery route.
- Delivery: hold W / up to accelerate, S / down to brake, A/D or left/right to steer, Space to boost. Touch controls support holding multiple buttons.
- Input resets on blur and tab changes. Hidden tabs suspend rendering; reduced-motion preferences stop the decorative home animation.

Run `npm test` for driving, stage progression, scoring, and save validation regressions.

## Design and image assets

`DESIGN.md` supplies the layout and typography reference; `app/configs/brand.js` defines the current MBG coral identity: white paper surfaces, rounded self-hosted Nunito fonts, flat 2px borders, coral progress/headlines, and blue secondary actions. Primary buttons use the reference's neutral Night Ink treatment. Marketing sections pair one illustration with text; game pages retain their playable stage and accessible controls.

Register original image URLs in `models`, and UI/game-ready descriptors in `images` inside `app/configs/images.js`. Sprite regions use `[x, y, width, height]` pixels from the top-left of the source sheet. `ModelImage` clips them for HTML and `Sprite` maps the same regions onto WebGL geometry. `app/lib/game.js` defines playable recipes, required ingredients, packing order, and destinations. `mealImages` supplies the decorative home tray. Raw chicken is reserved for inspection; packed chicken uses the cooked meal region.

Traffic uses the red car, school bus, and taxi from `public/models/vehicle_sprites_cropped`, registered in `app/configs/images.js`. The player retains the MBG van. Vehicle silhouettes exclude the source backgrounds while retaining the original paint colors.

## Browser saves, audio, and offline play

- The complete mission is saved under `mbg-adventure-v1` in localStorage after each action. Delivery checkpoints save every second, on pause, and when leaving the page. A reloaded delivery starts paused. A cooking station in progress restarts that station; completed stations remain saved.
- Best score and day count survive completed missions. Unsupported or damaged saves recover to a new mission. If browser storage is blocked/full, play continues in memory with a visible status; clearing site data removes local progress.
- Sound uses Web Audio synthesis, with chopping/sizzling, packing, roulette, driving, boost/collision, and success cues. A user interaction enables audio; the sound toggle is saved. No audio downloads or external services are required.
- `npm run build` generates `build/client/sw.js` with a content-versioned list of all built routes, chunks, fonts, and artwork. Serve the production build over HTTPS (localhost also works). Open it online once and wait for **Ready to play offline** before disconnecting. Development mode does not register a worker.
- The service worker installs only after the complete resource download succeeds. It serves the matching cached build offline, including direct route reloads and previously unvisited scenes. Updates wait until existing tabs close to avoid changing a game mid-run. Offline caching follows the [service worker installation lifecycle](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers).
- Browsers may evict site storage. Offline readiness requires the initial download and retained browser data; opening a never-visited site without a connection is unsupported.
- Successful delivery shows animated children in school uniforms and confetti. Reduced-motion mode removes these looping animations.
