# Duofied · Fold Studio

A browser-based study of foldable screen transitions, built with Three.js.

[Live demo](https://iphone-duo-tawny.vercel.app/)

## Features

- A floating studio interface: inspector, top bar and timeline hover over a full-bleed artboard.
- Each screen takes an image **or a video**, placed with its own width, height and offset.
- Model settings: position and rotation on every axis, field of view, size, screen brightness and fold.
- Environment presets with their own rotation, and an artboard that can be a colour, gradient, image, or nothing at all.
- A keyframe timeline with per-keyframe easing — ease in/out, linear, overshoot, hold — driving every model value.
- Export the artboard as a PNG still or as a video of the timeline, on a transparent background if you want one.
- Only the cover half rotates; the rear-camera half stays fixed.
- Screen content uses a fixed front-view projection during folding. The outer UI stays aligned with its hinge-side left edge.
- Blur and darkening follow the image coordinates, including the image edges. Maximum blur radius is 72 source pixels; darkening uses twice the transition strength, capped at black.
- Drag to orbit, scroll to zoom. Uploaded media stays in the current browser tab.

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

## Interface

The window is a workspace with three floating shells over it: the top bar carries the project
name, the artboard shape and colour, and Export; the inspector sits on the left; the timeline
runs along the bottom. The artboard is centred between them and is the only thing exported.

Type is [Inter](https://fonts.google.com/specimen/Inter), loaded from Google Fonts, over a
system sans fallback. Drop the stylesheet link in `index.html` if the deployment must stay
self-contained.

## Screens

**Wallpaper** and **Launcher** are the built-in layouts. **Media** gives each screen its own
section — *First screen* is the cover seen while the device is closed, *Second screen* is the
inner display. Drop a file on a section or use its button; a screen left empty keeps the
layout chosen under Wallpaper or Launcher.

| Accepts | |
| --- | --- |
| Images | PNG, JPG, WebP |
| Video | MP4, WebM, Ogg — looped and muted, and recorded live into exports |

Each loaded screen gets four placement fields, in percent, with a slider and a typed value:

| Field | Effect |
| --- | --- |
| W | Width. 100% fits the media to the screen; above crops, below insets |
| H | Height, scaled independently of W, so media can be stretched |
| X | Shifts it across the screen, as a share of the screen width |
| Y | Shifts it up or down, as a share of the screen height |

## Model settings

Position and rotation each take X, Y and Z. Position is in tenths of a scene unit, so the
values stay small; rotation is in degrees and turns the device itself, which is independent of
dragging the artboard to orbit the camera.

**Field of view** changes the lens from 10° to 80° and dollies the camera to keep the device
framed, so perspective changes without the subject resizing. **Model size** scales it from 20%
to 300%, **Screen brightness** dims or lifts both displays, and **Fold** runs from closed to
open. Every one of these can be keyframed.

## Environment

Four lighting presets, each with its own ambient intensity, key and rim strength and exposure.
The X/Y/Z fields rotate the environment map, which moves the reflections across the device.

## Artboard

| Option | Controls |
| --- | --- |
| Color | Six preset swatches and a colour picker, mirrored by the top bar swatch |
| Gradient | Two colour stops and an angle, following the CSS `linear-gradient` convention |
| Image | One image, centred and scaled to cover the artboard |
| None | No background; the canvas keeps its alpha and the artboard shows a checkerboard |

The shape dropdown in the top bar sets the artboard to fit the window, or to 1:1, 16:9, 9:16
or 4:3. The note under the artboard controls reports the pixel size exports come out at.

## Timeline

The timeline holds keyframes of every model value. Three are there to begin with — open,
closed, open — over four seconds.

- Click the track to scrub; drag a keyframe to retime it.
- **Add keyframe** captures the current model settings at the playhead. On a keyframe the same
  button removes it instead.
- Adjusting any model control while the playhead sits on a keyframe updates that keyframe.
- The curve button sets the selected keyframe's easing: ease in out, linear, ease in, ease out,
  overshoot or hold. Easing governs the segment that leaves that keyframe.
- The seconds field sets the length, from 1 to 30 seconds.

## Export

**PNG image** saves the artboard as a still at its reported pixel size. **Video** plays the
timeline once from the start and records it, so the file is exactly as long as the timeline.
The file is named after the project.

The video is H.264 in an MP4 container wherever the browser can encode it, which covers
current Chrome, Edge and Safari; browsers without an H.264 encoder fall back to WebM.

MP4 has no alpha channel, so with the artboard set to **None** — or the menu's **Transparent
background** ticked — the recorder writes WebM, which does carry alpha, and the menu says so.
PNG keeps the alpha channel in every browser.

## Source map

| File | Purpose |
| --- | --- |
| `index.html` | Floating shells: top bar, inspector and timeline |
| `main.js` | Three.js scene, fold deformation, projected UI, media, timeline and export |
| `ui.js` | Default screen layouts |
| `style.css` | Design tokens, floating shells, controls and responsive layout |
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
