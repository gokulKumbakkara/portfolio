// =============================================================
// scene.js — three.js wireframe terminal world + css3d panels
// =============================================================

import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

// ---- waypoints: where the camera lives for each section ------
// (cameraPos, look-at target, panel position, panel rotation)
export const WAYPOINTS = [
  { // 0 HERO
    id: 'hero', label: 'INTRO',
    cam: [0, 60, 720],
    target: [0, 30, 0],
    panel: { pos: [0, 30, 0], rot: [0, 0, 0] },
  },
  { // 1 ABOUT
    id: 'about', label: 'ABOUT',
    cam: [-560, 80, -120],
    target: [-560, 20, -640],
    panel: { pos: [-560, 20, -640], rot: [0, 0, 0] },
  },
  { // 2 EXPERIENCE
    id: 'experience', label: 'EXP',
    cam: [620, 100, -900],
    target: [620, 30, -1480],
    panel: { pos: [620, 30, -1480], rot: [0, 0, 0] },
  },
  { // 3 SKILLS
    id: 'skills', label: 'SKILLS',
    cam: [-520, 80, -1820],
    target: [-520, 20, -2420],
    panel: { pos: [-520, 20, -2420], rot: [0, 0, 0] },
  },
  { // 4 PROJECTS
    id: 'projects', label: 'PROJECTS',
    cam: [480, 120, -2760],
    target: [480, 20, -3380],
    panel: { pos: [480, 20, -3380], rot: [0, 0, 0] },
  },
  { // 5 NEXUS
    id: 'nexus', label: 'NEXUS',
    cam: [-440, 70, -3700],
    target: [-440, 30, -4320],
    panel: { pos: [-440, 30, -4320], rot: [0, 0, 0] },
  },
  { // 6 CONTACT
    id: 'contact', label: 'CONTACT',
    cam: [0, 60, -4600],
    target: [0, 30, -5240],
    panel: { pos: [0, 30, -5240], rot: [0, 0, 0] },
  },
];

const ACID = 0xc5fb3a;
const WHITE = 0xe8e6e0;
const DIM = 0x222220;

