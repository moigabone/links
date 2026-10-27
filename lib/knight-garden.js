import * as THREE from 'three';

export function mount(el) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let seed = 11;
  const R = () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const n2 = (x, z) => Math.sin(x * .31 + z * .17) * Math.sin(z * .23 - x * .11) * .6 + Math.sin(x * 1.1 + 2) * Math.sin(z * .9) * .25 + Math.sin(x * 2.7 - z * 2.3) * .1;
  const rx = z => 0.8 + Math.sin(z * 0.12 + 0.3) * 1.6 + Math.sin(z * 0.04) * 2.5;
  const STEPS = [[4, .8], [-6, 1.0], [-20, 1.2]];
  const base = (z, wd) => { let h = 0; for (const [z0, s] of STEPS) h += ss(z0 + wd, z0 - wd, z) * s; if (z < -40) h += (-z - 40) * 0.06; return h; };
  const H = (x, z) => { const d = Math.abs(x - rx(z)); const c = ss(2.5, 1.5, d); const side = Math.max(0, Math.abs(x) - 10) * 0.18; return base(z, .5) + n2(x, z) * .35 * (1 - c) - c * .9 + side; };
  const WY = z => base(z, .2) - .35;
  const dRiver = (x, z) => Math.abs(x - rx(z));
  const KX = -3.6, KZ = 3, RX = -6.0, RZ = 3;
  const nearKnight = (x, z) => Math.hypot(x - KX - .8, z - KZ) < 1.6 || Math.hypot(x - RX, z - RZ) < 2.2;

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  Object.assign(renderer.domElement.style, { display: 'block', width: '100%', height: '100%' });
  el.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x7b74ea, 30, 260);
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 900);
  const disposables = [];
  const keep = o => (disposables.push(o), o);

  const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.25, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return keep(new THREE.CanvasTexture(c)); })();
  const cloudTex = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 128; const g = c.getContext('2d'); for (let i = 0; i < 18; i++) { const x = 40 + Math.random() * 176, y = 50 + Math.random() * 40, r = 20 + Math.random() * 34; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 128); } return keep(new THREE.CanvasTexture(c)); })();
  const rayTex = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 256; const g = c.getContext('2d'); const v = g.createLinearGradient(0, 0, 0, 256); v.addColorStop(0, 'rgba(255,255,255,1)'); v.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = v; g.fillRect(0, 0, 64, 256); g.globalCompositeOperation = 'destination-in'; const h = g.createLinearGradient(0, 0, 64, 0); h.addColorStop(0, 'rgba(0,0,0,0)'); h.addColorStop(.5, 'rgba(0,0,0,1)'); h.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = h; g.fillRect(0, 0, 64, 256); return keep(new THREE.CanvasTexture(c)); })();
  const sprite = (color, sx, sy, op, pos, map = glowTex, fog = true) => { const s = new THREE.Sprite(keep(new THREE.SpriteMaterial({ map, color, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending, fog }))); s.scale.set(sx, sy, 1); s.position.copy(pos); scene.add(s); return s; };

  // Sky
  const sunDir = new THREE.Vector3(-0.35, 0.55, -0.75).normalize();
  const skyMat = keep(new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color('#0a1696') }, mid: { value: new THREE.Color('#2a46ee') }, hor: { value: new THREE.Color('#bdaeff') }, sun: { value: sunDir } },
    vertexShader: 'varying vec3 vD;void main(){vD=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: 'uniform vec3 top,mid,hor,sun;varying vec3 vD;void main(){float h=vD.y;vec3 c=mix(hor,mid,smoothstep(0.,.22,h));c=mix(c,top,smoothstep(.22,.85,h));float s=max(dot(vD,sun),0.);c+=vec3(1.,.92,1.)*pow(s,30.)*.9+vec3(.75,.65,1.)*pow(s,5.)*.35;gl_FragColor=vec4(c,1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'
  }));
  const sky = new THREE.Mesh(keep(new THREE.SphereGeometry(600, 32, 16)), skyMat);
  scene.add(sky);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene(); envScene.add(new THREE.Mesh(sky.geometry, skyMat));
  const envRT = pmrem.fromScene(envScene, 0.04); scene.environment = envRT.texture; pmrem.dispose();

  scene.add(new THREE.HemisphereLight(0xa3a8ff, 0x1d4a22, 1.15));
  const moon = new THREE.DirectionalLight(0xe2d6ff, 2.0); moon.position.set(-25, 35, -30); scene.add(moon);
  const fill = new THREE.DirectionalLight(0x6d7cff, 0.6); fill.position.set(6, 8, 12); scene.add(fill);

  // Ground
  const gGeo = keep(new THREE.PlaneGeometry(100, 160, 220, 320)); gGeo.rotateX(-Math.PI / 2); gGeo.translate(0, 0, -58);
  { const p = gGeo.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color(), a = new THREE.Color('#1c5a26'), b = new THREE.Color('#3fa043'), m = new THREE.Color('#2a7a5c');
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, H(x, z)); const t = n2(x * 1.7, z * 1.7) * .5 + .5; c.copy(a).lerp(b, t); if (dRiver(x, z) < 3) c.lerp(m, .35); c.toArray(col, i * 3); }
    gGeo.setAttribute('color', new THREE.BufferAttribute(col, 3)); gGeo.computeVertexNormals(); }
  scene.add(new THREE.Mesh(gGeo, keep(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .95, envMapIntensity: .3 }))));

  // River ribbon
  const wMat = keep(new THREE.ShaderMaterial({
    fog: true,
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uTime: { value: 0 }, uDeep: { value: new THREE.Color('#1a26d8') }, uLight: { value: new THREE.Color('#6f86ff') }, uFoam: { value: new THREE.Color('#eef0ff') } }]),
    vertexShader: 'attribute float fall;varying vec2 vUv;varying float vFall;\n#include <fog_pars_vertex>\nvoid main(){vUv=uv;vFall=fall;vec4 mvPosition=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mvPosition;\n#include <fog_vertex>\n}',
    fragmentShader: 'uniform float uTime;uniform vec3 uDeep,uLight,uFoam;varying vec2 vUv;varying float vFall;\n#include <fog_pars_fragment>\nvoid main(){float n=sin(vUv.y*1.3+uTime*1.4+sin(vUv.x*9.+vUv.y*.7)*1.5)*.5+.5;float st=smoothstep(.82,1.,sin(vUv.y*3.2+uTime*2.6+vUv.x*18.+sin(vUv.y*.9)*3.));float e=smoothstep(.2,.5,abs(vUv.x-.5));vec3 c=mix(uDeep,uLight,n*.45+e*.5)+uFoam*st*.45;float fs=smoothstep(.35,1.,sin(vUv.x*70.+sin(vUv.x*13.)*4.)*.5+.5)*(.65+.35*sin(vUv.y*24.+uTime*14.));c=mix(c,uFoam*(.75+.45*fs),clamp(vFall,0.,1.));gl_FragColor=vec4(c,1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n#include <fog_fragment>\n}'
  }));
  { const W = 2.4, pos = [], uv = [], fall = [], idx = []; let dist = 0, prev = null, row = 0;
    for (let z = 16; z >= -110; z -= 0.08) { const x = rx(z), y = WY(z); if (prev) dist += Math.hypot(x - prev[0], z - prev[1]); prev = [x, z];
      const sl = (WY(z - 0.06) - WY(z + 0.06)) / 0.12, f = Math.min(1, Math.max(0, (sl - .3) / 1.2));
      pos.push(x - W, y, z, x + W, y, z); uv.push(0, dist, 1, dist); fall.push(f, f);
      if (row) { const i = row * 2; idx.push(i - 2, i - 1, i, i - 1, i + 1, i); } row++; }
    const g = keep(new THREE.BufferGeometry()); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setAttribute('fall', new THREE.Float32BufferAttribute(fall, 1)); g.setIndex(idx);
    scene.add(new THREE.Mesh(g, wMat)); }
  for (const [z0] of STEPS) { const p = new THREE.Vector3(rx(z0 + .5), WY(z0 + .5) + .15, z0 + .5); sprite(0xf2f0ff, 4.2, 1.1, .55, p); sprite(0xa8a0ff, 7, 2.6, .25, p.clone().add(new THREE.Vector3(0, .5, 0))); }

  const dummy = new THREE.Object3D(), col = new THREE.Color();

  // Grass
  { const N = 16000, g = keep(new THREE.ConeGeometry(0.035, 0.5, 3)); g.translate(0, .25, 0);
    const m = new THREE.InstancedMesh(g, keep(new THREE.MeshStandardMaterial({ roughness: .8, envMapIntensity: .4 })), N); let k = 0;
    while (k < N) { const z = 13 - Math.pow(R(), 1.5) * 45, x = (R() * 2 - 1) * (9 + (13 - z) * .25); if (dRiver(x, z) < 2.35 || nearKnight(x, z)) continue;
      dummy.position.set(x, H(x, z) - .02, z); dummy.rotation.set((R() - .5) * .6, R() * 6.3, (R() - .5) * .6); const s = .6 + R() * .9; dummy.scale.set(1, s, 1); dummy.updateMatrix(); m.setMatrixAt(k, dummy.matrix);
      m.setColorAt(k, col.setHSL(.3 + R() * .06, .6, .22 + R() * .16)); k++; }
    scene.add(m); }

  // Flowers
  const flowers = [];
  const PAL = [['#ffffff', 4], ['#ff5ccf', 3], ['#e31cb4', 2], ['#b483ff', 2], ['#ffe27a', .5]];
  const pick = () => { let r = R() * PAL.reduce((a, p) => a + p[1], 0); for (const p of PAL) { if ((r -= p[1]) < 0) return p[0]; } return PAL[0][0]; };
  for (let c = 0; c < 90; c++) { const cz = 13 - Math.pow(R(), 1.3) * 42, cx = (R() * 2 - 1) * (8 + (13 - cz) * .25), hue = pick(), n = 30 + R() * 50 | 0, sp = .5 + R() * .9;
    for (let i = 0; i < n; i++) { const x = cx + (R() + R() - 1) * sp * 1.6, z = cz + (R() + R() - 1) * sp * 1.6; if (dRiver(x, z) < 2.4 || nearKnight(x, z)) continue; flowers.push([x, H(x, z) + .3 + R() * .14, z, R() < .75 ? hue : pick(), .7 + R() * .7]); } }

  // Trees
  const barkMat = keep(new THREE.MeshStandardMaterial({ color: '#43557d', roughness: .85, envMapIntensity: .6 }));
  const leafMat = keep(new THREE.MeshStandardMaterial({ color: '#1f5c31', roughness: .9, flatShading: true }));
  const leafMat2 = keep(new THREE.MeshStandardMaterial({ color: '#2b7a3c', roughness: .9, flatShading: true }));
  const tree = (x, z, s) => { const g = new THREE.Group(), y0 = H(x, z);
    const tg = keep(new THREE.CylinderGeometry(.75 * s, 1.6 * s, 17 * s, 16, 24)); const p = tg.attributes.position;
    for (let i = 0; i < p.count; i++) { const vx = p.getX(i), vy = p.getY(i), vz = p.getZ(i), a = Math.atan2(vz, vx), k = 1 + .16 * Math.sin(a * 3 + vy * .8) + .1 * Math.sin(a * 7 - vy * 1.7); p.setXYZ(i, vx * k + Math.sin(vy * .18) * .7 * s, vy, vz * k); }
    tg.translate(0, 8.5 * s, 0); tg.computeVertexNormals(); g.add(new THREE.Mesh(tg, barkMat));
    const ico = keep(new THREE.IcosahedronGeometry(1, 1));
    for (let i = 0; i < 11; i++) { const m = new THREE.Mesh(ico, i % 3 ? leafMat : leafMat2), a = R() * 6.28, rr = R() * 5 * s, sc = (2.6 + R() * 2.6) * s; m.position.set(Math.cos(a) * rr + .6 * s, (15.5 + R() * 4) * s, Math.sin(a) * rr); m.scale.set(sc, sc * .7, sc); m.rotation.set(R(), R(), R()); g.add(m); }
    for (let i = 0; i < 70; i++) { const a = R() * 6.28, yy = R() * 12 * s, rr = (1.5 - yy / (17 * s) * .7) * s * 1.05; flowers.push([x + Math.cos(a) * rr + Math.sin(yy / s * .18) * .7 * s, y0 + yy, z + Math.sin(a) * rr, R() < .6 ? '#ff4fc8' : '#e31cb4', 1.3]); }
    g.position.set(x, y0 - .3, z); scene.add(g); };
  tree(6.2, -12, 1); tree(-6.4, -3, 1.1); tree(-14, -24, .9); tree(15, -28, 1); tree(-21, -9, 1.2); tree(21, -6, 1.1); tree(-9, -40, 1); tree(10, -45, .9);

  // Pines + mountains
  { const N = 170, g = keep(new THREE.ConeGeometry(1, 1, 7)); g.translate(0, .5, 0);
    const m = new THREE.InstancedMesh(g, keep(new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: .9, flatShading: true })), N * 3); let k = 0, t = 0;
    while (t < N) { const z = -30 - R() * 70, x = (R() * 2 - 1) * 50; if (dRiver(x, z) < 4) continue; const s = 4 + R() * 6, y = H(x, z); const c = col.setHSL(.44 + R() * .05, .5, .14 + R() * .08).clone();
      for (let j = 0; j < 3; j++) { dummy.position.set(x, y + s * (.25 + j * .45), z); dummy.rotation.set(0, R() * 6, 0); dummy.scale.set(s * (.42 - j * .1), s * .9, s * (.42 - j * .1)); dummy.updateMatrix(); m.setMatrixAt(k, dummy.matrix); m.setColorAt(k, c); k++; } t++; }
    scene.add(m); }
  for (const [x, z, r, h] of [[-25, -175, 55, 70], [45, -200, 50, 55], [-75, -210, 45, 45], [90, -230, 60, 50]]) {
    const g = keep(new THREE.ConeGeometry(r, h, 10, 8)); const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const vx = p.getX(i), vy = p.getY(i), vz = p.getZ(i), k = 1 + .12 * Math.sin(vx * .2 + vy * .3) + .08 * Math.sin(vz * .35); p.setXYZ(i, vx * k, vy * (vy > h / 2 - 1 ? 1 : 1 + .05 * Math.sin(vx * .3)), vz * k); }
    g.computeVertexNormals(); const m = new THREE.Mesh(g, keep(new THREE.MeshStandardMaterial({ color: '#3d9a7e', roughness: 1, flatShading: true }))); m.position.set(x, h / 2 + H(x, z) - 4, z); scene.add(m); }
  for (let i = 0; i < 14; i++) { const s = new THREE.Sprite(keep(new THREE.SpriteMaterial({ map: cloudTex, color: '#f1ecff', transparent: true, opacity: .85, depthWrite: false, fog: false }))); s.position.set(-200 + R() * 400, 25 + R() * 80, -330 - R() * 60); const w = 70 + R() * 90; s.scale.set(w, w * .45, 1); scene.add(s); }

  // God rays
  const rays = new THREE.Group(); rays.position.set(-30, 85, -95); const rayMats = [];
  for (let i = 0; i < 9; i++) { const mat = keep(new THREE.MeshBasicMaterial({ map: rayTex, color: '#efe4ff', transparent: true, opacity: .2, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, side: THREE.DoubleSide })); rayMats.push([mat, R() * 6, .12 + R() * .14]);
    const g = keep(new THREE.PlaneGeometry(4 + R() * 9, 190)); g.translate(0, -95, 0); const m = new THREE.Mesh(g, mat); m.rotation.z = .1 + i * .07 + R() * .04; m.rotation.y = .3; rays.add(m); }
  scene.add(rays);

  // Rock
  { const g = keep(new THREE.DodecahedronGeometry(2.0, 1)); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const k = 1 + .15 * Math.sin(p.getX(i) * 3 + p.getY(i) * 2); p.setXYZ(i, p.getX(i) * k, p.getY(i) * k * 1.2, p.getZ(i) * k); } g.computeVertexNormals();
    const m = new THREE.Mesh(g, keep(new THREE.MeshStandardMaterial({ color: '#5f8a86', roughness: .9, flatShading: true }))); m.position.set(RX, H(RX, RZ) + .8, RZ); m.rotation.set(.2, .8, .1); scene.add(m); }

  // Glowing mushrooms
  { const capG = keep(new THREE.SphereGeometry(.22, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2)), stemG = keep(new THREE.CylinderGeometry(.045, .07, .4, 8));
    const capM = keep(new THREE.MeshStandardMaterial({ color: '#e4e0ff', emissive: '#a493ff', emissiveIntensity: 2.4, roughness: .4 })), stemM = keep(new THREE.MeshStandardMaterial({ color: '#f4f2ff', emissive: '#8c7cff', emissiveIntensity: 1.2 }));
    for (const [cx, cz] of [[-2.4, 4.8], [-6.6, 5.4], [-2.6, -1.5], [4.9, -1.4], [5.4, -6.5], [-4.8, -7]]) {
      for (let i = 0; i < 4; i++) { const x = cx + (R() - .5) * .9, z = cz + (R() - .5) * .9, y = H(x, z), s = .6 + R() * .8; const st = new THREE.Mesh(stemG, stemM); st.position.set(x, y + .2 * s, z); st.scale.setScalar(s); scene.add(st); const cp = new THREE.Mesh(capG, capM); cp.position.set(x, y + .38 * s, z); cp.scale.set(s, s * .65, s); scene.add(cp); }
      const y = H(cx, cz); sprite(0xa08cff, 2.6, 2.2, .55, new THREE.Vector3(cx, y + .4, cz)); const pl = new THREE.PointLight(0xa08cff, 4, 6, 2); pl.position.set(cx, y + .7, cz); scene.add(pl); } }

  // Knights
  const armor = keep(new THREE.MeshStandardMaterial({ color: '#2a3264', metalness: .9, roughness: .28 }));
  const dark = keep(new THREE.MeshStandardMaterial({ color: '#0e1128', metalness: .7, roughness: .45 }));
  const gold = keep(new THREE.MeshStandardMaterial({ color: '#c9a35a', metalness: 1, roughness: .3 }));
  const capeM = keep(new THREE.MeshStandardMaterial({ color: '#2238ff', emissive: '#1424b8', emissiveIntensity: .55, roughness: .75, side: THREE.DoubleSide }));
  const blade = keep(new THREE.MeshStandardMaterial({ color: '#c8d4ff', emissive: '#4a66ff', emissiveIntensity: 1.6, metalness: .8, roughness: .2 }));
  const plate = keep(new THREE.MeshStandardMaterial({ color: '#1a1f38', metalness: 1, roughness: .26, envMapIntensity: 1.4 }));
  const trim = keep(new THREE.MeshStandardMaterial({ color: '#4a5486', metalness: 1, roughness: .2, envMapIntensity: 1.6 }));
  const mailTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); g.fillStyle = '#20242f'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#9aa2c4'; g.lineWidth = 2; for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) { g.beginPath(); g.arc(x * 8 + (y % 2) * 4, y * 8, 4, 0, 6.3); g.stroke(); } const t = keep(new THREE.CanvasTexture(c)); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5, 5); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const mail = keep(new THREE.MeshStandardMaterial({ map: mailTex, bumpMap: mailTex, bumpScale: 2, metalness: 1, roughness: .45 }));
  const leather = keep(new THREE.MeshStandardMaterial({ color: '#2b1c17', roughness: .7 }));
  const knight = (x, z, ry, S) => {
    const V = (a, b, c) => new THREE.Vector3(a, b, c), UP = V(0, 1, 0), Z = V(0, 0, 1);
    const root = new THREE.Group();
    const put = (grp, geo, mat, pos, sc) => { const m = new THREE.Mesh(keep(geo), mat); m.position.copy(pos); if (sc) m.scale.set(...sc); grp.add(m); return m; };
    const seg = (grp, a, b, r1, r2, mat, open) => { const d = b.clone().sub(a), L = d.length(); const m = put(grp, new THREE.CylinderGeometry(r2, r1, L, 18, 1, !!open), mat, a.clone().addScaledVector(d, .5)); m.quaternion.setFromUnitVectors(UP, d.normalize()); return m; };
    const ring = (grp, c, dir, r, t, mat = trim) => { const m = put(grp, new THREE.TorusGeometry(r, t, 6, 24), mat, c); m.quaternion.setFromUnitVectors(Z, dir.clone().normalize()); return m; };
    const lerp = (a, b, t) => a.clone().lerp(b, t);
    // legs
    for (const sd of [-1, 1]) {
      const Hp = V(sd * .13, 0, 0), K = sd > 0 ? V(.17, .34, .4) : V(-.15, .03, .5), A = sd > 0 ? V(.18, -.01, .7) : V(-.16, -.01, .96), T = sd > 0 ? V(.19, -.02, .9) : V(-.17, .05, 1.14);
      seg(root, Hp, K, .115, .095, plate); ring(root, lerp(Hp, K, .35), K.clone().sub(Hp), .118, .008); ring(root, lerp(Hp, K, .7), K.clone().sub(Hp), .108, .008);
      const tas = seg(root, lerp(Hp, K, -.05), lerp(Hp, K, .45), .135, .13, plate, true); tas.material = plate; tas.geometry = keep(new THREE.CylinderGeometry(.135, .14, Hp.distanceTo(K) * .5, 18, 1, true, -Math.PI * .5, Math.PI));
      put(root, new THREE.SphereGeometry(.088, 12, 10), mail, K.clone().add(V(0, -.02, -.03)));
      put(root, new THREE.SphereGeometry(.098, 16, 12), plate, K.clone().add(V(0, .02, .02)), [1, 1, 1.15]);
      const fan = put(root, new THREE.CylinderGeometry(.1, .1, .014, 18), trim, K.clone().add(V(sd * .085, 0, -.01))); fan.rotation.z = Math.PI / 2;
      seg(root, K, A, .088, .068, plate); ring(root, lerp(K, A, .12), A.clone().sub(K), .088, .009); ring(root, lerp(K, A, .95), A.clone().sub(K), .07, .008);
      for (let j = 0; j < 4; j++) { const t = j / 3, c = lerp(A, T, t); const bx = put(root, new THREE.BoxGeometry(.13 - j * .012, .07 - j * .01, .07), j === 0 ? trim : plate, c.add(V(0, .03 - j * .005, 0))); bx.rotation.x = -.15; }
    }
    // torso (leans forward to read)
    const chest = new THREE.Group(); chest.rotation.x = -.32; root.add(chest);
    const tor = put(chest, new THREE.LatheGeometry([[.17, -.02], [.2, .08], [.23, .24], [.255, .38], [.245, .5], [.19, .58], [.1, .63]].map(([r, y]) => new THREE.Vector2(r, y)), 28), plate, V(0, 0, 0), [1, 1, .74]);
    put(chest, new THREE.BoxGeometry(.03, .42, .06), trim, V(0, .32, .175)).rotation.x = -.06;
    put(chest, new THREE.TorusGeometry(.205, .022, 8, 28), leather, V(0, .04, 0), [1, .78, 1]).rotation.x = Math.PI / 2;
    put(chest, new THREE.BoxGeometry(.07, .06, .03), trim, V(0, .04, .165));
    for (let i = 0; i < 3; i++) { const f = put(chest, new THREE.CylinderGeometry(.215 + i * .012, .225 + i * .014, .06, 28, 1, true), plate, V(0, -.03 - i * .045, 0), [1, 1, .8]); }
    for (let i = 0; i < 3; i++) put(chest, new THREE.CylinderGeometry(.13 - i * .012, .14 - i * .012, .035, 20), i ? plate : trim, V(0, .6 + i * .032, .02));
    // pauldrons + arms
    for (const sd of [-1, 1]) {
      const Sh = V(sd * .25, .53, 0);
      for (let i = 0; i < 4; i++) { const r = .19 - i * .018; const m = put(chest, new THREE.SphereGeometry(r, 22, 12, 0, Math.PI * 2, 0, Math.PI * .5), plate, Sh.clone().add(V(sd * i * .03, -i * .065, 0)), [1, .8, 1.1]); m.rotation.z = -sd * (.55 + i * .12); ring(chest, m.position.clone().add(V(0, -.003, 0)), V(Math.sin(sd * (.55 + i * .12)), Math.cos(.55 + i * .12), 0), r * .99, .007).scale.set(1, 1.1, 1); }
      const S2 = V(sd * .3, .45, 0), E = V(sd * .31, .2, .2), W = V(sd * .13, .3, .4);
      seg(chest, S2, E, .068, .062, plate);
      put(chest, new THREE.SphereGeometry(.07, 12, 10), mail, E.clone().add(V(-sd * .02, .01, .02)));
      put(chest, new THREE.SphereGeometry(.072, 14, 10), plate, E.clone().add(V(sd * .015, -.01, -.02)), [1, 1, 1.2]);
      const fan = put(chest, new THREE.CylinderGeometry(.085, .085, .012, 16), trim, E.clone().add(V(sd * .06, -.01, -.02))); fan.rotation.z = Math.PI / 2;
      seg(chest, E, W, .062, .052, plate); ring(chest, lerp(E, W, .2), W.clone().sub(E), .064, .007);
      const G = W.clone().add(W.clone().sub(E).normalize().multiplyScalar(.07));
      seg(chest, W, G, .056, .08, plate);
      const hand = put(chest, new THREE.BoxGeometry(.075, .05, .1), plate, G.clone().add(V(-sd * .005, 0, .04))); hand.lookAt(G.clone().add(W.clone().sub(E)));
      for (let f = 0; f < 3; f++) { const fg = put(chest, new THREE.BoxGeometry(.07, .025, .03), trim, G.clone().add(V(-sd * .01, .03 - f * .02, .1))); fg.rotation.y = sd * .4; }
    }
    // book
    const book = new THREE.Group(); book.position.set(0, .4, .5); book.rotation.x = -.95; chest.add(book);
    const cover = keep(new THREE.MeshStandardMaterial({ color: '#3a1d14', roughness: .6 })), pageM = keep(new THREE.MeshStandardMaterial({ color: '#efe4c4', emissive: '#d8c99a', emissiveIntensity: .35, roughness: .9 }));
    for (const sd of [-1, 1]) { const h = new THREE.Group(); h.rotation.z = sd * .28; book.add(h); put(h, new THREE.BoxGeometry(.19, .012, .26), cover, V(sd * .095, 0, 0)); put(h, new THREE.BoxGeometry(.175, .025, .245), pageM, V(sd * .09, .018, 0)); }
    // great helm, tilted down at the book
    const head = new THREE.Group(); head.position.set(0, .8, .08); head.rotation.x = .55; head.rotation.y = .08; chest.add(head);
    put(head, new THREE.LatheGeometry([[0, .2], [.05, .2], [.105, .185], [.135, .13], [.142, 0], [.138, -.12], [.128, -.17]].map(([r, y]) => new THREE.Vector2(r, y)), 28), plate, V(0, 0, 0), [.94, 1, 1.06]);
    ring(head, V(0, .07, 0), UP, .142, .01).scale.set(.94, 1.06, 1);
    ring(head, V(0, .17, 0), UP, .11, .008).scale.set(.94, 1.06, 1);
    put(head, new THREE.BoxGeometry(.022, .34, .03), trim, V(0, -.01, .148));
    const slitM = keep(new THREE.MeshBasicMaterial({ color: '#05060c' }));
    for (const sd of [-1, 1]) { const sl = put(head, new THREE.BoxGeometry(.1, .016, .04), slitM, V(sd * .062, .025, .135)); sl.rotation.y = -sd * .35; }
    for (let i = 0; i < 6; i++) { const hl = put(head, new THREE.CylinderGeometry(.007, .007, .03, 6), slitM, V(.07 + (i % 2) * .025, -.06 - Math.floor(i / 2) * .03, .12)); hl.rotation.x = Math.PI / 2; hl.rotation.z = -.5; }
    // sword on back, hilt over right shoulder
    const lo = V(-.2, -.05, -.24), hi = V(.24, .72, -.2), dir = hi.clone().sub(lo).normalize();
    seg(chest, lo, hi, .03, .035, leather); ring(chest, lerp(lo, hi, .9), dir, .036, .008); ring(chest, lerp(lo, hi, .2), dir, .033, .008);
    const gd = put(chest, new THREE.BoxGeometry(.26, .025, .03), trim, hi.clone().addScaledVector(dir, .015)); gd.quaternion.setFromUnitVectors(V(1, 0, 0), V(dir.y, -dir.x, 0).normalize());
    seg(chest, hi.clone().addScaledVector(dir, .02), hi.clone().addScaledVector(dir, .2), .016, .016, leather);
    put(chest, new THREE.SphereGeometry(.03, 10, 8), trim, hi.clone().addScaledVector(dir, .22));
    const w = new THREE.Group(); w.add(root); w.scale.setScalar(S); w.rotation.y = ry; w.position.set(x, H(x, z) + .1 * S, z); scene.add(w);
    const fwd = V(Math.sin(ry), 0, Math.cos(ry));
    const warm = new THREE.PointLight(0xff8a3a, 7, 9, 2); warm.position.set(x - fwd.x * 1.2 - 1.2, H(x, z) + 3.4, z - fwd.z * 1.2); scene.add(warm);
    const cool = new THREE.PointLight(0x8a96ff, 5, 8, 2); cool.position.set(x + fwd.x * 2.4 + .8, H(x, z) + 2.6, z + fwd.z * 2.4); scene.add(cool);
    sprite(0xffe9b0, .9 * S, .9 * S, .35, new THREE.Vector3().copy(book.getWorldPosition(new THREE.Vector3())));
  };
  knight(KX, KZ, Math.PI / 2, 1.6);

  // Flowers mesh
  { const g = keep(new THREE.IcosahedronGeometry(.075, 0)), m = new THREE.InstancedMesh(g, keep(new THREE.MeshBasicMaterial({ color: '#ffffff' })), flowers.length);
    flowers.forEach(([x, y, z, c, s], i) => { dummy.position.set(x, y, z); dummy.rotation.set(R(), R(), R()); dummy.scale.set(s, s * .7, s); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); m.setColorAt(i, col.set(c)); });
    scene.add(m); }

  // Fireflies
  const FN = 240, fBase = [], fPos = new Float32Array(FN * 3);
  for (let i = 0; i < FN; i++) { const z = 12 - R() * 40, x = (R() * 2 - 1) * (8 + (12 - z) * .2); fBase.push([x, H(x, z) + .4 + R() * 2.6, z, R() * 6.28, .3 + R() * .6]); }
  const fGeo = keep(new THREE.BufferGeometry()); fGeo.setAttribute('position', new THREE.BufferAttribute(fPos, 3));
  const fMat = keep(new THREE.PointsMaterial({ map: glowTex, color: '#ffe35c', size: .32, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(new THREE.Points(fGeo, fMat));
  const placeFlies = t => { for (let i = 0; i < FN; i++) { const [x, y, z, p, sp] = fBase[i]; fPos[i * 3] = x + Math.sin(t * sp + p) * .6; fPos[i * 3 + 1] = y + Math.sin(t * sp * 1.3 + p * 2) * .35; fPos[i * 3 + 2] = z + Math.cos(t * sp * .8 + p) * .6; } fGeo.attributes.position.needsUpdate = true; };

  // Camera + loop
  const camBase = new THREE.Vector3(0.5, 2.7, 11.5), look = new THREE.Vector3(0.2, 2.1, -18);
  let px = 0, py = 0, tx = 0, ty = 0;
  const onMove = e => { tx = e.clientX / innerWidth * 2 - 1; ty = e.clientY / innerHeight * 2 - 1; };
  addEventListener('pointermove', onMove, { passive: true });
  const resize = () => { const w = el.clientWidth || 1, h = el.clientHeight || 1, a = w / h; renderer.setSize(w, h, false); camera.aspect = a; camera.fov = a < .8 ? 64 : a < 1.3 ? 56 : 46; if (a < .8) { camBase.set(-3.6, 2.7, 11.5); look.set(-3.4, 4.5, -18); } else { camBase.set(0.5, 2.7, 11.5); look.set(0.2, 2.1, -18); } camera.updateProjectionMatrix(); };
  const ro = new ResizeObserver(resize); ro.observe(el); resize();
  let raf = 0, t = 0, last = performance.now();
  const frame = now => { raf = requestAnimationFrame(frame); if (document.hidden) { last = now; return; }
    t += Math.min(.05, (now - last) / 1000); last = now;
    px += (tx - px) * .04; py += (ty - py) * .04;
    camera.position.set(camBase.x + px * .6 + Math.sin(t * .12) * .25, camBase.y - py * .3 + Math.sin(t * .17) * .08, camBase.z);
    camera.lookAt(look);
    wMat.uniforms.uTime.value = t; placeFlies(t);
    for (const [m, ph, b] of rayMats) m.opacity = b + Math.sin(t * .35 + ph) * .06;
    renderer.render(scene, camera); };
  if (reduce) { placeFlies(0); camera.position.copy(camBase); camera.lookAt(look); renderer.render(scene, camera); } else raf = requestAnimationFrame(frame);

  return () => { cancelAnimationFrame(raf); ro.disconnect(); removeEventListener('pointermove', onMove); scene.traverse(o => { if (o.isInstancedMesh) o.dispose(); }); disposables.forEach(d => d.dispose && d.dispose()); envRT.dispose(); renderer.dispose(); renderer.domElement.remove(); };
}
