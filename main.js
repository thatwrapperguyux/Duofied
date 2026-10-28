import * as THREE from 'three';
import { USDLoader } from 'three/addons/loaders/USDLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { loadDefaultUIs } from './ui.js';
import { createFallbackDevice } from './fallback-device.js';

const viewport = document.querySelector('#viewport');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, 1, .1, 500);
camera.position.set(0, 0, 40);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0xf6f6f3, 0);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;
viewport.appendChild(renderer.domElement);
const environment = new RoomEnvironment();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(environment, .04).texture;
environment.dispose();
pmrem.dispose();
const hemisphere = new THREE.HemisphereLight(0xffffff, 0xb5baa8, 1.8);
scene.add(hemisphere);
const key = new THREE.DirectionalLight(0xfffcf5, 2.6);
key.position.set(-15, 25, 30);
scene.add(key);
const rim = new THREE.DirectionalLight(0xe8edf5, 2);
rim.position.set(15, 5, -15);
scene.add(rim);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 6;
controls.maxDistance = 400;
controls.target.set(0, 0, .275454);
controls.update();
const phone = new THREE.Group();
scene.add(phone);
const bend = { value: 0 };
let ready = false;
const screens = {};
const uiReferenceEye = new THREE.Vector3(0, 0, 40);
const innerUIFrame = new THREE.Vector4(-7.89935, .34562 - 5.8974, 15.7987, 11.1035);
const outerUIFrame = new THREE.Vector4(.23396, .27173 - 5.8974, 7.73936, 11.2513)
  .multiplyScalar((uiReferenceEye.z - .24948) / (uiReferenceEye.z - .825538));
const defaultUIs = await loadDefaultUIs();
let uiTheme = 'wallpaper';
let defaultTheme = 'wallpaper';

const toast = document.querySelector('#toast');
let toastTimer = 0;
function say(message) {
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 2600);
}
function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

// Screen canvases: one per display, drawn to by whichever media that screen holds.
const SCREEN_SIZES = { inner: [1600, 1125], outer: [774, 1125] };
const screenCanvases = {};
const screenTextures = {};
for (const [kind, size] of Object.entries(SCREEN_SIZES)) {
  const canvas = document.createElement('canvas');
  [canvas.width, canvas.height] = size;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  screenCanvases[kind] = canvas;
  screenTextures[kind] = texture;
}
for (const kind of ['inner', 'outer']) {
  const defaultTextures = {};
  for (const [theme, canvases] of Object.entries(defaultUIs)) {
    const texture = new THREE.CanvasTexture(canvases[kind]);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    defaultTextures[theme] = texture;
  }
  const material = new THREE.MeshBasicMaterial({ map: defaultTextures[uiTheme], toneMapped: false });
  screens[kind] = {
    material, defaultTextures,
    frame: { value: (kind === 'inner' ? innerUIFrame : outerUIFrame).clone() },
    gradient: { value: new THREE.Vector2(kind === 'inner' ? .5 : 0, kind === 'inner' ? 0 : 1) },
    pixel: { value: new THREE.Vector2(1 / defaultUIs[uiTheme][kind].width, 1 / defaultUIs[uiTheme][kind].height) },
  };
}

// Media: each screen holds an image or a video, placed by its own transform.
const TRANSFORM_DEFAULTS = { width: 100, height: 100, x: 0, y: 0 };
const TRANSFORM_FIELDS = [
  { name: 'width', short: 'W', min: 10, max: 300 },
  { name: 'height', short: 'H', min: 10, max: 300 },
  { name: 'x', short: 'X', min: -100, max: 100 },
  { name: 'y', short: 'Y', min: -100, max: 100 },
];
const media = { inner: null, outer: null };
const transforms = {
  inner: { ...TRANSFORM_DEFAULTS },
  outer: { ...TRANSFORM_DEFAULTS },
  backdrop: { ...TRANSFORM_DEFAULTS },
};
function redraw(target) {
  if (target === 'backdrop') drawBackground();
  else drawScreen(target);
}

function mediaSize(entry) {
  return entry.kind === 'video'
    ? { width: entry.element.videoWidth, height: entry.element.videoHeight }
    : { width: entry.element.naturalWidth, height: entry.element.naturalHeight };
}
function drawScreen(kind) {
  const canvas = screenCanvases[kind];
  const context = canvas.getContext('2d');
  context.fillStyle = '#101418';
  context.fillRect(0, 0, canvas.width, canvas.height);
  const entry = media[kind];
  if (entry) {
    const source = mediaSize(entry);
    if (source.width && source.height) {
      const transform = transforms[kind];
      const fit = Math.min(canvas.width / source.width, canvas.height / source.height);
      const width = source.width * fit * transform.width / 100;
      const height = source.height * fit * transform.height / 100;
      context.drawImage(entry.element,
        (canvas.width - width) / 2 + canvas.width * transform.x / 100,
        (canvas.height - height) / 2 + canvas.height * transform.y / 100,
        width, height);
    }
  }
  screenTextures[kind].needsUpdate = true;
}