export function buildScene(bgCanvas, css3dHost) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 600, 3000);

  const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 1, 8000);
  camera.position.set(0, 60, 720);

  const renderer = new THREE.WebGLRenderer({ canvas: bgCanvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 1);

  const cssRenderer = new CSS3DRenderer({ element: css3dHost });
  cssRenderer.setSize(window.innerWidth, window.innerHeight);

  // ---------- grid floor ----------
  const grid = new THREE.GridHelper(12000, 80, ACID, 0x0a0a08);
  grid.position.y = -120;
  grid.material.opacity = 0.32;
  grid.material.transparent = true;
  scene.add(grid);

  const grid2 = new THREE.GridHelper(12000, 800, 0x111110, 0x111110);
  grid2.position.y = -119.5;
  grid2.material.opacity = 0.18;
  grid2.material.transparent = true;
  scene.add(grid2);

  // ---------- ceiling grid (light) ----------
  const ceil = new THREE.GridHelper(12000, 60, 0x151513, 0x080807);
  ceil.position.y = 600;
  ceil.material.opacity = 0.18;
  ceil.material.transparent = true;
  scene.add(ceil);

  // ---------- particles / stars ----------
  const pCount = 2200;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    pPos[i*3]   = (Math.random() - 0.5) * 4000;
    pPos[i*3+1] = (Math.random() - 0.4) * 1200;
    pPos[i*3+2] = -Math.random() * 6000;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0xb0b0a8, size: 1.4, sizeAttenuation: true, transparent: true, opacity: 0.55 });
  const points = new THREE.Points(pGeo, pMat);
  scene.add(points);

  // ---------- glow particles (acid) ----------
  const gCount = 220;
  const gGeo = new THREE.BufferGeometry();
  const gPos = new Float32Array(gCount * 3);
  for (let i = 0; i < gCount; i++) {
    gPos[i*3]   = (Math.random() - 0.5) * 3000;
    gPos[i*3+1] = Math.random() * 400 - 100;
    gPos[i*3+2] = -Math.random() * 5500;
  }
  gGeo.setAttribute('position', new THREE.BufferAttribute(gPos, 3));
  const gMat = new THREE.PointsMaterial({ color: ACID, size: 3, sizeAttenuation: true, transparent: true, opacity: 0.6 });
  const glow = new THREE.Points(gGeo, gMat);
  scene.add(glow);

  // ---------- floating wireframe geometry (brutalist props) ----------
  const props = [];
  const makeWire = (geo, color, opacity = 0.5) =>
    new THREE.LineSegments(new THREE.EdgesGeometry(geo, 1), new THREE.LineBasicMaterial({ color, transparent: true, opacity }));

  // hero icosahedron
  const hero = makeWire(new THREE.IcosahedronGeometry(120, 1), ACID, 0.85);
  hero.position.set(420, 80, -180);
  scene.add(hero); props.push({ mesh: hero, spin: [0, 0.003, 0.0015] });

  const hero2 = makeWire(new THREE.OctahedronGeometry(60, 0), WHITE, 0.5);
  hero2.position.set(-380, 140, -260);
  scene.add(hero2); props.push({ mesh: hero2, spin: [0.005, 0.002, 0] });

  // about cube cluster
  for (let i = 0; i < 5; i++) {
    const c = makeWire(new THREE.BoxGeometry(40 + Math.random()*40, 40 + Math.random()*40, 40 + Math.random()*40), WHITE, 0.35);
    c.position.set(-820 + (Math.random()-0.5)*220, Math.random()*180 - 40, -500 - i*120);
    scene.add(c); props.push({ mesh: c, spin: [0.002, 0.001, 0] });
  }

  // experience tall columns
  for (let i = 0; i < 4; i++) {
    const col = makeWire(new THREE.CylinderGeometry(20, 20, 320, 8, 1, true), ACID, 0.35);
    col.position.set(820 + i*40, 40, -1320 - i*200);
    scene.add(col); props.push({ mesh: col, spin: [0, 0.001, 0] });
  }

  // skills lattice — grid of small cubes
  for (let x = 0; x < 6; x++) {
    for (let z = 0; z < 6; z++) {
      const c = makeWire(new THREE.BoxGeometry(20, 20, 20), x === z ? ACID : WHITE, 0.4);
      c.position.set(-820 - x*55, Math.sin(x+z) * 40 + 20, -2280 - z*55);
      scene.add(c); props.push({ mesh: c, spin: [0.003, 0.003, 0.003] });
    }
  }

  // projects floating planks
  for (let i = 0; i < 6; i++) {
    const p = makeWire(new THREE.BoxGeometry(180, 8, 120), WHITE, 0.35);
    p.position.set(740 + (Math.random()-0.5)*180, Math.random()*240 - 60, -3200 - i*130);
    p.rotation.set(Math.random()*0.4, Math.random()*Math.PI, Math.random()*0.3);
    scene.add(p); props.push({ mesh: p, spin: [0.001, 0.001, 0.0005] });
  }

  // nexus torus knots
  const tk1 = makeWire(new THREE.TorusKnotGeometry(80, 18, 80, 12), ACID, 0.8);
  tk1.position.set(-740, 120, -4060);
  scene.add(tk1); props.push({ mesh: tk1, spin: [0.004, 0.005, 0] });
  const tk2 = makeWire(new THREE.TorusGeometry(60, 4, 8, 32), WHITE, 0.5);
  tk2.position.set(-180, 60, -4200);
  scene.add(tk2); props.push({ mesh: tk2, spin: [0.002, 0.003, 0.001] });

  // contact dodecahedron
  const dod = makeWire(new THREE.DodecahedronGeometry(140, 0), ACID, 0.7);
  dod.position.set(-360, 100, -4900);
  scene.add(dod); props.push({ mesh: dod, spin: [0.001, 0.002, 0] });

  // ---------- vertical light bars along the path (atmosphere) ----------
  for (let z = -200; z > -5400; z -= 380) {
    const side = z % 800 < -400 ? -1 : 1;
    const bar = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 380),
      new THREE.MeshBasicMaterial({ color: ACID, transparent: true, opacity: 0.18 })
    );
    bar.position.set(side * (1100 + Math.random()*120), 80, z);
    scene.add(bar);
  }

  // ---------- horizon scan line ----------
  const horizGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-5000, -119, -3000),
    new THREE.Vector3(5000, -119, -3000),
  ]);
  const horiz = new THREE.Line(horizGeo, new THREE.LineBasicMaterial({ color: ACID, transparent: true, opacity: 0.6 }));
  scene.add(horiz);

  return { scene, camera, renderer, cssRenderer, props, points, glow };
}

// add a CSS3DObject from an HTMLElement at a given position
export function addPanel(scene, el, pos, rot = [0, 0, 0], scale = 1) {
  const obj = new CSS3DObject(el);
  obj.position.set(pos[0], pos[1], pos[2]);
  obj.rotation.set(rot[0], rot[1], rot[2]);
  obj.scale.set(scale, scale, scale);
  scene.add(obj);
  return obj;
}
