import * as THREE from 'three';
import { USDLoader } from 'three/addons/loaders/USDLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { loadDefaultUIs } from './ui.js';

const viewport = document.querySelector('#viewport');
const slider = document.querySelector('#angle');
const play = document.querySelector('#play');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, 1, .1, 250);
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
scene.environmentIntensity = 1.35;
scene.add(new THREE.HemisphereLight(0xffffff, 0xb5baa8, 1.8));
const key = new THREE.DirectionalLight(0xfffcf5, 2.6);
key.position.set(-15, 25, 30);
scene.add(key);
const rim = new THREE.DirectionalLight(0xe8edf5, 2);
rim.position.set(15, 5, -15);
scene.add(rim);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 21;
controls.maxDistance = 65;
controls.target.set(0, 0, .275454);
controls.update();
const phone = new THREE.Group();
scene.add(phone);
const bend = { value: 0 };
let angle = 180;
let playing = false;
let phase = 0;
let transition = null;
let ready = false;
const screens = {};
const uiReferenceEye = new THREE.Vector3(0, 0, 40);
const innerUIFrame = new THREE.Vector4(-7.89935, .34562 - 5.8974, 15.7987, 11.1035);
const outerUIFrame = new THREE.Vector4(.23396, .27173 - 5.8974, 7.73936, 11.2513)
  .multiplyScalar((uiReferenceEye.z - .24948) / (uiReferenceEye.z - .825538));