// Transform rows are generated so both screens stay identical by construction.
for (const group of document.querySelectorAll('[data-screen-transform]')) {
  const kind = group.dataset.screenTransform;
  for (const field of TRANSFORM_FIELDS) {
    const row = document.createElement('div');
    row.className = 'track-row';
    row.innerHTML = `<span aria-hidden="true">${field.short}</span>`
      + `<input type="range" data-range="${field.name}" min="${field.min}" max="${field.max}" step="1" disabled>`
      + `<input type="number" data-number="${field.name}" min="${field.min}" max="${field.max}" step="1" disabled>`;
    group.append(row);
  }
  const reset = document.createElement('button');
  reset.type = 'button';
  reset.className = 'link';
  reset.textContent = 'Reset placement';
  reset.disabled = true;
  reset.addEventListener('click', () => {
    for (const [name, value] of Object.entries(TRANSFORM_DEFAULTS)) setTransform(kind, name, value);
    redraw(kind);
  });
  group.append(reset);
  group.querySelectorAll('[data-range]').forEach(range => range.addEventListener('input', () => {
    setTransform(kind, range.dataset.range, Number(range.value));
    redraw(kind);
  }));
  group.querySelectorAll('[data-number]').forEach(number => {
    const name = number.dataset.number;
    number.addEventListener('input', () => {
      if (number.value === '' || !Number.isFinite(Number(number.value))) return;
      setTransform(kind, name, Number(number.value), false);
      redraw(kind);
    });
    number.addEventListener('change', () => {
      setTransform(kind, name, Number(number.value) || TRANSFORM_DEFAULTS[name]);
      redraw(kind);
    });
  });
}
function setTransform(kind, name, value, echo = true) {
  const group = document.querySelector(`[data-screen-transform="${kind}"]`);
  const range = group.querySelector(`[data-range="${name}"]`);
  const clamped = Math.min(Number(range.max), Math.max(Number(range.min), value));
  transforms[kind][name] = clamped;
  range.value = clamped;
  range.style.setProperty('--progress', `${(clamped - range.min) / (range.max - range.min) * 100}%`);
  // Echoing back mid-edit would fight the caret, so typing waits for the commit.
  if (echo) group.querySelector(`[data-number="${name}"]`).value = clamped;
}
for (const kind of ['inner', 'outer', 'backdrop']) {
  for (const [name, value] of Object.entries(TRANSFORM_DEFAULTS)) setTransform(kind, name, value);
}

function setMedia(kind, entry) {
  const previous = media[kind];
  if (previous) {
    if (previous.kind === 'video') previous.element.pause();
    URL.revokeObjectURL(previous.url);
  }
  media[kind] = entry;
  const panel = document.querySelector(`[data-loaded="${kind}"]`);
  panel.hidden = !entry;
  if (entry) {
    panel.querySelector('.loaded-name').textContent = entry.name;
    panel.querySelector('.loaded-kind').textContent = entry.kind === 'video' ? 'Video' : 'Image';
    panel.querySelector('.loaded-preview').style.backgroundImage =
      entry.kind === 'image' ? `url("${entry.url}")` : '';
    panel.querySelector('.loaded-preview').style.backgroundColor = entry.kind === 'video' ? '#16171c' : '';
  }
  const group = document.querySelector(`[data-screen-transform="${kind}"]`);
  if (group) group.hidden = !entry;
  if (!entry) for (const [name, value] of Object.entries(TRANSFORM_DEFAULTS)) setTransform(kind, name, value);
  drawScreen(kind);
  applyScreens();
}

async function readMedia(file) {
  const url = URL.createObjectURL(file);
  const name = file.name || 'media';
  if (file.type.startsWith('video/')) {
    const element = document.createElement('video');
    Object.assign(element, { src: url, loop: true, muted: true, playsInline: true, crossOrigin: 'anonymous' });
    try {
      await new Promise((resolve, reject) => {
        element.onloadeddata = resolve;
        element.onerror = () => reject(new Error('decode failed'));
        setTimeout(() => reject(new Error('timed out')), 20000);
      });
      await element.play().catch(() => {});
      return { kind: 'video', element, url, name };
    } catch {
      URL.revokeObjectURL(url);
      say('That video could not be read. Try MP4, WebM or Ogg.');
      return null;
    }
  }
  const element = new Image();
  element.src = url;
  try {
    await element.decode();
    return { kind: 'image', element, url, name };
  } catch {
    URL.revokeObjectURL(url);
    say('That image could not be read. Try PNG, JPG or WebP.');
    return null;
  }
}

