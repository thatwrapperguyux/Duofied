# iPhone Duo · Fold Preview

A browser-based study of foldable screen transitions, built with Three.js.

[Live demo](https://iphone-duo-tawny.vercel.app/)

## Features

- Only the cover half rotates; the rear-camera half stays fixed.
- Screen content uses a fixed front-view projection during folding. The outer UI stays aligned with its hinge-side left edge.
- Blur and darkening follow the image coordinates, including the image edges. Maximum blur radius is 72 source pixels; darkening uses twice the transition strength, capped at black.
- Wallpaper, Launcher, and Custom modes. Custom keeps one image per screen: Screen 1 for the closed cover and Screen 2 for the open display. A screen left without an image keeps the selected default layout.
- Background colour, gradient, or image, drawn into the canvas so recordings include it.
- Record one full fold cycle and download it as an MP4.
- Drag to orbit, scroll to zoom, or use the play button and slider to fold the device.
- Responsive controls for desktop and mobile. Uploaded images stay in the current browser tab.

## Run locally

The application is static HTML, CSS, and JavaScript. No Node.js build step is required. Three.js is bundled locally.

The Apple reference assets are downloaded separately. Use Python 3.12 to prepare them:

```sh
git clone https://github.com/jadon7/iphone-duo.git
cd iphone-duo
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-assets.txt
python scripts/prepare-assets.py
python -m http.server 8766 --bind 127.0.0.1
```

On Windows, activate the environment with `.venv\Scripts\activate`.

Open [http://127.0.0.1:8766/](http://127.0.0.1:8766/). Serve the directory over HTTP; opening `index.html` as a local file cannot load the model.

The preparation script downloads the original Star White USDZ and UI images from Apple, selects the model's Landscape pose, flattens its references, and rewrites texture paths for the browser. The resulting files stay in the ignored `assets/` directory. Asset URLs were verified on September 10, 2026.

## Screen controls

Choose **Wallpaper** or **Launcher** for the default screen layouts. Choose **Custom** to use your own images.

Custom has one section per screen:

| Section | Screen | Recommended image size |
| --- | --- | --- |
| Screen 1 · Closed | The cover display, seen while the device is folded | 1292 × 1878 |
| Screen 2 · Open | The inner display, seen while the device is open | 2670 × 1878 |

Each section takes its own image, shows a thumbnail once one is set, and clears it with the × button. Adding an image folds the device towards that screen so the result is visible right away. Each image is centred and fitted inside its screen, and a section left empty keeps the layout chosen under Wallpaper or Launcher.

The slider controls the fold from closed to open. The default view is fully open and paused. The outer screen turns off at full opening.

## Background

Choose **Color**, **Gradient**, or **Image** under Background.

| Option | Controls |
| --- | --- |
| Color | Six preset swatches and a colour picker |
| Gradient | Two colour stops and an angle, following the CSS `linear-gradient` convention where 0° points up |
| Image | One image, centred and scaled to cover the page |

The background is drawn into the WebGL canvas and mirrored onto the page behind the control dock, so the two always match and anything recorded carries the background with it.

## Recording

The record button beside the fold slider captures one full cycle — open, closed, open — and downloads the result. Recording starts from fully open and covers 8.6 seconds of animation; the button fills to show progress, and clicking it again stops early and saves what was captured. The other controls stay locked until it finishes. Only the 3D canvas is recorded, never the control dock.

The file is H.264 in an MP4 container wherever the browser can encode it, which covers current Chrome, Edge, and Safari. Browsers without an H.264 encoder fall back through the remaining supported formats to WebM, and the file extension follows whatever was actually recorded.

## Source map

| File | Purpose |
| --- | --- |
| `index.html` | Screen-mode tabs, background controls, and fold controls |
| `main.js` | Three.js scene, fold deformation, projected UI, blur, darkening, background, and recording |
| `ui.js` | Default screen layouts |
| `style.css` | Desktop and mobile layout |
| `scripts/prepare-assets.py` | Download and prepare the reference assets |
| `vercel.json` | Install and prepare assets during Vercel builds |
| `vendor/three/` | Three.js runtime and required add-ons |

## Deploy

The Vercel project is connected to this GitHub repository. Pushes to `main` publish the production site; other branches create preview deployments.

`vercel.json` installs the asset tools and runs `scripts/prepare-assets.py` during each build. Git deployments therefore include the model and screen images without storing those assets in the repository.

For a manual Vercel deployment:

```sh
vercel link
vercel --prod
```

`.vercelignore` keeps local credentials and Git metadata out of deployments while including the prepared assets.

For other static hosts, prepare the assets locally before publishing the project directory.

## License and sources

Original application code is released under the [MIT license](LICENSE). See [third-party notices](THIRD_PARTY_NOTICES.md) for bundled libraries and reference assets.

Apple models and imagery are excluded from the repository and the MIT license. The preparation script links to their original sources; their use is subject to Apple's terms. This project is an independent animation study.

- [Apple iPhone Duo](https://www.apple.com/iphone-duo/)
- [Apple HIG: Designing for iPhone Duo](https://developer.apple.com/design/human-interface-guidelines/designing-for-iphone-duo)
- [Three.js](https://threejs.org/)