const defaultUIs = await loadDefaultUIs();
let uiTheme = 'wallpaper';
let defaultTheme = 'wallpaper';
// Custom mode holds one image per screen: the closed cover (outer) and the open display (inner).
// Each entry is the object URL of that screen's image, or null while the screen has none.
const customSources = { inner: null, outer: null };
const customCanvases = {};
const customTextures = {};
for (const [kind, size] of Object.entries({ inner: [1600, 1125], outer: [774, 1125] })) {
  const canvas = document.createElement('canvas');
  [canvas.width, canvas.height] = size;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  customCanvases[kind] = canvas;
  customTextures[kind] = texture;
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
const uiInput = document.querySelector('#ui-upload');
const customPanel = document.querySelector('#custom-screens');
const customSlots = Object.fromEntries(['inner', 'outer'].map(kind =>
  [kind, document.querySelector(`.custom-slot[data-custom-screen="${kind}"]`)]));
let uploadTarget = 'outer';

function drawContainedImage(canvas, image) {
  const context = canvas.getContext('2d');
  context.fillStyle = '#101418';
  context.fillRect(0, 0, canvas.width, canvas.height);
  const scale = Math.min(canvas.width / image.width, canvas.height / image.height);
  const width = image.width * scale, height = image.height * scale;
  context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
}
function syncSlot(slot, url) {
  slot.classList.toggle('filled', Boolean(url));
  slot.querySelector('.custom-slot-preview').style.backgroundImage = url ? `url("${url}")` : '';
  slot.querySelector('.custom-slot-state').textContent = url ? 'Replace image' : 'Add image';
  slot.querySelector('.custom-slot-clear').hidden = !url;
}
function setCustomSource(kind, url) {
  const previous = customSources[kind];
  if (previous) URL.revokeObjectURL(previous);
  customSources[kind] = url;
  syncSlot(customSlots[kind], url);
}
async function readImage(file) {
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.src = url;
  try {
    await image.decode();
    return { image, url };
  } catch {
    URL.revokeObjectURL(url);
    alert('Unable to read this image. Choose a PNG, JPG, or WebP file.');
    return null;
  }
}
// Each screen draws its own custom image; a screen left without one keeps the selected layout.
function applyScreens() {
  for (const [kind, screen] of Object.entries(screens)) {
    const custom = uiTheme === 'custom' && customSources[kind];
    const texture = custom ? customTextures[kind] : screen.defaultTextures[defaultTheme];
    screen.material.map = texture;
    screen.pixel.value.set(1 / texture.image.width, 1 / texture.image.height);
    screen.frame.value.copy(kind === 'inner' ? innerUIFrame : outerUIFrame);
    screen.gradient.value.set(kind === 'inner' ? .5 : 0, kind === 'inner' ? 0 : 1);
  }
  syncThemeButtons();
}
function syncThemeButtons() {
  document.querySelectorAll('[data-ui-theme]').forEach(button => button.setAttribute('aria-selected', String(button.dataset.uiTheme === uiTheme)));
  customPanel.hidden = uiTheme !== 'custom';
}
function pickCustomImage(kind) {
  uploadTarget = kind;
  uiInput.click();
}
uiInput.addEventListener('change', async () => {
  const file = uiInput.files[0];
  uiInput.value = '';
  if (!file) return;
  const kind = uploadTarget;
  const source = await readImage(file);
  if (!source) return;
  setCustomSource(kind, source.url);
  drawContainedImage(customCanvases[kind], source.image);
  customTextures[kind].needsUpdate = true;
  uiTheme = 'custom';
  applyScreens();
  setPlaying(false);
  // Fold towards the screen this image belongs to.
  transition = { from: angle, to: kind === 'inner' ? 180 : 0, elapsed: 0 };
});
for (const [kind, slot] of Object.entries(customSlots)) {
  slot.querySelector('.custom-slot-pick').addEventListener('click', () => pickCustomImage(kind));
  slot.querySelector('.custom-slot-clear').addEventListener('click', () => {
    setCustomSource(kind, null);
    applyScreens();
  });
}
document.querySelectorAll('[data-ui-theme]').forEach(button => button.addEventListener('click', () => {
  uiTheme = button.dataset.uiTheme;
  if (uiTheme !== 'custom') defaultTheme = uiTheme;
  applyScreens();
  // Offer the closed screen first when custom mode has no images yet.
  if (uiTheme === 'custom' && !customSources.inner && !customSources.outer) pickCustomImage('outer');
}));

function setPlaying(value) {
  playing = value;
  document.querySelector('#pause-icon').toggleAttribute('hidden', !value);
  document.querySelector('#play-icon').toggleAttribute('hidden', value);
  play.setAttribute('aria-label', value ? 'Pause animation' : 'Play animation');
}
function setAngle(value) {
  angle = value;
  slider.value = value;
  slider.style.setProperty('--progress', `${value / 1.8}%`);
  bend.value = (180 - value) / 180 * Math.PI;
  screens.outer.material.color.setScalar(value >= 180 ? 0 : 1);
}
play.addEventListener('click', () => {
  transition = null;
  if (!playing) phase = 1.2 + Math.acos(2 * angle / 180 - 1) / Math.PI * 3.1;
  setPlaying(!playing);
});
slider.addEventListener('input', () => {
  transition = null;
  setPlaying(false);
  setAngle(Number(slider.value));
});
// Background: drawn into the canvas so it is part of any recording, and mirrored onto
// the page so the strip behind the dock matches what the viewport shows.
const backgroundCanvas = document.createElement('canvas');
const backgroundTexture = new THREE.CanvasTexture(backgroundCanvas);
backgroundTexture.colorSpace = THREE.SRGBColorSpace;
scene.background = backgroundTexture;
const backgroundInput = document.querySelector('#background-upload');
const backgroundSlot = document.querySelector('[data-background-slot]');
const backgroundColor = document.querySelector('#background-color');
const gradientFrom = document.querySelector('#gradient-from');
const gradientTo = document.querySelector('#gradient-to');
const gradientAngle = document.querySelector('#gradient-angle');
let backgroundMode = 'color';
let backgroundImage = null;
let backgroundImageURL = null;

function backgroundStyle() {
  if (backgroundMode === 'gradient') return `linear-gradient(${gradientAngle.value}deg, ${gradientFrom.value}, ${gradientTo.value})`;
  if (backgroundMode === 'image' && backgroundImageURL) return `#101418 url("${backgroundImageURL}") center / cover no-repeat`;
  return backgroundColor.value;
}
function drawBackground() {
  const rect = viewport.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return;
  const scale = Math.min(devicePixelRatio, 2, 2560 / rect.width);
  const width = Math.round(rect.width * scale), height = Math.round(rect.height * scale);
  if (backgroundCanvas.width !== width || backgroundCanvas.height !== height) {
    backgroundCanvas.width = width;
    backgroundCanvas.height = height;
    // The texture's storage is sized on first upload, so a resized canvas needs a fresh one.
    backgroundTexture.dispose();
  }
  // Draw in page coordinates: the canvas then holds exactly the part of the page
  // background the viewport covers, leaving no seam against the CSS behind the dock.
  const context = backgroundCanvas.getContext('2d');
  context.setTransform(scale, 0, 0, scale, -rect.left * scale, -rect.top * scale);
  const pageWidth = innerWidth, pageHeight = innerHeight;
  if (backgroundMode === 'gradient') {
    // Follow the CSS gradient line: 0deg points up and angles run clockwise.
    const radians = Number(gradientAngle.value) * Math.PI / 180;
    const x = Math.sin(radians), y = -Math.cos(radians);
    const length = Math.abs(pageWidth * x) + Math.abs(pageHeight * y);
    const gradient = context.createLinearGradient(
      (pageWidth - x * length) / 2, (pageHeight - y * length) / 2,
      (pageWidth + x * length) / 2, (pageHeight + y * length) / 2);
    gradient.addColorStop(0, gradientFrom.value);
    gradient.addColorStop(1, gradientTo.value);
    context.fillStyle = gradient;
  } else {
    context.fillStyle = backgroundMode === 'image' && backgroundImage ? '#101418' : backgroundColor.value;
  }
  context.fillRect(0, 0, pageWidth, pageHeight);
  if (backgroundMode === 'image' && backgroundImage) {
    const cover = Math.max(pageWidth / backgroundImage.width, pageHeight / backgroundImage.height);
    const width = backgroundImage.width * cover, height = backgroundImage.height * cover;
    context.drawImage(backgroundImage, (pageWidth - width) / 2, (pageHeight - height) / 2, width, height);
  }
  backgroundTexture.needsUpdate = true;
  document.body.style.background = backgroundStyle();
}
function setBackgroundImage(source) {
  if (backgroundImageURL) URL.revokeObjectURL(backgroundImageURL);
  backgroundImage = source?.image ?? null;
  backgroundImageURL = source?.url ?? null;
  syncSlot(backgroundSlot, backgroundImageURL);
  drawBackground();
}
document.querySelectorAll('[data-background-mode]').forEach(button => button.addEventListener('click', () => {
  backgroundMode = button.dataset.backgroundMode;
  document.querySelectorAll('[data-background-mode]').forEach(tab =>
    tab.setAttribute('aria-selected', String(tab.dataset.backgroundMode === backgroundMode)));
  document.querySelectorAll('[data-background-fields]').forEach(fields =>
    fields.hidden = fields.dataset.backgroundFields !== backgroundMode);
  drawBackground();
  if (backgroundMode === 'image' && !backgroundImage) backgroundInput.click();
}));
document.querySelectorAll('[data-background-color]').forEach(button => button.addEventListener('click', () => {
  backgroundColor.value = button.dataset.backgroundColor;
  syncSwatches();
  drawBackground();
}));
function syncSwatches() {
  document.querySelectorAll('[data-background-color]').forEach(button => button.setAttribute('aria-pressed',
    String(button.dataset.backgroundColor.toLowerCase() === backgroundColor.value.toLowerCase())));
}
backgroundColor.addEventListener('input', () => {
  syncSwatches();
  drawBackground();
});
[gradientFrom, gradientTo].forEach(input => input.addEventListener('input', drawBackground));
gradientAngle.addEventListener('input', () => {
  gradientAngle.style.setProperty('--progress', `${gradientAngle.value / 3.6}%`);
  drawBackground();
});
gradientAngle.style.setProperty('--progress', `${gradientAngle.value / 3.6}%`);
backgroundSlot.querySelector('.custom-slot-pick').addEventListener('click', () => backgroundInput.click());
backgroundSlot.querySelector('.custom-slot-clear').addEventListener('click', () => setBackgroundImage(null));
backgroundInput.addEventListener('change', async () => {
  const file = backgroundInput.files[0];
  backgroundInput.value = '';
  if (file) setBackgroundImage(await readImage(file));
});
syncSwatches();

// Recording: capture the canvas through one full fold cycle and hand back a file.
const FOLD_CYCLE = 8.6;
const recordButton = document.querySelector('#record');
// Prefer H.264 in MP4, which every player opens; the rest are fallbacks for browsers without it.
const recordType = window.MediaRecorder && [
  'video/mp4;codecs=avc1.42E01E', 'video/mp4;codecs=avc1.4D401E', 'video/mp4;codecs=avc1',
  'video/mp4;codecs=h264', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm',
].find(type => MediaRecorder.isTypeSupported(type));
const canRecord = Boolean(recordType && renderer.domElement.captureStream);
let recorder = null;
let recordElapsed = 0;

function setRecording(value) {
  recordButton.classList.toggle('recording', value);
  document.querySelector('#record-icon').toggleAttribute('hidden', value);
  document.querySelector('#stop-icon').toggleAttribute('hidden', !value);
  const label = value ? 'Stop recording and download' : 'Record the fold animation';
  recordButton.setAttribute('aria-label', label);
  recordButton.title = label;
  // Hold the rest of the dock still until the recording is finished.
  document.querySelectorAll('button, input').forEach(element => {
    if (element !== recordButton) element.disabled = value;
  });
}
function startRecording() {
  if (!canRecord) return;
  const stream = renderer.domElement.captureStream(60);
  const chunks = [];
  recorder = new MediaRecorder(stream, { mimeType: recordType, videoBitsPerSecond: 16000000 });
  recorder.addEventListener('dataavailable', event => {
    if (event.data.size) chunks.push(event.data);
  });
  recorder.addEventListener('stop', () => {
    stream.getTracks().forEach(track => track.stop());
    recorder = null;
    setRecording(false);
    setPlaying(false);
    const url = URL.createObjectURL(new Blob(chunks, { type: recordType }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `iphone-duo-fold.${recordType.startsWith('video/mp4') ? 'mp4' : 'webm'}`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  });
  transition = null;
  recordElapsed = 0;
  phase = 0;
  setAngle(180);
  setPlaying(true);
  setRecording(true);
  recordButton.style.setProperty('--record-progress', '0%');
  recorder.start();
}
recordButton.addEventListener('click', () => (recorder ? recorder.stop() : startRecording()));

function resize() {
  const { width, height } = viewport.getBoundingClientRect();
  renderer.setSize(width, height);
  camera.aspect = width / height;
  const pixelsPerUnit = Math.min(width / 25, height / 17, 37);
  camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(height / pixelsPerUnit / 2 / 40));
  camera.updateProjectionMatrix();
  drawBackground();
}
new ResizeObserver(resize).observe(viewport);
const dock = document.querySelector('.control-dock');
new ResizeObserver(() => document.documentElement.style.setProperty('--dock-height', `${dock.offsetHeight}px`)).observe(dock);

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
try {
  const model = await new USDLoader().loadAsync('./assets/iPhone_Duo_Render.usdc');
  model.scale.multiplyScalar(100);
  model.updateMatrixWorld(true);
  const count = { moving: 0, fixed: 0, flexible: 0 };
  model.traverse(object => {
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
  console.info('Official model ready', JSON.stringify({ ...count, sourceMeshes: phone.children.length, innerUI: true, outerUI: true, fixedHalf: 'rear camera' }));
  applyScreens();
  document.querySelectorAll('button, input').forEach(element => element.disabled = false);
  if (!canRecord) {
    recordButton.disabled = true;
    recordButton.title = 'This browser cannot record video';
  }
  ready = true;
  setAngle(180);
} catch (error) {
  alert('Unable to load the model. Refresh the page to try again.');
  console.error(error);
}
let lastTime = performance.now();
renderer.setAnimationLoop(now => {
  const delta = Math.min((now - lastTime) / 1000, .05);
  lastTime = now;
  if (ready && playing) {
    phase = (phase + delta) % 8.6;
    let value;
    if (phase < 1.2) value = 180;
    else if (phase < 4.3) value = 90 * (1 + Math.cos((phase - 1.2) / 3.1 * Math.PI));
    else if (phase < 5.5) value = 0;
    else value = 90 * (1 - Math.cos((phase - 5.5) / 3.1 * Math.PI));
    setAngle(value);
  } else if (transition) {
    transition.elapsed += delta;
    const progress = Math.min(transition.elapsed / 1.4, 1);
    const ease = progress * progress * (3 - 2 * progress);
    setAngle(THREE.MathUtils.lerp(transition.from, transition.to, ease));
    if (progress === 1) transition = null;
  }
  if (recorder) {
    recordElapsed += delta;
    recordButton.style.setProperty('--record-progress', `${Math.min(recordElapsed / FOLD_CYCLE, 1) * 100}%`);
    if (recordElapsed >= FOLD_CYCLE) recorder.stop();
  }
  controls.update();
  renderer.render(scene, camera);
});