const mediaInput = document.querySelector('#media-upload');
const backdropInput = document.querySelector('#backdrop-upload');
let mediaTarget = 'outer';
document.querySelectorAll('[data-pick]').forEach(button => button.addEventListener('click', () => {
  const target = button.dataset.pick;
  if (target === 'backdrop') { backdropInput.click(); return; }
  mediaTarget = target;
  mediaInput.click();
}));
document.querySelectorAll('[data-clear]').forEach(button => button.addEventListener('click', () => {
  const target = button.dataset.clear;
  if (target === 'backdrop') setBackdrop(null);
  else setMedia(target, null);
}));
mediaInput.addEventListener('change', async () => {
  const file = mediaInput.files[0];
  mediaInput.value = '';
  if (!file) return;
  const entry = await readMedia(file);
  if (!entry) return;
  setMedia(mediaTarget, entry);
  uiTheme = 'custom';
  applyScreens();
  setModel({ fold: mediaTarget === 'inner' ? 180 : 0 });
});
// Dropping a file onto a zone is the same as picking it there.
document.querySelectorAll('[data-drop]').forEach(zone => {
  const target = zone.dataset.drop;
  zone.addEventListener('dragover', event => { event.preventDefault(); zone.classList.add('over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('over'));
  zone.addEventListener('drop', async event => {
    event.preventDefault();
    zone.classList.remove('over');
    const file = event.dataTransfer?.files?.[0];
    if (!file || !ready) return;
    if (target === 'backdrop') {
      const entry = await readMedia(file);
      if (entry?.kind === 'image') setBackdrop(entry);
      else if (entry) say('The backdrop takes an image.');
      return;
    }
    const entry = await readMedia(file);
    if (!entry) return;
    setMedia(target, entry);
    uiTheme = 'custom';
    applyScreens();
  });
});

function applyScreens() {
  for (const [kind, screen] of Object.entries(screens)) {
    const custom = uiTheme === 'custom' && media[kind];
    const texture = custom ? screenTextures[kind] : screen.defaultTextures[defaultTheme];
    screen.material.map = texture;
    screen.pixel.value.set(1 / texture.image.width, 1 / texture.image.height);
    screen.frame.value.copy(kind === 'inner' ? innerUIFrame : outerUIFrame);
    screen.gradient.value.set(kind === 'inner' ? .5 : 0, kind === 'inner' ? 0 : 1);
  }
  document.querySelectorAll('[data-ui-theme]').forEach(button =>
    button.setAttribute('aria-selected', String(button.dataset.uiTheme === uiTheme)));
  document.querySelector('#media-sections').hidden = uiTheme !== 'custom';
}
// Objects panel: picking one shows its properties, Figma style.
document.querySelectorAll('[data-layer]').forEach(button => button.addEventListener('click', () => {
  const layer = button.dataset.layer;
  document.querySelectorAll('[data-layer]').forEach(tab =>
    tab.setAttribute('aria-pressed', String(tab.dataset.layer === layer)));
  document.querySelectorAll('.group').forEach(group => { group.hidden = group.dataset.group !== layer; });
}));
document.querySelectorAll('[data-ui-theme]').forEach(button => button.addEventListener('click', () => {
  uiTheme = button.dataset.uiTheme;
  if (uiTheme !== 'custom') defaultTheme = uiTheme;
  applyScreens();
}));

// Model: every value here can be keyframed.
const MODEL_DEFAULTS = {
  positionX: 0, positionY: 0, positionZ: 0,
  rotationX: 0, rotationY: 0, rotationZ: 0,
  fov: 30, scale: 100, brightness: 100, fold: 180,
};
const POSITION_UNIT = 10;
const model = { ...MODEL_DEFAULTS };
const modelInputs = [...document.querySelectorAll('[data-model]')];

function formatModel(name, value) {
  if (name === 'brightness') return (value / 100).toFixed(2);
  if (name === 'scale') return `${Math.round(value)}%`;
  if (name === 'fov' || name === 'fold') return `${Math.round(value)}°`;
  return String(value);
}
function syncModelInputs() {
  for (const input of modelInputs) {
    const name = input.dataset.model;
    const value = model[name];
    if (input.type === 'range') {
      input.value = value;
      const meter = input.closest('.meter');
      meter.style.setProperty('--fill', `${(value - input.min) / (input.max - input.min) * 100}%`);
      meter.querySelector('.meter-value').textContent = formatModel(name, value);
    } else if (document.activeElement !== input) {
      input.value = name.startsWith('position') ? Number(value.toFixed(2)) : Math.round(value);
    }
  }
}
function applyModel() {
  phone.position.set(model.positionX * POSITION_UNIT, model.positionY * POSITION_UNIT, model.positionZ * POSITION_UNIT);
  phone.rotation.set(...['rotationX', 'rotationY', 'rotationZ'].map(name => THREE.MathUtils.degToRad(model[name])));
  phone.scale.setScalar(model.scale / 100);
  bend.value = (180 - model.fold) / 180 * Math.PI;
  const brightness = model.brightness / 100;
  screens.inner?.material.color.setScalar(brightness);
  screens.outer?.material.color.setScalar(model.fold >= 180 ? 0 : brightness);
  applyFov();
  syncModelInputs();
}
function setModel(changes, record = true) {
  Object.assign(model, changes);
  applyModel();
  if (record) writeThroughToKeyframe();
}
for (const input of modelInputs) {
  const name = input.dataset.model;
  const commit = () => {
    const raw = Number(input.value);
    if (!Number.isFinite(raw)) return;
    const value = input.type === 'range'
      ? Math.min(Number(input.max), Math.max(Number(input.min), raw))
      : raw;
    setModel({ [name]: value });
  };
  input.addEventListener('input', commit);
  input.addEventListener('change', commit);
}
document.querySelector('#model-reset').addEventListener('click', () => setModel({ ...MODEL_DEFAULTS }));

// Field of view dollies the camera so the device keeps its framing.
let fitDistance = 40;
let userZoom = 1;
let framing = false;
controls.addEventListener('change', () => {
  if (!framing) userZoom = camera.position.distanceTo(controls.target) / fitDistance;
});
function applyFov() {
  if (camera.fov === model.fov) return;
  camera.fov = model.fov;
  camera.updateProjectionMatrix();
  frameCamera();
}
function frameCamera() {
  const rect = viewport.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return;
  const half = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
  const aspect = rect.width / rect.height;
  fitDistance = Math.max(12.5 / (2 * half), 19 / (2 * half * aspect));
  framing = true;
  const direction = camera.position.clone().sub(controls.target).normalize();
  camera.position.copy(controls.target).add(direction.multiplyScalar(fitDistance * userZoom));
  camera.updateProjectionMatrix();
  controls.update();
  framing = false;
}

// Environment ---------------------------------------------------------------
const ENVIRONMENTS = {
  studio1: { intensity: 1.35, key: 2.6, rim: 2, hemi: 1.8, exposure: 1.18 },
  studio2: { intensity: 1.05, key: 3.4, rim: 1.2, hemi: 1.2, exposure: 1.1 },
  soft: { intensity: 1.85, key: 1.4, rim: 1.7, hemi: 2.4, exposure: 1.25 },
  contrast: { intensity: .8, key: 4.4, rim: .5, hemi: .85, exposure: 1 },
};
const environmentSelect = document.querySelector('#environment');
const environmentRotation = { x: 0, y: 90, z: 0 };
function applyEnvironment() {
  const preset = ENVIRONMENTS[environmentSelect.value] ?? ENVIRONMENTS.studio1;
  scene.environmentIntensity = preset.intensity;
  key.intensity = preset.key;
  rim.intensity = preset.rim;
  hemisphere.intensity = preset.hemi;
  renderer.toneMappingExposure = preset.exposure;
  scene.environmentRotation?.set(...['x', 'y', 'z']
    .map(axis => THREE.MathUtils.degToRad(environmentRotation[axis])));
}
environmentSelect.addEventListener('change', applyEnvironment);
document.querySelectorAll('[data-env]').forEach(input => input.addEventListener('input', () => {
  const value = Number(input.value);
  if (!Number.isFinite(value)) return;
  environmentRotation[input.dataset.env] = value;
  applyEnvironment();
}));

// Background ----------------------------------------------------------------
const backgroundCanvas = document.createElement('canvas');
const backgroundTexture = new THREE.CanvasTexture(backgroundCanvas);
backgroundTexture.colorSpace = THREE.SRGBColorSpace;
scene.background = backgroundTexture;
const backgroundColor = document.querySelector('#background-color');
const topBackground = document.querySelector('#top-background');
const topBackgroundHex = document.querySelector('#top-background-hex');
const gradientFrom = document.querySelector('#gradient-from');
const gradientTo = document.querySelector('#gradient-to');
const gradientAngle = document.querySelector('#gradient-angle');
let backgroundMode = 'color';
let backdrop = null;

function drawBackground() {
  document.body.classList.toggle('transparent', backgroundMode === 'none');
  if (backgroundMode === 'none') {
    scene.background = null;
    return;
  }
  scene.background = backgroundTexture;
  const rect = viewport.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return;
  const scale = Math.min(devicePixelRatio, 2, 2560 / rect.width);
  const width = Math.round(rect.width * scale), height = Math.round(rect.height * scale);
  if (backgroundCanvas.width !== width || backgroundCanvas.height !== height) {
    backgroundCanvas.width = width;
    backgroundCanvas.height = height;
    // Texture storage is sized on first upload, so a resized canvas needs a fresh one.
    backgroundTexture.dispose();
  }
  const context = backgroundCanvas.getContext('2d');
  context.setTransform(scale, 0, 0, scale, 0, 0);
  if (backgroundMode === 'gradient') {
    // Follow the CSS gradient line: 0deg points up and angles run clockwise.
    const radians = Number(gradientAngle.value) * Math.PI / 180;
    const x = Math.sin(radians), y = -Math.cos(radians);
    const length = Math.abs(rect.width * x) + Math.abs(rect.height * y);
    const gradient = context.createLinearGradient(
      (rect.width - x * length) / 2, (rect.height - y * length) / 2,
      (rect.width + x * length) / 2, (rect.height + y * length) / 2);
    gradient.addColorStop(0, gradientFrom.value);
    gradient.addColorStop(1, gradientTo.value);
    context.fillStyle = gradient;
  } else {
    context.fillStyle = backgroundMode === 'image' && backdrop ? '#101418' : backgroundColor.value;
  }
  context.fillRect(0, 0, rect.width, rect.height);
  if (backgroundMode === 'image' && backdrop) {
    const source = backdrop.element;
    const place = transforms.backdrop;
    // 100% covers the artboard; the fields scale and shift from there.
    const cover = Math.max(rect.width / source.naturalWidth, rect.height / source.naturalHeight);
    const drawn = source.naturalWidth * cover * place.width / 100;
    const high = source.naturalHeight * cover * place.height / 100;
    context.drawImage(source,
      (rect.width - drawn) / 2 + rect.width * place.x / 100,
      (rect.height - high) / 2 + rect.height * place.y / 100, drawn, high);
  }
  backgroundTexture.needsUpdate = true;
}
function setBackdrop(entry) {
  if (backdrop) URL.revokeObjectURL(backdrop.url);
  backdrop = entry;
  const panel = document.querySelector('[data-loaded="backdrop"]');
  panel.hidden = !entry;
  const place = document.querySelector('[data-screen-transform="backdrop"]');
  if (place) place.hidden = !entry;
  if (!entry) for (const [name, value] of Object.entries(TRANSFORM_DEFAULTS)) setTransform('backdrop', name, value);
  if (entry) {
    panel.querySelector('.loaded-name').textContent = entry.name;
    panel.querySelector('.loaded-preview').style.backgroundImage = `url("${entry.url}")`;
  }
  drawBackground();
}
backdropInput.addEventListener('change', async () => {
  const file = backdropInput.files[0];
  backdropInput.value = '';
  if (!file) return;
  const entry = await readMedia(file);
  if (entry?.kind === 'image') setBackdrop(entry);
  else if (entry) say('The backdrop takes an image.');
});
function setBackgroundMode(mode) {
  backgroundMode = mode;
  document.querySelectorAll('[data-background-mode]').forEach(tab =>
    tab.setAttribute('aria-selected', String(tab.dataset.backgroundMode === mode)));
  document.querySelectorAll('[data-background-fields]').forEach(fields =>
    fields.hidden = fields.dataset.backgroundFields !== mode);
  document.querySelector('#export-transparent').checked = mode === 'none';
  drawBackground();
  updateExportLabels();
}
document.querySelectorAll('[data-background-mode]').forEach(button => button.addEventListener('click', () => {
  setBackgroundMode(button.dataset.backgroundMode);
  if (backgroundMode === 'image' && !backdrop) backdropInput.click();
}));
function syncColour(value) {
  backgroundColor.value = value;
  topBackground.value = value;
  topBackgroundHex.textContent = value.toUpperCase();
  document.querySelectorAll('[data-background-color]').forEach(button => button.setAttribute('aria-pressed',
    String(button.dataset.backgroundColor.toLowerCase() === value.toLowerCase())));
  drawBackground();
}
document.querySelectorAll('[data-background-color]').forEach(button =>
  button.addEventListener('click', () => syncColour(button.dataset.backgroundColor)));
backgroundColor.addEventListener('input', () => syncColour(backgroundColor.value));
topBackground.addEventListener('input', () => {
  if (backgroundMode !== 'color') setBackgroundMode('color');
  syncColour(topBackground.value);
});
[gradientFrom, gradientTo].forEach(input => input.addEventListener('input', drawBackground));
gradientAngle.addEventListener('input', () => {
  const meter = gradientAngle.closest('.meter');
  meter.style.setProperty('--fill', `${gradientAngle.value / 3.6}%`);
  meter.querySelector('.meter-value').textContent = `${gradientAngle.value}°`;
  drawBackground();
});

// Artboard shape ------------------------------------------------------------
const frameBox = document.querySelector('.frame');
const frameSizeNote = document.querySelector('#frame-size');
const aspectSelect = document.querySelector('#aspect');
let frameAspect = 1;
function exportPixels() {
  const rect = viewport.getBoundingClientRect();
  const pixels = Math.min(devicePixelRatio, 2);
  return { width: Math.round(rect.width * pixels), height: Math.round(rect.height * pixels) };
}
function reportFrameSize() {
  const { width, height } = exportPixels();
  frameSizeNote.textContent = `Artboard exports at ${width} × ${height} px`;
  updateExportLabels();
}
function applyFrame() {
  const box = frameBox.getBoundingClientRect();
  if (box.width < 1 || box.height < 1) return;
  if (!frameAspect) {
    viewport.style.width = '';
    viewport.style.height = '';
  } else {
    const width = Math.min(box.width, box.height * frameAspect);
    viewport.style.width = `${Math.round(width)}px`;
    viewport.style.height = `${Math.round(width / frameAspect)}px`;
  }
  reportFrameSize();
}
aspectSelect.addEventListener('change', () => {
  const value = aspectSelect.value;
  if (value === 'fit') frameAspect = null;
  else {
    const [w, h] = value.split(':').map(Number);
    frameAspect = w / h;
  }
  applyFrame();
});
new ResizeObserver(applyFrame).observe(frameBox);

function resize() {
  const { width, height } = viewport.getBoundingClientRect();
  if (width < 1 || height < 1) return;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  frameCamera();
  drawBackground();
  reportFrameSize();
}
new ResizeObserver(resize).observe(viewport);

// Timeline ------------------------------------------------------------------
const EASINGS = {
  easeInOut: p => (p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
  linear: p => p,
  easeIn: p => p * p * p,
  easeOut: p => 1 - Math.pow(1 - p, 3),
  overshoot: p => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); },
  hold: () => 0,
};
const ANIMATED = Object.keys(MODEL_DEFAULTS);
const track = document.querySelector('#track');
const ruler = document.querySelector('#ruler');
const keysLayer = document.querySelector('#keys');
const playheadEl = document.querySelector('#playhead');
const durationInput = document.querySelector('#duration');
const keyframeToggle = document.querySelector('#keyframe-toggle');
const keyframeLabel = document.querySelector('#keyframe-label');
const playButton = document.querySelector('#play');

let duration = 4;
let playhead = 0;
let timelinePlaying = false;
let selectedKey = 0;
let keyframes = [
  { time: 0, easing: 'easeInOut', state: { ...MODEL_DEFAULTS } },
  { time: 2, easing: 'easeInOut', state: { ...MODEL_DEFAULTS, fold: 0, rotationY: -20 } },
  { time: 4, easing: 'easeInOut', state: { ...MODEL_DEFAULTS } },
];

function sortKeys() {
  const selected = keyframes[selectedKey];
  keyframes.sort((a, b) => a.time - b.time);
  selectedKey = Math.max(0, keyframes.indexOf(selected));
}
function sampleAt(time) {
  if (!keyframes.length) return { ...model };
  if (time <= keyframes[0].time) return { ...keyframes[0].state };
  const last = keyframes[keyframes.length - 1];
  if (time >= last.time) return { ...last.state };
  let index = 0;
  while (index < keyframes.length - 1 && keyframes[index + 1].time <= time) index++;
  const from = keyframes[index], to = keyframes[index + 1];
  const span = to.time - from.time;
  const progress = span > 0 ? (time - from.time) / span : 1;
  const eased = (EASINGS[from.easing] ?? EASINGS.easeInOut)(progress);
  const state = {};
  for (const name of ANIMATED) state[name] = from.state[name] + (to.state[name] - from.state[name]) * eased;
  return state;
}
function keyIndexAt(time) {
  const tolerance = Math.max(.02, duration * .005);
  return keyframes.findIndex(frame => Math.abs(frame.time - time) <= tolerance);
}
// Editing a control while the playhead sits on a keyframe updates that keyframe.
function writeThroughToKeyframe() {
  if (timelinePlaying || recorder) return;
  const index = keyIndexAt(playhead);
  if (index < 0) return;
  for (const name of ANIMATED) keyframes[index].state[name] = model[name];
}
function setPlayhead(time, apply = true) {
  playhead = Math.min(duration, Math.max(0, time));
  playheadEl.style.left = `${playhead / duration * 100}%`;
  if (apply) setModel(sampleAt(playhead), false);
  const index = keyIndexAt(playhead);
  keyframeLabel.textContent = index < 0 ? 'Add keyframe' : 'Remove keyframe';
  keyframeToggle.dataset.mode = index < 0 ? 'add' : 'remove';
  if (index >= 0) selectedKey = index;
  renderKeys();
}
function renderRuler() {
  ruler.replaceChildren();
  const step = duration <= 6 ? .5 : duration <= 12 ? 1 : 2;
  for (let time = 0; time <= duration + 1e-6; time += step) {
    const tick = document.createElement('span');
    const major = Math.abs(time - Math.round(time)) < 1e-6;
    tick.className = major ? 'tick' : 'tick minor';
    tick.style.left = `${time / duration * 100}%`;
    tick.textContent = major ? `${Math.round(time)}s` : '';
    ruler.append(tick);
  }
}
function renderKeys() {
  keysLayer.replaceChildren();
  keyframes.forEach((frame, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = index === selectedKey ? 'key selected' : 'key';
    dot.style.left = `${frame.time / duration * 100}%`;
    dot.dataset.key = index;
    dot.title = `${frame.time.toFixed(2)}s · ${frame.easing}`;
    dot.setAttribute('aria-label', `Keyframe at ${frame.time.toFixed(2)} seconds`);
    keysLayer.append(dot);
  });
}
function renderTimeline() {
  renderRuler();
  setPlayhead(playhead, false);
}
function setTimelinePlaying(value) {
  timelinePlaying = value;
  document.querySelector('#pause-icon').toggleAttribute('hidden', !value);
  document.querySelector('#play-icon').toggleAttribute('hidden', value);
  playButton.querySelector('span').textContent = value ? 'Pause' : 'Play';
  playButton.setAttribute('aria-label', value ? 'Pause animation' : 'Play animation');
}
playButton.addEventListener('click', () => setTimelinePlaying(!timelinePlaying));
durationInput.addEventListener('change', () => {
  const value = Math.min(30, Math.max(1, Math.round(Number(durationInput.value) || 4)));
  durationInput.value = value;
  duration = value;
  keyframes.forEach(frame => { frame.time = Math.min(frame.time, duration); });
  sortKeys();
  setPlayhead(Math.min(playhead, duration));
  renderTimeline();
  updateExportLabels();
});
keyframeToggle.addEventListener('click', () => {
  const index = keyIndexAt(playhead);
  if (index < 0) {
    keyframes.push({ time: playhead, easing: keyframes[selectedKey]?.easing ?? 'easeInOut', state: { ...model } });
    sortKeys();
    selectedKey = keyIndexAt(playhead);
    say('Keyframe added');
  } else if (keyframes.length > 1) {
    keyframes.splice(index, 1);
    selectedKey = Math.min(selectedKey, keyframes.length - 1);
    say('Keyframe removed');
  } else {
    say('Keep at least one keyframe');
  }
  setPlayhead(playhead, false);
});

// Scrubbing, and dragging a keyframe to retime it.
let dragKey = -1;
function timeFromEvent(event) {
  const box = track.getBoundingClientRect();
  return Math.min(duration, Math.max(0, (event.clientX - box.left) / box.width * duration));
}
track.addEventListener('pointerdown', event => {
  if (!ready) return;
  track.setPointerCapture(event.pointerId);
  const dot = event.target.closest('.key');
  if (dot) {
    dragKey = Number(dot.dataset.key);
    selectedKey = dragKey;
    setTimelinePlaying(false);
    setPlayhead(keyframes[dragKey].time);
    return;
  }
  setTimelinePlaying(false);
  setPlayhead(timeFromEvent(event));
});
track.addEventListener('pointermove', event => {
  if (!track.hasPointerCapture?.(event.pointerId)) return;
  const time = timeFromEvent(event);
  if (dragKey >= 0) {
    keyframes[dragKey].time = time;
    const moved = keyframes[dragKey];
    sortKeys();
    dragKey = keyframes.indexOf(moved);
    selectedKey = dragKey;
    renderKeys();
    playhead = time;
    playheadEl.style.left = `${playhead / duration * 100}%`;
  } else {
    setPlayhead(time);
  }
});
track.addEventListener('pointerup', event => {
  track.releasePointerCapture?.(event.pointerId);
  if (dragKey >= 0) {
    dragKey = -1;
    setPlayhead(playhead);
  }
});

// Menus ---------------------------------------------------------------------
const exportMenu = document.querySelector('#export-menu');
const easingMenu = document.querySelector('#easing-menu');
const exportOpen = document.querySelector('#export-open');
function placeMenu(menu, anchor, align = 'end') {
  menu.hidden = false;
  const box = anchor.getBoundingClientRect();
  const size = menu.getBoundingClientRect();
  const left = align === 'end' ? box.right - size.width : box.left;
  menu.style.left = `${Math.max(8, Math.min(innerWidth - size.width - 8, left))}px`;
  const below = box.bottom + 8;
  menu.style.top = below + size.height < innerHeight - 8
    ? `${below}px`
    : `${Math.max(8, box.top - size.height - 8)}px`;
}
function closeMenus() {
  exportMenu.hidden = true;
  easingMenu.hidden = true;
}
document.addEventListener('pointerdown', event => {
  if (!event.target.closest('.menu') && !event.target.closest('#export-open') && !event.target.closest('#easing-open')) closeMenus();
});
exportOpen.addEventListener('click', () => {
  if (recorder) { recorder.stop(); return; }
  const open = exportMenu.hidden;
  closeMenus();
  if (open) {
    updateExportLabels();
    placeMenu(exportMenu, exportOpen);
  }
});
document.querySelector('#easing-open').addEventListener('click', () => {
  const open = easingMenu.hidden;
  closeMenus();
  if (open) {
    const easing = keyframes[selectedKey]?.easing ?? 'easeInOut';
    easingMenu.querySelectorAll('[data-easing]').forEach(item =>
      item.setAttribute('aria-checked', String(item.dataset.easing === easing)));
    placeMenu(easingMenu, document.querySelector('#easing-open'));
  }
});
easingMenu.querySelectorAll('[data-easing]').forEach(item => item.addEventListener('click', () => {
  if (keyframes[selectedKey]) {
    keyframes[selectedKey].easing = item.dataset.easing;
    say(`${item.textContent} applied`);
    renderKeys();
  }
  closeMenus();
}));

// Export --------------------------------------------------------------------
const MP4_TYPES = ['video/mp4;codecs=avc1.42E01E', 'video/mp4;codecs=avc1.4D401E',
  'video/mp4;codecs=avc1', 'video/mp4;codecs=h264', 'video/mp4'];
const ALPHA_TYPES = ['video/webm;codecs=vp8', 'video/webm;codecs=vp9', 'video/webm'];
function pickRecordType() {
  if (!window.MediaRecorder) return undefined;
  // MP4 has no alpha channel, so a transparent artboard records as WebM instead.
  const types = backgroundMode === 'none' ? ALPHA_TYPES : [...MP4_TYPES, ...ALPHA_TYPES];
  return types.find(type => MediaRecorder.isTypeSupported(type));
}
function updateExportLabels() {
  const { width, height } = exportPixels();
  document.querySelector('#export-size').textContent = `${width} × ${height}`;
  document.querySelector('#export-duration').textContent = `${duration}s`;
  const type = pickRecordType();
  document.querySelector('#export-video-label').textContent =
    !type ? 'Video (unsupported)' : type.startsWith('video/mp4') ? 'Video · MP4' : 'Video · WebM';
}
let recorder = null;
let recordElapsed = 0;
let snapshotPending = false;
let previousBackgroundMode = 'color';

document.querySelector('#export-transparent').addEventListener('change', event => {
  if (event.target.checked) {
    previousBackgroundMode = backgroundMode === 'none' ? 'color' : backgroundMode;
    setBackgroundMode('none');
  } else if (backgroundMode === 'none') {
    setBackgroundMode(previousBackgroundMode);
  }
});
document.querySelectorAll('[data-export]').forEach(item => item.addEventListener('click', () => {
  closeMenus();
  if (item.dataset.export === 'png') snapshotPending = true;
  else startRecording();
}));

function fileStem() {
  const name = document.querySelector('#project-name').value.trim() || 'duofied';
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'duofied';
}
function setRecording(value) {
  exportOpen.classList.toggle('recording', value);
  document.querySelector('#export-label').textContent = value ? 'Stop' : 'Export';
  document.querySelectorAll('button, input, select').forEach(element => {
    if (element !== exportOpen) element.disabled = value;
  });
}
function startRecording() {
  const type = pickRecordType();
  if (!type || !renderer.domElement.captureStream) {
    say('This browser cannot record video.');
    return;
  }
  const stream = renderer.domElement.captureStream(60);
  const chunks = [];
  recorder = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 16000000 });
  recorder.addEventListener('dataavailable', event => { if (event.data.size) chunks.push(event.data); });
  recorder.addEventListener('stop', () => {
    stream.getTracks().forEach(t => t.stop());
    recorder = null;
    setRecording(false);
    setTimelinePlaying(false);
    download(new Blob(chunks, { type }), `${fileStem()}.${type.startsWith('video/mp4') ? 'mp4' : 'webm'}`);
    say('Video saved');
  });
  recordElapsed = 0;
  setPlayhead(0);
  setTimelinePlaying(true);
  setRecording(true);
  recorder.start();
  say('Recording the timeline…');
}

