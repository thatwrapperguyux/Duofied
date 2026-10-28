// A stand-in foldable built from primitives, used when the optional reference
// model is not present. Geometry is authored in the same coordinates the loader
// produces, so the fold, projection and screen shaders drive it unchanged.
import * as THREE from 'three';

const HINGE_GAP = .06;
const BODY_HALF_WIDTH = 8.15;
const BODY_HALF_HEIGHT = 5.85;
const BACK_Z = -.27463;
const FRONT_Z = .24948;
// The shell stops just short of both display planes so neither z-fights with it.
const SHELL_INSET = .015;

// The loader's result is scaled by 100 and lifted, so author the inverse here.
const TO_LOCAL = new THREE.Matrix4().makeScale(.01, .01, .01)
  .multiply(new THREE.Matrix4().makeTranslation(0, 5.8974, 0));

function roundedShape(left, right, bottom, top, radius) {
  const shape = new THREE.Shape();
  shape.moveTo(left + radius, bottom);
  shape.lineTo(right - radius, bottom);
  shape.quadraticCurveTo(right, bottom, right, bottom + radius);
  shape.lineTo(right, top - radius);
  shape.quadraticCurveTo(right, top, right - radius, top);
  shape.lineTo(left + radius, top);
  shape.quadraticCurveTo(left, top, left, top - radius);
  shape.lineTo(left, bottom + radius);
  shape.quadraticCurveTo(left, bottom, left + radius, bottom);
  return shape;
}

function halfBody(name, left, right, material) {
  const bevel = .05;
  const back = BACK_Z + SHELL_INSET, front = FRONT_Z - SHELL_INSET;
  const geometry = new THREE.ExtrudeGeometry(
    roundedShape(left, right, -BODY_HALF_HEIGHT, BODY_HALF_HEIGHT, .85),
    { depth: (front - back) - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 10 });
  geometry.translate(0, 0, back + bevel);
  geometry.applyMatrix4(TO_LOCAL);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  return mesh;
}

function screenPlane(name, [x, y, width, height], z, faceBack, segments) {
  const geometry = new THREE.PlaneGeometry(width, height, segments, 1);
  if (faceBack) geometry.rotateY(Math.PI);
  geometry.translate(x + width / 2, y + height / 2, z);
  geometry.applyMatrix4(TO_LOCAL);
  const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
  mesh.name = name;
  return mesh;
}

function cameraBump(material) {
  const group = new THREE.Group();
  const plate = new THREE.Mesh(
    new THREE.ExtrudeGeometry(roundedShape(1.1, 4.3, 2.3, 5.2, .7),
      { depth: .12, bevelEnabled: true, bevelThickness: .04, bevelSize: .04, bevelSegments: 2, curveSegments: 8 }),
    material);
  plate.geometry.translate(0, 0, BACK_Z - .1);
  plate.geometry.applyMatrix4(TO_LOCAL);
  group.add(plate);
  const glass = new THREE.MeshStandardMaterial({ color: 0x15171c, metalness: .35, roughness: .12 });
  for (const [cx, cy] of [[2.05, 4.25], [3.35, 4.25], [2.7, 3.1]]) {
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(.52, .52, .18, 28), glass);
    lens.geometry.rotateX(Math.PI / 2);
    lens.geometry.translate(cx, cy, BACK_Z - .16);
    lens.geometry.applyMatrix4(TO_LOCAL);
    group.add(lens);
  }
  return group;
}

export function createFallbackDevice() {
  const root = new THREE.Group();
  const shell = new THREE.MeshStandardMaterial({ color: 0xe9eaee, metalness: .85, roughness: .3 });
  const cover = new THREE.Group();
  cover.name = 'upTUAKvMVkPOMKq';
  const fixed = new THREE.Group();
  fixed.name = 'SiftyleUEEZwLhF';
  root.add(cover, fixed);

  cover.add(halfBody('coverShell', -BODY_HALF_WIDTH, -HINGE_GAP, shell));
  fixed.add(halfBody('cameraShell', HINGE_GAP, BODY_HALF_WIDTH, shell));
  fixed.add(cameraBump(new THREE.MeshStandardMaterial({ color: 0xdfe0e5, metalness: .8, roughness: .35 })));

  // The inner display spans the hinge and flexes; the cover display rides the moving half.
  fixed.add(screenPlane('UXtsBZYlaUvHoEh', [-7.89935, .34562 - 5.8974, 15.7987, 11.1035], FRONT_Z, false, 220));
  cover.add(screenPlane('hhgAIoCGsHXeDPY', [-7.97332, .27173 - 5.8974, 7.73936, 11.2513], BACK_Z, true, 1));
  return root;
}