function enableUI() {
  document.querySelectorAll('button, input, select').forEach(element => { element.disabled = false; });
  if (!pickRecordType()) say('Video recording is unavailable in this browser; PNG export still works.');
}
const screenShader = `
uniform float foldAngle;
uniform vec2 uiPixel;
uniform vec4 uiFrame;
uniform vec2 uiGradient;
uniform vec3 uiReferenceEye;
varying vec3 vUIPosition;
vec3 screenColor() {
  // Intersect the fixed front-view ray with the unfolded inner-screen plane.
  float depth = (0.24948 - uiReferenceEye.z) / (vUIPosition.z - uiReferenceEye.z);
  vec2 projected = uiReferenceEye.xy + (vUIPosition.xy - uiReferenceEye.xy) * depth;
  vec2 sourceUV = (projected - uiFrame.xy) / uiFrame.zw;
  #ifdef INNER_UI
    float progress = clamp(foldAngle / 1.570796327, 0.0, 1.0);
  #else
    // Anchor the image to the projected hinge-side edge of the outer screen.
    float c = cos(foldAngle), s = sin(foldAngle);
    vec2 hingeEdge = vec2(-0.23396, -0.27463 - 0.275454);
    vec2 foldedEdge = vec2(c * hingeEdge.x + s * hingeEdge.y,
      -s * hingeEdge.x + c * hingeEdge.y + 0.275454);
    float edgeDepth = (0.24948 - uiReferenceEye.z) / (foldedEdge.y - uiReferenceEye.z);
    float anchorX = uiReferenceEye.x + (foldedEdge.x - uiReferenceEye.x) * edgeDepth;
    sourceUV.x = uiGradient.x + (projected.x - anchorX) / uiFrame.z;
    float progress = clamp((3.141592654 - foldAngle) / 1.570796327, 0.0, 1.0);
  #endif
  float edge = (sourceUV.x - uiGradient.x) / (uiGradient.y - uiGradient.x);
  float motion = smoothstep(0.0, 1.0, progress);
  float blurGradient = clamp(edge, 0.0, 1.0);
  float darkenGradient = clamp((edge - 0.2) / 0.8, 0.0, 1.0);
  float effect = motion * pow(darkenGradient, 1.35);
  float radius = 72.0 * motion * pow(blurGradient, 1.35);
  vec2 aa = max(fwidth(sourceUV), uiPixel * 0.5);
  vec2 dx = dFdx(sourceUV) / uiPixel;
  vec2 dy = dFdy(sourceUV) / uiPixel;
  float baseLod = log2(max(1.0, max(length(dx), length(dy))));
  vec2 coverage = smoothstep(-aa, aa, sourceUV)
    * (1.0 - smoothstep(vec2(1.0) - aa, vec2(1.0) + aa, sourceUV));
  vec3 color = textureLod(map, clamp(sourceUV, vec2(0.0), vec2(1.0)), baseLod).rgb * coverage.x * coverage.y;
  if (radius > 0.0) {
    // Use the same mip level at zero blur, then increase it continuously.
    float lod = max(baseLod, log2(max(1.0, radius)));
    vec2 footprint = max(aa, uiPixel * radius * 0.75);
    color = vec3(0.0);
    for (int y = -2; y <= 2; y++) {
      for (int x = -2; x <= 2; x++) {
        float wx = x == 0 ? 6.0 : (abs(x) == 1 ? 4.0 : 1.0);
        float wy = y == 0 ? 6.0 : (abs(y) == 1 ? 4.0 : 1.0);
        vec2 sampleUV = sourceUV + vec2(float(x), float(y)) * uiPixel * radius;
        // Blur the image and its coverage together so color spreads into the black margin.
        vec2 coverage = smoothstep(-footprint, footprint, sampleUV)
          * (1.0 - smoothstep(vec2(1.0) - footprint, vec2(1.0) + footprint, sampleUV));
        color += textureLod(map, clamp(sampleUV, vec2(0.0), vec2(1.0)), lod).rgb
          * coverage.x * coverage.y * wx * wy / 256.0;
      }
    }
  }
  return color * (1.0 - min(1.0, effect * 2.0));
}
`;

// The camera half stays in its original transform. Only the cover half rotates.
const foldShader = `
uniform float foldAngle;
vec2 rotateHinge(vec2 p) {
  float c = cos(foldAngle), s = sin(foldAngle);
  p.y -= 0.275454;
  return vec2(c * p.x + s * p.y, -s * p.x + c * p.y + 0.275454);
}
#ifdef FLEXIBLE_SCREEN
vec4 bendStrip(vec3 p) {
  float halfWidth = 0.35;
  if (p.x >= halfWidth) return vec4(p.x, p.z, 1.0, 0.0);
  if (p.x <= -halfWidth) return vec4(rotateHinge(p.xz), cos(foldAngle), -sin(foldAngle));
  float t = (p.x + halfWidth) / (2.0 * halfWidth);
  float t2 = t*t, t3 = t2*t;
  vec2 a = rotateHinge(vec2(-halfWidth, p.z));
  vec2 b = vec2(halfWidth, p.z);
  vec2 ta = 2.0 * halfWidth * vec2(cos(foldAngle), -sin(foldAngle));
  vec2 tb = vec2(2.0 * halfWidth, 0.0);
  vec2 point = (2.0*t3-3.0*t2+1.0)*a + (t3-2.0*t2+t)*ta + (-2.0*t3+3.0*t2)*b + (t3-t2)*tb;
  vec2 tangent = normalize((6.0*t2-6.0*t)*a + (3.0*t2-4.0*t+1.0)*ta + (-6.0*t2+6.0*t)*b + (3.0*t2-2.0*t)*tb);
  return vec4(point, tangent);
}
#endif
`;
let usingFallback = false;
let device;
try {
  device = await new USDLoader().loadAsync('./assets/iPhone_Duo_Render.usdc');
} catch {
  device = createFallbackDevice();
  usingFallback = true;
}
try {
  device.scale.multiplyScalar(100);
  device.updateMatrixWorld(true);
  const count = { moving: 0, fixed: 0, flexible: 0 };
  device.traverse(object => {
    if (!object.isMesh) return;
    const geometry = object.geometry.clone().applyMatrix4(object.matrixWorld);
    geometry.translate(0, -5.8974, 0);
    let ancestor = object;
    while (ancestor && !['upTUAKvMVkPOMKq', 'SiftyleUEEZwLhF'].includes(ancestor.name)) ancestor = ancestor.parent;
    const moving = ancestor?.name === 'upTUAKvMVkPOMKq';
    const flexible = ['JnJdTkxbQgUtLwU', 'xdyyaajWsatVNxN', 'UXtsBZYlaUvHoEh', 'MvKPXGSdYDVvSpk'].includes(object.name);
    const kind = object.name === 'UXtsBZYlaUvHoEh' ? 'inner' : object.name === 'hhgAIoCGsHXeDPY' ? 'outer' : null;
    const material = kind ? screens[kind].material : object.material.clone();
    if (kind) {
      const p = geometry.attributes.position;
      const uv = new Float32Array(p.count * 2);
      for (let i = 0; i < p.count; i++) {
        uv[i * 2] = kind === 'inner' ? (p.getX(i) + 7.89935) / 15.7987 : (-.23396 - p.getX(i)) / 7.73936;
        uv[i * 2 + 1] = kind === 'inner' ? (p.getY(i) + 5.8974 - .34562) / 11.1035 : (p.getY(i) + 5.8974 - .27173) / 11.2513;
      }
      geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    }
    if (moving || flexible) {
      material.onBeforeCompile = shader => {
        shader.uniforms.foldAngle = bend;
        if (kind) {
          shader.uniforms.uiFrame = screens[kind].frame;
          shader.uniforms.uiGradient = screens[kind].gradient;
          shader.uniforms.uiReferenceEye = { value: uiReferenceEye };
          shader.uniforms.uiPixel = screens[kind].pixel;
          shader.fragmentShader = shader.fragmentShader.replace('#include <map_pars_fragment>', `
            #include <map_pars_fragment>
            ${kind === 'inner' ? '#define INNER_UI' : ''}
            ${screenShader}
          `).replace('#include <map_fragment>', 'diffuseColor.rgb *= screenColor();');
          shader.vertexShader = `varying vec3 vUIPosition;\n${shader.vertexShader}`;
          shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>', `
            vUIPosition = transformed;
            #include <project_vertex>
          `);
        }
        shader.vertexShader = `${flexible ? '#define FLEXIBLE_SCREEN\n' : ''}${foldShader}\n${shader.vertexShader}`;
        shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', flexible ? `
          vec4 folded = bendStrip(position);
          vec3 transformed = vec3(folded.x, position.y, folded.y);
        ` : `
          vec2 folded = rotateHinge(position.xz);
          vec3 transformed = vec3(folded.x, position.y, folded.y);
        `);
        shader.vertexShader = shader.vertexShader.replace('#include <beginnormal_vertex>', `
          vec3 objectNormal = vec3(normal);
          ${flexible ? 'vec4 strip = bendStrip(position); float a = atan(-strip.w, strip.z);' : 'float a = foldAngle;'}
          objectNormal.x = cos(a) * normal.x + sin(a) * normal.z;
          objectNormal.z = -sin(a) * normal.x + cos(a) * normal.z;
        `);
      };
      material.customProgramCacheKey = () => `${flexible ? 'fold-flexible' : 'fold-cover'}-${kind || 'body'}`;
    }
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = object.name;
    mesh.frustumCulled = false;
    phone.add(mesh);
    count[flexible ? 'flexible' : moving ? 'moving' : 'fixed']++;
  });
  console.info('Model ready', JSON.stringify({ ...count, sourceMeshes: phone.children.length, fallback: usingFallback }));
  applyScreens();
  applyFrame();
  ready = true;
  enableUI();
  setPlayhead(0);
  if (usingFallback) say('Using the built-in device. Run the asset script for the reference model.');
} catch (error) {
  say('The device could not be built. Refresh the page to try again.');
  console.error(error);
}

// Startup -------------------------------------------------------------------
syncColour(backgroundColor.value);
applyEnvironment();
applyScreens();
drawScreen('inner');
drawScreen('outer');
renderTimeline();
updateExportLabels();

let lastTime = performance.now();
renderer.setAnimationLoop(now => {
  const delta = Math.min((now - lastTime) / 1000, .05);
  lastTime = now;
  if (ready && timelinePlaying) {
    let next = playhead + delta;
    if (next >= duration) next = recorder ? duration : next % duration;
    setPlayhead(next);
  }
  // A screen playing video needs its canvas redrawn every frame.
  for (const kind of ['inner', 'outer']) {
    if (media[kind]?.kind === 'video' && media[kind].element.readyState >= 2) drawScreen(kind);
  }
  if (recorder) {
    recordElapsed += delta;
    if (recordElapsed >= duration) recorder.stop();
  }
  controls.update();
  renderer.render(scene, camera);
  if (snapshotPending) {
    // Taken here, while the drawing buffer still holds the frame just rendered.
    snapshotPending = false;
    renderer.domElement.toBlob(blob => {
      if (!blob) return;
      download(blob, `${fileStem()}.png`);
      say('PNG saved');
    }, 'image/png');
  }
});
